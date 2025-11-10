#!/usr/bin/env node
import { sql } from '@vercel/postgres';

/**
 * Sync validations from IFT70A-IFT52 to IFT70B-IFT52
 *
 * IFT70 has two isoforms (IFT70A/TTC30A and IFT70B/TTC30B).
 * Experimental validations for IFT70-IFT52 don't distinguish between isoforms,
 * so both should have the same validations.
 */

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

const UNIPROT = {
  IFT70A: "Q86WT1",  // TTC30A
  IFT70B: "Q8N4P2",  // TTC30B
  IFT52: "Q9Y366"
};

async function syncIFT70Validations() {
  console.log('🔄 Syncing IFT70 isoform validations...\n');

  try {
    // 1. Get IFT70A-IFT52 validations (source)
    const ift70a_ift52 = await sql`
      SELECT
        i.id,
        i.experimental_validation,
        b.gene_name as bait,
        p.gene_name as prey
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE ((b.uniprot_id = ${UNIPROT.IFT70A} AND p.uniprot_id = ${UNIPROT.IFT52})
         OR (b.uniprot_id = ${UNIPROT.IFT52} AND p.uniprot_id = ${UNIPROT.IFT70A}))
        AND i.experimental_validation IS NOT NULL
      LIMIT 1
    `;

    if (ift70a_ift52.rows.length === 0) {
      console.log('⚠️  No IFT70A-IFT52 validation found');
      process.exit(1);
    }

    const sourceValidation = ift70a_ift52.rows[0].experimental_validation;
    console.log(`📖 Source: ${ift70a_ift52.rows[0].bait} ↔ ${ift70a_ift52.rows[0].prey}`);
    console.log(`   Validations: ${sourceValidation.experimental_methods.length}`);
    sourceValidation.experimental_methods.forEach(m => {
      console.log(`   - ${m.study} (PMID: ${m.pmid})`);
    });

    // 2. Get IFT70B-IFT52 interaction (target)
    const ift70b_ift52 = await sql`
      SELECT
        i.id,
        i.experimental_validation,
        b.gene_name as bait,
        p.gene_name as prey
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE (b.uniprot_id = ${UNIPROT.IFT70B} AND p.uniprot_id = ${UNIPROT.IFT52})
         OR (b.uniprot_id = ${UNIPROT.IFT52} AND p.uniprot_id = ${UNIPROT.IFT70B})
      LIMIT 1
    `;

    if (ift70b_ift52.rows.length === 0) {
      console.log('\n⚠️  No IFT70B-IFT52 interaction found in database');
      console.log('   This interaction may not exist in AlphaPulldown predictions');
      process.exit(0);
    }

    const targetRow = ift70b_ift52.rows[0];
    console.log(`\n📝 Target: ${targetRow.bait} ↔ ${targetRow.prey}`);

    const existingValidation = targetRow.experimental_validation || {
      experimental_methods: [],
      validation_summary: {
        is_validated: false,
        validation_count: 0,
        strongest_method: null,
        consensus_confidence: null
      }
    };

    console.log(`   Current validations: ${existingValidation.experimental_methods.length}`);
    if (existingValidation.experimental_methods.length > 0) {
      existingValidation.experimental_methods.forEach(m => {
        console.log(`   - ${m.study} (PMID: ${m.pmid})`);
      });
    }

    // 3. Copy validations from IFT70A to IFT70B (avoid duplicates)
    let added = 0;
    const updatedMethods = [...existingValidation.experimental_methods];

    for (const method of sourceValidation.experimental_methods) {
      // Check if this validation already exists
      const exists = updatedMethods.some(m =>
        m.study === method.study && m.pmid === method.pmid
      );

      if (!exists) {
        updatedMethods.push({...method});
        added++;
      }
    }

    if (added === 0) {
      console.log('\n✅ IFT70B-IFT52 already has all validations!');
      process.exit(0);
    }

    // 4. Update validation summary
    const updatedValidation = {
      experimental_methods: updatedMethods,
      validation_summary: {
        is_validated: true,
        validation_count: updatedMethods.length,
        strongest_method: sourceValidation.validation_summary.strongest_method,
        consensus_confidence: sourceValidation.validation_summary.consensus_confidence
      }
    };

    // 5. Update database
    await sql`
      UPDATE interactions
      SET experimental_validation = ${JSON.stringify(updatedValidation)}
      WHERE id = ${targetRow.id}
    `;

    console.log(`\n✅ Added ${added} validations to IFT70B-IFT52`);
    console.log(`   Total validations: ${updatedMethods.length}`);

    // 6. Verify
    const verify = await sql`
      SELECT
        b.gene_name as bait,
        p.gene_name as prey,
        jsonb_array_length(i.experimental_validation->'experimental_methods') as method_count
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE (b.uniprot_id = ${UNIPROT.IFT70B} AND p.uniprot_id = ${UNIPROT.IFT52})
         OR (b.uniprot_id = ${UNIPROT.IFT52} AND p.uniprot_id = ${UNIPROT.IFT70B})
    `;

    console.log(`\n🔍 Verification:`);
    console.log(`   ${verify.rows[0].bait} ↔ ${verify.rows[0].prey}: ${verify.rows[0].method_count} validations ✅`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncIFT70Validations();
