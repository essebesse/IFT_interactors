#!/usr/bin/env node
/**
 * Remove BBS10 and BBS12 from Database
 *
 * These are chaperonins (not structural BBSome components) and should be removed.
 * - BBS10 (Q8TAM1)
 * - BBS12 (Q6ZW61)
 *
 * This script:
 * 1. Shows what will be deleted (dry run)
 * 2. Removes all interactions where these proteins are baits
 * 3. Optionally removes the protein entries (if --remove-proteins flag is used)
 */

import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ POSTGRES_URL environment variable is not set.');
  process.exit(1);
}

const PROTEINS_TO_REMOVE = [
  { uniprot_id: 'Q8TAM1', gene_name: 'BBS10' },
  { uniprot_id: 'Q6ZW61', gene_name: 'BBS12' }
];

async function showImpact() {
  console.log('📊 Analyzing impact of removing BBS10 and BBS12...\n');

  for (const protein of PROTEINS_TO_REMOVE) {
    // Check if protein exists
    const proteinCheck = await sql`
      SELECT id, uniprot_id, gene_name
      FROM proteins
      WHERE uniprot_id = ${protein.uniprot_id}
    `;

    if (proteinCheck.rows.length === 0) {
      console.log(`  ℹ️  ${protein.gene_name} (${protein.uniprot_id}) - Not found in database`);
      continue;
    }

    const proteinId = proteinCheck.rows[0].id;

    // Count interactions where this is the bait
    const baitCount = await sql`
      SELECT COUNT(*) as count
      FROM interactions
      WHERE bait_protein_id = ${proteinId}
    `;

    // Count interactions where this is the prey
    const preyCount = await sql`
      SELECT COUNT(*) as count
      FROM interactions
      WHERE prey_protein_id = ${proteinId}
    `;

    console.log(`  🔍 ${protein.gene_name} (${protein.uniprot_id})`);
    console.log(`     - Interactions as bait: ${baitCount.rows[0].count}`);
    console.log(`     - Interactions as prey: ${preyCount.rows[0].count}`);
    console.log();
  }
}

async function removeInteractions(dryRun = true) {
  console.log(`${dryRun ? '🧪 DRY RUN - ' : '🗑️  '}Removing interactions...\n`);

  let totalRemoved = 0;

  for (const protein of PROTEINS_TO_REMOVE) {
    const proteinCheck = await sql`
      SELECT id, uniprot_id, gene_name
      FROM proteins
      WHERE uniprot_id = ${protein.uniprot_id}
    `;

    if (proteinCheck.rows.length === 0) {
      continue;
    }

    const proteinId = proteinCheck.rows[0].id;

    if (dryRun) {
      const count = await sql`
        SELECT COUNT(*) as count
        FROM interactions
        WHERE bait_protein_id = ${proteinId}
      `;
      console.log(`  Would remove ${count.rows[0].count} interactions for ${protein.gene_name}`);
      totalRemoved += parseInt(count.rows[0].count);
    } else {
      const result = await sql`
        DELETE FROM interactions
        WHERE bait_protein_id = ${proteinId}
      `;
      console.log(`  ✅ Removed ${result.rowCount} interactions for ${protein.gene_name}`);
      totalRemoved += result.rowCount;
    }
  }

  console.log();
  console.log(`${dryRun ? '  Would remove' : '  ✅ Removed'} ${totalRemoved} interactions total\n`);

  return totalRemoved;
}

async function removeProteins(dryRun = true) {
  console.log(`${dryRun ? '🧪 DRY RUN - ' : '🗑️  '}Removing protein entries...\n`);

  for (const protein of PROTEINS_TO_REMOVE) {
    if (dryRun) {
      const check = await sql`
        SELECT id FROM proteins WHERE uniprot_id = ${protein.uniprot_id}
      `;
      if (check.rows.length > 0) {
        console.log(`  Would remove protein: ${protein.gene_name} (${protein.uniprot_id})`);
      }
    } else {
      const result = await sql`
        DELETE FROM proteins WHERE uniprot_id = ${protein.uniprot_id}
      `;
      if (result.rowCount > 0) {
        console.log(`  ✅ Removed protein: ${protein.gene_name} (${protein.uniprot_id})`);
      }
    }
  }
  console.log();
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');
  const removeProteinEntries = args.includes('--remove-proteins');

  console.log('🚀 BBS10/BBS12 Removal Tool\n');
  console.log('=' .repeat(70) + '\n');

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made');
    console.log('   Use --execute flag to actually remove data');
    console.log('   Use --remove-proteins to also remove protein entries\n');
  } else {
    console.log('⚠️  EXECUTE MODE - Changes will be permanent!\n');
  }

  // Show impact
  await showImpact();

  console.log('=' .repeat(70) + '\n');

  // Remove interactions
  await removeInteractions(dryRun);

  // Optionally remove protein entries
  if (removeProteinEntries) {
    await removeProteins(dryRun);
  } else {
    console.log('ℹ️  Protein entries will be kept (use --remove-proteins to remove them)\n');
  }

  console.log('=' .repeat(70));

  if (dryRun) {
    console.log('\n✅ Dry run complete. To execute, run:');
    console.log('   node scripts/remove_bbs10_bbs12.mjs --execute');
    console.log('   node scripts/remove_bbs10_bbs12.mjs --execute --remove-proteins\n');
  } else {
    console.log('\n✅ Removal complete!\n');
  }
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
