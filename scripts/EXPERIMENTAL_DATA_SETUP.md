# Experimental Data Setup Guide

This guide walks through downloading and processing experimental validation datasets.

## Step 1: Create Directory Structure

```bash
cd /home/user/IFT_interactors

# Create directories
mkdir -p experimental_data/raw
mkdir -p experimental_data/processed
mkdir -p experimental_data/mapping
mkdir -p scripts

# Make scripts executable
chmod +x scripts/*.mjs
```

## Step 2: Download Datasets

### Priority 1: Boldt et al., 2016 (START HERE)

**Paper**: "An organelle-specific protein landscape identifies novel diseases and molecular mechanisms"
**Link**: https://www.nature.com/articles/ncomms11491

**Download Instructions**:
1. Visit the paper URL
2. Scroll to "Supplementary information" section
3. Download "Supplementary Data 1" (Excel or CSV format)
4. Save as: `experimental_data/raw/boldt_2016_supp_data_1.xlsx`

**What to expect**:
- File contains 217 bait proteins
- Multiple sheets possible (interactions, complexes, etc.)
- Need to identify which sheet has bait-prey pairs

**Quick Check** (once downloaded):
```bash
# List sheets in Excel file (if you have python with pandas)
python3 -c "import pandas as pd; print(pd.ExcelFile('experimental_data/raw/boldt_2016_supp_data_1.xlsx').sheet_names)"

# Or manually open in Excel/LibreOffice to inspect structure
```

### Priority 2: Gupta et al., 2015

**Paper**: "A dynamic protein interaction landscape of the human centrosome-cilium interface"
**Link**: https://www.cell.com/cell/fulltext/S0092-8674(15)01443-4

**Download Instructions**:
1. Visit the paper URL
2. Click "Supplemental information"
3. Download Table S1
4. Save as: `experimental_data/raw/gupta_2015_table_s1.xlsx`

### Priority 3: Sang et al., 2011

**Paper**: "Mapping the NPHP-JBTS-MKS protein network reveals ciliopathy disease genes and pathways"
**Link**: https://www.cell.com/cell/fulltext/S0092-8674(11)00473-X

**Download Instructions**:
1. Visit the paper URL
2. Click "Supplemental information"
3. Download Table S2
4. Save as: `experimental_data/raw/sang_2011_table_s2.xlsx`

### Priority 4: Mick et al., 2015

**Paper**: "Proteomics of primary cilia by proximity labeling"
**Link**: https://www.cell.com/developmental-cell/fulltext/S1534-5807(15)00612-4

**Download Instructions**:
1. Visit the paper URL
2. Click "Supplemental information"
3. Download Table S1
4. Save as: `experimental_data/raw/mick_2015_table_s1.xlsx`

### Priority 5: Kohli et al., 2017

**Paper**: "The ciliary membrane-associated proteome reveals actin-binding proteins as key components of cilia"
**Link**: https://www.embopress.org/doi/full/10.15252/embr.201643846

**Download Instructions**:
1. Visit the paper URL
2. Go to "Expanded View" section
3. Download "Dataset EV1"
4. Save as: `experimental_data/raw/kohli_2017_dataset_ev1.xlsx`

### Priority 6: May et al., 2021 (PRIDE Repository)

**Paper**: "Time-resolved proteomics profiling of the ciliary Hedgehog response"
**Link**: https://rupress.org/jcb/article/220/5/e202007207/211927

**Data**: ProteomeXchange PRIDE repository
**Dataset ID**: PXD020583

**Download Instructions**:
```bash
# Visit PRIDE: http://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=PXD020583
# Download relevant files (protein interaction lists)
# This may require FTP access or web interface
```

### Priority 7: Aslanyan et al., 2023 (PRIDE Repository)

**Paper**: "A targeted multi-proteomics approach generates a blueprint of the ciliary ubiquitinome"
**Link**: https://www.frontiersin.org/articles/10.3389/fcell.2023.1113656/full

**Data**: PRIDE repository
**Dataset ID**: PXD038379

**Download Instructions**:
```bash
# Visit PRIDE: http://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=PXD038379
# Download relevant files
```

## Step 3: Inspect Downloaded Files

Before writing parsers, inspect the file structure:

```bash
# For Excel files with pandas
python3 -c "
import pandas as pd
import sys

file = sys.argv[1]
xls = pd.ExcelFile(file)

print(f'File: {file}')
print(f'Sheets: {xls.sheet_names}')
print()

for sheet in xls.sheet_names:
    df = pd.read_excel(file, sheet_name=sheet, nrows=5)
    print(f'Sheet: {sheet}')
    print(f'Columns: {list(df.columns)}')
    print(f'Shape: {df.shape}')
    print(df.head())
    print('\\n' + '='*80 + '\\n')
" experimental_data/raw/boldt_2016_supp_data_1.xlsx
```

**Record the structure**:
- Which sheet has interactions?
- Column names for bait and prey
- Any score/confidence columns?
- How are proteins identified? (UniProt ID, gene name, etc.)

## Step 4: Write Dataset Parser

Based on the file structure, implement the parser function:

### Example: Boldt et al., 2016 Parser

```javascript
// In scripts/import_experimental_data.mjs

function parseBoldt2016(filePath) {
  console.log('📄 Parsing Boldt et al., 2016 dataset...');

  const interactions = [];

  // Example structure (ADJUST BASED ON ACTUAL FILE!):
  // Assuming CSV format with columns: Bait, Prey, Score
  const data = readFileSync(filePath, 'utf-8');
  const lines = data.split('\n').slice(1); // Skip header

  for (const line of lines) {
    if (!line.trim()) continue;

    const [bait, prey, score] = line.split(',');

    // Filter for IFT/BBS proteins if needed
    // Add any dataset-specific processing

    interactions.push({
      bait: bait.trim(),
      prey: prey.trim(),
      score: parseFloat(score),
      notes: `Score: ${score}`
    });
  }

  console.log(`  Found ${interactions.length} interactions`);
  return interactions;
}
```

**For Excel files**, you may need to use a library like `xlsx`:

```bash
npm install xlsx
```

```javascript
import xlsx from 'xlsx';

function parseBoldt2016Excel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Adjust based on inspection
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  const interactions = [];
  for (const row of data) {
    interactions.push({
      bait: row['Bait'],        // Adjust column names
      prey: row['Prey'],
      score: row['Score'],
      notes: row['Notes'] || ''
    });
  }

  return interactions;
}
```

## Step 5: Test Protein Mapping

Before running full import, test the protein ID mapping:

```bash
# Set database connection
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# Test mapping
node scripts/map_protein_ids.mjs --test

# Test specific proteins from your dataset
node scripts/map_protein_ids.mjs IFT88
node scripts/map_protein_ids.mjs BBS7
node scripts/map_protein_ids.mjs NPHP1
```

## Step 6: Run Import (Start Small!)

**Test with a subset first**:

1. Modify parser to only return first 10 interactions (for testing)
2. Run import:

```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

node scripts/import_experimental_data.mjs boldt2016
```

3. Check results:

```bash
node -e "
const { sql } = require('@vercel/postgres');
(async () => {
  const result = await sql\`
    SELECT COUNT(*) as validated_count
    FROM interactions
    WHERE experimental_validation IS NOT NULL
  \`;
  console.log('Validated interactions:', result.rows[0].validated_count);

  // Show one example
  const example = await sql\`
    SELECT
      i.id,
      i.experimental_validation,
      b.gene_name as bait,
      p.gene_name as prey
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

4. If looks good, remove the 10-interaction limit and run full import

## Step 7: Process All Datasets

Once you've tested and validated the workflow with one dataset:

```bash
# Process all downloaded datasets
node scripts/import_experimental_data.mjs all
```

## Step 8: Generate Report

Check how many AF3 predictions were validated:

```bash
node -e "
const { sql } = require('@vercel/postgres');
(async () => {
  const total = await sql\`SELECT COUNT(*) FROM interactions\`;
  const validated = await sql\`
    SELECT COUNT(*) FROM interactions
    WHERE experimental_validation IS NOT NULL
  \`;

  console.log('Total AF3 predictions:', total.rows[0].count);
  console.log('Experimentally validated:', validated.rows[0].count);
  console.log('Validation rate:', (validated.rows[0].count / total.rows[0].count * 100).toFixed(1) + '%');

  // By confidence level
  const byConfidence = await sql\`
    SELECT
      ipsae_confidence,
      COUNT(*) as total,
      COUNT(experimental_validation) as validated
    FROM interactions
    WHERE ipsae IS NOT NULL
    GROUP BY ipsae_confidence
    ORDER BY
      CASE ipsae_confidence
        WHEN 'High' THEN 1
        WHEN 'Medium' THEN 2
        WHEN 'Low' THEN 3
      END
  \`;

  console.log('\\nValidation by confidence level:');
  byConfidence.rows.forEach(row => {
    const rate = (row.validated / row.total * 100).toFixed(1);
    console.log(\`  \${row.ipsae_confidence}: \${row.validated}/\${row.total} (\${rate}%)\`);
  });
})();
"
```

## Troubleshooting

### Issue: "File not found"
- Check file path matches exactly
- Ensure file was downloaded to correct directory
- Check file extension (.xlsx vs .csv)

### Issue: "Failed to map protein"
- Check if protein name format matches expected (gene name vs full name)
- Manually check UniProt for the protein
- Add to manual mapping cache if needed

### Issue: "Parser returns 0 interactions"
- Inspect file structure with pandas
- Check column names match parser expectations
- Verify sheet name (for Excel files)
- Check delimiter (comma vs tab vs semicolon)

### Issue: "All interactions show 'not_found'"
- Your AF3 predictions might use different organism or protein IDs
- Check if experimental data is for human vs other organism
- Verify protein ID formats match between datasets

## Next Steps After Import

1. **Update frontend** to show validation badges
2. **Create validation statistics page**
3. **Generate figures** for manuscript
4. **Export validated interactions** for supplementary table

---

**Estimated Time**:
- Download datasets: 1-2 hours
- Inspect and write parsers: 2-4 hours per dataset
- Test and run imports: 1-2 hours per dataset
- **Total**: ~2-3 days for all 7 datasets

**Priority Order**: Start with Boldt et al., 2016 (most comprehensive, highest confidence method)
