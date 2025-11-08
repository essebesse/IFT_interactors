#!/usr/bin/env node
/**
 * Check validation status in the database
 */

import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ POSTGRES_URL environment variable is not set.');
  process.exit(1);
}

async function checkValidationStatus() {
  try {
    // Count total and validated interactions
    const countResult = await sql`
      SELECT
        COUNT(*) as total_interactions,
        COUNT(experimental_validation) as validated_interactions
      FROM interactions
    `;

    console.log('📊 Database Validation Status\n');
    console.log('Total interactions:', countResult.rows[0].total_interactions);
    console.log('Validated interactions:', countResult.rows[0].validated_interactions);
    console.log('Validation rate:',
      (parseInt(countResult.rows[0].validated_interactions) / parseInt(countResult.rows[0].total_interactions) * 100).toFixed(2) + '%\n');

    // Get validated interactions if any exist
    if (parseInt(countResult.rows[0].validated_interactions) > 0) {
      const validatedResults = await sql`
        SELECT
          i.id,
          b.gene_name as bait_gene,
          b.uniprot_id as bait_uniprot,
          p.gene_name as prey_gene,
          p.uniprot_id as prey_uniprot,
          i.ipsae,
          i.ipsae_confidence,
          i.experimental_validation
        FROM interactions i
        JOIN proteins b ON i.bait_protein_id = b.id
        JOIN proteins p ON i.prey_protein_id = p.id
        WHERE i.experimental_validation IS NOT NULL
        ORDER BY i.id
      `;

      console.log('✅ Validated Interactions:\n');
      console.log('ID\tBait\tPrey\tipSAE\tValidation Info');
      console.log('─'.repeat(80));

      validatedResults.rows.forEach(row => {
        const validation = row.experimental_validation;
        let validationInfo = '';

        // Handle both validation formats
        if (validation.experimental_methods) {
          // New format with multiple methods
          validationInfo = validation.experimental_methods.map(m => m.method).join(', ');
        } else if (validation.method) {
          // Old format with single method
          validationInfo = validation.method + (validation.source ? ` (${validation.source})` : '');
        }

        console.log(`${row.id}\t${row.bait_gene}\t${row.prey_gene}\t${row.ipsae?.toFixed(3) || 'N/A'}\t${validationInfo}`);
      });

      console.log('\n📋 Detailed Validation Data:\n');
      validatedResults.rows.forEach(row => {
        console.log(`\n${row.bait_gene} (${row.bait_uniprot}) ↔ ${row.prey_gene} (${row.prey_uniprot})`);
        console.log(`  ID: ${row.id} | ipSAE: ${row.ipsae?.toFixed(3)} (${row.ipsae_confidence})`);
        console.log('  Validation:', JSON.stringify(row.experimental_validation, null, 2));
      });
    } else {
      console.log('ℹ️  No validated interactions found in database.');
      console.log('\nTo add validation data, you can:');
      console.log('1. Use scripts/import_experimental_data.mjs to import from published studies');
      console.log('2. Manually add validation data using a script');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

checkValidationStatus();
