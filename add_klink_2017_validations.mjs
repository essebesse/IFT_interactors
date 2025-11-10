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
  BBS8: "Q8TAM2",  // Also known as TTC8
  BBS9: "Q3SYG4",  // Check if in database - may need to verify
  BBS18: "A8MTZ0"  // BBIP1
};

const KLINK_2017_VALIDATIONS = [
  // ============================================================================
  // Klink et al., eLife 2017
  // "A recombinant BBSome core complex and how it interacts with ciliary cargo"
  // PMID: 29168691
  // ============================================================================
  //
  // Key finding: Successfully expressed stable heterohexameric BBSome core
  // complex in insect cells (baculovirus/Sf9 system) consisting of:
  // BBS1, BBS4, BBS5, BBS8, BBS9, and BBS18 (BBIP1)
  //
  // Methods: Recombinant co-expression, co-purification, pull-down assays,
  // size exclusion chromatography, negative-stain EM
  // ============================================================================

  // HIGH CONFIDENCE: BBS18-BBS4 interaction
  // This is well-documented as a direct interaction
  {
    bait_uniprot: UNIPROT.BBS18,
    prey_uniprot: UNIPROT.BBS4,
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Klink et al., eLife 2017",
        pmid: "29168691",
        confidence: "high",
        notes: "BBS18 forms stable subcomplex with BBS4 in insect cells; part of heterohexameric core (BBS1/4/5/8/9/18)"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },

  // HIGH CONFIDENCE: BBS18-BBS8 interaction
  // BBS18 shown to be part of BBS4/8/9 subcomplex
  {
    bait_uniprot: UNIPROT.BBS18,
    prey_uniprot: UNIPROT.BBS8,
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Klink et al., eLife 2017",
        pmid: "29168691",
        confidence: "high",
        notes: "Part of stable BBS4/8/9/18 subcomplex; heterohexameric core complex"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },

  // HIGH CONFIDENCE: BBS4-BBS8 interaction
  // These co-purify in the stable subcomplex
  {
    bait_uniprot: UNIPROT.BBS4,
    prey_uniprot: UNIPROT.BBS8,
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Klink et al., eLife 2017",
        pmid: "29168691",
        confidence: "high",
        notes: "Co-purify in heterohexameric core complex; BBS4/8/9/18 forms stable subcomplex"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },

  // MEDIUM CONFIDENCE: BBS1-BBS5 interaction
  // Part of the heterohexameric complex, but direct interaction not explicitly shown
  {
    bait_uniprot: UNIPROT.BBS1,
    prey_uniprot: UNIPROT.BBS5,
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Klink et al., eLife 2017",
        pmid: "29168691",
        confidence: "medium",
        notes: "Co-purify in heterohexameric core complex (BBS1/4/5/8/9/18); direct vs indirect interaction unclear"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "medium"
      }
    }
  },

  // MEDIUM CONFIDENCE: BBS1-BBS4 interaction
  // Part of heterohexamer
  {
    bait_uniprot: UNIPROT.BBS1,
    prey_uniprot: UNIPROT.BBS4,
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Klink et al., eLife 2017",
        pmid: "29168691",
        confidence: "medium",
        notes: "Co-purify in heterohexameric core complex; direct vs indirect interaction unclear"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "medium"
      }
    }
  },

  // MEDIUM CONFIDENCE: BBS5-BBS8 interaction
  {
    bait_uniprot: UNIPROT.BBS5,
    prey_uniprot: UNIPROT.BBS8,
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Klink et al., eLife 2017",
        pmid: "29168691",
        confidence: "medium",
        notes: "Co-purify in heterohexameric core complex; direct vs indirect interaction unclear"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "medium"
      }
    }
  }
];

async function addValidations() {
  let added = 0;
  let notFound = 0;
  let hasValidation = 0;

  console.log('Adding Klink et al., eLife 2017 BBSome validations...\n');
  console.log('Paper: "A recombinant BBSome core complex and how it interacts with ciliary cargo"');
  console.log('PMID: 29168691\n');
  console.log('Methods: Recombinant co-expression in insect cells (baculovirus)');
  console.log('Key finding: Stable heterohexameric core (BBS1/4/5/8/9/18)\n');

  for (const {bait_uniprot, prey_uniprot, validation} of KLINK_2017_VALIDATIONS) {
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

      console.log(`✅ Added: ${row.bait} ↔ ${row.prey} - ${validation.experimental_methods[0].confidence} confidence`);
      added++;

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Added: ${added}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`💡 Already validated: ${hasValidation}`);
  console.log(`\nTotal processed: ${KLINK_2017_VALIDATIONS.length}`);

  process.exit(0);
}

addValidations();
