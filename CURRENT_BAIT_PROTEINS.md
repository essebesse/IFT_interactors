# Complete Bait Protein List - IFT Interactors Project

## Current Baits in Database (33 proteins)

### IFT-A Complex (6 proteins)
| UniProt ID | Gene Name | Alternative Names |
|------------|-----------|-------------------|
| Q9P2L0 | IFT121 | WDR35 |
| Q9HBG6 | IFT122 | WDR10 |
| Q7Z4L5 | IFT139 | TTC21B |
| Q96RY7 | IFT140 | WDTC2 |
| Q8NEZ3 | IFT144 | WDR19 |
| Q96AJ1 | IFT38 | CLUAP1 |

### IFT-B Complex (16 proteins)
| UniProt ID | Gene Name | Alternative Names |
|------------|-----------|-------------------|
| Q8IY31 | IFT20 | - |
| Q9H7X7 | IFT22 | RABL5 |
| Q9Y547 | IFT25 | HSPB11 |
| Q9BW83 | IFT27 | RABL4 |
| Q96FT9 | IFT43 | C14orf179 |
| Q9NQC8 | IFT46 | - |
| Q9Y366 | IFT52 | NGD5 |
| Q8TDR0 | IFT54 | TRAF3IP1, MIPT3 |
| A0AVF1 | IFT56 | TTC26 |
| Q9NWB7 | IFT57 | ESRRBL1, HIPPI |
| Q86WT1 | IFT70 | TTC30A (isoform A) |
| Q8N4P2 | IFT70 | TTC30B (isoform B) |
| Q96LB3 | IFT74 | CCDC2, CMG1 |
| Q9P2H3 | IFT80 | WDR56 |
| Q8WYA0 | IFT81 | CDV1 |
| Q13099 | IFT88 | TG737, DAF19 |

### BBSome Complex (10 proteins) ✅ COMPLETE!
| UniProt ID | Gene Name | Alternative Names | Status |
|------------|-----------|-------------------|--------|
| Q8NFJ9 | BBS1 | - | ✅ In DB |
| Q9BXC9 | BBS2 | - | ✅ In DB |
| Q9H0F7 | BBS3 | ARL6 | ✅ In DB |
| Q96RK4 | BBS4 | - | ✅ In DB |
| Q8N3I7 | BBS5 | - | ✅ In DB |
| Q8IWZ6 | BBS7 | - | ✅ In DB |
| Q8TAM2 | BBS8 | TTC8 | ✅ In DB |
| Q8TAM1 | BBS10 | - | ✅ In DB |
| Q6ZW61 | BBS12 | - | ✅ In DB |
| Q9NQ48 | BBS17 | LZTFL1 | ✅ In DB |

**Note**: BBS3 and BBS17 are **already in your database**! The BBSome is complete.

### IFT-Associated Proteins (1 protein)
| UniProt ID | Gene Name | Alternative Names |
|------------|-----------|-------------------|
| O75386 | TULP3 | RP26, Tubby-related protein 3 |

## Proteins You Mentioned Adding

### ✅ Already in Database
- **BBS3** (Q9H0F7) - Already imported as "BBS3_ARL6"
- **BBS17** (Q9NQ48) - Already imported as "BBS17"

### ❓ New Proteins to Add?
- **RABL2** (Q9NX57) - NOT YET in database
  - Also known as: RABL2A
  - Function: Small GTPase, involved in ciliogenesis
  - Associated with IFT-B complex

## Missing BBSome Proteins?

The canonical BBSome has **8 core subunits**:
- BBS1, BBS2, BBS4, BBS5, BBS7, BBS8, BBS9, BBS18

You have:
- ✅ BBS1, BBS2, BBS4, BBS5, BBS7, BBS8 (core members)
- ✅ BBS3 (ARL6) - regulatory GTPase
- ✅ BBS10, BBS12 - chaperonins for BBSome assembly
- ✅ BBS17 (LZTFL1) - regulatory protein

### Potentially Missing
- ❌ **BBS9** (Q3SYG4 or PTHB1) - Core BBSome subunit
- ❌ **BBS18** (BBIP1, Q5T192) - BBSome-interacting protein

Did you intend to add BBS9? It's a core BBSome member.

## Complete Summary

**Currently in database**: 33 baits
- IFT-A: 6
- IFT-B: 16 (including both IFT70 isoforms)
- BBSome: 10
- IFT-associated: 1 (TULP3)

**Potentially to add**:
- RABL2 (Q9NX57) - if you're generating this data
- BBS9 (Q3SYG4) - core BBSome member, currently missing
- BBS18/BBIP1 (Q5T192) - BBSome-interacting protein

## File Locations

All current v4.json files are in:
```
/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/
```

Pattern: `{UniProt}_{GeneName}/AF3/AF3_PD_analysis_v4.json`

---

**Question**: Are you generating AF3 data for **RABL2** and/or **BBS9**? Those would be the main additions to complete the set.
