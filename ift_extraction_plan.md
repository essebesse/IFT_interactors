# IFT Protein Extraction and Website Development Plan

## Phase 1: Comprehensive IFT Protein Identification

### 1.1 Human IFT Proteins (Hs)
Create complete lists with all aliases and UniProt IDs

### 1.2 Chlamydomonas reinhardtii IFT Proteins (Cr)
Compile all Cr IFT proteins with their identifiers

## Phase 2: Database Extraction Strategy

### 2.1 Query Structure
- Use UniProt IDs as primary identifiers
- Search through all aliases in the database
- Extract v4 analysis data specifically

### 2.2 Data to Extract
- All IFT proteins as baits
- All interactors for each IFT protein
- Confidence scores
- Structural metrics (iPTM, iPAE, ipLDDT)
- AlphaFold predictions
- Experimental validation data

## Phase 3: Data Organization

### 3.1 Primary Database Structure
- IFT protein catalog (species-specific)
- Interaction network data
- Cross-species orthologs
- Functional annotations

### 3.2 Metadata Requirements
- Protein complex associations (IFT-A, IFT-B)
- Subcellular localization
- Disease associations
- Expression data

## Phase 4: Website Architecture

### 4.1 Core Features
- IFT complex visualization
- Interactive network explorer
- Species comparison tool
- Search by protein name/alias
- Download functionality for data

### 4.2 Technical Implementation
- Frontend: React/Next.js (similar to current site)
- Backend: API for data queries
- Database: Optimized for network queries
- Visualization: D3.js or Cytoscape.js

## Phase 5: Quality Control

### 5.1 Data Validation
- Cross-reference with published IFT literature
- Verify all aliases are captured
- Validate interaction data

### 5.2 Testing
- Test all UniProt ID queries
- Verify alias search functionality
- Validate data completeness
