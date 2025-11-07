#!/usr/bin/env node
/**
 * Import Experimental Validation Data
 *
 * Processes experimental interaction datasets from published studies
 * and adds validation information to the interactions table.
 *
 * Supported datasets:
 * - Boldt et al., 2016 (SF-TAP-MS)
 * - Gupta et al., 2015 (BioID)
 * - Sang et al., 2011 (LAP)
 * - Mick et al., 2015 (APEX)
 * - Kohli et al., 2017 (APEX)
 * - May et al., 2021 (APEX2)
 * - Aslanyan et al., 2023 (BioID2-UBD)
 */

import { sql } from '@vercel/postgres';
import { readFileSync, existsSync } from 'fs';
import { batchMapToUniProt, mapToUniProt } from './map_protein_ids.mjs';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ POSTGRES_URL environment variable is not set.');
  process.exit(1);
}

/**
 * Dataset configurations
 */
const DATASETS = {
  boldt2016: {
    name: 'Boldt et al., 2016',
    pmid: '27173156',
    doi: '10.1038/ncomms11491',
    method: 'SF-TAP-MS',
    confidence: 'high',
    description: '217 baits, comprehensive cilia interactome',
    dataFile: './experimental_data/raw/boldt_2016_supp_data_1.csv',
    parser: parseBoldt2016
  },
  gupta2015: {
    name: 'Gupta et al., 2015',
    pmid: '26638075',
    doi: '10.1016/j.cell.2015.10.065',
    method: 'BioID',
    confidence: 'medium',
    description: '56 baits, centrosome-cilium interface, ciliated interactome',
    // NOTE: Excel file must be converted to CSV first (see TODO_GUPTA_DATASET.md)
    // Source: experimental_data/raw/Gupta_Cell_2015_S1_1-s2.0-S009286741501421X-mmc2.xlsx (Tab 2)
    dataFile: './experimental_data/raw/gupta_2015_ciliated_interactome.csv',
    parser: parseGupta2015
  },
  sang2011: {
    name: 'Sang et al., 2011',
    pmid: '21565611',
    doi: '10.1016/j.cell.2011.04.019',
    method: 'LAP',
    confidence: 'high',
    description: '9 NPHP-JBTS-MKS baits',
    dataFile: './experimental_data/raw/sang_2011_table_s2.csv',
    parser: parseSang2011
  },
  mick2015: {
    name: 'Mick et al., 2015',
    pmid: '26399832',
    doi: '10.1016/j.devcel.2015.08.012',
    method: 'APEX',
    confidence: 'medium',
    description: 'Primary cilia proteome in mIMCD3 cells',
    dataFile: './experimental_data/raw/mick_2015_table_s1.csv',
    parser: parseMick2015
  }
  // Add other datasets as needed
};

/**
 * Update or create experimental validation for an interaction
 */
async function addValidationToInteraction(baitUniprot, preyUniprot, validationData) {
  try {
    // Find the interaction (bidirectional search)
    const interaction = await sql`
      SELECT i.id, i.experimental_validation,
             b.uniprot_id as bait_id, p.uniprot_id as prey_id
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE (b.uniprot_id = ${baitUniprot} AND p.uniprot_id = ${preyUniprot})
         OR (b.uniprot_id = ${preyUniprot} AND p.uniprot_id = ${baitUniprot})
      LIMIT 1
    `;

    if (interaction.rows.length === 0) {
      // Interaction not in our AF3 predictions
      return { status: 'not_found', bait: baitUniprot, prey: preyUniprot };
    }

    const interactionId = interaction.rows[0].id;
    const existingValidation = interaction.rows[0].experimental_validation || {
      experimental_methods: [],
      validation_summary: {
        is_validated: false,
        validation_count: 0,
        strongest_method: null,
        consensus_confidence: null
      }
    };

    // Check if this study is already added
    const alreadyExists = existingValidation.experimental_methods.some(
      method => method.pmid === validationData.pmid
    );

    if (alreadyExists) {
      return { status: 'already_exists', interaction_id: interactionId };
    }

    // Add new validation method
    existingValidation.experimental_methods.push(validationData);

    // Update validation summary
    existingValidation.validation_summary.is_validated = true;
    existingValidation.validation_summary.validation_count = existingValidation.experimental_methods.length;

    // Determine strongest method (high > medium > low)
    const confidenceRanking = { high: 3, medium: 2, low: 1 };
    let strongestMethod = existingValidation.experimental_methods[0];
    for (const method of existingValidation.experimental_methods) {
      if (confidenceRanking[method.confidence] > confidenceRanking[strongestMethod.confidence]) {
        strongestMethod = method;
      }
    }
    existingValidation.validation_summary.strongest_method = strongestMethod.method;
    existingValidation.validation_summary.consensus_confidence = strongestMethod.confidence;

    // Update database
    await sql`
      UPDATE interactions
      SET experimental_validation = ${JSON.stringify(existingValidation)}
      WHERE id = ${interactionId}
    `;

    return {
      status: 'updated',
      interaction_id: interactionId,
      validation_count: existingValidation.validation_summary.validation_count
    };

  } catch (error) {
    console.error(`❌ Error updating interaction ${baitUniprot}-${preyUniprot}:`, error.message);
    return { status: 'error', error: error.message };
  }
}

/**
 * Parser for Boldt et al., 2016 dataset
 * Format: CSV with columns Bait, Prey, Score (example - adjust based on actual format)
 */
function parseBoldt2016(filePath) {
  console.log('📄 Parsing Boldt et al., 2016 dataset...');

  // TODO: Implement based on actual file format
  // This is a placeholder - you'll need to adjust based on the real Supplementary Data structure

  const interactions = [];

  // Example structure (adjust based on actual file):
  // const data = readFileSync(filePath, 'utf-8');
  // const lines = data.split('\n');
  // for (const line of lines) {
  //   const [bait, prey, score] = line.split(',');
  //   interactions.push({ bait, prey, score });
  // }

  console.log(`  Found ${interactions.length} interactions`);
  return interactions;
}

/**
 * Parser for Gupta et al., 2015 dataset (BioID)
 * Format: CSV/TSV with columns: Bait, Prey, SAINT_Score, AvgSpec, FoldChange
 * Filters: SAINT ≥ 0.8, FoldChange ≥ 2.0
 */
function parseGupta2015(filePath) {
  console.log('📄 Parsing Gupta et al., 2015 dataset...');

  if (!existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return [];
  }

  const interactions = [];

  try {
    const data = readFileSync(filePath, 'utf-8');
    const lines = data.split('\n');

    // Detect delimiter (tab or comma)
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';

    // Parse header to find column indices
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());

    const colIndices = {
      bait: headers.findIndex(h => h.includes('bait') || h.includes('prey_of')),
      prey: headers.findIndex(h => h.includes('prey') && !h.includes('bait')),
      saint: headers.findIndex(h => h.includes('saint') || h.includes('probability')),
      avgspec: headers.findIndex(h => h.includes('avgspec') || h.includes('spectral')),
      foldchange: headers.findIndex(h => h.includes('fold') || h.includes('fc') || h.includes('enrichment'))
    };

    console.log(`  Detected columns: Bait=${colIndices.bait}, Prey=${colIndices.prey}, SAINT=${colIndices.saint}`);

    // Parse data rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(delimiter).map(c => c.trim());

      // Extract values
      const bait = columns[colIndices.bait] || '';
      const prey = columns[colIndices.prey] || '';
      const saint = parseFloat(columns[colIndices.saint]) || 0;
      const avgspec = parseFloat(columns[colIndices.avgspec]) || 0;
      const foldchange = parseFloat(columns[colIndices.foldchange]) || 1;

      // Skip if missing essential data
      if (!bait || !prey) continue;

      // Apply Gupta et al. quality filters (SAINT ≥ 0.8, FC ≥ 2.0)
      if (saint < 0.8 || foldchange < 2.0) {
        continue;
      }

      // Determine confidence level based on SAINT and spectral counts
      let confidence_note = 'medium';
      if (saint >= 0.9 && avgspec >= 10) {
        confidence_note = 'high (BioID)';
      } else if (avgspec >= 5) {
        confidence_note = 'medium-high (BioID)';
      }

      interactions.push({
        bait: bait,
        prey: prey,
        score: saint,
        notes: `BioID proximity labeling (~10nm). SAINT=${saint.toFixed(2)}, AvgSpec=${avgspec.toFixed(1)}, FC=${foldchange.toFixed(1)}. Confidence: ${confidence_note}`
      });
    }

    console.log(`  ✅ Parsed ${interactions.length} high-confidence BioID interactions (SAINT ≥0.8, FC ≥2.0)`);

  } catch (error) {
    console.error(`❌ Error parsing file: ${error.message}`);
    return [];
  }

  return interactions;
}

/**
 * Parser for Sang et al., 2011 dataset (LAP)
 */
function parseSang2011(filePath) {
  console.log('📄 Parsing Sang et al., 2011 dataset...');
  // TODO: Implement parser
  return [];
}

/**
 * Parser for Mick et al., 2015 dataset (APEX)
 */
function parseMick2015(filePath) {
  console.log('📄 Parsing Mick et al., 2015 dataset...');
  // TODO: Implement parser
  return [];
}

/**
 * Process a single dataset
 */
async function processDataset(datasetKey) {
  const dataset = DATASETS[datasetKey];

  if (!dataset) {
    console.error(`❌ Unknown dataset: ${datasetKey}`);
    return;
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 Processing: ${dataset.name}`);
  console.log(`   Method: ${dataset.method} (${dataset.confidence} confidence)`);
  console.log(`   PMID: ${dataset.pmid}`);
  console.log(`${'='.repeat(70)}\n`);

  // Check if data file exists
  if (!existsSync(dataset.dataFile)) {
    console.error(`❌ Data file not found: ${dataset.dataFile}`);
    console.log('   Please download the dataset first.');
    return;
  }

  // Parse the dataset
  const interactions = dataset.parser(dataset.dataFile);

  if (interactions.length === 0) {
    console.log('⚠️  No interactions parsed. Parser may need implementation.');
    return;
  }

  // Extract unique protein identifiers
  const allProteins = new Set();
  interactions.forEach(int => {
    allProteins.add(int.bait);
    allProteins.add(int.prey);
  });

  console.log(`\n👥 Found ${allProteins.size} unique proteins in dataset`);
  console.log(`🔗 Found ${interactions.length} interactions\n`);

  // Map to UniProt IDs
  console.log('🔄 Mapping proteins to UniProt IDs...\n');
  const proteinMapping = await batchMapToUniProt([...allProteins]);

  const mappedCount = Object.values(proteinMapping).filter(v => v !== null).length;
  const failedCount = allProteins.size - mappedCount;

  console.log(`\n✅ Successfully mapped: ${mappedCount}/${allProteins.size} proteins`);
  if (failedCount > 0) {
    console.log(`⚠️  Failed to map: ${failedCount} proteins`);
  }

  // Update interactions in database
  console.log(`\n📝 Updating database with experimental validation...\n`);

  let updated = 0;
  let notFound = 0;
  let alreadyExists = 0;
  let errors = 0;

  for (const interaction of interactions) {
    const baitUniprot = proteinMapping[interaction.bait];
    const preyUniprot = proteinMapping[interaction.prey];

    if (!baitUniprot || !preyUniprot) {
      // Skip if we couldn't map the proteins
      continue;
    }

    const validationData = {
      method: dataset.method,
      study: dataset.name,
      pmid: dataset.pmid,
      doi: dataset.doi,
      confidence: dataset.confidence,
      bait_protein: interaction.bait,
      notes: interaction.notes || dataset.description
    };

    const result = await addValidationToInteraction(baitUniprot, preyUniprot, validationData);

    switch (result.status) {
      case 'updated':
        updated++;
        if (updated % 10 === 0) {
          process.stdout.write(`  Updated ${updated} interactions...\r`);
        }
        break;
      case 'not_found':
        notFound++;
        break;
      case 'already_exists':
        alreadyExists++;
        break;
      case 'error':
        errors++;
        break;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log(`\n\n${'='.repeat(70)}`);
  console.log('📊 Import Summary:');
  console.log(`   ✅ Updated: ${updated} interactions`);
  console.log(`   ⚠️  Not in AF3 predictions: ${notFound} interactions`);
  console.log(`   ℹ️  Already validated: ${alreadyExists} interactions`);
  console.log(`   ❌ Errors: ${errors} interactions`);
  console.log(`${'='.repeat(70)}\n`);

  return { updated, notFound, alreadyExists, errors };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node import_experimental_data.mjs <dataset>');
    console.log('\nAvailable datasets:');
    Object.entries(DATASETS).forEach(([key, dataset]) => {
      console.log(`  ${key.padEnd(15)} - ${dataset.name} (${dataset.method})`);
    });
    console.log('\nExamples:');
    console.log('  node import_experimental_data.mjs boldt2016');
    console.log('  node import_experimental_data.mjs gupta2015');
    console.log('  node import_experimental_data.mjs all  # Process all datasets');
    process.exit(1);
  }

  const datasetKey = args[0];

  console.log('🚀 Experimental Validation Import Tool\n');

  if (datasetKey === 'all') {
    // Process all datasets
    let totalStats = { updated: 0, notFound: 0, alreadyExists: 0, errors: 0 };

    for (const key of Object.keys(DATASETS)) {
      const stats = await processDataset(key);
      if (stats) {
        totalStats.updated += stats.updated;
        totalStats.notFound += stats.notFound;
        totalStats.alreadyExists += stats.alreadyExists;
        totalStats.errors += stats.errors;
      }
    }

    console.log('\n🎉 All datasets processed!');
    console.log('\nOverall Summary:');
    console.log(`  ✅ Total updated: ${totalStats.updated}`);
    console.log(`  ⚠️  Total not found: ${totalStats.notFound}`);
    console.log(`  ℹ️  Total already validated: ${totalStats.alreadyExists}`);
    console.log(`  ❌ Total errors: ${totalStats.errors}\n`);

  } else {
    // Process single dataset
    await processDataset(datasetKey);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}
