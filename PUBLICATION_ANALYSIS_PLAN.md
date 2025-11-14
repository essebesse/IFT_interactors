# IFT/BBSome Interactome Publication Analysis Plan

**Project**: Computational Prediction of Direct Protein-Protein Interactions in Human Intraflagellar Transport and BBSome Complexes Using AlphaFold3

**Database Status**: ✅ Complete (512 interactions, 371 proteins, 33 baits)

**Target Journal**: Nature Communications, PLOS Computational Biology, or Cell Systems

**Estimated Timeline**: 8-12 weeks

---

## Publication Structure

### Title (Working)
"Comprehensive AlphaFold3-predicted interactome of human intraflagellar transport and BBSome proteins reveals novel ciliary trafficking networks"

### Abstract Structure
1. Background: Cilia dysfunction causes ciliopathies; IFT/BBSome are key trafficking machinery
2. Methods: AF3 predictions for 33 human IFT/BBSome baits against ~371 ciliary/trafficking proteins
3. Results: 512 interactions (ipSAE scoring), validation against experimental databases
4. Impact: Novel predictions, functional insights, disease relevance

### Main Sections
1. **Introduction**
   - Ciliary biology and disease importance
   - IFT/BBSome complexes overview
   - AlphaFold3 for protein interaction prediction
   - Study rationale and scope

2. **Results**
   - Dataset overview and statistics
   - Comparison with experimental databases (BioGRID, STRING, PDB)
   - Validation analysis and confidence calibration
   - Network topology and hub proteins
   - Functional enrichment analysis
   - Novel high-confidence predictions
   - Disease-associated interactions

3. **Discussion**
   - Comparison with genome-wide AF3 studies
   - Biological insights (IFT-A vs IFT-B vs BBSome specificity)
   - Methodological considerations (focused vs broad screening)
   - Limitations and future directions

4. **Methods**
   - Protein selection criteria
   - AlphaFold3 prediction pipeline (AlphaPulldown)
   - Confidence scoring (ipSAE, iPTM, PAE)
   - Database comparisons
   - Statistical analyses

5. **Data Availability**
   - Interactive website: https://ift-interactors.vercel.app
   - Database dump: Zenodo/FigShare
   - Structure files: Zenodo

---

## Analysis Workflow

### PHASE 1: Dataset Characterization (Week 1-2)

**Deliverables**: Summary statistics, network properties, supplementary tables

**Scripts to Create**:
1. `analysis/01_dataset_statistics.mjs` - Database statistics and exports
2. `analysis/02_network_topology.py` - Network analysis with NetworkX
3. `analysis/03_confidence_distribution.mjs` - ipSAE/iPTM distributions

**Outputs**:
- `results/dataset_overview.txt`
- `results/supplementary_table_S1_all_interactions.csv`
- `results/supplementary_table_S2_proteins.csv`
- `results/network_metrics.json`
- `figures/data/confidence_distributions.csv`

---

### PHASE 2: Experimental Database Comparison (Week 2-4)

**Deliverables**: Validation rates, precision/recall metrics, overlap statistics

**Scripts to Create**:
1. `analysis/04_biogrid_comparison.py` - Download and compare with BioGRID
2. `analysis/05_string_comparison.py` - Download and compare with STRING
3. `analysis/06_pdb_structures.py` - Query PDB for experimental structures
4. `analysis/07_validation_metrics.py` - Calculate precision/recall/ROC

**External Data Downloads**:
- BioGRID: `data/external/BIOGRID-ORGANISM-Homo_sapiens-4.4.XXX.tab3.txt`
- STRING: `data/external/9606.protein.links.v12.0.txt`
- UniProt mappings: `data/external/uniprot_idmapping.dat`

**Outputs**:
- `results/biogrid_comparison.csv`
- `results/string_comparison.csv`
- `results/pdb_validated.csv`
- `results/validation_metrics.json`
- `figures/data/venn_diagram_data.json`
- `figures/data/precision_recall_curve.csv`

---

### PHASE 3: Functional Analysis (Week 4-6)

**Deliverables**: GO enrichment, pathway analysis, biological interpretation

**Scripts to Create**:
1. `analysis/08_go_enrichment.py` - Gene Ontology enrichment (g:Profiler API)
2. `analysis/09_pathway_analysis.py` - KEGG/Reactome enrichment
3. `analysis/10_ciliary_annotations.py` - Cildb/SysCilia cross-reference
4. `analysis/11_domain_analysis.py` - Pfam/InterPro domain enrichment

**Outputs**:
- `results/go_enrichment_by_bait.csv`
- `results/pathway_enrichment.csv`
- `results/ciliary_protein_annotations.csv`
- `results/domain_enrichment.csv`
- `figures/data/go_heatmap_data.csv`

---

### PHASE 4: Novel Predictions & Prioritization (Week 6-7)

**Deliverables**: Ranked novel predictions, disease associations, experimental validation targets

**Scripts to Create**:
1. `analysis/12_novel_predictions.py` - Filter and rank novel interactions
2. `analysis/13_disease_associations.py` - OMIM/ClinVar cross-reference
3. `analysis/14_literature_mining.py` - PubMed co-occurrence analysis
4. `analysis/15_validation_priorities.py` - Rank candidates for wet-lab validation

**Outputs**:
- `results/novel_high_confidence.csv`
- `results/disease_associated.csv`
- `results/literature_support.csv`
- `results/validation_priority_list.csv`

---

### PHASE 5: Figure Generation (Week 7-9)

**Main Figures** (4-6 figures):

**Figure 1: Study Overview**
- A) Workflow schematic (33 baits → AF3 → 512 interactions)
- B) Interaction network (baits + high-confidence preys)
- C) Confidence distribution (ipSAE histogram)

**Figure 2: Validation & Database Comparison**
- A) Venn diagram (Our predictions vs BioGRID vs STRING)
- B) Validation rates by confidence level (bar chart)
- C) ROC curve (experimental validation as ground truth)

**Figure 3: Network Topology & Hubs**
- A) Degree distribution (interactions per protein)
- B) Hub proteins (top 20 by degree)
- C) Bait-specific vs shared interactors

**Figure 4: Functional Enrichment**
- A) GO term heatmap (bait × enriched terms)
- B) Pathway network (enriched pathways)
- C) IFT-A vs IFT-B vs BBSome comparison

**Figure 5: Novel High-Confidence Predictions**
- A) Top 20 novel predictions (structure quality metrics)
- B) Example 3D structure (interface visualization)
- C) Supporting evidence (co-expression, localization)

**Figure 6: Disease Associations** (Optional)
- A) Ciliopathy gene network
- B) Disease-associated interactions
- C) Therapeutic target candidates

---

### PHASE 6: Manuscript Writing (Week 9-12)

**Writing Tasks**:
1. Results section (based on analysis outputs)
2. Methods section (pipeline documentation)
3. Discussion section (biological interpretation)
4. Introduction (background and rationale)
5. Abstract and title refinement

**Supplementary Materials**:
- Supplementary Tables (8-12 tables)
- Supplementary Figures (3-5 figures)
- Supplementary Methods
- Supplementary Data Files

---

## Key Comparisons with Reference Studies

### Our Study vs Genome-Wide AF3 Screens

| Aspect | Our Study | Genome-Wide Studies |
|--------|-----------|---------------------|
| **Screening Strategy** | Focused (ciliary proteins) | Broad (all proteins) |
| **Bait Proteins** | 33 (IFT/BBSome) | Hundreds to thousands |
| **Total Predictions** | 512 interactions | 16,000-1,600,000 |
| **AF Version** | AF3 (ipSAE scoring) | AF2/AF3 |
| **Biological Focus** | Ciliary trafficking | General interactome |
| **Validation** | Cilia-specific databases | General PPI databases |
| **Advantage** | Deep cilia coverage | Broad coverage |

### Validation Strategy

**Positive Controls** (Expected to find):
- Known IFT complex subunits (IFT-A, IFT-B)
- BBSome subunits
- Published cryo-EM structures (IFT-A, IFT-B, BBSome)

**Negative Controls** (Expected to exclude):
- Unrelated cytoplasmic proteins
- Proteins with incompatible localization

**Benchmarking Databases**:
1. **BioGRID**: Experimental PPIs (Y2H, Co-IP, MS)
2. **STRING**: Integrated evidence scores
3. **PDB**: Co-crystal structures
4. **Literature**: Published IFT/BBSome studies
5. **Cildb**: Known ciliary proteins

---

## Statistical Analyses

### 1. Validation Metrics
```
Precision = TP / (TP + FP)
Recall = TP / (TP + FN)
F1 Score = 2 × (Precision × Recall) / (Precision + Recall)
```

Where:
- TP = Our predictions found in BioGRID/STRING experimental
- FP = Our predictions NOT in databases (potential false positives OR novel true positives)
- FN = Known interactions we missed

### 2. Enrichment Statistics
- GO enrichment: Fisher's exact test, FDR correction (Benjamini-Hochberg)
- Pathway enrichment: Hypergeometric test, FDR < 0.05

### 3. Confidence Calibration
- ROC curve: True Positive Rate vs False Positive Rate
- Precision-Recall curve: Precision vs Recall at varying ipSAE thresholds
- Optimal cutoff: Youden's J statistic

### 4. Network Topology
- Degree distribution: Power-law fit
- Clustering coefficient: Transitivity measure
- Community detection: Louvain algorithm

---

## Data Availability Statement (Draft)

"All predicted protein-protein interactions, confidence scores, and validation data are available through an interactive web interface at https://ift-interactors.vercel.app. The complete dataset, including AlphaFold3 structure files (CIF format) and PAE contact maps (JSON), is deposited at Zenodo (DOI: to be assigned). Source code for analysis scripts is available at GitHub (https://github.com/essebesse/IFT_interactors). The PostgreSQL database dump is available at [Zenodo/FigShare]."

---

## Software & Tools Required

### Analysis Tools
- **Python 3.9+**: NumPy, Pandas, NetworkX, Matplotlib, Seaborn
- **Node.js**: Database queries, data exports
- **R** (optional): Advanced statistical plots

### External APIs
- **g:Profiler**: GO/pathway enrichment
- **UniProt REST API**: Protein annotations
- **PubMed E-utilities**: Literature mining
- **RCSB PDB API**: Structure queries

### Bioinformatics Databases
- BioGRID (version 4.4.x)
- STRING (version 12.0)
- PDB (current)
- OMIM (for disease associations)
- Cildb (ciliary proteins)

---

## Timeline Gantt Chart

```
Week 1-2:   [Dataset Stats]
Week 2-4:   [Database Comparisons] [Validation Metrics]
Week 4-6:   [Functional Analysis] [GO/Pathway]
Week 6-7:   [Novel Predictions] [Disease Associations]
Week 7-9:   [Figure Generation] [Data Visualization]
Week 9-12:  [Manuscript Writing] [Revisions]
```

---

## Success Metrics

**Minimum Viable Publication**:
- ✅ 512 high-quality predictions documented
- ✅ >20% validation rate in BioGRID/STRING
- ✅ >50 novel high-confidence predictions
- ✅ Functional enrichment supporting biological roles
- ✅ Interactive public resource

**Strong Publication** (target):
- 🎯 >30% validation rate
- 🎯 >100 novel predictions for experimental follow-up
- 🎯 Disease-associated interactions with clinical relevance
- 🎯 Comparison with published cryo-EM structures (RMSD analysis)
- 🎯 Experimental validation of 5-10 predictions (collaborations)

---

## Next Steps for Claude Code

**Immediate Tasks** (Start Today):
1. Run `analysis/01_dataset_statistics.mjs` → Generate summary statistics
2. Create exports: `supplementary_table_S1_all_interactions.csv`
3. Run `analysis/02_network_topology.py` → Calculate network metrics
4. Start BioGRID download and comparison script

**Output Directory Structure**:
```
IFT_interactors/
├── analysis/
│   ├── scripts/
│   │   ├── 01_dataset_statistics.mjs
│   │   ├── 02_network_topology.py
│   │   └── ... (15 total scripts)
│   └── results/
│       ├── dataset_overview.txt
│       ├── validation_metrics.json
│       └── ... (all analysis outputs)
├── figures/
│   ├── data/
│   └── final/ (publication-ready)
└── manuscript/
    ├── results_draft.md
    ├── methods_draft.md
    └── discussion_draft.md
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
**Status**: Ready for Phase 1 execution
