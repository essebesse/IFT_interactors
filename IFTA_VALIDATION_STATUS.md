# IFT-A Validation Status

## Summary

**Total IFT-A validations ready**: 14 interactions from 3 papers

### Papers Processed

1. **Hesketh et al., Cell 2022** ✅
   - Script: `add_hesketh_2022_validations.mjs`
   - Validations: 6
   - Method: Cryo-EM (3-4 Å resolution)
   - PMID: 36462505

2. **Jiang et al., Cell Research 2023** ✅
   - Script: `add_jiang_2023_validations.mjs`
   - Validations: 2
   - Method: Cryo-EM (3.0-3.9 Å resolution)
   - PMID: 36775821
   - Notable: Discovered zinc-binding domains linking subcomplexes

3. **Behal et al., JBC 2012** ✅
   - Script: `add_behal_2012_validations.mjs`
   - Validations: 6 (3 high confidence, 3 medium confidence)
   - Methods: Biochemical reconstitution + Y2H
   - PMID: 22275356
   - Notable: First study identifying IFT144/140/122 core subcomplex

### Papers Pending

4. **McCafferty et al., eLife 2022** ⏳ NEEDS SUPPLEMENTARY FILES
   - Expected validations: ~6-10 unique interactions from 29 XL-MS crosslinks
   - Method: DSSO crosslinking mass spectrometry
   - PMID: 36346217
   - Data locations:
     - ProteomeXchange: PXD032818
     - Zenodo: 10.5281/zenodo.7222413
     - eLife supplementary files
   - **Action needed**: Download supplementary tables with crosslink data

### Papers Identified But Not Extracted

5. **Lacey et al., Nat Struct Mol Biol 2023**
   - In situ cryo-ET of IFT trains
   - PMID: 36593313
   - Focus: IFT-A polymerization and train architecture
   - May contain additional interaction details

6. **Ma et al., Nat Commun 2023**
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

### Expected from McCafferty 2022 XL-MS (when data available)

| Interaction | Method | Status |
|-------------|--------|--------|
| IFT121 ↔ IFT122 | XL-MS | ⏳ Pending data |
| IFT140 ↔ IFT144 | XL-MS | ⏳ Pending data |
| IFT122 ↔ IFT144 | XL-MS | ⏳ Pending data |
| IFT122 ↔ IFT43 | XL-MS | ⏳ Pending data |
| IFT43 ↔ IFT121 | XL-MS | ⏳ Pending data |
| Additional crosslinks | XL-MS | ⏳ Pending data |

## Running the Scripts

```bash
# Set database connection
export POSTGRES_URL="postgresql://neondb_owner:npg_ao9EVm2UnCXw@ep-empty-brook-agstlbfq-pooler.c-2.eu-central-1.aws.neon.tech/neondb"

# Run IFT-A validation scripts
node add_hesketh_2022_validations.mjs
node add_jiang_2023_validations.mjs
node add_behal_2012_validations.mjs

# When McCafferty data is available:
# node add_mccafferty_2022_validations.mjs
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

**Last Updated**: 2025-11-08
**Status**: 14 validations ready, McCafferty XL-MS pending supplementary file access
