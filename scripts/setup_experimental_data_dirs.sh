#!/bin/bash
#
# Setup script for experimental validation data integration
# Creates directory structure and initializes configuration files
#

echo "🔧 Setting up experimental data directories..."
echo ""

# Create directory structure
mkdir -p experimental_data/raw
mkdir -p experimental_data/processed
mkdir -p experimental_data/mapping
mkdir -p scripts

echo "✅ Created directories:"
echo "   - experimental_data/raw         (for original downloaded datasets)"
echo "   - experimental_data/processed   (for parsed JSON files)"
echo "   - experimental_data/mapping     (for UniProt ID cache)"
echo "   - scripts                       (for import scripts)"
echo ""

# Initialize cache files
echo "{}" > experimental_data/mapping/uniprot_cache.json
echo "{}" > experimental_data/mapping/failed_mappings.json

echo "✅ Initialized cache files:"
echo "   - uniprot_cache.json"
echo "   - failed_mappings.json"
echo ""

# Make scripts executable
chmod +x scripts/*.mjs 2>/dev/null
chmod +x scripts/*.sh 2>/dev/null

echo "✅ Made scripts executable"
echo ""

# Create dataset download checklist
cat > experimental_data/DOWNLOAD_CHECKLIST.md << 'EOF'
# Dataset Download Checklist

Track your progress downloading experimental datasets:

## Priority 1: High Confidence Methods

- [ ] **Boldt et al., 2016** (SF-TAP-MS, 217 baits)
  - URL: https://www.nature.com/articles/ncomms11491
  - File: `raw/boldt_2016_supp_data_1.xlsx`
  - Status: ⏳ Not downloaded

- [ ] **Sang et al., 2011** (LAP method, 9 NPHP-JBTS-MKS baits)
  - URL: https://www.cell.com/cell/fulltext/S0092-8674(11)00473-X
  - File: `raw/sang_2011_table_s2.xlsx`
  - Status: ⏳ Not downloaded

## Priority 2: Proximity Labeling Methods

- [ ] **Gupta et al., 2015** (BioID, 56 baits)
  - URL: https://www.cell.com/cell/fulltext/S0092-8674(15)01443-4
  - File: `raw/gupta_2015_table_s1.xlsx`
  - Status: ⏳ Not downloaded

- [ ] **Mick et al., 2015** (APEX, primary cilia)
  - URL: https://www.cell.com/developmental-cell/fulltext/S1534-5807(15)00612-4
  - File: `raw/mick_2015_table_s1.xlsx`
  - Status: ⏳ Not downloaded

- [ ] **Kohli et al., 2017** (APEX, ciliary membrane)
  - URL: https://www.embopress.org/doi/full/10.15252/embr.201643846
  - File: `raw/kohli_2017_dataset_ev1.xlsx`
  - Status: ⏳ Not downloaded

## Priority 3: PRIDE Repository Datasets

- [ ] **May et al., 2021** (APEX2, Hedgehog signaling)
  - Data: http://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=PXD020583
  - File: `raw/may_2021_pride_pxd020583/`
  - Status: ⏳ Not downloaded

- [ ] **Aslanyan et al., 2023** (BioID2-UBD, ubiquitinome)
  - Data: http://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=PXD038379
  - File: `raw/aslanyan_2023_pride_pxd038379/`
  - Status: ⏳ Not downloaded

## Notes

- Start with Boldt et al., 2016 (most comprehensive)
- Check file formats before downloading (Excel vs CSV vs TSV)
- PRIDE datasets may require FTP access or special tools
- Update status after each download

EOF

echo "✅ Created download checklist: experimental_data/DOWNLOAD_CHECKLIST.md"
echo ""

# Create README
cat > experimental_data/README.md << 'EOF'
# Experimental Validation Data

This directory contains experimental interaction data from published cilia proteomics studies, used to validate AlphaFold3 predictions.

## Directory Structure

```
experimental_data/
├── raw/                    # Original downloaded datasets (Excel, CSV, etc.)
├── processed/              # Parsed interaction lists (JSON format)
├── mapping/                # UniProt ID mapping cache
│   ├── uniprot_cache.json
│   └── failed_mappings.json
├── DOWNLOAD_CHECKLIST.md   # Track dataset downloads
└── README.md               # This file
```

## Datasets

See `DOWNLOAD_CHECKLIST.md` for list of datasets to download.

## Workflow

1. **Download datasets**: Follow links in `DOWNLOAD_CHECKLIST.md`
2. **Inspect structure**: Use `../scripts/inspect_excel.py` to view file structure
3. **Write parser**: Implement parser function in `../scripts/import_experimental_data.mjs`
4. **Test mapping**: Run `../scripts/map_protein_ids.mjs --test`
5. **Import data**: Run `../scripts/import_experimental_data.mjs <dataset>`
6. **Verify**: Check database for validated interactions

## Quick Start

```bash
# 1. Setup directories (run from project root)
./scripts/setup_experimental_data_dirs.sh

# 2. Download first dataset (Boldt et al., 2016)
# Visit: https://www.nature.com/articles/ncomms11491
# Save to: experimental_data/raw/boldt_2016_supp_data_1.xlsx

# 3. Inspect file structure
python3 scripts/inspect_excel.py experimental_data/raw/boldt_2016_supp_data_1.xlsx

# 4. Set database connection
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# 5. Test protein mapping
node scripts/map_protein_ids.mjs --test

# 6. Run import
node scripts/import_experimental_data.mjs boldt2016
```

See `../scripts/EXPERIMENTAL_DATA_SETUP.md` for detailed instructions.
EOF

echo "✅ Created README: experimental_data/README.md"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Read experimental_data/DOWNLOAD_CHECKLIST.md"
echo "2. Download datasets from papers"
echo "3. Follow instructions in scripts/EXPERIMENTAL_DATA_SETUP.md"
echo ""
