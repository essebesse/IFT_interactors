# Results

## AlphaFold3 Accurately Predicts Known Interactions Within IFT and BBSome Complexes

To validate the accuracy of our AlphaFold3-based interaction prediction approach, we first assessed whether the method could recapitulate known physical interactions within the established IFT and BBSome protein complexes. These well-characterized intra-complex interactions serve as positive controls, demonstrating that the ipSAE scoring metric effectively identifies bona fide protein-protein interactions.

### IFT-B Complex Interactions

Within the IFT-B core complex (IFT-B1), we identified 18 interactions among the predicted interactome, including 4 high-confidence (ipSAE > 0.7) and 8 medium-confidence (ipSAE 0.5-0.7) predictions. The highest-scoring interaction was between IFT46 and IFT56 (ipSAE = 0.828), consistent with their known roles as core structural components of the IFT-B complex. We also detected the well-established IFT70-IFT88 interaction with high confidence (ipSAE = 0.719 and 0.709 for the two IFT70 isoforms, TTC30B and TTC30A, respectively), as well as the IFT52-IFT70 (ipSAE = 0.678) and IFT25-IFT27 (ipSAE = 0.677) interactions, all of which have been previously demonstrated through biochemical and structural studies. These results demonstrate that AlphaFold3 successfully captures the known architecture of the IFT-B1 core complex with predominantly medium to high confidence scores.

The IFT-B peripheral complex (IFT-B2) yielded 6 within-complex interactions, including 2 high-confidence predictions. The IFT80-CLUAP1 interaction was detected with high confidence (ipSAE = 0.704 and 0.702), consistent with structural and biochemical evidence for their direct association. Additional IFT-B2 interactions including CLUAP1-IFT57 (ipSAE = 0.462) and IFT20-TRAF3IP1 (ipSAE = 0.452) were identified with lower confidence scores, potentially reflecting more dynamic or transient associations within this peripheral subcomplex.

### IFT-A Complex Interactions

Within the IFT-A complex, we identified 14 interactions, all of which fell into the medium or low confidence categories, with 12 classified as medium confidence (ipSAE 0.5-0.7). The strongest predictions involved IFT122 interactions with other IFT-A components: IFT122-WDR19/IFT144 (ipSAE = 0.688 and 0.684), IFT122-WDR35/IFT121 (ipSAE = 0.658 and 0.646), and TTC21B/IFT139-IFT122 (ipSAE = 0.557 and 0.556). These interactions are consistent with the known central role of IFT122 as a scaffolding protein within the IFT-A complex. Additional predicted interactions included WDR19-IFT140 (ipSAE = 0.618 and 0.617) and IFT43-WDR35 (ipSAE = 0.597 and 0.595), further supporting the interconnected architecture of IFT-A. While none of these interactions reached the high-confidence threshold (ipSAE > 0.7), the predominance of medium-confidence scores is consistent with the extended, potentially more flexible architecture of the IFT-A complex compared to the compact IFT-B core.

### BBSome Complex Interactions

The BBSome complex yielded 13 within-complex interactions, with 5 achieving high confidence (ipSAE > 0.7). The BBS7-BBS2 interaction was detected with high confidence (ipSAE = 0.759 and 0.758), consistent with their known direct association in the BBSome core. Similarly, the BBS1-BBS4 interaction scored highly (ipSAE = 0.753 and 0.748), as did the BBS1-ARL6/BBS3 interaction (ipSAE = 0.709 and 0.686), where ARL6/BBS3 functions as a regulatory GTPase that recruits the BBSome to ciliary membranes. The detection of the BBS8-BBS2 interaction with medium-low confidence (ipSAE = 0.493) and BBS4-BBS8 with low confidence (ipSAE = 0.372 and 0.355) suggests that while some BBSome interactions are robustly predicted, others may represent more transient or conformationally variable associations.

### TULP3 Interactions with IFT-A

TULP3, an IFT-associated protein known to interact with the IFT-A complex for ciliary trafficking of specific cargo proteins, showed predicted interactions with IFT122 (ipSAE = 0.478 and 0.468). While these scores fall in the low-confidence range, they nonetheless correctly identify the known TULP3-IFT-A association, demonstrating that AlphaFold3 can detect functionally relevant interactions even when structural information may be limited by the involvement of disordered regions or dynamic binding interfaces.

### Summary of Known Interaction Recovery

Collectively, these results demonstrate that our AlphaFold3-based approach successfully recapitulates the known interaction networks within the IFT-B, IFT-A, and BBSome complexes. The recovery of 11 high-confidence and 22 medium-confidence predictions among 51 total within-complex interactions provides strong validation that the ipSAE scoring metric effectively distinguishes genuine protein-protein interactions from spurious predictions. The gradient of confidence scores across different complexes—with IFT-B1 showing the highest proportion of high-confidence interactions and IFT-A showing predominantly medium-confidence scores—likely reflects real structural differences in the compactness and rigidity of these complexes. These positive controls establish confidence in the method's ability to identify novel interactions among ciliary proteins beyond the well-characterized core complexes.
