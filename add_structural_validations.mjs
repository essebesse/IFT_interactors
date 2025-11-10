#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

const NEW_VALIDATIONS = [
  // Structural validations (high confidence)
  {
    bait_uniprot: "Q86WT1", // IFT70 (TTC30A)
    prey_uniprot: "Q9Y366", // IFT52
    validation: {
      experimental_methods: [{
        method: "Crystal structure",
        study: "Taschner et al., 2014",
        pmid: "25349261",
        confidence: "high",
        notes: ""
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Crystal structure",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: "Q9Y366", // IFT52
    prey_uniprot: "Q9NQC8", // IFT46
    validation: {
      experimental_methods: [{
        method: "Crystal structure",
        study: "Taschner et al., 2014",
        pmid: "25349261",
        confidence: "high",
        notes: "C-terminal domains"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Crystal structure",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: "Q96LB3", // IFT74
    prey_uniprot: "Q8WYA0", // IFT81
    validation: {
      experimental_methods: [{
        method: "Crystal structure",
        study: "Wachter et al., EMBO J 2019",
        pmid: "25349261",
        confidence: "high",
        notes: ""
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Crystal structure",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: "Q9H7X7", // IFT22
    prey_uniprot: "Q96LB3", // IFT74
    validation: {
      experimental_methods: [{
        method: "Crystal structure",
        study: "Wachter et al., EMBO J 2019",
        pmid: "25349261",
        confidence: "high",
        notes: "Binds IFT74/81 complex"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Crystal structure",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: "Q9H7X7", // IFT22
    prey_uniprot: "Q8WYA0", // IFT81
    validation: {
      experimental_methods: [{
        method: "Crystal structure",
        study: "Wachter et al., EMBO J 2019",
        pmid: "25349261",
        confidence: "high",
        notes: "Binds IFT74/81 complex"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Crystal structure",
        consensus_confidence: "high"
      }
    }
  },
  // Biochemical reconstitution (high confidence)
  {
    bait_uniprot: "Q86WT1", // IFT70 (TTC30A)
    prey_uniprot: "Q9Y366", // IFT52
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Taschner et al., 2011",
        pmid: "25349261",
        confidence: "high",
        notes: "N-terminal IFT70 (1-226) binds central IFT52 (281-381)"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: "Q9Y366", // IFT52
    prey_uniprot: "Q9NQC8", // IFT46
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Taschner et al., 2011",
        pmid: "25349261",
        confidence: "high",
        notes: "C-terminal domains interact (IFT52 359-454, IFT46 165-319)"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: "Q9BW83", // IFT27
    prey_uniprot: "Q96LB3", // IFT74
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Taschner et al., 2014",
        pmid: "25349261",
        confidence: "high",
        notes: "Binds IFT74/81 complex"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: "Q9BW83", // IFT27
    prey_uniprot: "Q8WYA0", // IFT81
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Taschner et al., 2014",
        pmid: "25349261",
        confidence: "high",
        notes: "Binds IFT74/81 complex"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: "Q9H7X7", // IFT22
    prey_uniprot: "Q96LB3", // IFT74
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Taschner et al., 2014",
        pmid: "25349261",
        confidence: "high",
        notes: "Binds IFT74/81 complex"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: "Q9H7X7", // IFT22
    prey_uniprot: "Q8WYA0", // IFT81
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Taschner et al., 2014",
        pmid: "25349261",
        confidence: "high",
        notes: "Binds IFT74/81 complex"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  }
];

async function addValidations() {
  let added = 0;
  let notFound = 0;
  let hasValidation = 0;

  console.log('Adding structural/biochemical validations...\n');
  console.log('(Crystal structures from Taschner 2014, Wachter 2019)');
  console.log('(Biochemical reconstitution from Taschner 2011, 2014)\n');

  for (const {bait_uniprot, prey_uniprot, validation} of NEW_VALIDATIONS) {
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

      // Check if this specific study already exists
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

      console.log(`✅ Added: ${row.bait} ↔ ${row.prey} - ${newMethod.method} (${newMethod.study})`);
      console.log(`   Total validations for this interaction: ${existingValidation.validation_summary.validation_count}`);
      added++;

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Added: ${added}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`💡 Already validated: ${hasValidation}`);
  console.log(`\nTotal processed: ${NEW_VALIDATIONS.length}`);

  process.exit(0);
}

addValidations();
