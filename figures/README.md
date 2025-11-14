# Figure Generation for IFT/BBSome Interactome Publication

This directory contains plans and scripts for creating publication figures.

## Directory Structure

```
figures/
├── README.md                    # This file
├── FIGURE_1_PLAN.md            # Detailed plan for Figure 1
├── create_figure1_data.py      # Script to generate Figure 1 data files
└── data/                       # Output data files (generated)
```

## Quick Start

### Generate Figure 1 Data

```bash
# Set database connection
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# Run script
python figures/create_figure1_data.py
```

**Outputs**:
- `data/panel_a_confidence_distribution.csv` - For bar/pie chart
- `data/panel_b_interface_metrics.csv` - Table with ipSAE, pLDDT, PAE contacts
- `data/panel_c_intra_complex_interactions.csv` - For complex schematic
- `data/panel_d_ift46_ift56_info.json` - Structure file paths and metrics

## Figure 1: Dataset Overview

See `FIGURE_1_PLAN.md` for detailed specifications.

**Panels**:
- **A**: Confidence distribution statistics (548 interactions, 3.6% high confidence)
- **B**: Interface quality metrics table (5× enrichment in PAE contacts)
- **C**: IFT/BBSome complex schematic showing intra-complex interactions
- **D**: IFT46-IFT56 structure (ipSAE = 0.828, highest in dataset)

## Creating the Figure

### Panel A & B: Use Python/R for plots

```python
import pandas as pd
import matplotlib.pyplot as plt

# Panel A: Confidence distribution
df = pd.read_csv('figures/data/panel_a_confidence_distribution.csv')
plt.bar(df['ipsae_confidence'], df['count'], color=df['color'])
plt.xlabel('Confidence Level')
plt.ylabel('Number of Interactions')
plt.title('Interaction Confidence Distribution')
plt.savefig('figures/panel_a.png', dpi=300)
```

### Panel C: Use BioRender or Illustrator

1. Load `panel_c_intra_complex_interactions.csv`
2. Draw protein shapes for each complex
3. Connect interactions with lines colored by confidence
4. Reference the schematic in `FIGURE_1_PLAN.md`

### Panel D: Visualize 3D Structure

**Option 1: PyMOL**
```bash
pymol /emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/A0AVF1_IFT56/AF3/a0avf1_and_q9nqc8/a0avf1_and_q9nqc8_model.cif
```

**Option 2: ChimeraX**
```bash
chimerax /emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/A0AVF1_IFT56/AF3/a0avf1_and_q9nqc8/a0avf1_and_q9nqc8_model.cif
```

**Option 3: Web App Screenshot**
1. Go to https://ift-interactors.vercel.app
2. Search "IFT56" or "IFT46"
3. Click "View 3D"
4. Toggle PAE highlighting
5. Screenshot in fullscreen mode

## Other Planned Figures

### Figure 2: Validation & Database Comparison
- Venn diagrams (BioGRID, STRING overlap)
- Validation rates by confidence
- ROC/PR curves

### Figure 3: Network Topology
- Hub proteins
- Community structure
- Degree distribution

### Figure 4: Functional Enrichment
- GO term heatmap
- Pathway network

### Figure 5: Novel Predictions
- Top candidates
- 3D structure examples
- Supporting evidence

See `../PUBLICATION_ANALYSIS_PLAN.md` for complete figure planning.

## Tips

### High-Resolution Export

- **Raster (PNG/JPG)**: 300-600 DPI for publication
- **Vector (SVG/PDF)**: Preferred for line art and schematics
- **3D structures**: 2000-4000 px width for print quality

### Color Scheme

Consistent colors throughout:
- **High confidence**: Green (#28a745)
- **Medium confidence**: Orange (#fd7e14)
- **Low confidence**: Red (#dc3545)

### Fonts

- **Sans-serif**: Arial, Helvetica (clean, modern)
- **Size**: 8-12 pt for labels, 6-8 pt for annotations
- **Consistency**: Use same font family across all panels

## Assembly

Use Adobe Illustrator, Inkscape, or similar to:
1. Import all panels
2. Align with consistent spacing
3. Add panel labels (A, B, C, D)
4. Add scale bars where appropriate
5. Export as high-res TIFF or PDF for submission

## Questions?

See detailed specifications in `FIGURE_1_PLAN.md` or contact the analysis team.
