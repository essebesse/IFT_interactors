#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

// UniProt IDs for human BBSome proteins
const UNIPROT = {
  BBS1: "Q8NFJ9",
  BBS2: "Q9BXC9",
  BBS4: "Q96RK4",
  BBS5: "Q8N3I7",
  BBS7: "Q8IWZ6",
  BBS8: "Q8TAM2",
  BBS9: "Q3SYG4",  // BBIP10
  BBS18: "A8MTZ0"  // BBIP1
};

const CHOU_2019_VALIDATIONS = [
  // HEAD MODULE
  {
    bait_uniprot: UNIPROT.BBS2,
    prey_uniprot: UNIPROT.BBS7,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "Coiled-coil heterodimer (BBS2 334-363 ↔ BBS7 340-363); 4.9 Å + XL-MS + Rosetta"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },
  // NECK MODULE
  {
    bait_uniprot: UNIPROT.BBS2,
    prey_uniprot: UNIPROT.BBS9,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "Neck formation; BBS2-BBS9 coiled-coil; 4.9 Å + XL-MS"
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
    bait_uniprot: UNIPROT.BBS7,
    prey_uniprot: UNIPROT.BBS9,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "Neck contact; tertiary (Y2H negative); 4.9 Å + XL-MS"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },
  // BODY CORE - BBS4-BBS8 TPR SCAFFOLD
  {
    bait_uniprot: UNIPROT.BBS4,
    prey_uniprot: UNIPROT.BBS8,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "Y-shaped TPR scaffold; BBS8 C-term ⊥ BBS4 midsection; 4.9 Å + XL-MS"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },
  // BBS18 U-BOLT CLAMPING
  {
    bait_uniprot: UNIPROT.BBS18,
    prey_uniprot: UNIPROT.BBS4,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "U-bolt clamping; BBS18 threads through BBS4 TPR; 4.9 Å + XL-MS"
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
    bait_uniprot: UNIPROT.BBS18,
    prey_uniprot: UNIPROT.BBS8,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "U-bolt clamping; BBS18 threads through BBS8 TPR; 4.9 Å + XL-MS"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },
  // BBS1 WRAPPING (DUAL DOMAIN)
  {
    bait_uniprot: UNIPROT.BBS1,
    prey_uniprot: UNIPROT.BBS4,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "β-propeller to N-terminal TPR; patient mutations at interface; 4.9 Å + XL-MS"
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
    bait_uniprot: UNIPROT.BBS1,
    prey_uniprot: UNIPROT.BBS8,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "GAE domain to central TPR; patient mutations at interface; 4.9 Å + XL-MS"
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
    bait_uniprot: UNIPROT.BBS1,
    prey_uniprot: UNIPROT.BBS7,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "β-propeller in cradle between BBS4 and BBS7; 4.9 Å + XL-MS"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },
  // BBS9 AS CENTRAL SCAFFOLD
  {
    bait_uniprot: UNIPROT.BBS9,
    prey_uniprot: UNIPROT.BBS1,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "BBS9 engulfs BBS1 GAE domain; central scaffold; 4.9 Å + XL-MS + Y2H"
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
    bait_uniprot: UNIPROT.BBS9,
    prey_uniprot: UNIPROT.BBS4,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "BBS9 wraps around BBS4; central scaffold; 4.9 Å + XL-MS"
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
    bait_uniprot: UNIPROT.BBS9,
    prey_uniprot: UNIPROT.BBS8,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "BBS9 β-propeller binds BBS8 N-terminal TPR; 4.9 Å + XL-MS + Y2H"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },
  // BBS5 PERIPHERAL (DUAL PH DOMAINS)
  {
    bait_uniprot: UNIPROT.BBS5,
    prey_uniprot: UNIPROT.BBS9,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "Both PH domains bind BBS9 β-propeller; 4.9 Å + XL-MS + Y2H"
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
    bait_uniprot: UNIPROT.BBS5,
    prey_uniprot: UNIPROT.BBS8,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "One PH domain also contacts BBS8; 4.9 Å + XL-MS"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },
  // CROSSLINK-SPECIFIC (DISORDERED REGIONS)
  {
    bait_uniprot: UNIPROT.BBS1,
    prey_uniprot: UNIPROT.BBS4,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Chou et al., 2019",
        pmid: "31303482",
        confidence: "high",
        notes: "BBS1 insertion ↔ BBS4 N-terminus; multiple crosslinks in disordered regions"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  }
];

async function addValidations() {
  let added = 0;
  let notFound = 0;
  let hasValidation = 0;

  console.log('Adding Chou et al., Structure 2019 BBSome validations...\n');
  console.log('(Native BBSome: 4.9 Å cryo-EM + 76 XL-MS crosslinks + Rosetta modeling)\n');
  console.log('Integrated structural approach with 42 inter-subunit crosslinks\n');

  for (const {bait_uniprot, prey_uniprot, validation} of CHOU_2019_VALIDATIONS) {
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
  console.log(`\nTotal processed: ${CHOU_2019_VALIDATIONS.length}`);

  process.exit(0);
}

addValidations();
