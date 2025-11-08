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
  BBS4: "Q96RK4",
  BBS5: "Q8N3I7",
  BBS8: "Q8TAM2",
  BBS9: "Q3SYG4",  // BBIP10
  BBS18: "A8MTZ0"  // BBIP1
};

const KLINK_2020_VALIDATIONS = [
  // Core BBSome interactions from heterohexameric complex (BBS1/4/5/8/9/18)
  {
    bait_uniprot: UNIPROT.BBS1,
    prey_uniprot: UNIPROT.BBS9,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Klink et al., 2020",
        pmid: "31951201",
        confidence: "high",
        notes: "Human BBSome core; BBS9 forms structural scaffold; ~3.8 Å"
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
    prey_uniprot: UNIPROT.BBS4,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Klink et al., 2020",
        pmid: "31951201",
        confidence: "high",
        notes: "Human BBSome core; part of core assembly; ~3.8 Å"
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
        study: "Klink et al., 2020",
        pmid: "31951201",
        confidence: "high",
        notes: "Human BBSome core; BBS8 contacts with BBS1; ~3.8 Å"
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
    bait_uniprot: UNIPROT.BBS4,
    prey_uniprot: UNIPROT.BBS8,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Klink et al., 2020",
        pmid: "31951201",
        confidence: "high",
        notes: "Human BBSome core; stable BBS4-BBS8 subcomplex; ~3.8 Å"
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
    bait_uniprot: UNIPROT.BBS4,
    prey_uniprot: UNIPROT.BBS9,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Klink et al., 2020",
        pmid: "31951201",
        confidence: "high",
        notes: "Human BBSome core; BBS9 scaffold interacts with BBS4; ~3.8 Å"
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
    bait_uniprot: UNIPROT.BBS8,
    prey_uniprot: UNIPROT.BBS9,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Klink et al., 2020",
        pmid: "31951201",
        confidence: "high",
        notes: "Human BBSome core; BBS8 and BBS9 direct contacts; ~3.8 Å"
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
    prey_uniprot: UNIPROT.BBS18,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Klink et al., 2020",
        pmid: "31951201",
        confidence: "high",
        notes: "Human BBSome core; BBS18 adaptor protein binds BBS1; ~3.8 Å"
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
    prey_uniprot: UNIPROT.BBS9,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Klink et al., 2020",
        pmid: "31951201",
        confidence: "high",
        notes: "Human BBSome core; BBS5 peripheral positioning; poorly resolved; ~3.8 Å"
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

  console.log('Adding Klink et al., eLife 2020 human BBSome core validations...\n');
  console.log('(Heterohexameric core: BBS1/4/5/8/9/18; ~3.8 Å cryo-EM)\n');
  console.log('Human recombinant BBSome lacking BBS2 and BBS7\n');

  for (const {bait_uniprot, prey_uniprot, validation} of KLINK_2020_VALIDATIONS) {
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
  console.log(`\nTotal processed: ${KLINK_2020_VALIDATIONS.length}`);

  process.exit(0);
}

addValidations();
