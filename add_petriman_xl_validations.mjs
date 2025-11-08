#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

// UniProt IDs
const UNIPROT = {
  IFT88: "Q13099",
  IFT81: "Q8WYA0",
  IFT74: "Q96LB3",
  IFT70: "Q86WT1",
  IFT57: "Q9NWB7",
  IFT38: "Q96AJ1"
};

const PETRIMAN_XL_VALIDATIONS = [
  {
    bait_uniprot: UNIPROT.IFT88,
    prey_uniprot: UNIPROT.IFT70,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: ""
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT88,
    prey_uniprot: UNIPROT.IFT81,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "Binds IFT74/81 complex"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT88,
    prey_uniprot: UNIPROT.IFT74,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "Binds IFT74/81 complex"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT70,
    prey_uniprot: UNIPROT.IFT81,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "Binds IFT74/81 complex"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT70,
    prey_uniprot: UNIPROT.IFT74,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "Binds IFT74/81 complex"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT88,
    prey_uniprot: UNIPROT.IFT57,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: ""
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT88,
    prey_uniprot: UNIPROT.IFT38,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: ""
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  }
];

async function addValidations() {
  let added = 0;
  let notFound = 0;
  let hasValidation = 0;

  console.log('Adding Petriman et al., 2022 XL-MS validations...\n');

  for (const {bait_uniprot, prey_uniprot, validation} of PETRIMAN_XL_VALIDATIONS) {
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
        console.log(`⚠️  Not found: ${bait_uniprot} ↔ ${prey_uniprot}`);
        notFound++;
        continue;
      }

      const row = result.rows[0];

      if (row.experimental_validation) {
        console.log(`💡 Already has validation: ${row.bait} ↔ ${row.prey}`);
        hasValidation++;
        continue;
      }

      await sql`
        UPDATE interactions
        SET experimental_validation = ${JSON.stringify(validation)}
        WHERE id = ${row.id}
      `;

      const method = validation.experimental_methods[0];
      const notes = method.notes ? ` (${method.notes})` : '';
      console.log(`✅ ${row.bait} ↔ ${row.prey} - XL-MS${notes}`);
      added++;

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Added: ${added}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`💡 Already validated: ${hasValidation}`);
  console.log(`\nTotal processed: ${PETRIMAN_XL_VALIDATIONS.length}`);

  process.exit(0);
}

addValidations();
