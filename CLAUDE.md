# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IFT Interactors Website**: Companion website for IFT/BBSome protein interaction paper
- **Purpose**: Display comprehensive IFT/BBSome interaction dataset (paper shows top hits only)
- **Stack**: Next.js 14, PostgreSQL (Neon), Vercel deployment
- **Data Source**: Original AlphaPulldown v4.json files (direct from AF3 predictions)
- **Focus**: Human IFT and BBSome proteins (single protein baits only)

## ⚠️ CRITICAL: Git & Deployment Workflow

This is a **STANDALONE PROJECT** with its own GitHub repository and database.

### Git Repository
- **Repository**: `https://github.com/essebesse/IFT_interactors.git`
- **Remote name**: `origin`
- **Parent directory**: Lives in `Global_Analysis/IFT_Interactors_paper/` but is independent

### Database
- **Neon Database**: `postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb`
- **Status**: ✅ Populated (512 interactions, 371 proteins from 31 baits)
- **Import Script**: `import_from_v4_originals_INCREMENTAL.mjs` (incremental - skips existing baits)
- **Last Database Rebuild**: 2025-11-01 (from original AlphaPulldown v4.json files)
- **Last Frontend Update**: 2025-11-06 (UI clarity improvements, PAE terminology)
- **Experimental Validation**: 🔄 Phase 1 in progress (Boldt complete, Gupta importing)
  - Boldt: ~25 validations, Gupta: ~50 expected, Dual: ~12 expected
  - Phase 2: +4 proteins (IFT172, BBS9, BBS18, RABL2) pending AF3 jobs
  - Phase 3: Re-run validations after Phase 2 (+10-15 more validations)

### Deployment
- **Platform**: Vercel
- **Project URL**: https://vercel.com/essebesse/ift-interactors
- **Environment Variable**: `POSTGRES_URL` must be set in Vercel dashboard
- **Build Fix**: All API routes marked as `force-dynamic` to prevent build-time DB access

#### Automatic Deployment (PRIMARY METHOD)
- **Status**: ✅ Working reliably
- **Trigger**: GitHub webhook automatically deploys when you push to `main` branch
- **Build time**: ~45-60 seconds
- **No manual action needed** - just push your code!

**Verify deployment:**
1. Check Vercel dashboard for new deployment
2. Verify it's building the correct commit (should match `git ls-remote origin main`)
3. Build should complete in ~1 minute

#### Manual Deployment (BACKUP ONLY - rarely needed)
Only use if GitHub webhook fails (Vercel doesn't start building after push):

```bash
# Emergency: Trigger deployment via deploy hook
curl -X POST 'https://api.vercel.com/v1/integrations/deploy/prj_9aWAK9J4plPAWZpOk3uiNCHzMM3t/Z7xGv44ebi'
```

Or use Vercel dashboard: Deployments → "..." → "Redeploy"

**⚠️ Note**: Using the deploy hook creates a second build (GitHub webhook + manual trigger). Only use when automatic deployment fails.

### Git Operations

✅ **SIMPLIFIED**: This project is now fully independent! Direct pushes work from the IFT subdirectory.

**Standard Workflow (RECOMMENDED)**
```bash
# Work directly in the IFT project directory
cd /emcc/au14762/elo_lab/SCRIPTS/Global_Analysis/IFT_Interactors_paper

# Make changes, commit, and push
git add [files]
git commit -m "Your message"
git push origin main  # ← Works! GitHub token configured
```

**Authentication Setup:**
- GitHub personal access token is configured in the remote URL
- No SSH keys needed
- Token works for all your GitHub repositories

**Important Notes:**
- ✅ This project is in the parent directory's `.gitignore`
- ✅ Changes here do NOT affect the main Cilia project
- ✅ Each project deploys independently
- ✅ No more complex subtree workflows needed!
- ❌ DO NOT push from parent directory - it will fail
- ❌ DO NOT use `git subtree` commands - no longer necessary

### Complete Workflow: Edit → Commit → Push → Auto-Deploy

```bash
# 1. Make changes in IFT_Interactors_paper
cd /emcc/au14762/elo_lab/SCRIPTS/Global_Analysis/IFT_Interactors_paper
# ... edit files ...

# 2. Commit and push
git add [files]
git commit -m "Your message"
git push origin main

# 3. Verify push succeeded
git ls-remote origin main  # Should show your latest commit hash

# 4. Monitor deployment (automatic via GitHub webhook)
# Visit: https://vercel.com/essebesse/ift-interactors
# Check: Deployment is building correct commit from step 3
# Build completes in ~1 minute
```

**Common Issues:**
- If `git push` fails with "Permission denied" → GitHub token may have expired; update remote URL with new token
- If Vercel doesn't start building → Use manual deployment (see "Manual Deployment" section above)
- If build fails with missing files → Files weren't committed; check `git status`

## Dataset Overview

### Data Statistics (as of 2025-11-03)
- **Total Interactions**: 512 (all unique, duplicates removed)
- **Unique Proteins**: 371 (all human Homo sapiens)
- **Unique Baits**: 33 (22 IFT + 10 BBSome + 1 IFT-associated: TULP3)
- **Analysis Version**: v4 only (ipSAE scoring)
- **AlphaFold Version**: AF3 only
- **Confidence Distribution**: Based on ipSAE scores
  - High (ipSAE >0.7): Green badges
  - Medium (ipSAE 0.5-0.7): Orange badges
  - Low (ipSAE <0.5): Red badges

### Bait Protein Coverage
- **IFT Proteins (22)**:
  - IFT20, IFT22, IFT25, IFT27, IFT38, IFT43, IFT46, IFT52, IFT54, IFT56, IFT57
  - IFT70 (TTC30A), IFT70 (TTC30B), IFT74, IFT80, IFT81, IFT88
  - IFT121, IFT122, IFT139, IFT140, IFT144
- **BBSome Proteins (10)**:
  - BBS1, BBS2, BBS3 (ARL6), BBS4, BBS5, BBS7, BBS8, BBS10, BBS12, BBS17 (LZTL1)
- **IFT-Associated Proteins (1)**:
  - TULP3 (Tubby-related protein 3 / RP26) - 73 interactions

### Notable Interactions (Top 5 by ipSAE)
1. IFT46 ↔ IFT56: ipSAE=0.828 (High)
2. BBS8 ↔ A8MTZ0: ipSAE=0.771 (High)
3. BBS7 ↔ BBS2: ipSAE=0.759 (High)
4. BBS2 ↔ BBS7: ipSAE=0.758 (High)

### Experimental Validation (Phase 1 - Completed)

**Status**: Integrating experimental proteomics data to validate AF3 predictions

**Current Phase**: Phase 1 - Initial validation with 31 baits ✅ COMPLETED
- ✅ **Boldt et al., 2016** (SF-TAP-MS direct interactions) - Completed (~25 validations, 5%)
- ❌ **Gupta et al., 2015** (BioID proximity labeling) - Completed (0 validations)
  - **Why 0 matches**: Non-overlapping protein sets
  - Gupta uses centrosome/transition zone baits (TCTN1-3, MKS1, NPHP1-4, CEP proteins)
  - Our database: IFT/BBSome baits only
  - Gupta has IFT proteins but only as **prey** (pulled down by centrosome baits)
  - Our AF3: IFT proteins as **baits** (predicting IFT↔IFT/BBSome interactions)
  - **Conclusion**: Different biological question - no overlap expected
- ✅ **Sang et al., 2011** (LAP method, 9 NPHP-JBTS-MKS baits) - Completed (3 validations, 0.6%)
  - **Result**: 3 validations - Low AF3 confidence, rescued by strong MS data
  - Validations:
    1. TULP3 ↔ B9D1 (ipSAE 0.45, MKS1 bait, 18 spectra, 310k TIC)
    2. IFT74 ↔ TCTN2 (ipSAE 0.34, MKS1 bait, 28 spectra, 180k TIC)
    3. IFT70B ↔ CEP97 (ipSAE 0.42, NPHP6 bait, 18 spectra, 990k TIC)
  - **Conclusion**: Transition zone proteins interact with IFT machinery, even when AF3 scores low

**Upcoming Phases**:
- **Phase 2**: Add 4 new proteins (IFT172, BBS9, BBS18, RABL2) → 35 baits
- **Phase 3**: Re-run validations to capture NEW interactions
- **Next dataset**: Consider additional datasets (Mick et al., 2015 APEX or others)

**Key Features**:
- **Idempotent imports**: Scripts check for existing validations by PMID (safe to re-run)
- **No duplicates**: Automatic duplicate prevention when re-running after Phase 2
- **Current results**:
  - Phase 1 (31 baits): ~28 validated (5.5% total: Boldt 25, Gupta 0, Sang 3)
  - Phase 3 (35 baits): ~33-38 validated (5.5-6.3% - expecting +5-10 from new proteins)

**Import Commands**:
```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# Import Boldt (TAP-MS direct interactions)
node scripts/import_experimental_data.mjs boldt2016

# Import Gupta (BioID proximity ~10nm)
node scripts/import_experimental_data.mjs gupta2015

# Import Sang (LAP method)
node scripts/import_experimental_data.mjs sang2011
```

**Documentation**:
- `EXPERIMENTAL_VALIDATION_WORKFLOW.md` - Complete phased approach (3 phases)
- `TODO_GUPTA_DATASET.md` - Gupta BioID import guide
- `BOLDT_DATASET_CRITERIA.txt` - Boldt TAP-MS selection criteria (FDR ≤ 0.1)
- `GUPTA_DATASET_CRITERIA.txt` - Gupta BioID selection criteria (SAINT ≥ 0.8)
- `TODO_ADD_NEW_PROTEINS.md` - Includes Step 6: Re-run validations after Phase 2

**Datasets Available**:
1. ✅ Boldt et al., 2016 (SF-TAP-MS, 217 baits) - High confidence - 25 validations
2. ❌ Gupta et al., 2015 (BioID, 56 baits) - Medium confidence - 0 matches (non-overlapping protein sets)
3. ✅ **Sang et al., 2011** (LAP, 9 NPHP/MKS baits) - High confidence - 3 validations ⭐ "Rescued by MS"
4. ⏳ Mick et al., 2015 (APEX, primary cilia) - Medium confidence
5. ⏳ Kohli et al., 2017 (APEX, ciliary membrane) - Medium confidence
6. ⏳ May et al., 2021 (APEX2, Hedgehog signaling, PRIDE) - Medium confidence
7. ⏳ Aslanyan et al., 2023 (BioID2-UBD, ubiquitinome, PRIDE) - Medium confidence

## Data Source Files

### Original AlphaPulldown v4.json Files (33 proteins)

**⚠️ IMPORTANT**: Database is populated DIRECTLY from these original v4.json files, NOT from any extracted/processed files.

**IFT Proteins (22 files)**:
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/A0AVF1_IFT56/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q13099_IFT88/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q7Z4L5_IFT139/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q86WT1_IFT70_isoform_TTC30A/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8IY31_IFT20/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8N4P2_IFT70_isoform_TTC30B/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8NEZ3_IFT144/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8TDR0_IFT54_MIPT3/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8WYA0_IFT81/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q96AJ1_IFT38_CLUA1/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q96FT9_IFT43/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q96LB3_IFT74/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q96RY7_IFT140/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9BW83_IFT27/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9H7X7_IFT22/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9HBG6_IFT122/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9NQC8_IFT46/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9NWB7_IFT57/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9P2H3_IFT80/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9P2L0_IFT121/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9Y366_IFT52/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9Y547_IFT25/AF3/AF3_PD_analysis_v4.json`

**BBSome Proteins (10 files)**:
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q6ZW61_BBS12/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8IWZ6_BBS7/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8N3I7_BBS5/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8NFJ9_BBS1/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8TAM1_BBS10/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q8TAM2_BBS8/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q96RK4_BBS4/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9BXC9_BBS2/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9H0F7_BBS3_ARL6/AF3/AF3_PD_analysis_v4.json`
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9NQ48_BBS17/AF3/AF3_PD_analysis_v4.json`

**IFT-Associated Proteins (1 file)**:
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/O75386_Tulp3/AF3/AF3_PD_analysis_v4.json` (TULP3 / RP26)

**Excluded Files (Protein Complexes - NOT imported)**:
- ❌ `Q96LB3_Q8WYA0_IFT74_81` - IFT74+IFT81 complex
- ❌ `IFT52_46` - IFT52+IFT46 complex
- ❌ `Hs_Cter_IFT52_46` - C-terminal variant of IFT52+IFT46 complex

### Import Scripts

**⚠️ IMPORTANT: Use incremental script to avoid duplicates!**

- **import_from_v4_originals_INCREMENTAL.mjs** - ✅ **USE THIS** for adding new proteins (prevents duplicates)
  - Checks database for existing baits before importing
  - Only imports NEW data, skips baits already in database
  - Safe to run multiple times

- **import_from_v4_originals_FIXED.mjs** - ⚠️ Full import (re-imports ALL 33 files, causes duplicates!)
  - Only use for initial database population or after `drop_tables.mjs`
  - Running this on existing database WILL create duplicates

- **deduplicate_interactions.mjs** - Removes duplicate interactions (keeps first occurrence)
  - Use if duplicates accidentally created

- **drop_tables.mjs** - Wipes database clean (drops all tables)
  - ⚠️ DESTRUCTIVE: Only use for complete rebuild

- **find_v4_json.sh** - Finds all IFT/BBS v4.json files in AF3_APD directory
- **fetch_gene_names.mjs** - Fetches gene names from UniProt API for proteins without gene_name

**Workflow for adding new proteins:**
```bash
# 1. Add new file path to import_from_v4_originals_INCREMENTAL.mjs
# 2. Run incremental import (only imports new data)
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"
node import_from_v4_originals_INCREMENTAL.mjs

# 3. Fetch gene names for new proteins
node fetch_gene_names.mjs
```

### Reference Lists
- **human_ift_proteins_complete.md** - Complete list of human IFT proteins with UniProt IDs
- **chlamydomonas_ift_proteins_complete.md** - Complete list of Chlamydomonas IFT proteins

## Database Schema

```sql
-- Proteins table
CREATE TABLE proteins (
  id SERIAL PRIMARY KEY,
  uniprot_id VARCHAR(255) UNIQUE NOT NULL,
  gene_name VARCHAR(255),
  organism VARCHAR(255),
  organism_code VARCHAR(10)
);

-- Protein aliases table
CREATE TABLE protein_aliases (
  id SERIAL PRIMARY KEY,
  protein_id INTEGER REFERENCES proteins(id) ON DELETE CASCADE,
  alias_name VARCHAR(255) NOT NULL,
  alias_type VARCHAR(50) NOT NULL
);

-- Interactions table
CREATE TABLE interactions (
  id SERIAL PRIMARY KEY,
  bait_protein_id INTEGER REFERENCES proteins(id) ON DELETE CASCADE,
  prey_protein_id INTEGER REFERENCES proteins(id) ON DELETE CASCADE,
  confidence VARCHAR(50),
  iptm REAL,
  interface_plddt REAL,
  contacts_pae_lt_3 INTEGER,
  contacts_pae_lt_6 INTEGER,
  ipsae REAL,
  ipsae_confidence VARCHAR(50),
  analysis_version VARCHAR(10),     -- 'v3' or 'v4'
  alphafold_version VARCHAR(10),    -- 'AF2' or 'AF3'
  source_path TEXT,
  experimental_validation JSONB     -- MS, Co-IP, Y2H data
);
```

## Database Management

### Check Database Status
```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

node -e "
const { sql } = require('@vercel/postgres');
(async () => {
  const proteinCount = await sql\`SELECT COUNT(*) FROM proteins\`;
  const interactionCount = await sql\`SELECT COUNT(*) FROM interactions\`;
  const v4Count = await sql\`SELECT COUNT(*) FROM interactions WHERE analysis_version = 'v4'\`;
  console.log('Proteins:', proteinCount.rows[0].count);
  console.log('Interactions:', interactionCount.rows[0].count);
  console.log('v4 Analysis:', v4Count.rows[0].count);
})();
"
```

### Re-populate Database (if needed)

**⚠️ IMPORTANT**: Always rebuild from original v4.json files, NOT from any extracted files.

```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Step 1: Drop all existing tables (wipe database)
node drop_tables.mjs

# Step 2: Import from original v4.json files
node import_from_v4_originals_FIXED.mjs
```

**What this does**:
1. Drops all tables (clean slate)
2. Reads 32 original `AF3_PD_analysis_v4.json` files from `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/`
3. Imports 877 interactions from 331 unique proteins (32 baits)
4. All data is v4 (ipSAE) from AF3 predictions

## Common Commands

```bash
npm run dev          # Local development server (http://localhost:3000)
npm run build        # Test production build
npm start            # Run production build locally
```

### Type Checking and Linting
```bash
npx tsc --noEmit     # TypeScript type checking (no build output)
npm run lint         # ESLint checking
```

### Database Quick Checks
```bash
# Quick protein count
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
node -e "const { sql } = require('@vercel/postgres'); sql\`SELECT COUNT(*) FROM proteins\`.then(r => console.log('Proteins:', r.rows[0].count));"
```

## API Routes

All routes are marked as `force-dynamic` to prevent build-time database access:

- `/api/baits` - List all bait proteins with interaction counts
- `/api/complexes` - List protein complexes (not used in this project)
- `/api/interactions/[id]` - Get interactions for a specific protein
- `/api/complex-interactions/[id]` - Get complex interactions (not used)
- `/api/debug` - Database diagnostics

## Website Features

### Search Capabilities
- Search by UniProt ID (e.g., `Q8NEZ3`)
- Search by gene name (e.g., `WDR19`, `BBS7`)
- Search by organism prefix (e.g., `Hs:BBS7`)
- Partial matching supported

### Filtering
- **Confidence levels**: High (ipSAE >0.7), Medium (ipSAE 0.5-0.7), Low (ipSAE <0.5)
- All data is v4 (ipSAE) analysis from AF3 predictions
- **Confidence scoring note** (added 2025-11-05): Sidebar includes explanation that flexible structures (e.g., IFT74-IFT81 coiled-coils) may show low iPTM/ipSAE but have high-quality interfaces (100+ iPAE contacts <3Å)

### Visualization
- Interactive force-directed network graph
- Color-coded by confidence level
- Edge thickness by confidence score
- Click nodes to explore secondary interactions

### 3D Structure Viewer (2025-11-04, Updated 2025-11-05)
**Status**: ✅ Deployed with Molstar integration

**Features**:
- **View 3D structures**: Click "View 3D" button in interaction results table
- **Fast loading**: CIF files served from Vercel Blob storage (500 structures)
- **Chain visualization**: Default Molstar chain coloring (distinct colors per chain)
- **PAE highlighting**: Toggle to highlight interface residues by PAE confidence
- **Structure clearing**: Properly clears previous structure when loading new one
- **Fullscreen mode**: Click ⛶ button to open in new window (memory-optimized)

**PAE Interface Highlighting**:
- **Yellow**: Very high confidence (PAE <3Å)
- **Magenta**: High confidence (PAE 3-6Å)
- Legend shows specific PAE thresholds for clarity
- Toggle between normal chain colors and PAE mode

**Technical Implementation**:
- **Library**: Molstar (mol-plugin-ui)
- **Storage**: Vercel Blob (500 CIF files with UniProt-based naming)
- **PAE Data**: Local `public/contacts_data/` (172 JSON files)
- **Component**: `components/StructureViewer.tsx`
- **API Routes**:
  - `/api/structure/[id]` - Serves CIF files from Blob
  - `/api/structure/[id]/pae` - Serves PAE contact data
- **Manifest**: `cif_manifest.json` maps interaction IDs to filenames
- **Fullscreen Page**: `app/structure/[id]/page.tsx` - Standalone viewer with canvas size limits

**Blob Storage**:
- **URL Pattern**: `structures/{bait_uniprot}_and_{prey_uniprot}.cif`
- **Example**: `structures/a0avf1_and_q9nqc8.cif`
- **Total Files**: 500 CIF structures (one per interaction)
- **Base URL**: `https://rechesvudwvwhwta.public.blob.vercel-storage.com`

**Performance & Memory Optimization**:
- Structure loads in 2-3 seconds ✓
- PAE highlighting applies in <1 second ✓
- **Smart fullscreen sizing** (2025-11-05): Dynamically adapts to screen size while preventing memory issues
  - Uses 95% of viewport on most displays
  - Caps at 20M canvas pixels (~1-2 GB RAM) to prevent exhaustion
  - 5K displays get ~3000×1680 px (vs old 1920×1080 hardcoded limit)
  - Considers devicePixelRatio (retina displays)
- No more 30+ second hangs or system freezes ✓

**Recent Updates (2025-11-06)**:

1. **UI Clarity Improvements** (commit `2468876`) ⭐
   - Added colored dots (●) to confidence level checkboxes for visual consistency
     - Green dot for High (ipSAE >0.7)
     - Orange dot for Medium (ipSAE 0.5-0.7)
     - Red dot for Low (ipSAE <0.5)
   - Removed redundant confidence legend box from secondary network panel
   - Removed "Hs" organism label from network visualization (all proteins are human)
   - Result: Cleaner UI with better visual hierarchy

2. **PAE Terminology Update** (commit `cfda6f7`) ⭐
   - Changed PAE interface labels to avoid confusion with overall confidence levels
   - Old labels: "Very high confidence (PAE <3Å)", "High confidence (PAE 3-6Å)"
   - New labels: "High precision contacts (PAE <3Å)", "Moderate precision contacts (PAE 3-6Å)"
   - Clarifies distinction: ipSAE = global interaction confidence, PAE = local contact precision
   - Result: Clear separation between two different quality metrics

**Previous Updates (2025-11-05)**:

1. **Smart Fullscreen Sizing** (commit `257451c`) ⭐
   - Replaced hardcoded 1920×1080 limit with dynamic calculation
   - Detects screen size, viewport, and devicePixelRatio
   - Caps at 20M pixels (~1-2 GB RAM) to prevent memory exhaustion
   - Examples:
     - 5K @ DPR=1: 4864×2736 (14.7M pixels, no scaling)
     - 5K @ DPR=2: 2986×1680 (20M pixels, scaled down from 59M)
     - 4K @ DPR=1: Full 95% viewport (8.3M pixels)
     - Laptops/tablets: Full 95% viewport (always safe)
   - Result: Much larger on high-res displays, still memory-safe

2. **Fixed PAE Highlighting Reset** (commit `556d311`)
   - PAE toggle now properly resets when loading new structure
   - Prevents confusion where button shows "ON" but highlighting is gone

3. **Improved Sidebar Typography** (commits `46d59c9`, `74852a0`)
   - Base font: 1.05rem (up from ~0.875rem)
   - Section labels: 1.1rem with medium weight
   - Confidence checkboxes: 1.1rem
   - Alert note: 1.05rem with better line height
   - Result: More readable text, better use of sidebar space

4. **Added False Positive Disclaimer** (commit `50cac86`)
   - New paragraph in info alert box
   - Warns about false positives, especially in low-confidence predictions
   - Advises using predictions as hypotheses for experimental validation
   - Improves scientific transparency

5. **Network Visualization Fixes** (commits `1154c1e`, `e0a3266`)
   - **Tooltip improvements**: Removed redundant "AlphaFold: AF3", added ipSAE score
   - **Edge color consistency**: Now uses ipSAE-based confidence levels
     - High (green): ipSAE > 0.7
     - Medium (orange): ipSAE 0.5-0.7
     - Low (red): ipSAE < 0.5
   - Edge colors now match sidebar filters and table confidence levels
   - Replaced complex iPTM logic with simple ipSAE thresholds

6. **Text Corrections** (commit `74852a0`)
   - Changed "flexible domain orientations" → "flexible relative domain orientation"
   - More precise scientific terminology

**Scripts**:
- `scripts/upload_to_vercel_blob.mjs` - Upload CIF/PAE files to Blob
- `scripts/cleanup_old_blob_files.mjs` - Remove old numeric-named files
- `scripts/generate_cif_manifest.mjs` - Create manifest mapping
- `scripts/collect_cif_paths.py` - Find CIF files in AF3 output

### Data Export
- CSV export of interaction tables
- Network visualization screenshots

## Frontend Architecture

### Component Structure
- **app/page.tsx** - Main application page with search, filters, and results table
- **app/layout.tsx** - Root layout with metadata and global styles
- **components/NetworkVisualization.tsx** - Force-directed graph visualization using react-force-graph-2d
- **components/StructureViewer.tsx** - 3D structure viewer with Molstar integration (NEW)

### Key Frontend Features
- **Client-side filtering** - Results filtered by confidence and analysis version
- **Dynamic network graph** - Interactive D3-based visualization with node clicking
- **Responsive design** - Bootstrap-based responsive UI
- **State management** - React hooks for search, filters, and selected protein

### Styling
- Bootstrap 5.3.3 for base styles
- Custom CSS for confidence badges (High=green, Medium=orange, Low=red)
- react-bootstrap components for UI elements
- Molstar light theme (`molstar/lib/mol-plugin-ui/skin/light.scss`) for 3D viewer

### Key Dependencies
- **molstar** - Molecular visualization library for 3D structure viewer
- **sass** - Required for Molstar styles compilation
- **@vercel/blob** - Blob storage client for CIF file management
- **react-force-graph-2d** 1.25.5 - Network visualization
- **@vercel/postgres** 0.9.0 - Neon database client

## Publication Workflow

### Website Role
- **Website**: Shows ALL 877 v4 (ipSAE) interactions from original AlphaPulldown predictions
- **Paper**: Focuses on high-confidence hits (32 interactions, 3.6%)
- **Data source**: Direct from AF3 v4.json files (32 human IFT/BBSome baits)

### Citation
When published, website will be cited as:
- Supplementary online resource for IFT/BBSome interaction data
- Complete dataset companion to manuscript
- Interactive exploration tool for researchers
- All data v4 (ipSAE scoring) from AlphaFold3 predictions

## Troubleshooting

### Vercel Build Fails with "TypeError: Invalid URL"
**Issue**: Build fails during static page generation trying to connect to database
**Root Cause**: Next.js attempts to pre-render API routes at build time when `POSTGRES_URL` isn't available

**Solutions Applied**:
1. ✅ Added `export const dynamic = 'force-dynamic';` to all API routes
2. ✅ Added dynamic exports to `app/layout.tsx` (root level)
3. ✅ Configured `next.config.js` with `output: 'standalone'`
4. ✅ Replaced complex API routes with 404 stubs (no database imports)

**Status**: ✅ Fixed (commit 595983d)

### Git Push Doesn't Update GitHub
**Issue**: Commits made in IFT_Interactors_paper don't appear in GitHub repo
**Root Cause**: Nested git repositories + wrong file paths in commits

**Solution**: Use `git subtree split` from parent directory (see Git Operations section)

**Symptoms**:
- Local files are correct but Vercel builds old code
- `git diff origin/main` shows differences that should have been pushed
- Files committed with prefix like `IFT_Interactors_paper/app/...` instead of `app/...`

**Fix**:
```bash
cd /emcc/au14762/elo_lab/SCRIPTS/Global_Analysis
git subtree split --prefix=IFT_Interactors_paper -b ift-temp-branch
git push new_repo ift-temp-branch:main --force
git branch -D ift-temp-branch
```

### Database Connection Issues
**Issue**: API routes return 500 errors
**Solution**: Verify `POSTGRES_URL` environment variable is set in Vercel dashboard
**Check**: Visit `/api/debug` endpoint to test connection

### Wrong Database Connection String
**Issue**: Accidentally using main Cilia project database URL instead of IFT database
**Symptom**: Wrong data appears, or unexpected proteins in results
**Solution**:
1. Check Vercel environment variable is set to IFT database:
   - **Correct (IFT)**: `postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb`
   - **Wrong (Main Cilia)**: `postgresql://neondb_owner:npg_q2HCPRojzJ0i@ep-falling-shadow-agzy57k0-pooler.c-2.eu-central-1.aws.neon.tech/neondb`
2. Verify in Vercel: Project Settings → Environment Variables → `POSTGRES_URL`
3. Redeploy after fixing

### Empty Results
**Issue**: Search returns no data
**Solution**:
1. Verify database is populated: Check `/api/debug`
2. Try searching for known proteins (e.g., `Q8NEZ3`, `WDR19`)
3. Check confidence filters are enabled

### Complex API Routes Still Appear in Errors
**Issue**: Vercel build mentions `/api/complexes` even though it should be deleted
**Root Cause**: Git subtree push issue - old code still in GitHub
**Solution**: Complex routes replaced with 404 stubs (no DB connection)
**Status**: ✅ Fixed - routes exist but return 404 without database access

### Vercel Builds Old Commit (Webhook Issue)
**Issue**: After pushing to GitHub, Vercel builds an old commit instead of latest
**Root Cause**: GitHub webhook to Vercel fails or gets stuck

**Symptoms**:
- `git ls-remote new_repo main` shows latest commit (e.g., `11861ca`)
- Vercel dashboard shows building older commit (e.g., `595983d`)
- Build log "Source: main 595983d..." doesn't match latest

**Solutions**:

1. **Manual deployment (immediate fix)**:
   ```bash
   curl -X POST 'https://api.vercel.com/v1/integrations/deploy/prj_9aWAK9J4plPAWZpOk3uiNCHzMM3t/Z7xGv44ebi'
   ```

2. **Fix webhook (permanent fix)**:
   - Vercel Dashboard → Project Settings → Git
   - Check "Production Branch" is `main`
   - Go to GitHub → Settings → Webhooks
   - Find Vercel webhook, check "Recent Deliveries" for failures
   - If broken: Disconnect and reconnect repository in Vercel

3. **Verify deployment is using correct commit**:
   ```bash
   # Check what's on GitHub
   git ls-remote new_repo main
   # Then verify Vercel dashboard shows same commit hash
   ```

**Status**: ✅ Deploy hook created as backup for automatic deployments

### Build Fails: Missing NetworkVisualization Component
**Issue**: `Cannot find module '../components/NetworkVisualization'`
**Root Cause**: Component file wasn't pushed to GitHub (nested repo issue)
**Solution**: Use complete workflow including verification step (see "Complete Workflow" section)
**Status**: ✅ Fixed - all files now pushed correctly using subtree method

## Important Notes

- ✅ Database populated from **original AlphaPulldown v4.json files** (NOT extracted files)
- ✅ All API routes configured for runtime-only execution
- ✅ Independent from main Cilia project
- ⚠️ Do not modify the main Cilia database connection string
- ⚠️ This project uses a separate Neon database instance
- ⚠️ Only import from original v4.json files in `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/`

## Related Documentation

### Core Project Files
- **human_ift_proteins_complete.md** - Human IFT protein reference
- **chlamydomonas_ift_proteins_complete.md** - Chlamydomonas IFT protein reference
- **import_from_v4_originals_INCREMENTAL.mjs** - Incremental import (skips existing baits)
- **import_from_v4_originals_FIXED.mjs** - Full import (re-imports all)
- **drop_tables.mjs** - Database reset script
- **find_v4_json.sh** - Finds all v4.json source files
- **CURRENT_BAIT_PROTEINS.md** - Complete bait protein list with status

### Experimental Validation Files
- **EXPERIMENTAL_VALIDATION_WORKFLOW.md** - Phased validation strategy (3 phases)
- **TODO_ADD_NEW_PROTEINS.md** - Guide for adding IFT172, BBS9, BBS18, RABL2
- **TODO_GUPTA_DATASET.md** - Gupta BioID import guide
- **BOLDT_DATASET_CRITERIA.txt** - Boldt TAP-MS selection criteria
- **GUPTA_DATASET_CRITERIA.txt** - Gupta BioID selection criteria
- **scripts/import_experimental_data.mjs** - Universal experimental data importer
- **scripts/map_protein_ids.mjs** - UniProt ID mapping with caching
- **experimental_data/** - Directory with datasets and mapping cache

---

**Project Status**: ✅ Deployed and operational
**Last Updated**: 2025-11-07
**Database Status**: ✅ Populated (512 interactions, 371 proteins, 31 baits)
**Data Source**: Original AlphaPulldown v4.json files (v4 ipSAE scoring, AF3 only)
**Deployment**: Vercel (triggered by git push to main - automatic via GitHub webhook)
**Experimental Validation**: ✅ **Phase 1 COMPLETED** (Boldt: 25, Gupta: 0, Sang: 3 = 28 total validations)

**Summary of 2025-11-07 Updates**:
- ✅ Created EXPERIMENTAL_VALIDATION_WORKFLOW.md (phased validation strategy)
- ✅ **Phase 1 validation completed** (31 baits):
  - Boldt et al., 2016 (SF-TAP-MS): 25 validations (5%)
  - Gupta et al., 2015 (BioID): 0 validations (non-overlapping protein sets)
  - Sang et al., 2011 (LAP): 3 validations (0.6%) - Low AF3, rescued by strong MS
  - **Total**: 28 validations (5.5% of 512 interactions)
- ✅ Added Gupta et al., 2015 (BioID) dataset integration
  - Complete documentation: GUPTA_DATASET_CRITERIA.txt
  - Step-by-step guide: TODO_GUPTA_DATASET.md
  - Parser implemented: parseGupta2015() with SAINT ≥0.8, FC ≥2.0 filters
  - Result: 0 matches (centrosome baits vs IFT baits - different biological question)
- ✅ Added Sang et al., 2011 (LAP) dataset integration
  - 3 validations: TULP3-B9D1, IFT74-TCTN2, IFT70B-CEP97
  - All LOW ipSAE (0.34-0.45) but strong MS evidence (18-28 spectra, high TIC)
  - Demonstrates transition zone-IFT interactions rescue low AF3 predictions
- ✅ Updated TODO_ADD_NEW_PROTEINS.md with Step 6: Re-run validations
- ✅ Documented phased approach for avoiding duplicates
  - Phase 1: Initial validation (31 baits) - 28 validations ✅ COMPLETED
  - Phase 2: Add 4 proteins (IFT172, BBS9, BBS18, RABL2) - Pending AF3 jobs
  - Phase 3: Re-run validations - idempotent, no duplicates (+5-10 more expected)
- ✅ Import scripts check for existing validations by PMID (safe to re-run)

**Summary of 2025-11-06 Updates**:
- ✅ Added colored dots (●) to confidence level checkboxes (green/orange/red)
- ✅ Removed redundant confidence legend from secondary network panel
- ✅ Removed "Hs" organism label from network (all proteins are human)
- ✅ Renamed PAE labels to "Contact Precision" (high/moderate) to avoid confusion with ipSAE confidence
- ✅ Result: Clearer UI with distinct terminology for global vs local quality metrics

**Summary of 2025-11-05 Updates**:
- ✅ Smart fullscreen sizing (adapts to screen, prevents memory issues)
- ✅ Fixed PAE highlighting reset bug
- ✅ Improved sidebar typography (larger, more readable fonts)
- ✅ Added false positive disclaimer
- ✅ Fixed network edge colors to use ipSAE-based confidence
- ✅ Updated network tooltips (show ipSAE, removed redundant AF3 label)
- ✅ Text corrections (flexible relative domain orientation)
