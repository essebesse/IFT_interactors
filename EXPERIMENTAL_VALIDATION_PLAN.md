# Experimental Validation Integration Plan

## Overview
Integrate experimental cilia proteomics data from 7 key publications to validate AF3 predictions. The database already has an `experimental_validation JSONB` field ready to use.

## JSONB Structure Design

```json
{
  "experimental_methods": [
    {
      "method": "SF-TAP-MS",           // or "BioID", "APEX2", "LAP", etc.
      "study": "Boldt et al., 2016",
      "pmid": "27173156",
      "confidence": "high",             // high/medium/low based on method
      "bait_protein": "IFT88",          // Which protein was used as bait
      "notes": "Direct interaction, 217 baits screened"
    }
  ],
  "validation_summary": {
    "is_validated": true,
    "validation_count": 2,              // Number of studies confirming this interaction
    "strongest_method": "SF-TAP-MS",   // Most direct/reliable method
    "consensus_confidence": "high"
  }
}
```

## Implementation Strategy

### Phase 1: Dataset Acquisition & Parsing (Week 1)

#### 1.1 Boldt et al., 2016 (SF-TAP-MS - HIGHEST PRIORITY)
- **Why first**: 217 baits, most comprehensive, direct physical interactions
- **Dataset**: Supplementary Data 1 from Nature Communications paper
- **Format**: Likely Excel/CSV with columns: Bait, Prey, Score, etc.
- **Action**: Download, parse, extract unique bait-prey pairs
- **Challenge**: Map protein names to UniProt IDs

#### 1.2 Gupta et al., 2015 (BioID)
- **Dataset**: Table S1 - 56 centrosome-cilium baits
- **Format**: Excel/CSV
- **Note**: Proximity labeling (not direct binding), mark as "proximity"

#### 1.3 Sang et al., 2011 (LAP method)
- **Dataset**: Table S2
- **Format**: Excel/CSV
- **Note**: 9 NPHP-JBTS-MKS proteins, relevant for ciliopathy proteins

#### 1.4-1.7 APEX Studies (Mick, Kohli, May, Aslanyan)
- **Challenge**: Some in PRIDE repository, need programmatic access
- **Priority**: Medium (complement TAP-MS data)

### Phase 2: UniProt ID Mapping System (Week 1-2)

Create a robust mapping system to handle:
- Gene names (BBS7, IFT88) → UniProt IDs (Q8IWZ6, Q13099)
- Alternative names/aliases
- Different organisms (though we focus on human)

**Script**: `scripts/map_protein_ids.mjs`

```javascript
// Pseudo-code
async function mapToUniProt(geneName, organism = 'human') {
  // 1. Check local protein table first
  // 2. Check protein_aliases table
  // 3. Query UniProt API if not found
  // 4. Cache result
  return uniprot_id;
}
```

### Phase 3: Data Import Scripts (Week 2)

**Main Script**: `scripts/import_experimental_data.mjs`

```javascript
// Pseudo-code structure
import { sql } from '@vercel/postgres';

const EXPERIMENTAL_DATASETS = [
  {
    name: 'Boldt et al., 2016',
    pmid: '27173156',
    method: 'SF-TAP-MS',
    confidence: 'high',
    dataFile: './experimental_data/boldt_2016_supp_data_1.csv',
    parser: parseBoldt2016
  },
  // ... other datasets
];

async function updateInteractionWithValidation(bait_uniprot, prey_uniprot, validationData) {
  // 1. Find interaction in database
  // 2. Get existing experimental_validation JSONB
  // 3. Append new validation method
  // 4. Update validation_summary
  // 5. Update database

  await sql`
    UPDATE interactions
    SET experimental_validation = ${validationDataJSON}
    WHERE (bait_protein_id = ... AND prey_protein_id = ...)
       OR (bait_protein_id = ... AND prey_protein_id = ...)  -- bidirectional
  `;
}
```

### Phase 4: Frontend Updates (Week 3)

#### 4.1 Validation Badge Component

**File**: `components/ValidationBadge.tsx`

```tsx
interface ValidationBadgeProps {
  validationData: ExperimentalValidation;
}

// Visual indicators:
// ✅ Validated (green) - confirmed by ≥1 experimental method
// 🔬 Multiple studies (dark green) - confirmed by ≥2 studies
// 🔷 Proximity (blue) - BioID/APEX proximity labeling
// ⚪ Predicted only (gray) - no experimental data yet
```

#### 4.2 Filter Panel Enhancement

Add to existing confidence filters:
- [ ] Show only validated interactions
- [ ] Show only TAP-MS validated (high confidence)
- [ ] Show only multi-study validated

#### 4.3 Results Table Update

**File**: `app/page.tsx`

Add column: "Experimental Evidence"
- Show badge with tooltip listing all studies
- Clickable to show full validation details

#### 4.4 Detailed Validation View

**File**: `components/ValidationDetails.tsx`

Modal/accordion showing:
- All experimental methods that detected this interaction
- Study details, PMID links
- Comparison of AF3 score vs experimental confidence
- Notes about detection context (e.g., "ciliated cells", "Hh signaling")

### Phase 5: Validation Statistics Dashboard (Week 3-4)

**File**: `app/validation/page.tsx`

**Key Metrics**:
1. **Overall Validation Rate**
   - X% of AF3 predictions confirmed by experiments
   - Breakdown by confidence level (High/Medium/Low)

2. **Method Comparison**
   - How many interactions detected by each method
   - Overlap between methods (Venn diagrams)

3. **Novel Predictions**
   - AF3 High confidence interactions NOT yet validated
   - Prioritization for experimental follow-up

4. **Confidence Correlation**
   - Do High ipSAE interactions correlate with more experimental evidence?
   - ROC curve: AF3 scores vs experimental validation

5. **Protein-Specific Validation**
   - Which IFT/BBS proteins have most/least validation data
   - Heatmap: bait proteins × validation coverage

**Visualizations**:
- Bar charts: validation rate by confidence
- Venn diagrams: method overlap
- Scatter plot: ipSAE vs number of validating studies
- Network graph: highlight validated edges in green

## Data Directory Structure

```
experimental_data/
├── raw/
│   ├── boldt_2016_supp_data_1.xlsx
│   ├── gupta_2015_table_s1.xlsx
│   ├── sang_2011_table_s2.xlsx
│   ├── mick_2015_table_s1.xlsx
│   ├── kohli_2017_dataset_ev1.xlsx
│   ├── may_2021_pride_pxd020583/
│   └── aslanyan_2023_pride_pxd038379/
├── processed/
│   ├── boldt_2016_interactions.json
│   ├── gupta_2015_interactions.json
│   └── ...
└── mapping/
    ├── uniprot_cache.json
    └── failed_mappings.json
```

## Implementation Priority

### Immediate (This Week)
1. ✅ **Download Boldt et al., 2016 Supplementary Data 1** (highest priority)
2. ✅ **Create protein ID mapping script** with UniProt API
3. ✅ **Parse Boldt dataset** → structured JSON
4. ✅ **Test validation update** on 10 interactions

### Short-term (Next 2 Weeks)
5. Download and parse Gupta et al., 2015 (BioID data)
6. Download and parse Sang et al., 2011 (LAP data)
7. Update all matching interactions in database
8. Create validation badge component
9. Add filter for validated interactions

### Medium-term (Weeks 3-4)
10. Download APEX datasets from PRIDE
11. Create validation statistics dashboard
12. Add detailed validation view modal
13. Generate validation report for paper

## Method Confidence Ranking

For `confidence` field in JSONB:

| Method | Confidence | Rationale |
|--------|-----------|-----------|
| SF-TAP-MS | **high** | Direct physical interaction, low false positives |
| LAP | **high** | Direct physical interaction |
| Co-IP | **high** | Direct physical interaction |
| Y2H | **medium** | Binary interaction, but not in native context |
| BioID | **medium** | Proximity (~10nm), not necessarily direct binding |
| APEX2 | **medium** | Proximity (~20nm), broader labeling radius |

## Success Metrics

After implementation:
- [ ] ≥80% of Boldt et al. proteins mapped to UniProt IDs
- [ ] ≥50 AF3 predictions validated by experimental data
- [ ] Validation dashboard shows clear correlation between ipSAE and experimental evidence
- [ ] Users can filter to "validated only" interactions
- [ ] Export validated interactions to CSV for paper

## Paper Integration

### Manuscript Text (Results section)
"To assess the reliability of our AF3 predictions, we integrated experimental interaction data from seven large-scale cilia proteomics studies [refs]. Of our 877 predicted interactions, X were independently confirmed by at least one experimental method (TAP-MS, BioID, or APEX proximity labeling). High-confidence predictions (ipSAE >0.7) showed Y% validation rate, compared to Z% for low-confidence predictions (ipSAE <0.5), demonstrating strong correlation between computational scores and experimental evidence."

### Supplementary Figure
- Validation rate by confidence level (bar chart)
- Network graph with validated edges highlighted
- Venn diagram showing overlap between AF3 and experimental methods

## Next Steps

1. **User approval**: Review this plan and approve approach
2. **Start dataset acquisition**: Download Boldt et al. supplementary data
3. **Create mapping script**: Build UniProt ID mapper with caching
4. **Parse first dataset**: Test workflow with Boldt data
5. **Update 10 test interactions**: Verify JSONB structure works
6. **Scale up**: Process all datasets systematically

## Questions to Resolve

1. **Directionality**: Some methods (TAP-MS) have explicit bait→prey direction. Store both directions or just as detected?
2. **Duplicate handling**: If same interaction validated by multiple studies, how to aggregate?
3. **Confidence scoring**: Weight multiple validations? (e.g., 3 studies = higher confidence than 1)
4. **Failed mappings**: What to do with proteins we can't map to UniProt IDs? Log and review manually?
5. **Database updates**: Update existing interactions or only when exact bait-prey match?

---

**Status**: Plan ready for implementation
**Estimated Time**: 3-4 weeks for full integration
**Priority**: Start with Boldt et al., 2016 (most comprehensive dataset)
