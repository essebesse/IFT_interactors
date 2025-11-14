# Figure Legends

## Main Figures

### Figure 1. Dataset Overview and Prediction Quality Metrics

**A. Confidence Distribution.** Bar chart showing the distribution of 548 predicted interactions across confidence levels. High confidence (ipSAE >0.7, green): 20 interactions (3.6%); Medium confidence (ipSAE 0.5-0.7, orange): 135 interactions (24.6%); Low confidence (ipSAE <0.5, red): 393 interactions (71.7%). Numbers above bars indicate count and percentage.

**B. Correlation Between ipSAE and Interface Quality.** Scatter plot showing the relationship between ipSAE scores (x-axis) and high-precision PAE contacts <3Å (y-axis) for all 548 predictions. Points are colored by confidence level: High (green), Medium (orange), Low (red). Black dashed line shows linear regression fit (Pearson r = 0.44, p < 0.001). Vertical gray dashed lines indicate confidence thresholds at ipSAE 0.5 and 0.7. High-confidence predictions show 5-fold higher interface contact density (72.4 contacts) compared to low-confidence predictions (14.3 contacts).

**C. Interface Quality Metrics by Confidence Level.** Box plots showing the distribution of three structural quality metrics across confidence levels: (i) Interface pLDDT (predicted local Distance Difference Test), (ii) High-precision PAE contacts (<3Å), and (iii) iPTM (interface predicted Template Modeling score). Boxes show interquartile range with median line; whiskers extend to 1.5× IQR. High-confidence predictions exhibit superior quality across all metrics.

---

### Figure 2. Experimental Validation Analysis

**A. BioGRID Validation Rates by Confidence Level.** Bar chart showing the percentage of predictions validated by BioGRID experimental data for each confidence level. High confidence: 75.0% (15/20); Medium: 25.2% (34/135); Low: 6.9% (27/393). Gray dashed line highlights the exceptional 75% validation rate for high-confidence predictions. Numbers on bars show validation rate and fraction (validated/total).

**B. Venn Diagram of Experimental Validation Sources.** (To be generated) Overlap between predictions validated by BioGRID experimental data (76 interactions), literature-curated validations (71 interactions), and novel predictions (472 interactions).

---

### Figure 3. Network Topology and Hub Proteins

**A. Protein-Protein Interaction Network.** (Generated from network_data.graphml in Cytoscape) Network visualization of all 548 predicted interactions. Nodes represent proteins (n=384), sized by degree (number of interactions). Edges represent predicted interactions, colored by confidence: High (green), Medium (orange), Low (red). Edge thickness proportional to ipSAE score. Layout: force-directed (Fruchterman-Reingold). TULP3 emerges as super-hub with 74 interactions and central position.

**B. Hub Protein Rankings.** Bar chart of top 20 hub proteins ranked by total degree (number of interactions). Bars are stacked showing interactions as bait (darker) vs as prey (lighter). TULP3 dominates with 74 interactions, followed by BBS5 (41), IFT43 (36), and IFT56 (35). Total counts labeled at bar ends.

**C. Network Metrics by Confidence Level.** (Optional) Summary table or panel showing network topology metrics for full network and confidence-stratified subnetworks, including density, clustering coefficient, connected components, and hub proteins.

---

### Figure 4. Structural Examples of High-Confidence Predictions

**(To be generated - use Molstar screenshots from website)**

**A. IFT46-IFT56 Interaction** (ipSAE: 0.828, BioGRID validated). AlphaFold3 predicted structure showing IFT46 (blue) and IFT56 (orange) interface. Left: full structure with predicted aligned error (PAE) overlay. Right: interface zoom showing 274 high-precision contacts (<3Å PAE, colored yellow).

**B. BBS7-BBS2 Interaction** (ipSAE: 0.759, BioGRID validated). BBSome core interaction showing BBS7 (green) and BBS2 (purple) interface with 61 high-precision contacts.

**C. BBS18-BBS8 Novel Interaction** (ipSAE: 0.771, novel prediction). High-confidence novel interaction between BBSome assembly factor BBS18/BBIP1 (cyan) and core component BBS8 (magenta) showing well-structured interface with 61 contacts.

---

## Supplementary Figures

### Supplementary Figure S1. Interactions per Bait Protein

Horizontal stacked bar chart showing interaction counts for all 35 bait proteins, ranked by total interactions. Bars are stacked by confidence level: High (green), Medium (orange), Low (red). TULP3 shows highest count (73), while BBS17, IFT81 show lowest (3). Numbers at bar ends indicate total interactions. Reveals functional heterogeneity and suggests TULP3's expanded role as cargo adapter.

---

### Supplementary Figure S2. BioGRID Validation Details

**(To be generated)**

**A. Top Validated Interactions.** Table showing the 20 highest-scoring predictions that were independently validated in BioGRID, with ipSAE scores, number of BioGRID detections, and experimental methods.

**B. Experimental Methods Distribution.** Pie chart showing distribution of experimental methods for BioGRID-validated interactions: Affinity Capture-MS, Yeast Two-Hybrid, Co-IP, Reconstituted Complex, etc.

---

### Supplementary Figure S3. Novel High-Confidence Predictions

**(To be generated)**

Table or figure panel highlighting the 5 novel high-confidence predictions (ipSAE >0.7) not present in BioGRID:
- BBS18-BBS8 (0.771)
- BBS18-ARL6 (0.760)
- Plus 3 additional novel predictions with structural and functional annotations

---

### Supplementary Figure S4. Network Topology Metrics

**(Optional - can be integrated into main Figure 3C)**

Panel showing:
- **A.** Degree distribution histogram (log-log plot showing power-law-like distribution)
- **B.** Betweenness centrality rankings (top 20 proteins)
- **C.** Connected components visualization for high/medium/low confidence networks
- **D.** Clustering coefficient distribution

---

## Supplementary Tables

### Supplementary Table S1. Complete Interaction Dataset
CSV file: `analysis/results/supplementary_table_S1_all_interactions.csv`
- All 548 predicted interactions with full metrics
- Columns: Bait UniProt ID, Bait Gene Name, Prey UniProt ID, Prey Gene Name, ipSAE, iPTM, Interface pLDDT, PAE Contacts <3Å, PAE Contacts <6Å, Confidence Level, AlphaFold Version, Analysis Version, Source Path

### Supplementary Table S2. Protein List with Network Statistics
CSV file: `analysis/results/supplementary_table_S2_proteins.csv`
- All 384 proteins in the network
- Columns: UniProt ID, Gene Name, Organism, Total Degree, As Bait Count, As Prey Count, Betweenness Centrality

### Supplementary Table S3. BioGRID Validated Interactions
CSV file: `analysis/results/biogrid_validated_interactions.csv`
- 76 interactions validated by BioGRID experimental data
- Columns: Bait, Prey, ipSAE, Confidence, BioGRID Detection Count, Experimental Methods

### Supplementary Table S4. Novel High-Confidence Predictions
CSV file: `analysis/results/biogrid_novel_predictions.csv` (filtered for High confidence)
- 5 novel high-confidence predictions not in BioGRID
- Prioritized candidates for experimental validation
- Columns: Bait, Prey, ipSAE, Interface Metrics, Biological Annotations

### Supplementary Table S5. Hub Proteins
CSV file: `analysis/results/hub_proteins.csv`
- Top 20 hub proteins by degree
- Columns: Protein, Total Degree, As Bait, As Prey

---

## Data Files

### Supplementary Data File 1. Complete Dataset Package
Excel file: `Supplementary_Data_File_1_Complete_Dataset.xlsx` (568 KB)
JSON file: `Supplementary_Data_File_1_Complete_Dataset.json` (607 KB)

**Contents:**
- **Sheet 1: README** - Dataset description, methods, citations, confidence thresholds
- **Sheet 2: All_Interactions** - 548 interactions with full metrics
- **Sheet 3: Proteins** - 384 proteins with network statistics
- **Sheet 4: Candidates** - 1,536 prey candidates screened
- **Sheet 5: Experimental_Validation** - 71 literature-curated validations

---

## Network Data for Visualization

### Network File: network_data.graphml (97 KB)
- GraphML format for import into Cytoscape, Gephi, or igraph
- Nodes: 384 proteins with attributes (degree, betweenness)
- Edges: 548 interactions with attributes (ipSAE, confidence, PAE contacts)
- Use for Figure 3A generation

---

**Figure File Naming Convention:**
- Main figures: `figure#_panel_X.png/pdf` (300 dpi PNG + vector PDF)
- Supplementary figures: `figure_supp_description.png/pdf`
- All files in: `figures/data/`

**Available Figures:**
✅ figure1_panel_a.png/pdf (Confidence distribution)
✅ figure1_panel_b_scatter.png/pdf (ipSAE vs PAE contacts)
✅ figure1_panel_c_boxplots.png/pdf (Interface quality metrics)
✅ figure2_validation.png/pdf (BioGRID validation rates)
✅ figure_supp_per_bait.png/pdf (Interactions per bait)
✅ network_data.graphml (For Figure 3 generation in Cytoscape)

**To Generate:**
- Figure 3A: Import network_data.graphml to Cytoscape
- Figure 4: Screenshot structures from https://ift-interactors.vercel.app
