#!/usr/bin/env node

/**
 * Generate Comprehensive Supplementary Data File
 *
 * Creates:
 * 1. Excel file with 5 sheets (README, Interactions, Proteins, Candidates, Validation)
 * 2. JSON file with complete dataset
 *
 * Uses current database data (548 interactions, 392 proteins, 35 baits)
 */

import { sql } from '@vercel/postgres';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = '.';
const CANDIDATES_FILE = '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/candidates_updated3.txt';

async function main() {
  console.log('📊 Generating Supplementary Data File...\n');

  try {
    // 1. Fetch all interactions from database
    console.log('Step 1: Fetching interactions from database...');
    const interactionsResult = await sql`
      SELECT
        pb.uniprot_id as bait_uniprot,
        pb.gene_name as bait_gene,
        pb.organism as bait_organism,
        pp.uniprot_id as prey_uniprot,
        pp.gene_name as prey_gene,
        pp.organism as prey_organism,
        i.ipsae,
        i.ipsae_confidence as ipsae_confidence_class,
        i.iptm,
        i.interface_plddt as mean_interface_plddt,
        i.contacts_pae_lt_3,
        i.contacts_pae_lt_6,
        i.analysis_version,
        i.alphafold_version,
        i.source_path,
        i.confidence as quality_class,
        i.experimental_validation
      FROM interactions i
      JOIN proteins pb ON i.bait_protein_id = pb.id
      JOIN proteins pp ON i.prey_protein_id = pp.id
      ORDER BY i.ipsae DESC, pb.gene_name, pp.gene_name
    `;

    const interactions = interactionsResult.rows;
    console.log(`  ✓ Fetched ${interactions.length} interactions`);

    // 2. Fetch all proteins with network statistics
    console.log('\nStep 2: Calculating protein network statistics...');
    const proteinsResult = await sql`
      SELECT
        p.uniprot_id,
        p.gene_name,
        p.organism,
        p.organism_code,
        COUNT(DISTINCT CASE WHEN i.bait_protein_id = p.id THEN i.prey_protein_id END) as interactions_as_bait,
        COUNT(DISTINCT CASE WHEN i.prey_protein_id = p.id THEN i.bait_protein_id END) as interactions_as_prey,
        COUNT(DISTINCT CASE WHEN i.bait_protein_id = p.id THEN i.prey_protein_id
                            WHEN i.prey_protein_id = p.id THEN i.bait_protein_id END) as total_interactions
      FROM proteins p
      LEFT JOIN interactions i ON (i.bait_protein_id = p.id OR i.prey_protein_id = p.id)
      WHERE EXISTS (
        SELECT 1 FROM interactions i2
        WHERE i2.bait_protein_id = p.id OR i2.prey_protein_id = p.id
      )
      GROUP BY p.id, p.uniprot_id, p.gene_name, p.organism, p.organism_code
      ORDER BY total_interactions DESC, p.gene_name
    `;

    const proteins = proteinsResult.rows;
    console.log(`  ✓ Calculated statistics for ${proteins.length} proteins`);

    // 3. Read candidates file
    console.log('\nStep 3: Reading prey candidates list...');
    const candidatesText = fs.readFileSync(CANDIDATES_FILE, 'utf-8');
    const candidatesList = candidatesText.split('\n').filter(line => line.trim());
    const candidates = candidatesList.map(uniprot_id => ({ uniprot_id: uniprot_id.trim() }));
    console.log(`  ✓ Read ${candidates.length} prey candidates`);

    // 4. Get validation statistics
    console.log('\nStep 4: Calculating experimental validation statistics...');
    const validatedResult = await sql`
      SELECT
        pb.gene_name as bait_gene,
        pp.gene_name as prey_gene,
        i.ipsae,
        i.ipsae_confidence,
        i.experimental_validation
      FROM interactions i
      JOIN proteins pb ON i.bait_protein_id = pb.id
      JOIN proteins pp ON i.prey_protein_id = pp.id
      WHERE i.experimental_validation IS NOT NULL
        AND i.experimental_validation::text != 'null'
        AND i.experimental_validation::text != '{}'
      ORDER BY i.ipsae DESC
    `;

    const validatedInteractions = validatedResult.rows.map(row => {
      const validation = typeof row.experimental_validation === 'string'
        ? JSON.parse(row.experimental_validation)
        : row.experimental_validation;

      const methods = validation?.experimental_methods || [];
      const methodList = methods.map(m => m.method).join(', ') || 'Unknown';
      const studyList = methods.map(m => m.study).join('; ') || 'Unknown';
      const validationCount = methods.length || 0;

      return {
        bait_gene: row.bait_gene,
        prey_gene: row.prey_gene,
        ipsae: row.ipsae,
        ipsae_confidence: row.ipsae_confidence,
        validation_methods: methodList,
        validation_studies: studyList,
        validation_count: validationCount
      };
    });

    console.log(`  ✓ Found ${validatedInteractions.length} experimentally validated interactions`);

    // 5. Create README sheet content
    console.log('\nStep 5: Generating README metadata...');
    const currentDate = new Date().toISOString().split('T')[0];

    const readmeData = [
      ['Supplementary Data File 1: Complete IFT/BBSome Interaction Dataset'],
      [''],
      ['Overview'],
      ['This file contains the complete AlphaFold3-predicted protein-protein interaction network'],
      ['for human Intraflagellar Transport (IFT) and BBSome proteins.'],
      [''],
      ['Dataset Statistics'],
      ['Total Interactions:', interactions.length],
      ['Total Proteins:', proteins.length],
      ['Unique Baits:', new Set(interactions.map(i => i.bait_uniprot)).size],
      ['Prey Candidate Library:', candidates.length],
      ['Experimentally Validated:', validatedInteractions.length],
      ['Export Date:', currentDate],
      [''],
      ['Analysis Details'],
      ['AlphaFold Version:', 'AF3'],
      ['Analysis Version:', 'v4.0'],
      ['Primary Metric:', 'ipSAE (interface Predicted Aligned Error Structure-based Average Estimate)'],
      ['Reference:', 'Dunbrack RL Jr. bioRxiv 2025. doi: 10.1101/2025.02.10.637595'],
      ['PAE Cutoff:', '10.0 Angstroms'],
      ['Spatial Validation:', 'Cβ-Cβ distance ≤ 8Å'],
      [''],
      ['Confidence Classification'],
      ['High (ipSAE > 0.7):', 'Strong evidence, virtually no false positives'],
      ['Medium (ipSAE 0.5-0.7):', 'Likely genuine interaction'],
      ['Low (ipSAE 0.3-0.5):', 'Weak signal, requires visual inspection'],
      ['Excluded (ipSAE < 0.3):', 'Likely non-interaction, not included in dataset'],
      [''],
      ['Sheet Descriptions'],
      ['Sheet 1 (README):', 'This metadata and documentation'],
      ['Sheet 2 (All_Interactions):', `Complete interaction dataset (${interactions.length} entries)`],
      ['Sheet 3 (Proteins):', `All proteins with network statistics (${proteins.length} entries)`],
      ['Sheet 4 (Candidates):', `Prey library used for screening (${candidates.length} proteins)`],
      ['Sheet 5 (Experimental_Validation):', `Literature-validated interactions (${validatedInteractions.length} entries)`],
      [''],
      ['Column Descriptions - All_Interactions Sheet'],
      ['bait_uniprot:', 'UniProt identifier for bait protein'],
      ['bait_gene:', 'Gene name for bait protein'],
      ['prey_uniprot:', 'UniProt identifier for prey protein'],
      ['prey_gene:', 'Gene name for prey protein'],
      ['ipsae:', 'ipSAE score (0-1 scale, higher = stronger interaction confidence)'],
      ['ipsae_confidence_class:', 'Confidence classification (High/Medium/Low)'],
      ['iptm:', 'Interface predicted TM-score from AlphaFold3'],
      ['mean_interface_plddt:', 'Mean per-residue confidence for interface residues'],
      ['contacts_pae_lt_3:', 'Residue pairs with PAE < 3Å and Cβ-Cβ ≤ 8Å'],
      ['contacts_pae_lt_6:', 'Residue pairs with PAE < 6Å and Cβ-Cβ ≤ 8Å'],
      ['source_path:', 'Path to original AlphaFold3 prediction directory'],
      [''],
      ['Column Descriptions - Proteins Sheet'],
      ['uniprot_id:', 'UniProt identifier'],
      ['gene_name:', 'Gene name'],
      ['organism:', 'Species (Homo sapiens)'],
      ['interactions_as_bait:', 'Number of interactions where protein was used as bait'],
      ['interactions_as_prey:', 'Number of interactions where protein was detected as prey'],
      ['total_interactions:', 'Total unique interaction partners (network degree)'],
      [''],
      ['Web Interface'],
      ['Interactive viewer:', 'https://ift-interactors.vercel.app/'],
      ['Source code:', 'https://github.com/essebesse/IFT_interactors'],
      [''],
      ['Citation'],
      ['If you use this data, please cite:'],
      ['[Manuscript in preparation]'],
      ['Web tool: https://ift-interactors.vercel.app/']
    ];

    // 6. Create Excel workbook
    console.log('\nStep 6: Creating Excel workbook...');
    const wb = XLSX.utils.book_new();

    // Add README sheet
    const wsReadme = XLSX.utils.aoa_to_sheet(readmeData);
    XLSX.utils.book_append_sheet(wb, wsReadme, 'README');

    // Add All_Interactions sheet
    const wsInteractions = XLSX.utils.json_to_sheet(interactions.map(i => ({
      bait_uniprot: i.bait_uniprot,
      bait_gene: i.bait_gene,
      bait_organism: i.bait_organism,
      prey_uniprot: i.prey_uniprot,
      prey_gene: i.prey_gene,
      prey_organism: i.prey_organism,
      ipsae: i.ipsae,
      ipsae_confidence_class: i.ipsae_confidence_class,
      iptm: i.iptm,
      mean_interface_plddt: i.mean_interface_plddt,
      contacts_pae_lt_3: i.contacts_pae_lt_3,
      contacts_pae_lt_6: i.contacts_pae_lt_6,
      analysis_version: i.analysis_version,
      alphafold_version: i.alphafold_version,
      source_path: i.source_path,
      quality_class: i.quality_class
    })));
    XLSX.utils.book_append_sheet(wb, wsInteractions, 'All_Interactions');

    // Add Proteins sheet
    const wsProteins = XLSX.utils.json_to_sheet(proteins.map(p => ({
      uniprot_id: p.uniprot_id,
      gene_name: p.gene_name,
      organism: p.organism,
      organism_code: p.organism_code,
      interactions_as_bait: parseInt(p.interactions_as_bait) || 0,
      interactions_as_prey: parseInt(p.interactions_as_prey) || 0,
      total_interactions: parseInt(p.total_interactions) || 0
    })));
    XLSX.utils.book_append_sheet(wb, wsProteins, 'Proteins');

    // Add Candidates sheet
    const wsCandidates = XLSX.utils.json_to_sheet(candidates);
    XLSX.utils.book_append_sheet(wb, wsCandidates, 'Candidates');

    // Add Experimental_Validation sheet
    const wsValidation = XLSX.utils.json_to_sheet(validatedInteractions);
    XLSX.utils.book_append_sheet(wb, wsValidation, 'Experimental_Validation');

    // Write Excel file
    const xlsxPath = path.join(OUTPUT_DIR, 'Supplementary_Data_File_1_Complete_Dataset.xlsx');
    XLSX.writeFile(wb, xlsxPath);
    console.log(`  ✓ Created Excel file: ${xlsxPath}`);

    // 7. Create JSON file
    console.log('\nStep 7: Creating JSON file...');
    const jsonData = {
      metadata: {
        title: "Ciliary Protein Interaction Network - Complete Dataset",
        description: "AlphaFold3 predicted interactions for IFT and BBSome proteins",
        analysis_version: "v4.0",
        analysis_method: "ipSAE scoring (Dunbrack 2025)",
        date_exported: new Date().toISOString(),
        total_interactions: interactions.length,
        total_proteins: proteins.length,
        total_baits: new Set(interactions.map(i => i.bait_uniprot)).size,
        prey_candidates: candidates.length,
        experimentally_validated: validatedInteractions.length,
        scoring_method: {
          primary_metric: "ipSAE (interface Predicted Aligned Error Structure-based Average Estimate)",
          pae_cutoff: "10.0 Angstroms",
          spatial_validation: "Cβ-Cβ distance ≤ 8Å",
          reference: "Dunbrack RL Jr. bioRxiv 2025. doi: 10.1101/2025.02.10.637595"
        },
        confidence_classification: {
          high: "ipSAE > 0.7 (strong evidence, virtually no false positives)",
          medium: "ipSAE 0.5-0.7 (likely genuine interaction)",
          low: "ipSAE 0.3-0.5 (weak signal, requires visual inspection)",
          very_low_excluded: "ipSAE < 0.3 (likely non-interaction, excluded from dataset)"
        },
        organisms: "Homo sapiens",
        web_interface: "https://ift-interactors.vercel.app/",
        source_code: "https://github.com/essebesse/IFT_interactors"
      },
      column_descriptions: {
        bait_uniprot: "UniProt identifier for bait protein",
        bait_gene: "Gene name for bait protein",
        bait_organism: "Species (Homo sapiens)",
        prey_uniprot: "UniProt identifier for prey protein",
        prey_gene: "Gene name for prey protein",
        prey_organism: "Species (Homo sapiens)",
        ipsae: "ipSAE score (0-1 scale, higher = stronger interaction confidence)",
        ipsae_confidence_class: "Confidence classification based on ipSAE score",
        iptm: "Interface predicted TM-score from AlphaFold3",
        mean_interface_plddt: "Mean per-residue confidence score for interface residues",
        contacts_pae_lt_3: "Number of residue pairs with PAE < 3Å and Cβ-Cβ ≤ 8Å",
        contacts_pae_lt_6: "Number of residue pairs with PAE < 6Å and Cβ-Cβ ≤ 8Å",
        analysis_version: "Analysis pipeline version",
        alphafold_version: "AlphaFold version used for prediction",
        source_path: "Path to original AlphaFold3 prediction directory",
        quality_class: "Original quality classification from v3 analysis"
      },
      interactions: interactions,
      proteins: proteins,
      candidates: candidates,
      experimental_validation: validatedInteractions
    };

    const jsonPath = path.join(OUTPUT_DIR, 'Supplementary_Data_File_1_Complete_Dataset.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log(`  ✓ Created JSON file: ${jsonPath}`);

    // 8. Summary
    console.log('\n✅ SUMMARY');
    console.log('━'.repeat(60));
    console.log(`📊 Interactions:              ${interactions.length}`);
    console.log(`👥 Proteins:                  ${proteins.length}`);
    console.log(`🎯 Unique Baits:              ${new Set(interactions.map(i => i.bait_uniprot)).size}`);
    console.log(`📋 Prey Candidates:           ${candidates.length}`);
    console.log(`✓  Experimentally Validated:  ${validatedInteractions.length} (${((validatedInteractions.length / interactions.length) * 100).toFixed(1)}%)`);
    console.log('━'.repeat(60));
    console.log('\n📁 Output Files:');
    console.log(`   • ${xlsxPath}`);
    console.log(`   • ${jsonPath}`);
    console.log('\n🎉 Supplementary data file generation complete!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
