# Experimental Validation Scripts - Complete Guide

## Overview

**Total validation scripts**: 18
**Total validations ready**: 118 interactions
**IFT-B validations**: 47
**IFT-A validations**: 20
**BBSome validations**: 49
**TULP3-IFT-A validations**: 2

## Complete Script List

### IFT-B Validations (47 total)

#### 1. `add_single_validation.mjs` - 1 validation
- **Paper**: Bhogaraju et al., 2011
- **Method**: Crystal structure
- **Confidence**: High
- **Interaction**: IFT27 ↔ IFT25

#### 2. `add_structural_validations.mjs` - 11 validations
- **Papers**: Taschner et al., 2014, 2011; Wachter et al., 2019
- **Methods**: Crystal structure, Biochemical reconstitution
- **Confidence**: High
- **Interactions**: IFT70-52, IFT52-46, IFT74-81, IFT22-IFT74/81, IFT27-IFT74/81

#### 3. `add_iftb2_validations.mjs` - 11 validations
- **Paper**: Taschner et al., 2016
- **Methods**: Biochemical reconstitution, Y2H, Pulldown
- **Confidence**: High (biochemical), Medium (Y2H/pulldown)
- **Interactions**: IFT-B2 peripheral subcomplex (IFT20-54-57-38, IFT172-57, IFT80-38)

#### 4. `add_petriman_xl_validations.mjs` - 7 validations
- **Paper**: Petriman et al., 2022
- **Method**: XL-MS
- **Confidence**: High
- **Interactions**: IFT88 interactions with IFT70, IFT81/74, IFT57, IFT38

#### 5. `add_petriman_additional_validations.mjs` - 16 validations
- **Paper**: Petriman et al., 2022
- **Methods**: Crystal structure, XL-MS, Pulldown
- **Confidence**: High (crystal/XL-MS), Medium (pulldown)
- **Interactions**: IFT-B core and peripheral, IFT172-IFT80

#### 6. `add_taschner_2014_validation.mjs` - 1 validation
- **Paper**: Taschner et al., 2014
- **Method**: Pulldown/Co-purification
- **Confidence**: High
- **Interaction**: IFT52 ↔ IFT74

---

### IFT-A Validations (20 total)

#### 7. `add_hesketh_2022_validations.mjs` - 6 validations
- **Paper**: Hesketh et al., Cell 2022
- **Method**: Cryo-EM (3-4 Å resolution)
- **PMID**: 36462505
- **Confidence**: High
- **Interactions**:
  - IFT144 ↔ IFT140 (IFT-A1 module)
  - IFT122 ↔ IFT121 (IFT-A2 module)
  - IFT43 ↔ IFT121, IFT43 ↔ IFT139
  - IFT122 ↔ IFT144, IFT122 ↔ IFT139 (module bridging)

#### 8. `add_jiang_2023_validations.mjs` - 2 validations
- **Paper**: Jiang et al., Cell Research 2023
- **Method**: Cryo-EM (3.0-3.9 Å resolution)
- **PMID**: 36775821
- **Confidence**: High
- **Notable**: Discovered zinc-binding domains
- **Interactions**: IFT140 ↔ IFT121, IFT121 ↔ IFT144

#### 9. `add_behal_2012_validations.mjs` - 6 validations
- **Paper**: Behal et al., JBC 2012
- **Methods**: Biochemical reconstitution, Y2H
- **PMID**: 22275356
- **Confidence**: High (biochemical), Medium (Y2H)
- **Notable**: First comprehensive IFT-A organization study
- **Interactions**:
  - IFT140 ↔ IFT122, IFT140 ↔ IFT144, IFT122 ↔ IFT144 (12S core)
  - IFT121 ↔ IFT43, IFT121 ↔ IFT139, IFT121 ↔ IFT122

#### 10. `add_mccafferty_2022_validations.mjs` - 6 validations
- **Paper**: McCafferty et al., eLife 2022
- **Method**: XL-MS (DSSO crosslinking)
- **PMID**: 36346217
- **Confidence**: High
- **Notable**: Integrative modeling combining XL-MS + cryo-ET + AlphaFold2
- **Interactions**:
  - IFT121 ↔ IFT122, IFT121 ↔ IFT139, IFT121 ↔ IFT43
  - IFT122 ↔ IFT140, IFT122 ↔ IFT144, IFT140 ↔ IFT144

---

### TULP3-IFT-A Cargo Adapter (2 total)

#### 11. `add_tulp3_ifta_validations.mjs` - 2 validations
- **Papers**: Jiang et al., 2023 and Hesketh et al., 2022
- **Method**: Cryo-EM
- **Confidence**: High
- **Notable**: TULP3 N-terminal helix binds IFT-A for membrane protein cargo transport
- **Interactions**: TULP3 ↔ IFT122, TULP3 ↔ IFT140

---

### BBSome Complex (49 total)

#### 12. `add_singh_2020_bbsome_validations.mjs` - 12 validations
- **Paper**: Singh et al., eLife 2020
- **Method**: Cryo-EM (3.1 Å inactive + 3.5 Å active with ARL6)
- **PMID**: 31939736
- **Confidence**: High
- **Notable**: Complete BBSome architecture; ARL6 activation mechanism
- **Interactions**: Head (BBS2-BBS7), Neck (BBS2/7-BBS9), Body (BBS1/4/5/8), ARL6 activation

#### 13. `add_chou_2019_bbsome_validations.mjs` - 15 validations
- **Paper**: Chou et al., Structure 2019
- **Method**: Cryo-EM (4.9 Å) + XL-MS (42 inter-subunit crosslinks) + Rosetta modeling
- **PMID**: 31303482
- **Confidence**: High
- **Notable**: Integrated structural approach; BBS18 U-bolt clamping mechanism
- **Interactions**: Complete BBSome architecture including BBS18 threading through BBS4/8 TPR domains

#### 14. `add_yang_2020_bbsome_validations.mjs` - 7 validations
- **Paper**: Yang et al., eLife 2020
- **Method**: Cryo-EM (~3.5 Å)
- **PMID**: 32510327
- **Confidence**: High
- **Notable**: BBSome-ARL6 with GPCR cargo; conformational changes upon activation
- **Interactions**: ARL6-BBS1, ARL6-BBS7, GPCR cargo binding cavity

#### 15. `add_klink_2020_bbsome_validations.mjs` - 8 validations
- **Paper**: Klink et al., eLife 2020
- **Method**: Cryo-EM (~3.8 Å)
- **PMID**: 31951201
- **Confidence**: High
- **Notable**: Human heterohexameric core (BBS1/4/5/8/9/18); lacks BBS2/7
- **Interactions**: Core BBSome assembly without head module

#### 16. `add_klink_2017_validations.mjs` - 6 validations
- **Paper**: Klink et al., eLife 2017
- **Method**: Biochemical reconstitution + Pulldowns
- **PMID**: 29168691
- **Confidence**: High (3) + Medium (3)
- **Notable**: First recombinant BBSome subcomplexes; BBS18-BBS4-BBS8 tetrameric core
- **Interactions**: BBS18-BBS4, BBS18-BBS8, BBS4-BBS8 (high); BBS1/5/8 co-purification (medium)

#### 17. `add_mourao_2014_bbsome_validation.mjs` - 1 validation
- **Paper**: Mourão et al., Nat Struct Mol Biol 2014
- **Method**: Crystal structure
- **PMID**: 25402481
- **Confidence**: High
- **Notable**: Foundational ARL6-GTP membrane recruitment; Kd=0.35 μM; PDB: 4V0M
- **Interaction**: ARL6-GTP ↔ BBS1 (blades 1 and 7)

---

### Combined/Legacy Scripts

#### 18. `add_manual_validations.mjs`
- **Status**: Combined script with all validations
- **Purpose**: Backup/reference
- **Note**: Use individual scripts above for better organization

---

## Running the Scripts

### Prerequisites

```bash
# Set database connection
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"
```

### Execution Order

Run scripts in any order - they check for existing validations:

```bash
# IFT-B validations
node add_structural_validations.mjs          # 11 validations
node add_iftb2_validations.mjs               # 11 validations
node add_petriman_xl_validations.mjs         # 7 validations
node add_petriman_additional_validations.mjs # 16 validations
node add_single_validation.mjs               # 1 validation
node add_taschner_2014_validation.mjs        # 1 validation

# IFT-A validations
node add_hesketh_2022_validations.mjs        # 6 validations
node add_jiang_2023_validations.mjs          # 2 validations
node add_behal_2012_validations.mjs          # 6 validations
node add_mccafferty_2022_validations.mjs     # 6 validations
node add_tulp3_ifta_validations.mjs          # 2 validations

# BBSome validations
node add_singh_2020_bbsome_validations.mjs   # 12 validations
node add_chou_2019_bbsome_validations.mjs    # 15 validations
node add_yang_2020_bbsome_validations.mjs    # 7 validations
node add_klink_2020_bbsome_validations.mjs   # 8 validations
node add_klink_2017_validations.mjs          # 6 validations
node add_mourao_2014_bbsome_validation.mjs   # 1 validation

# Check final status
node check_validation_status.mjs
```

### One-Liner

```bash
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb" && \
node add_structural_validations.mjs && \
node add_iftb2_validations.mjs && \
node add_petriman_xl_validations.mjs && \
node add_petriman_additional_validations.mjs && \
node add_single_validation.mjs && \
node add_taschner_2014_validation.mjs && \
node add_hesketh_2022_validations.mjs && \
node add_jiang_2023_validations.mjs && \
node add_behal_2012_validations.mjs && \
node add_mccafferty_2022_validations.mjs && \
node add_tulp3_ifta_validations.mjs && \
node add_singh_2020_bbsome_validations.mjs && \
node check_validation_status.mjs
```

---

## Validation Summary by Method

| Method | Count | Confidence |
|--------|-------|------------|
| Cryo-EM | 20 | High |
| Crystal structure | 20 | High |
| XL-MS | 23 | High |
| Biochemical reconstitution | 14 | High |
| Pulldown | 6 | Medium-High |
| Y2H | 5 | Medium |

**Total high confidence**: 77+ (includes multi-method validations)
**Total medium confidence**: ~11

**Note**: Cryo-EM count includes 12 new BBSome interactions from Singh et al., 2020

---

## Papers Covered

### IFT-B Papers

1. Bhogaraju et al., EMBO J 2011 - IFT27/25 structure
2. Taschner et al., JCB 2014 - IFT70/52, IFT52/46, IFT-B core
3. Taschner et al., EMBO J 2016 - IFT-B2 subcomplex
4. Wachter et al., EMBO J 2019 - IFT22-IFT81/74 structure
5. Petriman et al., EMBO J 2022 - Comprehensive IFT-B (XL-MS + structures)
6. Taschner et al., JBC 2011 - IFT70/52 biochemical reconstitution

### IFT-A Papers

7. Hesketh et al., Cell 2022 - Human IFT-A cryo-EM structure
8. Jiang et al., Cell Research 2023 - IFT-A with TULP3, zinc domains
9. Behal et al., JBC 2012 - Chlamydomonas IFT-A organization
10. McCafferty et al., eLife 2022 - Tetrahymena IFT-A XL-MS + integrative modeling

### TULP3-IFT-A

11. Jiang et al., Cell Research 2023 - IFT-A + TULP3 cryo-EM structure
12. Hesketh et al., Cell 2022 - IFT-A carriages for TULP adaptors

### BBSome Papers

13. Singh et al., eLife 2020 - Complete BBSome structure and ARL6 activation mechanism

---

## Validation Features

All scripts include:

- ✅ Bidirectional search (bait↔prey and prey↔bait)
- ✅ Duplicate detection (skip if already validated)
- ✅ Not found reporting (interaction not in database)
- ✅ Summary statistics (added/not found/already validated)
- ✅ JSONB format matching frontend display
- ✅ UniProt ID mapping for human proteins

---

## Database Schema

Validations stored in `interactions.experimental_validation` JSONB field:

```json
{
  "experimental_methods": [{
    "method": "Cryo-EM",
    "study": "Hesketh et al., 2022",
    "pmid": "36462505",
    "confidence": "high",
    "notes": "TPR-mediated heterodimer; IFT-A1 module"
  }],
  "validation_summary": {
    "is_validated": true,
    "validation_count": 1,
    "strongest_method": "Cryo-EM",
    "consensus_confidence": "high"
  }
}
```

---

## Next Steps

1. **Run all scripts** on database with network access
2. **Verify validations** using `check_validation_status.mjs`
3. ✅ **ADDED: Singh 2020 BBSome** (12 interactions)
4. **Consider additional papers**:
   - Lacey et al., Nat Struct Mol Biol 2023 (IFT-A in trains)
   - Ma et al., Nat Commun 2023 (IFT-A conformational states)
   - Ye et al., Nature 2023 (Human BBSome core complex structure)
   - Klink et al., EMBO J 2020 (BBS4-BBS8 structure)
   - Additional BBSome-ARL6 interaction validations

---

**Created**: 2025-11-08
**Last Updated**: 2025-11-08 (Added Singh 2020 BBSome validations)
**Status**: 81 validations ready for database upload (47 IFT-B + 20 IFT-A + 12 BBSome + 2 TULP3-IFT-A)
