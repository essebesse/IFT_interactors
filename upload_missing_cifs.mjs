#!/usr/bin/env node
/**
 * Upload only the 47 missing CIF files to Vercel Blob
 * For the 4 new proteins: IFT172, BBS9, RABL2B, BBIP1
 */
import { put, list } from '@vercel/blob';
import { readFile } from 'fs/promises';
import fs from 'fs';

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('ERROR: BLOB_READ_WRITE_TOKEN not set');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync('./cif_manifest.json', 'utf-8'));

console.log('================================================================================');
console.log('UPLOAD MISSING CIF FILES');
console.log('================================================================================');
console.log();

// Get list of already uploaded CIFs
const { blobs } = await list();
const uploadedCifs = new Set(
  blobs.filter(b => b.pathname.endsWith('.cif'))
       .map(b => b.pathname.replace('structures/', ''))
);

console.log(`✓ Found ${uploadedCifs.size} CIF files already in Blob storage`);
console.log();

// Find missing CIFs
const missing = [];
Object.entries(manifest.entries).forEach(([id, entry]) => {
  const filename = entry.interaction_directory + '.cif';
  if (!uploadedCifs.has(filename) && entry.cif_path && fs.existsSync(entry.cif_path)) {
    missing.push({
      id: parseInt(id),
      filename,
      localPath: entry.cif_path,
      bait: entry.bait_gene,
      prey: entry.prey_gene
    });
  }
});

console.log(`Found ${missing.length} missing CIF files to upload`);
console.log();

if (missing.length === 0) {
  console.log('✓ All CIF files already uploaded!');
  process.exit(0);
}

// Show breakdown
const byBait = {};
missing.forEach(m => {
  byBait[m.bait] = (byBait[m.bait] || 0) + 1;
});
console.log('Breakdown by bait:');
Object.entries(byBait).sort((a,b) => b[1] - a[1]).forEach(([bait, count]) => {
  console.log(`  ${bait}: ${count} files`);
});
console.log();

// Upload missing files
let uploaded = 0;
let failed = 0;
let totalBytes = 0;

for (const file of missing) {
  const fileSize = fs.statSync(file.localPath).size;
  const sizeMB = (fileSize / 1024 / 1024).toFixed(2);

  console.log(`[${uploaded + failed + 1}/${missing.length}] ID ${file.id}: ${file.bait} + ${file.prey}`);
  console.log(`  File: ${file.filename}`);

  try {
    const fileBuffer = await readFile(file.localPath);
    const blobPath = `structures/${file.filename}`;

    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'chemical/x-cif'
    });

    console.log(`  ✓ Uploaded (${sizeMB} MB)`);
    uploaded++;
    totalBytes += fileSize;

    // Rate limit: pause every 10 uploads
    if (uploaded % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  } catch (error) {
    console.log(`  ✗ Failed: ${error.message}`);
    failed++;
  }

  console.log();
}

console.log('================================================================================');
console.log('UPLOAD SUMMARY');
console.log('================================================================================');
console.log(`Total files: ${missing.length}`);
console.log(`Uploaded: ${uploaded}`);
console.log(`Failed: ${failed}`);
console.log(`Size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
console.log();

if (uploaded > 0) {
  console.log('✅ Upload complete!');
} else {
  console.log('⚠️ No files uploaded');
}
