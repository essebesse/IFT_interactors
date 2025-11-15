#!/usr/bin/env node
/**
 * Categorize all interactions into functional groups
 * Uses GO terms + manual curation for known ciliary proteins
 */

import { sql } from '@vercel/postgres';
import fs from 'fs';

// Known IFT and BBSome proteins (for validation category)
const KNOWN_CILIARY_PROTEINS = {
  // IFT-A complex
  IFT_A: ['IFT43', 'IFT121', 'IFT122', 'IFT139', 'IFT140', 'IFT144', 'WDR19', 'WDR35', 'TULP3'],

  // IFT-B complex
  IFT_B: ['IFT20', 'IFT22', 'IFT25', 'IFT27', 'IFT46', 'IFT52', 'IFT54', 'IFT56', 'IFT57',
          'IFT70', 'IFT74', 'IFT80', 'IFT81', 'IFT88', 'TTC30A', 'TTC30B', 'RABL2A', 'RABL2B'],

  // BBSome complex
  BBSOME: ['BBS1', 'BBS2', 'BBS3', 'ARL6', 'BBS4', 'BBS5', 'BBS7', 'BBS8', 'BBS9', 'BBS10',
           'BBS12', 'BBS17', 'BBS18', 'BBIP10', 'LZTL1'],

  // IFT-associated
  IFT_ASSOCIATED: ['TULP3', 'IFT22', 'RABL5']
};

// Flatten all known ciliary proteins
const ALL_CILIARY_GENES = new Set([
  ...KNOWN_CILIARY_PROTEINS.IFT_A,
  ...KNOWN_CILIARY_PROTEINS.IFT_B,
  ...KNOWN_CILIARY_PROTEINS.BBSOME,
  ...KNOWN_CILIARY_PROTEINS.IFT_ASSOCIATED
]);

/**
 * Load GO terms from file
 */
function loadGOTerms() {
  try {
    const data = fs.readFileSync('data/protein_go_terms.json', 'utf8');
    const proteins = JSON.parse(data);

    // Create lookup by UniProt ID and gene name
    const goLookup = {};
    for (const protein of proteins) {
      goLookup[protein.uniprot_id] = protein;
      if (protein.gene_name) {
        goLookup[protein.gene_name] = protein;
      }
    }

    return goLookup;
  } catch (error) {
    console.error('Error loading GO terms:', error.message);
    return {};
  }
}

/**
 * Categorize a protein based on GO terms and known lists
 */
function categorizeProtein(geneName, uniprotId, goTerms) {
  // First check if it's a known ciliary protein
  if (ALL_CILIARY_GENES.has(geneName)) {
    if (KNOWN_CILIARY_PROTEINS.IFT_A.includes(geneName)) return 'IFT-A';
    if (KNOWN_CILIARY_PROTEINS.IFT_B.includes(geneName)) return 'IFT-B';
    if (KNOWN_CILIARY_PROTEINS.BBSOME.includes(geneName)) return 'BBSome';
    if (KNOWN_CILIARY_PROTEINS.IFT_ASSOCIATED.includes(geneName)) return 'IFT-associated';
  }

  if (!goTerms || !goTerms.go_terms) return 'Other';

  const bp = goTerms.go_terms.biological_process.map(t => t.term.toLowerCase());
  const cc = goTerms.go_terms.cellular_component.map(t => t.term.toLowerCase());
  const mf = goTerms.go_terms.molecular_function.map(t => t.term.toLowerCase());

  const allTerms = [...bp, ...cc, ...mf].join(' ');

  // Categorization logic based on GO terms

  // 1. Ciliary proteins
  if (allTerms.includes('cilium') || allTerms.includes('ciliar') ||
      allTerms.includes('axoneme') || allTerms.includes('basal body')) {
    return 'Ciliary structural';
  }

  // 2. Transcription factors
  if (allTerms.includes('transcription') || allTerms.includes('dna-binding') ||
      allTerms.includes('chromatin') || allTerms.includes('histone')) {
    return 'Transcription/Chromatin';
  }

  // 3. Signaling (GPCRs, kinases, etc.)
  if (allTerms.includes('signal transduction') || allTerms.includes('gpcr') ||
      allTerms.includes('g protein') || allTerms.includes('kinase') ||
      allTerms.includes('phosphorylation') || allTerms.includes('receptor')) {
    return 'Signaling';
  }

  // 4. Metabolic
  if (allTerms.includes('metabolic') || allTerms.includes('metabolism') ||
      allTerms.includes('glycolysis') || allTerms.includes('lipid') ||
      allTerms.includes('mitochondri')) {
    return 'Metabolism';
  }

  // 5. Cytoskeleton
  if (allTerms.includes('cytoskeleton') || allTerms.includes('microtubule') ||
      allTerms.includes('actin') || allTerms.includes('tubulin')) {
    return 'Cytoskeleton';
  }

  // 6. Membrane trafficking
  if (allTerms.includes('vesicle') || allTerms.includes('transport') ||
      allTerms.includes('golgi') || allTerms.includes('endosome') ||
      allTerms.includes('lysosome')) {
    return 'Membrane trafficking';
  }

  // 7. RNA processing
  if (allTerms.includes('rna') || allTerms.includes('splicing') ||
      allTerms.includes('translation')) {
    return 'RNA processing';
  }

  return 'Other';
}

/**
 * Categorize an interaction
 */
function categorizeInteraction(baitGene, preyGene, baitCategory, preyCategory) {
  // Validation interactions (machinery)
  if ((baitCategory === 'IFT-A' && preyCategory === 'IFT-A') ||
      (baitCategory === 'IFT-B' && preyCategory === 'IFT-B') ||
      (baitCategory === 'BBSome' && preyCategory === 'BBSome')) {
    return 'Validation: Intra-complex';
  }

  if ((baitCategory === 'IFT-A' && preyCategory === 'IFT-B') ||
      (baitCategory === 'IFT-B' && preyCategory === 'IFT-A')) {
    return 'Validation: IFT-A/B coupling';
  }

  if ((baitCategory === 'IFT-A' && preyCategory === 'BBSome') ||
      (baitCategory === 'IFT-B' && preyCategory === 'BBSome') ||
      (baitCategory === 'BBSome' && preyCategory === 'IFT-A') ||
      (baitCategory === 'BBSome' && preyCategory === 'IFT-B')) {
    return 'Mechanistic: IFT-BBSome coupling';
  }

  // Novel cargo interactions
  if (preyCategory === 'Transcription/Chromatin') {
    return 'Novel cargo: Transcription/Chromatin';
  }

  if (preyCategory === 'Signaling') {
    return 'Novel cargo: Signaling';
  }

  if (preyCategory === 'Metabolism') {
    return 'Novel cargo: Metabolism';
  }

  if (preyCategory === 'Cytoskeleton') {
    return 'Novel cargo: Cytoskeleton';
  }

  if (preyCategory === 'Membrane trafficking') {
    return 'Novel cargo: Membrane trafficking';
  }

  if (preyCategory === 'Ciliary structural') {
    return 'Novel cargo: Ciliary structural';
  }

  if (preyCategory === 'RNA processing') {
    return 'Novel cargo: RNA processing';
  }

  return 'Novel cargo: Other';
}

/**
 * Main function
 */
async function main() {
  console.log('Loading GO terms...');
  const goLookup = loadGOTerms();
  console.log(`Loaded GO terms for ${Object.keys(goLookup).length} proteins`);

  console.log('\nFetching all interactions from database...');

  const result = await sql`
    SELECT
      i.id,
      i.ipsae,
      i.iptm,
      i.analysis_version,
      bait.uniprot_id as bait_uniprot,
      bait.gene_name as bait_gene,
      prey.uniprot_id as prey_uniprot,
      prey.gene_name as prey_gene
    FROM interactions i
    JOIN proteins bait ON i.bait_protein_id = bait.id
    JOIN proteins prey ON i.prey_protein_id = prey.id
    WHERE bait.organism = 'Homo sapiens'
      AND prey.organism = 'Homo sapiens'
      AND i.analysis_version = 'v4'
    ORDER BY i.ipsae DESC
  `;

  const interactions = result.rows;
  console.log(`Found ${interactions.length} interactions`);

  // Categorize each interaction
  const categorizedInteractions = [];
  const categoryCounts = {};
  const proteinCategoryCounts = {};

  for (const interaction of interactions) {
    const baitGO = goLookup[interaction.bait_uniprot] || goLookup[interaction.bait_gene];
    const preyGO = goLookup[interaction.prey_uniprot] || goLookup[interaction.prey_gene];

    const baitCategory = categorizeProtein(interaction.bait_gene, interaction.bait_uniprot, baitGO);
    const preyCategory = categorizeProtein(interaction.prey_gene, interaction.prey_uniprot, preyGO);

    const interactionCategory = categorizeInteraction(
      interaction.bait_gene,
      interaction.prey_gene,
      baitCategory,
      preyCategory
    );

    categorizedInteractions.push({
      interaction_id: interaction.id,
      bait_gene: interaction.bait_gene,
      bait_uniprot: interaction.bait_uniprot,
      bait_category: baitCategory,
      prey_gene: interaction.prey_gene,
      prey_uniprot: interaction.prey_uniprot,
      prey_category: preyCategory,
      interaction_category: interactionCategory,
      ipsae: interaction.ipsae,
      iptm: interaction.iptm
    });

    // Count categories
    categoryCounts[interactionCategory] = (categoryCounts[interactionCategory] || 0) + 1;
    proteinCategoryCounts[preyCategory] = (proteinCategoryCounts[preyCategory] || 0) + 1;
  }

  // Save categorized interactions
  fs.writeFileSync(
    'data/categorized_interactions.json',
    JSON.stringify(categorizedInteractions, null, 2)
  );

  // Generate summary statistics
  const summary = {
    total_interactions: interactions.length,
    interaction_categories: categoryCounts,
    protein_categories: proteinCategoryCounts
  };

  fs.writeFileSync(
    'data/interaction_summary.json',
    JSON.stringify(summary, null, 2)
  );

  // Create CSV for visualization
  const csvLines = ['Bait_Gene,Prey_Gene,Bait_Category,Prey_Category,Interaction_Category,ipSAE,iPTM'];
  for (const item of categorizedInteractions) {
    csvLines.push([
      item.bait_gene,
      item.prey_gene,
      item.bait_category,
      item.prey_category,
      item.interaction_category,
      item.ipsae,
      item.iptm
    ].join(','));
  }

  fs.writeFileSync('data/categorized_interactions.csv', csvLines.join('\n'));

  // Print summary
  console.log('\n=== INTERACTION CATEGORIES ===');
  const sorted = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);

  for (const [category, count] of sorted) {
    const percentage = ((count / interactions.length) * 100).toFixed(1);
    console.log(`${category.padEnd(40)} ${count.toString().padStart(4)} (${percentage}%)`);
  }

  console.log('\n=== PREY PROTEIN CATEGORIES ===');
  const sortedProteins = Object.entries(proteinCategoryCounts)
    .sort((a, b) => b[1] - a[1]);

  for (const [category, count] of sortedProteins) {
    const percentage = ((count / interactions.length) * 100).toFixed(1);
    console.log(`${category.padEnd(30)} ${count.toString().padStart(4)} (${percentage}%)`);
  }

  console.log('\n✓ Saved results:');
  console.log('  - data/categorized_interactions.json');
  console.log('  - data/categorized_interactions.csv');
  console.log('  - data/interaction_summary.json');
}

main().catch(console.error);
