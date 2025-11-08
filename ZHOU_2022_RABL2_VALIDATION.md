# Zhou et al. 2022 - CEP19-RABL2-IFT-B Axis and BBSome Export Validation

## Paper Details

**Title**: CEP19-RABL2-IFT-B axis controls BBSome-mediated ciliary GPCR export

**Authors**: Zhou Z, Katoh Y, Nakayama K

**Journal**: Molecular Biology of the Cell, 2022 Nov 1;33(13):ar126

**PMID**: 36074075

**DOI**: 10.1091/mbc.E22-05-0161

**Lab**: Nakayama Lab (Kyoto University, Japan)

---

## ⚠️ DATA LIMITATION WARNING

**CRITICAL**: This validation document is based on **limited information** from:
- PubMed abstract
- Search result snippets
- Related paper citations

**FULL TEXT ACCESS WAS BLOCKED** during extraction (403 errors on PMC, journal website, and all alternative sources).

**Recommendation**: This document should be updated with complete information when full paper access becomes available. Missing data includes:
- Detailed experimental methods
- Complete protein-protein interaction data
- Verbatim quotes from results section
- Supplementary figures and data
- Specific residues involved in interactions
- Quantitative binding data

---

## Key Findings from Abstract

### Central Hypothesis
The CEP19-RABL2-IFT-B axis controls BBSome-mediated export of GPCRs from cilia. GTP-bound RABL2 must be replaced by IFT25-IFT27 at the ciliary base for proper BBSome function.

### Main Discovery (⚠️ CORRECTED BY BOEGHOLM 2023)
**Original claim**: IFT25-IFT27 and RABL2 bind to the IFT74-IFT81 dimer in a MUTUALLY EXCLUSIVE manner.

**⚠️ CORRECTION (Boegholm et al., EMBO J 2023, PMID: 37606072)**:
**RABL2 and IFT25-IFT27 bind to SEPARATE, NON-OVERLAPPING sites on IFT74-IFT81.**
- RABL2 binds to C-terminal coiled-coil region (IFT81460-533/IFT74460-532)
- IFT25-IFT27 binds to a different region
- They are NOT mutually exclusive
- The functional phenotypes observed may result from other mechanisms, not competitive binding

---

## Protein-Protein Interactions Extracted (LIMITED DATA)

### 1. RABL2(GTP) ↔ IFT74-IFT81 Complex (⚠️ CORRECTED)

**Method**: Not specified in accessible material (likely co-IP, pulldown, possibly structural)

**Confidence**: High (based on functional data)

**Interface Description**:
- **RABL2 region**: Binds to C-terminal coiled-coil (IFT81460-533/IFT74460-532) per Boegholm 2023
- **IFT74-IFT81 region**: C-terminal coiled-coil domain
- **Nature**: GTP-dependent; **SEPARATE from IFT25-IFT27 binding site (NOT mutually exclusive)**

**⚠️ Original quote from Zhou 2022** (INCORRECT per Boegholm 2023): "IFT25-IFT27 and the RABL2 GTPase bind the IFT74/BBS22-IFT81 dimer of the IFT-B complex in a mutually exclusive manner."

**⚠️ Correction from Boegholm 2023**: RABL2 and IFT25-IFT27 bind to completely separate sites on IFT74-IFT81. They are NOT mutually exclusive.

**Functional significance**:
- GTP-bound RABL2 recruits IFT-B complex to ciliary base
- The functional defects from GTP-locked RABL2(Q80L) are NOT due to competitive binding with IFT25-IFT27
- Mechanism may involve IFT81-IFT74 acting as GAP to release RABL2 (Boegholm 2023)

**Human UniProt IDs**:
- RABL2: Q9GZN8 (RABL2A) or Q3YEC7 (RABL2B) - **NEEDS VERIFICATION**
- IFT74: Q96LB3
- IFT81: Q8WYA0

---

### 2. IFT25-IFT27 ↔ IFT74-IFT81 Complex (⚠️ CORRECTED - NOT mutually exclusive with RABL2)

**Method**: Not specified in accessible material

**Confidence**: High (based on functional data)

**Interface Description**:
- **IFT25-IFT27**: Heterodimer (known from prior studies)
- **IFT74-IFT81 region**: Binds to region SEPARATE from RABL2 binding site (Boegholm 2023)
- **Nature**: **NOT mutually exclusive with RABL2 binding**

**⚠️ Original quote from Zhou 2022** (INCORRECT): "RABL2(Q80L) and IFT25-IFT27 appear to bind to partially overlapping regions of the IFT74-IFT81 dimer."

**⚠️ Correction from Boegholm 2023**: These are two completely separate binding sites on IFT74-IFT81. No competition or mutual exclusivity.

**Functional significance**:
- IFT25-IFT27 binding to IFT74-IFT81 couples BBSome to IFT-B
- Essential for BBSome-mediated GPCR export
- RABL2(Q80L) defects are NOT caused by displacing IFT25-IFT27 (different mechanism)

**Human UniProt IDs**:
- IFT25: Q9Y547
- IFT27: Q9BW83
- IFT74: Q96LB3
- IFT81: Q8WYA0

---

### 3. CEP19 ↔ RABL2 - Basal Body Recruitment (Indirect Evidence)

**Method**: Functional assay (ciliary entry dependence)

**Confidence**: Medium-High (indirect functional evidence)

**Interface Description**:
- Direct binding not confirmed in accessible material
- CEP19 is required for RABL2(Q80L) entry into cilia

**Quote from search results**: "RABL2(Q80L) enters cilia in a manner dependent on the basal body protein CEP19."

**Functional significance**:
- CEP19 recruits RABL2 to basal body/ciliary base
- Required for RABL2(Q80L) ciliary entry
- Part of the CEP19-RABL2-IFT-B axis

**Note**: Direct biochemical interaction evidence not available in accessible material. This may be described as functional dependency rather than direct binding.

**Human UniProt IDs**:
- CEP19: Q96LK0
- RABL2: Q9GZN8 or Q3YEC7 - **NEEDS VERIFICATION**

---

### 4. CEP19 ↔ IFT74-IFT81 - Mutually Exclusive with RABL2 (Indirect)

**Method**: Not specified in accessible material

**Confidence**: Medium (based on search result snippet)

**Quote from search results**: "CEP19 and IFT74-IFT81 bind to RABL2(Q80L) in a mutually exclusive manner."

**Functional significance**:
- Suggests a regulatory mechanism for RABL2 binding
- CEP19 may release RABL2 to allow IFT74-IFT81 binding
- Part of the handoff mechanism at the ciliary base

**Human UniProt IDs**:
- CEP19: Q96LK0
- IFT74: Q96LB3
- IFT81: Q8WYA0

---

## Phenotype of RABL2(Q80L) GTP-Locked Mutant

### BBS-Associated Ciliary Defects

**Quote from search results**: "Cells expressing GTP-locked RABL2 [RABL2(Q80L)] demonstrated BBS-associated ciliary defects, including accumulation of LZTFL1/BBS17 and the BBSome within cilia and the suppression of export of the ciliary GPCRs GPR161 and Smoothened."

### Specific Protein Accumulations

#### LZTFL1/BBS17 in Cilia
- **Normal**: LZTFL1 not detected in cilia
- **RABL2(Q80L)**: High level of LZTFL1 accumulation in cilia
- **Interpretation**: LZTFL1 export is blocked

**Human UniProt ID**: LZTFL1/BBS17: Q9NQ48

#### BBSome Components in Cilia

##### BBS9 Accumulation
- **Normal**: BBS9 in ~20-30% of cilia
- **RABL2(Q80L)**: Significant enrichment in cilia
- **Interpretation**: BBSome export is impaired

**Human UniProt ID**: BBS9: Q3SYG4

##### ARL6/BBS3 Accumulation
- **Normal**: ARL6 in ~20-30% of cilia
- **RABL2(Q80L)**: Significant enrichment in cilia
- **Interpretation**: BBSome (via ARL6-GTP) accumulates on ciliary membrane

**Human UniProt ID**: ARL6/BBS3: Q9H0F7

**Quote from search results**: "EGFP-RABL2(Q80L) expression caused significant enrichment of BBS9 and ARL6 within cilia, as in IFT27-KO cells, whereas wild-type RABL2 expression did not substantially alter the ciliary levels of these proteins."

### GPCR Export Defects

#### GPR161 Export Suppression
- **Normal**: GPR161 exported from cilia
- **RABL2(Q80L)**: Accumulation in cilia, export suppressed

**Human UniProt ID**: GPR161: Q8N6U8

#### Smoothened (SMO) Export Suppression
- **Normal**: Smoothened exported from cilia
- **RABL2(Q80L)**: Suppression of basal export

**Quote from search results**: "RABL2(Q80L) suppresses basal SMO export from cilia."

**Human UniProt ID**: Smoothened (SMO): Q99835

---

## Phenocopy with IFT27 Knockout

**Key Finding**: RABL2(Q80L) phenocopies IFT27-KO cells

**Quote from search results**: "Cells expressing GTP-locked RABL2 [RABL2(Q80L)], but not wild-type RABL2, phenocopied IFT27-knockout cells."

**Interpretation**:
- GTP-locked RABL2 blocks IFT25-IFT27 from binding IFT74-IFT81
- This is functionally equivalent to losing IFT27
- Confirms that IFT25-IFT27 binding to IFT-B is essential for BBSome export

---

## Proposed Mechanism (Based on Abstract)

### Normal BBSome Export Cycle

1. **Basal Body**: CEP19 recruits RABL2-GTP
2. **IFT-B Recruitment**: RABL2-GTP binds IFT74-IFT81, recruiting IFT-B complex to ciliary base
3. **RABL2 Exchange**: RABL2 is released/exchanged for IFT25-IFT27
4. **BBSome Coupling**: IFT25-IFT27 on IFT74-IFT81 enables BBSome binding to IFT-B
5. **GPCR Export**: BBSome-IFT-B complex exports GPCRs from cilia

### RABL2(Q80L) Defect

1. **Basal Body**: CEP19 recruits RABL2(Q80L)-GTP
2. **IFT-B Recruitment**: RABL2(Q80L)-GTP binds IFT74-IFT81
3. **❌ BLOCKED EXCHANGE**: GTP-locked RABL2 cannot be released
4. **❌ NO BBSome COUPLING**: IFT25-IFT27 cannot bind (mutually exclusive)
5. **❌ FAILED GPCR EXPORT**: BBSome and GPCRs accumulate in cilia

**Quote from search results**: "The binding of RABL2(Q80L) to IFT74-IFT81 decouples IFT25-IFT27 from IFT74-IFT81 and causes BBS-associated ciliary defects, such as abnormal accumulation of the BBSome and GPCRs within cilia."

---

## Ciliary Entry of RABL2(Q80L)

**Finding**: RABL2(Q80L) can enter cilia in a CEP19-dependent manner

**Quote from search results**: "RABL2(Q80L) enters cilia in a manner dependent on the basal body protein CEP19, but its entry into cilia is not necessary for causing BBS-associated ciliary defects."

**Interpretation**:
- CEP19 is required for RABL2(Q80L) to enter cilia
- However, BBS-associated defects can occur even without RABL2(Q80L) entering cilia
- Suggests the critical defect is at the ciliary base (blocking IFT25-IFT27 binding)

---

## Connection to IFT27 Function

### IFT27 Knockout Phenotype
- Accumulation of BBSome (BBS9, ARL6) in cilia
- Accumulation of LZTFL1/BBS17 in cilia
- Defective GPCR export

### RABL2(Q80L) Phenocopy
- **Identical phenotype** to IFT27-KO
- Confirms that IFT25-IFT27 binding to IFT74-IFT81 is the critical step
- RABL2(Q80L) blocks this by occupying the IFT74-IFT81 binding site

**Quote from search results**: "GTP-bound RABL2 is likely to be required for recruitment of the IFT-B complex to the ciliary base, where it is replaced with IFT25-IFT27."

---

## Related Studies (Context)

### Katoh et al., 2017 - CEP19-RABL2-IFT-B Complex
**Title**: The CEP19-RABL2 GTPase Complex Binds IFT-B to Initiate Intraflagellar Transport at the Ciliary Base
**PMID**: 28625565
**Finding**: CEP19-RABL2 complex recruits IFT-B to ciliary base

### Nozaki et al., 2017 - RABL2-IFT-B Interaction
**Title**: RABL2 interacts with the intraflagellar transport-B complex and CEP19 and participates in ciliary assembly
**PMID**: 28428259
**Finding**: RABL2 interacts with IFT-B complex and CEP19

### Kanie et al., 2017 - IFT27-BBSome Export
**Title**: The intraflagellar transport protein IFT27 promotes BBSome exit from cilia through the GTPase ARL6/BBS3
**PMID**: 25443296 (published 2014)
**Finding**: IFT27 (with IFT25) promotes BBSome export via ARL6

### Liew et al., 2014 - IFT25-IFT27 Structure
**Title**: Crystal structure of the IFT25-IFT27 complex
**Finding**: IFT25-IFT27 forms tight heterodimer

### Taschner et al., 2016 - IFT74-IFT81 Structure
**PMID**: 27344947
**Finding**: Crystal structure of IFT74-IFT81 complex

### Kanie et al., 2020 - RABL2 GTP Hydrolysis
**Title**: Rabl2 GTP hydrolysis licenses BBSome-mediated export to fine-tune ciliary signaling
**PMID**: 33241915
**Journal**: EMBO J 2020
**Finding**: RABL2 GTP hydrolysis is required for proper BBSome function

### Watanabe et al., 2023 - IFT81-IFT74 as RABL2 GAP
**Title**: The IFT81-IFT74 complex acts as an unconventional RabL2 GTPase-activating protein during intraflagellar transport
**PMID**: 37606072
**Journal**: EMBO J 2023
**Finding**: IFT81-IFT74 acts as GAP for RABL2

---

## Summary of Interactions for Database

### Validated Interactions (Based on Limited Data)

1. **RABL2-GTP ↔ IFT74-IFT81** - Mutually exclusive with IFT25-IFT27
2. **IFT25-IFT27 ↔ IFT74-IFT81** - Mutually exclusive with RABL2
3. **CEP19 ↔ RABL2** - Functional dependency (ciliary entry)
4. **CEP19 ↔ IFT74-IFT81** - Mutually exclusive binding to RABL2 (needs confirmation)

### Functional Associations (Not Direct Binding)

- **RABL2(Q80L) → LZTFL1/BBS17 accumulation** (functional consequence)
- **RABL2(Q80L) → BBS9 accumulation** (functional consequence)
- **RABL2(Q80L) → ARL6/BBS3 accumulation** (functional consequence)
- **RABL2(Q80L) → GPR161 export block** (functional consequence)
- **RABL2(Q80L) → SMO export block** (functional consequence)

---

## Missing Information (FULL PAPER NEEDED)

### Critical Missing Data:

1. **Experimental Methods Details**:
   - Co-immunoprecipitation protocols
   - In vitro binding assays
   - Structural studies (if any)
   - Quantitative binding data (Kd values)
   - Competition assays for mutually exclusive binding

2. **Interaction Details**:
   - Specific residues involved in RABL2-IFT74/81 binding
   - Specific residues involved in IFT25/27-IFT74/81 binding
   - Overlap region on IFT74-IFT81
   - CEP19-RABL2 binding site
   - Whether CEP19-IFT74/81 interaction is direct or indirect

3. **Biochemical Data**:
   - Binding affinities
   - GTP vs GDP binding differences
   - Competition binding curves
   - Stoichiometry of complexes

4. **Supplementary Figures**:
   - Western blots showing co-IPs
   - Microscopy images showing protein localization
   - Quantification of ciliary accumulation
   - Time-course experiments

5. **Additional Interactions**:
   - Other IFT-B components binding to RABL2
   - BBSome components tested
   - Other regulators of the CEP19-RABL2-IFT-B axis

---

## Recommendations for Database Upload

### DO NOT upload this data yet due to:
1. Lack of detailed experimental methods
2. Missing verbatim quotes from results
3. Unclear which interactions are direct vs. indirect
4. Missing quantitative data
5. Incomplete understanding of CEP19 role

### Required Actions:
1. **Obtain full paper access** (PMC9634966 should be open access)
2. Extract complete methods section
3. Extract all results with verbatim quotes
4. Review supplementary figures and tables
5. Confirm UniProt IDs (especially RABL2A vs RABL2B)
6. Distinguish direct binding from functional dependencies

### Alternative Approaches:
1. Request paper from authors (zhou/katoh/nakayama labs)
2. Check institutional access
3. Use interlibrary loan
4. Contact PMC for access issues

---

## Validation Script Placeholder

**File**: `add_zhou_2022_rabl2_validations.mjs`

**Status**: ❌ NOT CREATED - Insufficient data

**Reason**: Cannot create validation script without:
- Experimental methods
- Confirmation of direct vs. indirect interactions
- Verbatim quotes
- Proper RABL2 UniProt ID

**Action Required**: Obtain full paper, then create script

---

## Data Sources Used

1. **PubMed Abstract**: PMID 36074075
2. **Web Search Results**: Limited snippets from:
   - MolBiolCell website (blocked)
   - PMC article page (blocked)
   - ResearchGate figures (blocked)
   - Related paper abstracts
3. **Related Studies**: Context from earlier papers by same group

**Limitation**: All full-text access attempts resulted in 403 errors

---

**Created**: 2025-11-08
**Author**: Claude Code
**Status**: ⚠️ INCOMPLETE - Full paper access required
**Confidence**: LOW - Based on abstract and search snippets only
**Next Action**: Obtain full paper access and update this document

---

## Notes for Future Update

When full paper becomes available, extract:

1. **Materials and Methods Section**:
   - Cell lines used
   - Plasmid constructs (RABL2, RABL2(Q80L), etc.)
   - Co-IP protocols
   - Microscopy methods
   - Quantification methods

2. **Results Section**:
   - Figure 1: ??? (need to see)
   - Figure 2: ??? (likely RABL2-IFT74/81 binding)
   - Figure 3: ??? (likely mutually exclusive binding)
   - Figure 4: ??? (likely phenotype data)
   - All verbatim quotes describing interactions

3. **Discussion Section**:
   - Mechanistic model details
   - Comparison with IFT27-KO
   - Evolutionary conservation
   - Clinical relevance

4. **Supplementary Materials**:
   - Extended data figures
   - Methods details
   - Additional validation experiments
   - Protein sequences used

---

**CRITICAL REMINDER**: This document should NOT be used for database upload until full paper is reviewed and missing information is added.
