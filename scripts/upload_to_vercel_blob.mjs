#!/usr/bin/env node
/**
 * Upload CIF Files to Vercel Blob Storage
 * ========================================
 *
 * Uploads all CIF files and PAE contact JSONs to Vercel Blob storage
 * for serving via the IFT Interactors web viewer.
 *
 * Environment Variables Required:
 *   BLOB_READ_WRITE_TOKEN - Vercel Blob storage token
 *
 * Usage:
 *   export BLOB_READ_WRITE_TOKEN="your_token_here"
 *   node scripts/upload_to_vercel_blob.mjs
 *
 * Options:
 *   --dry-run    Show what would be uploaded without uploading
 *   --cifs-only  Upload only CIF files (skip PAE JSONs)
 *   --pae-only   Upload only PAE JSONs (skip CIF files)
 */

import { put, list, del } from '@vercel/blob';
import { readFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const cifsOnly = args.includes('--cifs-only');
const paeOnly = args.includes('--pae-only');

console.log('================================================================================');
console.log('VERCEL BLOB UPLOAD SCRIPT');
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

// Load manifest
const manifestPath = path.join(__dirname, '..', 'cif_manifest.json');
let manifest;
try {
  const manifestData = await readFile(manifestPath, 'utf8');
  manifest = JSON.parse(manifestData);
  console.log(`✓ Loaded manifest: ${manifest.total} interactions`);
} catch (error) {
  console.error('ERROR: Could not load cif_manifest.json');
  console.error(error.message);
  process.exit(1);
}

// Statistics
let stats = {
  cifs: { total: 0, uploaded: 0, skipped: 0, failed: 0, bytes: 0 },
  pae: { total: 0, uploaded: 0, skipped: 0, failed: 0, bytes: 0 }
};

/**
 * Upload a file to Vercel Blob
 */
async function uploadFile(localPath, blobPath, type) {
  if (!fs.existsSync(localPath)) {
    console.log(`  ⚠ File not found: ${localPath}`);
    stats[type].skipped++;
    return null;
  }

  const fileSize = fs.statSync(localPath).size;
  const sizeMB = (fileSize / 1024 / 1024).toFixed(2);

  if (isDryRun) {
    console.log(`  [DRY RUN] Would upload: ${blobPath} (${sizeMB} MB)`);
    stats[type].uploaded++;
    stats[type].bytes += fileSize;
    return null;
  }

  try {
    const fileBuffer = await readFile(localPath);

    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: type === 'cifs' ? 'chemical/x-cif' : 'application/json'
    });

    console.log(`  ✓ Uploaded: ${blobPath} (${sizeMB} MB)`);
    console.log(`    URL: ${blob.url}`);
    stats[type].uploaded++;
    stats[type].bytes += fileSize;
    return blob.url;

  } catch (error) {
    console.log(`  ✗ Failed: ${blobPath}`);
    console.log(`    Error: ${error.message}`);
    stats[type].failed++;
    return null;
  }
}

/**
 * Upload all CIF files
 */
async function uploadCifFiles() {
  if (paeOnly) {
    console.log('\n⏭  Skipping CIF files (--pae-only mode)');
    return;
  }

  console.log('\n================================================================================');
  console.log('UPLOADING CIF FILES');
  console.log('================================================================================\n');

  for (const [id, data] of Object.entries(manifest.entries)) {
    if (!data.cif_path || !fs.existsSync(data.cif_path)) {
      continue;
    }

    stats.cifs.total++;
    const blobPath = `structures/${id}.cif`;

    console.log(`[${stats.cifs.total}/${manifest.found}] Interaction ${id}: ${data.bait_gene} ↔ ${data.prey_gene}`);

    await uploadFile(data.cif_path, blobPath, 'cifs');

    // Rate limit: Vercel allows 1000 writes/day, but let's be gentle
    if (!isDryRun && stats.cifs.total % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

/**
 * Upload all PAE contact JSON files
 */
async function uploadPaeFiles() {
  if (cifsOnly) {
    console.log('\n⏭  Skipping PAE files (--cifs-only mode)');
    return;
  }

  console.log('\n================================================================================');
  console.log('UPLOADING PAE CONTACT FILES');
  console.log('================================================================================\n');

  const contactsDir = path.join(__dirname, '..', 'public', 'contacts_data');

  if (!fs.existsSync(contactsDir)) {
    console.log('⚠ PAE contacts directory not found, skipping...');
    return;
  }

  const paeFiles = fs.readdirSync(contactsDir)
    .filter(f => f.endsWith('.json'))
    .sort((a, b) => {
      const numA = parseInt(a.replace('.json', ''));
      const numB = parseInt(b.replace('.json', ''));
      return numA - numB;
    });

  stats.pae.total = paeFiles.length;

  for (const filename of paeFiles) {
    const interactionId = filename.replace('.json', '');
    const localPath = path.join(contactsDir, filename);
    const blobPath = `pae_contacts/${interactionId}.json`;

    console.log(`[${paeFiles.indexOf(filename) + 1}/${paeFiles.length}] PAE data for interaction ${interactionId}`);

    await uploadFile(localPath, blobPath, 'pae');

    // Rate limit
    if (!isDryRun && paeFiles.indexOf(filename) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

/**
 * Show summary
 */
function showSummary() {
  console.log('\n================================================================================');
  console.log('UPLOAD SUMMARY');
  console.log('================================================================================\n');

  console.log('CIF Files:');
  console.log(`  Total:    ${stats.cifs.total}`);
  console.log(`  Uploaded: ${stats.cifs.uploaded}`);
  console.log(`  Skipped:  ${stats.cifs.skipped}`);
  console.log(`  Failed:   ${stats.cifs.failed}`);
  console.log(`  Size:     ${(stats.cifs.bytes / 1024 / 1024).toFixed(2)} MB`);

  console.log('\nPAE Contact Files:');
  console.log(`  Total:    ${stats.pae.total}`);
  console.log(`  Uploaded: ${stats.pae.uploaded}`);
  console.log(`  Skipped:  ${stats.pae.skipped}`);
  console.log(`  Failed:   ${stats.pae.failed}`);
  console.log(`  Size:     ${(stats.pae.bytes / 1024 / 1024).toFixed(2)} MB`);

  const totalBytes = stats.cifs.bytes + stats.pae.bytes;
  const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
  const totalGB = (totalBytes / 1024 / 1024 / 1024).toFixed(3);

  console.log('\nTotal:');
  console.log(`  Files:    ${stats.cifs.uploaded + stats.pae.uploaded}`);
  console.log(`  Size:     ${totalMB} MB (${totalGB} GB)`);
  console.log(`  Free tier: 1.00 GB (${((1 - parseFloat(totalGB)) * 1024).toFixed(0)} MB remaining)`);

  if (stats.cifs.failed > 0 || stats.pae.failed > 0) {
    console.log('\n⚠ Some files failed to upload. Re-run this script to retry.');
  }

  if (isDryRun) {
    console.log('\n📝 This was a dry run. No files were actually uploaded.');
    console.log('   Remove --dry-run to perform the upload.');
  } else {
    console.log('\n✅ Upload complete!');
  }
}

/**
 * List existing blobs (for debugging)
 */
async function listExistingBlobs() {
  if (isDryRun) return;

  try {
    console.log('\nChecking existing blobs in storage...');
    const { blobs } = await list();
    console.log(`Found ${blobs.length} existing files in Vercel Blob storage`);

    if (blobs.length > 0) {
      const cifCount = blobs.filter(b => b.pathname.startsWith('structures/')).length;
      const paeCount = blobs.filter(b => b.pathname.startsWith('pae_contacts/')).length;
      console.log(`  - CIF files: ${cifCount}`);
      console.log(`  - PAE files: ${paeCount}`);
    }
  } catch (error) {
    console.log('Could not list existing blobs:', error.message);
  }
}

// Main execution
(async () => {
  try {
    if (!isDryRun) {
      await listExistingBlobs();
    }

    await uploadCifFiles();
    await uploadPaeFiles();
    showSummary();

  } catch (error) {
    console.error('\n❌ Upload failed with error:');
    console.error(error);
    process.exit(1);
  }
})();
