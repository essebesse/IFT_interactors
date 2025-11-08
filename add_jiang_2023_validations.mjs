#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

// UniProt IDs for human IFT-A proteins
const UNIPROT = {
  IFT144: "Q8NEZ3", // WDR19
  IFT140: "Q96RY7",
  IFT139: "Q7Z4L5", // TTC21B
  IFT122: "Q9HBG6",
  IFT121: "Q9P2L0", // WDR35
  IFT43: "Q96FT9"
};

const JIANG_2023_VALIDATIONS = [
  // Core IFT-A interactions with zinc-binding domain details
  {
    bait_uniprot: UNIPROT.IFT140,
    prey_uniprot: UNIPROT.IFT121,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Jiang et al., 2023",
        pmid: "36775821",
        confidence: "high",
        notes: "Inter-propeller interaction; IFT-A polymerization interface"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT121,
    prey_uniprot: UNIPROT.IFT144,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Jiang et al., 2023",
        pmid: "36775821",
        confidence: "high",
        notes: "Connects core and peripheral subcomplexes"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  }
];

async function addValidations() {
  let added = 0;
  let notFound = 0;
  let hasValidation = 0;

  console.log('Adding Jiang et al., Cell Research 2023 IFT-A validations...\n');
  console.log('(Human IFT-A lariat structure at 3.0-3.9 Å resolution)\n');
  console.log('Note: Discovered zinc-binding domains linking subcomplexes\n');

  for (const {bait_uniprot, prey_uniprot, validation} of JIANG_2023_VALIDATIONS) {
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
  console.log(`\nTotal processed: ${JIANG_2023_VALIDATIONS.length}`);

  process.exit(0);
}

addValidations();
