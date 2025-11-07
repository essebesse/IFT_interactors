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
