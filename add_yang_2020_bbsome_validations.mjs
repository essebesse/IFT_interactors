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
  BBS9: "Q3SYG4",  // BBIP10 / BBIP1
  BBS12: "Q6ZW61",
  BBS17: "Q9NQ48",  // LZTFL1
  ARL6: "Q9H0F7"    // BBS3
};

const YANG_2020_VALIDATIONS = [
  // ARL6 (BBS3) interactions with BBSome
  {
    bait_uniprot: UNIPROT.ARL6,
    prey_uniprot: UNIPROT.BBS1,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Yang et al., 2020",
        pmid: "32510327",
        confidence: "high",
        notes: "Primary binding site: ARL6-GTP binds BBS1 β-propeller (blades 1 and 7) via Switch 2 loop and helices α3 (residues 75-78) and α4 (residues 98-108). Resolution ~3.5 Å. PDB: 6VOA"
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
    bait_uniprot: UNIPROT.ARL6,
    prey_uniprot: UNIPROT.BBS7,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Yang et al., 2020",
        pmid: "32510327",
        confidence: "high",
        notes: "Secondary binding site: ARL6 contacts BBS7 linker (residues 320-335) connecting β-propeller with helix bundle. Linker is disordered in apo-BBSome but becomes ordered upon ARL6 binding. Resolution ~3.5 Å. PDB: 6VOA"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },
  // BBSome internal interactions - structural rearrangements upon ARL6 binding
  {
    bait_uniprot: UNIPROT.BBS1,
    prey_uniprot: UNIPROT.BBS4,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Yang et al., 2020",
        pmid: "32510327",
        confidence: "high",
        notes: "BBS1 β-propeller sits in cradle between BBS4 and BBS7. Upon ARL6 binding, BBS1 rotates ~25° and moves 13 Å. Resolution ~3.5 Å. PDB: 6VOA, 6VNW"
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
        study: "Yang et al., 2020",
        pmid: "32510327",
        confidence: "high",
        notes: "BBS1 β-propeller sits in cradle between BBS4 and BBS7. Conformational change upon ARL6 binding. Resolution ~3.5 Å. PDB: 6VOA, 6VNW"
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
    prey_uniprot: UNIPROT.BBS2,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Yang et al., 2020",
        pmid: "32510327",
        confidence: "high",
        notes: "BBS1 β-propeller adjacent to BBS2 β-propeller. Upon ARL6 binding, BBS1 moves 13 Å away from BBS2. Cavity for GPCR cargo binding flanked by BBS1 and BBS2 β-propellers. Resolution ~3.5 Å. PDB: 6VOA, 6VNW"
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
    bait_uniprot: UNIPROT.BBS2,
    prey_uniprot: UNIPROT.BBS7,
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Yang et al., 2020",
        pmid: "32510327",
        confidence: "high",
        notes: "BBS2 and BBS7 β-propellers form part of GPCR cargo binding cavity. Resolution ~3.5 Å. PDB: 6VOA, 6VNW"
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
        study: "Yang et al., 2020",
        pmid: "32510327",
        confidence: "high",
        notes: "BBS4 and BBS8 in BBSome body, flanking GPCR cargo binding cavity. Resolution ~3.5 Å. PDB: 6VOA, 6VNW"
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

  console.log('Adding Yang et al., eLife 2020 BBSome-ARL6 cryo-EM validations...\n');
  console.log('(Near-atomic resolution BBSome structures with and without ARL6)\n');

  for (const {bait_uniprot, prey_uniprot, validation} of YANG_2020_VALIDATIONS) {
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
  console.log(`\nTotal processed: ${YANG_2020_VALIDATIONS.length}`);

  process.exit(0);
}

addValidations();
