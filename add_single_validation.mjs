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
      pmid: "21505417",
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
      SELECT i.id, i.experimental_validation, b.gene_name as bait, p.gene_name as prey
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
    const newMethod = validationData.experimental_methods[0];
    const alreadyExists = existingValidation.experimental_methods.some(
      m => m.study === newMethod.study && m.method === newMethod.method
    );

    if (alreadyExists) {
      console.log(`💡 Already has this validation: ${row.bait} ↔ ${row.prey} (${newMethod.study})`);
      process.exit(0);
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

    // Update
    await sql`
      UPDATE interactions
      SET experimental_validation = ${JSON.stringify(existingValidation)}
      WHERE id = ${row.id}
    `;

    console.log('✅ Added validation data');
    console.log(`   Total validations for this interaction: ${existingValidation.validation_summary.validation_count}`);
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
