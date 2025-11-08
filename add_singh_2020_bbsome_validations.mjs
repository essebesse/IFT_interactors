#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

/**
 * Singh et al., eLife 2020 - BBSome Structure and Activation
 *
 * Paper: "Structure and activation mechanism of the BBSome membrane protein trafficking complex"
 * Authors: Singh SK, Gui M, Koh F, Yip MC, Brown A
 * Journal: eLife 2020 Jan 15;9:e53322
 * PMID: 31939736
 * DOI: 10.7554/eLife.53322
 *
 * Methods: Cryo-EM structures of bovine BBSome
 * - Inactive state: 3.1 Å resolution (PDB: 6VBU)
 * - Active state with ARL6: 3.5 Å resolution (PDB: 6VBV)
 *
 * BBSome composition: 8 subunits (BBS1, BBS2, BBS4, BBS5, BBS7, BBS8, BBS9, BBS18)
 * Architecture: Head (BBS2-BBS7) and Body (BBS1, BBS4, BBS5, BBS8, BBS9)
 */

const NEW_VALIDATIONS = [
  // HEAD MODULE - BBS2/BBS7 heterodimer
  {
    bait_uniprot: "Q9BXC9", // BBS2
    prey_uniprot: "Q8IWZ6", // BBS7
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Singh et al., eLife 2020",
        pmid: "31939736",
        confidence: "high",
        notes: "3.1 Å inactive + 3.5 Å active states; Head heterodimer formed by asymmetric coiled-coil interaction (PDB: 6VBU, 6VBV)"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },

  // NECK MODULE - BBS2/BBS9 and BBS7/BBS9
  {
    bait_uniprot: "Q9BXC9", // BBS2
    prey_uniprot: "Q3SYG4", // BBS9
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Singh et al., eLife 2020",
        pmid: "31939736",
        confidence: "high",
        notes: "3.1 Å; Coiled-coils of BBS2 and BBS9 form the neck of the BBSome (PDB: 6VBU)"
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
    bait_uniprot: "Q8IWZ6", // BBS7
    prey_uniprot: "Q3SYG4", // BBS9
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Singh et al., eLife 2020",
        pmid: "31939736",
        confidence: "high",
        notes: "3.1 Å; BBS7 coiled-coil contacts the midpoint of the BBS2-BBS9 neck (PDB: 6VBU)"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },

  // CENTRAL BODY - BBS4/BBS8 core interaction
  {
    bait_uniprot: "Q96RK4", // BBS4
    prey_uniprot: "Q8TAM2", // BBS8
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Singh et al., eLife 2020",
        pmid: "31939736",
        confidence: "high",
        notes: "3.1 Å; C-terminus of BBS8 binds perpendicular to midsection of BBS4 TPR; Both proteins have α-solenoid architecture (PDB: 6VBU)"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },

  // BBS9 scaffold - wraps around multiple subunits
  {
    bait_uniprot: "Q3SYG4", // BBS9
    prey_uniprot: "Q96RK4", // BBS4
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Singh et al., eLife 2020",
        pmid: "31939736",
        confidence: "high",
        notes: "3.1 Å; BBS9 wraps around BBS4 with its C-terminal domains (PDB: 6VBU)"
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
    bait_uniprot: "Q3SYG4", // BBS9
    prey_uniprot: "Q8NFJ9", // BBS1
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Singh et al., eLife 2020",
        pmid: "31939736",
        confidence: "high",
        notes: "3.1 Å; BBS9 C-terminal GAE, platform and α-helical domains engulf the GAE domain of BBS1 (PDB: 6VBU)"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },

  // BBS1 interactions - β-propeller and GAE domains
  {
    bait_uniprot: "Q8NFJ9", // BBS1
    prey_uniprot: "Q96RK4", // BBS4
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Singh et al., eLife 2020",
        pmid: "31939736",
        confidence: "high",
        notes: "3.1 Å; N-terminal β-propeller of BBS1 binds N-terminal end of BBS4 TPR superhelix; BBS1 wraps around BBS4 (PDB: 6VBU)"
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
    bait_uniprot: "Q8NFJ9", // BBS1
    prey_uniprot: "Q8TAM2", // BBS8
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Singh et al., eLife 2020",
        pmid: "31939736",
        confidence: "high",
        notes: "3.1 Å; BBS1 wraps around BBS8; C-terminal GAE domain of BBS1 binds to TPR domain of BBS8 (PDB: 6VBU)"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },

  // BBS5 PH domain interactions
  {
    bait_uniprot: "Q8N3I7", // BBS5
    prey_uniprot: "Q3SYG4", // BBS9
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Singh et al., eLife 2020",
        pmid: "31939736",
        confidence: "high",
        notes: "3.1 Å; Two PH domains of BBS5 both interact with β-propeller of BBS9 (PDB: 6VBU)"
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
    bait_uniprot: "Q8N3I7", // BBS5
    prey_uniprot: "Q8TAM2", // BBS8
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Singh et al., eLife 2020",
        pmid: "31939736",
        confidence: "high",
        notes: "3.1 Å; One PH domain of BBS5 also interacts with BBS8 (PDB: 6VBU)"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Cryo-EM",
        consensus_confidence: "high"
      }
    }
  },

  // ARL6 activation - active state interactions
  {
    bait_uniprot: "Q9H0F7", // ARL6 (BBS3)
    prey_uniprot: "Q8NFJ9", // BBS1
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Singh et al., eLife 2020",
        pmid: "31939736",
        confidence: "high",
        notes: "3.5 Å active state; ARL6-GTP binds blades 1 and 7 of BBS1 β-propeller; Requires swiveling of BBS1 β-propeller domain (PDB: 6VBV)"
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
    bait_uniprot: "Q9H0F7", // ARL6 (BBS3)
    prey_uniprot: "Q8IWZ6", // BBS7
    validation: {
      experimental_methods: [{
        method: "Cryo-EM",
        study: "Singh et al., eLife 2020",
        pmid: "31939736",
        confidence: "high",
        notes: "3.5 Å active state; ARL6 recognizes composite binding site formed by BBS1 and BBS7; BBS7 loop forms β-addition with central β-sheet of ARL6 (PDB: 6VBV)"
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
  let updated = 0;

  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║  Adding BBSome Structure Validations from Singh et al., 2020      ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');
  console.log('📄 Paper: Structure and activation mechanism of the BBSome');
  console.log('👥 Authors: Singh SK, Gui M, Koh F, Yip MC, Brown A');
  console.log('📚 Journal: eLife 2020 Jan 15;9:e53322');
  console.log('🔬 Method: Cryo-EM (3.1 Å inactive + 3.5 Å active with ARL6)');
  console.log('🆔 PDB: 6VBU (inactive), 6VBV (active + ARL6)');
  console.log(`\n📊 Total validations to add: ${NEW_VALIDATIONS.length}\n`);

  for (const {bait_uniprot, prey_uniprot, validation} of NEW_VALIDATIONS) {
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
        console.log(`⚠️  Not found in database: ${bait_uniprot} ↔ ${prey_uniprot}`);
        notFound++;
        continue;
      }

      const row = result.rows[0];
      const existingValidation = row.experimental_validation;

      if (existingValidation) {
        // Check if this specific study is already present
        const hasSinghStudy = existingValidation.experimental_methods?.some(
          method => method.study?.includes("Singh") && method.study?.includes("2020")
        );

        if (hasSinghStudy) {
          console.log(`💡 Already validated: ${row.bait} ↔ ${row.prey} (Singh 2020)`);
          hasValidation++;
          continue;
        }

        // Add to existing validation
        const updatedValidation = {
          experimental_methods: [
            ...existingValidation.experimental_methods,
            ...validation.experimental_methods
          ],
          validation_summary: {
            is_validated: true,
            validation_count: existingValidation.validation_summary.validation_count + 1,
            strongest_method: "Cryo-EM",
            consensus_confidence: "high"
          }
        };

        await sql`
          UPDATE interactions
          SET experimental_validation = ${JSON.stringify(updatedValidation)}
          WHERE id = ${row.id}
        `;

        console.log(`🔄 Updated: ${row.bait} ↔ ${row.prey} (added Singh 2020 to existing validation)`);
        updated++;
        continue;
      }

      // Add new validation
      await sql`
        UPDATE interactions
        SET experimental_validation = ${JSON.stringify(validation)}
        WHERE id = ${row.id}
      `;

      console.log(`✅ Added: ${row.bait} ↔ ${row.prey} - ${validation.experimental_methods[0].method}`);
      added++;

    } catch (error) {
      console.error(`❌ Error processing ${bait_uniprot} ↔ ${prey_uniprot}: ${error.message}`);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                        SUMMARY                                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log(`✅ New validations added: ${added}`);
  console.log(`🔄 Existing validations updated: ${updated}`);
  console.log(`💡 Already validated (Singh 2020): ${hasValidation}`);
  console.log(`⚠️  Not found in database: ${notFound}`);
  console.log(`📝 Total processed: ${NEW_VALIDATIONS.length}`);
  console.log('\n📋 Breakdown by module:');
  console.log('   • Head module (BBS2-BBS7): 1 interaction');
  console.log('   • Neck module (BBS2/7-BBS9): 2 interactions');
  console.log('   • Body core (BBS4-BBS8): 1 interaction');
  console.log('   • BBS9 scaffold: 2 interactions');
  console.log('   • BBS1 connections: 2 interactions');
  console.log('   • BBS5 PH domains: 2 interactions');
  console.log('   • ARL6 activation: 2 interactions');
  console.log('\n🎯 Key findings from paper:');
  console.log('   • BBSome has head (BBS2-BBS7) and body architecture');
  console.log('   • ARL6 binding requires BBS1 β-propeller swiveling');
  console.log('   • Activation opens central cavity in BBSome');
  console.log('   • Composite ARL6 binding site formed by BBS1 + BBS7');

  process.exit(0);
}

addValidations();
