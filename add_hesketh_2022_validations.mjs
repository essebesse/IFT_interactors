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

const HESKETH_2022_VALIDATIONS = [
  // IFT-A1 module interactions
  {
    bait_uniprot: UNIPROT.IFT144,
    prey_uniprot: UNIPROT.IFT140,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Hesketh et al., 2022",
        pmid: "36462505",
        confidence: "high",
        notes: "TPR-mediated heterodimer; IFT-A1 module"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },
  // IFT-A2 module interactions
  {
    bait_uniprot: UNIPROT.IFT122,
    prey_uniprot: UNIPROT.IFT121,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Hesketh et al., 2022",
        pmid: "36462505",
        confidence: "high",
        notes: "TPR-mediated heterodimer; central to IFT-A"
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
    bait_uniprot: UNIPROT.IFT43,
    prey_uniprot: UNIPROT.IFT121,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Hesketh et al., 2022",
        pmid: "36462505",
        confidence: "high",
        notes: "IFT43 C-terminal region binds IFT121 TPR"
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
    bait_uniprot: UNIPROT.IFT43,
    prey_uniprot: UNIPROT.IFT139,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Hesketh et al., 2022",
        pmid: "36462505",
        confidence: "high",
        notes: "IFT43 bridges IFT121 and IFT139; essential for IFT139 stability"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },
  // Module-bridging interactions (IFT122 connects A1 and A2)
  {
    bait_uniprot: UNIPROT.IFT122,
    prey_uniprot: UNIPROT.IFT144,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Hesketh et al., 2022",
        pmid: "36462505",
        confidence: "high",
        notes: "IFT122 C-terminus in IFT-A1 module; bridges modules"
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
    bait_uniprot: UNIPROT.IFT122,
    prey_uniprot: UNIPROT.IFT139,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Hesketh et al., 2022",
        pmid: "36462505",
        confidence: "high",
        notes: "IFT122 N-terminus in IFT-A2 module with IFT139"
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

  console.log('Adding Hesketh et al., Cell 2022 IFT-A cryo-EM validations...\n');
  console.log('(Human IFT-A complex structure at 3-4 Å resolution)\n');

  for (const {bait_uniprot, prey_uniprot, validation} of HESKETH_2022_VALIDATIONS) {
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
  console.log(`\nTotal processed: ${HESKETH_2022_VALIDATIONS.length}`);

  process.exit(0);
}

addValidations();
