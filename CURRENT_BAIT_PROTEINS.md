# Complete Bait Protein List - IFT Interactors Project

## Current Baits in Database (31 proteins) + 3 In Progress

### IFT-A Complex (6 proteins)
| UniProt ID | Gene Name | Alternative Names |
|------------|-----------|-------------------|
| Q96FT9 | IFT43 | C14orf179 |
| Q9P2L0 | IFT121 | WDR35 |
| Q9HBG6 | IFT122 | WDR10 |
| Q7Z4L5 | IFT139 | TTC21B |
| Q96RY7 | IFT140 | WDTC2 |
| Q8NEZ3 | IFT144 | WDR19 |

### IFT-B1 Complex (9 proteins)
| UniProt ID | Gene Name | Alternative Names |
|------------|-----------|-------------------|
| Q9H7X7 | IFT22 | RABL5 |
| Q9Y547 | IFT25 | HSPB11 |
| Q9BW83 | IFT27 | RABL4 |
| Q9NQC8 | IFT46 | - |
| Q9Y366 | IFT52 | NGD5 |
| A0AVF1 | IFT56 | TTC26 |
| Q96LB3 | IFT74 | CCDC2, CMG1 |
| Q8WYA0 | IFT81 | CDV1 |
| Q13099 | IFT88 | TG737, DAF19 |

### IFT-B2 Complex (7 proteins + 1 MISSING)
| UniProt ID | Gene Name | Alternative Names | Status |
|------------|-----------|-------------------|--------|
| Q8IY31 | IFT20 | - | ✅ In DB |
| Q96AJ1 | IFT38 | CLUAP1 | ✅ In DB |
| Q8TDR0 | IFT54 | TRAF3IP1, MIPT3 | ✅ In DB |
| Q9NWB7 | IFT57 | ESRRBL1, HIPPI | ✅ In DB |
| Q86WT1 | IFT70 | TTC30A (isoform A) | ✅ In DB |
| Q8N4P2 | IFT70 | TTC30B (isoform B) | ✅ In DB |
| Q9P2H3 | IFT80 | WDR56 | ✅ In DB |
| ❌ **Q9UG01** | **IFT172** | SLB, KIAA1179 | ❌ **MISSING** |

### BBSome Complex (8 proteins)
| UniProt ID | Gene Name | Alternative Names | Status |
|------------|-----------|-------------------|--------|
| Q8NFJ9 | BBS1 | - | ✅ In DB |
| Q9BXC9 | BBS2 | - | ✅ In DB |
| Q9H0F7 | BBS3 | ARL6 | ✅ In DB |
| Q96RK4 | BBS4 | - | ✅ In DB |
| Q8N3I7 | BBS5 | - | ✅ In DB |
| Q8IWZ6 | BBS7 | - | ✅ In DB |
| Q8TAM2 | BBS8 | TTC8 | ✅ In DB |
| Q9NQ48 | BBS17 | LZTFL1 | ✅ In DB |

### BBSome-Associated Proteins (2 proteins - IN PROGRESS)
| UniProt ID | Gene Name | Alternative Names | Status |
|------------|-----------|-------------------|--------|
| Q3SYG4 | BBS9 | PTHB1 | 🔄 **GENERATING** |
| Q5T192 | BBS18 | BBIP1 | 🔄 **GENERATING** |

**Note**: BBS10 and BBS12 are chaperonins (not BBSome structural components) and have been REMOVED.

### IFT-Associated Proteins (2 proteins)
| UniProt ID | Gene Name | Alternative Names | Status |
|------------|-----------|-------------------|--------|
| O75386 | TULP3 | RP26, Tubby-related protein 3 | ✅ In DB |
| Q9NX57 | RABL2 | RABL2A | 🔄 **GENERATING** |

## Current Status Summary

### ✅ In Database (31 proteins)
- **IFT-A**: 6 proteins
- **IFT-B1**: 9 proteins
- **IFT-B2**: 7 proteins (MISSING: IFT172)
- **BBSome**: 8 proteins
- **IFT-associated**: 1 protein (TULP3)

### 🔄 In Progress / To Add (4 proteins)
- **IFT172** (Q9UG01) - IFT-B2 core component - ❌ CRITICAL MISSING
- **RABL2** (Q9NX57) - IFT-associated GTPase
- **BBS9** (Q3SYG4) - BBSome core subunit
- **BBS18** (Q5T192) - BBSome-interacting protein

### ❌ Removed from Dataset
- **BBS10** (Q8TAM1) - Chaperonin, not structural BBSome component
- **BBS12** (Q6ZW61) - Chaperonin, not structural BBSome component

## Complete Summary

### Currently in Database: 31 baits
- **IFT-A**: 6 proteins
- **IFT-B1**: 9 proteins
- **IFT-B2**: 7 proteins (including both IFT70 isoforms)
- **BBSome**: 8 proteins (core structural components)
- **IFT-associated**: 1 protein (TULP3)

### To Add: 4 proteins
1. **IFT172** (Q9UG01) - ❌ **CRITICAL** - Core IFT-B2 component
2. **RABL2** (Q9NX57) - IFT-associated GTPase
3. **BBS9** (Q3SYG4) - BBSome core subunit
4. **BBS18** (Q5T192) - BBSome-interacting protein

### After Addition: 35 total baits
- **IFT-A**: 6
- **IFT-B1**: 9
- **IFT-B2**: 8 (will include IFT172)
- **BBSome**: 10 (8 core + BBS9 + BBS18)
- **IFT-associated**: 2 (TULP3 + RABL2)

## File Locations

All current v4.json files are in:
```
/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/
```

Pattern: `{UniProt}_{GeneName}/AF3/AF3_PD_analysis_v4.json`

### New Files to Add (once generated):
```
/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9UG01_IFT172/AF3/AF3_PD_analysis_v4.json
/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q9NX57_RABL2/AF3/AF3_PD_analysis_v4.json
/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q3SYG4_BBS9/AF3/AF3_PD_analysis_v4.json
/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/Q5T192_BBS18/AF3/AF3_PD_analysis_v4.json
```

### Files to REMOVE from import (if present):
```
Q8TAM1_BBS10  # Chaperonin, not structural component
Q6ZW61_BBS12  # Chaperonin, not structural component
```

---

**Status**: Awaiting AF3 data for IFT172, RABL2, BBS9, and BBS18 to complete the comprehensive IFT/BBSome interactome.
