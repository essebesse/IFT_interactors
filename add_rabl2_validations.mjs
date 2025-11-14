#!/usr/bin/env node
import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ Set POSTGRES_URL first');
  process.exit(1);
}

// UniProt IDs
const UNIPROT = {
  // RABL2 isoforms
  RABL2B: "Q9UNT1",  // This is the one in our database
  RABL2A: "Q9GZN8",  // Primary isoform (not in predictions)

  // RABL2 pathway proteins
  CEP19: "Q96LK0",   // RABL2 recruiter at basal body
  ARL3: "P36405",    // RABL2 activates ARL3
  CEP350: "Q5VT06",  // Centriolar satellite
  FOP: "Q96NT3",     // Basal body adaptor

  // IFT-B proteins (most already in database)
  IFT122: "Q9HBG6",  // IFT-A (part of holocomplex)
  IFT56: "A0AVF1",   // IFT-B
  IFT74: "Q96LB3",
  IFT81: "Q8WYA0",
  IFT88: "Q13099",
  IFT52: "Q9Y366",
  IFT25: "Q9Y547",
  IFT27: "Q9BW83"
};

const RABL2_VALIDATIONS = [
  // ========================================
  // Kanie et al., 2017 - Foundational Study
  // ========================================

  // RABL2-GTP binds entire IFT-B holocomplex (17 subunits)
  // We have IFT122 (IFT-A) and IFT56 (IFT-B) predicted
  {
    bait_uniprot: UNIPROT.RABL2B,
    prey_uniprot: UNIPROT.IFT122,
    validation: {
      experimental_methods: [{
        method: "TAP-MS",
        study: "Kanie et al., 2017",
        pmid: "28625565",
        confidence: "high",
        notes: "RABL2-GTP binds entire IFT-B holocomplex (all 17 subunits). TAP-MS with Q80L mutant (GTP-locked). Direct binding site is IFT74/81 heterodimer."
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "TAP-MS",
        consensus_confidence: "high"
      }
    }
  },

  {
    bait_uniprot: UNIPROT.RABL2B,
    prey_uniprot: UNIPROT.IFT56,
    validation: {
      experimental_methods: [{
        method: "TAP-MS",
        study: "Kanie et al., 2017",
        pmid: "28625565",
        confidence: "high",
        notes: "IFT56 is part of IFT-B1 core complex. RABL2-GTP binds entire IFT-B holocomplex (17 subunits). Direct binding is via IFT74/81."
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "TAP-MS",
        consensus_confidence: "high"
      }
    }
  },

  // RABL2 ↔ IFT74/81 (if these interactions exist in DB)
  // Multi-study validation: Kanie 2017, Nishijima 2017, Boegholm 2023, Duan 2021
  {
    bait_uniprot: UNIPROT.RABL2B,
    prey_uniprot: UNIPROT.IFT74,
    validation: {
      experimental_methods: [
        {
          method: "Co-IP + CRISPR KO",
          study: "Kanie et al., 2017",
          pmid: "28625565",
          confidence: "high",
          notes: "Direct binding site. CRISPR KO of IFT74 OR IFT81 abolishes RABL2-IFT-B binding (genetic proof). GTP-dependent."
        },
        {
          method: "Pull-down + GTPase assay",
          study: "Boegholm et al., 2023",
          pmid: "37606072",
          confidence: "high",
          notes: "IFT74-IFT81 C-terminal coiled-coil (IFT74460-532) binds RABL2 and acts as 20-fold GAP. Binding site mapped."
        },
        {
          method: "Co-IP",
          study: "Nishijima et al., 2017",
          pmid: "28428259",
          confidence: "high",
          notes: "Strictly GTP-dependent binding to IFT74-IFT81 heterodimer. Mutually exclusive with CEP19 binding."
        }
      ],
      validation_summary: {
        is_validated: true,
        validation_count: 3,
        strongest_method: "CRISPR KO",
        consensus_confidence: "high"
      }
    }
  },

  {
    bait_uniprot: UNIPROT.RABL2B,
    prey_uniprot: UNIPROT.IFT81,
    validation: {
      experimental_methods: [
        {
          method: "Co-IP + CRISPR KO",
          study: "Kanie et al., 2017",
          pmid: "28625565",
          confidence: "high",
          notes: "Direct binding site. CRISPR KO of IFT74 OR IFT81 abolishes RABL2-IFT-B binding (genetic proof). GTP-dependent."
        },
        {
          method: "Pull-down + GTPase assay",
          study: "Boegholm et al., 2023",
          pmid: "37606072",
          confidence: "high",
          notes: "IFT81-IFT74 C-terminal coiled-coil (IFT81460-533) binds RABL2 and acts as 20-fold GAP. Binding site mapped."
        },
        {
          method: "Co-IP",
          study: "Nishijima et al., 2017",
          pmid: "28428259",
          confidence: "high",
          notes: "Strictly GTP-dependent binding to IFT74-IFT81 heterodimer. Mutually exclusive with CEP19 binding."
        }
      ],
      validation_summary: {
        is_validated: true,
        validation_count: 3,
        strongest_method: "CRISPR KO",
        consensus_confidence: "high"
      }
    }
  },

  // Additional IFT-B interactions if they exist
  {
    bait_uniprot: UNIPROT.RABL2B,
    prey_uniprot: UNIPROT.IFT88,
    validation: {
      experimental_methods: [{
        method: "TAP-MS",
        study: "Kanie et al., 2017",
        pmid: "28625565",
        confidence: "high",
        notes: "IFT88 is core IFT-B1 subunit. RABL2-GTP binds entire IFT-B holocomplex. Direct binding via IFT74/81."
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "TAP-MS",
        consensus_confidence: "high"
      }
    }
  },

  {
    bait_uniprot: UNIPROT.RABL2B,
    prey_uniprot: UNIPROT.IFT52,
    validation: {
      experimental_methods: [
        {
          method: "TAP-MS",
          study: "Kanie et al., 2017",
          pmid: "28625565",
          confidence: "high",
          notes: "IFT52 is IFT-B1 subunit. RABL2-GTP binds entire IFT-B holocomplex."
        },
        {
          method: "Co-IP",
          study: "Duan et al., 2021",
          pmid: "33241915",
          confidence: "high",
          notes: "RABL2-GTP interaction with IFT52 confirmed by Co-IP"
        }
      ],
      validation_summary: {
        is_validated: true,
        validation_count: 2,
        strongest_method: "TAP-MS",
        consensus_confidence: "high"
      }
    }
  },

  {
    bait_uniprot: UNIPROT.RABL2B,
    prey_uniprot: UNIPROT.IFT25,
    validation: {
      experimental_methods: [
        {
          method: "TAP-MS",
          study: "Kanie et al., 2017",
          pmid: "28625565",
          confidence: "high",
          notes: "IFT25 is IFT-B1 subunit. RABL2-GTP binds entire IFT-B holocomplex."
        },
        {
          method: "Co-IP",
          study: "Duan et al., 2021",
          pmid: "33241915",
          confidence: "medium",
          notes: "IFT25 co-purifies with RABL2(Q80L), CEP19-dependent"
        }
      ],
      validation_summary: {
        is_validated: true,
        validation_count: 2,
        strongest_method: "TAP-MS",
        consensus_confidence: "high"
      }
    }
  },

  // ========================================
  // Additional pathway proteins (if in DB)
  // ========================================

  // CEP19 ↔ RABL2 (multi-lab validation)
  {
    bait_uniprot: UNIPROT.CEP19,
    prey_uniprot: UNIPROT.RABL2B,
    validation: {
      experimental_methods: [
        {
          method: "TAP-MS + GST pull-down",
          study: "Kanie et al., 2017",
          pmid: "28625565",
          confidence: "high",
          notes: "CEP19 recruits RABL2 to basal body. GTP-preferential binding."
        },
        {
          method: "Co-IP",
          study: "Nishijima et al., 2017",
          pmid: "28428259",
          confidence: "high",
          notes: "CEP19 binds both RABL2-GTP and RABL2-GDP. Mutually exclusive with IFT74-IFT81 binding."
        },
        {
          method: "ITC (Isothermal Titration Calorimetry)",
          study: "Boegholm et al., 2023",
          pmid: "37606072",
          confidence: "high",
          notes: "High affinity for RABL2-GTP, low affinity for RABL2-GDP. Quantitative binding data."
        }
      ],
      validation_summary: {
        is_validated: true,
        validation_count: 3,
        strongest_method: "ITC",
        consensus_confidence: "high"
      }
    }
  },

  // RABL2-GDP ↔ ARL3-GDP (Zhang 2023 - GEF discovery)
  {
    bait_uniprot: UNIPROT.RABL2B,
    prey_uniprot: UNIPROT.ARL3,
    validation: {
      experimental_methods: [{
        method: "Co-IP with nucleotide specificity",
        study: "Zhang et al., 2023",
        pmid: "37579161",
        confidence: "high",
        notes: "⭐ RABL2 acts as GEF for ARL3! RABL2-GDP specifically binds ARL3-GDP (both must be GDP-bound). Links IFT-B delivery to BBSome recruitment."
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "Co-IP",
        consensus_confidence: "high"
      }
    }
  },

  // Basal body recruitment pathway (Kanie 2017)
  {
    bait_uniprot: UNIPROT.CEP350,
    prey_uniprot: UNIPROT.FOP,
    validation: {
      experimental_methods: [{
        method: "TAP-MS + GST pull-down",
        study: "Kanie et al., 2017",
        pmid: "28625565",
        confidence: "high",
        notes: "Centriolar satellite protein CEP350 recruits FOP to basal body"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "TAP-MS",
        consensus_confidence: "high"
      }
    }
  },

  {
    bait_uniprot: UNIPROT.FOP,
    prey_uniprot: UNIPROT.CEP19,
    validation: {
      experimental_methods: [{
        method: "TAP-MS + GST pull-down",
        study: "Kanie et al., 2017",
        pmid: "28625565",
        confidence: "high",
        notes: "FOP adaptor links CEP350 to CEP19-RABL2 module at basal body"
      }],
      validation_summary: {
        is_validated: true,
        validation_count: 1,
        strongest_method: "TAP-MS",
        consensus_confidence: "high"
      }
    }
  }
];

async function addOrUpdateValidation(bait_uniprot, prey_uniprot, validation) {
  try {
    // Find the interaction (check both directions)
    const result = await sql`
      SELECT i.id, i.experimental_validation,
             b.uniprot_id as bait_id, b.gene_name as bait_gene,
             p.uniprot_id as prey_id, p.gene_name as prey_gene
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE (b.uniprot_id = ${bait_uniprot} AND p.uniprot_id = ${prey_uniprot})
         OR (b.uniprot_id = ${prey_uniprot} AND p.uniprot_id = ${bait_uniprot})
    `;

    if (result.rows.length === 0) {
      return { status: 'not_found', bait: bait_uniprot, prey: prey_uniprot };
    }

    // Process all matching interactions (may have duplicates with swapped bait/prey)
    for (const row of result.rows) {
      const existing = row.experimental_validation;

      if (existing && existing.experimental_methods) {
        // Check if already has validation from this study
        const hasValidation = existing.experimental_methods.some(m =>
          validation.experimental_methods.some(v =>
            m.study === v.study && m.method === v.method
          )
        );

        if (hasValidation) {
          return { status: 'already_validated', bait: row.bait_gene, prey: row.prey_gene, id: row.id };
        }

        // Merge validations
        const merged = {
          experimental_methods: [
            ...existing.experimental_methods,
            ...validation.experimental_methods
          ],
          validation_summary: {
            is_validated: true,
            validation_count: existing.validation_summary.validation_count + validation.validation_summary.validation_count,
            strongest_method: validation.validation_summary.strongest_method,
            consensus_confidence: validation.validation_summary.consensus_confidence
          }
        };

        await sql`
          UPDATE interactions
          SET experimental_validation = ${JSON.stringify(merged)}
          WHERE id = ${row.id}
        `;

        return { status: 'merged', bait: row.bait_gene, prey: row.prey_gene, id: row.id };
      } else {
        // No existing validation, add new
        await sql`
          UPDATE interactions
          SET experimental_validation = ${JSON.stringify(validation)}
          WHERE id = ${row.id}
        `;

        return { status: 'added', bait: row.bait_gene, prey: row.prey_gene, id: row.id };
      }
    }
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

async function main() {
  console.log('Adding RABL2 pathway validations...\n');
  console.log('(Based on Kanie 2017, Nishijima 2017, Duan 2021, Boegholm 2023, Zhang 2023)\n');

  let added = 0;
  let merged = 0;
  let notFound = 0;
  let alreadyValidated = 0;
  let errors = 0;

  for (const v of RABL2_VALIDATIONS) {
    const result = await addOrUpdateValidation(v.bait_uniprot, v.prey_uniprot, v.validation);

    if (result.status === 'added') {
      console.log(`✅ Added: ${result.bait} ↔ ${result.prey} (ID: ${result.id})`);
      added++;
    } else if (result.status === 'merged') {
      console.log(`🔄 Merged: ${result.bait} ↔ ${result.prey} (ID: ${result.id})`);
      merged++;
    } else if (result.status === 'already_validated') {
      console.log(`💡 Already has validation: ${result.bait} ↔ ${result.prey}`);
      alreadyValidated++;
    } else if (result.status === 'not_found') {
      console.log(`⚠️  Not found: ${result.bait} ↔ ${result.prey}`);
      notFound++;
    } else if (result.status === 'error') {
      console.log(`❌ Error: ${result.error}`);
      errors++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Added: ${added}`);
  console.log(`🔄 Merged: ${merged}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`💡 Already validated: ${alreadyValidated}`);
  if (errors > 0) console.log(`❌ Errors: ${errors}`);
  console.log(`\nTotal processed: ${RABL2_VALIDATIONS.length}`);
}

main().catch(console.error);
