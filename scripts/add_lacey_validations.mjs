#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const lacey_crosslinks = [
  { cr_prot1: 'A8JFR3', cr_prot2: 'H9CTG6', hs_gene1: 'WDR35', hs_gene2: 'IFT122', cr_name1: 'IFT121', cr_name2: 'IFT122' },
  { cr_prot1: 'A0A2K3CP46', cr_prot2: 'A5Z0S9', hs_gene1: 'IFT172', hs_gene2: 'IFT80', cr_name1: 'IFT172', cr_name2: 'IFT80' },
  { cr_prot1: 'A0A2K3CQB1', cr_prot2: 'A0A2K3DCC1', hs_gene1: 'CLUAP1', hs_gene2: 'IFT57', cr_name1: 'IFT38/CLUAP1', cr_name2: 'IFT57' },
  { cr_prot1: 'A0A2K3E6H6', cr_prot2: 'A0A2K3CQG9', hs_gene1: 'IFT74', hs_gene2: 'IFT81', cr_name1: 'IFT74', cr_name2: 'IFT81' },
  { cr_prot1: 'A0A2K3E6H6', cr_prot2: 'A0A2K3DSI4', hs_gene1: 'IFT74', hs_gene2: 'IFT46', cr_name1: 'IFT74', cr_name2: 'IFT46' },
  { cr_prot1: 'A0A2K3E6H6', cr_prot2: 'A0A2K3E7V0', hs_gene1: 'IFT74', hs_gene2: 'IFT27', cr_name1: 'IFT74', cr_name2: 'IFT27' },
  { cr_prot1: 'A0A2K3CXC4', cr_prot2: 'H9CTG6', hs_gene1: 'DRC7', hs_gene2: 'IFT122', cr_name1: 'DRC7', cr_name2: 'IFT122' },
  { cr_prot1: 'A0A2K3DN83', cr_prot2: 'A8JCJ2', hs_gene1: 'TTC21', hs_gene2: 'IFT88', cr_name1: 'TTC21/IFT139', cr_name2: 'IFT88' }
];

async function addLaceyValidations() {
  console.log('Checking 8 Lacey cross-links against database...\n');

  let found = 0;
  let notFound = 0;
  let updated = 0;

  for (const link of lacey_crosslinks) {
    const { hs_gene1, hs_gene2, cr_prot1, cr_prot2, cr_name1, cr_name2 } = link;

    // Check if interaction exists (bidirectional)
    const result = await sql`
      SELECT i.id, i.experimental_validation,
             b.gene_name as bait, p.gene_name as prey,
             b.uniprot_id as bait_id, p.uniprot_id as prey_id,
             i.ipsae, i.ipsae_confidence
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE (b.gene_name = ${hs_gene1} AND p.gene_name = ${hs_gene2})
         OR (b.gene_name = ${hs_gene2} AND p.gene_name = ${hs_gene1})
    `;

    if (result.rows.length === 0) {
      console.log(`❌ NOT FOUND: ${cr_name1} ↔ ${cr_name2} (${hs_gene1} ↔ ${hs_gene2})`);
      notFound++;
      continue;
    }

    found++;
    console.log(`✅ FOUND: ${cr_name1} ↔ ${cr_name2}`);

    for (const row of result.rows) {
      const validationData = {
        method: 'XL-MS',
        study: 'Lacey et al., 2024',
        pmid: '39127041',
        doi: '10.1016/j.cell.2024.07.024',
        confidence: 'high',
        bait_protein: cr_name1,
        notes: `Cross-linking mass spectrometry (XL-MS) of retrograde IFT trains in Chlamydomonas reinhardtii. Cr-${cr_name1} (${cr_prot1}) ↔ Cr-${cr_name2} (${cr_prot2}) cross-link. Direct physical contact (~20-30Å). Confidence: high (in situ XL-MS).`
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

      const alreadyExists = existingValidation.experimental_methods.some(m => m.pmid === '39127041');

      if (alreadyExists) {
        console.log(`   Already validated: ${row.bait} ↔ ${row.prey}`);
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

      console.log(`   ✅ Updated: ${row.bait} (${row.bait_id}) ↔ ${row.prey} (${row.prey_id}), ipSAE=${row.ipsae.toFixed(3)}, ${row.ipsae_confidence}`);
      console.log(`   Validation count: ${existingValidation.validation_summary.validation_count}`);
      updated++;
    }
    console.log();
  }

  console.log('='.repeat(70));
  console.log('Summary:');
  console.log(`  ✅ Found in database: ${found}`);
  console.log(`  ❌ Not found: ${notFound}`);
  console.log(`  📝 Updated: ${updated}`);
  console.log('='.repeat(70));
}

addLaceyValidations().catch(console.error);
