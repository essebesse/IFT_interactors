# Duan et al., 2021 - RABL2 Validation

## Publication Information

**Title**: Rabl2 GTP hydrolysis licenses BBSome-mediated export to fine-tune ciliary signaling

**Authors**: Duan S, Li H, Zhang Y, Yang S, Chen Y, Qiu B, Huang C, Wang J, Li J, Zhu X, Yan X

**Journal**: EMBO J. 2021 Jan 15;40(2):e105499

**PMID**: 33241915

**DOI**: 10.15252/embj.2020105499

---

## Overview

This study demonstrates that small GTPase RABL2 functions as a molecular switch for outward transition zone passage of the BBSome. RABL2-GTP enters cilia by binding to the IFT-B complex. Its GTP hydrolysis enables the outward transition zone passage of the BBSome and its cargos with retrograde IFT machinery, whereas persistent GTP association leads to their shedding from IFT-B during the passing process and consequently ciliary retention.

**⚠️ IMPORTANT CORRECTION (Boegholm et al., EMBO J 2023, PMID: 37606072)**:
This paper references the "mutually exclusive" binding model between RABL2 and IFT25-IFT27 on IFT74-IFT81. **This model was later shown to be INCORRECT** by Boegholm 2023. RABL2 and IFT25-IFT27 bind to **SEPARATE, non-overlapping sites** on IFT74-IFT81. They are NOT mutually exclusive. Functional phenotypes observed must result from other mechanisms.

---

## Protein-Protein Interactions

### 1. RABL2 ↔ IFT-B Complex (IFT74-IFT81 heterodimer)

**Proteins**: RABL2 (Human Q9UEY8) ↔ IFT74 (Human Q96LB3) + IFT81 (Human Q8WYA0)

**Experimental Methods**:
- Co-immunoprecipitation
- Based on prior work (Nishijima et al., 2017; Funabashi et al., 2017) showing RABL2 interacts with IFT74-IFT81 heterodimer in GTP-dependent manner

**GTP-Dependence**: GTP-dependent
- RABL2 binds IFT74-IFT81 in its GTP-bound state
- RABL2(Q80L) (GTP-locked mutant) shows enhanced binding

**Role in Transition Zone Passage**:
- RABL2-GTP enters cilia by binding to IFT-B complex
- GTP hydrolysis of RABL2 is required for BBSome release and outward TZ passage
- Persistent RABL2-GTP binding prevents BBSome passage through TZ

**Key Findings from Paper**:
- ⚠️ **INCORRECT**: "IFT25–IFT27 and the RABL2 GTPase bind the IFT74/BBS22–IFT81 dimer of the IFT-B complex in a mutually exclusive manner" (cited from related work, Zhou et al., 2022) - **This was later disproven by Boegholm 2023: they bind to SEPARATE sites**
- "RABL2-GTP enters cilia by binding to IFT-B complex"
- RABL2 interacts with IFT-B via the IFT74-IFT81 heterodimer in its GTP-bound state

**Evidence from Related Studies**:
- IFT81-IFT74 complex acts as a GTPase-activating protein (GAP) for RABL2
- Pull-down assays showed IFT81/74 complex interacts with RABL2(Q83L) in a GTPγS-dependent manner
- No interaction observed with GDP-bound RABL2

---

### 2. RABL2(Q80L) ↔ IFT81

**Proteins**: RABL2 (Human Q9UEY8) ↔ IFT81 (Human Q8WYA0)

**Experimental Methods**:
- Co-immunoprecipitation
- Lysates from RPE1 cells or CEP19-KO cells expressing EGFP-RABL2(Q80L) were immunoprecipitated with GST-tagged anti-GFP Nb

**GTP-Dependence**: GTP-dependent (Q80L is GTP-locked mutant)

**Role in Transition Zone Passage**:
- IFT81 coprecipitates with RABL2(Q80L) in both control and CEP19-KO cells
- Indicates stable IFT-B interaction in GTP-bound state

**Key Findings from Paper**:
- "Comparable amounts of IFT81 and IFT52 were coprecipitated with RABL2(Q80L) in both control and CEP19-KO cells" (quoted from Zhou et al., 2022 citing Duan 2021)
- IFT81 is part of core IFT-B binding site for RABL2

---

### 3. RABL2(Q80L) ↔ IFT52

**Proteins**: RABL2 (Human Q9UEY8) ↔ IFT52 (Human Q9Y366)

**Experimental Methods**:
- Co-immunoprecipitation
- EGFP-RABL2(Q80L) immunoprecipitation from RPE1 cells

**GTP-Dependence**: GTP-dependent (Q80L is GTP-locked mutant)

**Role in Transition Zone Passage**:
- IFT52 is part of IFT-B complex that interacts with RABL2
- Coprecipitation independent of CEP19

**Key Findings from Paper**:
- "Comparable amounts of IFT81 and IFT52 were coprecipitated with RABL2(Q80L) in both control and CEP19-KO cells" (quoted from Zhou et al., 2022 citing Duan 2021)
- IFT52 interacts with RABL2 as part of IFT-B complex

---

### 4. RABL2(Q80L) ↔ IFT25

**Proteins**: RABL2 (Human Q9Y547) ↔ IFT25 (Human Q9Y547)

**Experimental Methods**:
- Co-immunoprecipitation

**GTP-Dependence**: GTP-dependent (Q80L is GTP-locked mutant)

**Role in Transition Zone Passage**:
- ⚠️ **INCORRECT MODEL**: IFT25 (together with IFT27) and RABL2 bind IFT74-IFT81 in mutually exclusive manner - **CORRECTED by Boegholm 2023: they bind SEPARATE sites, NOT mutually exclusive**
- IFT25 functional relationship with RABL2 exists, but NOT through competitive binding
- IFT25 coprecipitation with RABL2(Q80L) was substantially reduced in CEP19-KO cells

**Key Findings from Paper**:
- "IFT25, together with other IFT-B subunits, was coprecipitated with RABL2(Q80L) in control RPE1 cells (Duan et al., 2021)" (direct quote from Zhou et al., 2022)
- "The amount was substantially reduced in CEP19-KO cells compared to control RPE1 cells"
- "The majority of RABL2 on IFT-B is then replaced by IFT25–IFT27 upon hydrolysis of bound GTP"

---

### 5. RABL2 vs IFT139 (No Interaction - Negative Control)

**Proteins**: RABL2 (Human Q9UEY8) vs IFT139 (Human Q7Z4L5)

**Experimental Methods**:
- Co-immunoprecipitation (negative result)

**GTP-Dependence**: N/A (no interaction detected)

**Role in Transition Zone Passage**:
- IFT139 is an IFT-A subunit
- RABL2 specifically interacts with IFT-B complex, not IFT-A

**Key Findings from Paper**:
- "Coprecipitation of IFT139, an IFT-A subunit, with RABL2(Q80L) was not detectable in control RPE1 cells or in CEP19-KO cells, consistent with the previous study (Duan et al., 2021)" (direct quote from Zhou et al., 2022)
- Confirms RABL2 selectivity for IFT-B over IFT-A

---

### 6. RABL2(Q80L) Effects on BBS9 (BBSome subunit)

**Proteins**: RABL2 (Human Q9UEY8) → BBS9 (Human Q3SYG4)

**Experimental Methods**:
- Immunofluorescence microscopy
- Ciliary localization analysis

**GTP-Dependence**: GTP-dependent (Q80L causes accumulation)

**Role in Transition Zone Passage**:
- RABL2(Q80L) (GTP-locked) causes enrichment of BBS9 within cilia
- Indicates that GTP hydrolysis is required for BBSome export from cilia

**Key Findings from Paper**:
- "EGFP-RABL2(Q80L) expression caused significant enrichment of BBS9 and ARL6 within cilia" (from search results)
- "Cells expressing GTP-locked RABL2 [RABL2(Q80L)] demonstrated BBS-associated ciliary defects, including accumulation of LZTFL1/BBS17 and the BBSome within cilia"
- Functional evidence that RABL2 regulates BBSome trafficking through TZ

---

### 7. RABL2(Q80L) Effects on ARL6/BBS3 (BBSome regulator)

**Proteins**: RABL2 (Human Q9UEY8) → ARL6/BBS3 (Human Q9H0F7)

**Experimental Methods**:
- Immunofluorescence microscopy
- Ciliary localization analysis

**GTP-Dependence**: GTP-dependent (Q80L causes accumulation)

**Role in Transition Zone Passage**:
- RABL2(Q80L) causes enrichment of ARL6 within cilia
- ARL6 is required for BBSome ciliary function
- Suggests RABL2 regulates ARL6-BBSome pathway

**Key Findings from Paper**:
- "EGFP-RABL2(Q80L) expression caused significant enrichment of BBS9 and ARL6 within cilia"
- ARL6 accumulation indicates disrupted BBSome export when RABL2 cannot hydrolyze GTP

---

### 8. RABL2(Q80L) Effects on LZTFL1/BBS17

**Proteins**: RABL2 (Human Q9UEY8) → LZTFL1/BBS17 (Human Q9NQ48)

**Experimental Methods**:
- Immunofluorescence microscopy
- Analysis of ciliary protein accumulation

**GTP-Dependence**: GTP-dependent (Q80L causes accumulation)

**Role in Transition Zone Passage**:
- LZTFL1/BBS17 is a BBSome-interacting protein
- RABL2(Q80L) causes accumulation of LZTFL1/BBS17 within cilia
- Indicates failed export through transition zone

**Key Findings from Paper**:
- "Cells expressing GTP-locked RABL2 [RABL2(Q80L)] demonstrated BBS-associated ciliary defects, including accumulation of LZTFL1/BBS17 and the BBSome within cilia" (direct quote from search results)
- LZTFL1 accumulation is a marker of defective BBSome-mediated export

---

### 9. RABL2(Q80L) Effects on GPR161 Export

**Proteins**: RABL2 (Human Q9UEY8) → GPR161 (Human Q8N6U8)

**Experimental Methods**:
- Immunofluorescence microscopy
- SAG (Smoothened agonist) stimulation experiments
- Ciliary GPCR localization analysis

**GTP-Dependence**: GTP-dependent (Q80L blocks export)

**Role in Transition Zone Passage**:
- GPR161 is a ciliary GPCR that requires BBSome for export
- RABL2(Q80L) (GTP-locked) suppresses GPR161 export from cilia
- Demonstrates RABL2 GTP hydrolysis is required for GPCR export

**Key Findings from Paper**:
- "Rabl2Q80L (a GTP-locked mutant) retained ciliary GPR161 after SAG stimulation"
- "The expression of EGFP-RABL2(Q80L) in CEP19-KO cells inhibited the exit of GPR161 from cilia upon SAG stimulation"
- "Cells expressing GTP-locked RABL2 [RABL2(Q80L)] demonstrated...the suppression of export of the ciliary GPCRs GPR161 and Smoothened" (direct quote)

---

### 10. RABL2(Q80L) Effects on Smoothened (SMO) Export

**Proteins**: RABL2 (Human Q9UEY8) → Smoothened/SMO (Human Q99835)

**Experimental Methods**:
- Immunofluorescence microscopy
- SAG stimulation experiments
- Analysis of basal and stimulated SMO ciliary levels

**GTP-Dependence**: GTP-dependent (Q80L blocks export)

**Role in Transition Zone Passage**:
- SMO is a ciliary GPCR involved in Hedgehog signaling
- RABL2(Q80L) causes SAG-independent accumulation of ciliary Smoothened
- RABL2(Q80L) suppresses basal SMO export from cilia

**Key Findings from Paper**:
- "Rabl2Q80L led to SAG-independent accumulation of ciliary Smoothened (SMO)"
- "RABL2(Q80L) suppresses basal SMO export from cilia"
- "The GTP-locked Q80L mutant represses the export of ciliary Gpr161 and Smo"
- "Cells expressing GTP-locked RABL2 [RABL2(Q80L)] demonstrated...the suppression of export of the ciliary GPCRs GPR161 and Smoothened"

---

### 11. RABL2 Relationship to CEP19 (Upstream Regulator)

**Proteins**: CEP19 (Human Q96LK0) → RABL2 (Human Q9UEY8)

**Experimental Methods**:
- CEP19 knockout cells
- Co-immunoprecipitation in CEP19-KO background
- Based on prior work (Funabashi et al., 2017; Nishijima et al., 2017)

**GTP-Dependence**:
- CEP19 recruits RABL2-GTP to basal body
- CEP19 specifically captures GTP-bound RABL2

**Role in Transition Zone Passage**:
- CEP19 is required for RABL2 recruitment to ciliary base
- CEP19-RABL2-IFT-B axis controls BBSome-mediated export
- Without CEP19, IFT25 coprecipitation with RABL2 is reduced

**Key Findings from Paper**:
- IFT25 coprecipitation with RABL2(Q80L) was "substantially reduced in CEP19-KO cells compared to control RPE1 cells" (Duan et al., 2021, cited in Zhou 2022)
- IFT81 and IFT52 coprecipitation was unchanged in CEP19-KO cells
- Indicates CEP19 affects RABL2 function but not core IFT-B binding

---

## Mechanistic Model from Duan et al., 2021

### Key Mechanism: RABL2 as Molecular Switch

1. **RABL2-GTP Ciliary Entry**:
   - RABL2-GTP binds to IFT-B complex (via IFT74-IFT81 C-terminal coiled-coil)
   - Enters cilia with anterograde IFT machinery
   - ⚠️ **INCORRECT**: "RABL2 and IFT25-IFT27 bind IFT74-IFT81 in mutually exclusive manner" - **CORRECTED by Boegholm 2023: separate binding sites**

2. **GTP Hydrolysis Enables BBSome Export**:
   - RABL2 hydrolyzes GTP (enhanced by IFT81-IFT74 GAP activity - Boegholm 2023)
   - RABL2-GDP dissociates from IFT-B
   - IFT25-IFT27 binds to different site on IFT-B (NOT competitive replacement)
   - BBSome can now bind IFT-B and pass through transition zone

3. **GTP-Locked RABL2(Q80L) Phenotype**:
   - Cannot hydrolyze GTP
   - Remains bound to IFT-B
   - Prevents BBSome binding to IFT-B
   - BBSome shed from IFT during TZ passage
   - Results in ciliary accumulation of:
     - BBSome subunits (BBS9)
     - BBSome regulators (ARL6/BBS3, LZTFL1/BBS17)
     - BBSome cargos (GPR161, Smoothened)

### Quoted Summary

"GTP hydrolysis enables the outward TZ passage of the BBSome and its cargos with retrograde IFT machinery, whereas persistent association leads to their shedding from IFT-B during the passing process and consequently ciliary retention."

"The majority of RABL2 on IFT-B is then replaced by IFT25–IFT27 upon hydrolysis of bound GTP, although a fraction of RABL2 is likely to remain associated with some IFT-B units in the assembling train and enter cilia."

---

## Connection to IFT81-IFT74 as RABL2 GAP

Subsequent work (Vuolo et al., 2023) demonstrated that:
- IFT81-IFT74 heterodimer acts as an unconventional GTPase-activating protein (GAP) for RABL2
- Accelerates GTP hydrolysis by RABL2
- This GAP activity is critical for the molecular switch mechanism proposed by Duan et al., 2021

---

## Functional Significance

### BBSome Export Licensing

RABL2 GTP hydrolysis "licenses" BBSome-mediated export by:
1. Clearing RABL2 from IFT-B binding sites
2. Allowing IFT25-IFT27 to occupy these sites
3. Permitting BBSome to bind retrograde IFT for TZ passage
4. Enabling export of ciliary GPCRs (GPR161, SMO)

### Disease Relevance

- GTP-locked RABL2 causes "BBS-associated ciliary defects"
- Disrupts Hedgehog signaling (GPR161, SMO mislocalization)
- Links RABL2 mutations to ciliopathies
- Explains role of RABL2 in cilia-dependent signaling, not ciliogenesis

---

## Summary of Validated Interactions

| Interaction | Method | GTP/GDP | Result |
|------------|--------|---------|--------|
| RABL2 ↔ IFT74-IFT81 | Co-IP, literature | GTP-dependent | Positive (GTP), Negative (GDP) |
| RABL2(Q80L) ↔ IFT81 | Co-IP | GTP-locked | Positive |
| RABL2(Q80L) ↔ IFT52 | Co-IP | GTP-locked | Positive |
| RABL2(Q80L) ↔ IFT25 | Co-IP | GTP-locked | Positive (reduced in CEP19-KO) |
| RABL2(Q80L) ↔ IFT139 | Co-IP | GTP-locked | Negative (no interaction) |
| CEP19 → RABL2 | Genetic (KO) | Upstream | Required for RABL2 function |
| RABL2(Q80L) → BBS9 | IF microscopy | GTP-locked | Ciliary accumulation |
| RABL2(Q80L) → ARL6/BBS3 | IF microscopy | GTP-locked | Ciliary accumulation |
| RABL2(Q80L) → LZTFL1/BBS17 | IF microscopy | GTP-locked | Ciliary accumulation |
| RABL2(Q80L) → GPR161 | IF microscopy | GTP-locked | Export blocked |
| RABL2(Q80L) → SMO | IF microscopy | GTP-locked | Export blocked |

---

## Notes

1. **Limited Direct Access**: Full paper text was not directly accessible. Information extracted from:
   - PubMed abstract
   - Related papers citing Duan et al., 2021
   - Search result summaries
   - Subsequent studies (Zhou et al., 2022; Vuolo et al., 2023; Zhang et al., 2023)

2. **Primary Methods**: Co-immunoprecipitation and immunofluorescence microscopy were the main experimental approaches identified

3. **GTP-Dependent Interactions**: All positive RABL2-IFT interactions are GTP-dependent, with Q80L (GTP-locked mutant) serving as key tool

4. **Specificity**: RABL2 specifically interacts with IFT-B complex (not IFT-A), consistent with its role in IFT-B-mediated transport

5. **Functional vs Physical Interactions**: Some interactions (BBSome, GPCRs) are functional/regulatory rather than direct physical binding

6. **Mutually Exclusive Binding**: Key finding that RABL2 and IFT25-IFT27 compete for same binding site on IFT74-IFT81, explaining the molecular switch mechanism

---

## Recommended Follow-up

For researchers using this validation:
1. Consult full paper for detailed methods and quantification
2. Review supplementary figures for comprehensive interaction data
3. Consider follow-up studies (Vuolo 2023, Zhou 2022, Zhang 2023) for expanded interaction networks
4. Note that some specific binding domains and structural details may be in the full text
5. Verify UniProt IDs for specific isoforms used in experiments

---

**Document Created**: 2025-11-08
**Source**: Web search results and related literature
**Status**: Interactions extracted from available summaries; full paper text not accessible
