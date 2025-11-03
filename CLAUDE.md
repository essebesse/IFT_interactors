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
- **Status**: ✅ Populated (877 interactions, 331 proteins from 32 baits)
- **Import Script**: `import_from_v4_originals_FIXED.mjs` (imports from original v4.json files)
- **Last Updated**: 2025-11-01 (rebuilt from original AlphaPulldown v4.json files)

### Deployment
- **Platform**: Vercel
- **Project URL**: https://vercel.com/essebesse/ift-interactors
- **Environment Variable**: `POSTGRES_URL` must be set in Vercel dashboard
- **Build Fix**: All API routes marked as `force-dynamic` to prevent build-time DB access

#### Automatic Deployment
- **Trigger**: Git push to `main` branch should auto-deploy
- **Issue**: GitHub webhook sometimes fails to trigger Vercel builds
- **Symptom**: Vercel builds old commits even after successful push

#### Manual Deployment (Use if automatic fails)
```bash
# Trigger deployment via deploy hook
curl -X POST 'https://api.vercel.com/v1/integrations/deploy/prj_9aWAK9J4plPAWZpOk3uiNCHzMM3t/Z7xGv44ebi'
```

**When to use manual deployment:**
- After pushing code, Vercel doesn't start building
- Vercel builds an old commit instead of latest
- Need to force a rebuild with latest code

**Verify deployment:**
1. Check Vercel dashboard for new deployment
2. Verify it's building the correct commit (should match `git ls-remote new_repo main`)
3. Build should complete in ~1-2 minutes

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

### Complete Workflow: Edit → Commit → Push → Deploy

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

# 4. Trigger deployment (if automatic webhook fails)
curl -X POST 'https://api.vercel.com/v1/integrations/deploy/prj_9aWAK9J4plPAWZpOk3uiNCHzMM3t/Z7xGv44ebi'

# 5. Monitor deployment
# Visit: https://vercel.com/essebesse/ift-interactors
# Check: Deployment is building correct commit from step 3
```

**Common Issues:**
- If `git push` fails with "Permission denied" → GitHub token may have expired; update remote URL with new token
- If Vercel builds old commit → Use manual deployment curl command (step 4)
- If build fails with missing files → Files weren't committed; check `git status`

## Dataset Overview

### Data Statistics (as of 2025-11-03)
- **Total Interactions**: 951
- **Unique Proteins**: 371 (all human Homo sapiens)
- **Unique Baits**: 34 (22 IFT + 10 BBSome + 2 IFT-associated)
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
- **IFT-Associated Proteins (2)**:
  - TULP3 (Tubby-related protein 3 / RP26)
  - Additional proteins may be added as data becomes available

### Notable Interactions (Top 5 by ipSAE)
1. IFT46 ↔ IFT56: ipSAE=0.828 (High)
2. BBS8 ↔ A8MTZ0: ipSAE=0.771 (High)
3. BBS7 ↔ BBS2: ipSAE=0.759 (High)
4. BBS2 ↔ BBS7: ipSAE=0.758 (High)

## Data Source Files

### Original AlphaPulldown v4.json Files (34 proteins)

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

**IFT-Associated Proteins (2 files)**:
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/O75386_Tulp3/AF3/AF3_PD_analysis_v4.json` (TULP3 / RP26)

**Excluded Files (Protein Complexes - NOT imported)**:
- ❌ `Q96LB3_Q8WYA0_IFT74_81` - IFT74+IFT81 complex
- ❌ `IFT52_46` - IFT52+IFT46 complex
- ❌ `Hs_Cter_IFT52_46` - C-terminal variant of IFT52+IFT46 complex

### Import Scripts
- **import_from_v4_originals_FIXED.mjs** - Main import script (reads from 34 v4.json files above)
- **drop_tables.mjs** - Wipes database clean (drops all tables)
- **find_v4_json.sh** - Finds all IFT/BBS v4.json files in AF3_APD directory
- **fetch_gene_names.mjs** - Fetches gene names from UniProt API for proteins without gene_name

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
- **Confidence levels**: High, Medium, Low (based on ipSAE v4 scoring)
- All data is v4 (ipSAE) analysis from AF3 predictions

### Visualization
- Interactive force-directed network graph
- Color-coded by confidence level
- Edge thickness by confidence score
- Click nodes to explore secondary interactions

### Data Export
- CSV export of interaction tables
- Network visualization screenshots

## Frontend Architecture

### Component Structure
- **app/page.tsx** - Main application page with search, filters, and results table
- **app/layout.tsx** - Root layout with metadata and global styles
- **components/NetworkVisualization.tsx** - Force-directed graph visualization using react-force-graph-2d

### Key Frontend Features
- **Client-side filtering** - Results filtered by confidence and analysis version
- **Dynamic network graph** - Interactive D3-based visualization with node clicking
- **Responsive design** - Bootstrap-based responsive UI
- **State management** - React hooks for search, filters, and selected protein

### Styling
- Bootstrap 5.3.3 for base styles
- Custom CSS for confidence badges (High=green, Medium=orange, Low=red)
- react-bootstrap components for UI elements

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

- **human_ift_proteins_complete.md** - Human IFT protein reference
- **chlamydomonas_ift_proteins_complete.md** - Chlamydomonas IFT protein reference
- **import_from_v4_originals_FIXED.mjs** - Main import script
- **drop_tables.mjs** - Database reset script
- **find_v4_json.sh** - Finds all v4.json source files

---

**Project Status**: ✅ Deployed and operational
**Last Updated**: 2025-11-01
**Database Status**: ✅ Populated (877 interactions, 331 proteins, 32 baits)
**Data Source**: Original AlphaPulldown v4.json files (v4 ipSAE scoring, AF3 only)
**Deployment**: Vercel (triggered by git push to main)
