# Structure Visualization Scripts

Scripts for preparing 3D structure data for the IFT Interactors web viewer.

## Overview

1. **collect_cif_paths.py** - Maps database interactions to CIF files in AlphaPulldown directory
2. **extract_contacts_for_web.py** - Extracts PAE contact data for structure coloring

## Prerequisites

```bash
# Install Python dependencies
pip install psycopg2-binary

# Ensure interface_analysis.py is available
ls /emcc/au14762/elo_lab/SCRIPTS/interface_analysis.py
```

## Step 1: Collect CIF Paths

Maps all interactions in the database to their corresponding CIF and confidences.json files.

```bash
# Set database connection
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# Run collection script
cd /emcc/au14762/elo_lab/SCRIPTS/Global_Analysis/IFT_Interactors_paper
python3 scripts/collect_cif_paths.py
```

**Output**: `cif_mapping.json` - Contains paths to all CIF and confidences files

**Example output:**
```
✓ Connected to database successfully
✓ Found 512 interactions in database

Searching for CIF files...
  Processed 50/512 - Found: 48, Missing: 2
  Processed 100/512 - Found: 97, Missing: 3
  ...

✓ Processing complete!
  Total interactions: 512
  Found CIF files: 508 (99.2%)
  Missing CIF files: 4 (0.8%)

✓ Saved mapping to: cif_mapping.json
```

## Step 2: Extract PAE Contacts

Processes CIF and confidences.json files to extract interface contact data with confidence levels.

### Batch Processing (All Interactions)

```bash
cd /emcc/au14762/elo_lab/SCRIPTS/Global_Analysis/IFT_Interactors_paper

# Extract all contacts (outputs to public/contacts_data/)
python3 scripts/extract_contacts_for_web.py --batch

# Or specify custom output directory
python3 scripts/extract_contacts_for_web.py --batch --output /path/to/output
```

**Output**: JSON files for each interaction in `public/contacts_data/`

**Example**: `public/contacts_data/123.json`
```json
{
  "interaction_id": 123,
  "generated_at": "2025-11-04T10:30:00",
  "data": {
    "chains": ["A", "B"],
    "chain_lengths": {"A": 450, "B": 380},
    "contacts": [
      {
        "chain1": "A",
        "resi1": 45,
        "aa1": "K",
        "chain2": "B",
        "resi2": 123,
        "aa2": "E",
        "pae": 2.1,
        "distance": 3.4,
        "confidence": "very_high",
        "color": "#228b22"
      }
    ],
    "summary": {
      "total_contacts": 75,
      "very_high_count": 15,
      "high_count": 30,
      "medium_count": 20,
      "low_count": 10
    },
    "spatial_validation_enabled": true
  }
}
```

### Single Interaction Processing

```bash
# Process one specific interaction
python3 scripts/extract_contacts_for_web.py \
  --directory q8nez3_and_q9hbg6 \
  --cif /emcc/.../q8nez3_and_q9hbg6_model.cif \
  --confidences /emcc/.../q8nez3_and_q9hbg6_confidences.json \
  --interaction-id 123
```

## Data Format

### cif_mapping.json Structure

```json
{
  "generated_at": "2025-11-04T10:00:00",
  "total_interactions": 512,
  "found_count": 508,
  "missing_count": 4,
  "mappings": {
    "1": {
      "cif_path": "/emcc/.../Q8NEZ3_IFT144/AF3/q8nez3_and_q9hbg6/q8nez3_and_q9hbg6_model.cif",
      "confidences_path": "/emcc/.../q8nez3_and_q9hbg6_confidences.json",
      "bait_directory": "Q8NEZ3_IFT144",
      "interaction_directory": "q8nez3_and_q9hbg6"
    }
  }
}
```

### Contact Data JSON Structure

Each interaction's contact file contains:

- **chains**: List of chain IDs (e.g., `["A", "B"]`)
- **chain_lengths**: Residue count per chain
- **contacts**: Array of interface contacts with:
  - `chain1`, `resi1`, `aa1`: First residue (chain, position, amino acid)
  - `chain2`, `resi2`, `aa2`: Second residue
  - `pae`: PAE value (Angstroms)
  - `distance`: Spatial distance (Angstroms)
  - `confidence`: Quality level (`very_high`, `high`, `medium`, `low`)
  - `color`: Hex color code for visualization
- **summary**: Contact counts by confidence level
- **spatial_validation_enabled**: Whether spatial validation was used

## Confidence Levels

PAE-based confidence thresholds (matching interface_analysis.py):

| Level | PAE Threshold | Spatial Distance | Color | Hex |
|-------|--------------|------------------|-------|-----|
| Very High | <3Å | <5Å | Forest Green | #228b22 |
| High | <5Å | <5Å | Green | #00ff00 |
| Medium | <8Å | <5Å | Yellow | #ffff00 |
| Low | <12Å | <5Å | Orange/Red | #ff4500 |

## Troubleshooting

### "Could not import interface_analysis.py"

Ensure the script is in the parent SCRIPTS directory:
```bash
ls /emcc/au14762/elo_lab/SCRIPTS/interface_analysis.py
```

### "CIF file not found"

Check AlphaPulldown directory structure:
```bash
ls /emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/
```

Expected structure:
```
AF3_APD/
  Q8NEZ3_IFT144/
    AF3/
      q8nez3_and_q9hbg6/
        q8nez3_and_q9hbg6_model.cif
        q8nez3_and_q9hbg6_confidences.json
```

### "POSTGRES_URL not set"

Export the database connection string:
```bash
export POSTGRES_URL="postgresql://..."
```

## Step 3: Upload to Vercel Blob Storage

Uploads CIF files and PAE contact JSONs to Vercel Blob for web serving.

### Prerequisites

Get your Vercel Blob token:
1. Go to https://vercel.com/dashboard/stores
2. Create a new Blob store (if you haven't already)
3. Copy the read-write token

### Dry Run (Recommended First)

```bash
export BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Test upload without actually uploading
node scripts/upload_to_vercel_blob.mjs --dry-run
```

This will show you what would be uploaded and the total size.

### Upload All Files

```bash
export BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Upload everything (CIF files + PAE JSONs)
node scripts/upload_to_vercel_blob.mjs
```

**Expected output:**
```
✓ Loaded manifest: 501 interactions
Checking existing blobs in storage...
Found 0 existing files

================================================================================
UPLOADING CIF FILES
================================================================================

[1/501] Interaction 1: IFT56 ↔ IFT46
  ✓ Uploaded: structures/1.cif (0.54 MB)
    URL: https://...vercel-storage.com/structures/1.cif
...

================================================================================
UPLOAD SUMMARY
================================================================================

CIF Files:
  Total:    501
  Uploaded: 501
  Size:     340.00 MB

PAE Contact Files:
  Total:    172
  Uploaded: 172
  Size:     5.20 MB

Total:
  Files:    673
  Size:     345.20 MB (0.337 GB)
  Free tier: 1.00 GB (663 MB remaining)

✅ Upload complete!
```

### Upload Options

```bash
# Upload only CIF files
node scripts/upload_to_vercel_blob.mjs --cifs-only

# Upload only PAE contact JSONs
node scripts/upload_to_vercel_blob.mjs --pae-only

# Dry run to preview
node scripts/upload_to_vercel_blob.mjs --dry-run
```

### File Organization in Vercel Blob

Files are organized as:
- **CIF files**: `structures/{interaction_id}.cif`
- **PAE contacts**: `pae_contacts/{interaction_id}.json`

Example:
```
structures/
  1.cif         (IFT56 ↔ IFT46)
  2.cif         (IFT56 ↔ DNAJC8)
  ...
pae_contacts/
  1.json
  2.json
  ...
```

### Re-running Upload

The script is safe to re-run:
- Existing files are overwritten with same content
- Failed uploads can be retried
- New files are added without affecting existing ones

## Next Steps

After running these scripts:

1. **Review cif_manifest.json** - Check for missing CIF files
2. **Review contact data** - Verify JSON files in `public/contacts_data/`
3. **Upload to Vercel Blob** - Make files accessible for web viewer
4. **Test with sample** - Pick one interaction and verify data looks correct
5. **Integrate with frontend** - Use generated data in Mol* structure viewer

## Performance Notes

- **CIF collection**: ~1 minute for 512 interactions
- **Contact extraction**: ~5-10 seconds per interaction (~45 minutes for 512 total)
- **Output size**: ~5-20 KB per contact JSON file (~5 MB total for 512 interactions)

## Contact Data Usage

The generated JSON files will be used by:
- `/api/structure/[interactionId]/pae/route.ts` - API endpoint serving contact data
- `components/StructureViewer.tsx` - Mol* viewer for structure coloring
