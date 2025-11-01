# Quick Reference: Essential IFT UniProt IDs for V4 Analysis Extraction

## Priority 1: Core IFT Complex Proteins (Human)

### Must Query First - IFT-A Complex
```
Q8NEZ3  # IFT144/WDR19
Q96RY7  # IFT140
Q7Z4L5  # IFT139/TTC21B
Q9HBG6  # IFT122
Q9NZJ4  # IFT121/WDR35
Q96FT9  # IFT43
```

### Must Query First - IFT-B Core (IFT-B1)
```
Q13099  # IFT88
Q8WYA0  # IFT81
Q96LB3  # IFT74/CCDC2
Q9Y366  # IFT52
Q9NQC8  # IFT46
Q9BW83  # IFT27/RABL4
```

### Must Query First - IFT-B Peripheral (IFT-B2)
```
Q9UG01  # IFT172
Q9P2H3  # IFT80
Q9NWB7  # IFT57
Q8TDR0  # IFT54/TRAF3IP1
Q6NVG7  # IFT38/CLUAP1
Q8IY31  # IFT20
```

## Priority 2: Motor Proteins (Human)
```
Q9Y496  # KIF3A (anterograde)
O15066  # KIF3B (anterograde)
Q92845  # KIFAP3/KAP3 (anterograde)
Q8NCM8  # DYNC2H1 (retrograde)
Q8TCX1  # DYNC2LI1 (retrograde)
```

## Priority 3: BBSome Complex (Human)
```
Q8NFJ9  # BBS1
Q9BXC9  # BBS2
Q96RK4  # BBS4
Q8N3I7  # BBS5
Q8IWZ6  # BBS7
Q8TAM2  # BBS8/TTC8
```

## Important Aliases to Search (Human proteins with non-IFT names)
```
WDR19    → Q8NEZ3 (IFT144)
TTC21B   → Q7Z4L5 (IFT139)
WDR35    → Q9NZJ4 (IFT121)
CCDC2    → Q96LB3 (IFT74)
TRAF3IP1 → Q8TDR0 (IFT54)
CLUAP1   → Q6NVG7 (IFT38)
HSPB11   → Q9Y547 (IFT25)
RABL4    → Q9BW83 (IFT27)
RABL5    → Q9H7X7 (IFT22)
```

## Chlamydomonas Key Proteins (if needed)
```
A8IQ96  # IFT144
Q2QPA4  # IFT88
A8HW27  # IFT172
P46870  # FLA10 (KIF3A ortholog)
A0A2K3DKS7  # DHC1B (DYNC2H1 ortholog)
```

## Query Template for Your Database
```python
# Example query structure
base_proteins = [
    'Q8NEZ3', 'Q96RY7', 'Q7Z4L5', 'Q9HBG6', 'Q9NZJ4', 'Q96FT9',  # IFT-A
    'Q13099', 'Q8WYA0', 'Q96LB3', 'Q9Y366', 'Q9NQC8', 'Q9BW83',  # IFT-B1
    'Q9UG01', 'Q9P2H3', 'Q9NWB7', 'Q8TDR0', 'Q6NVG7', 'Q8IY31'   # IFT-B2
]

for uniprot_id in base_proteins:
    # Query your database at https://ciliaaf3predictions.vercel.app/
    # Get all interactions where this protein is bait
    # Filter for v4 analysis only
    # Store results with complex membership annotation
```

## Total Proteins to Extract:
- **Human IFT core**: 22 proteins
- **Human IFT-associated**: 28 additional proteins
- **Human total**: ~50 proteins
- **Chlamydomonas**: ~40 proteins
- **Grand total**: ~90 unique proteins

## Critical Success Metrics:
✓ All 6 IFT-A proteins captured
✓ All 16 IFT-B proteins captured
✓ Motor proteins included
✓ BBSome proteins included
✓ All aliases searched
✓ V4 analysis data only
✓ Confidence scores retrieved
✓ Structural metrics (iPTM, iPAE, ipLDDT) captured
