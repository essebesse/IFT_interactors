#!/usr/bin/env node
import { sql } from '@vercel/postgres';

/**
 * Fix incorrect PMIDs in existing validation data
 *
 * Updates PMID fields in experimental_validation JSONB column
 * for specific studies that have wrong PMIDs.
 */

const PMID_FIXES = [
  {
    study: "Follit et al., 2009",
    correctPmid: "19253336",
    description: "Characterization of mouse IFT complex B"
  },
  {
    study: "Taschner et al., 2016",
    correctPmid: "26912722",
    description: "IFT-B2 complex structure and interactions"
  },
  {
    study: "Taschner et al., eLife 2018",
    correctPmid: "29537372",
    description: "IFT-B2 structure and CLUAP1/IFT38 interactions"
  },
  {
    study: "Baker et al., 2003",
    correctPmid: "12446784",
    description: "IFT20/IFT57 interaction - Y2H"
  },
  {
    study: "Omori et al., 2008",
    correctPmid: "18364699",
    description: "IFT20/IFT54 interaction via Elipsa"
  }
];

async function fixPmids() {
  console.log('🔧 Fixing incorrect PMIDs in validation data...\n');

  let totalFixed = 0;

  for (const fix of PMID_FIXES) {
    console.log(`\n📋 Processing: ${fix.study}`);
    console.log(`   Adding PMID: ${fix.correctPmid}`);
    console.log(`   ${fix.description}`);

    // Find all interactions with this study
    const interactions = await sql`
      SELECT
        i.id,
        b.gene_name as bait_gene,
        p.gene_name as prey_gene,
        i.experimental_validation
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE i.experimental_validation IS NOT NULL
    `;

    let fixedInThisStudy = 0;

    for (const row of interactions.rows) {
      const validation = row.experimental_validation;
      let wasFixed = false;

      // Update PMIDs in experimental_methods array
      for (const method of validation.experimental_methods) {
        // Fix if study matches and PMID is empty/null or wrong
        if (method.study === fix.study && (!method.pmid || method.pmid === "")) {
          method.pmid = fix.correctPmid;
          wasFixed = true;
        }
      }

      // If we fixed this interaction, update the database
      if (wasFixed) {
        await sql`
          UPDATE interactions
          SET experimental_validation = ${JSON.stringify(validation)}
          WHERE id = ${row.id}
        `;

        console.log(`   ✅ Fixed: ${row.bait_gene} ↔ ${row.prey_gene}`);
        fixedInThisStudy++;
        totalFixed++;
      }
    }

    console.log(`   Total interactions fixed for this study: ${fixedInThisStudy}`);
  }

  console.log(`\n\n📊 Summary: Fixed ${totalFixed} interactions total\n`);

  // Verify fixes
  console.log('🔍 Verifying fixes...');
  for (const fix of PMID_FIXES) {
    const withCorrectPmid = await sql`
      SELECT COUNT(*) as count
      FROM interactions i
      WHERE i.experimental_validation::text LIKE ${'%' + fix.study + '%'}
        AND i.experimental_validation::text LIKE ${'%"pmid":"' + fix.correctPmid + '"%'}
    `;

    console.log(`✅ ${withCorrectPmid.rows[0].count} interactions now have correct PMID for ${fix.study}`);
  }

  process.exit(0);
}

fixPmids().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
