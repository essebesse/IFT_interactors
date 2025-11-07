#!/usr/bin/env node
/**
 * Protein ID Mapping Utility
 *
 * Maps gene names, protein names, and UniProt IDs between different formats.
 * Uses local database first, then UniProt API as fallback.
 * Caches results to avoid repeated API calls.
 */

import { sql } from '@vercel/postgres';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CACHE_FILE = './experimental_data/mapping/uniprot_cache.json';
const FAILED_FILE = './experimental_data/mapping/failed_mappings.json';

// Initialize caches
let uniprotCache = {};
let failedMappings = {};

if (existsSync(CACHE_FILE)) {
  uniprotCache = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
}
if (existsSync(FAILED_FILE)) {
  failedMappings = JSON.parse(readFileSync(FAILED_FILE, 'utf-8'));
}

/**
 * Map a gene/protein name to UniProt ID
 * @param {string} identifier - Gene name (e.g., "BBS7") or UniProt ID (e.g., "Q8IWZ6")
 * @param {string} organism - Organism name (default: "Homo sapiens")
 * @returns {Promise<string|null>} - UniProt ID or null if not found
 */
export async function mapToUniProt(identifier, organism = 'Homo sapiens') {
  identifier = identifier.trim().toUpperCase();

  // Check cache first
  const cacheKey = `${identifier}_${organism}`;
  if (uniprotCache[cacheKey]) {
    console.log(`  ✓ Cache hit: ${identifier} → ${uniprotCache[cacheKey]}`);
    return uniprotCache[cacheKey];
  }

  // Check failed mappings
  if (failedMappings[cacheKey]) {
    console.log(`  ⚠ Previously failed: ${identifier}`);
    return null;
  }

  // Step 1: Check if it's already a valid UniProt ID in our database
  try {
    const result = await sql`
      SELECT uniprot_id
      FROM proteins
      WHERE uniprot_id = ${identifier}
        AND organism = ${organism}
      LIMIT 1
    `;

    if (result.rows.length > 0) {
      const uniprot = result.rows[0].uniprot_id;
      uniprotCache[cacheKey] = uniprot;
      saveCache();
      console.log(`  ✓ Found in database (UniProt): ${identifier} → ${uniprot}`);
      return uniprot;
    }
  } catch (error) {
    console.error(`  ❌ Database error checking UniProt ID: ${error.message}`);
  }

  // Step 2: Check by gene name
  try {
    const result = await sql`
      SELECT uniprot_id
      FROM proteins
      WHERE UPPER(gene_name) = ${identifier}
        AND organism = ${organism}
      LIMIT 1
    `;

    if (result.rows.length > 0) {
      const uniprot = result.rows[0].uniprot_id;
      uniprotCache[cacheKey] = uniprot;
      saveCache();
      console.log(`  ✓ Found in database (gene name): ${identifier} → ${uniprot}`);
      return uniprot;
    }
  } catch (error) {
    console.error(`  ❌ Database error checking gene name: ${error.message}`);
  }

  // Step 3: Check protein aliases
  try {
    const result = await sql`
      SELECT p.uniprot_id
      FROM proteins p
      JOIN protein_aliases pa ON p.id = pa.protein_id
      WHERE UPPER(pa.alias_name) = ${identifier}
        AND p.organism = ${organism}
      LIMIT 1
    `;

    if (result.rows.length > 0) {
      const uniprot = result.rows[0].uniprot_id;
      uniprotCache[cacheKey] = uniprot;
      saveCache();
      console.log(`  ✓ Found in database (alias): ${identifier} → ${uniprot}`);
      return uniprot;
    }
  } catch (error) {
    console.error(`  ❌ Database error checking aliases: ${error.message}`);
  }

  // Step 4: Query UniProt API
  console.log(`  🌐 Querying UniProt API for: ${identifier}...`);
  try {
    const uniprot = await queryUniProtAPI(identifier, organism);
    if (uniprot) {
      uniprotCache[cacheKey] = uniprot;
      saveCache();
      console.log(`  ✓ Found via UniProt API: ${identifier} → ${uniprot}`);
      return uniprot;
    }
  } catch (error) {
    console.error(`  ❌ UniProt API error: ${error.message}`);
  }

  // Not found - add to failed mappings
  failedMappings[cacheKey] = {
    identifier,
    organism,
    timestamp: new Date().toISOString(),
    attempted_methods: ['database_uniprot', 'database_gene', 'database_alias', 'uniprot_api']
  };
  saveFailedMappings();
  console.log(`  ❌ Not found: ${identifier}`);
  return null;
}

/**
 * Query UniProt REST API
 * @param {string} identifier - Gene/protein name
 * @param {string} organism - Organism name
 * @returns {Promise<string|null>} - UniProt ID or null
 */
async function queryUniProtAPI(identifier, organism) {
  // Map organism names to UniProt taxonomy IDs
  const taxonMap = {
    'Homo sapiens': '9606',
    'human': '9606',
    'Mus musculus': '10090',
    'mouse': '10090'
  };

  const taxonId = taxonMap[organism] || taxonMap['human'];

  // Try gene name search first
  let query = `gene:${identifier} AND organism_id:${taxonId}`;
  let url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&format=json&size=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].primaryAccession;
    }

    // Try protein name search if gene name failed
    query = `protein_name:${identifier} AND organism_id:${taxonId}`;
    url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&format=json&size=1`;

    const response2 = await fetch(url);
    if (!response2.ok) {
      throw new Error(`HTTP ${response2.status}`);
    }

    const data2 = await response2.json();
    if (data2.results && data2.results.length > 0) {
      return data2.results[0].primaryAccession;
    }

    return null;
  } catch (error) {
    console.error(`  ❌ UniProt API request failed: ${error.message}`);
    return null;
  }
}

/**
 * Batch map multiple identifiers
 * @param {string[]} identifiers - Array of gene/protein names
 * @param {string} organism - Organism name
 * @returns {Promise<Object>} - Map of identifier → UniProt ID
 */
export async function batchMapToUniProt(identifiers, organism = 'Homo sapiens') {
  console.log(`\n🔄 Mapping ${identifiers.length} identifiers to UniProt IDs...\n`);

  const results = {};
  let successCount = 0;
  let failCount = 0;

  for (const identifier of identifiers) {
    const uniprot = await mapToUniProt(identifier, organism);
    results[identifier] = uniprot;

    if (uniprot) {
      successCount++;
    } else {
      failCount++;
    }

    // Rate limiting: wait 200ms between API calls
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n✅ Mapping complete: ${successCount} success, ${failCount} failed\n`);

  return results;
}

/**
 * Save cache to file
 */
function saveCache() {
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(uniprotCache, null, 2));
  } catch (error) {
    console.error(`❌ Failed to save cache: ${error.message}`);
  }
}

/**
 * Save failed mappings to file
 */
function saveFailedMappings() {
  try {
    writeFileSync(FAILED_FILE, JSON.stringify(failedMappings, null, 2));
  } catch (error) {
    console.error(`❌ Failed to save failed mappings: ${error.message}`);
  }
}

/**
 * Test mapping with example proteins
 */
async function testMapping() {
  console.log('🧪 Testing protein ID mapping...\n');

  const testCases = [
    'BBS7',      // Should map to Q8IWZ6
    'IFT88',     // Should map to Q13099
    'WDR19',     // IFT144, should map to Q8NEZ3
    'Q96RK4',    // Already UniProt ID (BBS4)
    'TULP3',     // Should map to O75386
    'FAKEPROTEIN' // Should fail
  ];

  for (const testCase of testCases) {
    const result = await mapToUniProt(testCase);
    console.log(`  ${testCase} → ${result || 'NOT FOUND'}`);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node map_protein_ids.mjs <identifier> [organism]');
    console.log('       node map_protein_ids.mjs --test');
    console.log('\nExamples:');
    console.log('  node map_protein_ids.mjs BBS7');
    console.log('  node map_protein_ids.mjs IFT88 "Homo sapiens"');
    console.log('  node map_protein_ids.mjs --test');
    process.exit(1);
  }

  if (args[0] === '--test') {
    await testMapping();
  } else {
    const identifier = args[0];
    const organism = args[1] || 'Homo sapiens';
    const result = await mapToUniProt(identifier, organism);
    console.log(`\nResult: ${identifier} → ${result || 'NOT FOUND'}`);
  }
}
