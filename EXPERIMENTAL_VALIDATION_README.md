# Experimental Validation Integration - Quick Start

## Overview

This system integrates experimental cilia proteomics data from 7 key publications to validate your AlphaFold3 predictions. The implementation is **ready to use** - you just need to download the datasets and run the scripts.

## What's Been Created

✅ **Complete implementation framework**:
- Protein ID mapping system with UniProt API integration
- Dataset import scripts with validation data structure
- Directory structure and configuration
- Helper tools for inspecting datasets
- Comprehensive documentation

✅ **Files created**:
```
scripts/
├── map_protein_ids.mjs              # UniProt ID mapping with caching
├── import_experimental_data.mjs     # Main import script
├── inspect_excel.py                 # Excel/CSV inspection tool
├── setup_experimental_data_dirs.sh  # Directory setup script
├── EXPERIMENTAL_DATA_SETUP.md       # Detailed setup guide
└── (your existing import scripts...)

experimental_data/                    # Will be created by setup script
├── raw/                              # Downloaded datasets go here
├── processed/                        # Parsed JSON files
├── mapping/                          # UniProt ID cache
├── DOWNLOAD_CHECKLIST.md            # Track downloads
└── README.md                        # Quick reference

EXPERIMENTAL_VALIDATION_PLAN.md      # Complete implementation plan
EXPERIMENTAL_VALIDATION_README.md    # This file
```

## Quick Start (30 minutes to first results)

### Step 1: Setup Directories (2 minutes)

```bash
cd /home/user/IFT_interactors

# Run setup script
./scripts/setup_experimental_data_dirs.sh
```

This creates all necessary directories and initializes cache files.

### Step 2: Download First Dataset (5 minutes)

**Start with Boldt et al., 2016** (most comprehensive, 217 baits, SF-TAP-MS):

1. Visit: https://www.nature.com/articles/ncomms11491
2. Scroll to "Supplementary information" section
3. Download "Supplementary Data 1" (Excel format)
4. Save as: `experimental_data/raw/boldt_2016_supp_data_1.xlsx`

### Step 3: Inspect Dataset Structure (3 minutes)

```bash
# Inspect the Excel file
python3 scripts/inspect_excel.py experimental_data/raw/boldt_2016_supp_data_1.xlsx
```

**Record the structure**:
- Sheet names
- Column names for bait and prey proteins
- How proteins are identified (gene name? UniProt ID?)
- Any score/confidence columns

### Step 4: Implement Parser (10 minutes)

Edit `scripts/import_experimental_data.mjs` and implement the `parseBoldt2016()` function based on what you found in Step 3.

**Example template**:

```javascript
function parseBoldt2016(filePath) {
  console.log('📄 Parsing Boldt et al., 2016 dataset...');

  const xlsx = require('xlsx');
  const workbook = xlsx.readFile(filePath);

  // ADJUST: Use the correct sheet name from Step 3
  const sheetName = 'Interactions';  // ← Change this
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  const interactions = [];

  for (const row of data) {
    // ADJUST: Use the correct column names from Step 3
    const bait = row['Bait Protein'];      // ← Change this
    const prey = row['Prey Protein'];      // ← Change this
    const score = row['Confidence Score']; // ← Change this (optional)

    if (!bait || !prey) continue; // Skip empty rows

    interactions.push({
      bait: bait.trim(),
      prey: prey.trim(),
      score: score,
      notes: score ? `Score: ${score}` : ''
    });
  }

  console.log(`  Found ${interactions.length} interactions`);
  return interactions;
}
```

**If you need to install xlsx library**:
```bash
npm install xlsx
```

### Step 5: Test Protein Mapping (5 minutes)

```bash
# Set database connection
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# Test mapping with known proteins
node scripts/map_protein_ids.mjs --test

# Test with proteins from your dataset (use protein names you saw in Step 3)
node scripts/map_protein_ids.mjs IFT88
node scripts/map_protein_ids.mjs BBS7
```

### Step 6: Run Import (5 minutes)

**Start with a test** (modify parser to return only first 10 interactions):

```javascript
// In parseBoldt2016() function, add this before return:
interactions = interactions.slice(0, 10); // TEST: Only first 10
```

Then run:

```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

node scripts/import_experimental_data.mjs boldt2016
```

**Check the results**:

```bash
node -e "
const { sql } = require('@vercel/postgres');
(async () => {
  const result = await sql\`
    SELECT COUNT(*) as count
    FROM interactions
    WHERE experimental_validation IS NOT NULL
  \`;
  console.log('Validated interactions:', result.rows[0].count);

  const example = await sql\`
    SELECT
      b.gene_name as bait,
      p.gene_name as prey,
      i.experimental_validation
    FROM interactions i
    JOIN proteins b ON i.bait_protein_id = b.id
    JOIN proteins p ON i.prey_protein_id = p.id
    WHERE i.experimental_validation IS NOT NULL
    LIMIT 1
  \`;
  console.log('\\nExample validation:');
  console.log(JSON.stringify(example.rows[0], null, 2));
})();
"
```

If it looks good, remove the `.slice(0, 10)` limit and run the full import!

## Understanding the Data Flow

```
1. Download Dataset
   ↓
2. Inspect Structure (inspect_excel.py)
   ↓
3. Write Parser (implement parseBoldt2016)
   ↓
4. Parse Dataset → Extract bait-prey pairs
   ↓
5. Map Proteins to UniProt IDs (map_protein_ids.mjs)
   ├─ Check local database first
   ├─ Check protein_aliases table
   ├─ Query UniProt API if needed
   └─ Cache results
   ↓
6. Find Matching AF3 Predictions
   ↓
7. Update experimental_validation JSONB field
   {
     "experimental_methods": [
       {
         "method": "SF-TAP-MS",
         "study": "Boldt et al., 2016",
         "pmid": "27173156",
         "confidence": "high"
       }
     ],
     "validation_summary": {
       "is_validated": true,
       "validation_count": 1,
       "strongest_method": "SF-TAP-MS"
     }
   }
```

## Dataset Priority Order

Process datasets in this order (highest confidence methods first):

### Priority 1: Direct Physical Interactions ⭐⭐⭐
1. **Boldt et al., 2016** (SF-TAP-MS, 217 baits) ← **START HERE**
2. **Sang et al., 2011** (LAP, 9 baits)

### Priority 2: Proximity Labeling ⭐⭐
3. **Gupta et al., 2015** (BioID, 56 baits)
4. **Mick et al., 2015** (APEX, primary cilia)
5. **Kohli et al., 2017** (APEX, ciliary membrane)
6. **May et al., 2021** (APEX2, Hedgehog signaling)

### Priority 3: Specialized ⭐
7. **Aslanyan et al., 2023** (BioID2-UBD, ubiquitinome)

## Expected Results

After processing Boldt et al., 2016, you should see:

- ✅ **~50-150 validated interactions** (rough estimate, depends on overlap)
- ✅ **Higher validation rate for High confidence AF3 predictions**
- ✅ **Some novel AF3 predictions not yet in experimental data**

## Next Steps After Import

Once you have experimental validation data in the database:

### Phase 1: Basic Frontend Update (1-2 days)
- Add validation badge to results table
- Add filter: "Show only validated interactions"
- Display validation details on hover/click

### Phase 2: Validation Dashboard (2-3 days)
- Create `/validation` page
- Show validation statistics:
  - Overall validation rate
  - Validation rate by confidence level
  - Validation rate by method
- Network graph with validated edges highlighted
- List of novel AF3 predictions (not yet validated)

### Phase 3: Paper Figures (1-2 days)
- Generate validation rate bar chart (by confidence level)
- Create Venn diagram (AF3 vs experimental methods)
- Export validated interactions for supplementary table

## Troubleshooting

### "Parser returns 0 interactions"
- Check sheet name matches the data sheet
- Verify column names (use inspect_excel.py)
- Check if data starts on row 1 or later

### "All proteins fail to map"
- Check protein name format (is it gene names or UniProt IDs?)
- Try manual mapping: `node scripts/map_protein_ids.mjs <protein_name>`
- Check if proteins are human (dataset might be mouse/other organism)

### "All interactions show 'not_found'"
- Dataset might be for different organism (mouse vs human)
- Protein identifiers might be different format
- Your AF3 predictions might be subset of proteins in dataset

### "Import is very slow"
- Normal! UniProt API rate limiting causes delays
- Cached proteins map instantly, new ones take ~200ms each
- First run is slowest, subsequent runs use cache

## Files Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `EXPERIMENTAL_VALIDATION_PLAN.md` | Complete implementation plan with details | Reference only |
| `EXPERIMENTAL_DATA_SETUP.md` | Detailed setup instructions | Reference when stuck |
| `map_protein_ids.mjs` | UniProt ID mapping | Rarely (works as-is) |
| `import_experimental_data.mjs` | Main import script | Edit parsers for each dataset |
| `inspect_excel.py` | Dataset inspection | Use as-is |
| `setup_experimental_data_dirs.sh` | Directory setup | Run once, don't edit |

## Success Checklist

- [x] Scripts created and documented
- [x] Directory structure designed
- [x] UniProt mapping system implemented
- [x] Import framework ready
- [ ] Download Boldt et al., 2016 dataset ← **YOU ARE HERE**
- [ ] Inspect dataset structure
- [ ] Implement parser
- [ ] Test with 10 interactions
- [ ] Run full import
- [ ] Verify results in database
- [ ] Repeat for other datasets
- [ ] Update frontend to show validation
- [ ] Create validation statistics page

## Getting Help

**Check these files**:
1. `EXPERIMENTAL_DATA_SETUP.md` - Detailed step-by-step guide
2. `EXPERIMENTAL_VALIDATION_PLAN.md` - Complete project plan
3. `experimental_data/DOWNLOAD_CHECKLIST.md` - Track dataset downloads
4. `experimental_data/README.md` - Quick reference for data directory

**Common questions answered in plan**:
- How to handle bidirectional interactions?
- What to do with failed protein mappings?
- How to aggregate multiple validations?
- How to weight different methods?

## Time Estimates

- **First dataset (Boldt)**: 2-4 hours (includes learning curve)
- **Subsequent datasets**: 1-2 hours each
- **Frontend validation badges**: 4-6 hours
- **Validation dashboard**: 8-12 hours
- **Paper figures**: 4-6 hours

**Total: 2-3 weeks for complete integration**

---

## Ready to Start?

Run this now:

```bash
cd /home/user/IFT_interactors
./scripts/setup_experimental_data_dirs.sh
```

Then download Boldt et al., 2016 and follow the Quick Start guide above!

---

**Questions?** Check `EXPERIMENTAL_DATA_SETUP.md` for detailed troubleshooting and examples.
