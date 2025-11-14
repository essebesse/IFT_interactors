# Publication Analysis Scripts - Instructions for Claude Code

## Overview

This directory contains analysis scripts for preparing the IFT/BBSome interactome data for publication. The scripts perform dataset statistics, database comparisons, network analysis, and generate data files for figures.

**Current Database Status**: ✅ Complete (512 interactions, 371 proteins, 33 baits)

---

## Directory Structure

```
analysis/
├── scripts/              # Analysis scripts
│   ├── 01_dataset_statistics.mjs
│   ├── 02_network_topology.py
│   ├── 04_biogrid_comparison.py
│   └── 05_string_comparison.py
├── results/              # Output: analysis results (CSV, JSON, TXT)
└── README_FOR_CLAUDE_CODE.md

figures/
└── data/                 # Output: data for publication figures

manuscript/
└── results_draft.md      # Draft Results section for paper

PUBLICATION_ANALYSIS_PLAN.md  # Master plan document
```

---

## Prerequisites

### 1. Environment Variable

Set the PostgreSQL connection string:

```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"
```

### 2. Python Dependencies

Install required Python packages:

```bash
pip install pandas psycopg2-binary networkx requests python-dotenv
```

### 3. Node.js Dependencies

The Node.js scripts use existing project dependencies:

```bash
npm install  # If not already done
```

---

## Execution Order

### Phase 1: Dataset Characterization (Start Here)

#### Script 1: Dataset Statistics

**Purpose**: Generate comprehensive dataset statistics and export supplementary tables

**Run**:
```bash
node analysis/scripts/01_dataset_statistics.mjs
```

**Outputs**:
- `analysis/results/dataset_overview.txt` - Summary statistics
- `analysis/results/bait_summary.csv` - Per-bait interaction counts
- `analysis/results/supplementary_table_S1_all_interactions.csv` - Full interaction list
- `analysis/results/supplementary_table_S2_proteins.csv` - Protein list with degrees
- `analysis/results/confidence_distribution.csv` - Data for plotting confidence distribution

**Expected Results**:
- Total interactions: 512
- Total proteins: 371
- Confidence breakdown (High/Medium/Low)
- Per-bait statistics

**Time**: ~10 seconds

---

#### Script 2: Network Topology Analysis

**Purpose**: Calculate network metrics and identify hub proteins

**Run**:
```bash
python analysis/scripts/02_network_topology.py
```

**Outputs**:
- `analysis/results/network_metrics.json` - Topology statistics (density, clustering, etc.)
- `analysis/results/hub_proteins.csv` - Top 20 hub proteins by degree
- `figures/data/network_data.graphml` - Network file for Cytoscape visualization

**Expected Results**:
- Network properties (nodes, edges, density, clustering coefficient)
- Hub identification
- Community structure

**Time**: ~30 seconds

---

### Phase 2: Database Comparisons

#### Script 3: BioGRID Comparison

**Purpose**: Compare predictions against BioGRID experimental interactions

**Run**:
```bash
python analysis/scripts/04_biogrid_comparison.py
```

**What it does**:
1. Downloads BioGRID human interactions (~50 MB file)
2. Filters for physical interactions (Y2H, Co-IP, MS)
3. Matches our predictions against BioGRID
4. Calculates validation rates by confidence level

**Outputs**:
- `analysis/results/biogrid_comparison.json` - Summary statistics
- `analysis/results/biogrid_validated_interactions.csv` - Predictions found in BioGRID
- `analysis/results/biogrid_novel_predictions.csv` - Predictions NOT in BioGRID
- `figures/data/venn_diagram_biogrid.json` - Data for Venn diagram

**Expected Results**:
- Validation rate: ~20-40% (typical for AF3 predictions)
- Higher validation for high-confidence predictions
- Identification of novel interactions

**Time**: ~2-5 minutes (includes download)

**Note**: BioGRID file (~50 MB) will be saved to `data/external/` for reuse

---

#### Script 4: STRING Comparison

**Purpose**: Compare predictions against STRING database

**Run**:
```bash
python analysis/scripts/05_string_comparison.py
```

**What it does**:
1. Downloads STRING human protein links (~500 MB compressed)
2. Downloads STRING protein info for gene name mapping (~10 MB)
3. Filters for medium+ confidence (score ≥400)
4. Matches our predictions against STRING
5. Analyzes correlation between ipSAE and STRING scores

**Outputs**:
- `analysis/results/string_comparison.json` - Summary statistics
- `analysis/results/string_validated_interactions.csv` - Predictions in STRING
- `figures/data/string_score_correlation.csv` - Data for correlation plot

**Expected Results**:
- STRING coverage: ~30-60% (STRING includes predictions, not just experimental)
- Correlation between ipSAE and STRING scores
- Identification of interactions supported by diverse evidence types

**Time**: ~5-10 minutes (includes download of large files)

**Note**: STRING files (~500 MB total) will be saved to `data/external/` for reuse

---

## Running All Scripts in Sequence

You can run all Phase 1 and Phase 2 scripts sequentially:

```bash
# Set environment variable
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# Phase 1
echo "Running dataset statistics..."
node analysis/scripts/01_dataset_statistics.mjs

echo "Running network topology..."
python analysis/scripts/02_network_topology.py

# Phase 2
echo "Running BioGRID comparison..."
python analysis/scripts/04_biogrid_comparison.py

echo "Running STRING comparison..."
python analysis/scripts/05_string_comparison.py

echo "All scripts complete!"
```

---

## Interpreting Results

### Dataset Statistics

After running Script 1, check `analysis/results/dataset_overview.txt`:

```
Total Interactions:      512
Total Unique Proteins:   371
Total Bait Proteins:     33

High:   XX interactions (XX%)
Medium: XX interactions (XX%)
Low:    XX interactions (XX%)
```

**What to look for**:
- At least 30-40% High confidence interactions (ipSAE > 0.7)
- Reasonable distribution across baits (no single bait dominating)

---

### Network Metrics

After running Script 2, check `analysis/results/network_metrics.json`:

```json
{
  "num_nodes": 371,
  "num_edges": 512,
  "avg_degree": X.X,
  "avg_clustering": X.XX,
  "largest_component_size": XXX
}
```

**What to look for**:
- Average degree: ~2-3 (typical for PPI networks)
- Clustering coefficient: 0.2-0.4 (biological networks are modular)
- Large connected component: >70% of nodes

---

### BioGRID Validation

After running Script 3, check `analysis/results/biogrid_comparison.json`:

```json
{
  "total_predictions": 512,
  "validated_in_biogrid": XX,
  "validation_rate": 0.XX,
  "by_confidence": {
    "High": {"total": XX, "validated": XX, "validation_rate": 0.XX}
  }
}
```

**What to look for**:
- High-confidence validation rate: 30-50% (good)
- Validation rate increases with confidence: High > Medium > Low
- At least 100-200 validated interactions for strong paper

---

### STRING Comparison

After running Script 4, check `analysis/results/string_comparison.json`:

```json
{
  "total_predictions": 512,
  "in_string": XXX,
  "coverage_rate": 0.XX
}
```

**What to look for**:
- STRING coverage: 30-60% (includes predictions, so higher than BioGRID)
- Correlation with STRING scores: r > 0.3 (positive correlation)

---

## Using Results for Manuscript

### Step 1: Update Results Draft

Open `manuscript/results_draft.md` and replace all placeholders:

- `[X, XX, XXX]` → Actual numbers from analysis outputs
- `[BaitX], [PreyX]` → Interesting protein names from results
- `[GeneX], [DiseaseX]` → Disease-associated proteins (requires manual curation)

### Step 2: Create Figures

Use data files in `figures/data/` to create publication figures:

**Figure 1**: Dataset overview
- Use `confidence_distribution.csv` for histogram

**Figure 2**: Validation
- Use `venn_diagram_biogrid.json` for Venn diagram
- Use validation rates from JSON files for bar charts
- Use `string_score_correlation.csv` for scatter plot

**Figure 4**: Network
- Import `network_data.graphml` into Cytoscape
- Use `hub_proteins.csv` for hub protein list

### Step 3: Create Supplementary Tables

Export files are ready in `analysis/results/`:

- **Table S1**: `supplementary_table_S1_all_interactions.csv`
- **Table S2**: `supplementary_table_S2_proteins.csv`
- **Table S3**: `biogrid_validated_interactions.csv`
- **Table S4**: `biogrid_novel_predictions.csv`

---

## Troubleshooting

### Error: "Module not found"

**Python**: Install dependencies
```bash
pip install pandas psycopg2-binary networkx requests
```

**Node.js**: Install dependencies
```bash
npm install
```

### Error: "POSTGRES_URL not set"

Set environment variable:
```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"
```

### Error: "BioGRID download failed"

**Manual download**:
1. Visit: https://downloads.thebiogrid.org/BioGRID/Release-Archive/
2. Download: `BIOGRID-ORGANISM-Homo_sapiens-4.4.235.tab3.txt`
3. Place in: `data/external/`
4. Re-run script

### Error: "STRING download failed"

**Manual download**:
1. Visit: https://stringdb-downloads.org/download/protein.links.v12.0/
2. Download: `9606.protein.links.v12.0.txt.gz`
3. Visit: https://stringdb-downloads.org/download/protein.info.v12.0/
4. Download: `9606.protein.info.v12.0.txt.gz`
5. Place both in: `data/external/`
6. Re-run script

---

## Next Steps (Future Scripts)

**Phase 3: Functional Analysis** (not yet implemented)
- GO enrichment (Script 08)
- Pathway analysis (Script 09)
- Ciliary annotations (Script 10)
- Domain analysis (Script 11)

**Phase 4: Novel Predictions** (not yet implemented)
- Novel prediction ranking (Script 12)
- Disease associations (Script 13)
- Literature mining (Script 14)
- Validation prioritization (Script 15)

See `PUBLICATION_ANALYSIS_PLAN.md` for full roadmap.

---

## Summary Checklist

- [ ] Run Script 1: Dataset statistics ✓ (10 seconds)
- [ ] Run Script 2: Network topology ✓ (30 seconds)
- [ ] Run Script 3: BioGRID comparison ✓ (2-5 minutes)
- [ ] Run Script 4: STRING comparison ✓ (5-10 minutes)
- [ ] Check all output files are created
- [ ] Review summary statistics in JSON files
- [ ] Update `manuscript/results_draft.md` with numbers
- [ ] Plan figure generation (use data files in `figures/data/`)

---

**Total Time for Phase 1+2**: ~10-20 minutes (including downloads)

**Ready for manuscript writing**: Yes! Use `manuscript/results_draft.md` as template

---

**Questions or Issues?**
Refer to `PUBLICATION_ANALYSIS_PLAN.md` for detailed methodology and next steps.
