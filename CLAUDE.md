# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Protoview**: Next.js web app for visualizing AlphaFold protein-protein interactions.
- **Live Site**: https://ciliaaf3predictions.vercel.app/
- **Stack**: Next.js 14, PostgreSQL (Neon), Vercel deployment
- **Data**: AF2/AF3 predictions with confidence scoring (iPTM, ipSAE, interface quality)

## Quick Start

### Import Workflows

**Single Bait (A:B format):**
```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_q2HCPRojzJ0i@ep-falling-shadow-agzy57k0-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
node db/import_af3_json.mjs /path/to/AF3_PD_analysis_v3.json
node db/incremental_organism_lookup.mjs
node db/fetch_aliases.mjs
node -e "const { sql } = require('@vercel/postgres'); (async () => { const result = await sql\`UPDATE proteins p SET gene_name = pa.alias_name FROM protein_aliases pa WHERE p.id = pa.protein_id AND pa.alias_type = 'gene_name' AND p.gene_name IS NULL\`; console.log(\`Updated \${result.rowCount} proteins\`); })();"
node db/chlamyfp_gene_lookup.mjs
node -e "const { sql } = require('@vercel/postgres'); (async () => { const result = await sql\`UPDATE proteins SET gene_name = NULL WHERE (uniprot_id LIKE 'AF2_Cre%' OR uniprot_id LIKE 'CRE%') AND gene_name = REPLACE(uniprot_id, 'AF2_', '')\`; console.log(\`Cleaned \${result.rowCount} redundant gene names\`); })();"
node db/check_db.mjs
```

**Complex Bait (AB:C format):**
```bash
# v3 (interface quality)
# Full-length proteins:
./import_complex.sh /path/to/AF3_bait_prey_analysis_v3.json

# Protein variants (specify custom name):
./import_complex.sh /path/to/AF3_bait_prey_analysis_v3.json "Cterm_141-107aa"
./import_complex.sh /path/to/AF3_bait_prey_analysis_v3.json "Nterm_1-150aa"

# v4 (ipSAE scoring)
# Full-length proteins:
./import_complex_v4.sh /path/to/AF3_bait_prey_analysis_v4.json

# Protein variants (specify custom name):
./import_complex_v4.sh /path/to/AF3_bait_prey_analysis_v4.json "Cterm_141-107aa"
```

⚠️ **CRITICAL: Complex Import File Format**
- ✅ **CORRECT**: `AF3_bait_prey_analysis_v4.json` (Complex-prey AB:C format)
- ❌ **WRONG**: `AF3_PD_analysis_v4.json` (Pairwise A-B format - use single bait import instead!)
- The `AF3_PD_analysis_v4.json` file contains pairwise predictions between individual proteins
- For complexes, you MUST use the `AF3_bait_prey_analysis_v4.json` file which contains complex-prey interactions

⚠️ **CRITICAL: Protein Variant Uploads**
- **ALWAYS specify a custom variant name** when uploading non-full-length constructs
- **DO NOT** upload different variants without naming them - they will overwrite each other!
- **Examples of good variant names**:
  - `"Cterm_141-107aa"` - C-terminal construct with residue counts
  - `"Nterm_1-150aa"` - N-terminal construct with residue range
  - `"Middle_200-400aa"` - Middle domain construct
  - `"TPR_domain"` - Specific domain construct
- **Variant names are preserved** throughout the import workflow
- See **COMPLEX_VARIANT_GUIDE.md** for detailed best practices

**Reference**: See **INCREMENTAL_IMPORT_WORKFLOW.md** for complete guide.

### Common Commands

```bash
npm run dev                                  # Local dev server
npm run build                                # Test production build
node db/check_db.mjs                         # Database status
node scripts/extract_interactors.mjs <name>  # Export interactors for analysis
```

### Experimental Validation Workflow

**Adding new validation data** (MS, Co-IP, Y2H, etc.):
```bash
# 1. Extract validation hits from Excel/data file
python3 << 'EOF'
import pandas as pd
df = pd.read_excel("path/to/data.xlsx", sheet_name="SheetName")
# Extract UniProt IDs into /tmp/validation_data.json format
EOF

# 2. Run validation script (modify template: db/add_ms_validation_simple.mjs)
export POSTGRES_URL="..."
node db/add_ms_validation_simple.mjs

# 3. Update with source file path if needed
node db/update_ms_validation_with_path.mjs
```

**Current validated interactions**: 17 (IFT121: 4, IFT122: 5, IFT43: 8)
**Data file**: `Esben IFTA.xlsx` in project root (IFT121/122/43 MS pulldown from Tina/Carsten)

## Documentation Index

### Import Guides
- **IMPORT_DECISION_TREE.md** - Choose correct import script
- **INCREMENTAL_IMPORT_WORKFLOW.md** - Standard import procedure (recommended)
- **COMPLEX_V4_IMPORT_GUIDE.md** - Complex imports with ipSAE scoring
- **COMPLEX_VARIANT_GUIDE.md** - Protein variant handling (⭐ CRITICAL)
- **IMPORT_DUPLICATE_PREVENTION.md** - Prevent v3/v4 duplicates

### Analysis & Management
- **FUNCTIONAL_ANALYSIS_GUIDE.md** - Pathway enrichment and GO term analysis
- **DATABASE_BACKUP_GUIDE.md** - Backup and restore procedures
- **V3_VS_V4_QUICK_REFERENCE.md** - Confidence scheme comparison

### Technical Reference
- **COMPLEX_SYSTEM_SUMMARY.md** - Complex import architecture
- **CONFIDENCE_MIGRATION_GUIDE.md** - Migrating confidence levels
- **SESSION_FIXES.md** - Historical fixes and solutions
- **DUPLICATE_ISSUE_NOTES.md** - Duplicate problem analysis & resolution (⭐ NEW)

## Recent Critical Changes

### Experimental Validation System (2025-10-30) ⭐ **DEPLOYED**
- **Feature**: Database column and UI for tracking experimental validation of AF predictions
- **Database**: Added `experimental_validation` JSONB column to `interactions` and `complex_interactions` tables
- **Schema**: Stores method, source, date, notes, source_file
- **UI**: New "Experimental" column in results table with green "✓ Yes" badge
- **Tooltip**: Hover shows validation details (method, source, date, notes, data file path)
- **Current Data**: 17 AF3 predictions validated by MS pulldown (IFT121/122/43)
  - Source: Tina/Carsten skeletal ciliopathy project
  - Method: PD_MS
  - File: `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/MS_PD_data_Tina_Carsten_IFT43_121_122.xlsx`
  - Excel sheets: IFT121 (105 hits), IFT122 (182 hits), IFT43 (119 hits)
- **Validation Rates**: IFT121 10.3%, IFT122 18.5%, IFT43 5.6% overlap with AF3
- **Key Findings**:
  - Core IFT-A interactions validated (IFT121↔IFT122, IFT121↔IFT43)
  - Hedgehog pathway proteins detected: TULP3 (IFT121, IFT43), GLI3 (IFT122)
  - TULP3↔IFT43 interaction validated by both AF3 and MS
- **Scripts**:
  - `db/add_ms_validation_simple.mjs` - Add validation data (reusable for Co-IP, Y2H, etc.)
  - `db/update_ms_validation_with_path.mjs` - Update with source file paths
  - `compare_ms_af3.js` - Compare AF3 predictions with MS hits
- **Impact**: Users can see which AF predictions have experimental support

### Complex Variant Support & Mode Auto-Detection (2025-10-30) ⭐ **DEPLOYED**
- **Enhancement**: Automatic variant detection for complex imports (FL/Cterm/Nterm)
- **Features**:
  - Parses variant from directory path (e.g., `Hs_Cter_IFT52_46` → Cterm variant)
  - Creates separate complex entries: `IFT46 & IFT52` (FL) and `IFT46 & IFT52 (Cterm)`
  - Auto-detects v3 vs v4 data availability and switches mode accordingly
  - Prevents showing empty results when complex only has v4 (ipSAE) data
- **Implementation**:
  - `db/import_complex_af3_v4.mjs` - Added `extractVariant()` function
  - `db/import_complex_af3_json.mjs` - Added variant support to v3 imports
  - `app/page.tsx` - Added mode auto-detection in `handleComplexChange()`
- **Variant Detection Patterns**:
  - `Hs_Cter_*` or `*_Cter_*` → Cterm
  - `Hs_Nter_*` or `*_Nter_*` → Nterm
  - `*_FL_*` or default → FL (full-length)
- **Impact**: Users can distinguish between protein variants and mode automatically switches to show available data
- **Important**: Use `AF3_bait_prey_analysis_v4.json` (AB:C complex-prey format) for complexes
- **Common Mistake**: Using `AF3_PD_analysis_v4.json` (pairwise A-B format) will import wrong data! See warning in Quick Start section.

### Organism Indicators in Bait Dropdown (2025-10-24) ⭐ **DEPLOYED**
- **Enhancement**: Bait protein dropdown now displays organism codes for easy identification
- **Format**: `{organism_code}:{gene_name} ({uniprot_id}) - {count} interactions`
- **Examples**:
  - "Hs:WDR19 (Q8NEZ3) - 45 interactions" (Human)
  - "Cr:IFT122 (CRE01_G065822_T1_1) - 23 interactions" (Chlamydomonas)
- **Implementation**:
  - Updated `/api/baits` endpoint to include `organism` and `organism_code` fields
  - Modified frontend dropdown display in `app/page.tsx`
  - Proteins without organism codes display normally (no prefix)
- **Impact**: Easier to distinguish proteins from different organisms when selecting baits

### Duplicate Prevention & Database Cleanup (2025-10-23) ⭐ **CRITICAL FIX**
- **Problem**: Importing both v3 and v4 JSON files created 855 duplicate interactions
- **Root cause**: Unique constraint included `source_path`, different filenames allowed duplicates
- **Fixed**: Updated `db/import_af3_json.mjs` with proper duplicate detection
  - Now checks for existing interaction by (bait, prey, iPTM, contacts)
  - Updates existing entries instead of creating duplicates
  - Shows "UPDATED" vs "NEW" in logs
- **Cleanup**: Ran global deduplication (3,428 → 2,573 interactions)
  - Removed 855 v3 duplicates, kept all v4 entries with ipSAE data
  - Database verified clean (zero duplicates remain)
- **Impact**: Can now safely import v3 and v4 files without creating duplicates
- **Tools created**:
  - `db/deduplicate_single_protein.mjs` - Per-protein cleanup
  - `db/deduplicate_all_proteins.mjs` - Global cleanup (already executed)
  - `db/verify_real_duplicates.mjs` - Verification tool
- See **IMPORT_DUPLICATE_PREVENTION.md** and **DUPLICATE_ISSUE_NOTES.md** for details

### Mode Switching Fixes (2025-10-23) ⭐ **DEPLOYED**
- **Fixed dropdown counts** - Now show accurate counts for v3/v4 modes
- **Removed double filtering** - v3 mode uses client-side filtering only
- **Optimized re-fetches** - Separate useEffects for v3/v4 filters
- **Impact**: Dropdown counts update immediately when switching modes
- See **MODE_SWITCHING_FIXES.md** for details

### Complex Source Paths (2025-10-23) ⭐ **DEPLOYED**
- **Fixed relative paths** - Now show full absolute paths
- **Updated import scripts** - v3 & v4 now store full paths
- **Migrated existing data** - All 108 complex interactions updated
- **Impact**: Easy to trace back to original AlphaFold prediction files
- Example: `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q96LB3_Q8WYA0_IFT74_81/AF3/...`

### v4 Complex Import (2025-10-23)
- Added **ipSAE scoring** for protein complexes (better than iPTM for multi-protein baits)
- Scripts: `import_complex_af3_v4.mjs`, `import_complex_v4.sh`
- UPSERT logic: Updates existing v3 interactions with v4 ipSAE data
- Same confidence tiers: High (>0.7), Medium (0.5-0.7), Low (0.3-0.5)

### Confidence Classification (2025-10-08)
- **Interface quality-centric** scoring (iPTM + contacts + ipLDDT)
- Frontend calculates dynamically, ignores original JSON labels
- High: iPTM ≥0.7 OR (contacts ≥40 AND ipLDDT ≥80) OR (contacts ≥30 AND iPTM ≥0.5 AND ipLDDT ≥80)
- Medium: iPTM ≥0.6 OR (contacts ≥20 AND ipLDDT ≥75) OR (contacts ≥15 AND iPTM ≥0.45)
- Low: Everything else
- **Impact**: ~37 strong interfaces promoted from Low → High

### Network Visualization (2025-10-10)
- Smart organism detection (removes redundant prefixes when >70% same organism)
- Organism badge display (e.g., "[Hs]" for human networks)
- Long name shortening (15 char limit)
- Cross-organism highlighting preserved

## Architecture

### Data Flow
```
AlphaFold Predictions
    ↓
[Import Scripts] → Filter by confidence, extract metrics
    ↓
PostgreSQL (Neon) → proteins, interactions, complex_interactions, protein_aliases
    ↓
[Organism Assignment] → UniProt API lookup
    ↓
[Alias Fetching] → UniProt API for gene names
    ↓
Next.js API Routes → Enhanced search (LEFT JOIN aliases)
    ↓
React Frontend → Force-directed graph + data table
```

### Key Components

**Frontend** (`app/`):
- `page.tsx` - Main UI with search, network graph, data table
- `api/interactions/[id]/route.ts` - Search endpoint (supports UniProt ID, gene name, aliases, organism prefix)
- `api/debug/route.ts` - Database diagnostics

**Database** (`db/`):
- `import_af3_json.mjs` - Single bait imports (skips "Very Low" confidence)
- `import_complex_af3_v4.mjs` - Complex bait imports with ipSAE
- `incremental_organism_lookup.mjs` - Assign organisms (incremental, safe)
- `fetch_aliases.mjs` - UniProt API for aliases
- `chlamyfp_gene_lookup.mjs` - ChlamyFP gene names for Chlamydomonas

**Scripts** (`scripts/`):
- `extract_interactors.mjs` - Export CSV + UniProt list for pathway analysis
- `backup_database_node.mjs` - Database backup

### Database Schema

```sql
-- Core tables
CREATE TABLE proteins (id, uniprot_id, gene_name, organism);
CREATE TABLE interactions (
  bait_protein_id, prey_protein_id, iptm, ipae_contacts, iplddt, confidence, alphafold_version,
  experimental_validation JSONB  -- Added 2025-10-30: stores validation metadata
);
CREATE TABLE complex_interactions (
  complex_bait_id, prey_protein_id, ipsae, confidence_v4, alphafold_version,
  experimental_validation JSONB  -- Added 2025-10-30: stores validation metadata
);
CREATE TABLE protein_aliases (protein_id, alias_name, alias_type, source);

-- experimental_validation format:
-- {
--   "validated": true,
--   "method": "PD_MS",
--   "source": "Lab/Researcher",
--   "date": "YYYY-MM-DD",
--   "notes": "Description",
--   "source_file": "/path/to/data.xlsx"
-- }
```

## Critical Implementation Details

### Protein Link Routing (DO NOT CHANGE)

**Rule**: Route by ID format, NOT organism code.

```typescript
// ✅ CORRECT
if (cleanId.startsWith('Cre') || cleanId.startsWith('cre') || cleanId.startsWith('CRE')) {
  return `https://chlamyfp.org/ChlamyFPv2/cr_info_sql.php?id=${encodeURIComponent(cleanId)}`;
}
return `https://www.uniprot.org/uniprotkb/${cleanId}`;
```

**Why**: `Cr:H9CTG6` has organism code `Cr` but routes to UniProt (H9CTG6 is UniProt ID). Only CRE gene IDs (e.g., `CRE11_G475000_T1_1`) route to ChlamyFP.

### Import Behavior

**AF3 Import** (`import_af3_json.mjs`):
- ✅ Imports: Very High, Worth Investigating, Low iPTM - Proceed with Caution
- ❌ Skips: Very Low (prevents database contamination)
- Frontend recalculates confidence dynamically (ignores stored JSON labels)

**AF2 Import** (`batch_import_af2_json.mjs`):
- Imports Medium+ confidence
- **MUST set confidence to NULL** after import for proper display
- Use full source paths (not generic `/emcc/au14762/AF`)

### ChlamyFP Gene Lookup

**Multi-tier homolog detection**:
1. Primary: ChlamyFP gene name (field [1] or [2])
2. Secondary: Human homolog (field [6], e.g., "PLEKHA8")
3. Tertiary: E-value homolog (field [8], threshold < 1e-2, e.g., "Hs: 5E-03 (NABP2)")

**ID normalization**: Handles trailing dots, version numbers, uppercase format.

## Search Features

**Supported search types**:
1. UniProt ID: `Q8NEZ3`
2. Gene name: `WDR19`, `BBS7` (partial match)
3. Organism prefix: `Hs:BBS7`, `Cr:IFT122`
4. Alias: `IFT144` (5,110+ aliases)
5. IFT number: `27` finds IFT27
6. AF2 custom names: `CCNO`, `81CH`
7. Source path: Partial file path matches

**Organism prefix search**: Pattern `([A-Z][a-z]):(.+)` filters results to organism code.

## Confidence Levels

### AF3 Dynamic Classification

**High** (Green):
- iPTM ≥0.7 OR
- contacts ≥40 AND ipLDDT ≥80 OR
- contacts ≥30 AND iPTM ≥0.5 AND ipLDDT ≥80
- Excludes: iPTM <0.75 AND contacts <5

**Medium** (Orange):
- iPTM ≥0.6 OR
- contacts ≥20 AND ipLDDT ≥75 OR
- contacts ≥15 AND iPTM ≥0.45

**Low** (Red): Everything else

**AF2** (Gray): Displayed last, ranked by iPTM only (no contacts/ipLDDT)

### v4 Complex (ipSAE)

- **High**: ipSAE >0.7
- **Medium**: ipSAE 0.5-0.7
- **Low**: ipSAE 0.3-0.5

**Why ipSAE**: Multi-protein complexes naturally have lower iPTM despite excellent interfaces. ipSAE correctly identifies quality.

## Result Sorting

1. AlphaFold version (AF3 first, AF2 last)
2. Confidence tier (High → Medium → Low → AF2)
3. iPAE contacts (descending)
4. iPTM score (descending)

## Deployment

- **Changes**: Database updates are immediate (no deployment)
- **Cache**: Hard refresh browser (Ctrl+Shift+R) after DB changes
- **Frontend**: Code changes require `git push` to Vercel
- **Env**: Ensure `POSTGRES_URL` set in Vercel

## Organism Assignment

### Workflow

**Incremental** (recommended):
```bash
node db/incremental_organism_lookup.mjs  # Only processes Unknown proteins
```

**Full rebuild** (destructive):
```bash
node db/organism_agnostic_lookup.mjs     # Resets ALL organisms
```

### Logic Hierarchy

1. **Pattern matching** (automatic):
   - `AF2_Cre%`, `Cre%`, `Cre.%` → Chlamydomonas
   - `source_path LIKE '%Lotte_Pedersen%'` → Human
2. **UniProt API** (for valid IDs): Maps scientific name → organism code
3. **Unknown** (fallback): Non-standard names, failed lookups

### Organism Codes

Auto-generated from UniProt scientific names:
- **Hs**: Homo sapiens (Human)
- **Cr**: Chlamydomonas reinhardtii
- **Mm**: Mus musculus (Mouse)
- **Dm**: Drosophila melanogaster
- **Sc**: Saccharomyces cerevisiae
- **[Code]**: Any organism (first letter genus + species)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank organism codes | `node db/incremental_organism_lookup.mjs` |
| Proteins show "null" | Run gene name population (Step 4 in workflow) |
| Missing iPAE/ipLDDT | New: Use `import_af3_json.mjs`; Existing: `backfill_structural_metrics.mjs` |
| No search results | Check confidence filters in UI |
| Wrong import script | See **IMPORT_DECISION_TREE.md** |
| Complex confidence mismatch | Run **both** migration scripts (single + complex) |

## Performance Notes

- **UniProt API**: Rate limited to 1/second
- **Incremental workflow**: ~2-5 min (vs 10-15 min full rebuild)
- **Database indexes**: Optimized for search (uniprot_id, gene_name, aliases)
- **Alias caching**: Pre-fetched, no repeated API calls

## Key Dependencies

**Production**:
- Next.js 14.2.33, React 18
- react-force-graph-2d 1.25.5 (network visualization)
- @vercel/postgres 0.9.0 (Neon client)
- Bootstrap 5.3.3, react-bootstrap 2.10.3

**External APIs**:
- UniProt REST API (aliases, organism lookup)
- ChlamyFP (Chlamydomonas gene names)

## Testing

Manual testing only:
- `node db/check_db.mjs` - Database validation
- Web searches for known proteins
- Compare against original AF3 JSON files

## Important Architectural Decisions

1. **Incremental by default**: All imports preserve existing data
2. **Quality filtering**: Auto-skip "Very Low" confidence
3. **Dynamic confidence**: Frontend calculates from metrics (ignores JSON labels)
4. **Organism flexibility**: Auto-discovers any organism from UniProt
5. **Source provenance**: `source_path` enables data tracing
6. **Normalized schema**: Separate tables for proteins, interactions, aliases, complexes

---

**For detailed workflows, migration procedures, and historical context, see the documentation files listed in "Documentation Index" above.**
