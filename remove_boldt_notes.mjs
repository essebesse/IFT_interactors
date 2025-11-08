#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

async function removeBoldtNotes() {
  console.log('Removing notes from Boldt et al., 2016 validations...\n');

  try {
    // Get all interactions with Boldt validations
    const result = await sql`
      SELECT i.id, i.experimental_validation,
             b.gene_name as bait, p.gene_name as prey
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE i.experimental_validation::text LIKE '%Boldt et al., 2016%'
    `;

    console.log(`Found ${result.rows.length} interactions with Boldt validations\n`);

    let updated = 0;

    for (const row of result.rows) {
      const validation = row.experimental_validation;
      let modified = false;

      // Update each Boldt validation method to have empty notes
      for (const method of validation.experimental_methods) {
        if (method.study === 'Boldt et al., 2016') {
          method.notes = '';
          modified = true;
        }
      }

      if (modified) {
        await sql`
          UPDATE interactions
          SET experimental_validation = ${JSON.stringify(validation)}
          WHERE id = ${row.id}
        `;
        console.log(`✅ Updated: ${row.bait} ↔ ${row.prey}`);
        updated++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Updated: ${updated} interactions`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }

  process.exit(0);
}

removeBoldtNotes();
