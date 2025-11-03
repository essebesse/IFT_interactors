#!/usr/bin/env node

import { sql } from '@vercel/postgres';

/**
 * Remove duplicate interactions from the database
 * Keeps the first occurrence of each unique interaction
 */

async function deduplicateInteractions() {
  console.log('🔍 Starting deduplication process...\n');

  try {
    // Step 1: Count current state
    const totalResult = await sql`SELECT COUNT(*) as count FROM interactions`;
    const totalBefore = parseInt(totalResult.rows[0].count);
    console.log(`Total interactions before: ${totalBefore}`);

    // Step 2: Count duplicates
    const dupResult = await sql`
      SELECT COUNT(*) as count FROM (
        SELECT bait_protein_id, prey_protein_id, ipsae
        FROM interactions
        GROUP BY bait_protein_id, prey_protein_id, ipsae
        HAVING COUNT(*) > 1
      ) as dups
    `;
    const duplicatedCount = parseInt(dupResult.rows[0].count);
    console.log(`Duplicated interactions: ${duplicatedCount}`);

    if (duplicatedCount === 0) {
      console.log('\n✅ No duplicates found! Database is clean.');
      return;
    }

    // Step 3: Delete duplicates, keeping the one with the lowest ID (first imported)
    const deleteResult = await sql`
      DELETE FROM interactions
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
                 ROW_NUMBER() OVER (
                   PARTITION BY bait_protein_id, prey_protein_id, ipsae, iptm
                   ORDER BY id
                 ) AS rn
          FROM interactions
        ) t
        WHERE t.rn > 1
      )
    `;

    const deletedCount = deleteResult.rowCount;
    console.log(`\n🗑️  Deleted ${deletedCount} duplicate rows`);

    // Step 4: Verify final state
    const totalAfter = await sql`SELECT COUNT(*) as count FROM interactions`;
    const finalCount = parseInt(totalAfter.rows[0].count);
    console.log(`\n✅ Total interactions after: ${finalCount}`);
    console.log(`   Removed: ${totalBefore - finalCount} duplicates`);

    // Step 5: Verify no duplicates remain
    const verifyResult = await sql`
      SELECT COUNT(*) as count FROM (
        SELECT bait_protein_id, prey_protein_id, ipsae
        FROM interactions
        GROUP BY bait_protein_id, prey_protein_id, ipsae
        HAVING COUNT(*) > 1
      ) as dups
    `;
    const remainingDups = parseInt(verifyResult.rows[0].count);

    if (remainingDups === 0) {
      console.log('\n✅ SUCCESS: All duplicates removed! Database is clean.');
    } else {
      console.log(`\n⚠️  WARNING: ${remainingDups} duplicates still remain.`);
    }

  } catch (error) {
    console.error('❌ Error during deduplication:', error);
    throw error;
  }
}

// Run deduplication
deduplicateInteractions()
  .then(() => {
    console.log('\n✅ Deduplication complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Deduplication failed:', error);
    process.exit(1);
  });
