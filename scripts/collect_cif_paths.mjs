#!/usr/bin/env node
/**
 * CIF Path Collection Script for IFT Interactors Database
 * ========================================================
 *
 * Connects to Neon database, queries all interactions, and finds corresponding
 * CIF files in the AlphaPulldown directory structure.
 *
 * Output: cif_mapping.json with mappings for all interactions
 *
 * Usage:
 *   export POSTGRES_URL="postgresql://..."
 *   node scripts/collect_cif_paths.mjs
 */

import { sql } from '@vercel/postgres';
import { readdir, access, constants } from 'fs/promises';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base directory for AlphaPulldown predictions
const AF3_BASE_DIR = '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD';

/**
 * Extract interaction directory name from source_path
 */
function extractDirectoryFromSourcePath(sourcePath) {
  if (!sourcePath) return null;

  // Split by forward slash
  const parts = sourcePath.split('/');

  // Look for pattern: lowercase_and_lowercase (interaction directory)
  for (const part of parts) {
    if (part.includes('_and_') && part === part.toLowerCase()) {
      return part.split('/')[0];
    }
  }

  return null;
}

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
 * Find CIF file in AlphaPulldown directory structure
 */
async function findCifFile(baitUniprot, baitGene, preyUniprot, directoryName) {
  if (!directoryName) return null;

  // Try different bait directory patterns
  const baitPatterns = [];

  if (baitGene) {
    baitPatterns.push(`${baitUniprot}_${baitGene}`);
    baitPatterns.push(`${baitUniprot}_${baitGene.toUpperCase()}`);
  }
  baitPatterns.push(baitUniprot);

  for (const baitDir of baitPatterns) {
    const baitPath = join(AF3_BASE_DIR, baitDir, 'AF3', directoryName);

    // Check if directory exists
    if (await fileExists(baitPath)) {
      // Look for model.cif file
      const cifPath1 = join(baitPath, `${directoryName}_model.cif`);
      const cifPath2 = join(baitPath, `${directoryName.split('_')[0]}_model.cif`);

      let cifPath = null;
      if (await fileExists(cifPath1)) {
        cifPath = cifPath1;
      } else if (await fileExists(cifPath2)) {
        cifPath = cifPath2;
      } else {
        // Try to find any *_model.cif file
        try {
          const files = await readdir(baitPath);
          const cifFiles = files.filter(f => f.endsWith('_model.cif'));
          if (cifFiles.length > 0) {
            cifPath = join(baitPath, cifFiles[0]);
          }
        } catch (e) {
          continue;
        }
      }

      if (cifPath) {
        // Also find confidences.json file
        const confPath1 = join(baitPath, `${directoryName}_confidences.json`);
        const confPath2 = join(baitPath, `${directoryName.split('_')[0]}_confidences.json`);

        let confidencesPath = null;
        if (await fileExists(confPath1)) {
          confidencesPath = confPath1;
        } else if (await fileExists(confPath2)) {
          confidencesPath = confPath2;
        } else {
          // Try to find any *_confidences.json file
          try {
            const files = await readdir(baitPath);
            const confFiles = files.filter(f => f.endsWith('_confidences.json') && !f.includes('summary'));
            if (confFiles.length > 0) {
              confidencesPath = join(baitPath, confFiles[0]);
            }
          } catch (e) {
            // Continue even if confidences not found
          }
        }

        return {
          cif_path: cifPath,
          confidences_path: confidencesPath,
          bait_directory: baitDir,
          interaction_directory: directoryName
        };
      }
    }
  }

  return null;
}

async function main() {
  console.log('='.repeat(80));
  console.log('CIF PATH COLLECTION SCRIPT');
  console.log('='.repeat(80));
  console.log();

  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable not set');
    console.error('Usage: export POSTGRES_URL="postgresql://..."');
    process.exit(1);
  }

  // Check if base directory exists
  if (!await fileExists(AF3_BASE_DIR)) {
    console.error(`❌ AlphaPulldown base directory not found: ${AF3_BASE_DIR}`);
    process.exit(1);
  }

  console.log(`Base directory: ${AF3_BASE_DIR}`);
  console.log();

  try {
    // Get all interactions
    console.log('📊 Querying database...');
    const result = await sql`
      SELECT
        i.id,
        b.uniprot_id as bait_uniprot,
        b.gene_name as bait_gene,
        p.uniprot_id as prey_uniprot,
        p.gene_name as prey_gene,
        i.source_path
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      ORDER BY i.id
    `;

    const interactions = result.rows;
    console.log(`✓ Found ${interactions.length} interactions in database`);
    console.log();

    console.log('🔍 Searching for CIF files...');
    console.log();

    // Process each interaction
    const mapping = {};
    let foundCount = 0;
    let missingCount = 0;

    for (let idx = 0; idx < interactions.length; idx++) {
      const inter = interactions[idx];
      const interactionId = inter.id;
      const baitUniprot = inter.bait_uniprot;
      const baitGene = inter.bait_gene;
      const preyUniprot = inter.prey_uniprot;
      const sourcePath = inter.source_path;

      // Extract directory name from source_path
      let directoryName = extractDirectoryFromSourcePath(sourcePath);

      if (!directoryName) {
        // Try to construct from UniProt IDs
        directoryName = `${baitUniprot.toLowerCase()}_and_${preyUniprot.toLowerCase()}`;
      }

      // Find CIF file
      const result = await findCifFile(baitUniprot, baitGene, preyUniprot, directoryName);

      if (result) {
        mapping[interactionId] = result;
        foundCount++;

        if ((idx + 1) % 50 === 0) {
          console.log(`  Processed ${idx + 1}/${interactions.length} - Found: ${foundCount}, Missing: ${missingCount}`);
        }
      } else {
        missingCount++;
        mapping[interactionId] = {
          cif_path: null,
          confidences_path: null,
          bait_directory: null,
          interaction_directory: directoryName,
          error: 'CIF file not found'
        };
      }
    }

    console.log();
    console.log(`✅ Processing complete!`);
    console.log(`  Total interactions: ${interactions.length}`);
    console.log(`  Found CIF files: ${foundCount} (${(foundCount/interactions.length*100).toFixed(1)}%)`);
    console.log(`  Missing CIF files: ${missingCount} (${(missingCount/interactions.length*100).toFixed(1)}%)`);
    console.log();

    // Save mapping to JSON file
    const outputFile = join(dirname(__dirname), 'cif_mapping.json');

    const outputData = {
      generated_at: new Date().toISOString(),
      total_interactions: interactions.length,
      found_count: foundCount,
      missing_count: missingCount,
      mappings: mapping
    };

    await writeFile(outputFile, JSON.stringify(outputData, null, 2));

    console.log(`✅ Saved mapping to: ${outputFile}`);
    console.log();

    // Show some examples
    if (foundCount > 0) {
      console.log('Sample mappings:');
      let sampleCount = 0;
      for (const [interId, data] of Object.entries(mapping)) {
        if (data.cif_path && sampleCount < 3) {
          console.log(`  ID ${interId}:`);
          console.log(`    CIF: ${data.cif_path}`);
          console.log(`    Confidences: ${data.confidences_path || 'N/A'}`);
          console.log();
          sampleCount++;
        }
      }
    }

    // Show missing examples
    if (missingCount > 0) {
      console.log('Sample missing files:');
      let sampleCount = 0;
      for (const [interId, data] of Object.entries(mapping)) {
        if (!data.cif_path && sampleCount < 3) {
          console.log(`  ID ${interId}: ${data.interaction_directory}`);
          sampleCount++;
        }
      }
      console.log();
    }

    console.log('='.repeat(80));
    console.log('COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
