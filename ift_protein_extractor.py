#!/usr/bin/env python3
"""
IFT Protein Extraction Script
Extracts all IFT proteins and their interactors from ciliaaf3predictions database
"""

import requests
import json
import pandas as pd
import time
from typing import List, Dict, Set
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'ift_extraction_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

class IFTExtractor:
    def __init__(self, base_url="https://ciliaaf3predictions.vercel.app"):
        self.base_url = base_url
        self.session = requests.Session()
        self.all_interactions = []
        self.processed_proteins = set()
        
    def get_human_ift_proteins(self) -> Dict[str, Dict]:
        """Returns dictionary of human IFT proteins with their metadata"""
        return {
            # IFT-A Complex
            'Q8NEZ3': {'gene': 'IFT144', 'aliases': ['WDR19', 'KIAA1638', 'SRTD5', 'NPHP13'], 'complex': 'IFT-A'},
            'Q96RY7': {'gene': 'IFT140', 'aliases': ['KIAA0590', 'SRTD9', 'WDTC2'], 'complex': 'IFT-A'},
            'Q7Z4L5': {'gene': 'IFT139', 'aliases': ['TTC21B', 'THM1', 'NPHP12', 'JBTS11'], 'complex': 'IFT-A'},
            'Q9HBG6': {'gene': 'IFT122', 'aliases': ['WDR10', 'WDR140', 'SPG', 'CED1'], 'complex': 'IFT-A'},
            'Q9NZJ4': {'gene': 'IFT121', 'aliases': ['WDR35', 'NPHP19', 'SRTD7'], 'complex': 'IFT-A'},
            'Q96FT9': {'gene': 'IFT43', 'aliases': ['C14orf179'], 'complex': 'IFT-A'},
            
            # IFT-B1 Complex (Core)
            'Q13099': {'gene': 'IFT88', 'aliases': ['TG737', 'TTC10', 'Polaris', 'DAF19'], 'complex': 'IFT-B1'},
            'Q8WYA0': {'gene': 'IFT81', 'aliases': ['CDV1', 'CDV-1R'], 'complex': 'IFT-B1'},
            'Q96LB3': {'gene': 'IFT74', 'aliases': ['CCDC2', 'CMG1', 'BBS22'], 'complex': 'IFT-B1'},
            'Q9P0F2': {'gene': 'IFT70A', 'aliases': ['TTC30A', 'FLJ14423'], 'complex': 'IFT-B1'},
            'Q8IWP0': {'gene': 'IFT70B', 'aliases': ['TTC30B'], 'complex': 'IFT-B1'},
            'Q9Y366': {'gene': 'IFT52', 'aliases': ['NGD2', 'CGI-53', 'C20orf9'], 'complex': 'IFT-B1'},
            'Q9NQC8': {'gene': 'IFT46', 'aliases': ['C11orf2', 'C11orf60'], 'complex': 'IFT-B1'},
            'Q9BW83': {'gene': 'IFT27', 'aliases': ['RABL4', 'RAYL'], 'complex': 'IFT-B1'},
            'Q9Y547': {'gene': 'IFT25', 'aliases': ['HSPB11', 'C1orf41', 'PP25'], 'complex': 'IFT-B1'},
            'Q9H7X7': {'gene': 'IFT22', 'aliases': ['RABL5', 'RABL', 'FLJ21827'], 'complex': 'IFT-B1'},
            'A0AVF1': {'gene': 'TTC26/IFT56', 'aliases': ['DYF13'], 'complex': 'IFT-B1'},
            
            # IFT-B2 Complex (Peripheral)
            'Q9UG01': {'gene': 'IFT172', 'aliases': ['SLB', 'KIAA1179', 'NPHP17', 'BBS20'], 'complex': 'IFT-B2'},
            'Q9P2H3': {'gene': 'IFT80', 'aliases': ['WDR56', 'KIAA1374'], 'complex': 'IFT-B2'},
            'Q9NWB7': {'gene': 'IFT57', 'aliases': ['ESRRBL1', 'HIPPI', 'FLJ10607'], 'complex': 'IFT-B2'},
            'Q8TDR0': {'gene': 'IFT54', 'aliases': ['TRAF3IP1', 'MIP-T3', 'MIPT3', 'DDA1'], 'complex': 'IFT-B2'},
            'Q6NVG7': {'gene': 'IFT38', 'aliases': ['CLUAP1', 'FAP22', 'KIAA0406', 'qilin'], 'complex': 'IFT-B2'},
            'Q8IY31': {'gene': 'IFT20', 'aliases': ['C3orf30'], 'complex': 'IFT-B2'},
            
            # Additional IFT-associated
            'O75386': {'gene': 'TULP3', 'aliases': ['RP26'], 'complex': 'IFT-associated'},
            'Q8NDW8': {'gene': 'TTC21A', 'aliases': [], 'complex': 'IFT-associated'},
            'Q96EX3': {'gene': 'WDR34', 'aliases': ['SRTD11', 'FAP133'], 'complex': 'IFT-associated'},
            'Q8WVS4': {'gene': 'WDR60', 'aliases': ['SRTD8', 'FAP163'], 'complex': 'IFT-associated'},
            
            # Motor proteins
            'Q9Y496': {'gene': 'KIF3A', 'aliases': [], 'complex': 'Motor'},
            'O15066': {'gene': 'KIF3B', 'aliases': [], 'complex': 'Motor'},
            'O14782': {'gene': 'KIF3C', 'aliases': [], 'complex': 'Motor'},
            'Q92845': {'gene': 'KIFAP3', 'aliases': ['KAP3'], 'complex': 'Motor'},
            'Q8NCM8': {'gene': 'DYNC2H1', 'aliases': ['DHC2', 'DNCH2', 'DYH1B', 'SRTD3'], 'complex': 'Motor'},
            'Q8TCX1': {'gene': 'DYNC2LI1', 'aliases': ['D2LIC', 'LIC3', 'SRTD15'], 'complex': 'Motor'},
            
            # BBSome proteins
            'Q8NFJ9': {'gene': 'BBS1', 'aliases': ['BBS2L2'], 'complex': 'BBSome'},
            'Q9BXC9': {'gene': 'BBS2', 'aliases': ['RP74'], 'complex': 'BBSome'},
            'Q96RK4': {'gene': 'BBS4', 'aliases': [], 'complex': 'BBSome'},
            'Q8N3I7': {'gene': 'BBS5', 'aliases': [], 'complex': 'BBSome'},
            'Q8IWZ6': {'gene': 'BBS7', 'aliases': ['BBS2L1'], 'complex': 'BBSome'},
            'Q8TAM2': {'gene': 'BBS8', 'aliases': ['TTC8', 'RP51'], 'complex': 'BBSome'},
            'Q3BBV0': {'gene': 'BBS9', 'aliases': ['PTHB1', 'B1', 'D1'], 'complex': 'BBSome'},
            'A8MTZ0': {'gene': 'BBIP1', 'aliases': ['BBS18', 'NCRNA00081'], 'complex': 'BBSome'},
        }
    
    def get_chlamydomonas_ift_proteins(self) -> Dict[str, Dict]:
        """Returns dictionary of Chlamydomonas IFT proteins"""
        return {
            # IFT-A Complex
            'A8IQ96': {'gene': 'IFT144', 'complex': 'IFT-A'},
            'A8J7G0': {'gene': 'IFT140', 'complex': 'IFT-A'},
            'A8IVF8': {'gene': 'IFT139', 'complex': 'IFT-A'},
            'A8HNR6': {'gene': 'IFT122', 'complex': 'IFT-A'},
            'A8IMD9': {'gene': 'IFT121', 'complex': 'IFT-A'},
            'A8IZK6': {'gene': 'IFT43', 'complex': 'IFT-A'},
            
            # IFT-B1 Complex
            'Q2QPA4': {'gene': 'IFT88', 'complex': 'IFT-B1'},
            'A8HXK5': {'gene': 'IFT81', 'complex': 'IFT-B1'},
            'A8IQB4': {'gene': 'IFT74', 'complex': 'IFT-B1'},
            'A8J337': {'gene': 'IFT70', 'complex': 'IFT-B1'},
            'Q9FPE2': {'gene': 'IFT52', 'complex': 'IFT-B1'},
            'A8ISA8': {'gene': 'IFT46', 'complex': 'IFT-B1'},
            'Q9FLN8': {'gene': 'IFT27', 'complex': 'IFT-B1'},
            'A8I0P5': {'gene': 'IFT25', 'complex': 'IFT-B1'},
            'A8HY52': {'gene': 'IFT22', 'complex': 'IFT-B1'},
            
            # IFT-B2 Complex
            'A8HW27': {'gene': 'IFT172', 'complex': 'IFT-B2'},
            'A8HSF1': {'gene': 'IFT80', 'complex': 'IFT-B2'},
            'A8J7F2': {'gene': 'IFT57', 'complex': 'IFT-B2'},
            'A8IK24': {'gene': 'IFT54', 'complex': 'IFT-B2'},
            'A8IMS1': {'gene': 'IFT38', 'complex': 'IFT-B2'},
            'Q9XIF3': {'gene': 'IFT20', 'complex': 'IFT-B2'},
            
            # Motor proteins
            'P46870': {'gene': 'FLA10', 'complex': 'Motor'},
            'Q6P6L4': {'gene': 'FLA8', 'complex': 'Motor'},
            'A8ITP5': {'gene': 'KAP', 'complex': 'Motor'},
            'A0A2K3DKS7': {'gene': 'DHC1B', 'complex': 'Motor'},
            'A8HMU9': {'gene': 'D1bLIC', 'complex': 'Motor'},
            'A8IUH6': {'gene': 'FAP133', 'complex': 'Motor'},
            'A8ILC9': {'gene': 'FAP163', 'complex': 'Motor'},
        }
    
    def query_protein(self, uniprot_id: str, protein_info: Dict) -> List[Dict]:
        """
        Query a single protein and get all its interactions
        """
        logging.info(f"Querying {uniprot_id} ({protein_info.get('gene', 'Unknown')})")
        
        # Simulate API call - replace with actual API endpoint
        # This is where you'd make the actual request to your database
        api_url = f"{self.base_url}/api/protein/{uniprot_id}"
        
        try:
            # Replace with actual API call
            # response = self.session.get(api_url)
            # data = response.json()
            
            # For now, return placeholder
            interactions = []
            
            # Mark as processed
            self.processed_proteins.add(uniprot_id)
            
            # Add delay to avoid overwhelming the server
            time.sleep(0.5)
            
            return interactions
            
        except Exception as e:
            logging.error(f"Error querying {uniprot_id}: {e}")
            return []
    
    def extract_all_ift_proteins(self, species='both'):
        """
        Main extraction function
        species: 'human', 'chlamydomonas', or 'both'
        """
        all_proteins = {}
        
        if species in ['human', 'both']:
            logging.info("Extracting human IFT proteins...")
            all_proteins.update(self.get_human_ift_proteins())
        
        if species in ['chlamydomonas', 'both']:
            logging.info("Extracting Chlamydomonas IFT proteins...")
            all_proteins.update(self.get_chlamydomonas_ift_proteins())
        
        logging.info(f"Total proteins to query: {len(all_proteins)}")
        
        # Query each protein
        for uniprot_id, protein_info in all_proteins.items():
            interactions = self.query_protein(uniprot_id, protein_info)
            
            # Store interactions with metadata
            for interaction in interactions:
                interaction['bait_uniprot'] = uniprot_id
                interaction['bait_gene'] = protein_info.get('gene', '')
                interaction['bait_complex'] = protein_info.get('complex', '')
                self.all_interactions.append(interaction)
        
        return self.all_interactions
    
    def save_results(self, output_prefix='ift_extraction'):
        """Save extracted data to files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save as JSON
        json_file = f"{output_prefix}_{timestamp}.json"
        with open(json_file, 'w') as f:
            json.dump(self.all_interactions, f, indent=2)
        logging.info(f"Saved JSON to {json_file}")
        
        # Save as CSV
        if self.all_interactions:
            df = pd.DataFrame(self.all_interactions)
            csv_file = f"{output_prefix}_{timestamp}.csv"
            df.to_csv(csv_file, index=False)
            logging.info(f"Saved CSV to {csv_file}")
        
        # Save summary statistics
        stats_file = f"{output_prefix}_stats_{timestamp}.txt"
        with open(stats_file, 'w') as f:
            f.write(f"Extraction Statistics\n")
            f.write(f"="*50 + "\n")
            f.write(f"Total proteins queried: {len(self.processed_proteins)}\n")
            f.write(f"Total interactions found: {len(self.all_interactions)}\n")
            f.write(f"Unique interactors: {len(set(i.get('prey_uniprot', '') for i in self.all_interactions))}\n")
        logging.info(f"Saved statistics to {stats_file}")

def main():
    """Main execution function"""
    extractor = IFTExtractor()
    
    # Extract all IFT proteins and their interactions
    interactions = extractor.extract_all_ift_proteins(species='both')
    
    # Save results
    extractor.save_results()
    
    logging.info("Extraction complete!")

if __name__ == "__main__":
    main()
