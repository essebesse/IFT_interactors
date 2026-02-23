#!/usr/bin/env node
/**
 * Upload Pair Reports to Vercel Blob Storage
 * ============================================
 *
 * Uploads all LLM-generated markdown pair reports to Vercel Blob storage.
 *
 * Environment Variables Required:
 *   BLOB_READ_WRITE_TOKEN - Vercel Blob storage token
 *
 * Usage:
 *   export BLOB_READ_WRITE_TOKEN="your_token_here"
 *   node scripts/upload_pair_reports_to_blob.mjs
 *   node scripts/upload_pair_reports_to_blob.mjs --dry-run
 */

import { put } from '@vercel/blob';
import { readFile, readdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDryRun = process.argv.includes('--dry-run');

const REPORTS_DIR = path.join(__dirname, '..', 'analysis_pipeline', 'pair_reports_noRec');

console.log('================================================================================');
console.log('UPLOAD PAIR REPORTS TO VERCEL BLOB');
console.log('================================================================================');
console.log();

if (!process.env.BLOB_READ_WRITE_TOKEN && !isDryRun) {
  console.error('ERROR: BLOB_READ_WRITE_TOKEN environment variable not set');
  console.error('  export BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."');
  process.exit(1);
}

let stats = { total: 0, uploaded: 0, skipped: 0, failed: 0, bytes: 0 };

(async () => {
  try {
    const files = (await readdir(REPORTS_DIR)).filter(f => f.endsWith('.md')).sort();
    stats.total = files.length;
    console.log(`Found ${files.length} markdown reports in ${REPORTS_DIR}\n`);

    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const localPath = path.join(REPORTS_DIR, filename);
      const blobPath = `pair_reports/${filename}`;
      const fileInfo = await stat(localPath);
      const sizeKB = (fileInfo.size / 1024).toFixed(1);

      if (isDryRun) {
        console.log(`  [DRY RUN] ${blobPath} (${sizeKB} KB)`);
        stats.uploaded++;
        stats.bytes += fileInfo.size;
      } else {
        try {
          const content = await readFile(localPath);
          const blob = await put(blobPath, content, {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'text/markdown'
          });
          console.log(`  [${i + 1}/${files.length}] ${filename} (${sizeKB} KB)`);
          stats.uploaded++;
          stats.bytes += fileInfo.size;
        } catch (error) {
          console.log(`  FAILED: ${filename} - ${error.message}`);
          stats.failed++;
        }
      }

      // Rate limit: pause every 10 files
      if (!isDryRun && (i + 1) % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n================================================================================');
    console.log('SUMMARY');
    console.log('================================================================================');
    console.log(`Total:    ${stats.total}`);
    console.log(`Uploaded: ${stats.uploaded}`);
    console.log(`Failed:   ${stats.failed}`);
    console.log(`Size:     ${(stats.bytes / 1024 / 1024).toFixed(2)} MB`);
    if (isDryRun) console.log('\nDry run - no files were uploaded.');
    else console.log('\nDone!');

  } catch (error) {
    console.error('Upload failed:', error);
    process.exit(1);
  }
})();
