#!/usr/bin/env node
import { sql } from '@vercel/postgres';

async function updateY2HConfidence() {
  console.log('Updating Y2H validations to medium confidence...\n');

  const y2h_studies = [
    'Zhao and Malicki, 2011',
    'Howard et al., 2013',
    'Fan et al., 2010',
    'Lucker et al., 2005',
    'Kobayashi et al., 2007',
    'Lucker et al., 2010',
    'Swiderski et al., 2014'
  ];

  let updated = 0;

  const result = await sql`
    SELECT i.id, i.experimental_validation,
           b.gene_name as bait, p.gene_name as prey
    FROM interactions i
    JOIN proteins b ON i.bait_protein_id = b.id
    JOIN proteins p ON i.prey_protein_id = p.id
    WHERE experimental_validation IS NOT NULL
  `;

  for (const row of result.rows) {
    const validation = row.experimental_validation;
    let modified = false;

    for (const method of validation.experimental_methods) {
      if (y2h_studies.includes(method.study) && method.confidence === 'high') {
        method.confidence = 'medium';
        modified = true;
      }
    }

    if (modified) {
      const confidenceRanking = { high: 3, medium: 2, low: 1 };
      let strongestMethod = validation.experimental_methods[0];
      for (const method of validation.experimental_methods) {
        if (confidenceRanking[method.confidence] > confidenceRanking[strongestMethod.confidence]) {
          strongestMethod = method;
        }
      }
      validation.validation_summary.strongest_method = strongestMethod.method;
      validation.validation_summary.consensus_confidence = strongestMethod.confidence;

      await sql`
        UPDATE interactions
        SET experimental_validation = ${JSON.stringify(validation)}
        WHERE id = ${row.id}
      `;

      console.log(`✅ Updated: ${row.bait} ↔ ${row.prey}: high → medium`);
      updated++;
    }
  }

  console.log(`\n✅ Total updated: ${updated}`);
}

updateY2HConfidence().catch(console.error);
