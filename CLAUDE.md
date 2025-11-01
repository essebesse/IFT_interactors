# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IFT Interactors Website**: Companion website for IFT/BBSome protein interaction paper
- **Purpose**: Display comprehensive IFT/BBSome interaction dataset (paper shows top hits only)
- **Stack**: Next.js 14, PostgreSQL (Neon), Vercel deployment
- **Data Source**: Extracted from main ciliaaf3predictions.vercel.app database
- **Focus**: IFT-A, IFT-B1, IFT-B2, BBSome, and motor proteins

## ⚠️ CRITICAL: Git & Deployment Workflow

This is a **STANDALONE PROJECT** with its own GitHub repository and database.

### Git Repository
- **Repository**: `https://github.com/essebesse/IFT_interactors.git`
- **Remote name**: `origin`
- **Parent directory**: Lives in `Global_Analysis/IFT_Interactors_paper/` but is independent

### Database
- **Neon Database**: `postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb`
- **Status**: ✅ Populated (1,147 interactions, 678 proteins)
- **Setup Script**: `setup_database.mjs` (already run)

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

⚠️ **CRITICAL**: This project lives inside the parent directory but has its own git repo. Due to the nested structure, pushes MUST be done using git subtree from the parent directory.

**Method 1: Using Git Subtree (REQUIRED for pushes to work)**
```bash
# From the PARENT directory (Global_Analysis)
cd /emcc/au14762/elo_lab/SCRIPTS/Global_Analysis

# Make changes in IFT_Interactors_paper/ subdirectory
cd IFT_Interactors_paper
# ... edit files ...
git add [files]
git commit -m "Your message"
cd ..

# Push using subtree split (strips directory prefix)
git subtree split --prefix=IFT_Interactors_paper -b ift-temp-branch
git push new_repo ift-temp-branch:main --force
git branch -D ift-temp-branch  # Cleanup temp branch
```

**Why this is necessary:**
- The project is nested in `Global_Analysis/IFT_Interactors_paper/`
- Direct pushes from the subdirectory fail (SSH auth issues)
- Pushing from parent with regular `git push` adds wrong path prefix (`IFT_Interactors_paper/app/...`)
- `git subtree split` removes the prefix and pushes correct paths (`app/...`)

**Method 2: Direct Push from Subdirectory (may not work due to auth)**
```bash
cd /emcc/au14762/elo_lab/SCRIPTS/Global_Analysis/IFT_Interactors_paper
git add [files]
git commit -m "Your message"
git push origin main  # ← May fail with "Permission denied (publickey)"
```

**Important Notes:**
- This project is in the parent directory's `.gitignore`
- Changes here do NOT affect the main Cilia project
- Each project deploys independently
- Always use **Method 1** for reliable pushes
- The `new_repo` remote in parent directory points to `https://github.com/essebesse/IFT_interactors.git`

### Complete Workflow: Edit → Commit → Push → Deploy

```bash
# 1. Make changes in IFT_Interactors_paper
cd /emcc/au14762/elo_lab/SCRIPTS/Global_Analysis/IFT_Interactors_paper
# ... edit files ...

# 2. Commit locally
git add [files]
git commit -m "Your message"

# 3. Push to GitHub using subtree (from parent directory)
cd /emcc/au14762/elo_lab/SCRIPTS/Global_Analysis
git subtree split --prefix=IFT_Interactors_paper -b ift-temp-branch
git push new_repo ift-temp-branch:main --force
git branch -D ift-temp-branch

# 4. Verify push succeeded
git ls-remote new_repo main  # Should show your latest commit hash

# 5. Trigger deployment (if automatic webhook fails)
curl -X POST 'https://api.vercel.com/v1/integrations/deploy/prj_9aWAK9J4plPAWZpOk3uiNCHzMM3t/Z7xGv44ebi'

# 6. Monitor deployment
# Visit: https://vercel.com/essebesse/ift-interactors
# Check: Deployment is building correct commit from step 4
```

**Common Issues:**
- If `git push` says "Everything up-to-date" but you made changes → You forgot to commit in IFT_Interactors_paper subdirectory first
- If Vercel builds old commit → Use manual deployment curl command (step 5)
- If build fails with missing files → Files weren't committed; check `git status` in IFT_Interactors_paper

## Dataset Overview

### Data Statistics (as of 2025-10-31)
- **Total Interactions**: 1,147
- **Unique Proteins**: 678
- **v4 Analysis (ipSAE)**: 514 interactions (44.8%)
- **v3 Analysis**: 633 interactions (55.2%)
- **High Confidence**: 147 interactions (12.8%)
- **Medium Confidence**: 195 interactions (17.0%)
- **Experimentally Validated**: 25 interactions (MS pulldown)

### Protein Complex Coverage
| Complex | Interactions | High Conf | v4 Analysis | Validated |
|---------|-------------|-----------|-------------|-----------|
| IFT-B1 | 347 (30.3%) | 67 (19.3%) | 151 (43.5%) | 0 |
| BBSome | 267 (23.3%) | 29 (10.9%) | 130 (48.7%) | 0 |
| IFT-A | 212 (18.5%) | 17 (8.0%) | 97 (45.8%) | 22 |
| IFT-associated | 159 (13.9%) | 10 (6.3%) | 80 (50.3%) | 3 |
| IFT-B2 | 150 (13.1%) | 23 (15.3%) | 52 (34.7%) | 0 |
| Motor | 12 (1.0%) | 1 (8.3%) | 4 (33.3%) | 0 |

## Key Data Files

### Extraction Data (Source from ciliaaf3predictions.vercel.app)
- **ift_bbsome_extraction_20251031_131653.json** - Complete dataset (1,147 interactions)
- **ift_bbsome_extraction_20251031_131653.csv** - CSV format for analysis
- **ift_bbsome_extraction_high_confidence_v4_20251031_131653.json** - Filtered high-confidence (v4 only)
- **ift_bbsome_extraction_stats_20251031_131653.txt** - Statistical summary

### Publication-Ready Tables (For Paper Manuscript)
- **publication_complex_summary_20251031_131808.csv** - Summary by protein complex
- **publication_high_confidence_v4_20251031_131808.csv** - 146 high-confidence v4 interactions
- **publication_validated_interactions_20251031_131808.csv** - 25 experimentally validated
- **publication_protein_coverage_20251031_131808.csv** - Coverage statistics per protein

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
```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
node setup_database.mjs
```

**Note**: This will drop and recreate tables, then import all 1,147 interactions from `ift_bbsome_extraction_20251031_131653.json`

## Common Commands

```bash
npm run dev          # Local development server (http://localhost:3000)
npm run build        # Test production build
npm start            # Run production build locally
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
- **Confidence levels**: High, Medium, Low
- **Analysis version**: v3 (interface quality) or v4 (ipSAE)
- **AlphaFold version**: AF2 or AF3

### Visualization
- Interactive force-directed network graph
- Color-coded by confidence level
- Edge thickness by confidence score
- Click nodes to explore secondary interactions

### Data Export
- CSV export of interaction tables
- Network visualization screenshots

## Publication Workflow

### Website Role
- **Website**: Shows ALL 1,147 interactions (comprehensive resource)
- **Paper**: Focuses on high-confidence hits from publication tables

### Data for Paper Figures
1. **High-confidence network**: Use `publication_high_confidence_v4_20251031_131808.csv`
2. **Complex summary**: Use `publication_complex_summary_20251031_131808.csv`
3. **Validated interactions**: Use `publication_validated_interactions_20251031_131808.csv`

### Citation
When published, website will be cited as:
- Supplementary online resource for IFT/BBSome interaction data
- Reference dataset for validation experiments
- Interactive exploration tool for researchers

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

- ✅ Database is pre-populated (no need to run import scripts)
- ✅ All API routes configured for runtime-only execution
- ✅ Independent from main Cilia project
- ⚠️ Do not modify the main Cilia database connection string
- ⚠️ This project uses a separate Neon database instance

## Related Documentation

- **EXTRACTION_SUMMARY_REPORT.md** - Detailed extraction methodology and results
- **ift_website_roadmap.md** - Original development roadmap
- **human_ift_proteins_complete.md** - Human IFT protein reference
- **chlamydomonas_ift_proteins_complete.md** - Chlamydomonas IFT protein reference
- **session_summary.txt** - Initial setup session notes

---

**Project Status**: ✅ Deployed and operational
**Last Updated**: 2025-11-01
**Database Status**: ✅ Populated (1,147 interactions)
**Deployment**: Vercel (triggered by git push to main)
