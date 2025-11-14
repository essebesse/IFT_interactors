# Figure 1: Overview of IFT/BBSome Interactome Dataset

## Figure 1 Plan - Multi-panel figure showing dataset statistics and validation

---

## Panel A: Dataset Overview Statistics

**Type**: Bar chart or summary box

**Content**:
- Total interactions: 548
- Total unique proteins: 384
- Baits: 35 proteins
  - IFT-A: 6 proteins
  - IFT-B: 17 proteins
  - BBSome: 10 proteins
  - Associated: 2 proteins (TULP3, RABL2B)
- Confidence distribution:
  - High (ipSAE > 0.7): 20 (3.6%) - GREEN
  - Medium (ipSAE 0.5-0.7): 135 (24.6%) - ORANGE
  - Low (ipSAE 0.3-0.5): 393 (71.7%) - RED

**Visual suggestion**:
- Stacked bar chart showing confidence distribution
- Or pie chart with confidence categories color-coded

---

## Panel B: Interface Quality Metrics by Confidence Level

**Type**: Table or bar chart comparison

**Table Format** (as provided in text):

| Confidence | n   | Interface pLDDT | PAE Contacts <3Å | PAE Contacts <6Å |
|------------|-----|-----------------|------------------|------------------|
| High       | 20  | 86.8            | 72.4             | 107.7            |
| Medium     | 135 | 84.8            | 27.1             | 56.0             |
| Low        | 393 | 82.4            | 14.3             | 31.4             |

**Alternative visual**:
- Three-panel bar chart showing the gradient for each metric
- Emphasize the 5-fold enrichment in PAE contacts <3Å (72.4 vs 14.3)

**Key message**: "High-confidence predictions show 5× more high-precision contacts"

---

## Panel C: IFT/BBSome Complex Schematics with Retrieved Interactions

**Type**: Schematic diagram showing protein complex architecture

**Content structure**:

### IFT-B1 Core:
```
IFT88 ←→ IFT52 ←→ IFT46 ←→ IFT56 (ipSAE: 0.828) ⭐ HIGHEST
         ↕           ↕
      IFT70a/b      IFT27 ←→ IFT25
         ↕
      IFT74 ←→ IFT81 (low ipSAE but 680+ PAE contacts)
         ↕
       IFT22
```

### IFT-B2 Peripheral:
```
IFT172 ←→ IFT80 ←→ IFT38/CLUAP1 (ipSAE: 0.704/0.702) HIGH
          ↕
         TP73 (ipSAE: 0.699) ⭐ NOVEL CARGO
```

### IFT-A:
```
IFT144/WDR19 ←→ IFT140
      ↕
   IFT122 (central hub)
      ↕
IFT121/WDR35 ←→ IFT43
      ↕
IFT139/TTC21B
```

### BBSome:
```
BBS7 ←→ BBS2 (ipSAE: 0.759/0.758) HIGH
  ↕        ↕
BBS9     BBS8
  ↕
BBS1 ←→ BBS4 (ipSAE: 0.753/0.748) HIGH
  ↕
ARL6/BBS3 (ipSAE: 0.709) HIGH - membrane tether
```

### TULP3 (IFT-A Associated):
```
TULP3 ←→ IFT122 (ipSAE: 0.478) - cargo adaptor
  ↓
GLIS2 (ipSAE: 0.666) ⭐ VALIDATED CARGO
```

**Visual design**:
- Circles/ovals for proteins
- Lines connecting them colored by confidence (green/orange/red)
- Line thickness proportional to ipSAE
- Star symbols (⭐) for notable interactions
- Labels with ipSAE scores for key interactions

**Alternative layout**: Three separate boxes for IFT-B, IFT-A, and BBSome

---

## Panel D: IFT46-IFT56 Structure Detail (ipSAE = 0.828)

**Type**: 3D structure visualization from AlphaFold3 prediction

**Structure file available**:
- `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/A0AVF1_IFT56/AF3/a0avf1_and_q9nqc8/a0avf1_and_q9nqc8_model.cif`

**Visualization options**:

### Option 1: PAE Interface Highlighting
- Overall structure (ribbon diagram)
- Interface residues highlighted:
  - Yellow: PAE < 3Å (high precision)
  - Magenta: PAE 3-6Å (medium precision)
- Show both proteins in distinct colors (chain coloring)

### Option 2: Surface Representation
- Show binding interface as surface
- Color by PAE or pLDDT
- Rotate to show interface clearly

### Option 3: Two Views
- Left: Overall complex architecture
- Right: Zoomed interface with residues shown as sticks

**Key annotations**:
- Label IFT46 and IFT56
- Show ipSAE = 0.828
- Show PAE contacts: XX at <3Å, YY at <6Å
- Interface pLDDT: XX.X

**Why this structure?**:
1. Highest ipSAE score in dataset (0.828)
2. Novel structure not shown elsewhere (Wang et al. 2025 biochemistry, no structure)
3. Example of high-confidence prediction
4. Validates the approach

---

## Figure Legend (Draft)

**Figure 1. Overview of the IFT/BBSome Interactome Dataset**

**(A)** Dataset statistics showing distribution of 548 predicted interactions across confidence levels. High-confidence interactions (ipSAE > 0.7, green, n=20) represent 3.6% of predictions, medium-confidence (ipSAE 0.5-0.7, orange, n=135) represent 24.6%, and low-confidence (ipSAE 0.3-0.5, red, n=393) represent 71.7%.

**(B)** Interface quality metrics stratified by confidence level. High-confidence predictions show 5-fold enrichment in high-precision PAE contacts (<3Å) compared to low-confidence predictions (72.4 vs 14.3 contacts). Interface pLDDT scores remain consistently high across all categories (82-87), indicating well-structured interfaces.

**(C)** Schematic representation of retrieved intra-complex interactions within IFT-B1 core, IFT-B2 peripheral, IFT-A, and BBSome complexes. Lines connect interacting proteins and are colored by confidence level (green: high, orange: medium, red: low). Line thickness is proportional to ipSAE score. Notable interactions are marked with stars, including the highest-scoring IFT46-IFT56 interaction (ipSAE = 0.828) and validated cargo interactions (TULP3-GLIS2, IFT80-TP73).

**(D)** AlphaFold3-predicted structure of the IFT46-IFT56 complex (ipSAE = 0.828), the highest-confidence prediction in the dataset. Interface residues are highlighted by PAE precision: yellow represents very high-precision contacts (PAE < 3Å) and magenta represents high-precision contacts (PAE 3-6Å). This structure represents the first computational model of the IFT46-IFT56 peripheral heterodimer, validated by recent biochemical evidence (Wang et al., 2025).

---

## Production Notes

### To create this figure, you'll need:

1. **Panel A** - Can be made in R/Python/Excel from the numbers above

2. **Panel B** - Table can be formatted in Illustrator or directly from the data

3. **Panel C** - Can be drawn in:
   - BioRender (schematic diagrams)
   - Illustrator (manual drawing)
   - Cytoscape (if you want network layout)
   - PowerPoint (quick draft)

4. **Panel D** - 3D structure visualization:
   - Use PyMOL, ChimeraX, or Molstar
   - Load the CIF file: `a0avf1_and_q9nqc8_model.cif`
   - Use the PAE JSON to color interface residues
   - Export high-resolution image

### File locations for Panel D:
- CIF structure: `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/A0AVF1_IFT56/AF3/a0avf1_and_q9nqc8/a0avf1_and_q9nqc8_model.cif`
- PAE data: `/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/A0AVF1_IFT56/AF3/a0avf1_and_q9nqc8/a0avf1_and_q9nqc8_confidences.json`

### Alternative: Export from web app
- Go to https://ift-interactors.vercel.app
- Search for IFT56 or IFT46
- Click "View 3D"
- Toggle PAE highlighting
- Screenshot (may need to enhance resolution)

---

## Layout Suggestions

### Option 1: 2×2 Grid
```
┌─────────────┬─────────────┐
│      A      │      B      │
│  (Stats)    │  (Table)    │
├─────────────┴─────────────┤
│             C             │
│      (Schematic)          │
├───────────────────────────┤
│             D             │
│   (IFT46-IFT56 3D)       │
└───────────────────────────┘
```

### Option 2: Side Layout
```
┌──────────┬────────────────┐
│    A     │                │
│ (Stats)  │                │
├──────────┤       C        │
│    B     │  (Schematic)   │
│ (Table)  │                │
├──────────┴────────────────┤
│           D               │
│    (IFT46-IFT56 3D)      │
└───────────────────────────┘
```

---

## Next Steps

1. **Run analysis scripts** (CC) to get exact numbers for Panel B if not already done
2. **Create schematic** (Panel C) - I can help refine the layout
3. **Render 3D structure** (Panel D) - Need to visualize the CIF file
4. **Design in Illustrator** - Assemble all panels with consistent fonts/colors

Let me know which panel you want to work on first!
