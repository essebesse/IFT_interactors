# BBSome Validation Script - Usage Guide

## Overview

This script adds **49 BBSome protein-protein interaction validations** from 6 major structural and biochemical papers (2014-2020).

**Script**: `add_all_bbsome_validations.mjs`

## Required BBSome Proteins

The script requires these 9 proteins to be in your database first:

| Protein | UniProt ID | Gene Name | Notes |
|---------|------------|-----------|-------|
| BBS1 | Q8NFJ9 | BBS1 | β-propeller + GAE domain |
| BBS2 | Q9BXC9 | BBS2 | Head module coiled-coil |
| BBS4 | Q96RK4 | BBS4 | TPR α-solenoid |
| BBS5 | Q8N3I7 | BBS5 | Dual PH domains |
| BBS7 | Q8IWZ6 | BBS7 | Head module coiled-coil |
| BBS8 | Q8TAM2 | BBS8 / TTC8 | Central TPR α-solenoid |
| BBS9 | Q3SYG4 | BBS9 / BBIP10 | Central scaffold |
| BBS18 | A8MTZ0 | BBS18 / BBIP1 | U-bolt clamp (93 aa) |
| ARL6 | Q9H0F7 | ARL6 / BBS3 | GTPase recruiter |

⚠️ **Important**: The script will check for missing proteins and exit if any are missing. Add all 9 proteins to your database before running the validation script.

## How to Use

### Step 1: Check Database Status

```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# Run the script - it will tell you what's missing
node add_all_bbsome_validations.mjs
```

**Expected output if proteins are missing**:

```
🔍 Checking which BBSome proteins exist in database...

✅ Found 3 BBSome proteins:
   BBS1 (BBS1)
   BBS4 (BBS4)
   BBS8 (TTC8)

⚠️  Missing 6 proteins:
   BBS2 (Q9BXC9)
   BBS5 (Q8N3I7)
   BBS7 (Q8IWZ6)
   BBS9 (Q3SYG4)
   BBS18 (A8MTZ0)
   ARL6 (Q9H0F7)

⏸️  Add missing proteins before running validations.

Exiting. Run this script again after adding missing proteins.
```

### Step 2: Add Missing Proteins

Use your existing protein import workflow to add the missing BBSome proteins. For example:

```bash
# Add individual proteins or use batch import
# Make sure to use the UniProt IDs listed above
```

### Step 3: Run Validation Script

Once all proteins are present:

```bash
node add_all_bbsome_validations.mjs
```

**Expected output when successful**:

```
🔍 Checking which BBSome proteins exist in database...

✅ Found 9 BBSome proteins:
   BBS1 (BBS1)
   BBS2 (BBS2)
   BBS4 (BBS4)
   BBS5 (BBS5)
   BBS7 (BBS7)
   BBS8 (TTC8)
   BBS9 (BBIP10)
   BBS18 (BBIP1)
   ARL6 (ARL6)

✅ All BBSome proteins present!

============================================================
Adding 49 BBSome validations from 6 papers...

✅ BBS2 ↔ BBS7 + Singh et al., 2020
✅ BBS2 ↔ BBS9 + Singh et al., 2020
✅ BBS7 ↔ BBS9 + Singh et al., 2020
...
💡 BBS4 ↔ BBS8: Already has Singh et al., 2020
...

============================================================
📊 SUMMARY

✅ Added: 45
💡 Skipped (already present): 4
⚠️  Not found in database: 0

Total processed: 49

📄 By Paper:
   Singh et al., 2020: 12 validations
   Chou et al., 2019: 15 validations
   Yang et al., 2020: 7 validations
   Klink et al., 2020: 8 validations
   Klink et al., 2017: 6 validations
   Mourão et al., 2014: 1 validation

✨ BBSome validation import complete!
```

## What Gets Added

### Paper 1: Singh et al., eLife 2020 (12 validations)
- **PMID**: 31939736
- **Method**: Cryo-EM (3.1 Å inactive, 3.5 Å active)
- **PDB**: 6VBU, 6VBV
- **Content**: Complete BBSome architecture + ARL6 activation mechanism

### Paper 2: Chou et al., Structure 2019 (15 validations)
- **PMID**: 31303482
- **Method**: Cryo-EM (4.9 Å) + XL-MS (42 crosslinks) + Rosetta
- **Content**: Integrated approach; BBS18 U-bolt mechanism; assembly pathway

### Paper 3: Yang et al., eLife 2020 (7 validations)
- **PMID**: 32510327
- **Method**: Cryo-EM (~3.5 Å)
- **PDB**: 6VOA
- **Content**: BBSome-ARL6-GPCR cargo complex; cargo binding mechanism

### Paper 4: Klink et al., eLife 2020 (8 validations)
- **PMID**: 31951201
- **Method**: Cryo-EM (~3.8 Å)
- **Content**: Human core hexamer (BBS1/4/5/8/9/18) without BBS2/7

### Paper 5: Klink et al., eLife 2017 (6 validations)
- **PMID**: 29168691
- **Method**: Biochemical reconstitution + Pulldowns
- **Content**: First recombinant BBSome subcomplex; tetrameric core

### Paper 6: Mourão et al., Nat Struct Mol Biol 2014 (1 validation)
- **PMID**: 25402481
- **Method**: Crystal structure (2.7 Å)
- **PDB**: 4V0M
- **Content**: ARL6-GTP binds BBS1 (Kd=0.35 μM)

## BBSome Architecture Summary

The validations cover the complete BBSome architecture:

### Head Module
- **BBS2 ↔ BBS7**: Asymmetric coiled-coil heterodimer

### Neck Module
- **BBS2 ↔ BBS9**: Coiled-coil connecting head to body
- **BBS7 ↔ BBS9**: Contact at midpoint

### Body Core
- **BBS4 ↔ BBS8**: Y-shaped TPR spine
- **BBS18 U-bolt**: Threads through BBS4 and BBS8 TPRs (unfolded clamp)

### Central Scaffold
- **BBS9**: Wraps around BBS1, BBS4, connects to BBS5, BBS8

### Peripheral
- **BBS5**: Dual PH domains bind BBS9 and BBS8

### Membrane Recruitment
- **ARL6-GTP**: Binds BBS1 (blades 1 & 7) and BBS7; triggers activation

### Cargo Recognition
- **GPCR binding cavity**: Formed by BBS1, BBS2, BBS7, BBS4, BBS8 after ARL6 activation

## Features

### Smart Validation Merging
- Checks for existing validations from same study
- Appends new validations without duplicating
- Recalculates strongest method and consensus confidence
- Bidirectional search (finds interactions regardless of bait/prey order)

### Safety Features
- Pre-flight check for missing proteins
- Graceful handling of missing interactions
- Clear output showing what was added vs skipped
- Per-paper statistics

### Database Compatibility
- Works with existing validation schema
- Compatible with multi-method validations
- Preserves existing experimental_validation data

## Troubleshooting

### "Not found in database" warnings

If you see interactions not found, it means:
1. The AlphaPulldown predictions don't include that interaction, OR
2. The bait protein was run with a limited prey library

**Solution**: This is normal. Not all validated interactions will be in your AlphaPulldown predictions.

### "Already has" messages

This means the validation from that specific paper is already in the database. The script skips duplicates automatically.

### Missing protein errors

Add all 9 BBSome proteins before running. The script will tell you exactly which ones are missing.

## Alternative: Individual Paper Scripts

If you prefer to add papers incrementally, use the individual scripts:

```bash
node add_singh_2020_bbsome_validations.mjs   # 12 validations
node add_chou_2019_bbsome_validations.mjs    # 15 validations
node add_yang_2020_bbsome_validations.mjs    # 7 validations
node add_klink_2020_bbsome_validations.mjs   # 8 validations
node add_klink_2017_validations.mjs          # 6 validations
node add_mourao_2014_bbsome_validation.mjs   # 1 validation
```

## References

1. Singh SK et al. Structure and activation mechanism of the BBSome membrane protein trafficking complex. *eLife* 2020;9:e53322. PMID: 31939736.

2. Chou HT et al. The Molecular Architecture of Native BBSome Obtained by an Integrated Structural Approach. *Structure* 2019;27(9):1384-1394. PMID: 31303482.

3. Yang S et al. Near-atomic structures of the BBSome reveal the basis for BBSome activation and binding to GPCR cargoes. *eLife* 2020;9:e55954. PMID: 32510327.

4. Klink BU et al. Structure of the human BBSome core complex. *eLife* 2020;9:e53910. PMID: 31951201.

5. Klink BU et al. A recombinant BBSome core complex and how it interacts with ciliary cargo. *eLife* 2017;6:e27434. PMID: 29168691.

6. Mourão A et al. Structural basis for membrane targeting of the BBSome by ARL6. *Nat Struct Mol Biol* 2014;21(12):1035-1041. PMID: 25402481.

---

**Created**: 2025-11-08
**Total Validations**: 49 BBSome interactions
**Status**: Ready to run after adding BBSome proteins to database
