#!/usr/bin/env node
/**
 * Generate Curated CIF File Manifest
 * ===================================
 *
 * Reads v4 JSON files from database source_paths to extract exact
 * interaction directory names, then maps to CIF file locations.
 *
 * Output: cif_manifest.json - Clean list for manual review
 *
 * Usage:
 *   export POSTGRES_URL="postgresql://..."
 *   node scripts/generate_cif_manifest.mjs
 */

import { sql } from '@vercel/postgres';
import { readFile } from 'fs/promises';
import { writeFile } from 'fs/promises';
import { access, constants } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Check if a file exists
 */
async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse v4 JSON file to extract interaction directory names
 */
async function parseV4Json(jsonPath) {
  try {
    const content = await readFile(jsonPath, 'utf-8');
    const data = JSON.parse(content);

    // v4 JSON structure has different prediction entries
    const predictions = [];

    // Look for predictions in various possible structures
    if (data.filtered_predictions) {
      predictions.push(...data.filtered_predictions);
    }
    if (data.predictions) {
      predictions.push(...data.predictions);
    }
    if (data.high_confidence_predictions) {
      predictions.push(...data.high_confidence_predictions);
    }
    if (data.medium_confidence_predictions) {
      predictions.push(...data.medium_confidence_predictions);
    }

    // Extract directory names from predictions
    const directories = predictions.map(pred => {
      // Try to get directory name from various fields
      return pred.directory_name || pred.directory || pred.job_name || null;
    }).filter(Boolean);

    return directories;

  } catch (error) {
    console.error(`  Error parsing ${jsonPath}: ${error.message}`);
    return [];
  }
}

/**
 * Build CIF file path from components
 */
function buildCifPath(baitDir, interactionDir) {
  const basePath = '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD';
  const predictionPath = join(basePath, baitDir, 'AF3', interactionDir);
  const cifPath = join(predictionPath, `${interactionDir}_model.cif`);
  const confidencesPath = join(predictionPath, `${interactionDir}_confidences.json`);

  return { cifPath, confidencesPath, predictionPath };
}

async function main() {
  console.log('='.repeat(80));
  console.log('GENERATE CURATED CIF FILE MANIFEST');
  console.log('='.repeat(80));
  console.log();

  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable not set');
    process.exit(1);
  }

  try {
    // Get all interactions with their source paths
    console.log('📊 Querying database for interactions...');
    const result = await sql`
      SELECT
        i.id,
        b.uniprot_id as bait_uniprot,
        b.gene_name as bait_gene,
        p.uniprot_id as prey_uniprot,
        p.gene_name as prey_gene,
        i.source_path,
        i.ipsae
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE i.source_path IS NOT NULL
      ORDER BY i.id
    `;

    const interactions = result.rows;
    console.log(`✓ Found ${interactions.length} interactions with source paths`);
    console.log();

    console.log('📂 Processing source paths...');
    console.log();

    const manifest = {};
    let processed = 0;
    let found = 0;
    let notFound = 0;
    let errors = 0;

    for (const inter of interactions) {
      processed++;

      // Show progress
      if (processed % 50 === 0) {
        console.log(`  [${processed}/${interactions.length}] Processed: ${found} found, ${notFound} not found, ${errors} errors`);
      }

      const entry = {
        id: inter.id,
        bait_uniprot: inter.bait_uniprot,
        bait_gene: inter.bait_gene,
        prey_uniprot: inter.prey_uniprot,
        prey_gene: inter.prey_gene,
        ipsae: inter.ipsae,
        source_json: inter.source_path,
        status: 'pending',
        cif_path: null,
        confidences_path: null,
        interaction_directory: null,
        notes: []
      };

      // Check if source JSON exists
      if (!await fileExists(inter.source_path)) {
        entry.status = 'error';
        entry.notes.push('Source JSON file not found');
        manifest[inter.id] = entry;
        errors++;
        continue;
      }

      // Parse v4 JSON to get interaction directories
      const directories = await parseV4Json(inter.source_path);

      if (directories.length === 0) {
        entry.status = 'error';
        entry.notes.push('No interaction directories found in JSON');
        manifest[inter.id] = entry;
        errors++;
        continue;
      }

      // Build bait directory name (from source path)
      // Path format: .../AF3_APD/{BAIT_DIR}/AF3/AF3_PD_analysis_v4.json
      // We want {BAIT_DIR}
      const sourceParts = inter.source_path.split('/');
      let baitDir = null;

      // Find AF3_APD index, bait dir is the next part
      const af3apdIndex = sourceParts.indexOf('AF3_APD');
      if (af3apdIndex >= 0 && af3apdIndex + 1 < sourceParts.length) {
        baitDir = sourceParts[af3apdIndex + 1];
      }

      if (!baitDir) {
        entry.status = 'error';
        entry.notes.push('Could not determine bait directory from source path');
        manifest[inter.id] = entry;
        errors++;
        continue;
      }

      // Try to match interaction directory with bait/prey UniProts
      let matchedDir = null;
      const baitLower = inter.bait_uniprot.toLowerCase();
      const preyLower = inter.prey_uniprot.toLowerCase();

      for (const dir of directories) {
        const dirLower = dir.toLowerCase();
        if (dirLower.includes(baitLower) && dirLower.includes(preyLower)) {
          matchedDir = dir;
          break;
        }
      }

      // If no match, try first directory (might be single interaction in JSON)
      if (!matchedDir && directories.length === 1) {
        matchedDir = directories[0];
      }

      if (!matchedDir) {
        entry.status = 'error';
        entry.notes.push(`Could not match directory for ${baitLower}_and_${preyLower}`);
        entry.notes.push(`Available directories: ${directories.join(', ')}`);
        manifest[inter.id] = entry;
        errors++;
        continue;
      }

      // Build paths
      const { cifPath, confidencesPath, predictionPath } = buildCifPath(baitDir, matchedDir);

      // Verify files exist
      const cifExists = await fileExists(cifPath);
      const confExists = await fileExists(confidencesPath);

      if (cifExists) {
        entry.status = 'found';
        entry.cif_path = cifPath;
        entry.confidences_path = confExists ? confidencesPath : null;
        entry.interaction_directory = matchedDir;
        entry.prediction_directory = predictionPath;

        if (!confExists) {
          entry.notes.push('Confidences JSON not found');
        }

        found++;
      } else {
        entry.status = 'not_found';
        entry.notes.push(`CIF file not found at: ${cifPath}`);
        entry.interaction_directory = matchedDir;
        notFound++;
      }

      manifest[inter.id] = entry;
    }

    console.log();
    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total interactions: ${processed}`);
    console.log(`Found: ${found} (${(found/processed*100).toFixed(1)}%)`);
    console.log(`Not found: ${notFound} (${(notFound/processed*100).toFixed(1)}%)`);
    console.log(`Errors: ${errors} (${(errors/processed*100).toFixed(1)}%)`);
    console.log();

    // Save manifest
    const outputFile = join(dirname(__dirname), 'cif_manifest.json');

    const outputData = {
      generated_at: new Date().toISOString(),
      total: processed,
      found: found,
      not_found: notFound,
      errors: errors,
      entries: manifest
    };

    await writeFile(outputFile, JSON.stringify(outputData, null, 2));

    console.log(`✅ Manifest saved to: ${outputFile}`);
    console.log();
    console.log('📋 Review this file and verify the paths are correct!');
    console.log();

    // Show samples
    console.log('Sample found entries:');
    let samples = 0;
    for (const [id, entry] of Object.entries(manifest)) {
      if (entry.status === 'found' && samples < 3) {
        console.log(`  ID ${id}: ${entry.bait_gene} + ${entry.prey_gene}`);
        console.log(`    Directory: ${entry.interaction_directory}`);
        console.log(`    CIF: ${entry.cif_path}`);
        console.log();
        samples++;
      }
    }

    if (notFound > 0) {
      console.log('Sample not found entries:');
      samples = 0;
      for (const [id, entry] of Object.entries(manifest)) {
        if (entry.status === 'not_found' && samples < 3) {
          console.log(`  ID ${id}: ${entry.bait_gene} + ${entry.prey_gene}`);
          console.log(`    Notes: ${entry.notes.join('; ')}`);
          console.log();
          samples++;
        }
      }
    }

    console.log('='.repeat(80));
    console.log('✅ COMPLETE - Review cif_manifest.json before proceeding');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
