/**
 * Dataset Statistics Analysis
 *
 * Generates comprehensive statistics for IFT/BBSome interactome publication
 *
 * Outputs:
 * - analysis/results/dataset_overview.txt (summary statistics)
 * - analysis/results/supplementary_table_S1_all_interactions.csv
 * - analysis/results/supplementary_table_S2_proteins.csv
 * - analysis/results/confidence_distribution.csv
 * - analysis/results/bait_summary.csv
 *
 * Usage:
 *   export POSTGRES_URL="postgresql://..."
 *   node analysis/scripts/01_dataset_statistics.mjs
 */

import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

const RESULTS_DIR = 'analysis/results';

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

/**
 * Get overall dataset statistics
 */
async function getDatasetStatistics() {
  console.log('\n=== DATASET STATISTICS ===\n');

  // Total interactions
  const totalInteractions = await sql`
    SELECT COUNT(*) as count FROM interactions
  `;
  console.log(`Total Interactions: ${totalInteractions.rows[0].count}`);

  // Total unique proteins
  const totalProteins = await sql`
    SELECT COUNT(DISTINCT id) as count FROM proteins
  `;
  console.log(`Total Unique Proteins: ${totalProteins.rows[0].count}`);

  // Total unique baits
  const totalBaits = await sql`
    SELECT COUNT(DISTINCT bait_protein_id) as count FROM interactions
  `;
  console.log(`Total Unique Baits: ${totalBaits.rows[0].count}`);

  // Total unique preys
  const totalPreys = await sql`
    SELECT COUNT(DISTINCT prey_protein_id) as count FROM interactions
  `;
  console.log(`Total Unique Prey Proteins: ${totalPreys.rows[0].count}`);

  // Confidence distribution
  const confidenceDist = await sql`
    SELECT
      ipsae_confidence,
      COUNT(*) as count,
      ROUND(AVG(ipsae)::numeric, 3) as avg_ipsae,
      ROUND(AVG(iptm)::numeric, 3) as avg_iptm,
      ROUND(AVG(interface_plddt)::numeric, 2) as avg_interface_plddt
    FROM interactions
    GROUP BY ipsae_confidence
    ORDER BY
      CASE ipsae_confidence
        WHEN 'High' THEN 1
        WHEN 'Medium' THEN 2
        WHEN 'Low' THEN 3
      END
  `;

  console.log('\nConfidence Distribution:');
  confidenceDist.rows.forEach(row => {
    console.log(`  ${row.ipsae_confidence}: ${row.count} interactions (avg ipSAE: ${row.avg_ipsae}, avg iPTM: ${row.avg_iptm}, avg interface pLDDT: ${row.avg_interface_plddt})`);
  });

  return {
    totalInteractions: totalInteractions.rows[0].count,
    totalProteins: totalProteins.rows[0].count,
    totalBaits: totalBaits.rows[0].count,
    totalPreys: totalPreys.rows[0].count,
    confidenceDistribution: confidenceDist.rows
  };
}

/**
 * Get bait protein summary (IFT-A, IFT-B, BBSome classification)
 */
async function getBaitSummary() {
  console.log('\n=== BAIT PROTEIN SUMMARY ===\n');

  const baitStats = await sql`
    SELECT
      p.uniprot_id,
      p.gene_name,
      COUNT(i.id) as interaction_count,
      COUNT(CASE WHEN i.ipsae_confidence = 'High' THEN 1 END) as high_conf_count,
      COUNT(CASE WHEN i.ipsae_confidence = 'Medium' THEN 1 END) as medium_conf_count,
      COUNT(CASE WHEN i.ipsae_confidence = 'Low' THEN 1 END) as low_conf_count,
      ROUND(AVG(i.ipsae)::numeric, 3) as avg_ipsae
    FROM proteins p
    JOIN interactions i ON p.id = i.bait_protein_id
    GROUP BY p.id, p.uniprot_id, p.gene_name
    ORDER BY interaction_count DESC
  `;

  // Classify baits
  const iftAGenes = ['IFT144', 'IFT140', 'IFT139', 'IFT122', 'IFT121', 'WDR35', 'WDR19'];
  const iftBGenes = ['IFT88', 'IFT81', 'IFT80', 'IFT74', 'IFT57', 'IFT56', 'IFT54', 'IFT52', 'IFT46', 'IFT27', 'IFT25', 'IFT22', 'IFT20', 'TTC30A', 'TTC30B', 'HSPB11'];
  const bbsomeGenes = ['BBS1', 'BBS2', 'BBS4', 'BBS5', 'BBS7', 'BBS8', 'BBS9', 'BBS18', 'BBIP10', 'ARL6', 'LZTFL1'];

  let iftACount = 0, iftBCount = 0, bbsomeCount = 0, otherCount = 0;
  let iftAInteractions = 0, iftBInteractions = 0, bbsomeInteractions = 0, otherInteractions = 0;

  baitStats.rows.forEach(row => {
    const geneName = row.gene_name || '';
    const interactionCount = parseInt(row.interaction_count);

    if (iftAGenes.includes(geneName)) {
      iftACount++;
      iftAInteractions += interactionCount;
    } else if (iftBGenes.includes(geneName)) {
      iftBCount++;
      iftBInteractions += interactionCount;
    } else if (bbsomeGenes.includes(geneName)) {
      bbsomeCount++;
      bbsomeInteractions += interactionCount;
    } else {
      otherCount++;
      otherInteractions += interactionCount;
    }
  });

  console.log('Bait Classification:');
  console.log(`  IFT-A: ${iftACount} baits, ${iftAInteractions} interactions`);
  console.log(`  IFT-B: ${iftBCount} baits, ${iftBInteractions} interactions`);
  console.log(`  BBSome: ${bbsomeCount} baits, ${bbsomeInteractions} interactions`);
  console.log(`  Other: ${otherCount} baits, ${otherInteractions} interactions`);

  return baitStats.rows;
}

/**
 * Export all interactions for Supplementary Table S1
 */
async function exportAllInteractions() {
  console.log('\n=== EXPORTING ALL INTERACTIONS ===\n');

  const interactions = await sql`
    SELECT
      i.id,
      bait.uniprot_id as bait_uniprot,
      bait.gene_name as bait_gene,
      prey.uniprot_id as prey_uniprot,
      prey.gene_name as prey_gene,
      i.ipsae,
      i.ipsae_confidence,
      i.iptm,
      i.interface_plddt,
      i.contacts_pae_lt_3,
      i.contacts_pae_lt_6,
      i.analysis_version,
      i.alphafold_version,
      CASE
        WHEN i.experimental_validation IS NOT NULL THEN 'Yes'
        ELSE 'No'
      END as has_experimental_validation,
      i.experimental_validation::text as validation_details
    FROM interactions i
    JOIN proteins bait ON i.bait_protein_id = bait.id
    JOIN proteins prey ON i.prey_protein_id = prey.id
    ORDER BY i.ipsae DESC, bait.gene_name, prey.gene_name
  `;

  // Convert to CSV
  const headers = [
    'Interaction_ID',
    'Bait_UniProt',
    'Bait_Gene',
    'Prey_UniProt',
    'Prey_Gene',
    'ipSAE',
    'Confidence',
    'iPTM',
    'Interface_pLDDT',
    'PAE_Contacts_<3A',
    'PAE_Contacts_<6A',
    'Analysis_Version',
    'AlphaFold_Version',
    'Has_Experimental_Validation',
    'Validation_Details'
  ];

  let csv = headers.join(',') + '\n';

  interactions.rows.forEach(row => {
    const values = [
      row.id,
      row.bait_uniprot,
      row.bait_gene || '',
      row.prey_uniprot,
      row.prey_gene || '',
      row.ipsae || '',
      row.ipsae_confidence || '',
      row.iptm || '',
      row.interface_plddt || '',
      row.contacts_pae_lt_3 || '',
      row.contacts_pae_lt_6 || '',
      row.analysis_version || '',
      row.alphafold_version || '',
      row.has_experimental_validation,
      row.validation_details ? `"${row.validation_details.replace(/"/g, '""')}"` : ''
    ];
    csv += values.join(',') + '\n';
  });

  const filepath = path.join(RESULTS_DIR, 'supplementary_table_S1_all_interactions.csv');
  fs.writeFileSync(filepath, csv);
  console.log(`Exported ${interactions.rows.length} interactions to ${filepath}`);

  return interactions.rows.length;
}

/**
 * Export all proteins for Supplementary Table S2
 */
async function exportAllProteins() {
  console.log('\n=== EXPORTING ALL PROTEINS ===\n');

  const proteins = await sql`
    SELECT
      p.id,
      p.uniprot_id,
      p.gene_name,
      p.organism,
      COUNT(DISTINCT CASE WHEN i_bait.id IS NOT NULL THEN i_bait.id END) as times_as_bait,
      COUNT(DISTINCT CASE WHEN i_prey.id IS NOT NULL THEN i_prey.id END) as times_as_prey,
      COUNT(DISTINCT CASE WHEN i_bait.id IS NOT NULL THEN i_bait.id END) +
        COUNT(DISTINCT CASE WHEN i_prey.id IS NOT NULL THEN i_prey.id END) as total_interactions
    FROM proteins p
    LEFT JOIN interactions i_bait ON p.id = i_bait.bait_protein_id
    LEFT JOIN interactions i_prey ON p.id = i_prey.prey_protein_id
    GROUP BY p.id, p.uniprot_id, p.gene_name, p.organism
    ORDER BY total_interactions DESC
  `;

  // Convert to CSV
  const headers = [
    'Protein_ID',
    'UniProt_ID',
    'Gene_Name',
    'Organism',
    'Times_As_Bait',
    'Times_As_Prey',
    'Total_Interactions'
  ];

  let csv = headers.join(',') + '\n';

  proteins.rows.forEach(row => {
    const values = [
      row.id,
      row.uniprot_id,
      row.gene_name || '',
      row.organism || '',
      row.times_as_bait,
      row.times_as_prey,
      row.total_interactions
    ];
    csv += values.join(',') + '\n';
  });

  const filepath = path.join(RESULTS_DIR, 'supplementary_table_S2_proteins.csv');
  fs.writeFileSync(filepath, csv);
  console.log(`Exported ${proteins.rows.length} proteins to ${filepath}`);

  return proteins.rows.length;
}

/**
 * Generate confidence distribution data for plotting
 */
async function generateConfidenceDistribution() {
  console.log('\n=== GENERATING CONFIDENCE DISTRIBUTION ===\n');

  const distribution = await sql`
    SELECT
      ipsae,
      iptm,
      interface_plddt,
      contacts_pae_lt_3,
      ipsae_confidence
    FROM interactions
    ORDER BY ipsae DESC
  `;

  // Convert to CSV for plotting
  const headers = ['ipSAE', 'iPTM', 'Interface_pLDDT', 'PAE_Contacts_<3A', 'Confidence'];
  let csv = headers.join(',') + '\n';

  distribution.rows.forEach(row => {
    const values = [
      row.ipsae || '',
      row.iptm || '',
      row.interface_plddt || '',
      row.contacts_pae_lt_3 || '',
      row.ipsae_confidence || ''
    ];
    csv += values.join(',') + '\n';
  });

  const filepath = path.join(RESULTS_DIR, 'confidence_distribution.csv');
  fs.writeFileSync(filepath, csv);
  console.log(`Exported confidence distribution to ${filepath}`);
}

/**
 * Write summary overview text file
 */
function writeOverviewFile(stats, baitCount) {
  const content = `
IFT/BBSome Interactome Dataset Overview
Generated: ${new Date().toISOString()}

========================================
OVERALL STATISTICS
========================================

Total Interactions:      ${stats.totalInteractions}
Total Unique Proteins:   ${stats.totalProteins}
Total Bait Proteins:     ${stats.totalBaits}
Total Prey Proteins:     ${stats.totalPreys}

========================================
CONFIDENCE DISTRIBUTION
========================================

${stats.confidenceDistribution.map(row =>
  `${row.ipsae_confidence}:  ${row.count} interactions (${((row.count / stats.totalInteractions) * 100).toFixed(1)}%)
  - Average ipSAE: ${row.avg_ipsae}
  - Average iPTM: ${row.avg_iptm}
  - Average interface pLDDT: ${row.avg_interface_plddt}`
).join('\n\n')}

========================================
DATA QUALITY METRICS
========================================

AlphaFold Version:       AF3
Analysis Version:        v4 (ipSAE scoring)
Scoring Metrics:         ipSAE, iPTM, PAE contacts, interface pLDDT

Confidence Thresholds:
  - High:   ipSAE > 0.7
  - Medium: ipSAE 0.5-0.7
  - Low:    ipSAE < 0.5

========================================
DATASET COMPOSITION
========================================

See analysis/results/bait_summary.csv for per-bait statistics
See analysis/results/supplementary_table_S1_all_interactions.csv for full interaction list
See analysis/results/supplementary_table_S2_proteins.csv for protein list

========================================
`;

  const filepath = path.join(RESULTS_DIR, 'dataset_overview.txt');
  fs.writeFileSync(filepath, content);
  console.log(`\nWrote overview to ${filepath}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Starting dataset statistics analysis...\n');

    // 1. Get overall statistics
    const stats = await getDatasetStatistics();

    // 2. Get bait summary
    const baitSummary = await getBaitSummary();

    // 3. Export bait summary to CSV
    const baitHeaders = ['UniProt_ID', 'Gene_Name', 'Total_Interactions', 'High_Confidence', 'Medium_Confidence', 'Low_Confidence', 'Avg_ipSAE'];
    let baitCsv = baitHeaders.join(',') + '\n';
    baitSummary.forEach(row => {
      const values = [
        row.uniprot_id,
        row.gene_name || '',
        row.interaction_count,
        row.high_conf_count,
        row.medium_conf_count,
        row.low_conf_count,
        row.avg_ipsae
      ];
      baitCsv += values.join(',') + '\n';
    });
    fs.writeFileSync(path.join(RESULTS_DIR, 'bait_summary.csv'), baitCsv);
    console.log(`\nExported bait summary to ${path.join(RESULTS_DIR, 'bait_summary.csv')}`);

    // 4. Export all interactions
    await exportAllInteractions();

    // 5. Export all proteins
    await exportAllProteins();

    // 6. Generate confidence distribution
    await generateConfidenceDistribution();

    // 7. Write overview file
    writeOverviewFile(stats, baitSummary.length);

    console.log('\n✅ Dataset statistics analysis complete!\n');
    console.log('Output files:');
    console.log('  - analysis/results/dataset_overview.txt');
    console.log('  - analysis/results/bait_summary.csv');
    console.log('  - analysis/results/supplementary_table_S1_all_interactions.csv');
    console.log('  - analysis/results/supplementary_table_S2_proteins.csv');
    console.log('  - analysis/results/confidence_distribution.csv');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
