/**
 * VALIDATION SCRIPT TEMPLATE
 *
 * Use this template when adding experimental validation data to the database.
 *
 * CRITICAL: This template ensures BOTH directions of reciprocal interactions
 * are updated with the same validation data.
 *
 * Example: If you validate BBS1↔ARL6, both BBS1→ARL6 AND ARL6→BBS1
 * will receive the validation entry.
 */

import { sql } from '@vercel/postgres';

// =====================================================================
// CONFIGURATION: Edit this section for your validation data
// =====================================================================

const VALIDATION_DATA = [
  {
    bait: 'Q8NFJ9',      // Bait UniProt ID
    prey: 'P51610',      // Prey UniProt ID
    method: 'Y2H',       // Experimental method
    study: 'Smith et al., 2023',  // Study citation
    pmid: '12345678',    // PubMed ID
    doi: '10.1234/example',       // DOI
    confidence: 'high',  // high, medium, or low
    notes: ''            // Optional notes
  },
  // Add more validations here...
];

// =====================================================================
// MAIN SCRIPT: Do not modify below this line
// =====================================================================

async function addValidations() {
  console.log('🔬 Adding experimental validations...\n');

  let added = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const validation of VALIDATION_DATA) {
    const { bait, prey, method, study, pmid, doi, confidence, notes } = validation;

    console.log(`Processing: ${bait} ↔ ${prey} (${study})`);

    try {
      // Find ALL interactions matching this pair (both directions)
      const interactions = await sql`
        SELECT
          i.id,
          b.gene_name as bait_gene,
          p.gene_name as prey_gene,
          b.uniprot_id as bait_uniprot,
          p.uniprot_id as prey_uniprot,
          i.experimental_validation
        FROM interactions i
        JOIN proteins b ON i.bait_protein_id = b.id
        JOIN proteins p ON i.prey_protein_id = p.id
        WHERE (b.uniprot_id = ${bait} AND p.uniprot_id = ${prey})
           OR (b.uniprot_id = ${prey} AND p.uniprot_id = ${bait})
      `;

      if (interactions.rows.length === 0) {
        console.log(`  ❌ No interaction found for ${bait} ↔ ${prey}`);
        errors++;
        continue;
      }

      console.log(`  Found ${interactions.rows.length} direction(s) to update`);

      // Process each direction
      for (const interaction of interactions.rows) {
        const existingValidation = interaction.experimental_validation;

        // Check if this specific validation already exists
        const existingMethods = existingValidation?.experimental_methods || [];
        const alreadyExists = existingMethods.some(
          m => m.study === study && m.method === method
        );

        if (alreadyExists) {
          console.log(`  ⏭️  SKIP: ${interaction.bait_gene}→${interaction.prey_gene} (validation already exists)`);
          skipped++;
          continue;
        }

        // Add new validation method
        const newMethod = {
          method,
          study,
          pmid,
          doi,
          confidence,
          bait_protein: interaction.bait_gene,
          notes: notes || ''
        };

        const updatedMethods = [...existingMethods, newMethod];

        // Recalculate validation summary
        const validationSummary = {
          is_validated: true,
          validation_count: updatedMethods.length,
          strongest_method: determineStrongestMethod(updatedMethods),
          consensus_confidence: determineConsensusConfidence(updatedMethods)
        };

        const newValidation = {
          experimental_methods: updatedMethods,
          validation_summary: validationSummary
        };

        // Update the interaction
        await sql`
          UPDATE interactions
          SET experimental_validation = ${JSON.stringify(newValidation)}
          WHERE id = ${interaction.id}
        `;

        if (existingMethods.length === 0) {
          console.log(`  ✅ ADDED: ${interaction.bait_gene}→${interaction.prey_gene} (${updatedMethods.length} validation)`);
          added++;
        } else {
          console.log(`  🔄 UPDATED: ${interaction.bait_gene}→${interaction.prey_gene} (${existingMethods.length} → ${updatedMethods.length} validations)`);
          updated++;
        }
      }

      console.log('');

    } catch (err) {
      console.error(`  ❌ ERROR processing ${bait} ↔ ${prey}:`, err.message);
      errors++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  Added (new): ${added}`);
  console.log(`  Updated (appended): ${updated}`);
  console.log(`  Skipped (duplicate): ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total validations processed: ${VALIDATION_DATA.length}`);

  process.exit(errors > 0 ? 1 : 0);
}

function determineStrongestMethod(methods) {
  // Prioritize structural > biochemical > MS
  const priority = {
    'Crystal structure': 100,
    'Cryo-EM': 90,
    'NMR': 85,
    'Biochemical reconstitution': 70,
    'Pulldown': 60,
    'Co-IP': 60,
    'Y2H': 50,
    'XL-MS': 45,
    'SF-TAP-MS': 40,
    'TAP-MS': 35,
    'MS': 30
  };

  let strongest = methods[0];
  let maxPriority = 0;

  for (const method of methods) {
    const p = priority[method.method] || 0;
    if (p > maxPriority) {
      maxPriority = p;
      strongest = method;
    }
  }

  return strongest.method;
}

function determineConsensusConfidence(methods) {
  const confidences = methods.map(m => m.confidence);
  if (confidences.includes('high')) return 'high';
  if (confidences.includes('medium')) return 'medium';
  return 'low';
}

// Run the script
addValidations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
