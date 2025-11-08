#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

// IFT27 ↔ IFT25 from Bhogaraju et al., 2011
const baitUniprot = "Q9BW83";  // IFT27
const preyUniprot = "Q9Y547";  // IFT25

const validationData = {
  experimental_methods: [
    {
      method: "Crystal structure",
      study: "Bhogaraju et al., 2011",
      pmid: "",
      confidence: "high",
      notes: "Chlamydomonas IFT27/25 structure"
    }
  ],
  validation_summary: {
    is_validated: true,
    validation_count: 1,
    strongest_method: "Crystal structure",
    consensus_confidence: "high"
  }
};

async function addValidation() {
  try {
    // Find interaction
    const result = await sql`
      SELECT i.id, b.gene_name as bait, p.gene_name as prey
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE (b.uniprot_id = ${baitUniprot} AND p.uniprot_id = ${preyUniprot})
         OR (b.uniprot_id = ${preyUniprot} AND p.uniprot_id = ${baitUniprot})
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      console.log('❌ IFT27-IFT25 interaction not found in database');
      process.exit(1);
    }

    const row = result.rows[0];
    console.log(`Found: ${row.bait} ↔ ${row.prey} (ID: ${row.id})`);

    // Update
    await sql`
      UPDATE interactions
      SET experimental_validation = ${JSON.stringify(validationData)}
      WHERE id = ${row.id}
    `;

    console.log('✅ Added validation data');
    console.log('\nHover will show:');
    console.log('  Method: Crystal structure');
    console.log('  Study: Bhogaraju et al., 2011');
    console.log('  PMID: (blank)');
    console.log('  Confidence: high');
    console.log('  Notes: Chlamydomonas IFT27/25 structure');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  process.exit(0);
}

addValidation();
