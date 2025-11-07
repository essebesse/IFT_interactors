# To-Do List: Adding New Proteins to IFT_Interactors Database

## Prerequisites
- [x] IFT172 AF3 data ready (Q9UG01_IFT172)
- [ ] BBS9 AF3 data ready (Q3SYG4_BBS9)
- [ ] BBS18 AF3 data ready (A8MTZ0_BBS18)
- [ ] RABL2 AF3 data ready (Q9UNT1_RabL2)

**Wait for all 4 to be complete before starting!**

---

## Step 1: Pull Latest Code from GitHub (5 minutes)

```bash
cd /path/to/your/IFT_interactors

# Fetch and checkout the branch
git fetch origin claude/ift-interactors-experiment-011CUtE3m3MH4pCVUjhLi79o
git checkout claude/ift-interactors-experiment-011CUtE3m3MH4pCVUjhLi79o
git pull origin claude/ift-interactors-experiment-011CUtE3m3MH4pCVUjhLi79o
```

**Verify you have**:
- [ ] Updated `import_from_v4_originals_INCREMENTAL.mjs` with 4 new protein paths
- [ ] `scripts/remove_bbs10_bbs12.mjs` removal script
- [ ] `CURRENT_BAIT_PROTEINS.md` updated documentation
- [ ] `BOLDT_DATASET_CRITERIA.txt` Boldt documentation

---

## Step 2: Verify AF3 Data Files Exist (2 minutes)

```bash
cd /emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/

# Check all 4 new protein folders have v4.json files
ls -la Q9UG01_IFT172/AF3/AF3_PD_analysis_v4.json
ls -la Q3SYG4_BBS9/AF3/AF3_PD_analysis_v4.json
ls -la A8MTZ0_BBS18/AF3/AF3_PD_analysis_v4.json
ls -la Q9UNT1_RabL2/AF3/AF3_PD_analysis_v4.json
```

**Expected**: All 4 files should exist and be non-empty.

- [ ] IFT172 v4.json exists
- [ ] BBS9 v4.json exists
- [ ] BBS18 v4.json exists
- [ ] RABL2 v4.json exists

---

## Step 3: Run Incremental Import (10 minutes)

```bash
cd /path/to/your/IFT_interactors

# Set database connection
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# Run incremental import (only imports NEW proteins)
node import_from_v4_originals_INCREMENTAL.mjs
```

**Expected output**:
```
🔍 Checking for existing data in database...
📊 Found 31 baits with existing data:
   A0AVF1: 11 interactions
   O75386: 73 interactions
   ... (31 existing baits)

📁 Processing v4.json files...
  ⏭️  SKIP: A0AVF1 (already has 11 interactions)
  ... (skipping 31 existing)
  📄 Processing: Q9UG01 - XX interactions
  📄 Processing: Q3SYG4 - XX interactions
  📄 Processing: A8MTZ0 - XX interactions
  📄 Processing: Q9UNT1 - XX interactions

📊 Import Summary:
   ✅ Processed: 4 files
   ⏭️  Skipped: 31 files (already in database)
   🔗 New interactions: XXX
   👥 New proteins: XXX

🎉 Import complete!
```

**Checklist**:
- [ ] Import completed without errors
- [ ] 4 new files processed
- [ ] 31 existing files skipped
- [ ] New interactions added (check the count)

---

## Step 4: Verify Import Success (5 minutes)

**Note**: BBS10/BBS12 already removed, so going from 31→35 baits (not 35→33)

```bash
# Check total baits (should be 35 now: 31 existing + 4 new)
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

node -e "
const { sql } = require('@vercel/postgres');
(async () => {
  const result = await sql\`
    SELECT COUNT(DISTINCT p.uniprot_id) as bait_count
    FROM proteins p
    JOIN interactions i ON p.id = i.bait_protein_id
  \`;
  console.log('Total baits:', result.rows[0].bait_count);
  console.log('Expected: 35 (31 existing + 4 new)');

  // Check for the 4 new baits specifically
  const newBaits = await sql\`
    SELECT p.uniprot_id, p.gene_name, COUNT(i.id) as interaction_count
    FROM proteins p
    JOIN interactions i ON p.id = i.bait_protein_id
    WHERE p.uniprot_id IN ('Q9UG01', 'Q3SYG4', 'A8MTZ0', 'Q9UNT1')
    GROUP BY p.uniprot_id, p.gene_name
    ORDER BY p.uniprot_id
  \`;
  console.log('\\nNew baits imported:');
  newBaits.rows.forEach(row => {
    console.log(\`  \${row.uniprot_id} (\${row.gene_name || 'unknown'}): \${row.interaction_count} interactions\`);
  });
})();
"
```

**Checklist**:
- [ ] Total baits = 35 ✓ (31 + 4 new)
- [ ] Q9UG01 (IFT172) has interactions ✓
- [ ] Q3SYG4 (BBS9) has interactions ✓
- [ ] A8MTZ0 (BBS18) has interactions ✓
- [ ] Q9UNT1 (RABL2) has interactions ✓

---

## Step 5: Verify Final Database State (5 minutes)

**Note**: BBS10 and BBS12 were already removed earlier, so final count is 35!

```bash
# Check total baits (should be 35: 31 original + 4 new)
node -e "
const { sql } = require('@vercel/postgres');
(async () => {
  const result = await sql\`
    SELECT COUNT(DISTINCT p.uniprot_id) as bait_count,
           SUM(interaction_count) as total_interactions
    FROM (
      SELECT p.uniprot_id, COUNT(i.id) as interaction_count
      FROM proteins p
      JOIN interactions i ON p.id = i.bait_protein_id
      GROUP BY p.uniprot_id
    ) as bait_stats
  \`;
  console.log('Final Database Status:');
  console.log('  Total baits:', result.rows[0].bait_count);
  console.log('  Total interactions:', result.rows[0].total_interactions);
  console.log('\\nExpected:');
  console.log('  Total baits: 35 (31 original + 4 new)');
  console.log('  BBS10/BBS12 already removed previously');
})();
"
```

**Checklist**:
- [ ] Total baits = 35 ✓
- [ ] BBS10 and BBS12 are NOT in the list ✓ (already removed)
- [ ] IFT172, BBS9, BBS18, RABL2 ARE in the list ✓

---

## Step 6: Run Boldt Validation on New Proteins (Optional, 30 minutes)

Check if any of the new protein interactions are in Boldt et al. dataset:

```bash
cd /path/to/your/IFT_interactors

# If you still have the Boldt Excel file
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

node scripts/import_experimental_data.mjs boldt2016
```

**What happens**:
- Script will check ALL interactions (including new ones)
- Will skip already-validated interactions
- Will add validation data for any NEW overlaps with Boldt

**Expected**: Possibly 0-10 new validations (depends on Boldt coverage)

**Checklist**:
- [ ] Boldt import completed
- [ ] Check how many new validations were added
- [ ] Note any validated interactions from new proteins

---

## Step 7: Update Website (Git Commit & Deploy) (10 minutes)

```bash
cd /path/to/your/IFT_interactors

# Step 8.1: Check what's changed
git status

# Step 8.2: Commit any local changes (if you made any)
# Usually nothing to commit - data is in Neon database only

# Step 8.3: Trigger Vercel redeployment
# Option A: Just push to GitHub (if you have changes)
git add .
git commit -m "Updated database with IFT172, BBS9, BBS18, RABL2; removed BBS10/BBS12"
git push origin main

# Option B: Manual trigger (if no code changes)
# Visit: https://vercel.com/essebesse/ift-interactors
# Click: Deployments → "..." → Redeploy
```

**Wait ~1-2 minutes for Vercel to deploy**

**Checklist**:
- [ ] Vercel deployment started
- [ ] Deployment completed successfully
- [ ] Website is accessible

---

## Step 8: Test Website (5 minutes)

Visit: https://ift-interactors.vercel.app

Test searches for new proteins:

1. **Search for IFT172**:
   - [ ] Type "IFT172" or "Q9UG01" in search
   - [ ] Results appear with interactions
   - [ ] ipSAE scores are visible
   - [ ] Validated badge (if any Boldt overlaps)

2. **Search for BBS9**:
   - [ ] Type "BBS9" or "Q3SYG4"
   - [ ] Results appear

3. **Search for BBS18**:
   - [ ] Type "BBS18" or "A8MTZ0"
   - [ ] Results appear

4. **Search for RABL2**:
   - [ ] Type "RABL2" or "Q9UNT1"
   - [ ] Results appear

5. **Verify removals**:
   - [ ] Search "BBS10" - should show 0 results (as bait)
   - [ ] Search "BBS12" - should show 0 results (as bait)

---

## Step 9: Update Documentation (5 minutes)

Update `CURRENT_BAIT_PROTEINS.md`:

```bash
cd /path/to/your/IFT_interactors

# Edit CURRENT_BAIT_PROTEINS.md
# Change status from "🔄 GENERATING" to "✅ In DB" for:
# - IFT172 (Q9UG01)
# - BBS9 (Q3SYG4)
# - BBS18 (A8MTZ0)
# - RABL2 (Q9UNT1)

# Update summary:
# "Currently in Database: 33 baits" (was 31)
# Remove the "To Add" section

git add CURRENT_BAIT_PROTEINS.md
git commit -m "Update bait protein list - 33 baits now in database"
git push origin claude/ift-interactors-experiment-011CUtE3m3MH4pCVUjhLi79o
```

**Checklist**:
- [ ] Documentation updated
- [ ] Committed to git
- [ ] Pushed to GitHub

---

## Step 10: Generate Statistics Report (Optional, 10 minutes)

Create a summary for your records/manuscript:

```bash
node -e "
const { sql } = require('@vercel/postgres');
(async () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('IFT_INTERACTORS DATABASE STATISTICS');
  console.log('═══════════════════════════════════════════════════════════\\n');

  // Total baits
  const baits = await sql\`
    SELECT COUNT(DISTINCT p.uniprot_id) as count
    FROM proteins p
    JOIN interactions i ON p.id = i.bait_protein_id
  \`;
  console.log('Total Baits:', baits.rows[0].count);

  // Total interactions
  const interactions = await sql\`SELECT COUNT(*) as count FROM interactions\`;
  console.log('Total Interactions:', interactions.rows[0].count);

  // By confidence
  const byConfidence = await sql\`
    SELECT ipsae_confidence, COUNT(*) as count
    FROM interactions
    WHERE ipsae IS NOT NULL
    GROUP BY ipsae_confidence
    ORDER BY CASE ipsae_confidence
      WHEN 'High' THEN 1
      WHEN 'Medium' THEN 2
      WHEN 'Low' THEN 3
    END
  \`;
  console.log('\\nBy Confidence:');
  byConfidence.rows.forEach(row => {
    console.log(\`  \${row.ipsae_confidence}: \${row.count}\`);
  });

  // Validated interactions
  const validated = await sql\`
    SELECT COUNT(*) as count
    FROM interactions
    WHERE experimental_validation IS NOT NULL
  \`;
  console.log('\\nExperimentally Validated:', validated.rows[0].count);

  // Complex breakdown
  console.log('\\nBy Complex:');
  console.log('  IFT-A: 6 baits');
  console.log('  IFT-B1: 9 baits');
  console.log('  IFT-B2: 8 baits (includes IFT172)');
  console.log('  BBSome: 8 baits');
  console.log('  BBSome-associated: 2 baits (BBS9, BBS18)');
  console.log('  IFT-associated: 2 baits (TULP3, RABL2)');

  console.log('\\n═══════════════════════════════════════════════════════════');
})();
" > DATABASE_STATS_$(date +%Y%m%d).txt

cat DATABASE_STATS_*.txt
```

**Checklist**:
- [ ] Statistics generated
- [ ] Numbers look reasonable
- [ ] Save for manuscript

---

## Troubleshooting

### Issue: Import script fails with "File not found"
**Solution**: Check AF3 folder paths. The script uses:
- `Q9UG01_IFT172` (not `Q9UG01_IF172` - you renamed this)
- `Q3SYG4_BBS9`
- `A8MTZ0_BBS18`
- `Q9UNT1_RabL2`

### Issue: Bait count is wrong
**Solution**:
- Run dry run of removal script to see current state
- Check if BBS10/BBS12 were already removed
- Verify all 4 new proteins imported (not just some)

### Issue: Website doesn't show new proteins
**Solution**:
- Check Vercel deployment completed
- Database IS updated (Neon is shared, not local)
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

### Issue: UniProt ID mismatch
**Problem**: Documentation says Q9NX57 for RABL2, but folder is Q9UNT1
**Solution**: Use the actual folder names (Q9UNT1). The import script already has the correct path.

---

## Final Checklist

- [ ] All 4 AF3 jobs completed
- [ ] Code pulled from GitHub
- [ ] AF3 v4.json files verified
- [ ] Incremental import completed successfully
- [ ] Import verified (35 baits before removal)
- [ ] BBS10/BBS12 removed (33 baits after)
- [ ] Final database state verified
- [ ] Boldt validation run (optional)
- [ ] Website redeployed
- [ ] Website tested with new proteins
- [ ] Documentation updated
- [ ] Statistics generated (optional)

---

## Expected Final State

**Database**:
- ✅ 35 total baits (31 + 4 new; BBS10/BBS12 already removed earlier)
- ✅ ~600-700 total interactions (depends on new data)
- ✅ IFT-A: 6, IFT-B1: 9, IFT-B2: 8, BBSome+assoc: 10, IFT-assoc: 2
- ✅ ~25-30 Boldt-validated interactions

**Website**:
- ✅ All 35 proteins searchable
- ✅ IFT172, BBS9, BBS18, RABL2 visible
- ✅ BBS10, BBS12 not showing as baits (already removed)
- ✅ Validation badges on Boldt-confirmed interactions

---

**Estimated Total Time**: 1-2 hours (mostly waiting for scripts)

**Questions?** Check:
- `EXPERIMENTAL_DATA_SETUP.md` for Boldt import issues
- `BOLDT_DATASET_CRITERIA.txt` for validation details
- `CURRENT_BAIT_PROTEINS.md` for protein list reference

Good luck! 🎉
