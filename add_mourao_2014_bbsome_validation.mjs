#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

// UniProt IDs
const UNIPROT = {
  ARL6: "Q9H0F7",  // BBS3
  BBS1: "Q8NFJ9"
};

const MOURA O_2014_VALIDATIONS = [
  {
    bait_uniprot: UNIPROT.ARL6,
    prey_uniprot: UNIPROT.BBS1,
    validation: {
      experimental_methods: [{
        method: "Crystal structure",
        study: "Mourão et al., 2014",
        pmid: "25402481",
        confidence: "high",
        notes: "ARL6-GTP binds BBS1 β-propeller at blades 1 and 7; Kd=0.35 μM; GTP-dependent; C. reinhardtii structures; PDB: 4V0M"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Crystal structure",
        consensus_confidence: "high"
      }
    }
  }
];

async function addValidations() {
  let added = 0;
  let notFound = 0;
  let hasValidation = 0;

  console.log('Adding Mourão et al., Nat Struct Mol Biol 2014 BBSome validation...\n');
  console.log('(ARL6-GTP membrane recruitment of BBSome)\n');
  console.log('Foundational crystal structure showing GTP-dependent BBSome recruitment\n');

  for (const {bait_uniprot, prey_uniprot, validation} of MOURA O_2014_VALIDATIONS) {
    try {
      const result = await sql`
        SELECT i.id, i.experimental_validation,
               b.gene_name as bait, p.gene_name as prey
        FROM interactions i
        JOIN proteins b ON i.bait_protein_id = b.id
        JOIN proteins p ON i.prey_protein_id = p.id
        WHERE (b.uniprot_id = ${bait_uniprot} AND p.uniprot_id = ${prey_uniprot})
           OR (b.uniprot_id = ${prey_uniprot} AND p.uniprot_id = ${bait_uniprot})
        LIMIT 1
      `;

      if (result.rows.length === 0) {
        console.log(`⚠️  Not found: ${bait_uniprot} ↔ ${prey_uniprot}`);
        notFound++;
        continue;
      }

      const row = result.rows[0];

      if (row.experimental_validation) {
        console.log(`💡 Already has validation: ${row.bait} ↔ ${row.prey}`);
        hasValidation++;
        continue;
      }

      await sql`
        UPDATE interactions
        SET experimental_validation = ${JSON.stringify(validation)}
        WHERE id = ${row.id}
      `;

      console.log(`✅ Added: ${row.bait} ↔ ${row.prey} - ${validation.experimental_methods[0].method}`);
      added++;

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Added: ${added}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`💡 Already validated: ${hasValidation}`);
  console.log(`\nTotal processed: ${MOURA O_2014_VALIDATIONS.length}`);

  process.exit(0);
}

addValidations();
