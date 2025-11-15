#!/usr/bin/env node
/**
 * Confidence Distribution Analysis
 * Analyzes distribution of ipSAE scores across categories and thresholds
 */

import fs from 'fs';

function main() {
  console.log('Loading categorized interactions...');

  const categorized = JSON.parse(
    fs.readFileSync('data/categorized_interactions.json', 'utf8')
  );

  // Define confidence thresholds
  const thresholds = [
    { name: 'High', min: 0.7, max: 1.0 },
    { name: 'Medium', min: 0.5, max: 0.7 },
    { name: 'Low', min: 0.3, max: 0.5 }
  ];

  // Overall distribution
  console.log('\n=== OVERALL CONFIDENCE DISTRIBUTION ===\n');

  const total = categorized.length;
  const distribution = {};

  for (const threshold of thresholds) {
    const count = categorized.filter(i =>
      i.ipsae >= threshold.min && i.ipsae < threshold.max
    ).length;
    const percentage = ((count / total) * 100).toFixed(1);

    distribution[threshold.name] = { count, percentage };
    console.log(`${threshold.name.padEnd(10)} (ipSAE ${threshold.min}-${threshold.max}): ${count.toString().padStart(4)} (${percentage}%)`);
  }

  // Distribution by category
  console.log('\n=== CONFIDENCE DISTRIBUTION BY CATEGORY ===\n');

  const categories = [...new Set(categorized.map(i => i.interaction_category))].sort();
  const categoryConfidence = {};

  for (const category of categories) {
    const categoryInteractions = categorized.filter(i => i.interaction_category === category);
    const categoryTotal = categoryInteractions.length;

    categoryConfidence[category] = {
      total: categoryTotal,
      high: 0,
      medium: 0,
      low: 0,
      avg_ipsae: 0,
      avg_iptm: 0
    };

    for (const interaction of categoryInteractions) {
      categoryConfidence[category].avg_ipsae += interaction.ipsae;
      categoryConfidence[category].avg_iptm += interaction.iptm;

      if (interaction.ipsae >= 0.7) {
        categoryConfidence[category].high += 1;
      } else if (interaction.ipsae >= 0.5) {
        categoryConfidence[category].medium += 1;
      } else {
        categoryConfidence[category].low += 1;
      }
    }

    categoryConfidence[category].avg_ipsae /= categoryTotal;
    categoryConfidence[category].avg_iptm /= categoryTotal;
  }

  // Print sorted by average ipSAE
  const sortedCategories = Object.entries(categoryConfidence)
    .sort((a, b) => b[1].avg_ipsae - a[1].avg_ipsae);

  console.log('Category                            Total  High  Medium  Low   Avg ipSAE  Avg iPTM');
  console.log('─'.repeat(90));

  for (const [category, stats] of sortedCategories) {
    console.log(
      `${category.padEnd(35)} ${stats.total.toString().padStart(5)} ` +
      `${stats.high.toString().padStart(5)} ${stats.medium.toString().padStart(7)} ` +
      `${stats.low.toString().padStart(4)}  ${stats.avg_ipsae.toFixed(3)}      ${stats.avg_iptm.toFixed(3)}`
    );
  }

  // Generate CSV
  const csvLines = ['Category,Total,High,Medium,Low,Avg_ipSAE,Avg_iPTM'];

  for (const [category, stats] of sortedCategories) {
    csvLines.push(
      `"${category}",${stats.total},${stats.high},${stats.medium},${stats.low},` +
      `${stats.avg_ipsae.toFixed(3)},${stats.avg_iptm.toFixed(3)}`
    );
  }

  fs.writeFileSync('data/confidence_distribution.csv', csvLines.join('\n'));

  // Generate histogram data for plotting
  const histogramData = {
    overall: {
      high: distribution.High.count,
      medium: distribution.Medium.count,
      low: distribution.Low.count
    },
    by_category: Object.fromEntries(
      sortedCategories.map(([cat, stats]) => [cat, {
        total: stats.total,
        high: stats.high,
        medium: stats.medium,
        low: stats.low,
        avg_ipsae: parseFloat(stats.avg_ipsae.toFixed(3)),
        avg_iptm: parseFloat(stats.avg_iptm.toFixed(3))
      }])
    ),
    ipsae_bins: generateHistogram(categorized.map(i => i.ipsae), 0.3, 1.0, 0.05),
    iptm_bins: generateHistogram(categorized.map(i => i.iptm), 0.0, 1.0, 0.05)
  };

  fs.writeFileSync('data/confidence_histogram.json', JSON.stringify(histogramData, null, 2));

  console.log('\n✓ Generated files:');
  console.log('  - data/confidence_distribution.csv');
  console.log('  - data/confidence_histogram.json');
}

function generateHistogram(values, min, max, binSize) {
  const bins = [];
  for (let i = min; i < max; i += binSize) {
    const binMin = i;
    const binMax = i + binSize;
    const count = values.filter(v => v >= binMin && v < binMax).length;
    bins.push({
      bin: `${binMin.toFixed(2)}-${binMax.toFixed(2)}`,
      count: count
    });
  }
  return bins;
}

main();
