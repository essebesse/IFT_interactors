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
    'Transcription/Chromatin': 0,
    'Signaling': 0,
    'Metabolism': 0,
    'Cytoskeleton': 0,
    'Membrane Trafficking': 0,
    'Ciliary Structural': 0,
    'RNA Processing': 0,
    'Other': 0
  };

  for (const [category, count] of Object.entries(summary.interaction_categories)) {
    if (category.startsWith('Validation:')) {
      majorCategories['Validation (Machinery)'] += count;
    } else if (category.startsWith('Mechanistic:')) {
      majorCategories['Mechanistic (IFT-BBSome)'] += count;
    } else if (category === 'Transcription/Chromatin') {
      majorCategories['Transcription/Chromatin'] += count;
    } else if (category === 'Signaling') {
      majorCategories['Signaling'] += count;
    } else if (category === 'Metabolism') {
      majorCategories['Metabolism'] += count;
    } else if (category === 'Cytoskeleton') {
      majorCategories['Cytoskeleton'] += count;
    } else if (category === 'Membrane trafficking') {
      majorCategories['Membrane Trafficking'] += count;
    } else if (category === 'Ciliary structural') {
      majorCategories['Ciliary Structural'] += count;
    } else if (category === 'RNA processing') {
      majorCategories['RNA Processing'] += count;
    } else if (category === 'Other') {
      majorCategories['Other'] += count;
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

  // Add high-confidence predicted interactions (excluding validation/mechanistic)
  markdown += '\n## High-Confidence Predicted Interactions (ipSAE > 0.6)\n\n';
  markdown += '| Bait | Prey | Category | ipSAE | iPTM |\n';
  markdown += '|------|------|----------|------:|-----:|\n';

  const highConfNovel = categorized
    .filter(i => i.ipsae > 0.6 && !i.interaction_category.startsWith('Validation:') && !i.interaction_category.startsWith('Mechanistic:'))
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
    high_confidence_interactions: highConfNovel.map(item => ({
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
