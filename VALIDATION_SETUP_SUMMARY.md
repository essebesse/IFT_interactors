# Experimental Validation Setup - Summary

## What Has Been Created

I've set up a comprehensive system for adding experimental validation data to your IFT/BBSome interaction database. Here's what's ready to use:

### 📋 Documentation Files

1. **VALIDATED_INTERACTIONS_TEMPLATE.md** - Comprehensive reference guide
   - Known validated interactions from literature
   - Method classifications (SF-TAP-MS, Co-IP, Y2H, BioID, etc.)
   - Priority list for data entry
   - Large-scale dataset information (Boldt 2016, Gupta 2015, etc.)

2. **IFTB_CORE_VALIDATIONS.md** - Detailed IFT-B core interactions
   - 10 validated IFT-B core protein interactions
   - Extracted from review paper you provided
   - Complete with PMIDs and DOIs
   - Methods: Y2H, pulldown, reconstitution, crystal structures

### 🔧 Scripts

1. **check_validation_status.mjs** - Database inspection tool
   - Check how many interactions are validated
   - View current validation data
   - Summary statistics

2. **add_manual_validations.mjs** - Main validation import script
   - **21 high-confidence interactions ready to import**
   - Includes:
     - 6 IFT-B core interactions (IFT81-74, IFT88-52-46 trimer, etc.)
     - 6 IFT-A core interactions (IFT144-140-122-121-43)
     - 4 BBSome interactions (BBS1-7, BBS2-7, BBS4-8, BBS5-8)
     - 1 IFT-cargo adapter (IFT144-TULP3)
     - 6 additional IFT-B interactions from your review text

### 📊 Current Database Status

From the JSON extraction files:
- **Total interactions**: 512 (v4 analysis)
- **Currently validated**: 7 interactions
  - All from Tina/Carsten PD-MS data
  - IFT-A complex: IFT122, IFT121 (WDR35), IFT43 interactions with WDR19 (IFT144)

## How to Use

### Quick Start: Add 21 Validated Interactions

```bash
# 1. Set database connection
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# 2. Check current status (optional)
node check_validation_status.mjs

# 3. Add validated interactions
node add_manual_validations.mjs

# 4. Verify results
node check_validation_status.mjs
```

### Expected Results

After running `add_manual_validations.mjs`, you should see:
- ✅ **~15-20 interactions added** (those that match your AF3 predictions)
- ⚠️ **~1-5 not found** (interactions not in your AF3 dataset)
- 💡 **~1-2 already exists** (the Tina/Carsten validations)

### What Gets Added

Each validated interaction will have this data structure:

```json
{
  "date": "2025-11-08",
  "notes": "Description of interaction and context",
  "method": "Co-IP / Y2H / BioID / etc.",
  "source": "Author et al., Year",
  "validated": true,
  "pmid": "PubMed ID",
  "doi": "DOI",
  "source_file": "Journal name or data source",
  "confidence": "very high / high / medium"
}
```

## Interactions Ready to Import

### IFT-B Core (High Priority - Structural Evidence)
1. ✅ **IFT81 ↔ IFT74** - Crystal structure (Taschner et al., 2016)
2. ✅ **IFT52 ↔ IFT46** - Heterotrimer (Taschner et al., 2011)
3. ✅ **IFT88 ↔ IFT52** - Core complex (Lucker et al., 2005)
4. ✅ **IFT88 ↔ IFT46** - Trimeric complex
5. ✅ **IFT27 ↔ IFT25** - Crystal structure (Bhogaraju et al., 2011)
6. ✅ **IFT70 ↔ IFT52** - Core interaction
7. ✅ **IFT70 ↔ IFT46** - Core interaction
8. ✅ **IFT56 ↔ IFT46** - Peripheral
9. ✅ **IFT22 ↔ IFT81** - Composite interface
10. ✅ **IFT22 ↔ IFT74** - Composite interface

### IFT-A Core (High Priority)
11. ✅ **IFT144 ↔ IFT140** - Core complex (Beyer et al., 2018)
12. ✅ **IFT144 ↔ IFT122** - Core complex
13. ✅ **IFT140 ↔ IFT122** - Core complex
14. ✅ **IFT122 ↔ IFT121** - Peripheral (Follit et al., 2009)
15. ✅ **IFT43 ↔ IFT121** - Peripheral (already in DB from Tina/Carsten)
16. ✅ **IFT43 ↔ IFT122** - Peripheral (already in DB from Tina/Carsten)

### BBSome (High Priority)
17. ✅ **BBS1 ↔ BBS7** - Core BBSome (Nachury et al., 2007)
18. ✅ **BBS2 ↔ BBS7** - Direct binding
19. ✅ **BBS4 ↔ BBS8** - Crystal structure (Jin et al., 2010)
20. ✅ **BBS5 ↔ BBS8** - Core complex

### Cargo Adapters
21. ✅ **IFT144 ↔ TULP3** - Ciliary trafficking (Mukhopadhyay et al., 2010)

## Next Steps

### Immediate (Today)
1. ✅ **Run the import script** - Add 21 validated interactions
2. ✅ **Verify in database** - Check that data is correctly added
3. Update frontend to display validation badges (see below)

### Short-term (This Week)
4. Add more interactions manually from literature
   - IFT-B peripheral (IFT172, IFT80, IFT57, IFT54, IFT38, IFT20)
   - BBSome additional (BBS9, BBS10, BBS12, BBS17)
   - Motor proteins (kinesin-2, dynein-2)

5. Download Boldt et al., 2016 dataset
   - URL: https://www.nature.com/articles/ncomms11491
   - Expected: 50-150 additional validated interactions

### Medium-term (Next 2 Weeks)
6. Update web interface to show validation:
   - Add validation badge column to results table
   - Add filter: "Show only validated interactions"
   - Display validation details on hover/click

7. Create validation statistics page:
   - Validation rate by confidence level (High/Medium/Low)
   - Coverage by complex (IFT-A, IFT-B, BBSome)
   - Novel predictions (high-confidence but not yet validated)

## Frontend Integration

The frontend is already set up to handle validation data. You'll see it in:

**File**: `app/page.tsx` (lines 15-33)

```typescript
interface ValidationData {
  experimental_methods: ValidationMethod[];  // For multi-validation
  validation_summary: {
    is_validated: boolean;
    validation_count: number;
    strongest_method: string | null;
    consensus_confidence: string | null;
  };
}
```

Your current simple format works fine:
```json
{
  "method": "Co-IP",
  "source": "Nachury et al., 2007",
  "pmid": "17317642",
  ...
}
```

## Troubleshooting

### Script won't run
```bash
# Make sure you're in the project directory
cd /home/user/IFT_interactors

# Ensure POSTGRES_URL is set
echo $POSTGRES_URL

# If empty, set it:
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"
```

### All interactions show "not_found"
- This means the interactions aren't in your AF3 predictions
- Check if you're using the correct UniProt IDs
- Some interactions might involve proteins not in your 33-bait dataset

### Want to add more interactions
1. Edit `add_manual_validations.mjs`
2. Add entries to the `VALIDATED_INTERACTIONS` array
3. Follow the format shown in the existing entries
4. Run the script again

## Files Created

```
IFT_interactors/
├── VALIDATION_SETUP_SUMMARY.md          ← You are here
├── VALIDATED_INTERACTIONS_TEMPLATE.md   ← Reference guide
├── IFTB_CORE_VALIDATIONS.md            ← Detailed IFT-B interactions
├── check_validation_status.mjs          ← Check database
└── add_manual_validations.mjs           ← Import validations (21 ready)
```

## Success Metrics

After completing this setup:
- ✅ Database has validation data structure
- ✅ 21 high-confidence interactions ready to import
- ✅ Scripts created for easy data entry
- ✅ Documentation complete with references
- 🔄 Frontend already supports validation display
- ⏳ Need to add validation UI components

## Resources

### Key Papers Referenced
- **Taschner et al., 2016** - IFT81-IFT74 structure (PMID: 27344947)
- **Beyer et al., 2018** - IFT-A architecture (PMID: 29844425)
- **Nachury et al., 2007** - BBSome discovery (PMID: 17317642)
- **Taschner et al., 2014** - IFT-B core (PMID: 24550735)
- **Bhogaraju et al., 2011** - IFT27-25 structure (PMID: 21525241)

### Large-Scale Datasets
- **Boldt et al., 2016** - 217 baits, SF-TAP-MS (PMID: 27173156)
- **Gupta et al., 2015** - 56 baits, BioID (PMID: 26638075)
- **Sang et al., 2011** - 9 baits, LAP (PMID: 21565611)

---

**Created**: 2025-11-08
**Status**: ✅ Ready to use
**Next action**: Run `node add_manual_validations.mjs`
