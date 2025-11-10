#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

// Update the co-purification validations to specify Chlamydomonas
async function updateValidations() {
  console.log('Updating Quidwai et al., 2021 co-purification validations to specify Chlamydomonas...\n');

  const updates = [
    { bait: 'WDR35', prey: 'IFT43', newNote: 'Recombinant Chlamydomonas trimeric complex IFT139/121/43; SEC purification' },
    { bait: 'IFT43', prey: 'TTC21B', newNote: 'IFT121-mediated interaction; Chlamydomonas trimeric complex' }
  ];

  let updated = 0;

  for (const { bait, prey, newNote } of updates) {
    try {
      // Find the interaction
      const result = await sql`
        SELECT i.id, i.experimental_validation,
               b.gene_name as bait_gene, p.gene_name as prey_gene
        FROM interactions i
        JOIN proteins b ON i.bait_protein_id = b.id
        JOIN proteins p ON i.prey_protein_id = p.id
        WHERE (b.gene_name = ${bait} AND p.gene_name = ${prey})
           OR (b.gene_name = ${prey} AND p.gene_name = ${bait})
      `;

      if (result.rows.length === 0) {
        console.log(`⚠️  Not found: ${bait} ↔ ${prey}`);
        continue;
      }

      // Process all matching interactions (may be duplicates with swapped bait/prey)
      for (const row of result.rows) {
        const validation = row.experimental_validation;

        if (!validation || !validation.experimental_methods) {
          continue;
        }

        // Find and update the Quidwai 2021 Co-purification method
        let found = false;
        for (const method of validation.experimental_methods) {
          if (method.study === 'Quidwai et al., 2021' && method.method === 'Co-purification') {
            method.notes = newNote;
            found = true;
            break;
          }
        }

        if (!found) {
          continue;
        }

        // Update the database
        await sql`
          UPDATE interactions
          SET experimental_validation = ${JSON.stringify(validation)}
          WHERE id = ${row.id}
        `;

        console.log(`✅ Updated: ${row.bait_gene} ↔ ${row.prey_gene} (ID: ${row.id})`);
        updated++;
      }

    } catch (error) {
      console.error(`❌ Error updating ${bait} ↔ ${prey}: ${error.message}`);
    }
  }

  console.log(`\n📊 Summary: Updated ${updated} validations`);
  process.exit(0);
}

updateValidations();
