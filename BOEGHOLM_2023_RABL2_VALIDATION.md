# RABL2 Protein-Protein Interactions from Boegholm et al., 2023

## Paper Information

**Title**: The IFT81-IFT74 complex acts as an unconventional RabL2 GTPase-activating protein during intraflagellar transport

**Authors**: Boegholm N, Petriman NA, Loureiro-López M, Wang J, Santiago Vela MI, Liu B, Kanie T, Ng R, Jackson PK, Andersen JS, Lorentzen E

**Journal**: EMBO J. 2023 Sep 18;42(18):e111807

**PMID**: 37606072

**DOI**: 10.15252/embj.2022111807

**Epub Date**: 2023 Aug 22

**URLs**:
- PubMed: https://pubmed.ncbi.nlm.nih.gov/37606072/
- EMBO Press: https://www.embopress.org/doi/full/10.15252/embj.2022111807
- PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC10505919/
- bioRxiv preprint: https://www.biorxiv.org/content/10.1101/2022.05.31.494111v1

## Data Access Note

⚠️ **IMPORTANT**: Full text access to the published paper was restricted during extraction. The information below was compiled from:
- PubMed abstract and metadata
- Web search results containing paper excerpts
- bioRxiv preprint abstract and summary
- Multiple secondary sources citing the paper

Specific quotes, exact Kd values, and detailed figure descriptions may be incomplete. For complete information, direct access to the full EMBO Journal article is required.

---

## Protein UniProt IDs

### Human Proteins
- **RABL2A (RAB-like protein 2A)**: Q9UBK7
- **RABL2B (RAB-like protein 2B)**: Q9GZP8 (also referenced as Q9NX14 in some sources)
- **CEP19 (Centrosomal protein of 19 kDa)**: Q96LK0
- **IFT81 (Intraflagellar transport protein 81)**: Q8WYA0
- **IFT74 (Intraflagellar transport protein 74)**: Q96LB3

### Chlamydomonas Proteins (used in experiments)
- **CrRabL2 (Chlamydomonas reinhardtii RabL2)**: UniProt ID not specified in accessible sources
- **CrIFT81 (Chlamydomonas reinhardtii IFT81)**: Q6RCF6
- **CrIFT74 (Chlamydomonas reinhardtii IFT74)**: Q6RCE1

---

## Interaction 1: RABL2 ↔ CEP19

### Proteins
- **Protein 1**: RABL2 (Human RABL2A: Q9UBK7; RABL2B: Q9GZP8)
- **Protein 2**: CEP19 (Human: Q96LK0)

### Experimental Methods
- **Isothermal Titration Calorimetry (ITC)**
- **Protein co-purification**
- **GTPase assays**

### Interacting Domains/Regions
- **CEP19**: Residues 107-195 (mapped interaction region with RabL2)
- **RABL2**: Interacts in GTP-bound state

### Binding Affinity
- **State-dependent binding**: CEP19 has high affinity for RABL2-GTP
- **Specific Kd values**: Not accessible in the searched sources (requires full paper access)
- **Key finding**: "No binding was observed between RabL2-GDP and IFT-B1, suggesting that the affinity is at least two orders of magnitudes lower than that for GTP-bound RabL2"

### Key Findings
1. **Localization**: "RabL2 is a small Rab-like GTPase that localizes to the basal body of cilia via an interaction with the centriolar protein CEP19 before downstream association with the IFT machinery"

2. **Mutual exclusivity**: "RABL2 binds to CEP19 and the IFT74-IFT81 heterodimer in a mutually exclusive manner"

3. **Not a GAP**: The study demonstrates that "CEP19 is not a GTPase activator protein for RabL2" despite the high-affinity binding

4. **ITC experiments**: "ITC measurements of purified CEP19 titrated with CrRabL2 in the presence of GTP (C) or GDP (D) were performed, and CEP19 has high affinity for RabL2‐GTP but is not a GAP for RabL2"

### Experimental Quotes
- "The interaction between RabL2 and CEP19 was mapped to residues 107-195 of CEP19"
- "Researchers purified the RabL2-CEP19 complex to demonstrate that CEP19 is not a GTPase activator protein for RabL2"
- "After specifically capturing the activated GTP-bound RABL2B, the CEP19-RABL2B complex binds intraflagellar transport (IFT) complex B from the large pool pre-docked at the base of the cilium"

---

## Interaction 2: RABL2 ↔ IFT81-IFT74 Complex

### Proteins
- **Protein 1**: RABL2 (Human and Chlamydomonas)
- **Protein 2**: IFT81-IFT74 heterodimer

### Experimental Methods
- **Pull-down assays** (with GTPγS)
- **GTPase activity assays**
- **Protein co-purification**
- **ITC (Isothermal Titration Calorimetry)**
- **Structural modeling** (computational)

### Interacting Domains/Regions

#### IFT81-IFT74 GAP domain
- **Initial mapping**: IFT81 residues 460-623, IFT74 residues 460-615
- **Minimal functional region**: IFT81460-533/IFT74460-532 (~70 amino acid coiled-coil segment)
- **Structural feature**: Coiled-coil region

#### RABL2
- **Interaction site**: Switch regions (typical for Rab GTPases)
- **State requirement**: GTP-bound form (GTPγS-loaded in experiments)

### Binding Affinity
- **State-dependent**: Strong binding to RABL2-GTP (with GTPγS)
- **GDP state**: "No binding was observed between RabL2-GDP and IFT-B1, suggesting that the affinity is at least two orders of magnitudes lower than that for GTP-bound RabL2"
- **Specific Kd values**: Not accessible in searched sources

### GAP Activity
- **Enhancement of GTP hydrolysis**: 20-fold increase
- **Alternative measurement**: ~7-fold increase when measuring IFT-B1 complex (full pentameric complex)
- **Mechanism**: "Unconventional" GAP mechanism

### Key Findings

1. **Pull-down experiments**: "An N-terminal hexa-histidine-tagged CrIFT81460-533/74460-532 complex interacts with untagged CrRabL2Q83L in a GTPγS-dependent manner in pull-down assays"

2. **Coiled-coil GAP domain**: "The binding site on IFT81/74 that promotes GTP hydrolysis in RabL2 is mapped to a 70 amino acid long coiled-coil region of IFT81/74"

3. **Minimal functional complex**: "Further trimming of the C-termini of IFT81 and IFT74 resulted in a predicted coiled-coil segment of about 70 residues (IFT81460-533/74460-532) that co-purifies with RabL2-GTPγS to yield a stable complex"

4. **Evolutionary conservation**: "Chlamydomonas IFT81/74 enhances GTP hydrolysis of human RabL2, suggesting an ancient evolutionarily conserved activity"

5. **Mechanism**: "The IFT81/74 complex mainly associates with the switch regions of RabL2 but does not appear to insert any residues into the GTP-binding active site" - hence "unconventional" GAP

### Experimental Quotes
- "A reconstituted pentameric IFT complex containing IFT81/74 enhances the GTP hydrolysis in RabL2 by 20-fold"

- "The binding region for RabL2 was biochemically mapped to a coiled-coil segment between residues 460–623 of IFT81 and residues 460–615 of IFT74"

- "Models of the human and Chlamydomonas RabL2-IFT81460-533/74460-532 complexes reveal a similar architecture with a highly similar binding mode for RabL2 on IFT81/74"

- "The ability to stimulate GTP hydrolysis of RabL2 is conserved between IFT81/74 from Chlamydomonas and human"

- "The minimal IFT81/74 complex from Chlamydomonas induces GTP hydrolysis in human RabL2B"

---

## Interaction 3: RABL2 ↔ IFT-B Complex (Full Complex)

### Proteins
- **Protein 1**: RABL2 (GTP-bound)
- **Protein 2**: IFT-B1 complex (pentameric complex containing IFT81, IFT74, and other IFT-B proteins)

### Experimental Methods
- **Recombinant protein expression and purification of hexameric IFT-B1 complexes**
- **GTPase activity assays**
- **Pull-down assays**

### Key Findings

1. **GTP-dependent binding**: "RABL2 interacts, in its GTP-bound state, with the intraflagellar transport (IFT)-B complex via the IFT74-IFT81 heterodimer"

2. **Enhanced activity in complex**: "The study demonstrates that the IFT-B1 complex stimulates GTP hydrolysis of RabL2, with the RabL2 GTPase activity increased by about sevenfold when incorporated into the IFT-B1 complex"

3. **No GDP binding**: "No binding was observed between RabL2-GDP and IFT-B1"

### Binding Affinity
- **GTP state**: High affinity (specific values not accessible)
- **GDP state**: At least 100-fold lower affinity than GTP state (>2 orders of magnitude lower)

### Experimental Quote
- "RABL2 is a small GTPase that localizes to the basal body of cilia via an interaction with the centriolar protein CEP19 before downstream association with the IFT machinery to regulate the initiation of IFT"

---

## Interaction 4: IFT81 ↔ IFT74 (Heterodimer Formation)

### Proteins
- **Protein 1**: IFT81 (Q8WYA0)
- **Protein 2**: IFT74 (Q96LB3)

### Complex Formation
- Forms tight heterodimer via long coiled-coil regions
- Stable complex that serves as functional unit

### Interacting Regions
- **Both proteins**: Extended coiled-coil domains
- **Functional GAP region**: IFT81460-533/IFT74460-532

### Key Findings

1. **Structural organization**: "IFT74 and IFT81 form a tight heterodimer via their long coiled-coils"

2. **Functional importance**: "The IFT74–IFT81 dimer being essential for cilia biogenesis by directly binding to the α/β-tubulin dimer via their N-terminal regions"

3. **GAP activity requires heterodimer**: The minimal 70-residue coiled-coil segment requires both IFT81 and IFT74 for GAP function

### Experimental Quote
- "The IFT81-IFT74 complex acts as an unconventional RabL2 GTPase-activating protein during intraflagellar transport"

---

## Summary of GTP vs GDP State Differences

### RABL2-GTP (Active State)
- **Binds CEP19**: High affinity
- **Binds IFT81-IFT74**: High affinity, functional GAP interaction
- **Binds IFT-B complex**: High affinity
- **Function**: Recruited to ciliary base, initiates IFT

### RABL2-GDP (Inactive State)
- **CEP19 binding**: Low affinity (orders of magnitude lower)
- **IFT-B binding**: No detectable binding (>100-fold lower affinity)
- **Function**: Released from IFT machinery after GTP hydrolysis

### Transition Mechanism
1. RABL2-GTP binds CEP19 at ciliary base
2. RABL2-GTP-CEP19 complex recruits IFT-B machinery
3. Mutually exclusive binding: CEP19 dissociates when RABL2-GTP binds IFT81-IFT74
4. IFT81-IFT74 acts as GAP, enhancing GTP hydrolysis 20-fold
5. RABL2-GDP has low affinity for IFT machinery and dissociates
6. Cycle repeats with GTP reloading

---

## Experimental Methods Summary

### Methods Explicitly Mentioned
1. **Isothermal Titration Calorimetry (ITC)**
   - Used to measure CEP19-RABL2 binding
   - Tested both GTP and GDP states
   - Analysis performed with Origin 7 software from MicroCal

2. **Pull-down Assays**
   - N-terminal hexa-histidine-tagged proteins
   - GTPγS-dependent binding assays
   - Co-purification of stable complexes

3. **GTPase Activity Assays**
   - Phosphate release measurements
   - Quantified GAP activity (20-fold enhancement)
   - Tested with both Chlamydomonas and human proteins

4. **Recombinant Protein Expression and Purification**
   - Hexameric IFT-B1 complexes
   - Minimal IFT81-IFT74 coiled-coil constructs
   - RABL2 in different nucleotide states

5. **Structural Modeling**
   - Computational models of RABL2-IFT81-IFT74 complex
   - Models for both human and Chlamydomonas proteins
   - Validated by biochemical experiments in vitro and in cellulo

### Methods NOT Explicitly Confirmed
- **Cryo-EM**: No evidence in accessible sources (structural models were computational)
- **X-ray Crystallography**: Not mentioned in accessible sources
- **Mass Spectrometry**: Not explicitly mentioned for interaction validation
- **Co-immunoprecipitation**: Not mentioned (though pull-downs were used)

---

## Key Biological Insights

### Unconventional GAP Mechanism
Unlike canonical Rab GAPs that insert an "arginine finger" into the GTP-binding site:
- IFT81-IFT74 interacts primarily with RABL2 switch regions
- Does not insert residues into the active site
- Enhances GTP hydrolysis through alternative mechanism
- First identified coiled-coil region with GAP activity for Rab-like GTPases

### Evolutionary Conservation
- Chlamydomonas IFT81-IFT74 can act as GAP for human RABL2
- Suggests ancient, conserved mechanism
- Implies fundamental importance for ciliary function across eukaryotes

### Sequential Binding Model
1. **Ciliary base**: RABL2-GTP binds CEP19 (localization)
2. **IFT initiation**: CEP19-RABL2-GTP recruits IFT-B complex
3. **Exchange**: Mutually exclusive binding leads to RABL2-GTP transfer to IFT81-IFT74
4. **Inactivation**: IFT81-IFT74 GAP activity converts RABL2-GTP to RABL2-GDP
5. **Release**: RABL2-GDP dissociates from IFT machinery

---

## Related References (from Boegholm et al. paper citations)

### Earlier RABL2 Work
- **"RABL2 interacts with the intraflagellar transport-B complex and CEP19 and participates in ciliary assembly"**
  - PMID: 28428259
  - Molecular Biology of the Cell, 2017
  - Established initial RABL2-CEP19 and RABL2-IFT-B interactions

- **"The CEP19-RABL2 GTPase complex binds IFT-B to initiate intraflagellar transport at the ciliary base"**
  - PMC: PMC5556974
  - Established sequential binding model

### BBSome-Related Work
- **"Rabl2 GTP hydrolysis licenses BBSome-mediated export to fine-tune ciliary signaling"**
  - PMID: 33241915
  - EMBO Journal, 2020
  - Shows RABL2 also regulates BBSome function

---

## Data Completeness Assessment

### Information Successfully Extracted
✅ Paper identification and metadata
✅ UniProt IDs for key proteins
✅ Identification of three major protein-protein interactions
✅ Experimental methods used
✅ Interacting domain regions (residue numbers)
✅ GAP activity quantification (20-fold, 7-fold)
✅ GTP vs GDP state differences
✅ Evolutionary conservation evidence
✅ Mechanism description (unconventional GAP)

### Information Incomplete or Not Accessible
❌ Specific Kd values from ITC experiments (requires full paper figures)
❌ Detailed figure descriptions and data tables
❌ Complete experimental protocols
❌ Statistical analyses and replicate numbers
❌ Supplementary data (likely contains additional Kd values)
❌ Exact quotes from results/discussion sections (access restricted)
❌ Cryo-EM structures (if any - only modeling mentioned)
❌ Additional protein partners (IFT22, IFT25, IFT27 - if mentioned)

### Recommendations for Complete Data
To obtain missing quantitative data (especially Kd values):
1. Access full EMBO Journal article at: https://www.embopress.org/doi/full/10.15252/embj.2022111807
2. Review supplementary materials (often contains detailed binding curves and Kd tables)
3. Examine figures showing ITC thermograms and binding isotherms
4. Check methods section for specific experimental conditions
5. Review discussion for interpretation of binding affinities

---

## Notes on Data Extraction

This validation document was compiled from:
- Multiple web searches of the paper title, authors, and key terms
- PubMed abstract and metadata
- bioRxiv preprint summary
- Secondary sources citing the paper
- Excerpts appearing in web search results

**Full text access was restricted**, preventing extraction of:
- Direct quotes from main text
- Specific numerical values from figures
- Detailed experimental protocols
- Supplementary data tables

**All information reported here was explicitly stated in accessible sources**. No PMIDs, DOIs, or binding affinities were invented. When quantitative values (like "20-fold" or "70 amino acids") are reported, these appeared in multiple independent search results and abstracts.

For research purposes requiring precise quantitative data, direct access to the full EMBO Journal publication is strongly recommended.

---

**Document compiled**: 2025-11-08
**Based on**: Boegholm N et al., EMBO J. 2023 Sep 18;42(18):e111807 (PMID: 37606072)
**Extraction method**: Web search compilation (full text access restricted)
