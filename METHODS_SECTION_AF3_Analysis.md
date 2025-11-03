# Methods Section: AlphaFold3 Interaction Analysis and Web Display

## AlphaFold3 Prediction Analysis

AlphaFold3 protein-protein interaction predictions were systematically analyzed using a custom Python pipeline (`AF3_PD_analysis_v4.py`) implementing the ipSAE (interface Predicted Aligned Error Structure-based Average Estimate) scoring metric described by Dunbrack (2025)[1].

### Quality Assessment Metrics

**ipSAE Score Calculation:** The ipSAE score was calculated for each protein pair as the maximum of two asymmetric scores (A→B and B→A) using Equations 14-16 from Dunbrack (2025). For each residue i in the aligned chain, a TM-score-like value was computed over residues j in the scored chain where PAE_ij < 10Å. The scaling factor d₀ was calculated as:

```
d₀ = 1.24 × (L - 15)^(1/3) - 1.8  (for L ≥ 27)
d₀ = 1.0                            (for L < 27)
```

where L is the number of residue pairs below the PAE cutoff. The per-residue score was computed as:

```
score_i = mean(1 / (1 + (PAE_ij / d₀)²))  for all j where PAE_ij < 10Å
```

The final ipSAE score was the maximum per-residue score across all alignment residues.

**Spatial Validation:** Predicted interfaces were validated structurally by calculating Cβ-Cβ distances (Cα for glycine) from mmCIF coordinate files. Only residue pairs with PAE < 6Å AND Cβ-Cβ distance ≤ 8Å were counted as interface contacts, ensuring both predicted and spatial proximity.

**Interface Quality Metrics:** For validated interface residues, we calculated:
- PAE contact counts at multiple thresholds (<3Å, <5Å, <6Å, <8Å, <12Å)
- Mean interface pLDDT (per-residue confidence) from atom-level pLDDT scores
- Interface residue count
- Overall iPTM (interface predicted TM-score) from AlphaFold3 output

### Confidence Classification

Predictions were classified into confidence tiers based on ipSAE scores (Dunbrack 2025):

- **High Confidence** (ipSAE > 0.7): Strong evidence of true interaction with virtually no false positives
- **Medium Confidence** (ipSAE 0.5-0.7): Likely genuine interactions with little overlap with non-interacting pairs
- **Low Confidence** (ipSAE 0.3-0.5): Weak signal requiring visual inspection
- **Very Low** (ipSAE < 0.3): Likely not an interaction, excluded from final dataset

Predictions with ipSAE < 0.3 were filtered out to minimize false positives, as recommended by Dunbrack (2025).

### Data Processing

For each AlphaFold3 prediction directory, the analysis pipeline:

1. Extracted confidence metrics from `*_summary_confidences*.json` files
2. Parsed full prediction data from `*_full_data_*.json` or `*_confidences.json` files
3. Calculated ipSAE scores from PAE matrices using the 10Å cutoff
4. Parsed mmCIF structure files to obtain atomic coordinates
5. Validated interfaces by combining PAE and spatial distance criteria
6. Computed interface-specific pLDDT statistics
7. Classified confidence levels and exported predictions with ipSAE ≥ 0.3

Output files included:
- `AF3_PD_analysis_v4.json`: Machine-readable data with all metrics
- `AF3_PD_analysis_v4_summary.txt`: Human-readable summary organized by confidence tier
- `AF3_PD_analysis_v4.xlsx`: Excel file with detailed results and statistics

## Database Construction

Analyzed predictions were imported into a PostgreSQL database (Neon) using Node.js import scripts. The database schema included:

**Proteins Table:** UniProt ID, gene name, organism (Homo sapiens), organism code (Hs)

**Interactions Table:** Bait-prey relationships with quality metrics:
- ipSAE score and confidence classification
- iPTM score
- Interface pLDDT (mean, min, max)
- PAE contact counts (<3Å, <6Å)
- AlphaFold version (AF3)
- Analysis version (v4)
- Source file path

**Protein Aliases Table:** Gene names and alternative identifiers fetched from UniProt API

### Data Curation

Only single-protein bait predictions (pairwise A-B format) were included; multi-protein complex predictions were excluded. Gene names were retrieved from UniProt REST API (https://rest.uniprot.org/uniprotkb/) with rate limiting (1 request/second). The final dataset comprised 512 unique interactions from 371 proteins across 33 bait proteins (22 IFT proteins, 10 BBSome proteins, and 1 IFT-associated protein TULP3).

## Interactive Web Visualization

An interactive web application was developed using Next.js 14 and React 18 to enable exploration of the interaction network.

### Frontend Implementation

**Network Visualization:** Force-directed graph layout using react-force-graph-2d (v1.25.5), with:
- Node colors: Color-coded by protein identity
- Edge colors: Confidence level (green = High, orange = Medium, red = Low)
- Edge thickness: Proportional to ipSAE score
- Interactive node selection: Click nodes to explore secondary interactions

**Data Display:** Bootstrap 5.3 responsive interface showing:
- Sortable results table with ipSAE scores (highest first)
- Confidence badges with color coding
- Detailed metrics (iPTM, interface pLDDT, PAE contacts)
- Protein aliases (e.g., WDR19 = IFT144, ARL6 = BBS3)
- CSV export functionality

**Search Capabilities:** Query by UniProt ID, gene name, protein alias, or organism prefix

### Backend Architecture

**Database:** Serverless PostgreSQL (Neon) with indexed queries on:
- Protein identifiers (uniprot_id, gene_name)
- Bait-prey relationships
- Confidence levels

**API Routes:** Next.js API routes (`/api/interactions/[id]`) serving JSON data with:
- Real-time confidence filtering (High/Medium/Low)
- Client-side sorting by ipSAE score
- Protein alias resolution via LEFT JOIN

**Deployment:** Vercel platform with automatic deployments from GitHub repository (https://github.com/essebesse/IFT_interactors.git)

The web application is publicly accessible and provides the complete dataset as a companion resource to this manuscript, enabling researchers to explore all predicted interactions beyond the high-confidence subset presented in the main figures.

## Software and Tools

- **AlphaFold3:** Protein structure prediction (Google DeepMind)
- **Python 3:** Analysis pipeline with NumPy 1.x, Pandas 1.x
- **Node.js 18+:** Database import scripts (@vercel/postgres 0.9.0)
- **Next.js 14.2:** Web application framework
- **PostgreSQL:** Relational database (Neon serverless)
- **React 18:** Interactive UI components
- **react-force-graph-2d 1.25.5:** Network visualization
- **Bootstrap 5.3:** Responsive styling

## Data Availability

- **Web Application:** https://[vercel-deployment-url]
- **Source Code:** https://github.com/essebesse/IFT_interactors
- **Raw Analysis Output:** Supplementary Data File 1 (AF3_PD_analysis_v4.json)
- **Interactive Dataset:** All 512 analyzed predictions available via web interface

---

## References

[1] Dunbrack RL Jr. "Rēs ipSAE loquunt: What's wrong with AlphaFold's ipTM score and how to fix it." bioRxiv 2025. doi: 10.1101/2025.02.10.637595

---

## Notes for Authors

**Key Points to Emphasize:**
1. ipSAE scoring provides more robust assessment than iPTM alone, especially for proteins with disordered regions
2. Dual validation (PAE + spatial distance) ensures high-quality interface predictions
3. Confidence-based filtering (ipSAE ≥ 0.3) minimizes false positives per Dunbrack (2025)
4. Complete dataset transparency via interactive web resource

**Figure Suggestions:**
- Fig. X: Schematic of analysis pipeline (AF3 → ipSAE calculation → validation → database → web display)
- Fig. X+1: Screenshot of web interface showing network visualization and data table
- Supplementary Fig.: ipSAE score distribution across confidence tiers

**Potential Reviewers' Questions:**
- Q: Why ipSAE instead of iPTM?
  A: ipSAE is more robust to disordered regions and has lower false positive rate (Dunbrack 2025)

- Q: What is the validation rate?
  A: Spatial validation (Cβ-Cβ ≤ 8Å) was possible for predictions with structure files; PAE-only analysis used otherwise

- Q: How were cutoffs chosen?
  A: ipSAE cutoffs from Dunbrack (2025) benchmarks; spatial cutoff (8Å) standard for protein interfaces
