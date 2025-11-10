#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

// IFT-A proteins
const IFTA_PROTEINS = {
  IFT144: "Q8NEZ3",
  IFT140: "Q96RY7",
  IFT139: "Q7Z4L5",
  IFT122: "Q9HBG6",
  IFT121: "Q9P2L0",
  IFT43: "Q96FT9"
};

async function checkIFTAValidations() {
  console.log('🔍 Checking IFT-A interaction validations...\n');

  const interactions = [];

  // Get all IFT-A interactions
  for (const [baitName, baitId] of Object.entries(IFTA_PROTEINS)) {
    for (const [preyName, preyId] of Object.entries(IFTA_PROTEINS)) {
      if (baitId >= preyId) continue; // Avoid duplicates

      const result = await sql`
        SELECT i.id, i.experimental_validation,
               b.gene_name as bait, p.gene_name as prey
        FROM interactions i
        JOIN proteins b ON i.bait_protein_id = b.id
        JOIN proteins p ON i.prey_protein_id = p.id
        WHERE (b.uniprot_id = ${baitId} AND p.uniprot_id = ${preyId})
           OR (b.uniprot_id = ${preyId} AND p.uniprot_id = ${baitId})
        LIMIT 1
      `;

      if (result.rows.length > 0) {
        const row = result.rows[0];
        const validation = row.experimental_validation;

        interactions.push({
          bait: row.bait || baitName,
          prey: row.prey || preyName,
          validated: validation && validation.experimental_methods ? validation.experimental_methods.length > 0 : false,
          count: validation && validation.experimental_methods ? validation.experimental_methods.length : 0,
          methods: validation && validation.experimental_methods ? validation.experimental_methods : []
        });
      }
    }
  }

  // Sort by validation count (highest first)
  interactions.sort((a, b) => b.count - a.count);

  console.log('📊 IFT-A Interaction Validation Summary\n');
  console.log('═'.repeat(80));

  let totalValidated = 0;
  let multiValidated = 0;

  for (const int of interactions) {
    if (int.validated) {
      totalValidated++;
      if (int.count > 1) multiValidated++;

      const statusEmoji = int.count > 1 ? '✅✅' : '✅';
      console.log(`\n${statusEmoji} ${int.bait} ↔ ${int.prey}: ${int.count} validation(s)`);

      for (const method of int.methods) {
        console.log(`   • ${method.study} - ${method.method} (${method.pmid})`);
      }
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`\n📈 Statistics:`);
  console.log(`   Total IFT-A interactions found: ${interactions.length}`);
  console.log(`   Validated: ${totalValidated}`);
  console.log(`   Multi-validated (2+ papers): ${multiValidated}`);
  console.log(`   Single validation: ${totalValidated - multiValidated}`);
  console.log(`   Not validated: ${interactions.length - totalValidated}`);

  // Show which papers are contributing
  console.log(`\n📚 Papers Contributing to Validations:`);
  const papers = {};
  for (const int of interactions) {
    if (int.validated) {
      for (const method of int.methods) {
        papers[method.study] = (papers[method.study] || 0) + 1;
      }
    }
  }

  for (const [paper, count] of Object.entries(papers).sort((a, b) => b[1] - a[1])) {
    console.log(`   • ${paper}: ${count} interactions`);
  }

  // Identify interactions that SHOULD have multiple validations
  console.log(`\n⚠️  Interactions That Should Have Multiple Validations:`);
  console.log(`    (if scripts were all run successfully)\n`);

  const expectedMulti = [
    "IFT144 ↔ IFT140 (Hesketh, Meleppattu, McCafferty)",
    "IFT122 ↔ IFT144 (Hesketh, Meleppattu, McCafferty)",
    "IFT122 ↔ IFT121 (Hesketh, McCafferty)",
    "IFT121 ↔ IFT139 (Hesketh, McCafferty, Quidwai)",
    "IFT121 ↔ IFT43 (Hesketh, McCafferty, Quidwai)",
    "IFT122 ↔ IFT140 (Meleppattu, McCafferty, Quidwai)",
    "IFT140 ↔ IFT144 (Meleppattu, McCafferty)",
    "IFT122 ↔ IFT139 (Hesketh, Meleppattu)"
  ];

  for (const expected of expectedMulti) {
    console.log(`   • ${expected}`);
  }

  console.log(`\n✨ Done!\n`);
  process.exit(0);
}

checkIFTAValidations();
