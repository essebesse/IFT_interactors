#!/usr/bin/env node
import { sql } from '@vercel/postgres';

async function addStructuralValidation() {
  const validationData = {
    method: 'Crystal structure',
    study: 'Bhogaraju et al., 2011',
    pmid: '',
    doi: '',
    confidence: 'high',
    bait_protein: 'IFT27',
    notes: 'Crystal structure of Chlamydomonas IFT27/25 complex. Direct structural evidence of interaction.'
  };

  const result = await sql`
    SELECT i.id, i.experimental_validation,
           b.gene_name as bait, p.gene_name as prey,
           b.uniprot_id as bait_id, p.uniprot_id as prey_id,
           i.ipsae, i.ipsae_confidence
    FROM interactions i
    JOIN proteins b ON i.bait_protein_id = b.id
    JOIN proteins p ON i.prey_protein_id = p.id
    WHERE (b.gene_name = 'IFT27' AND p.gene_name = 'IFT25')
       OR (b.gene_name = 'IFT25' AND p.gene_name = 'IFT27')
  `;

  if (result.rows.length === 0) {
    console.log('❌ IFT27-IFT25 interaction not found in database');
    return;
  }

  console.log(`✅ Found ${result.rows.length} IFT27-IFT25 interactions\n`);

  for (const row of result.rows) {
    const existingValidation = row.experimental_validation || {
      experimental_methods: [],
      validation_summary: {
        is_validated: false,
        validation_count: 0,
        strongest_method: null,
        consensus_confidence: null
      }
    };

    const alreadyExists = existingValidation.experimental_methods.some(m => m.study === 'Bhogaraju et al., 2011');

    if (alreadyExists) {
      console.log(`Already validated: ${row.bait} ↔ ${row.prey}`);
      continue;
    }

    existingValidation.experimental_methods.push(validationData);
    existingValidation.validation_summary.is_validated = true;
    existingValidation.validation_summary.validation_count = existingValidation.experimental_methods.length;

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

    console.log(`✅ Updated: ${row.bait} (${row.bait_id}) ↔ ${row.prey} (${row.prey_id}), ipSAE=${row.ipsae.toFixed(3)}, ${row.ipsae_confidence}`);
    console.log(`   Validation count: ${existingValidation.validation_summary.validation_count}`);
  }
}

addStructuralValidation().catch(console.error);
