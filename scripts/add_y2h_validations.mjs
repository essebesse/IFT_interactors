#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const y2h_validations = [
  { gene1: 'IFT70A', gene2: 'IFT52', study: 'Zhao and Malicki, 2011', method: 'Y2H' },
  { gene1: 'IFT70B', gene2: 'IFT52', study: 'Zhao and Malicki, 2011', method: 'Y2H' },
  { gene1: 'IFT70A', gene2: 'IFT52', study: 'Howard et al., 2013', method: 'Y2H' },
  { gene1: 'IFT70B', gene2: 'IFT52', study: 'Howard et al., 2013', method: 'Y2H' },
  { gene1: 'IFT70A', gene2: 'IFT46', study: 'Fan et al., 2010', method: 'Y2H' },
  { gene1: 'IFT70B', gene2: 'IFT46', study: 'Fan et al., 2010', method: 'Y2H' },
  { gene1: 'IFT81', gene2: 'IFT74', study: 'Lucker et al., 2005', method: 'Bacterial two-hybrid' },
  { gene1: 'IFT81', gene2: 'IFT74', study: 'Kobayashi et al., 2007', method: 'Y2H' },
  { gene1: 'IFT88', gene2: 'IFT52', study: 'Lucker et al., 2010', method: 'Y2H' },
  { gene1: 'IFT88', gene2: 'IFT46', study: 'Lucker et al., 2010', method: 'Y2H' },
  { gene1: 'IFT52', gene2: 'IFT46', study: 'Lucker et al., 2010', method: 'Y2H' },
  { gene1: 'IFT56', gene2: 'IFT46', study: 'Swiderski et al., 2014', method: 'Y2H' }
];

async function addY2HValidations() {
  console.log('Adding Y2H/Bacterial two-hybrid validations...\n');

  let found = 0;
  let notFound = 0;
  let updated = 0;
  let alreadyExists = 0;

  for (const validation of y2h_validations) {
    const { gene1, gene2, study, method } = validation;

    // Check if interaction exists (bidirectional)
    const result = await sql`
      SELECT i.id, i.experimental_validation,
             b.gene_name as bait, p.gene_name as prey,
             b.uniprot_id as bait_id, p.uniprot_id as prey_id,
             i.ipsae, i.ipsae_confidence
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE (b.gene_name = ${gene1} AND p.gene_name = ${gene2})
         OR (b.gene_name = ${gene2} AND p.gene_name = ${gene1})
    `;

    if (result.rows.length === 0) {
      console.log(`❌ NOT FOUND: ${gene1} ↔ ${gene2} (${study})`);
      notFound++;
      continue;
    }

    found++;

    for (const row of result.rows) {
      const validationData = {
        method: method,
        study: study,
        pmid: '',
        doi: '',
        confidence: 'high',
        bait_protein: gene1,
        notes: `${method} evidence of direct protein-protein interaction.`
      };

      const existingValidation = row.experimental_validation || {
        experimental_methods: [],
        validation_summary: {
          is_validated: false,
          validation_count: 0,
          strongest_method: null,
          consensus_confidence: null
        }
      };

      const exists = existingValidation.experimental_methods.some(m => m.study === study);

      if (exists) {
        console.log(`⏭️  Already validated: ${row.bait} ↔ ${row.prey} (${study})`);
        alreadyExists++;
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

      console.log(`✅ ${row.bait} (${row.bait_id}) ↔ ${row.prey} (${row.prey_id}), ipSAE=${row.ipsae.toFixed(3)} [${study}]`);
      console.log(`   Validation count: ${existingValidation.validation_summary.validation_count}`);
      updated++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('Summary:');
  console.log(`  ✅ Found in database: ${found}`);
  console.log(`  ❌ Not found: ${notFound}`);
  console.log(`  📝 Updated: ${updated}`);
  console.log(`  ⏭️  Already existed: ${alreadyExists}`);
  console.log('='.repeat(70));
}

addY2HValidations().catch(console.error);
