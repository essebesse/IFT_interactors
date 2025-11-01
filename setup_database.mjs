
import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';

const POSTGRES_URL = process.env.POSTGRES_URL;

async function createTables() {
  console.log('Creating tables...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS proteins (
        id SERIAL PRIMARY KEY,
        uniprot_id VARCHAR(255) UNIQUE NOT NULL,
        gene_name VARCHAR(255),
        organism VARCHAR(255),
        organism_code VARCHAR(10)
      );
    `;
    console.log('  ✅ "proteins" table created or already exists.');

    await sql`
      CREATE TABLE IF NOT EXISTS protein_aliases (
        id SERIAL PRIMARY KEY,
        protein_id INTEGER REFERENCES proteins(id) ON DELETE CASCADE,
        alias_name VARCHAR(255) NOT NULL,
        alias_type VARCHAR(50) NOT NULL
      );
    `;
    console.log('  ✅ "protein_aliases" table created or already exists.');

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
    console.log('  ✅ "interactions" table created or already exists.');
    console.log('All tables created successfully.\n');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

async function insertData() {
  console.log('Reading interaction data from ift_bbsome_extraction_20251031_131653.json...');
  const interactions = JSON.parse(readFileSync('ift_bbsome_extraction_20251031_131653.json', 'utf-8'));
  console.log(`Found ${interactions.length} interactions to process.\n`);

  const proteinCache = new Map();

  // First pass: insert all unique proteins
  console.log('Step 1: Inserting all unique proteins...');
  for (const inter of interactions) {
    // Process bait protein
    if (inter.bait_uniprot && !proteinCache.has(inter.bait_uniprot)) {
      const result = await sql`
        INSERT INTO proteins (uniprot_id, gene_name, organism, organism_code)
        VALUES (${inter.bait_uniprot}, ${inter.bait_gene}, ${inter.bait_organism}, ${inter.bait_organism_code})
        ON CONFLICT (uniprot_id) DO UPDATE SET gene_name = EXCLUDED.gene_name
        RETURNING id;
      `;
      proteinCache.set(inter.bait_uniprot, result.rows[0].id);
    }
    // Process prey protein
    if (inter.prey_uniprot && !proteinCache.has(inter.prey_uniprot)) {
      const result = await sql`
        INSERT INTO proteins (uniprot_id, gene_name, organism, organism_code)
        VALUES (${inter.prey_uniprot}, ${inter.prey_gene}, ${inter.prey_organism}, ${inter.prey_organism_code})
        ON CONFLICT (uniprot_id) DO UPDATE SET gene_name = EXCLUDED.gene_name
        RETURNING id;
      `;
      proteinCache.set(inter.prey_uniprot, result.rows[0].id);
    }
  }
  console.log(`  ✅ Inserted/updated ${proteinCache.size} unique proteins.\n`);

  // Second pass: insert all interactions
  console.log('Step 2: Inserting interactions...');
  let count = 0;
  for (const inter of interactions) {
    const baitId = proteinCache.get(inter.bait_uniprot);
    const preyId = proteinCache.get(inter.prey_uniprot);

    if (baitId && preyId) {
      await sql`
        INSERT INTO interactions (
          bait_protein_id, prey_protein_id, confidence, iptm, interface_plddt,
          contacts_pae_lt_3, contacts_pae_lt_6, ipsae, ipsae_confidence,
          analysis_version, alphafold_version, source_path, experimental_validation
        ) VALUES (
          ${baitId}, ${preyId}, ${inter.confidence}, ${inter.iptm}, ${inter.interface_plddt},
          ${inter.contacts_pae_lt_3}, ${inter.contacts_pae_lt_6}, ${inter.ipsae}, ${inter.ipsae_confidence},
          ${inter.analysis_version}, ${inter.alphafold_version}, ${inter.source_path},
          ${inter.experimental_validation ? JSON.stringify(inter.experimental_validation) : null}
        );
      `;
      count++;
    }
  }
  console.log(`  ✅ Inserted ${count} interactions.\n`);
  console.log('Database setup and data import complete!');
}

async function main() {
  if (!POSTGRES_URL) {
    console.error('POSTGRES_URL environment variable is not set.');
    process.exit(1);
  }
  console.log('Starting database setup...');
  try {
    await createTables();
    await insertData();
    console.log('\n🎉 Setup finished successfully!');
  } catch (e) {
    console.error('\n❌ An error occurred during database setup:');
    console.error(e);
    process.exit(1);
  }
}

main();
