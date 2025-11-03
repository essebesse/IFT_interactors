#!/usr/bin/env node

import { sql } from '@vercel/postgres';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const POSTGRES_URL = process.env.POSTGRES_URL;

// List of SINGLE PROTEIN IFT/BBS v4.json files (COMPLEXES EXCLUDED)
const V4_JSON_FILES = [
  // IFT proteins (single baits only)
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/A0AVF1_IFT56/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q13099_IFT88/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q7Z4L5_IFT139/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q86WT1_IFT70_isoform_TTC30A/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8IY31_IFT20/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8N4P2_IFT70_isoform_TTC30B/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8NEZ3_IFT144/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8TDR0_IFT54_MIPT3/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8WYA0_IFT81/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q96AJ1_IFT38_CLUA1/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q96FT9_IFT43/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q96LB3_IFT74/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q96RY7_IFT140/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9BW83_IFT27/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9H7X7_IFT22/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9HBG6_IFT122/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9NQC8_IFT46/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9NWB7_IFT57/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9P2H3_IFT80/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9P2L0_IFT121/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9Y366_IFT52/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9Y547_IFT25/AF3/AF3_PD_analysis_v4.json',

  // BBSome proteins (single baits only)
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q6ZW61_BBS12/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8IWZ6_BBS7/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8N3I7_BBS5/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8NFJ9_BBS1/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8TAM1_BBS10/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8TAM2_BBS8/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q96RK4_BBS4/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9BXC9_BBS2/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9H0F7_BBS3_ARL6/AF3/AF3_PD_analysis_v4.json',
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9NQ48_BBS17/AF3/AF3_PD_analysis_v4.json',

  // IFT-associated proteins
  '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/O75386_Tulp3/AF3/AF3_PD_analysis_v4.json'
];

// EXCLUDED COMPLEXES (not imported):
// - Q96LB3_Q8WYA0_IFT74_81 (IFT74+IFT81 complex)
// - IFT52_46 (IFT52+IFT46 complex)
// - Hs_Cter_IFT52_46 (C-terminal variant of IFT52+IFT46 complex)

async function createTables() {
  console.log('📊 Creating database tables if needed...\n');

  await sql`
    CREATE TABLE IF NOT EXISTS proteins (
      id SERIAL PRIMARY KEY,
      uniprot_id VARCHAR(255) UNIQUE NOT NULL,
      gene_name VARCHAR(255),
      organism VARCHAR(255),
      organism_code VARCHAR(10),
      common_name VARCHAR(255)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS protein_aliases (
      id SERIAL PRIMARY KEY,
      protein_id INTEGER REFERENCES proteins(id) ON DELETE CASCADE,
      alias_name VARCHAR(255) NOT NULL,
      alias_type VARCHAR(50) NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS interactions (
      id SERIAL PRIMARY KEY,
      bait_protein_id INTEGER REFERENCES proteins(id) ON DELETE CASCADE,
      prey_protein_id INTEGER REFERENCES proteins(id) ON DELETE CASCADE,
      confidence VARCHAR(50),
      iptm REAL,
      interface_plddt REAL,
      contacts_pae_lt_3 INTEGER,
      contacts_pae_lt_6 INTEGER,
      ipsae REAL,
      ipsae_confidence VARCHAR(50),
      analysis_version VARCHAR(10),
      alphafold_version VARCHAR(10),
      source_path TEXT,
      experimental_validation JSONB
    );
  `;
  console.log('  ✅ Tables ready\n');
}

/**
 * Check which baits already have interactions in the database
 * Returns a Set of UniProt IDs that should be skipped
 */
async function getExistingBaits() {
  const result = await sql`
    SELECT DISTINCT p.uniprot_id, COUNT(i.id) as interaction_count
    FROM proteins p
    JOIN interactions i ON p.id = i.bait_protein_id
    GROUP BY p.uniprot_id
  `;

  const existingBaits = new Map();
  result.rows.forEach(row => {
    existingBaits.set(row.uniprot_id, parseInt(row.interaction_count));
  });

  return existingBaits;
}

function extractBaitFromFilePath(filePath) {
  const parts = filePath.split('/');
  const folderName = parts[parts.length - 3]; // e.g., "Q8NEZ3_IFT144"
  const baitUniprot = folderName.split('_')[0]; // e.g., "Q8NEZ3"
  return baitUniprot;
}

async function importFromV4Files() {
  const proteinCache = new Map();
  const allInteractions = [];
  let filesProcessed = 0;
  let filesSkipped = 0;

  // Get list of baits that already have data
  console.log('🔍 Checking for existing data in database...\n');
  const existingBaits = await getExistingBaits();

  if (existingBaits.size > 0) {
    console.log(`📊 Found ${existingBaits.size} baits with existing data:`);
    Array.from(existingBaits.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([uniprot, count]) => {
        console.log(`   ${uniprot}: ${count} interactions`);
      });
    console.log('');
  }

  console.log('📁 Processing v4.json files...\n');

  for (const filePath of V4_JSON_FILES) {
    try {
      // Extract bait UniProt ID from file path
      const baitUniprot = extractBaitFromFilePath(filePath);

      // Check if this bait already has data
      if (existingBaits.has(baitUniprot)) {
        console.log(`  ⏭️  SKIP: ${baitUniprot} (already has ${existingBaits.get(baitUniprot)} interactions)`);
        filesSkipped++;
        continue;
      }

      if (!existsSync(filePath)) {
        console.log(`  ⚠️  File not found: ${filePath}`);
        filesSkipped++;
        continue;
      }

      const jsonData = JSON.parse(readFileSync(filePath, 'utf8'));
      console.log(`  📄 Processing: ${baitUniprot} - ${jsonData.interactions?.length || 0} interactions`);

      if (jsonData.interactions && Array.isArray(jsonData.interactions)) {
        for (const interaction of jsonData.interactions) {
          const bait = interaction.protein_1?.uniprot_id;
          const prey = interaction.protein_2?.uniprot_id;

          if (!bait || !prey) continue;

          // Cache proteins
          if (!proteinCache.has(bait)) {
            proteinCache.set(bait, { uniprot_id: bait });
          }
          if (!proteinCache.has(prey)) {
            proteinCache.set(prey, { uniprot_id: prey });
          }

          // Store interaction
          allInteractions.push({
            bait_uniprot: bait,
            prey_uniprot: prey,
            confidence: interaction.quality_assessment?.quality_class || null,
            iptm: parseFloat(interaction.quality_assessment?.iptm) || null,
            interface_plddt: parseFloat(interaction.quality_assessment?.interface_plddt) || null,
            contacts_pae_lt_3: parseInt(interaction.quality_assessment?.contacts_pae_lt_3) || null,
            contacts_pae_lt_6: parseInt(interaction.quality_assessment?.contacts_pae_lt_6) || null,
            ipsae: parseFloat(interaction.quality_assessment?.ipsae) || null,
            ipsae_confidence: interaction.quality_assessment?.ipsae_confidence || null,
            analysis_version: 'v4',
            alphafold_version: 'AF3',
            source_path: filePath
          });
        }
      }

      filesProcessed++;
    } catch (error) {
      console.log(`  ❌ Error processing ${filePath}:`, error.message);
      filesSkipped++;
    }
  }

  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Processed: ${filesProcessed} files`);
  console.log(`   ⏭️  Skipped: ${filesSkipped} files (already in database)`);
  console.log(`   🔗 New interactions: ${allInteractions.length}`);
  console.log(`   👥 New proteins: ${proteinCache.size}\n`);

  return { proteins: Array.from(proteinCache.values()), interactions: allInteractions };
}

async function insertData(proteins, interactions) {
  if (proteins.length === 0 && interactions.length === 0) {
    console.log('ℹ️  No new data to insert - all baits already in database\n');
    return;
  }

  const proteinIdMap = new Map();

  console.log('👥 Inserting proteins...');
  for (const protein of proteins) {
    const result = await sql`
      INSERT INTO proteins (uniprot_id, gene_name, organism, organism_code)
      VALUES (${protein.uniprot_id}, ${null}, ${'Homo sapiens'}, ${'Hs'})
      ON CONFLICT (uniprot_id) DO UPDATE SET gene_name = EXCLUDED.gene_name
      RETURNING id;
    `;
    proteinIdMap.set(protein.uniprot_id, result.rows[0].id);
  }
  console.log(`  ✅ Inserted/updated ${proteins.length} proteins\n`);

  console.log('🔗 Inserting interactions...');
  let count = 0;
  for (const inter of interactions) {
    const baitId = proteinIdMap.get(inter.bait_uniprot);
    const preyId = proteinIdMap.get(inter.prey_uniprot);

    if (baitId && preyId) {
      await sql`
        INSERT INTO interactions (
          bait_protein_id, prey_protein_id, confidence, iptm, interface_plddt,
          contacts_pae_lt_3, contacts_pae_lt_6, ipsae, ipsae_confidence,
          analysis_version, alphafold_version, source_path
        ) VALUES (
          ${baitId}, ${preyId}, ${inter.confidence}, ${inter.iptm}, ${inter.interface_plddt},
          ${inter.contacts_pae_lt_3}, ${inter.contacts_pae_lt_6}, ${inter.ipsae}, ${inter.ipsae_confidence},
          ${inter.analysis_version}, ${inter.alphafold_version}, ${inter.source_path}
        );
      `;
      count++;
    }
  }
  console.log(`  ✅ Inserted ${count} interactions\n`);
}

async function main() {
  if (!POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable is not set.');
    process.exit(1);
  }

  console.log('🚀 INCREMENTAL IFT/BBSome database import from v4.json files\n');
  console.log('   Only NEW baits will be imported (existing data preserved)\n');
  console.log('=' .repeat(70) + '\n');

  try {
    await createTables();
    const { proteins, interactions } = await importFromV4Files();
    await insertData(proteins, interactions);

    console.log('=' .repeat(70));
    console.log('🎉 Import complete!\n');
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();
