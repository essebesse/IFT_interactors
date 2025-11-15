#!/usr/bin/env node
/**
 * Generate publication-ready summary tables and stats
 */

import fs from 'fs';

function main() {
  console.log('Loading categorized interactions...');

  const categorized = JSON.parse(
    fs.readFileSync('data/categorized_interactions.json', 'utf8')
  );

  const summary = JSON.parse(
    fs.readFileSync('data/interaction_summary.json', 'utf8')
  );

  const total = summary.total_interactions;

  // Group into major categories for publication
  const majorCategories = {
    'Validation (Machinery)': 0,
    'Mechanistic (IFT-BBSome)': 0,
    'Novel Cargo: Transcription/Chromatin': 0,
    'Novel Cargo: Signaling': 0,
    'Novel Cargo: Metabolism': 0,
    'Novel Cargo: Cytoskeleton': 0,
    'Novel Cargo: Membrane Trafficking': 0,
    'Novel Cargo: Ciliary Structural': 0,
    'Novel Cargo: RNA Processing': 0,
    'Novel Cargo: Other': 0
  };

  for (const [category, count] of Object.entries(summary.interaction_categories)) {
    if (category.startsWith('Validation:')) {
      majorCategories['Validation (Machinery)'] += count;
    } else if (category.startsWith('Mechanistic:')) {
      majorCategories['Mechanistic (IFT-BBSome)'] += count;
    } else if (category === 'Novel cargo: Transcription/Chromatin') {
      majorCategories['Novel Cargo: Transcription/Chromatin'] += count;
    } else if (category === 'Novel cargo: Signaling') {
      majorCategories['Novel Cargo: Signaling'] += count;
    } else if (category === 'Novel cargo: Metabolism') {
      majorCategories['Novel Cargo: Metabolism'] += count;
    } else if (category === 'Novel cargo: Cytoskeleton') {
      majorCategories['Novel Cargo: Cytoskeleton'] += count;
    } else if (category === 'Novel cargo: Membrane trafficking') {
      majorCategories['Novel Cargo: Membrane Trafficking'] += count;
    } else if (category === 'Novel cargo: Ciliary structural') {
      majorCategories['Novel Cargo: Ciliary Structural'] += count;
    } else if (category === 'Novel cargo: RNA processing') {
      majorCategories['Novel Cargo: RNA Processing'] += count;
    } else if (category === 'Novel cargo: Other') {
      majorCategories['Novel Cargo: Other'] += count;
    }
  }

  // Generate markdown table
  let markdown = '# Interaction Category Summary\n\n';
  markdown += `**Total interactions:** ${total}\n\n`;
  markdown += '| Category | Count | Percentage |\n';
  markdown += '|----------|------:|-----------:|\n';

  for (const [category, count] of Object.entries(majorCategories)) {
    const percentage = ((count / total) * 100).toFixed(1);
    markdown += `| ${category} | ${count} | ${percentage}% |\n`;
  }

  markdown += '\n## Detailed Breakdown\n\n';
  markdown += '| Detailed Category | Count | Percentage |\n';
  markdown += '|-------------------|------:|-----------:|\n';

  const sorted = Object.entries(summary.interaction_categories)
    .sort((a, b) => b[1] - a[1]);

  for (const [category, count] of sorted) {
    const percentage = ((count / total) * 100).toFixed(1);
    markdown += `| ${category} | ${count} | ${percentage}% |\n`;
  }

  // Add high-confidence novel cargo examples
  markdown += '\n## High-Confidence Novel Cargo Interactions (ipSAE > 0.6)\n\n';
  markdown += '| Bait | Prey | Category | ipSAE | iPTM |\n';
  markdown += '|------|------|----------|------:|-----:|\n';

  const highConfNovel = categorized
    .filter(i => i.ipsae > 0.6 && i.interaction_category.startsWith('Novel cargo'))
    .sort((a, b) => b.ipsae - a.ipsae)
    .slice(0, 30); // Top 30

  for (const item of highConfNovel) {
    markdown += `| ${item.bait_gene} | ${item.prey_gene} | ${item.prey_category} | ${item.ipsae.toFixed(3)} | ${item.iptm.toFixed(2)} |\n`;
  }

  fs.writeFileSync('data/CATEGORY_SUMMARY.md', markdown);

  // Generate simple CSV for plotting
  const plotData = [];
  plotData.push('Category,Count,Percentage');

  for (const [category, count] of Object.entries(majorCategories)) {
    const percentage = ((count / total) * 100).toFixed(1);
    plotData.push(`"${category}",${count},${percentage}`);
  }

  fs.writeFileSync('data/category_summary.csv', plotData.join('\n'));

  // Generate JSON for web visualization
  const vizData = {
    total: total,
    categories: Object.entries(majorCategories).map(([name, count]) => ({
      name,
      count,
      percentage: parseFloat(((count / total) * 100).toFixed(1))
    })),
    high_confidence_novel: highConfNovel.map(item => ({
      bait: item.bait_gene,
      prey: item.prey_gene,
      category: item.prey_category,
      ipsae: item.ipsae,
      iptm: item.iptm
    }))
  };

  fs.writeFileSync('data/category_visualization.json', JSON.stringify(vizData, null, 2));

  console.log('\n=== MAJOR CATEGORIES (Publication Summary) ===\n');
  for (const [category, count] of Object.entries(majorCategories)) {
    if (count > 0) {
      const percentage = ((count / total) * 100).toFixed(1);
      console.log(`${category.padEnd(50)} ${count.toString().padStart(4)} (${percentage}%)`);
    }
  }

  console.log('\n✓ Generated summary files:');
  console.log('  - data/CATEGORY_SUMMARY.md');
  console.log('  - data/category_summary.csv');
  console.log('  - data/category_visualization.json');
}

main();
