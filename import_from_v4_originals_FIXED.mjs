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
  console.log('📊 Creating database tables...\n');

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
  console.log('  ✅ "proteins" table created');

  await sql`
    CREATE TABLE IF NOT EXISTS protein_aliases (
      id SERIAL PRIMARY KEY,
      protein_id INTEGER REFERENCES proteins(id) ON DELETE CASCADE,
      alias_name VARCHAR(255) NOT NULL,
      alias_type VARCHAR(50) NOT NULL
    );
  `;
  console.log('  ✅ "protein_aliases" table created');

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
  console.log('  ✅ "interactions" table created\n');
}

function extractBaitFromFilePath(filePath) {
  // Extract from path like /emcc/.../Q9Y547_IFT25/AF3/...
  const match = filePath.match(/\/([A-Z0-9]+_[A-Z0-9_]+)\//);
  if (match) {
    const fullName = match[1];
    // Extract UniProt ID (e.g., Q9Y547 from Q9Y547_IFT25)
    const uniprotMatch = fullName.match(/^([A-Z0-9]+)_/);
    if (uniprotMatch) {
      return { uniprot_id: uniprotMatch[1], full_name: fullName };
    }
  }
  return null;
}

function parseDirectoryName(dirName) {
  // Formats: "q9y547_and_q96gy0" or "q9y547_and_q96gy0_and_q8neq3"
  const parts = dirName.toLowerCase().split('_and_');
  return parts.map(p => p.trim().toUpperCase());
}

async function importFromV4Files() {
  const proteinCache = new Map();
  const allInteractions = [];
  let filesProcessed = 0;
  let filesSkipped = 0;

  console.log(`📁 Processing ${V4_JSON_FILES.length} v4.json files (single protein baits only)...\n`);

  for (const filePath of V4_JSON_FILES) {
    if (!existsSync(filePath)) {
      console.log(`  ⚠️  Skipping missing file: ${filePath}`);
      filesSkipped++;
      continue;
    }

    try {
      const baitInfo = extractBaitFromFilePath(filePath);
      if (!baitInfo) {
        console.log(`  ⚠️  Could not extract bait from: ${filePath}`);
        filesSkipped++;
        continue;
      }

      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      const predictions = data.filtered_predictions || [];

      console.log(`  📄 ${baitInfo.full_name}: ${predictions.length} interactions`);

      for (const pred of predictions) {
        const proteinIds = parseDirectoryName(pred.directory_name);

        if (proteinIds.length !== 2) continue; // Only pairwise interactions

        // Map confidence from ipsae_confidence_class to simplified form
        let confidence = null;
        if (pred.ipsae_confidence_class === 'High Confidence') confidence = 'High';
        else if (pred.ipsae_confidence_class === 'Medium Confidence') confidence = 'Medium';
        else if (pred.ipsae_confidence_class === 'Low/Ambiguous') confidence = 'Low';

        const interaction = {
          bait_uniprot: proteinIds[0],
          prey_uniprot: proteinIds[1],
          iptm: pred.iptm,
          interface_plddt: pred.mean_interface_plddt,
          contacts_pae_lt_3: pred.contacts_pae3 || 0,
          contacts_pae_lt_6: pred.contacts_pae6 || 0,
          ipsae: pred.ipsae,
          ipsae_confidence: confidence,
          analysis_version: 'v4',
          alphafold_version: 'AF3',
          source_path: filePath,
          confidence: confidence // Use ipsae confidence as main confidence
        };

        allInteractions.push(interaction);

        // Add proteins to cache
        [interaction.bait_uniprot, interaction.prey_uniprot].forEach(id => {
          if (!proteinCache.has(id)) {
            proteinCache.set(id, { uniprot_id: id });
          }
        });
      }

      filesProcessed++;
    } catch (error) {
      console.log(`  ❌ Error processing ${filePath}:`, error.message);
      filesSkipped++;
    }
  }

  console.log(`\n✅ Processed ${filesProcessed} files, skipped ${filesSkipped}`);
  console.log(`📊 Found ${allInteractions.length} total interactions`);
  console.log(`👥 Found ${proteinCache.size} unique proteins\n`);

  return { proteins: Array.from(proteinCache.values()), interactions: allInteractions };
}

async function insertData(proteins, interactions) {
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
  console.log(`  ✅ Inserted ${proteins.length} proteins\n`);

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

  console.log('🚀 Starting IFT/BBSome database import from original v4.json files\n');
  console.log('   (Single protein baits only - complexes excluded)\n');
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
