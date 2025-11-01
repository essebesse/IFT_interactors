# IFT Complex Data Extraction & Website Development Roadmap

## Step 1: Data Extraction Process

### 1.1 Prepare UniProt ID Lists
- **Human IFT proteins**: 50+ UniProt IDs with all aliases
- **Chlamydomonas IFT proteins**: 40+ UniProt IDs
- **Cross-reference with HGNC, NCBI Gene, and Ensembl databases**

### 1.2 Query Strategy for Your Database
```python
# Pseudocode for systematic extraction
for each_uniprot_id in ift_protein_list:
    # Query as bait protein
    interactions = query_database(uniprot_id, version='v4')
    
    # Store with metadata
    store_interaction_data({
        'bait': uniprot_id,
        'prey': prey_list,
        'confidence': confidence_scores,
        'structural_metrics': {
            'iPTM': iptm_value,
            'iPAE': ipae_values,
            'ipLDDT': iplddt_value
        },
        'experimental_validation': exp_data,
        'complex_membership': complex_type
    })
```

### 1.3 Data Validation Checklist
- [ ] All IFT-A proteins captured (6 core members)
- [ ] All IFT-B1 proteins captured (10 core members)
- [ ] All IFT-B2 proteins captured (6 peripheral members)
- [ ] Motor proteins included (Kinesin-2, Dynein-2)
- [ ] BBSome proteins included
- [ ] Cross-species orthologs mapped

## Step 2: Database Schema for New Website

### 2.1 Core Tables Structure
```sql
-- Proteins table
CREATE TABLE proteins (
    uniprot_id VARCHAR(20) PRIMARY KEY,
    gene_name VARCHAR(50),
    protein_name VARCHAR(200),
    species VARCHAR(50),
    complex_membership VARCHAR(50),
    aliases TEXT
);

-- Interactions table
CREATE TABLE interactions (
    interaction_id INT PRIMARY KEY,
    bait_uniprot VARCHAR(20),
    prey_uniprot VARCHAR(20),
    confidence_score FLOAT,
    iptm_score FLOAT,
    ipae_3a INT,
    ipae_6a INT,
    iplddt_score FLOAT,
    experimental_validation BOOLEAN,
    analysis_version VARCHAR(10)
);

-- Complex membership table
CREATE TABLE complex_membership (
    protein_uniprot VARCHAR(20),
    complex_name VARCHAR(50),
    subcomplex VARCHAR(50),
    role VARCHAR(100)
);
```

## Step 3: Website Features Implementation

### 3.1 Core Visualization Components

#### Network Visualization
- **Technology**: Cytoscape.js or D3.js force-directed graph
- **Features**:
  - Color-coded by complex membership
  - Edge thickness by confidence score
  - Interactive node selection
  - Zoom and pan capabilities

#### Complex Structure View
- **IFT-A Complex**: Hexagonal arrangement
- **IFT-B Complex**: Core + Peripheral distinction
- **BBSome**: Octameric structure representation
- **Motor proteins**: Directional indicators

### 3.2 Search and Filter Capabilities
```javascript
// Search functionality
const searchFeatures = {
    byProteinName: true,
    byUniProtID: true,
    byAlias: true,
    byComplex: true,
    bySpecies: true,
    byConfidenceThreshold: true
};

// Filter options
const filterOptions = {
    complexType: ['IFT-A', 'IFT-B1', 'IFT-B2', 'BBSome', 'Motor'],
    species: ['Human', 'Chlamydomonas', 'Both'],
    confidenceRange: [0.0, 1.0],
    experimentalValidation: ['Yes', 'No', 'Any']
};
```

### 3.3 Data Export Features
- **CSV export**: Full interaction table
- **JSON export**: Network data for Cytoscape
- **Image export**: Network visualization (PNG/SVG)
- **Report generation**: Summary statistics

## Step 4: Implementation Timeline

### Week 1-2: Data Extraction
- [ ] Run extraction script for all human IFT proteins
- [ ] Run extraction script for all Chlamydomonas IFT proteins
- [ ] Validate completeness of data
- [ ] Clean and normalize data

### Week 3-4: Database Setup
- [ ] Set up database schema
- [ ] Import extracted data
- [ ] Create indices for performance
- [ ] Set up API endpoints

### Week 5-6: Frontend Development
- [ ] Create React/Next.js application structure
- [ ] Implement network visualization
- [ ] Add search and filter components
- [ ] Create complex-specific views

### Week 7-8: Testing and Refinement
- [ ] Test all search functionalities
- [ ] Validate data accuracy
- [ ] Performance optimization
- [ ] User interface refinement

## Step 5: Quality Assurance

### 5.1 Data Validation
```python
# Validation checks
def validate_extraction():
    checks = {
        'all_ift_a_present': len(ift_a_proteins) == 6,
        'all_ift_b1_present': len(ift_b1_proteins) == 10,
        'all_ift_b2_present': len(ift_b2_proteins) == 6,
        'interaction_coverage': interactions_per_protein > 0,
        'confidence_scores_valid': 0 <= confidence <= 1,
        'structural_metrics_present': has_iptm_scores
    }
    return all(checks.values())
```

### 5.2 Website Testing
- Unit tests for all API endpoints
- Integration tests for data flow
- UI/UX testing with sample queries
- Performance testing with full dataset

## Step 6: Deployment

### 6.1 Hosting Setup
- **Frontend**: Vercel (like current site)
- **Backend API**: Node.js/Express or Python/FastAPI
- **Database**: PostgreSQL or MongoDB
- **CDN**: For static assets

### 6.2 Documentation
- API documentation
- User guide for website
- Data dictionary
- Citation guidelines

## Key Files Delivered

1. **human_ift_proteins_complete.md** - Complete list of human IFT proteins
2. **chlamydomonas_ift_proteins_complete.md** - Complete list of Cr IFT proteins
3. **ift_protein_extractor.py** - Python script for extraction
4. **ift_extraction_plan.md** - Overall project plan

## Next Steps

1. **Immediate**: Test the extraction script with a few proteins to verify API compatibility
2. **Priority**: Ensure all protein aliases are captured in searches
3. **Critical**: Validate that v4 analysis data is being retrieved correctly
4. **Important**: Set up data backup before extraction

## Notes
- Remember to handle rate limiting in API calls
- Consider implementing caching for frequently accessed data
- Plan for future updates (v5 analysis, new proteins)
- Include proper attribution and citations
