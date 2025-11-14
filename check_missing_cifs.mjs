#!/usr/bin/env node
import { list } from '@vercel/blob';
import { readFileSync } from 'fs';

const manifest = JSON.parse(readFileSync('./cif_manifest.json', 'utf-8'));

(async () => {
  const { blobs } = await list();
  const uploadedCifs = new Set(
    blobs.filter(b => b.pathname.endsWith('.cif'))
         .map(b => b.pathname.replace('structures/', ''))
  );

  console.log('Checking which CIF files are missing from Blob...');
  console.log('');

  const missing = [];
  Object.entries(manifest.entries).forEach(([id, entry]) => {
    const filename = entry.interaction_directory + '.cif';
    if (!uploadedCifs.has(filename)) {
      missing.push({id, filename, bait: entry.bait_gene, prey: entry.prey_gene});
    }
  });

  console.log('Missing CIF files:', missing.length);
  console.log('');

  if (missing.length > 0) {
    console.log('Breakdown by bait protein:');
    const byBait = {};
    missing.forEach(m => {
      byBait[m.bait] = (byBait[m.bait] || 0) + 1;
    });
    Object.entries(byBait).sort((a,b) => b[1] - a[1]).forEach(([bait, count]) => {
      console.log(`  ${bait}: ${count} files`);
    });

    console.log('');
    console.log('Sample missing files:');
    missing.slice(0, 15).forEach(m => console.log(`  ID ${m.id}: ${m.bait} + ${m.prey}`));
  }
})();
