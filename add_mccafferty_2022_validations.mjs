#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

// UniProt IDs for human IFT-A proteins
const UNIPROT = {
  IFT144: "Q8NEZ3", // WDR19
  IFT140: "Q96RY7",
  IFT139: "Q7Z4L5", // TTC21B
  IFT122: "Q9HBG6",
  IFT121: "Q9P2L0", // WDR35
  IFT43: "Q96FT9"
};

const MCCAFFERTY_2022_VALIDATIONS = [
  {
    bait_uniprot: UNIPROT.IFT121,
    prey_uniprot: UNIPROT.IFT122,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "McCafferty et al., 2022",
        pmid: "36346217",
        confidence: "high",
        notes: "DSSO crosslinking; Tetrahymena IFT-A"
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
    bait_uniprot: UNIPROT.IFT121,
    prey_uniprot: UNIPROT.IFT139,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "McCafferty et al., 2022",
        pmid: "36346217",
        confidence: "high",
        notes: "DSSO crosslinking; Tetrahymena IFT-A"
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
    bait_uniprot: UNIPROT.IFT121,
    prey_uniprot: UNIPROT.IFT43,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "McCafferty et al., 2022",
        pmid: "36346217",
        confidence: "high",
        notes: "DSSO crosslinking; Tetrahymena IFT-A"
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
    bait_uniprot: UNIPROT.IFT122,
    prey_uniprot: UNIPROT.IFT140,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "McCafferty et al., 2022",
        pmid: "36346217",
        confidence: "high",
        notes: "DSSO crosslinking; Tetrahymena IFT-A"
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
    bait_uniprot: UNIPROT.IFT122,
    prey_uniprot: UNIPROT.IFT144,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "McCafferty et al., 2022",
        pmid: "36346217",
        confidence: "high",
        notes: "DSSO crosslinking; Tetrahymena IFT-A"
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
    bait_uniprot: UNIPROT.IFT140,
    prey_uniprot: UNIPROT.IFT144,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "McCafferty et al., 2022",
        pmid: "36346217",
        confidence: "high",
        notes: "DSSO crosslinking; Tetrahymena IFT-A"
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

  console.log('Adding McCafferty et al., eLife 2022 IFT-A XL-MS validations...\n');
  console.log('(DSSO crosslinking mass spectrometry on Tetrahymena IFT-A)\n');
  console.log('Integrative modeling combining XL-MS + cryo-ET + AlphaFold2\n');

  for (const {bait_uniprot, prey_uniprot, validation} of MCCAFFERTY_2022_VALIDATIONS) {
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

      // Get existing validation or create new structure
      const existingValidation = row.experimental_validation || {
        experimental_methods: [],
        validation_summary: {
          is_validated: false,
          validation_count: 0,
          strongest_method: null,
          consensus_confidence: null
        }
      };

      // Check if this specific study+method already exists
      const newMethod = validation.experimental_methods[0];
      const alreadyExists = existingValidation.experimental_methods.some(
        m => m.study === newMethod.study && m.method === newMethod.method
      );

      if (alreadyExists) {
        console.log(`💡 Already has this validation: ${row.bait} ↔ ${row.prey} (${newMethod.study})`);
        hasValidation++;
        continue;
      }

      // Append new validation to existing methods
      existingValidation.experimental_methods.push(newMethod);
      existingValidation.validation_summary.is_validated = true;
      existingValidation.validation_summary.validation_count = existingValidation.experimental_methods.length;

      // Recalculate strongest method
      const confidenceRanking = { high: 3, medium: 2, low: 1 };
      let strongestMethod = existingValidation.experimental_methods[0];
      for (const method of existingValidation.experimental_methods) {
        if (confidenceRanking[method.confidence] > confidenceRanking[strongestMethod.confidence]) {
          strongestMethod = method;
        }
      }
      existingValidation.validation_summary.strongest_method = strongestMethod.method;
      existingValidation.validation_summary.consensus_confidence = strongestMethod.confidence;

      await sql`
        UPDATE interactions
        SET experimental_validation = ${JSON.stringify(existingValidation)}
        WHERE id = ${row.id}
      `;

      console.log(`✅ Added: ${row.bait} ↔ ${row.prey} - ${validation.experimental_methods[0].method}`);
      added++;

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Added: ${added}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`💡 Already validated: ${hasValidation}`);
  console.log(`\nTotal processed: ${MCCAFFERTY_2022_VALIDATIONS.length}`);

  process.exit(0);
}

addValidations();
