# IFT-A Validation Status

## Summary

**Total IFT-A validations ready**: 30 interactions from 7 papers/datasets
- IFT-A internal: 28 interactions
- TULP3-IFT-A cargo adapter: 2 interactions

### Papers Processed

1. **Hesketh et al., Cell 2022** ✅
   - Script: `add_hesketh_2022_validations.mjs`
   - Validations: 6
   - Method: Cryo-EM (3-4 Å resolution)
   - Species: *Homo sapiens* (Human)
   - PMID: 36462505

2. **Jiang et al., Cell Research 2023** ✅
   - Script: `add_jiang_2023_validations.mjs`
   - Validations: 2
   - Method: Cryo-EM (3.0-3.9 Å resolution)
   - Species: *Homo sapiens* (Human)
   - Authors: Ji Sun group
   - PMID: 36775821
   - Notable: Discovered zinc-binding domains linking subcomplexes

3. **Behal et al., JBC 2012** ✅
   - Script: `add_behal_2012_validations.mjs`
   - Validations: 6 (3 high confidence, 3 medium confidence)
   - Methods: Biochemical reconstitution + Y2H
   - PMID: 22275356
   - Notable: First study identifying IFT144/140/122 core subcomplex

4. **McCafferty et al., eLife 2022** ✅
   - Script: `add_mccafferty_2022_validations.mjs`
   - Validations: 6
   - Method: XL-MS (DSSO crosslinking mass spectrometry)
   - Species: *Homo sapiens* (Human)
   - PMID: 36346217
   - Notable: Integrative modeling with XL-MS + AlphaFold2

5. **Meleppattu et al., Cell 2022** ✅
   - Script: `add_meleppattu_2022_validations.mjs`
   - Validations: 8
   - Method: Cryo-EM (high resolution)
   - Species: *Leishmania tarentolae* (parasitic protozoan)
   - PMID: 36563665
   - DOI: 10.1016/j.cell.2022.11.033
   - Notable: Native IFT-A complex, cross-species validation

6. **TULP3-IFT-A Cargo Adapter** ✅
   - Script: `add_tulp3_ifta_validations.mjs`
   - Validations: 2 (TULP3 ↔ IFT122, TULP3 ↔ IFT140)
   - Method: Cryo-EM
   - Papers: Jiang et al., 2023 and Hesketh et al., 2022
   - Notable: TULP3 N-terminal helix binds IFT-A for membrane protein cargo

7. **Lacey et al., Nat Struct Mol Biol 2023** ✅
   - Method: Cryo-ET (10-18 Å resolution) - **Train architecture, NOT high-res structure**
   - Species: *Chlamydomonas reinhardtii*
   - PMID: 36593313
   - DOI: 10.1038/s41594-022-00905-5
   - PDB: 8BDA
   - Focus: In situ IFT-A/IFT-B polymerization and anterograde train architecture
   - Notable: Conformational changes dependent on lateral interactions with neighboring repeats

### Papers Identified But Not Extracted

8. **Ma et al., Nat Commun 2023**
   - Tetrahymena IFT-A conformational states
   - PMID: 36932088
   - Focus: Conformational changes during train assembly

## IFT-A Interactions Validated

### Core Subcomplex (IFT144/140/122)

| Interaction | Papers | Methods | Status |
|-------------|--------|---------|--------|
| IFT144 ↔ IFT140 | Hesketh 2022, Behal 2012 | Cryo-EM, Biochemical | ✅ Ready |
| IFT140 ↔ IFT122 | Behal 2012 | Biochemical reconstitution | ✅ Ready |
| IFT122 ↔ IFT144 | Hesketh 2022, Behal 2012 | Cryo-EM, Biochemical | ✅ Ready |

### Peripheral Subcomplex (IFT43/121/139)

| Interaction | Papers | Methods | Status |
|-------------|--------|---------|--------|
| IFT121 ↔ IFT43 | Hesketh 2022, Behal 2012 | Cryo-EM, Y2H + E. coli | ✅ Ready |
| IFT43 ↔ IFT139 | Hesketh 2022 | Cryo-EM | ✅ Ready |
| IFT121 ↔ IFT139 | Behal 2012 | Y2H | ✅ Ready |

### Module-Bridging Interactions

| Interaction | Papers | Methods | Status |
|-------------|--------|---------|--------|
| IFT122 ↔ IFT121 | Hesketh 2022, Behal 2012 | Cryo-EM, Y2H | ✅ Ready |
| IFT122 ↔ IFT139 | Hesketh 2022 | Cryo-EM | ✅ Ready |
| IFT140 ↔ IFT121 | Jiang 2023 | Cryo-EM | ✅ Ready |
| IFT121 ↔ IFT144 | Jiang 2023 | Cryo-EM | ✅ Ready |

### McCafferty 2022 XL-MS

| Interaction | Method | Status |
|-------------|--------|--------|
| IFT121 ↔ IFT122 | XL-MS | ✅ Ready |
| IFT121 ↔ IFT139 | XL-MS | ✅ Ready |
| IFT121 ↔ IFT43 | XL-MS | ✅ Ready |
| IFT122 ↔ IFT140 | XL-MS | ✅ Ready |
| IFT122 ↔ IFT144 | XL-MS | ✅ Ready |
| IFT140 ↔ IFT144 | XL-MS | ✅ Ready |

### Meleppattu 2022 Cryo-EM (Leishmania)

| Interaction | Method | Species | Status |
|-------------|--------|---------|--------|
| IFT121 ↔ IFT122 | Cryo-EM | *Leishmania* | ✅ Ready |
| IFT140 ↔ IFT144 | Cryo-EM | *Leishmania* | ✅ Ready |
| IFT139 ↔ IFT122 | Cryo-EM | *Leishmania* | ✅ Ready |
| IFT139 ↔ IFT121 | Cryo-EM | *Leishmania* | ✅ Ready |
| IFT139 ↔ IFT43 | Cryo-EM | *Leishmania* | ✅ Ready |
| IFT140 ↔ IFT43 | Cryo-EM | *Leishmania* | ✅ Ready |
| IFT140 ↔ IFT139 | Cryo-EM | *Leishmania* | ✅ Ready |
| IFT144 ↔ IFT43 | Cryo-EM | *Leishmania* | ✅ Ready |

### TULP3-IFT-A Cargo Adapter

| Interaction | Papers | Method | Status |
|-------------|--------|--------|--------|
| TULP3 ↔ IFT122 | Jiang 2023, Hesketh 2022 | Cryo-EM | ✅ Ready |
| TULP3 ↔ IFT140 | Jiang 2023, Hesketh 2022 | Cryo-EM | ✅ Ready |

## Running the Scripts

```bash
# Set database connection
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# Run IFT-A validation scripts
node add_hesketh_2022_validations.mjs
node add_jiang_2023_validations.mjs
node add_behal_2012_validations.mjs
node add_mccafferty_2022_validations.mjs
node add_meleppattu_2022_validations.mjs
node add_tulp3_ifta_validations.mjs
```

## Notes

- All scripts check for existing validations before adding new ones
- Scripts search bidirectionally (bait↔prey and prey↔bait)
- Human UniProt IDs used for all IFT-A proteins
- Scripts will skip interactions not found in database

## UniProt IDs for Human IFT-A Proteins

| Protein | UniProt | Gene Name | Alternative Names |
|---------|---------|-----------|-------------------|
| IFT144 | Q8NEZ3 | WDR19 | - |
| IFT140 | Q96RY7 | IFT140 | - |
| IFT139 | Q7Z4L5 | TTC21B | - |
| IFT122 | Q9HBG6 | IFT122 | - |
| IFT121 | Q9P2L0 | WDR35 | - |
| IFT43 | Q96FT9 | IFT43 | C14orf179 |

---

**Last Updated**: 2025-11-10
**Status**: 30 validations ready (28 IFT-A + 2 TULP3-IFT-A) from 7 papers ✅

## Structural Methods Summary

- **High-resolution cryo-EM (3-4 Å)**:
  - Hesketh 2022 (Human)
  - Jiang 2023 (Human, Ji Sun group)
  - Meleppattu 2022 (Leishmania tarentolae)
- **Cryo-ET train architecture (10-18 Å)**: Lacey 2023 (Chlamydomonas)
- **XL-MS**: McCafferty 2022 (Human, integrative modeling)
- **Biochemical/Y2H**: Behal 2012
