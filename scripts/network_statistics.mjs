#!/usr/bin/env node
/**
 * Network Statistics Analysis
 * Calculates hub proteins, degree distribution, and network properties
 */

import fs from 'fs';

function main() {
  console.log('Loading categorized interactions...');

  const categorized = JSON.parse(
    fs.readFileSync('data/categorized_interactions.json', 'utf8')
  );

  // Build network graph
  const graph = {
    nodes: new Set(),
    edges: categorized
  };

  // Collect all unique proteins
  for (const interaction of categorized) {
    graph.nodes.add(interaction.bait_gene);
    graph.nodes.add(interaction.prey_gene);
  }

  console.log(`\nNetwork contains ${graph.nodes.size} unique proteins and ${graph.edges.length} interactions`);

  // Calculate degree for each protein
  const degree = {};

  for (const node of graph.nodes) {
    degree[node] = {
      total: 0,
      as_bait: 0,
      as_prey: 0,
      partners: new Set()
    };
  }

  for (const edge of graph.edges) {
    degree[edge.bait_gene].total += 1;
    degree[edge.bait_gene].as_bait += 1;
    degree[edge.bait_gene].partners.add(edge.prey_gene);

    degree[edge.prey_gene].total += 1;
    degree[edge.prey_gene].as_prey += 1;
    degree[edge.prey_gene].partners.add(edge.bait_gene);
  }

  // Convert partners set to count
  for (const node in degree) {
    degree[node].unique_partners = degree[node].partners.size;
    delete degree[node].partners;
  }

  // Top hub proteins (by total degree)
  console.log('\n=== TOP 20 HUB PROTEINS (by total degree) ===\n');

  const sortedByDegree = Object.entries(degree)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 20);

  console.log('Protein                Total  As Bait  As Prey  Unique Partners');
  console.log('─'.repeat(70));

  for (const [protein, stats] of sortedByDegree) {
    console.log(
      `${protein.padEnd(22)} ${stats.total.toString().padStart(5)} ` +
      `${stats.as_bait.toString().padStart(8)} ${stats.as_prey.toString().padStart(8)} ` +
      `${stats.unique_partners.toString().padStart(16)}`
    );
  }

  // Prey proteins that interact with multiple baits (potential true interactors)
  console.log('\n=== TOP 20 PREY PROTEINS (interact with multiple baits) ===\n');

  const preyOnly = Object.entries(degree)
    .filter(([protein, stats]) => stats.as_bait === 0 && stats.as_prey > 1)
    .sort((a, b) => b[1].as_prey - a[1].as_prey)
    .slice(0, 20);

  console.log('Prey Protein           Interactions  Unique Bait Partners');
  console.log('─'.repeat(60));

  for (const [protein, stats] of preyOnly) {
    console.log(
      `${protein.padEnd(22)} ${stats.as_prey.toString().padStart(12)} ` +
      `${stats.unique_partners.toString().padStart(20)}`
    );
  }

  // Degree distribution
  console.log('\n=== DEGREE DISTRIBUTION ===\n');

  const degreeDistribution = {};
  for (const [protein, stats] of Object.entries(degree)) {
    const deg = stats.total;
    if (!degreeDistribution[deg]) {
      degreeDistribution[deg] = 0;
    }
    degreeDistribution[deg] += 1;
  }

  const sortedDegrees = Object.entries(degreeDistribution)
    .map(([deg, count]) => [parseInt(deg), count])
    .sort((a, b) => b[0] - a[0]);

  console.log('Degree  Count  Proteins');
  console.log('─'.repeat(40));

  for (const [deg, count] of sortedDegrees.slice(0, 15)) {
    console.log(`${deg.toString().padStart(6)} ${count.toString().padStart(6)}`);
  }

  // Network statistics
  const degrees = Object.values(degree).map(s => s.total);
  const avgDegree = degrees.reduce((a, b) => a + b, 0) / degrees.length;
  const maxDegree = Math.max(...degrees);
  const minDegree = Math.min(...degrees);

  console.log('\n=== NETWORK STATISTICS ===\n');
  console.log(`Total proteins: ${graph.nodes.size}`);
  console.log(`Total interactions: ${graph.edges.length}`);
  console.log(`Average degree: ${avgDegree.toFixed(2)}`);
  console.log(`Max degree: ${maxDegree}`);
  console.log(`Min degree: ${minDegree}`);

  // Generate CSV outputs
  const hubCsv = ['Protein,Total_Degree,As_Bait,As_Prey,Unique_Partners'];
  for (const [protein, stats] of sortedByDegree) {
    hubCsv.push(`${protein},${stats.total},${stats.as_bait},${stats.as_prey},${stats.unique_partners}`);
  }
  fs.writeFileSync('data/network_hubs.csv', hubCsv.join('\n'));

  const preyCsv = ['Prey_Protein,Interactions,Unique_Bait_Partners'];
  for (const [protein, stats] of preyOnly) {
    preyCsv.push(`${protein},${stats.as_prey},${stats.unique_partners}`);
  }
  fs.writeFileSync('data/multi_bait_prey.csv', preyCsv.join('\n'));

  const degreeCsv = ['Degree,Count'];
  for (const [deg, count] of sortedDegrees) {
    degreeCsv.push(`${deg},${count}`);
  }
  fs.writeFileSync('data/degree_distribution.csv', degreeCsv.join('\n'));

  // Generate JSON summary
  const networkSummary = {
    statistics: {
      total_proteins: graph.nodes.size,
      total_interactions: graph.edges.length,
      avg_degree: parseFloat(avgDegree.toFixed(2)),
      max_degree: maxDegree,
      min_degree: minDegree
    },
    top_hubs: sortedByDegree.slice(0, 20).map(([protein, stats]) => ({
      protein,
      ...stats
    })),
    top_multi_bait_prey: preyOnly.slice(0, 20).map(([protein, stats]) => ({
      protein,
      interactions: stats.as_prey,
      unique_partners: stats.unique_partners
    })),
    degree_distribution: sortedDegrees.map(([deg, count]) => ({ degree: deg, count }))
  };

  fs.writeFileSync('data/network_statistics.json', JSON.stringify(networkSummary, null, 2));

  console.log('\n✓ Generated files:');
  console.log('  - data/network_hubs.csv');
  console.log('  - data/multi_bait_prey.csv');
  console.log('  - data/degree_distribution.csv');
  console.log('  - data/network_statistics.json');
}

main();
