# Experimental Validation Workflow - Phased Database Population

## Overview

This document explains the **phased approach** to integrating experimental validation data, aligned with the phased population of the IFT_Interactors database.

**Key principle**: Experimental validation scripts are **idempotent** (safe to re-run) and will automatically skip already-validated interactions.

---

## Timeline and Phases

### **Phase 1: Initial Validation (Current - 31 Baits)** ✅

**Database state**: 31 bait proteins
- 22 IFT proteins (IFT-A, IFT-B1, IFT-B2)
- 8 BBSome proteins (BBS1, BBS2, BBS4, BBS5, BBS7, BBS8, BBS17)
- 1 IFT-associated protein (TULP3)
- **Missing**: IFT172 (IFT-B2), BBS9, BBS18, RABL2

**Validations performed**:
1. ✅ **Boldt et al., 2016** (SF-TAP-MS) - Completed
   - Expected: ~25 validated interactions (5% of 512)
   - Command: `node scripts/import_experimental_data.mjs boldt2016`

2. 🔄 **Gupta et al., 2015** (BioID) - In progress
   - Expected: ~50 validated interactions (10% of 512)
   - Command: `node scripts/import_experimental_data.mjs gupta2015`

**Expected results after Phase 1**:
- Total validated: ~65-75 interactions (13-15%)
- Boldt only: ~15 interactions
- Gupta only: ~40 interactions
- **Both methods**: ~12-15 interactions ← Highest confidence!

---

### **Phase 2: Add 4 New Proteins** 🔜

**Action**: Import AF3 predictions for 4 new proteins when jobs complete
- IFT172 (Q9UG01) - IFT-B2 core component
- BBS9 (Q3SYG4) - BBSome-associated
- BBS18 (A8MTZ0) - BBSome-associated
- RABL2 (Q9UNT1) - IFT-associated GTPase

**Database state after Phase 2**: 35 bait proteins (31 + 4)

**Commands**:
```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"
node import_from_v4_originals_INCREMENTAL.mjs
```

**Expected**: Database grows from 512 interactions (31 baits) → ~600 interactions (35 baits)

**Reference**: See `TODO_ADD_NEW_PROTEINS.md` for detailed workflow

---

### **Phase 3: Re-run Validations for NEW Interactions** 🔄

**Critical**: After adding the 4 new proteins, we must **re-run experimental validations** to check if any of the NEW interactions are experimentally supported.

**Why re-run?**
- Boldt has 217 baits - may include IFT172, BBS9, BBS18, RABL2
- Gupta has 56 baits - may include some of the new proteins
- The NEW AF3 predictions need to be checked against existing experimental data

**Commands** (same as Phase 1):
```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# Re-run Boldt validation
node scripts/import_experimental_data.mjs boldt2016

# Re-run Gupta validation
node scripts/import_experimental_data.mjs gupta2015
```

**What happens during re-run?**
1. Script parses dataset again (~3,000 interactions)
2. Maps proteins to UniProt IDs (cached, faster)
3. For each interaction:
   - If already validated → returns `already_exists` status (skipped)
   - If NEW interaction → adds validation data
   - If not in database → skipped
4. Reports: `✅ Updated: X interactions` (only NEW ones)

**Expected results after Phase 3**:
- Additional 5-15 interactions validated (from the 4 new proteins)
- Total validated: ~75-90 interactions
- **No duplicates** for original 31 proteins

---

## How Duplicate Prevention Works

### Code-Level Protection

The `addValidationToInteraction()` function in `scripts/import_experimental_data.mjs` checks for existing validations by **PMID** (PubMed ID):

```javascript
// Check if this study is already added (lines 111-118)
const alreadyExists = existingValidation.experimental_methods.some(
  method => method.pmid === validationData.pmid
);

if (alreadyExists) {
  return { status: 'already_exists', interaction_id: interactionId };
}
```

**Protection mechanism**:
- Each study has a unique PMID (Boldt = 27173156, Gupta = 26638075)
- Before adding validation, script checks if that PMID already exists
- If exists → skip (return `already_exists` status)
- If not → add validation data

**Result**: Re-running the same import command is **100% safe** - no duplicates will be created.

---

## Import Script Status Codes

When processing interactions, the script returns one of these statuses:

| Status | Meaning | Count Location |
|--------|---------|----------------|
| `updated` | NEW validation added | "✅ Updated: X interactions" |
| `already_exists` | Study already validated this interaction | "ℹ️ Already validated: X" |
| `not_found` | Interaction not in AF3 database | "⚠️ Not in AF3 predictions: X" |
| `error` | Database or mapping error | "❌ Errors: X" |

**During Phase 3 re-run**, expect:
- `already_exists`: ~65-75 (original Phase 1 validations)
- `updated`: ~5-15 (NEW validations from 4 new proteins)
- `not_found`: ~2,800+ (experimental interactions not in our dataset)

---

## Expected Validation Statistics

### After Phase 1 (31 baits):

| Metric | Value |
|--------|-------|
| Total AF3 interactions | 512 |
| Boldt validated | ~25 (5%) |
| Gupta validated | ~50 (10%) |
| Dual-validated (both) | ~12 (2.3%) ⭐ |
| Total validated | ~65-75 (13-15%) |

**By AF3 confidence**:
- High ipSAE (>0.7): ~40-50% validated
- Medium ipSAE (0.5-0.7): ~15-20% validated
- Low ipSAE (<0.5): ~5-8% validated

### After Phase 3 (35 baits):

| Metric | Value | Change from Phase 1 |
|--------|-------|---------------------|
| Total AF3 interactions | ~600 | +88 |
| Boldt validated | ~30 | +5 |
| Gupta validated | ~60 | +10 |
| Dual-validated (both) | ~15 | +3 |
| Total validated | ~75-90 | +10-15 |

**Validation rate**: Still ~13-15% (consistent across phases)

---

## Workflow Summary

```
Phase 1: Initial Validation (31 baits)
├── Import Boldt data → ~25 validations
├── Import Gupta data → ~50 validations
└── Result: ~65-75 validated (13-15%)

Phase 2: Add New Proteins (35 baits)
├── Run incremental import → +4 baits
├── Database grows → 512 → ~600 interactions
└── Result: Ready for validation

Phase 3: Re-validate NEW Interactions
├── Re-run Boldt import → +5 validations (skip 25 existing)
├── Re-run Gupta import → +10 validations (skip 50 existing)
└── Result: ~75-90 validated (13-15%)

Future: Add More Experimental Datasets
├── Sang et al., 2011 (LAP method)
├── APEX datasets (Mick, Kohli, May, Aslanyan)
└── Simply run: node scripts/import_experimental_data.mjs <dataset>
    (No special handling needed - always safe to re-run!)
```

---

## Commands Quick Reference

### Phase 1: Initial Validation (Now)

```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# Import Boldt (TAP-MS)
node scripts/import_experimental_data.mjs boldt2016

# Import Gupta (BioID)
node scripts/import_experimental_data.mjs gupta2015
```

### Phase 2: Add New Proteins (When AF3 jobs finish)

```bash
# Import 4 new proteins (IFT172, BBS9, BBS18, RABL2)
node import_from_v4_originals_INCREMENTAL.mjs

# Verify 35 baits
node -e "const { sql } = require('@vercel/postgres'); sql\`SELECT COUNT(DISTINCT bait_protein_id) FROM interactions\`.then(r => console.log('Baits:', r.rows[0].count));"
```

### Phase 3: Re-validate (After Phase 2 completes)

```bash
# Same commands as Phase 1 - script handles duplicates automatically!
node scripts/import_experimental_data.mjs boldt2016
node scripts/import_experimental_data.mjs gupta2015

# Check validation summary
node -e "const { sql } = require('@vercel/postgres'); sql\`SELECT COUNT(*) FROM interactions WHERE experimental_validation IS NOT NULL\`.then(r => console.log('Total validated:', r.rows[0].count));"
```

---

## Important Notes

### ✅ Safe Operations (Idempotent)
- Re-running `import_experimental_data.mjs` with any dataset
- Running validations before or after adding new proteins
- Running validations in any order (Boldt first, Gupta first, doesn't matter)

### ⚠️ Required Actions
- Must run incremental import (`import_from_v4_originals_INCREMENTAL.mjs`) to add new proteins BEFORE Phase 3
- Must re-run validations AFTER adding new proteins to capture NEW interactions
- Must check validation statistics after each phase to verify expected results

### ❌ Never Do This
- Don't manually edit `experimental_validation` JSONB field in database
- Don't modify PMID values in import scripts (breaks duplicate detection)
- Don't skip Phase 3 validation - NEW interactions won't be validated!

---

## Verification Queries

### Check validation coverage:

```bash
node -e "
const { sql } = require('@vercel/postgres');
(async () => {
  const total = await sql\`SELECT COUNT(*) FROM interactions\`;
  const validated = await sql\`SELECT COUNT(*) FROM interactions WHERE experimental_validation IS NOT NULL\`;
  const rate = (validated.rows[0].count / total.rows[0].count * 100).toFixed(1);
  console.log(\`Validation: \${validated.rows[0].count}/\${total.rows[0].count} (\${rate}%)\`);
})();
"
```

### Check for duplicates (should be 0):

```bash
node -e "
const { sql } = require('@vercel/postgres');
(async () => {
  const result = await sql\`
    SELECT
      i.id,
      b.gene_name as bait,
      p.gene_name as prey,
      jsonb_array_length(experimental_validation->'experimental_methods') as method_count
    FROM interactions i
    JOIN proteins b ON i.bait_protein_id = b.id
    JOIN proteins p ON i.prey_protein_id = p.id
    WHERE experimental_validation IS NOT NULL
      AND (
        experimental_validation->'experimental_methods' @> '[{\"pmid\": \"27173156\"}, {\"pmid\": \"27173156\"}]' OR
        experimental_validation->'experimental_methods' @> '[{\"pmid\": \"26638075\"}, {\"pmid\": \"26638075\"}]'
      )
  \`;
  console.log('Duplicates found:', result.rows.length);
  if (result.rows.length > 0) {
    console.log('⚠️ WARNING: Duplicates detected!');
    result.rows.forEach(r => console.log(\`  \${r.bait} - \${r.prey}: \${r.method_count} methods\`));
  } else {
    console.log('✅ No duplicates - all good!');
  }
})();
"
```

### Check dual-validated interactions:

```bash
node -e "
const { sql } = require('@vercel/postgres');
(async () => {
  const both = await sql\`
    SELECT COUNT(*) as count
    FROM interactions
    WHERE experimental_validation::jsonb->'experimental_methods' @> '[{\"method\": \"SF-TAP-MS\"}]'
      AND experimental_validation::jsonb->'experimental_methods' @> '[{\"method\": \"BioID\"}]'
  \`;
  console.log('Interactions validated by BOTH Boldt + Gupta:', both.rows[0].count);
})();
"
```

---

## Related Documentation

- **TODO_ADD_NEW_PROTEINS.md** - Step-by-step guide for Phase 2
- **TODO_GUPTA_DATASET.md** - Gupta BioID import guide
- **BOLDT_DATASET_CRITERIA.txt** - Boldt TAP-MS selection criteria
- **GUPTA_DATASET_CRITERIA.txt** - Gupta BioID selection criteria
- **EXPERIMENTAL_VALIDATION_PLAN.md** - Overall validation strategy

---

**Last Updated**: 2025-11-07
**Status**: Phase 1 in progress, Phase 2 pending AF3 jobs, Phase 3 to follow
**Database**: Neon PostgreSQL (31 baits → 35 baits)
