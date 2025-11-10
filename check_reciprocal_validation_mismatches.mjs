import { sql } from '@vercel/postgres';

async function checkReciprocals() {
  console.log('🔍 Investigating reciprocal validation mismatches...\n');

  // Find all reciprocal pairs with mismatched validations
  const mismatches = await sql`
    SELECT
      b1.gene_name as bait1,
      p1.gene_name as prey1,
      b1.uniprot_id as bait1_uniprot,
      p1.uniprot_id as prey1_uniprot,
      i1.id as interaction1_id,
      i2.id as interaction2_id,
      i1.experimental_validation as val1,
      i2.experimental_validation as val2,
      CASE
        WHEN i1.experimental_validation IS NULL THEN 0
        ELSE jsonb_array_length(i1.experimental_validation->'experimental_methods')
      END as val1_count,
      CASE
        WHEN i2.experimental_validation IS NULL THEN 0
        ELSE jsonb_array_length(i2.experimental_validation->'experimental_methods')
      END as val2_count
    FROM interactions i1
    JOIN proteins b1 ON i1.bait_protein_id = b1.id
    JOIN proteins p1 ON i1.prey_protein_id = p1.id
    JOIN interactions i2 ON
      i1.bait_protein_id = i2.prey_protein_id
      AND i1.prey_protein_id = i2.bait_protein_id
    JOIN proteins b2 ON i2.bait_protein_id = b2.id
    JOIN proteins p2 ON i2.prey_protein_id = p2.id
    WHERE (i1.experimental_validation IS NOT NULL AND i2.experimental_validation IS NULL)
       OR (i1.experimental_validation IS NULL AND i2.experimental_validation IS NOT NULL)
       OR (
         i1.experimental_validation IS NOT NULL
         AND i2.experimental_validation IS NOT NULL
         AND jsonb_array_length(i1.experimental_validation->'experimental_methods')
           != jsonb_array_length(i2.experimental_validation->'experimental_methods')
       )
    ORDER BY b1.gene_name, p1.gene_name
  `;

  console.log(`Found ${mismatches.rows.length} reciprocal pairs with mismatched validations:\n`);

  mismatches.rows.forEach((row, idx) => {
    console.log(`${idx + 1}. ${row.bait1} ↔ ${row.prey1}`);
    console.log(`   ${row.bait1}→${row.prey1}: ${row.val1_count} validations (ID: ${row.interaction1_id})`);
    if (row.val1 && row.val1_count > 0) {
      row.val1.experimental_methods.forEach(m => {
        console.log(`     - ${m.study}: ${m.method}`);
      });
    }
    console.log(`   ${row.prey1}→${row.bait1}: ${row.val2_count} validations (ID: ${row.interaction2_id})`);
    if (row.val2 && row.val2_count > 0) {
      row.val2.experimental_methods.forEach(m => {
        console.log(`     - ${m.study}: ${m.method}`);
      });
    }
    console.log('');
  });

  // Summary statistics
  const stats = await sql`
    SELECT
      COUNT(DISTINCT i1.id) as total_interactions_with_validation,
      COUNT(DISTINCT CASE
        WHEN i2.id IS NOT NULL THEN i1.id
      END) as has_reciprocal,
      COUNT(DISTINCT CASE
        WHEN i2.experimental_validation IS NULL AND i1.experimental_validation IS NOT NULL
        THEN i1.id
      END) as missing_reciprocal_validation
    FROM interactions i1
    LEFT JOIN interactions i2 ON
      i1.bait_protein_id = i2.prey_protein_id
      AND i1.prey_protein_id = i2.bait_protein_id
    WHERE i1.experimental_validation IS NOT NULL
  `;

  console.log('\n📊 Summary Statistics:');
  console.log(`  Total interactions with validation: ${stats.rows[0].total_interactions_with_validation}`);
  console.log(`  Have reciprocal interaction: ${stats.rows[0].has_reciprocal}`);
  console.log(`  Reciprocal missing validation: ${stats.rows[0].missing_reciprocal_validation}`);
  console.log(`  Reciprocal pairs with mismatches: ${mismatches.rows.length}`);

  process.exit(0);
}

checkReciprocals().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
