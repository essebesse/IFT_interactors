#!/usr/bin/env node
import { sql } from '@vercel/postgres';

/**
 * Fix ALL missing PMIDs in existing validation data
 *
 * This script comprehensively adds PMIDs to all studies that are missing them.
 * It maps study names to their correct PubMed IDs and updates the database.
 */

const PMID_MAP = {
  // Y2H validations (from scripts/add_y2h_validations.mjs)
  "Zhao and Malicki, 2011": "21911474",
  "Howard et al., 2013": "23900041",
  "Fan et al., 2010": "20844675",
  "Lucker et al., 2005": "16199535",
  "Kobayashi et al., 2007": "17522048",
  "Lucker et al., 2010": "20844675",
  "Swiderski et al., 2014": "24413085",

  // Structural validations (from add_structural_validations.mjs)
  "Taschner et al., 2011": "21642430",  // Biochemical reconstitution
  "Taschner et al., 2014": "25349261",  // Crystal structures
  "Wachter et al., EMBO J 2019": "31267579",  // IFT74/81/22 structures

  // Petriman validations
  "Petriman et al., 2022": "36354106",  // XL-MS and crystal structures

  // IFT-B2 validations
  "Follit et al., 2009": "19253336",
  "Taschner et al., 2016": "26912722",
  "Taschner et al., eLife 2018": "29537372",
  "Omori et al., 2008": "18364699",
  "Baker et al., 2003": "12446784",

  // BBSome validations
  "Chou et al., 2019": "31204441",
  "Singh et al., eLife 2020": "32065582",
  "Yang et al., 2020": "32433612",
  "Klink et al., 2020": "32001099",
  "Mourão et al., 2014": "24469635",

  // IFT-A validations
  "Behal et al., 2012": "22274696",
  "Meleppattu et al., 2022": "36098543",
  "Hesketh et al., 2022": "35771941",
  "Jiang et al., 2023": "37192666",
  "Quidwai et al., 2021": "34289341",
  "McCafferty et al., 2022": "35287320",
  "Kanie et al., 2017": "28167787",

  // Other validations
  "Lacey et al., 2024": "38749426",
  "Beyer et al., 2018": "29844425",
  "Katoh et al., 2016": "27298323"
};

async function fixAllMissingPmids() {
  console.log('🔧 Comprehensive PMID Fix - Adding ALL missing PMIDs...\n');
  console.log(`Processing ${Object.keys(PMID_MAP).length} different studies\n`);

  let totalFixed = 0;
  let totalInteractions = 0;
  const fixedByStudy = {};

  // Get all interactions with validations
  const allInteractions = await sql`
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

  console.log(`Found ${allInteractions.rows.length} interactions with validation data\n`);

  for (const row of allInteractions.rows) {
    const validation = row.experimental_validation;
    let wasFixed = false;
    let fixedCount = 0;

    // Check each validation method
    for (const method of validation.experimental_methods) {
      const correctPmid = PMID_MAP[method.study];

      if (correctPmid && (!method.pmid || method.pmid === "")) {
        method.pmid = correctPmid;
        wasFixed = true;
        fixedCount++;

        // Track fixes by study
        if (!fixedByStudy[method.study]) {
          fixedByStudy[method.study] = 0;
        }
        fixedByStudy[method.study]++;
      }
    }

    // Update database if any PMIDs were fixed
    if (wasFixed) {
      await sql`
        UPDATE interactions
        SET experimental_validation = ${JSON.stringify(validation)}
        WHERE id = ${row.id}
      `;

      console.log(`✅ ${row.bait_gene} ↔ ${row.prey_gene}: Fixed ${fixedCount} PMID(s)`);
      totalFixed += fixedCount;
      totalInteractions++;
    }
  }

  console.log(`\n\n📊 Summary:\n`);
  console.log(`  Total PMIDs fixed: ${totalFixed}`);
  console.log(`  Interactions updated: ${totalInteractions}`);
  console.log(`\n📋 Breakdown by study:\n`);

  Object.entries(fixedByStudy)
    .sort((a, b) => b[1] - a[1])
    .forEach(([study, count]) => {
      console.log(`  ${study}: ${count} PMID(s) added (PMID: ${PMID_MAP[study]})`);
    });

  // Verification: Count remaining empty PMIDs
  console.log('\n\n🔍 Verification:\n');

  const remaining = await sql`
    SELECT COUNT(*) as count
    FROM interactions i
    WHERE i.experimental_validation::text LIKE '%"pmid":""%'
       OR i.experimental_validation::text LIKE '%"pmid":null%'
  `;

  if (remaining.rows[0].count > 0) {
    console.log(`⚠️  ${remaining.rows[0].count} interactions still have empty/null PMIDs`);
    console.log('   Run check_empty_pmids.mjs to investigate');
  } else {
    console.log('✅ All validations now have PMIDs!');
  }

  process.exit(0);
}

fixAllMissingPmids().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
