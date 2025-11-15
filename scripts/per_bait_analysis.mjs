#!/usr/bin/env node
/**
 * Per-Bait Category Breakdown
 * Analyzes which IFT/BBSome proteins interact with which functional categories
 */

import fs from 'fs';

function main() {
  console.log('Loading categorized interactions...');

  const categorized = JSON.parse(
    fs.readFileSync('data/categorized_interactions.json', 'utf8')
  );

  // Group by bait protein
  const baitBreakdown = {};

  for (const interaction of categorized) {
    const bait = interaction.bait_gene;
    const category = interaction.interaction_category;

    if (!baitBreakdown[bait]) {
      baitBreakdown[bait] = {
        bait_category: interaction.bait_category,
        total: 0,
        categories: {}
      };
    }

    baitBreakdown[bait].total += 1;

    if (!baitBreakdown[bait].categories[category]) {
      baitBreakdown[bait].categories[category] = 0;
    }
    baitBreakdown[bait].categories[category] += 1;
  }

  // Generate summary
  console.log('\n=== PER-BAIT CATEGORY BREAKDOWN ===\n');

  const baits = Object.keys(baitBreakdown).sort((a, b) =>
    baitBreakdown[b].total - baitBreakdown[a].total
  );

  for (const bait of baits) {
    const data = baitBreakdown[bait];
    console.log(`${bait} (${data.bait_category}) - ${data.total} interactions`);

    const sortedCategories = Object.entries(data.categories)
      .sort((a, b) => b[1] - a[1]);

    for (const [category, count] of sortedCategories) {
      const percentage = ((count / data.total) * 100).toFixed(1);
      console.log(`  ${category.padEnd(35)} ${count.toString().padStart(3)} (${percentage}%)`);
    }
    console.log('');
  }

  // Generate CSV for plotting
  const csvLines = ['Bait,Bait_Category,Total_Interactions,Category,Count,Percentage'];

  for (const bait of baits) {
    const data = baitBreakdown[bait];
    for (const [category, count] of Object.entries(data.categories)) {
      const percentage = ((count / data.total) * 100).toFixed(1);
      csvLines.push(`${bait},${data.bait_category},${data.total},"${category}",${count},${percentage}`);
    }
  }

  fs.writeFileSync('data/per_bait_breakdown.csv', csvLines.join('\n'));

  // Generate JSON for heatmap/visualization
  const heatmapData = {
    baits: baits.map(bait => ({
      name: bait,
      category: baitBreakdown[bait].bait_category,
      total: baitBreakdown[bait].total
    })),
    categories: [...new Set(categorized.map(i => i.interaction_category))].sort(),
    matrix: baits.map(bait => {
      const row = baitBreakdown[bait].categories;
      return [...new Set(categorized.map(i => i.interaction_category))].sort()
        .map(cat => row[cat] || 0);
    })
  };

  fs.writeFileSync('data/per_bait_heatmap.json', JSON.stringify(heatmapData, null, 2));

  console.log('✓ Generated files:');
  console.log('  - data/per_bait_breakdown.csv');
  console.log('  - data/per_bait_heatmap.json');
}

main();
