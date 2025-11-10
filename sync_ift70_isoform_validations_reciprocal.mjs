#!/usr/bin/env node
import { sql } from '@vercel/postgres';

/**
 * Sync validations from IFT70A-IFT52 to IFT70B-IFT52 (BOTH DIRECTIONS)
 *
 * IFT70 has two isoforms (IFT70A/TTC30A and IFT70B/TTC30B).
 * Experimental validations for IFT70-IFT52 don't distinguish between isoforms,
 * so both should have the same validations in BOTH directions.
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

async function syncIFT70ValidationsReciprocal() {
  console.log('🔄 Syncing IFT70 isoform validations (both directions)...\n');

  try {
    // 1. Get IFT70A-IFT52 validations (source) - both directions
    const ift70a_sources = await sql`
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
    `;

    if (ift70a_sources.rows.length === 0) {
      console.log('⚠️  No IFT70A-IFT52 validation found');
      process.exit(1);
    }

    console.log('📖 Source interactions (IFT70A):');
    for (const row of ift70a_sources.rows) {
      const val = row.experimental_validation;
      console.log(`   ${row.bait} ↔ ${row.prey}: ${val.experimental_methods.length} validations`);
    }

    // 2. Get IFT70B-IFT52 interactions (target) - both directions
    const ift70b_targets = await sql`
      SELECT
        i.id,
        i.experimental_validation,
        b.gene_name as bait,
        p.gene_name as prey,
        b.uniprot_id as bait_uniprot,
        p.uniprot_id as prey_uniprot
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE (b.uniprot_id = ${UNIPROT.IFT70B} AND p.uniprot_id = ${UNIPROT.IFT52})
         OR (b.uniprot_id = ${UNIPROT.IFT52} AND p.uniprot_id = ${UNIPROT.IFT70B})
    `;

    if (ift70b_targets.rows.length === 0) {
      console.log('\n⚠️  No IFT70B-IFT52 interactions found in database');
      process.exit(0);
    }

    console.log('\n📝 Target interactions (IFT70B):');
    for (const row of ift70b_targets.rows) {
      const val = row.experimental_validation;
      const count = val?.experimental_methods?.length || 0;
      console.log(`   ${row.bait} ↔ ${row.prey}: ${count} validations (current)`);
    }

    // 3. Update each IFT70B interaction
    let totalAdded = 0;

    for (const targetRow of ift70b_targets.rows) {
      // Find matching source (same direction)
      const sourceRow = ift70a_sources.rows.find(src => {
        // Match direction: if target is IFT70B→IFT52, find IFT70A→IFT52
        const targetIsForward = targetRow.bait_uniprot === UNIPROT.IFT70B;
        const sourceIsForward = src.bait === 'IFT70A';
        return targetIsForward === sourceIsForward;
      });

      if (!sourceRow) {
        console.log(`\n⚠️  No matching source for ${targetRow.bait} → ${targetRow.prey}`);
        continue;
      }

      const sourceValidation = sourceRow.experimental_validation;
      const existingValidation = targetRow.experimental_validation || {
        experimental_methods: [],
        validation_summary: {
          is_validated: false,
          validation_count: 0,
          strongest_method: null,
          consensus_confidence: null
        }
      };

      // Copy validations (avoid duplicates)
      let added = 0;
      const updatedMethods = [...existingValidation.experimental_methods];

      for (const method of sourceValidation.experimental_methods) {
        const exists = updatedMethods.some(m =>
          m.study === method.study && m.pmid === method.pmid
        );

        if (!exists) {
          updatedMethods.push({...method});
          added++;
        }
      }

      if (added > 0) {
        // Update validation summary
        const updatedValidation = {
          experimental_methods: updatedMethods,
          validation_summary: {
            is_validated: true,
            validation_count: updatedMethods.length,
            strongest_method: sourceValidation.validation_summary.strongest_method,
            consensus_confidence: sourceValidation.validation_summary.consensus_confidence
          }
        };

        // Update database
        await sql`
          UPDATE interactions
          SET experimental_validation = ${JSON.stringify(updatedValidation)}
          WHERE id = ${targetRow.id}
        `;

        console.log(`\n✅ ${targetRow.bait} ↔ ${targetRow.prey}: Added ${added} validations (now ${updatedMethods.length} total)`);
        totalAdded += added;
      } else {
        console.log(`\n   ${targetRow.bait} ↔ ${targetRow.prey}: Already complete ✓`);
      }
    }

    if (totalAdded === 0) {
      console.log('\n✅ All IFT70B-IFT52 interactions already have complete validations!');
      process.exit(0);
    }

    // 4. Final verification
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
      ORDER BY b.gene_name, p.gene_name
    `;

    console.log(`\n🔍 Final Verification:`);
    for (const row of verify.rows) {
      console.log(`   ${row.bait} ↔ ${row.prey}: ${row.method_count} validations ✅`);
    }

    console.log(`\n✅ Total: Added ${totalAdded} validations to IFT70B-IFT52 interactions`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncIFT70ValidationsReciprocal();
