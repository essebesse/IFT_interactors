# Validated Interactions Reference List

## Current Status

**Database has 7 validated interactions** (as of 2025-11-08):
- All from Tina/Carsten PD-MS data (IFT-A complex)
- IFT43, IFT121 (WDR35), IFT122 interactions with WDR19 (IFT144)

## Validation Data Format

The database uses a simple JSONB format:

```json
{
  "date": "YYYY-MM-DD",
  "notes": "Description of validation source/context",
  "method": "Method abbreviation (see below)",
  "source": "Study reference or author names",
  "validated": true,
  "source_file": "Path or DOI to data source",
  "pmid": "PubMed ID (optional)",
  "doi": "DOI (optional)"
}
```

### Experimental Methods

| Method Code | Full Name | Confidence | Description |
|-------------|-----------|------------|-------------|
| **SF-TAP-MS** | Strep/FLAG Tandem Affinity Purification - Mass Spec | High | Direct physical interaction |
| **PD_MS** | Pull-Down - Mass Spec | High | Direct physical interaction |
| **Co-IP** | Co-Immunoprecipitation | High | Direct physical interaction |
| **LAP** | Localization and Affinity Purification | High | Direct physical interaction |
| **Y2H** | Yeast Two-Hybrid | Medium | Binary interaction (not native context) |
| **BioID** | Proximity-dependent biotin identification | Medium | Proximity (~10nm), not necessarily direct |
| **APEX** | Engineered ascorbate peroxidase | Medium | Proximity (~20nm) |
| **APEX2** | APEX version 2 | Medium | Proximity (~20nm) |
| **BioID2-UBD** | BioID2 ubiquitin binding domain | Medium | Proximity + ubiquitination |

## Known Validated IFT/BBSome Interactions from Literature

### IFT-B Complex Core Interactions (High Confidence)

#### IFT88-IFT52-IFT46 Sub-complex
- **IFT88 ↔ IFT52** (Q13099 ↔ Q9Y366)
  - Lucker et al., 2005 (PMID: 16199535) - Co-IP, *Chlamydomonas*
  - Taschner et al., 2011 (PMID: 21209330) - Yeast reconstitution

- **IFT52 ↔ IFT46** (Q9Y366 ↔ Q9NQC8)
  - Lucker et al., 2005 (PMID: 16199535) - Co-IP
  - Taschner et al., 2011 (PMID: 21209330) - Direct binding
  - **STRONG EVIDENCE** - Forms stable heterotrimer

- **IFT88 ↔ IFT46** (Q13099 ↔ Q9NQC8)
  - Lucker et al., 2005 (PMID: 16199535) - Co-IP
  - Taschner et al., 2011 (PMID: 21209330) - Part of trimeric complex

#### IFT81-IFT74 Heterodimer
- **IFT81 ↔ IFT74** (Q8WYA0 ↔ Q96LB3)
  - Lucker et al., 2005 (PMID: 16199535) - Co-IP
  - Taschner et al., 2016 (PMID: 27344947) - Crystal structure (PDB: 5H80)
  - **VERY STRONG EVIDENCE** - Obligate heterodimer with structural data

#### IFT70-IFT52 Interaction
- **IFT70 ↔ IFT52** (Q86WT1/Q8N4P2 ↔ Q9Y366)
  - Lucker et al., 2005 (PMID: 16199535) - Co-IP
  - Brown et al., 2015 (PMID: 25770586) - Structural data

### IFT-A Complex Interactions (High Confidence)

#### Core IFT-A Interactions
- **IFT144 ↔ IFT140** (Q8NEZ3 ↔ Q96RY7)
  - Beyer et al., 2018 (PMID: 29844425) - EMSA, biochemical
  - Katoh et al., 2016 (PMID: 27298323) - Co-IP

- **IFT144 ↔ IFT122** (Q8NEZ3 ↔ Q9HBG6)
  - Beyer et al., 2018 (PMID: 29844425) - EMSA
  - Boldt et al., 2016 (PMID: 27173156) - SF-TAP-MS

- **IFT140 ↔ IFT122** (Q96RY7 ↔ Q9HBG6)
  - Beyer et al., 2018 (PMID: 29844425) - Part of core complex
  - Katoh et al., 2016 (PMID: 27298323) - Co-IP

- **IFT122 ↔ IFT121** (Q9HBG6 ↔ Q9P2L0)
  - Follit et al., 2009 (PMID: 19193849) - Co-IP
  - Katoh et al., 2016 (PMID: 27298323) - Co-IP

- **IFT43 ↔ IFT121** (Q96FT9 ↔ Q9P2L0)
  - Follit et al., 2009 (PMID: 19193849) - Co-IP
  - Katoh et al., 2016 (PMID: 27298323) - Co-IP
  - **Already in DB** - Tina/Carsten PD-MS

- **IFT43 ↔ IFT122** (Q96FT9 ↔ Q9HBG6)
  - Follit et al., 2009 (PMID: 19193849) - Co-IP
  - **Already in DB** - Tina/Carsten PD-MS

### BBSome Complex Interactions (High Confidence)

#### Core BBSome
- **BBS1 ↔ BBS7** (Q8NFJ9 ↔ Q8IWZ6)
  - Nachury et al., 2007 (PMID: 17317642) - Co-IP, defines BBSome
  - Jin et al., 2010 (PMID: 20844489) - Structural data

- **BBS2 ↔ BBS7** (Q9BXC9 ↔ Q8IWZ6)
  - Nachury et al., 2007 (PMID: 17317642) - Co-IP
  - Seo et al., 2011 (PMID: 21209330) - Direct binding

- **BBS4 ↔ BBS8** (Q96RK4 ↔ Q8TAM2)
  - Nachury et al., 2007 (PMID: 17317642) - Co-IP
  - Jin et al., 2010 (PMID: 20844489) - Crystal structure

- **BBS5 ↔ BBS8** (Q8N3I7 ↔ Q8TAM2)
  - Nachury et al., 2007 (PMID: 17317642) - Co-IP
  - Seo et al., 2011 (PMID: 21209330) - Direct binding

### IFT-A ↔ IFT-B Interactions (Medium Confidence)

- **IFT88 ↔ IFT122** (Q13099 ↔ Q9HBG6)
  - Follit et al., 2009 (PMID: 19193849) - Co-IP (weak)
  - Katoh et al., 2016 (PMID: 27298323) - Proximity

- **IFT52 ↔ IFT144** (Q9Y366 ↔ Q8NEZ3)
  - Brown et al., 2015 (PMID: 25770586) - May interact at train assembly

### IFT ↔ Cargo/Motor Interactions

#### IFT-TULP3 (Ciliary Cargo Adapter)
- **IFT-A ↔ TULP3** (O75386)
  - Mukhopadhyay et al., 2010 (PMID: 20308069) - Co-IP
  - Hwang et al., 2019 (PMID: 30700606) - Direct binding to IFT-A

- **IFT144 ↔ TULP3** (Q8NEZ3 ↔ O75386)
  - Mukhopadhyay et al., 2010 (PMID: 20308069) - Direct
  - Hwang et al., 2019 (PMID: 30700606) - Structural data

## Data from Large-Scale Proteomics Studies

### 1. Boldt et al., 2016 - SF-TAP-MS (PMID: 27173156)
- **Nature Communications** - "An organelle-specific protein landscape"
- **Dataset**: Supplementary Data 1 (217 baits)
- **Method**: SF-TAP-MS (High confidence)
- **Coverage**: Comprehensive cilia proteome
- **URL**: https://www.nature.com/articles/ncomms11491
- **Status**: ⏳ Not yet imported

### 2. Gupta et al., 2015 - BioID (PMID: 26638075)
- **Cell** - "A Dynamic Protein Interaction Landscape"
- **Dataset**: Table S1 (56 baits)
- **Method**: BioID (Medium confidence - proximity)
- **Coverage**: Centrosome-cilium interface
- **URL**: https://www.cell.com/cell/fulltext/S0092-8674(15)01443-4
- **Status**: ⏳ Not yet imported

### 3. Sang et al., 2011 - LAP (PMID: 21565611)
- **Cell** - "Mapping the NPHP-JBTS-MKS Protein Network"
- **Dataset**: Table S2 (9 NPHP-JBTS-MKS baits)
- **Method**: LAP (High confidence)
- **Coverage**: Ciliopathy proteins
- **URL**: https://www.cell.com/cell/fulltext/S0092-8674(11)00473-X
- **Status**: ⏳ Not yet imported

## Template for Adding Manual Validation

```javascript
// Add to a script like add_manual_validations.mjs

const MANUAL_VALIDATIONS = [
  {
    bait_uniprot: "Q9Y366",      // IFT52
    prey_uniprot: "Q9NQC8",      // IFT46
    validation: {
      date: "2025-11-08",
      notes: "Core IFT-B complex, stable heterotrimer with IFT88",
      method: "Co-IP",
      source: "Taschner et al., 2011",
      validated: true,
      pmid: "21209330",
      doi: "10.1073/pnas.1100592108",
      source_file: "Literature"
    }
  },
  {
    bait_uniprot: "Q8WYA0",      // IFT81
    prey_uniprot: "Q96LB3",      // IFT74
    validation: {
      date: "2025-11-08",
      notes: "Obligate heterodimer, crystal structure available",
      method: "Co-IP",
      source: "Taschner et al., 2016",
      validated: true,
      pmid: "27344947",
      doi: "10.1038/nsmb.3221",
      source_file: "PDB: 5H80",
      confidence: "very high"  // Has structural data
    }
  },
  {
    bait_uniprot: "Q13099",      // IFT88
    prey_uniprot: "Q9Y366",      // IFT52
    validation: {
      date: "2025-11-08",
      notes: "Core IFT-B complex component",
      method: "Co-IP",
      source: "Lucker et al., 2005",
      validated: true,
      pmid: "16199535",
      doi: "10.1083/jcb.200505155",
      source_file: "Literature"
    }
  }
  // Add more interactions...
];
```

## Priority Interactions to Add

### Highest Priority (Structural Evidence Available)
1. ✅ **IFT81-IFT74** - Crystal structure (PDB: 5H80)
2. ✅ **IFT52-IFT46** - Strong biochemical evidence
3. ✅ **BBS4-BBS8** - Crystal structure

### High Priority (Multiple Independent Studies)
4. **IFT88-IFT52-IFT46** - Core IFT-B trimer
5. **BBSome interactions** - Well-characterized complex
6. **IFT-A core** (IFT144-IFT140-IFT122-IFT121)

### Medium Priority (Large-Scale Studies)
7. Import Boldt et al., 2016 dataset (~50-150 interactions expected)
8. Import Gupta et al., 2015 BioID data
9. Import Sang et al., 2011 LAP data

## Next Steps

1. **Quick wins** - Add ~10-20 high-confidence interactions manually from literature
2. **Automated import** - Run import scripts for large-scale datasets
3. **Update frontend** - Add validation badges to web interface
4. **Statistics** - Create validation dashboard showing:
   - Validation rate by confidence level
   - Coverage by complex (IFT-A, IFT-B, BBSome)
   - Novel predictions not yet validated

## References

Key papers for IFT/BBSome interactions:

- Taschner et al., 2016 - IFT81-IFT74 structure (PMID: 27344947)
- Beyer et al., 2018 - IFT-A architecture (PMID: 29844425)
- Boldt et al., 2016 - Comprehensive proteome (PMID: 27173156)
- Nachury et al., 2007 - BBSome discovery (PMID: 17317642)
- Lucker et al., 2005 - Early IFT-B complex (PMID: 16199535)

---

**Created**: 2025-11-08
**Status**: Ready for data entry
**Contact**: See EXPERIMENTAL_VALIDATION_README.md for import instructions
