#!/usr/bin/env node
/**
 * Fetch GO terms from UniProt for all proteins in the database
 * Stores results in a JSON file for further analysis
 */

import pg from 'pg';
import fetch from 'node-fetch';
import fs from 'fs';

const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

// Delay function to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch GO terms from UniProt API
 */
async function fetchGOTermsFromUniProt(uniprotId) {
  try {
    // UniProt REST API endpoint
    const url = `https://rest.uniprot.org/uniprotkb/${uniprotId}.json`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${uniprotId}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Extract GO terms
    const goTerms = {
      biological_process: [],
      cellular_component: [],
      molecular_function: []
    };

    if (data.uniProtKBCrossReferences) {
      const goRefs = data.uniProtKBCrossReferences.filter(ref => ref.database === 'GO');

      for (const ref of goRefs) {
        const goId = ref.id;
        const goTerm = ref.properties?.find(p => p.key === 'GoTerm')?.value || '';
        const aspect = ref.properties?.find(p => p.key === 'GoEvidenceType')?.value || '';

        // Parse GO term (format: "P:biological process", "C:cellular component", "F:molecular function")
        const match = goTerm.match(/^([PCF]):(.*)/);
        if (match) {
          const category = match[1];
          const term = match[2];

          const goEntry = { id: goId, term: term };

          if (category === 'P') {
            goTerms.biological_process.push(goEntry);
          } else if (category === 'C') {
            goTerms.cellular_component.push(goEntry);
          } else if (category === 'F') {
            goTerms.molecular_function.push(goEntry);
          }
        }
      }
    }

    // Extract protein names
    const proteinName = data.proteinDescription?.recommendedName?.fullName?.value || '';
    const geneName = data.genes?.[0]?.geneName?.value || '';

    return {
      uniprot_id: uniprotId,
      gene_name: geneName,
      protein_name: proteinName,
      go_terms: goTerms
    };

  } catch (error) {
    console.error(`Error fetching ${uniprotId}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Fetching all unique proteins from database...');

  // Get all unique proteins (both bait and prey)
  const result = await pool.query(`
    SELECT DISTINCT p.uniprot_id, p.gene_name, p.organism
    FROM proteins p
    WHERE p.organism = 'Homo sapiens'
    ORDER BY p.uniprot_id
  `);

  const proteins = result.rows;
  console.log(`Found ${proteins.length} unique human proteins`);

  const proteinData = [];
  const errors = [];

  // Fetch GO terms for each protein
  for (let i = 0; i < proteins.length; i++) {
    const protein = proteins[i];
    console.log(`[${i+1}/${proteins.length}] Fetching GO terms for ${protein.uniprot_id} (${protein.gene_name})...`);

    const goData = await fetchGOTermsFromUniProt(protein.uniprot_id);

    if (goData) {
      proteinData.push(goData);
    } else {
      errors.push(protein.uniprot_id);
    }

    // Rate limiting: wait 200ms between requests
    await delay(200);
  }

  // Save results
  const outputFile = 'data/protein_go_terms.json';
  fs.writeFileSync(outputFile, JSON.stringify(proteinData, null, 2));
  console.log(`\nSaved GO terms for ${proteinData.length} proteins to ${outputFile}`);

  if (errors.length > 0) {
    console.log(`\nFailed to fetch ${errors.length} proteins:`);
    console.log(errors.join(', '));
  }

  await pool.end();
}

main().catch(console.error);
