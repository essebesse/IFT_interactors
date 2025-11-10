#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

// UniProt IDs for BBSome proteins
const UNIPROT = {
  BBS1: "Q8NFJ9",
  BBS2: "Q9BXC9",
  BBS4: "Q96RK4",
  BBS5: "Q8N3I7",
  BBS7: "Q8IWZ6",
  BBS8: "Q8TAM2",
  BBS9: "Q3SYG4",   // BBIP10
  BBS18: "A8MTZ0",  // BBIP1
  ARL6: "Q9H0F7"    // BBS3
};

// All 49 BBSome validations from 6 papers
const ALL_BBSOME_VALIDATIONS = [
  // ========== SINGH 2020 (12 validations) ==========
  // Head module
  {
    bait: UNIPROT.BBS2, prey: UNIPROT.BBS7,
    method: "Cryo-EM", study: "Singh et al., 2020", pmid: "31939736",
    confidence: "high", notes: "Asymmetric coiled-coil heterodimer; head module"
  },
  // Neck module
  {
    bait: UNIPROT.BBS2, prey: UNIPROT.BBS9,
    method: "Cryo-EM", study: "Singh et al., 2020", pmid: "31939736",
    confidence: "high", notes: "Coiled-coil neck; connects head to body"
  },
  {
    bait: UNIPROT.BBS7, prey: UNIPROT.BBS9,
    method: "Cryo-EM", study: "Singh et al., 2020", pmid: "31939736",
    confidence: "high", notes: "BBS7 contacts midpoint of BBS2-BBS9 neck"
  },
  // Body core
  {
    bait: UNIPROT.BBS4, prey: UNIPROT.BBS8,
    method: "Cryo-EM", study: "Singh et al., 2020", pmid: "31939736",
    confidence: "high", notes: "TPR-TPR interaction; BBS8 C-terminus perpendicular to BBS4 midsection"
  },
  // BBS9 scaffold
  {
    bait: UNIPROT.BBS9, prey: UNIPROT.BBS4,
    method: "Cryo-EM", study: "Singh et al., 2020", pmid: "31939736",
    confidence: "high", notes: "BBS9 wraps around BBS4; scaffold interaction"
  },
  {
    bait: UNIPROT.BBS9, prey: UNIPROT.BBS1,
    method: "Cryo-EM", study: "Singh et al., 2020", pmid: "31939736",
    confidence: "high", notes: "BBS9 engulfs BBS1 GAE domain with C-terminal domains"
  },
  // BBS1 connections
  {
    bait: UNIPROT.BBS1, prey: UNIPROT.BBS4,
    method: "Cryo-EM", study: "Singh et al., 2020", pmid: "31939736",
    confidence: "high", notes: "BBS1 β-propeller to N-terminal BBS4 TPR"
  },
  {
    bait: UNIPROT.BBS1, prey: UNIPROT.BBS8,
    method: "Cryo-EM", study: "Singh et al., 2020", pmid: "31939736",
    confidence: "high", notes: "BBS1 GAE domain to BBS8 TPR"
  },
  // BBS5 PH domains
  {
    bait: UNIPROT.BBS5, prey: UNIPROT.BBS9,
    method: "Cryo-EM", study: "Singh et al., 2020", pmid: "31939736",
    confidence: "high", notes: "Dual PH domains of BBS5 bind BBS9 β-propeller"
  },
  {
    bait: UNIPROT.BBS5, prey: UNIPROT.BBS8,
    method: "Cryo-EM", study: "Singh et al., 2020", pmid: "31939736",
    confidence: "high", notes: "One PH domain contacts BBS8"
  },
  // ARL6 activation
  {
    bait: UNIPROT.ARL6, prey: UNIPROT.BBS1,
    method: "Cryo-EM", study: "Singh et al., 2020", pmid: "31939736",
    confidence: "high", notes: "ARL6-GTP binds BBS1 β-propeller blades 1 & 7; triggers swiveling"
  },
  {
    bait: UNIPROT.ARL6, prey: UNIPROT.BBS7,
    method: "Cryo-EM", study: "Singh et al., 2020", pmid: "31939736",
    confidence: "high", notes: "Composite binding site; BBS7 loop orders upon ARL6 binding"
  },

  // ========== CHOU 2019 (15 validations) ==========
  // All overlapping interactions + unique ones
  {
    bait: UNIPROT.BBS2, prey: UNIPROT.BBS7,
    method: "Cryo-EM + XL-MS", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "Coiled-coil res 334-363 (BBS2), 340-363 (BBS7); chaperonin-mediated"
  },
  {
    bait: UNIPROT.BBS2, prey: UNIPROT.BBS9,
    method: "Cryo-EM + XL-MS + Y2H", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "BBS9 directly binds BBS2 (Y2H confirmed); forms ternary core"
  },
  {
    bait: UNIPROT.BBS7, prey: UNIPROT.BBS9,
    method: "Cryo-EM", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "Structural proximity; Y2H negative (no direct binding)"
  },
  {
    bait: UNIPROT.BBS4, prey: UNIPROT.BBS8,
    method: "Cryo-EM + XL-MS", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "Y-shaped TPR spine; C-terminus BBS8 perpendicular to BBS4"
  },
  // BBS18 U-bolt (UNIQUE to Chou 2019)
  {
    bait: UNIPROT.BBS18, prey: UNIPROT.BBS4,
    method: "Cryo-EM + XL-MS", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "BBS18 U-bolt threads through BBS4 TPR; 93-residue unfolded clamp"
  },
  {
    bait: UNIPROT.BBS18, prey: UNIPROT.BBS8,
    method: "Cryo-EM + XL-MS", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "BBS18 U-bolt threads through BBS8 TPR; clamps BBS4-BBS8 spine"
  },
  {
    bait: UNIPROT.BBS1, prey: UNIPROT.BBS4,
    method: "Cryo-EM + XL-MS", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "β-propeller to N-terminal TPR; patient mutations at interface"
  },
  {
    bait: UNIPROT.BBS1, prey: UNIPROT.BBS8,
    method: "Cryo-EM + XL-MS", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "GAE domain to TPR; patient mutations disrupt interface"
  },
  {
    bait: UNIPROT.BBS1, prey: UNIPROT.BBS7,
    method: "Cryo-EM + XL-MS", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "BBS1 sits in cradle between BBS4 and BBS7; positions for ARL6"
  },
  {
    bait: UNIPROT.BBS9, prey: UNIPROT.BBS1,
    method: "Cryo-EM + XL-MS + Y2H", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "BBS9 engulfs BBS1 GAE; Y2H confirms direct interaction"
  },
  {
    bait: UNIPROT.BBS9, prey: UNIPROT.BBS4,
    method: "Cryo-EM + XL-MS", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "BBS9 wraps around BBS4; central scaffold"
  },
  {
    bait: UNIPROT.BBS9, prey: UNIPROT.BBS8,
    method: "Cryo-EM + XL-MS + Y2H", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "BBS9 β-propeller to BBS8 N-terminal TPR; Y2H confirmed"
  },
  {
    bait: UNIPROT.BBS5, prey: UNIPROT.BBS9,
    method: "Cryo-EM + XL-MS + Y2H", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "Dual PH domains bind BBS9 β-propeller; Y2H confirmed"
  },
  {
    bait: UNIPROT.BBS5, prey: UNIPROT.BBS8,
    method: "Cryo-EM + XL-MS", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "One PH domain contacts BBS8; dual connectivity"
  },
  {
    bait: UNIPROT.BBS1, prey: UNIPROT.BBS4,
    method: "XL-MS", study: "Chou et al., 2019", pmid: "31303482",
    confidence: "high", notes: "BBS1 insertion to BBS4 N-terminus; crosslink cluster in disordered region"
  },

  // ========== YANG 2020 (7 validations) ==========
  {
    bait: UNIPROT.ARL6, prey: UNIPROT.BBS1,
    method: "Cryo-EM", study: "Yang et al., 2020", pmid: "32510327",
    confidence: "high", notes: "Switch 2 and helices α3/α4 bind BBS1 blades 1 & 7; primary recruitment"
  },
  {
    bait: UNIPROT.ARL6, prey: UNIPROT.BBS7,
    method: "Cryo-EM", study: "Yang et al., 2020", pmid: "32510327",
    confidence: "high", notes: "BBS7 linker (320-335) orders upon binding; β-edge interaction"
  },
  {
    bait: UNIPROT.BBS1, prey: UNIPROT.BBS4,
    method: "Cryo-EM", study: "Yang et al., 2020", pmid: "32510327",
    confidence: "high", notes: "Structural cradle; 25° rotation + 13 Å movement upon ARL6 binding"
  },
  {
    bait: UNIPROT.BBS1, prey: UNIPROT.BBS7,
    method: "Cryo-EM", study: "Yang et al., 2020", pmid: "32510327",
    confidence: "high", notes: "Cradle positions BBS1 for ARL6; cargo cavity formation"
  },
  {
    bait: UNIPROT.BBS1, prey: UNIPROT.BBS2,
    method: "Cryo-EM", study: "Yang et al., 2020", pmid: "32510327",
    confidence: "high", notes: "Adjacent β-propellers; 13 Å separation creates GPCR cargo cavity"
  },
  {
    bait: UNIPROT.BBS2, prey: UNIPROT.BBS7,
    method: "Cryo-EM", study: "Yang et al., 2020", pmid: "32510327",
    confidence: "high", notes: "Form GPCR cargo binding cavity with BBS1/4/8"
  },
  {
    bait: UNIPROT.BBS4, prey: UNIPROT.BBS8,
    method: "Cryo-EM", study: "Yang et al., 2020", pmid: "32510327",
    confidence: "high", notes: "Flank GPCR cargo binding cavity; body contribution"
  },

  // ========== KLINK 2020 (8 validations) ==========
  // Human core hexamer without BBS2/7
  {
    bait: UNIPROT.BBS1, prey: UNIPROT.BBS4,
    method: "Cryo-EM", study: "Klink et al., 2020", pmid: "31951201",
    confidence: "high", notes: "Human core hexamer (no BBS2/7); independently stable"
  },
  {
    bait: UNIPROT.BBS1, prey: UNIPROT.BBS8,
    method: "Cryo-EM", study: "Klink et al., 2020", pmid: "31951201",
    confidence: "high", notes: "Core hexamer body; stable without head module"
  },
  {
    bait: UNIPROT.BBS4, prey: UNIPROT.BBS8,
    method: "Cryo-EM", study: "Klink et al., 2020", pmid: "31951201",
    confidence: "high", notes: "Central core; BBS1/4/5/8/9/18 hexamer"
  },
  {
    bait: UNIPROT.BBS5, prey: UNIPROT.BBS9,
    method: "Cryo-EM", study: "Klink et al., 2020", pmid: "31951201",
    confidence: "high", notes: "Maintained in core hexamer without BBS2/7"
  },
  {
    bait: UNIPROT.BBS5, prey: UNIPROT.BBS8,
    method: "Cryo-EM", study: "Klink et al., 2020", pmid: "31951201",
    confidence: "high", notes: "Core hexamer peripheral contact"
  },
  {
    bait: UNIPROT.BBS9, prey: UNIPROT.BBS1,
    method: "Cryo-EM", study: "Klink et al., 2020", pmid: "31951201",
    confidence: "high", notes: "Scaffold function preserved in core hexamer"
  },
  {
    bait: UNIPROT.BBS9, prey: UNIPROT.BBS4,
    method: "Cryo-EM", study: "Klink et al., 2020", pmid: "31951201",
    confidence: "high", notes: "BBS9 wrapping maintained without head"
  },
  {
    bait: UNIPROT.BBS18, prey: UNIPROT.BBS4,
    method: "Cryo-EM", study: "Klink et al., 2020", pmid: "31951201",
    confidence: "high", notes: "U-bolt present in human core hexamer"
  },

  // ========== KLINK 2017 (6 validations) ==========
  // First recombinant BBSome subcomplex
  {
    bait: UNIPROT.BBS18, prey: UNIPROT.BBS4,
    method: "Biochemical reconstitution", study: "Klink et al., 2017", pmid: "29168691",
    confidence: "high", notes: "First recombinant subcomplex; stable tetrameric core with BBS8/9"
  },
  {
    bait: UNIPROT.BBS18, prey: UNIPROT.BBS8,
    method: "Biochemical reconstitution", study: "Klink et al., 2017", pmid: "29168691",
    confidence: "high", notes: "BBS18-BBS4-BBS8-BBS9 tetrameric subcomplex"
  },
  {
    bait: UNIPROT.BBS4, prey: UNIPROT.BBS8,
    method: "Biochemical reconstitution", study: "Klink et al., 2017", pmid: "29168691",
    confidence: "high", notes: "Co-purify in recombinant hexamer (BBS1/4/5/8/9/18)"
  },
  {
    bait: UNIPROT.BBS1, prey: UNIPROT.BBS5,
    method: "Co-purification", study: "Klink et al., 2017", pmid: "29168691",
    confidence: "medium", notes: "Co-purify in recombinant hexamer; may be indirect"
  },
  {
    bait: UNIPROT.BBS1, prey: UNIPROT.BBS4,
    method: "Co-purification", study: "Klink et al., 2017", pmid: "29168691",
    confidence: "medium", notes: "Recombinant hexamer; direct vs indirect unclear"
  },
  {
    bait: UNIPROT.BBS5, prey: UNIPROT.BBS8,
    method: "Co-purification", study: "Klink et al., 2017", pmid: "29168691",
    confidence: "medium", notes: "Recombinant hexamer co-purification"
  },

  // ========== MOURÃO 2014 (1 validation) ==========
  {
    bait: UNIPROT.ARL6, prey: UNIPROT.BBS1,
    method: "Crystal structure", study: "Mourão et al., 2014", pmid: "25402481",
    confidence: "high", notes: "ARL6-GTP binds BBS1 β-propeller blades 1 & 7; Kd=0.35 μM; PDB 4V0M"
  }
];

async function checkMissingProteins() {
  console.log('🔍 Checking which BBSome proteins exist in database...\n');

  const missing = [];
  const present = [];

  for (const [name, uniprot] of Object.entries(UNIPROT)) {
    const result = await sql`
      SELECT id, gene_name FROM proteins WHERE uniprot_id = ${uniprot}
    `;

    if (result.rows.length === 0) {
      missing.push(`${name} (${uniprot})`);
    } else {
      present.push(`${name} (${result.rows[0].gene_name || uniprot})`);
    }
  }

  console.log(`✅ Found ${present.length} BBSome proteins:`);
  present.forEach(p => console.log(`   ${p}`));

  if (missing.length > 0) {
    console.log(`\n⚠️  Missing ${missing.length} proteins:`);
    missing.forEach(p => console.log(`   ${p}`));
    console.log('\n⏸️  Add missing proteins before running validations.\n');
    return false;
  }

  console.log('\n✅ All BBSome proteins present!\n');
  return true;
}

async function addAllValidations() {
  const allReady = await checkMissingProteins();

  if (!allReady) {
    console.log('Exiting. Run this script again after adding missing proteins.');
    process.exit(0);
  }

  console.log('=' .repeat(60));
  console.log('Adding 49 BBSome validations from 6 papers...\n');

  let added = 0;
  let skipped = 0;
  let notFound = 0;

  const paperCounts = {
    'Singh et al., 2020': 0,
    'Chou et al., 2019': 0,
    'Yang et al., 2020': 0,
    'Klink et al., 2020': 0,
    'Klink et al., 2017': 0,
    'Mourão et al., 2014': 0
  };

  for (const v of ALL_BBSOME_VALIDATIONS) {
    try {
      // Find interaction (bidirectional search)
      const result = await sql`
        SELECT i.id, i.experimental_validation,
               b.gene_name as bait_name, p.gene_name as prey_name
        FROM interactions i
        JOIN proteins b ON i.bait_protein_id = b.id
        JOIN proteins p ON i.prey_protein_id = p.id
        WHERE (b.uniprot_id = ${v.bait} AND p.uniprot_id = ${v.prey})
           OR (b.uniprot_id = ${v.prey} AND p.uniprot_id = ${v.bait})
        LIMIT 1
      `;

      if (result.rows.length === 0) {
        console.log(`⚠️  Not found: ${v.bait} ↔ ${v.prey} (${v.study})`);
        notFound++;
        continue;
      }

      const row = result.rows[0];

      // Get existing validation or create new
      const existingValidation = row.experimental_validation || {
        experimental_methods: [],
        validation_summary: {
          is_validated: false,
          validation_count: 0,
          strongest_method: null,
          consensus_confidence: null
        }
      };

      // Check if this specific study+method already exists
      const newMethod = {
        method: v.method,
        study: v.study,
        pmid: v.pmid,
        confidence: v.confidence,
        notes: v.notes
      };

      const alreadyExists = existingValidation.experimental_methods.some(
        m => m.study === newMethod.study && m.method === newMethod.method
      );

      if (alreadyExists) {
        console.log(`💡 ${row.bait_name} ↔ ${row.prey_name}: Already has ${v.study}`);
        skipped++;
        continue;
      }

      // Append new validation
      existingValidation.experimental_methods.push(newMethod);
      existingValidation.validation_summary.is_validated = true;
      existingValidation.validation_summary.validation_count = existingValidation.experimental_methods.length;

      // Recalculate strongest method
      const confidenceRanking = { high: 3, medium: 2, low: 1 };
      let strongestMethod = existingValidation.experimental_methods[0];
      for (const method of existingValidation.experimental_methods) {
        if (confidenceRanking[method.confidence] > confidenceRanking[strongestMethod.confidence]) {
          strongestMethod = method;
        }
      }
      existingValidation.validation_summary.strongest_method = strongestMethod.method;
      existingValidation.validation_summary.consensus_confidence = strongestMethod.confidence;

      // Update database
      await sql`
        UPDATE interactions
        SET experimental_validation = ${JSON.stringify(existingValidation)}
        WHERE id = ${row.id}
      `;

      console.log(`✅ ${row.bait_name} ↔ ${row.prey_name} + ${v.study}`);
      added++;
      paperCounts[v.study]++;

    } catch (error) {
      console.error(`❌ Error processing ${v.bait} ↔ ${v.prey}: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY\n');
  console.log(`✅ Added: ${added}`);
  console.log(`💡 Skipped (already present): ${skipped}`);
  console.log(`⚠️  Not found in database: ${notFound}`);
  console.log(`\nTotal processed: ${ALL_BBSOME_VALIDATIONS.length}`);

  console.log('\n📄 By Paper:');
  Object.entries(paperCounts).forEach(([paper, count]) => {
    if (count > 0) console.log(`   ${paper}: ${count} validations`);
  });

  console.log('\n✨ BBSome validation import complete!\n');
  process.exit(0);
}

addAllValidations();
