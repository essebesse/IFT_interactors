# Interaction Categorization Scripts

## Overview

These scripts perform functional categorization of all IFT/BBSome interactions using GO (Gene Ontology) terms from UniProt.

## Prerequisites

**Network Access Required:**
- Connection to Neon PostgreSQL database
- Access to UniProt REST API (https://rest.uniprot.org)

**Environment Variables:**
```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"
```

**Dependencies:**
```bash
npm install pg node-fetch
```

## Scripts

### 1. fetch_go_terms.mjs
**Purpose:** Fetch GO terms from UniProt for all proteins in database

**What it does:**
- Queries database for all unique human proteins (~371 proteins)
- Fetches GO annotations from UniProt REST API
- Extracts Biological Process, Cellular Component, Molecular Function
- Rate-limited to 200ms between requests (~74 seconds total)

**Output:**
- `data/protein_go_terms.json` - GO term annotations for all proteins

**Run:**
```bash
node scripts/fetch_go_terms.mjs
```

### 2. categorize_interactions.mjs
**Purpose:** Categorize all interactions using GO terms

**Categories:**

**Validation (Machinery):**
- Intra-IFT-A complex interactions
- Intra-IFT-B complex interactions
- Intra-BBSome complex interactions
- IFT-A/B coupling interactions

**Mechanistic:**
- IFT-BBSome coupling (e.g., IFT144-BBS7)

**Novel Cargo:**
- Transcription/Chromatin
- Signaling (GPCRs, kinases, receptors)
- Metabolism (glycolysis, lipid, mitochondrial)
- Cytoskeleton (microtubule, actin)
- Membrane trafficking (vesicles, Golgi, endosomes)
- Ciliary structural
- RNA processing
- Other

**Known Ciliary Proteins:**
```javascript
IFT-A: IFT43, IFT121, IFT122, IFT139, IFT140, IFT144, WDR19, WDR35, TULP3
IFT-B: IFT20, IFT22, IFT25, IFT27, IFT46, IFT52, IFT54, IFT56, IFT57,
       IFT70, IFT74, IFT80, IFT81, IFT88, TTC30A, TTC30B, RABL2A, RABL2B
BBSome: BBS1, BBS2, BBS3, ARL6, BBS4, BBS5, BBS7, BBS8, BBS9, BBS10,
        BBS12, BBS17, BBS18, BBIP10, LZTL1
```

**Output:**
- `data/categorized_interactions.json` - Full categorization data
- `data/categorized_interactions.csv` - CSV for analysis
- `data/interaction_summary.json` - Summary statistics

**Run:**
```bash
node scripts/categorize_interactions.mjs
```

### 3. generate_category_summary.mjs
**Purpose:** Generate publication-ready summary tables

**What it generates:**

1. **Major category breakdown:**
   - Validation (Machinery)
   - Mechanistic (IFT-BBSome)
   - Novel Cargo categories (with subcategories)

2. **High-confidence novel cargo examples:**
   - Top 30 interactions with ipSAE > 0.6
   - Sorted by confidence score

**Output:**
- `data/CATEGORY_SUMMARY.md` - Markdown tables for publication
- `data/category_summary.csv` - CSV for plotting
- `data/category_visualization.json` - JSON for web visualization

**Run:**
```bash
node scripts/generate_category_summary.mjs
```

## Complete Workflow

```bash
# Set environment variable
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# Install dependencies (if needed)
npm install pg node-fetch

# Step 1: Fetch GO terms from UniProt (~74 seconds)
node scripts/fetch_go_terms.mjs

# Step 2: Categorize interactions using GO terms
node scripts/categorize_interactions.mjs

# Step 3: Generate publication summaries
node scripts/generate_category_summary.mjs

# Review results
cat data/CATEGORY_SUMMARY.md
```

## Expected Results

Based on ~512 interactions:

- **Validation (Machinery)**: ~30% - Known IFT/BBSome complex interactions
- **Mechanistic (IFT-BBSome)**: ~5% - Important coupling mechanisms
- **Novel Cargo - Transcription/Chromatin**: ~10-15%
- **Novel Cargo - Signaling**: ~15-20%
- **Novel Cargo - Metabolism**: ~5-10%
- **Novel Cargo - Cytoskeleton**: ~5-10%
- **Novel Cargo - Membrane trafficking**: ~5-10%
- **Novel Cargo - Other**: ~20-25%

## Outputs for Publication

The final `CATEGORY_SUMMARY.md` will contain:

1. **Summary table** with major categories and percentages
2. **Detailed breakdown** by subcategory
3. **Top 30 high-confidence novel cargo** (ipSAE > 0.6)
   - Bait, Prey, Category, ipSAE, iPTM scores
   - Suitable for supplementary table

4. **Visualization files**:
   - CSV for creating pie/bar charts in R/Python
   - JSON for web-based interactive visualizations

## Notes

- All categorization is based on GO term keyword matching
- Known ciliary proteins are manually curated (IFT-A, IFT-B, BBSome)
- GO terms are hierarchical (BP > CC > MF priority in categorization)
- "Other" category expected to be ~25% (diverse, low-frequency functions)
- ipSAE > 0.6 threshold for high-confidence novel cargo examples

## Troubleshooting

**Database connection errors:**
- Verify POSTGRES_URL environment variable is set
- Check network access to Neon database
- Test connection: `psql $POSTGRES_URL -c "SELECT COUNT(*) FROM proteins;"`

**UniProt API errors:**
- Check internet connectivity
- UniProt may rate-limit excessive requests
- Script has 200ms delay between requests (5 requests/second)
- If rate-limited, increase delay in fetch_go_terms.mjs

**Missing GO terms:**
- Some proteins may not have GO annotations in UniProt
- These will be categorized as "Other"
- Manual curation may be needed for important hits
