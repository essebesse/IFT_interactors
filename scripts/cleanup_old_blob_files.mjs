#!/usr/bin/env node
/**
 * Cleanup Old Numerically-Named Files from Vercel Blob
 * =====================================================
 *
 * Deletes old files with numeric names (1.cif, 2.cif, etc.) from Vercel Blob storage.
 * These were from the initial upload attempt before switching to UniProt-based naming.
 *
 * Environment Variables Required:
 *   BLOB_READ_WRITE_TOKEN - Vercel Blob storage token
 *
 * Usage:
 *   export BLOB_READ_WRITE_TOKEN="your_token_here"
 *   node scripts/cleanup_old_blob_files.mjs
 *
 * Options:
 *   --dry-run    Show what would be deleted without deleting
 *   --confirm    Skip confirmation prompt
 */

import { list, del } from '@vercel/blob';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const skipConfirm = args.includes('--confirm');

console.log('================================================================================');
console.log('VERCEL BLOB CLEANUP SCRIPT');
console.log('================================================================================');
console.log();

// Check for token
if (!process.env.BLOB_READ_WRITE_TOKEN && !isDryRun) {
  console.error('ERROR: BLOB_READ_WRITE_TOKEN environment variable not set');
  console.error('');
  console.error('Get your token from:');
  console.error('  https://vercel.com/dashboard/stores');
  console.error('');
  console.error('Then set it:');
  console.error('  export BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."');
  process.exit(1);
}

console.log('Fetching blob list...');

try {
  // Get all blobs
  const result = await list({ limit: 1000 });
  console.log(`Found ${result.blobs.length} total files in Blob storage\n`);

  // Find old numerically-named CIF files (e.g., 1.cif, 2.cif)
  // These were from the first upload before switching to UniProt naming
  const oldCifs = result.blobs.filter(b =>
    b.pathname.startsWith('structures/') &&
    /structures\/\d+\.cif$/.test(b.pathname)
  );

  // Find ALL PAE files in Blob storage
  // NOTE: PAE files are served from public/contacts_data/, NOT from Blob
  // All PAE files in Blob are unused and can be deleted
  const unusedPae = result.blobs.filter(b =>
    b.pathname.startsWith('pae_contacts/')
  );

  const totalOldFiles = oldCifs.length + unusedPae.length;

  if (totalOldFiles === 0) {
    console.log('✓ No old files found. Blob storage is clean!');
    process.exit(0);
  }

  console.log('Files to delete:');
  console.log(`  - Old CIF structures (numeric naming): ${oldCifs.length}`);
  console.log(`  - PAE contacts (unused, served from public/): ${unusedPae.length}`);
  console.log(`  - Total: ${totalOldFiles}`);
  console.log();

  console.log('ℹ️  Note: PAE files in Blob are not used by the API.');
  console.log('   PAE data is served from public/contacts_data/ instead.');
  console.log();

  if (oldCifs.length > 0 && oldCifs.length <= 20) {
    console.log('Sample CIF files to be deleted:');
    oldCifs.forEach(b => console.log(`  - ${b.pathname}`));
    console.log();
  }

  if (isDryRun) {
    console.log('[DRY RUN] Would delete these files');
    process.exit(0);
  }

  // Confirmation prompt
  if (!skipConfirm) {
    console.log('⚠️  WARNING: This will permanently delete these files!');
    console.log();
    console.log('To proceed:');
    console.log('  1. Re-run with --confirm flag');
    console.log('  2. Or use --dry-run to see what would be deleted');
    console.log();
    console.log('Example: node scripts/cleanup_old_blob_files.mjs --confirm');
    process.exit(0);
  }

  // Delete files
  console.log('Deleting old files...');
  console.log();

  let deleted = 0;
  let failed = 0;

  for (const blob of [...oldCifs, ...unusedPae]) {
    try {
      await del(blob.url);
      console.log(`  ✓ Deleted: ${blob.pathname}`);
      deleted++;
    } catch (error) {
      console.error(`  ✗ Failed: ${blob.pathname} - ${error.message}`);
      failed++;
    }
  }

  console.log();
  console.log('================================================================================');
  console.log('CLEANUP COMPLETE');
  console.log('================================================================================');
  console.log(`Deleted: ${deleted}`);
  console.log(`Failed: ${failed}`);
  console.log();

  if (failed === 0) {
    console.log('✓ All old files successfully removed from Blob storage');
  } else {
    console.log('⚠️  Some files failed to delete. Check errors above.');
  }

} catch (error) {
  console.error('ERROR:', error.message);
  process.exit(1);
}
