#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

// UniProt IDs
const UNIPROT = {
  IFT88: "Q13099",
  IFT81: "Q8WYA0",
  IFT74: "Q96LB3",
  IFT70: "Q86WT1",
  IFT52: "Q9Y366",
  IFT46: "Q9NQC8",
  IFT27: "Q9BW83",
  IFT22: "Q9H7X7",
  IFT57: "Q9NWB7",
  IFT38: "Q96AJ1",
  IFT54: "Q8TDR0",
  IFT20: "Q8IY31",
  IFT172: "Q9Y4G2",
  IFT80: "Q9P2H3"
};

const PETRIMAN_VALIDATIONS = [
  // Crystal structures
  {
    bait_uniprot: UNIPROT.IFT88,
    prey_uniprot: UNIPROT.IFT70,
    validation: {
      experimental_methods: [{
        method: "Crystal structure",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "IFT88(1-437)/70/52(281-360) crystal structure"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Crystal structure",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT88,
    prey_uniprot: UNIPROT.IFT52,
    validation: {
      experimental_methods: [{
        method: "Crystal structure",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "IFT88(1-437)/70/52(281-360) crystal structure"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Crystal structure",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT70,
    prey_uniprot: UNIPROT.IFT52,
    validation: {
      experimental_methods: [{
        method: "Crystal structure",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "IFT70/52(330-430)/46(165-319) crystal structure"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Crystal structure",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT70,
    prey_uniprot: UNIPROT.IFT46,
    validation: {
      experimental_methods: [{
        method: "Crystal structure",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "IFT70/52(330-430)/46(165-319) crystal structure"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Crystal structure",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT52,
    prey_uniprot: UNIPROT.IFT46,
    validation: {
      experimental_methods: [{
        method: "Crystal structure",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "IFT70/52(330-430)/46(165-319) crystal structure"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Crystal structure",
        consensus_confidence: "high"
      }
    }
  },

  // XL-MS for IFT46 interactions
  {
    bait_uniprot: UNIPROT.IFT46,
    prey_uniprot: UNIPROT.IFT81,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "IFT46 cross-links to IFT81 C-terminus (K575-K618)"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT46,
    prey_uniprot: UNIPROT.IFT74,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "IFT46 cross-links to IFT74 C-terminus (K581-K608)"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT52,
    prey_uniprot: UNIPROT.IFT81,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "IFT52 K411/K415 cross-links to IFT81 K598/K600/K607"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT46,
    prey_uniprot: UNIPROT.IFT27,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: ""
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  },

  // IFT-B2 tetramer XL-MS/AlphaFold
  {
    bait_uniprot: UNIPROT.IFT38,
    prey_uniprot: UNIPROT.IFT54,
    validation: {
      experimental_methods: [{
        method: "XL-MS/AlphaFold",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "IFT38 CH-domain on IFT54/20, 26 cross-links"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS/AlphaFold",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT38,
    prey_uniprot: UNIPROT.IFT20,
    validation: {
      experimental_methods: [{
        method: "XL-MS/AlphaFold",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "IFT38 CH-domain on IFT54/20, 26 cross-links"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS/AlphaFold",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT57,
    prey_uniprot: UNIPROT.IFT54,
    validation: {
      experimental_methods: [{
        method: "XL-MS/AlphaFold",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "Anti-parallel four-helix bundle tetramer"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS/AlphaFold",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT57,
    prey_uniprot: UNIPROT.IFT20,
    validation: {
      experimental_methods: [{
        method: "XL-MS/AlphaFold",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "Anti-parallel four-helix bundle tetramer"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS/AlphaFold",
        consensus_confidence: "high"
      }
    }
  },

  // IFT22 XL-MS to IFT81/74 central region
  {
    bait_uniprot: UNIPROT.IFT22,
    prey_uniprot: UNIPROT.IFT81,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "Cross-links to central part of IFT81/74"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT22,
    prey_uniprot: UNIPROT.IFT74,
    validation: {
      experimental_methods: [{
        method: "XL-MS",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "Cross-links to central part of IFT81/74"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "XL-MS",
        consensus_confidence: "high"
      }
    }
  },

  // IFT172-IFT80 pulldown
  {
    bait_uniprot: UNIPROT.IFT172,
    prey_uniprot: UNIPROT.IFT80,
    validation: {
      experimental_methods: [{
        method: "Pulldown",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "medium",
        notes: "Weak interaction, substoichiometric. TPR-TPR interaction (IFT172 626-785 with IFT80 583-627)"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Pulldown",
        consensus_confidence: "medium"
      }
    }
  }
];

async function addValidations() {
  let added = 0;
  let notFound = 0;
  let hasValidation = 0;

  console.log('Adding Petriman et al., 2022 additional validations...\n');
  console.log('(Crystal structures, XL-MS, AlphaFold, Pulldowns)\n');

  for (const {bait_uniprot, prey_uniprot, validation} of PETRIMAN_VALIDATIONS) {
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

      const method = validation.experimental_methods[0];
      console.log(`✅ ${row.bait} ↔ ${row.prey} - ${method.method}`);
      added++;

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Added: ${added}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`💡 Already validated: ${hasValidation}`);
  console.log(`\nTotal processed: ${PETRIMAN_VALIDATIONS.length}`);

  process.exit(0);
}

addValidations();
