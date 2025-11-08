#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

// UniProt IDs
const UNIPROT = {
  IFT20: "Q8IY31",
  IFT54: "Q8TDR0",
  IFT57: "Q9NWB7",
  IFT38: "Q96AJ1",
  IFT172: "Q9Y4G2",
  IFT88: "Q13099",
  IFT52: "Q9Y366",
  IFT80: "Q9P2H3"
};

const IFTB2_VALIDATIONS = [
  // Medium confidence - Pulldown
  {
    bait_uniprot: UNIPROT.IFT20,
    prey_uniprot: UNIPROT.IFT54,
    validation: {
      experimental_methods: [{
        method: "Pulldown",
        study: "Omori et al., 2008",
        pmid: "",
        confidence: "medium",
        notes: "C-terminal coiled-coil region of IFT54"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Pulldown",
        consensus_confidence: "medium"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT20,
    prey_uniprot: UNIPROT.IFT54,
    validation: {
      experimental_methods: [{
        method: "Pulldown",
        study: "Follit et al., 2009",
        pmid: "",
        confidence: "medium",
        notes: ""
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Pulldown",
        consensus_confidence: "medium"
      }
    }
  },

  // Medium confidence - Y2H
  {
    bait_uniprot: UNIPROT.IFT20,
    prey_uniprot: UNIPROT.IFT57,
    validation: {
      experimental_methods: [{
        method: "Y2H",
        study: "Baker et al., 2003",
        pmid: "",
        confidence: "medium",
        notes: ""
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Y2H",
        consensus_confidence: "medium"
      }
    }
  },

  // High confidence - Biochemical reconstitution
  {
    bait_uniprot: UNIPROT.IFT54,
    prey_uniprot: UNIPROT.IFT20,
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Taschner et al., 2016",
        pmid: "",
        confidence: "high",
        notes: "Stable IFT54/20 complex, Chlamydomonas"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT57,
    prey_uniprot: UNIPROT.IFT38,
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Taschner et al., 2016",
        pmid: "",
        confidence: "high",
        notes: "Strong binding, stable heterodimer"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT57,
    prey_uniprot: UNIPROT.IFT172,
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Taschner et al., 2016",
        pmid: "",
        confidence: "high",
        notes: "IFT57/38 directly interacts with IFT172"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT88,
    prey_uniprot: UNIPROT.IFT52,
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Taschner et al., 2016",
        pmid: "",
        confidence: "high",
        notes: "IFT88/52N directly contacts IFT57/38"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },

  // IFT80 interactions - High confidence
  {
    bait_uniprot: UNIPROT.IFT80,
    prey_uniprot: UNIPROT.IFT38,
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Taschner et al., 2016",
        pmid: "",
        confidence: "high",
        notes: "IFT80 interacts with CLUAP1/IFT38"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT80,
    prey_uniprot: UNIPROT.IFT38,
    validation: {
      experimental_methods: [{
        method: "Biochemical reconstitution",
        study: "Taschner et al., eLife 2018",
        pmid: "",
        confidence: "high",
        notes: "IFT80 interacts with CLUAP1/IFT38"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Biochemical reconstitution",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT80,
    prey_uniprot: UNIPROT.IFT172,
    validation: {
      experimental_methods: [{
        method: "AlphaFold + Biochemistry",
        study: "Petriman et al., 2022",
        pmid: "",
        confidence: "high",
        notes: "IFT80-IFT172 direct interaction"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "AlphaFold + Biochemistry",
        consensus_confidence: "high"
      }
    }
  },
  {
    bait_uniprot: UNIPROT.IFT80,
    prey_uniprot: UNIPROT.IFT172,
    validation: {
      experimental_methods: [{
        method: "Cryo-ET structure",
        study: "Lacey and Pigino, 2023",
        pmid: "",
        confidence: "high",
        notes: "Structural validation of IFT80-IFT172"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-ET structure",
        consensus_confidence: "high"
      }
    }
  }
];

async function addValidations() {
  let added = 0;
  let notFound = 0;
  let hasValidation = 0;

  console.log('Adding IFT-B2 peripheral validations...\n');

  for (const {bait_uniprot, prey_uniprot, validation} of IFTB2_VALIDATIONS) {
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
      console.log(`✅ ${row.bait} ↔ ${row.prey} - ${method.method} - ${method.study}`);
      added++;

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Added: ${added}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`💡 Already validated: ${hasValidation}`);
  console.log(`\nTotal processed: ${IFTB2_VALIDATIONS.length}`);

  process.exit(0);
}

addValidations();
