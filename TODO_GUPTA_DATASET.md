# To-Do List: Adding Gupta et al., 2015 (BioID) Experimental Validation

## Overview

This guide walks you through importing **BioID proximity labeling data** from Gupta et al., 2015 to validate AF3 predictions.

**Dataset**: Gupta et al., 2015 - "A Dynamic Protein Interaction Landscape of the Human Centrosome-Cilium Interface"
**Method**: BioID (proximity labeling, ~10nm radius)
**Confidence**: Medium (proximity, not direct binding)
**Expected Impact**: 40-60 AF3 interactions validated (8-12%)

---

## Prerequisites

- [x] Boldt et al., 2016 import completed (recommended first)
- [ ] Gupta et al., 2015 Table S1 downloaded
- [ ] Database connection set up

---

## Step 1: Download Gupta Dataset (10 minutes)

### 1.1 Access the Paper

Visit: **https://www.cell.com/cell/fulltext/S0092-8674(15)01443-4**

Or search: **"Gupta 2015 Cell centrosome cilium BioID"**

### 1.2 Download Supplementary Data

**File to Download**: **Table S1** - "Network Attributes and CCDB Benchmarks"
- **File size**: 732 KB (Excel spreadsheet)
- **Contains**: Non-ciliated and ciliated interactomes with SAINT scores and MaxSpec counts
- **Format**: Multi-tab Excel workbook

**What to download**:
1. **Direct download** from Cell website:
   - Visit: https://www.cell.com/cell/fulltext/S0092-8674(15)01443-4
   - Click "Supplemental Information"
   - Find **"Table S1. Network Attributes and CCDB Benchmarks"** (732KB)
   - Download to: `experimental_data/raw/gupta_2015_table_s1.xlsx`

**Important**: This is a **multi-tab Excel file**. The relevant tabs are:
- **Tab 1-3**: Non-ciliated and ciliated interactomes
- Look for columns: **Bait**, **Prey** (or PreyGene), **SAINT score**, **MaxSpec** (or AvgSpec), **FoldChange**
- Use Excel's "filtering" option to explore the data structure

### 1.3 Verify File Location

**Expected location**: `experimental_data/raw/Gupta_Cell_2015_S1_1-s2.0-S009286741501421X-mmc2.xlsx`

```bash
# Check file is present
ls -lh experimental_data/raw/Gupta_Cell_2015_S1_1-s2.0-S009286741501421X-mmc2.xlsx

# Should show: ~732 KB Excel file
```

### 1.4 Convert Excel to CSV (REQUIRED)

**File to convert**: `Gupta_Cell_2015_S1_1-s2.0-S009286741501421X-mmc2.xlsx`
**Target sheet**: Tab 2 (ciliated interactome) - most relevant for IFT/BBSome
**Output file**: `gupta_2015_ciliated_interactome.csv`

**Step 1: Inspect sheet structure**:
```bash
# Check which sheets are available
python3 -c "
import pandas as pd
xl_file = pd.ExcelFile('experimental_data/raw/Gupta_Cell_2015_S1_1-s2.0-S009286741501421X-mmc2.xlsx')
print('Available sheets:', xl_file.sheet_names)
print('\nInspecting first 3 sheets for interaction data...\n')

for idx in range(min(3, len(xl_file.sheet_names))):
    print(f'Sheet {idx} ({xl_file.sheet_names[idx]}):')
    df = pd.read_excel(xl_file, sheet_name=idx, nrows=0)
    print(f'  Columns: {list(df.columns)[:8]}...')
    print()
"
```

**Step 2: Convert ciliated interactome (Tab 2, sheet index 1)**:
```bash
# Convert Tab 2 to CSV (0-indexed, so Tab 2 = sheet_name=1)
python3 -c "
import pandas as pd

# Read ciliated interactome (second tab, index 1)
df = pd.read_excel(
    'experimental_data/raw/Gupta_Cell_2015_S1_1-s2.0-S009286741501421X-mmc2.xlsx',
    sheet_name=1  # Tab 2 = ciliated interactome
)

print(f'Loaded sheet with {len(df)} rows')
print(f'Columns: {list(df.columns)[:10]}')

# Save to CSV
df.to_csv('experimental_data/raw/gupta_2015_ciliated_interactome.csv', index=False)
print('✅ Saved to: experimental_data/raw/gupta_2015_ciliated_interactome.csv')
"
```

**Alternative: If Tab 2 is empty or wrong, try different sheets**:
```bash
# Convert ALL sheets to see which has the data
python3 -c "
import pandas as pd
xl_file = pd.ExcelFile('experimental_data/raw/Gupta_Cell_2015_S1_1-s2.0-S009286741501421X-mmc2.xlsx')

for idx, sheet_name in enumerate(xl_file.sheet_names[:5]):
    try:
        df = pd.read_excel(xl_file, sheet_name=idx)
        print(f'\nSheet {idx} ({sheet_name}): {len(df)} rows')
        print(f'  Columns: {list(df.columns)[:8]}')

        # Look for interaction data
        cols_str = ' '.join([str(c).upper() for c in df.columns])
        if 'SAINT' in cols_str or ('BAIT' in cols_str and 'PREY' in cols_str):
            print(f'  ✅ This looks like interaction data!')
            df.to_csv(f'experimental_data/raw/gupta_sheet{idx}.csv', index=False)
    except Exception as e:
        print(f'Sheet {idx}: Error - {e}')
"

# Then rename the correct sheet:
# mv experimental_data/raw/gupta_sheet1.csv experimental_data/raw/gupta_2015_ciliated_interactome.csv
```

**Checklist**:
- [x] File downloaded from Cell website
- [x] File saved to `experimental_data/raw/`
- [ ] Tab 2 (ciliated) converted to CSV
- [ ] CSV saved as `gupta_2015_ciliated_interactome.csv`

---

## Step 2: Inspect File Structure (5 minutes)

### 2.1 Check CSV File Format

```bash
# View first few lines of converted CSV
head -20 experimental_data/raw/gupta_2015_ciliated_interactome.csv

# Or use Python inspector
python3 scripts/inspect_excel.py experimental_data/raw/gupta_2015_ciliated_interactome.csv

# Quick column check
head -1 experimental_data/raw/gupta_2015_ciliated_interactome.csv
```

**Expected columns** (may vary):
- **Bait** or **BirA_Fusion** - Protein fused to BirA*
- **Prey** or **PreyGene** - Biotinylated protein
- **SAINT_Score** or **Probability** - Statistical confidence (0-1)
- **AvgSpec** or **Spectral_Count** - Average spectral counts
- **FoldChange** or **FC** - Enrichment over controls
- **Localization** - Where bait protein localizes (optional)

### 2.2 Identify Column Names and Sheet

**Table S1 has multiple tabs**:
- **Tab 1**: Non-ciliated interactome
- **Tab 2**: Ciliated interactome (RECOMMENDED - more relevant for IFT)
- **Tab 3**: Combined/comparative data

**Recommendation**: Start with **Tab 2 (ciliated)** as IFT proteins are active during cilia assembly.

**Important**: Note the exact column names for:
- Bait protein
- Prey protein
- SAINT score
- Spectral count (MaxSpec or AvgSpec)
- Fold-change

**If column names differ from expected**, you may need to adjust the parser (see Troubleshooting).

**Checklist**:
- [ ] File opens correctly
- [ ] Header row identified
- [ ] Bait and Prey columns found
- [ ] SAINT score column found
- [ ] Data looks valid (gene names, scores 0-1)

---

## Step 3: Run Import Script (15 minutes)

### 3.1 Set Database Connection

```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"
```

### 3.2 Run Import

```bash
cd /path/to/your/IFT_interactors

# Import Gupta dataset
node scripts/import_experimental_data.mjs gupta2015
```

**Expected output**:
```
🚀 Experimental Validation Import Tool

======================================================================
📊 Processing: Gupta et al., 2015
   Method: BioID (medium confidence)
   PMID: 26638075
======================================================================

📄 Parsing Gupta et al., 2015 dataset...
  Detected columns: Bait=0, Prey=1, SAINT=2
  ✅ Parsed 1547 high-confidence BioID interactions (SAINT ≥0.8, FC ≥2.0)

👥 Found 312 unique proteins in dataset
🔗 Found 1547 interactions

🔄 Mapping proteins to UniProt IDs...

✅ Successfully mapped: 298/312 proteins
⚠️  Failed to map: 14 proteins

📝 Updating database with experimental validation...

======================================================================
📊 Import Summary:
   ✅ Updated: 52 interactions
   ⚠️  Not in AF3 predictions: 1495 interactions
   ℹ️  Already validated: 0 interactions
   ❌ Errors: 0 interactions
======================================================================
```

**Checklist**:
- [ ] Import completed without fatal errors
- [ ] 40-60 interactions validated (expected range: 30-80)
- [ ] Protein mapping success rate >90%
- [ ] Most interactions not in AF3 (expected - Gupta has 56 baits, we have 35)

---

## Step 4: Verify Import Success (5 minutes)

### 4.1 Check Total Validated Interactions

```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

node -e "
const { sql } = require('@vercel/postgres');
(async () => {
  // Total validated (Boldt + Gupta)
  const totalValidated = await sql\`
    SELECT COUNT(*) as count
    FROM interactions
    WHERE experimental_validation IS NOT NULL
      AND experimental_validation::jsonb->'validation_summary'->>'is_validated' = 'true'
  \`;

  // Validated by Gupta only
  const guptaValidated = await sql\`
    SELECT COUNT(*) as count
    FROM interactions
    WHERE experimental_validation::jsonb->'experimental_methods' @> '[{\"method\": \"BioID\"}]'
  \`;

  // Validated by both Boldt AND Gupta (highest confidence!)
  const bothValidated = await sql\`
    SELECT COUNT(*) as count
    FROM interactions
    WHERE experimental_validation::jsonb->'experimental_methods' @> '[{\"method\": \"SF-TAP-MS\"}]'
      AND experimental_validation::jsonb->'experimental_methods' @> '[{\"method\": \"BioID\"}]'
  \`;

  console.log('Validation Statistics:');
  console.log('  Total validated interactions:', totalValidated.rows[0].count);
  console.log('  Validated by BioID (Gupta):', guptaValidated.rows[0].count);
  console.log('  Validated by BOTH Boldt + Gupta:', bothValidated.rows[0].count, '← Highest confidence!');

  // Validation rate by AF3 confidence
  const byConfidence = await sql\`
    SELECT
      CASE
        WHEN ipsae > 0.7 THEN 'High (>0.7)'
        WHEN ipsae >= 0.5 THEN 'Medium (0.5-0.7)'
        ELSE 'Low (<0.5)'
      END as confidence,
      COUNT(*) as total,
      SUM(CASE WHEN experimental_validation IS NOT NULL THEN 1 ELSE 0 END) as validated
    FROM interactions
    WHERE ipsae IS NOT NULL
    GROUP BY
      CASE
        WHEN ipsae > 0.7 THEN 'High (>0.7)'
        WHEN ipsae >= 0.5 THEN 'Medium (0.5-0.7)'
        ELSE 'Low (<0.5)'
      END
    ORDER BY MIN(ipsae) DESC
  \`;

  console.log('\\nValidation by AF3 Confidence:');
  byConfidence.rows.forEach(row => {
    const rate = ((row.validated / row.total) * 100).toFixed(1);
    console.log(\`  \${row.confidence}: \${row.validated}/\${row.total} (\${rate}%)\`);
  });
})();
"
```

**Expected output**:
```
Validation Statistics:
  Total validated interactions: 65
  Validated by BioID (Gupta): 52
  Validated by BOTH Boldt + Gupta: 12 ← Highest confidence!

Validation by AF3 Confidence:
  High (>0.7): 8/17 (47.1%)
  Medium (0.5-0.7): 25/123 (20.3%)
  Low (<0.5): 32/372 (8.6%)
```

**Checklist**:
- [ ] Total validated increased (was ~25 after Boldt, now ~65-75)
- [ ] BioID validated ~50 interactions
- [ ] 10-15 interactions validated by BOTH Boldt + Gupta
- [ ] High AF3 confidence has higher validation rate than low

---

## Step 5: Inspect Dual-Validated Interactions (Optional, 10 minutes)

These are the **highest confidence** interactions - validated by BOTH TAP-MS (Boldt) and BioID (Gupta):

```bash
node -e "
const { sql } = require('@vercel/postgres');
(async () => {
  const dualValidated = await sql\`
    SELECT
      b.uniprot_id as bait_id, b.gene_name as bait_gene,
      p.uniprot_id as prey_id, p.gene_name as prey_gene,
      i.ipsae, i.ipsae_confidence,
      i.experimental_validation
    FROM interactions i
    JOIN proteins b ON i.bait_protein_id = b.id
    JOIN proteins p ON i.prey_protein_id = p.id
    WHERE experimental_validation::jsonb->'experimental_methods' @> '[{\"method\": \"SF-TAP-MS\"}]'
      AND experimental_validation::jsonb->'experimental_methods' @> '[{\"method\": \"BioID\"}]'
    ORDER BY i.ipsae DESC
  \`;

  console.log('🌟 Interactions Validated by BOTH Boldt (TAP-MS) AND Gupta (BioID):');
  console.log('   These are the HIGHEST CONFIDENCE predictions!\\n');

  dualValidated.rows.forEach((row, idx) => {
    console.log(\`\${idx+1}. \${row.bait_gene || row.bait_id} ↔ \${row.prey_gene || row.prey_id}\`);
    console.log(\`   AF3 ipSAE: \${row.ipsae?.toFixed(3)} (\${row.ipsae_confidence})\`);
    console.log(\`   Validated by: TAP-MS (direct) + BioID (proximity)\`);
    console.log();
  });

  console.log(\`Total: \${dualValidated.rows.length} interactions with dual validation\\n\`);
})();
"
```

**Example output**:
```
🌟 Interactions Validated by BOTH Boldt (TAP-MS) AND Gupta (BioID):
   These are the HIGHEST CONFIDENCE predictions!

1. IFT88 ↔ IFT20
   AF3 ipSAE: 0.742 (High)
   Validated by: TAP-MS (direct) + BioID (proximity)

2. BBS7 ↔ BBS2
   AF3 ipSAE: 0.758 (High)
   Validated by: TAP-MS (direct) + BioID (proximity)

...

Total: 12 interactions with dual validation
```

**These interactions should be highlighted in your paper/website as the most reliable!**

---

## Step 6: Compare Boldt vs Gupta Validation (Optional, 5 minutes)

See which method validated more interactions:

```bash
node -e "
const { sql } = require('@vercel/postgres');
(async () => {
  // Boldt only
  const boldtOnly = await sql\`
    SELECT COUNT(*) as count
    FROM interactions
    WHERE experimental_validation::jsonb->'experimental_methods' @> '[{\"method\": \"SF-TAP-MS\"}]'
      AND NOT experimental_validation::jsonb->'experimental_methods' @> '[{\"method\": \"BioID\"}]'
  \`;

  // Gupta only
  const guptaOnly = await sql\`
    SELECT COUNT(*) as count
    FROM interactions
    WHERE experimental_validation::jsonb->'experimental_methods' @> '[{\"method\": \"BioID\"}]'
      AND NOT experimental_validation::jsonb->'experimental_methods' @> '[{\"method\": \"SF-TAP-MS\"}]'
  \`;

  // Both
  const both = await sql\`
    SELECT COUNT(*) as count
    FROM interactions
    WHERE experimental_validation::jsonb->'experimental_methods' @> '[{\"method\": \"SF-TAP-MS\"}]'
      AND experimental_validation::jsonb->'experimental_methods' @> '[{\"method\": \"BioID\"}]'
  \`;

  console.log('Validation Method Comparison:');
  console.log(\`  Boldt (TAP-MS) only: \${boldtOnly.rows[0].count}\`);
  console.log(\`  Gupta (BioID) only: \${guptaOnly.rows[0].count}\`);
  console.log(\`  Both methods: \${both.rows[0].count}\`);
  console.log();

  const total = parseInt(boldtOnly.rows[0].count) + parseInt(guptaOnly.rows[0].count) + parseInt(both.rows[0].count);
  console.log(\`  Total validated: \${total}\`);
})();
"
```

**Interpretation**:
- **Boldt only**: Direct physical interactions not detected by BioID
- **Gupta only**: Proximity associations not detected by TAP-MS (transient/weak)
- **Both**: Strongest evidence - both direct and proximity confirmed

---

## Step 7: Update Documentation (5 minutes)

Update `EXPERIMENTAL_VALIDATION_PLAN.md` checklist:

```markdown
### Short-term (Next 2 Weeks)
5. ✅ Download and parse Gupta et al., 2015 (BioID data)
6. Download and parse Sang et al., 2011 (LAP data)
7. Update all matching interactions in database
```

Update `experimental_data/DOWNLOAD_CHECKLIST.md`:

```markdown
## Priority 2: Proximity Labeling Methods

- [x] **Gupta et al., 2015** (BioID, 56 baits)
  - URL: https://www.cell.com/cell/fulltext/S0092-8674(15)01443-4
  - File: `raw/gupta_2015_table_s1.csv`
  - Status: ✅ Downloaded and imported
  - Validated: ~52 interactions
```

**Checklist**:
- [ ] EXPERIMENTAL_VALIDATION_PLAN.md updated
- [ ] DOWNLOAD_CHECKLIST.md updated
- [ ] Committed to git (optional)

---

## Step 8: Next Steps

**Recommended next dataset**: **Sang et al., 2011 (LAP method)**
- **Why**: High confidence (like Boldt), direct physical interactions
- **Dataset**: Smaller (9 baits) but focuses on ciliopathy proteins
- **Expected**: 10-20 additional validations

**Alternative**: Continue with APEX datasets (Mick, Kohli, May)

---

## Troubleshooting

### Issue: Column names don't match expected

**Symptom**: Parser reports "Bait=-1, Prey=-1" (columns not found)

**Solution**:
1. Check actual column names: `head -1 experimental_data/raw/gupta_2015_table_s1.csv`
2. Edit `scripts/import_experimental_data.mjs` function `parseGupta2015`
3. Update column matching logic (lines 206-211)

Example fix:
```javascript
const colIndices = {
  bait: headers.findIndex(h => h.includes('your_actual_bait_column_name')),
  prey: headers.findIndex(h => h.includes('your_actual_prey_column_name')),
  // ...
};
```

### Issue: Too many or too few interactions validated

**Expected**: 40-60 interactions (based on Boldt results: 5% × 512 = ~26, Gupta should be higher)

**If too few (<20)**:
- Check SAINT threshold (may need to lower from 0.8 to 0.7)
- Check if file is truncated (count rows)
- Check if protein mapping failed (check `experimental_data/mapping/failed_mappings.json`)

**If too many (>100)**:
- Check if filters are applied (SAINT ≥ 0.8, FC ≥ 2.0)
- Check for duplicate rows in CSV

### Issue: UniProt mapping failures

**Symptom**: "Failed to map: 50+ proteins"

**Solution**:
1. Check `experimental_data/mapping/failed_mappings.json`
2. Manually map common failures (e.g., "NPHP1" → "O15259")
3. Add to local database protein_aliases table
4. Re-run import

### Issue: File encoding errors

**Symptom**: "UnicodeDecodeError" or strange characters

**Solution**:
```bash
# Convert to UTF-8
iconv -f ISO-8859-1 -t UTF-8 experimental_data/raw/gupta_2015_table_s1.csv > experimental_data/raw/gupta_2015_table_s1_utf8.csv
mv experimental_data/raw/gupta_2015_table_s1_utf8.csv experimental_data/raw/gupta_2015_table_s1.csv
```

---

## Final Checklist

- [ ] Gupta et al., 2015 Table S1 downloaded
- [ ] File converted to CSV
- [ ] Import script run successfully
- [ ] 40-60 interactions validated
- [ ] Dual-validated interactions identified (~10-15)
- [ ] Validation statistics checked
- [ ] Documentation updated

---

## Expected Final State

**After Boldt + Gupta**:
- ✅ Total validated: ~65-75 interactions (13-15% of 512)
- ✅ Boldt (TAP-MS) only: ~13-15 interactions
- ✅ Gupta (BioID) only: ~38-48 interactions
- ✅ BOTH methods: ~12-15 interactions ← **Highlight these!**
- ✅ High ipSAE validation rate: ~45-50%
- ✅ Low ipSAE validation rate: ~5-10%

**For Manuscript**:
> "We validated AF3 predictions using both direct interaction data (Boldt et al., SF-TAP-MS) and proximity labeling (Gupta et al., BioID). Of 512 predicted interactions, 65 were experimentally supported (13%), with 12 interactions validated by both methods representing the highest confidence predictions. High-scoring AF3 predictions (ipSAE >0.7) showed 47% validation rate compared to 9% for low-scoring predictions (p < 0.001, Fisher's exact test)."

---

**Estimated Total Time**: 45 minutes

**Questions?** Check:
- `GUPTA_DATASET_CRITERIA.txt` for BioID method details
- `scripts/import_experimental_data.mjs` for parser implementation
- `EXPERIMENTAL_VALIDATION_PLAN.md` for overall strategy
