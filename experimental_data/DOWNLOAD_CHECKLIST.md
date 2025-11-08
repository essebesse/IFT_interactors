# Dataset Download Checklist

Track your progress downloading experimental datasets:

## Priority 1: High Confidence Methods

- [x] **Boldt et al., 2016** (SF-TAP-MS, 217 baits) ← **COMPLETED - 25 VALIDATIONS** ✅
  - URL: https://www.nature.com/articles/ncomms11491
  - File: `raw/boldt_2016_supp_data_1.xlsx` ✅ Downloaded
  - Status: ✅ Import completed (2025-11-01)
  - Result: **25 validations** (5% of 512 interactions)
  - Details: SF-TAP-MS with FDR ≤ 0.1, high confidence direct interactions
  - **Best dataset so far** - IFT/BBSome baits overlap with our predictions

- [ ] **Lacey et al., 2024** (in situ XL-MS, IFT trains) ← **HIGH PRIORITY** ⭐
  - URL: https://www.cell.com/cell/fulltext/S0092-8674(24)00715-3
  - PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC11349379/
  - PMID: 39067443
  - File: Table S2 (all crosslinks in Dhc1b3 datasets, FDR filtered)
  - Status: ⏳ Not downloaded
  - **Why promising**:
    - Cross-linking MS identifies direct protein-protein interactions
    - Studies IFT-A, IFT-B complexes and dynein (Dhc1b3)
    - FDR-filtered crosslinks = high confidence
    - Open access (CC BY 4.0)
  - **Potential issue**: Uses Chlamydomonas reinhardtii (need to map to human orthologs)
  - **Next steps**: Download Table S2, check if crosslinks can be mapped to human IFT proteins

- [x] **Sang et al., 2011** (LAP method, 9 NPHP-JBTS-MKS baits) ← **COMPLETED - NO MATCHES**
  - URL: https://www.cell.com/cell/fulltext/S0092-8674(11)00473-X
  - File: `raw/sang_2011_table_s2.xlsx` ✅ Downloaded
  - Status: ✅ Import completed (2025-11-07)
  - Result: **0 validations** - Non-overlapping protein sets
  - Details: Sang uses NPHP/MKS baits (NPHP1-8, MKS1, MKS3)
  - Our database: IFT/BBSome baits only
  - Some shared prey proteins found (B9D1, TCTN2, CEP97) but different baits
  - Validation requires exact bait-prey pair matching or reciprocal interactions
  - **Conclusion**: Different biological question (transition zone vs IFT transport)

## Priority 2: Proximity Labeling Methods

- [x] **Gupta et al., 2015** (BioID, 56 baits) ← **COMPLETED - NO MATCHES**
  - URL: https://www.cell.com/cell/fulltext/S0092-8674(15)01443-4
  - File (Excel): `raw/Gupta_Cell_2015_S1_1-s2.0-S009286741501421X-mmc2.xlsx` ✅ Downloaded
  - File (CSV): `raw/gupta_2015_table_s1.csv` ✅ Converted
  - Status: ✅ Import completed (2025-11-07)
  - Result: **0 validations** - Non-overlapping protein sets
  - Details: Gupta uses centrosome/transition zone baits (TCTN1-3, MKS1, NPHP1-4, CEP proteins, OFD1, PCM1)
  - Our database: IFT/BBSome baits only
  - Contains 21 IFT protein mentions (IFT74, IFT81, IFT57, IFT46, IFT22, IFT20, IFT27) but all as **prey**
  - Our AF3 predictions don't include centrosome ↔ IFT interactions
  - **Recommendation**: Skip for our IFT/BBSome-specific dataset

- [x] **Mick et al., 2015** (APEX, primary cilia) ← **NOT SUITABLE** ❌
  - URL: https://www.cell.com/developmental-cell/fulltext/S1534-5807(15)00612-4
  - File: `raw/mick_2015_table_s1.xlsx` ✅ Downloaded
  - Status: ❌ Not suitable for validation
  - **Why not suitable**: Proteome census (identifies proteins IN cilia), not interaction data
  - Data type: List of 622 ciliary proteins (Tier 1: 162, Tier 2: 208)
  - No bait-prey pairs - just presence/absence of proteins in cilia
  - **Conclusion**: Cannot validate protein-protein interactions without bait-prey structure

- [ ] **Kohli et al., 2017** (APEX, ciliary membrane) ⚠️ Likely proteome census
  - URL: https://www.embopress.org/doi/full/10.15252/embr.201643846
  - File: `raw/kohli_2017_dataset_ev1.xlsx`
  - Status: ⏳ Not downloaded
  - **Warning**: APEX method suggests this may be proteome census (like Mick), not interaction data
  - Need to verify if it has bait-prey structure before downloading

## Priority 3: PRIDE Repository Datasets

- [ ] **May et al., 2021** (APEX2, Hedgehog signaling) ⚠️ Needs investigation
  - Data: http://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=PXD020583
  - File: `raw/may_2021_pride_pxd020583/`
  - Status: ⏳ Not downloaded
  - **Warning**: APEX2 method - verify if interaction data or proteome census
  - Focus: Hedgehog signaling (may have IFT protein interactions)
  - Need to check data structure before investing time

- [ ] **Aslanyan et al., 2023** (BioID2-UBD, ubiquitinome) ⚠️ Likely not suitable
  - Data: http://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=PXD038379
  - File: `raw/aslanyan_2023_pride_pxd038379/`
  - Status: ⏳ Not downloaded
  - **Warning**: Focus on ubiquitinome (ubiquitin-modified proteins), not general PPI
  - May not have relevant IFT/BBSome interaction data

## Summary

**Current validation status:**
- ✅ Boldt et al., 2016: **25 validations** (5% of 512 interactions)
- ❌ Gupta et al., 2015: 0 validations (centrosome baits, not IFT baits)
- ❌ Sang et al., 2011: 0 validations (NPHP/MKS baits, not IFT baits)
- ❌ Mick et al., 2015: Not suitable (proteome census, not interaction data)
- **Total: 25 validations from 1 dataset**

**Key lessons learned:**
1. **Bait overlap is critical** - Need IFT/BBSome baits, not centrosome/TZ baits
2. **Data type matters** - Proteome census ≠ interaction data
3. **APEX/BioID alone isn't enough** - Must verify it's bait-prey structure, not just protein lists
4. **Best bet**: Look for TAP-MS, Co-IP, or Y2H studies with IFT/BBSome baits

## Notes

- PRIORITY: Find more TAP-MS or Co-IP datasets with IFT/BBSome proteins as baits
- Check file formats before downloading (Excel vs CSV vs TSV)
- PRIDE datasets may require FTP access or special tools
- Verify data structure (bait-prey vs proteome list) before downloading
- Update status after each download

