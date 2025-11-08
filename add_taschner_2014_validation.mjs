#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

// UniProt IDs
const UNIPROT = {
  IFT52: "Q9Y366",
  IFT74: "Q96LB3"
};

const TASCHNER_2014_VALIDATION = {
  bait_uniprot: UNIPROT.IFT52,
  prey_uniprot: UNIPROT.IFT74,
  validation: {
    experimental_methods: [{
      method: "Pulldown/Co-purification",
      study: "Taschner et al., 2014",
      pmid: "",
      confidence: "high",
      notes: "IFT52C/46C heterodimer binds IFT81/74 subcomplex"
    }],
    validation_summary: {
      is_validated: true,
      validation_count: 1,
      strongest_method: "Pulldown/Co-purification",
      consensus_confidence: "high"
    }
  }
};

async function addValidation() {
  console.log('Adding Taschner et al., 2014 validation...\n');

  const {bait_uniprot, prey_uniprot, validation} = TASCHNER_2014_VALIDATION;

  try {
    const result = await sql`
      SELECT i.id, i.experimental_validation,
             b.gene_name as bait, p.gene_name as prey
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE (b.uniprot_id = ${bait_uniprot} AND p.uniprot_id = ${prey_uniprot})
         OR (b.uniprot_id = ${prey_uniprot} AND p.uniprot_id = ${bait_uniprot})
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      console.log(`⚠️  Not found: IFT52 ↔ IFT74`);
      process.exit(1);
    }

    const row = result.rows[0];

    if (row.experimental_validation) {
      console.log(`💡 Already has validation: ${row.bait} ↔ ${row.prey}`);
      process.exit(0);
    }

    await sql`
      UPDATE interactions
      SET experimental_validation = ${JSON.stringify(validation)}
      WHERE id = ${row.id}
    `;

    console.log(`✅ ${row.bait} ↔ ${row.prey} - Pulldown/Co-purification`);
    console.log(`   Notes: IFT52C/46C heterodimer binds IFT81/74 subcomplex`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }

  process.exit(0);
}

addValidation();
