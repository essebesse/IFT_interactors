'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { NetworkVisualization } from '../components/NetworkVisualization';

// Define types for our data
interface ValidationData {
  validated: boolean;
  method: string;
  source: string;
  date: string;
  notes?: string | null;
  source_file?: string | null;
}

interface InteractionData {
  bait_uniprot: string;
  bait_gene: string;
  bait_organism?: string;
  bait_organism_code?: string;
  bait_common_name?: string;
  prey_uniprot: string;
  prey_gene: string;
  prey_organism?: string;
  prey_organism_code?: string;
  prey_common_name?: string;
  confidence: string | null;
  iptm: number;
  contacts_pae_lt_3?: number;
  contacts_pae_lt_6?: number;
  interface_plddt?: number;
  alphafold_version: string;
  ipsae?: number | null;
  ipsae_confidence?: string | null;
  ipsae_pae_cutoff?: number | null;
  analysis_version?: string | null;
  experimental_validation?: ValidationData | null;
}

// IFT and BBSome alias mapping
const PROTEIN_ALIASES: { [key: string]: string } = {
  // IFT-A Complex
  'WDR19': 'IFT144',
  'KIAA0590': 'IFT140',
  'TTC21B': 'IFT139',
  'WDR10': 'IFT122',
  'WDR35': 'IFT121',
  'C14orf179': 'IFT43',

  // IFT-B Core (IFT-B1)
  'TG737': 'IFT88',
  'CDV1': 'IFT81',
  'CCDC2': 'IFT74',
  'TTC30A': 'IFT70',
  'TTC30B': 'IFT70',
  'NGD2': 'IFT52',
  'C11orf2': 'IFT46',
  'RABL4': 'IFT27',
  'HSPB11': 'IFT25',
  'RABL5': 'IFT22',
  'TTC26': 'IFT56',

  // IFT-B Peripheral (IFT-B2)
  'KIAA1179': 'IFT172',
  'WDR56': 'IFT80',
  'ESRRBL1': 'IFT57',
  'TRAF3IP1': 'IFT54',
  'MIPT3': 'IFT54',
  'CLUAP1': 'IFT38',
  'C3orf30': 'IFT20',

  // BBSome Complex
  'ARL6': 'BBS3',
  'TTC8': 'BBS8',
  'PTHB1': 'BBS9',
  'LZTL1': 'BBS17',
  'A8MTZ0': 'BBIP1',

  // IFT-associated
  'TULP3': 'RP26'
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('Q8NEZ3'); // Default search term for demo
  const [interactions, setInteractions] = useState([]);
  const [secondaryInteractions, setSecondaryInteractions] = useState([]);
  const [secondaryProtein, setSecondaryProtein] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [secondaryLoading, setSecondaryLoading] = useState(false);
  const [confidenceFilters, setConfidenceFilters] = useState({
    'High': true,
    'Medium': true,
    'Low': true,
  });
  const [baitProteins, setBaitProteins] = useState([]);
  const [selectedBait, setSelectedBait] = useState('');
  const [networkDimensions, setNetworkDimensions] = useState({ width: 450, height: 620 });

  const fetchBaitProteins = async () => {
    try {
      const res = await fetch(`/api/baits`);
      if (res.ok) {
        const data = await res.json();
        setBaitProteins(data.baits || []);
      }
    } catch (error) {
      console.error('Failed to fetch bait proteins:', error);
    }
  };

  const handleBaitSelection = (baitId: string) => {
    setSelectedBait(baitId);
    setSearchTerm(baitId);
    setSecondaryInteractions([]); // Clear secondary when changing main search
    setSecondaryProtein('');
  };

  const handleNodeClick = async (nodeId: string, nodeName: string) => {
    setSecondaryLoading(true);
    setSecondaryProtein(nodeId);

    try {
      const cacheBuster = Date.now();

      // Build URL with confidence filters
      const enabledLevels = Object.entries(confidenceFilters)
        .filter(([_, enabled]) => enabled)
        .map(([level]) => level)
        .join(',');

      let url = `/api/interactions/${nodeId}?t=${cacheBuster}`;
      if (enabledLevels) {
        url += `&confidence=${enabledLevels}`;
      }

      const res = await fetch(url);

      if (res.ok) {
        const response = await res.json();
        let data = response.interactions || response;

        // Client-side filtering based on dynamically calculated confidence
        data = data.filter((inter: any) => {
          const level = getConfidenceLevel(inter);
          return confidenceFilters[level as keyof typeof confidenceFilters];
        });

        // Sort by ipSAE score (highest first)
        data.sort((a: any, b: any) => {
          const ipsaeA = parseFloat(a.ipsae) || 0;
          const ipsaeB = parseFloat(b.ipsae) || 0;
          return ipsaeB - ipsaeA;  // Descending order (highest first)
        });

        setSecondaryInteractions(data);
      }
    } catch (error) {
      console.error('Failed to fetch secondary interactions:', error);
    } finally {
      setSecondaryLoading(false);
    }
  };

  const getProteinDisplayName = (inter: any, isProtein: 'bait' | 'prey', includeTooltip: boolean = false) => {
    const prefix = isProtein;
    const commonName = inter[`${prefix}_common_name`];
    const geneName = inter[`${prefix}_gene`];

    // For display, use gene name (potentially truncated)
    // common_name stores full description for tooltips
    const displayName = geneName;

    // Check if this gene has an IFT/BBS alias
    const alias = geneName && PROTEIN_ALIASES[geneName] ? ` (${PROTEIN_ALIASES[geneName]})` : '';
    const fullDisplayName = `${displayName}${alias}`;

    // If tooltip requested and name is truncated, render with tooltip
    if (includeTooltip && displayName && displayName.endsWith('...') && commonName) {
      return (
        <>
          {renderGeneNameWithTooltip(displayName, commonName)}
          {alias}
        </>
      );
    }

    return fullDisplayName;
  };

  const getProteinLink = (uniprotId: string, organismCode?: string) => {
    // Guard against undefined/null values
    if (!uniprotId) {
      return '#';
    }

    // Remove AF2_ prefix if present
    const cleanId = uniprotId.startsWith('AF2_') ? uniprotId.substring(4) : uniprotId;

    // Only use ChlamyFP for CRE-formatted gene IDs (Phytozome format)
    if (cleanId.startsWith('Cre') || cleanId.startsWith('cre') || cleanId.startsWith('CRE')) {
      // Convert CRE11_G475000_T1_1 to Cre11.g475000.t1.1 format for ChlamyFP
      const chlamyFPId = cleanId.replace(/_/g, '.').replace(/CRE/i, 'Cre');
      return `https://chlamyfp.org/ChlamyFPv2/cr_info_sql.php?id=${encodeURIComponent(chlamyFPId)}`;
    }
    // For all other proteins (including Chlamydomonas UniProt IDs), use UniProt
    return `https://www.uniprot.org/uniprotkb/${cleanId}`;
  };

  // Render gene name with tooltip if truncated
  const renderGeneNameWithTooltip = (displayName: string, fullDescription?: string) => {
    // If name ends with "..." and we have a full description, show tooltip
    if (displayName.endsWith('...') && fullDescription) {
      return (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-${displayName}`}>{fullDescription}</Tooltip>}
        >
          <span style={{ cursor: 'help', borderBottom: '1px dotted #999' }}>
            {displayName}
          </span>
        </OverlayTrigger>
      );
    }
    return displayName;
  };

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);

    try {
      console.log('Fetching data for:', searchTerm);
      const cacheBuster = Date.now();

      // Build URL with confidence filters
      const enabledLevels = Object.entries(confidenceFilters)
        .filter(([_, enabled]) => enabled)
        .map(([level]) => level)
        .join(',');

      let url = `/api/interactions/${searchTerm}?t=${cacheBuster}`;
      if (enabledLevels) {
        url += `&confidence=${enabledLevels}`;
      }
      console.log('Full URL:', url);

      const res = await fetch(url);
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);

      if (!res.ok) {
        // Get the error response body
        const errorText = await res.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${res.status}, body: ${errorText.substring(0, 200)}`);
      }

      const response = await res.json();
      console.log('Received response:', response);

      // Handle the new API response structure
      let data = response.interactions || response;

      if (!Array.isArray(data)) {
        throw new Error('Expected interactions array, got: ' + typeof data);
      }

      console.log('Processing interactions:', data.length);

      // Client-side filtering based on dynamically calculated confidence
      data = data.filter((inter: any) => {
        const level = getConfidenceLevel(inter);
        return confidenceFilters[level as keyof typeof confidenceFilters];
      });

      // Sort by ipSAE score (highest first)
      data.sort((a: any, b: any) => {
        const ipsaeA = parseFloat(a.ipsae) || 0;
        const ipsaeB = parseFloat(b.ipsae) || 0;
        return ipsaeB - ipsaeA;  // Descending order (highest first)
      });

      setInteractions(data as any);

    } catch (error) {
      console.error("Failed to fetch interactions:", error);
      alert('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch data when confidence filters change
  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    }
  }, [confidenceFilters]);

  // Handle responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      setNetworkDimensions({
        width: Math.max(350, window.innerWidth * 0.37),
        height: Math.max(300, window.innerHeight * 0.4)
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Fetch data on initial load
  useEffect(() => {
    fetchBaitProteins();
    handleSearch();
  }, []);

  // Auto-search when bait protein is selected
  useEffect(() => {
    if (selectedBait) {
      handleSearch();
    }
  }, [selectedBait]);

  // Update secondary interactions when confidence filters change
  useEffect(() => {
    if (secondaryProtein && secondaryInteractions.length > 0) {
      // Re-fetch secondary interactions to apply new filters
      handleNodeClick(secondaryProtein, secondaryProtein);
    }
  }, [confidenceFilters]);

  // Get confidence level based on ipSAE (v4 scoring)
  const getConfidenceLevel = (inter: any): string => {
    // This database contains v4 data only - use ipSAE scoring
    const ipsae = parseFloat(inter.ipsae);

    if (!ipsae || isNaN(ipsae)) {
      return 'Low';
    }

    // v4 ipSAE confidence thresholds
    if (ipsae > 0.7) {
      return 'High';
    } else if (ipsae >= 0.5) {
      return 'Medium';
    } else {
      return 'Low';
    }
  };

  const confidenceColors: { [key: string]: string } = {
    'High': '#28a745',                     // Green
    'Medium': '#ffc107',                   // Orange
    'Low': '#dc3545',                      // Red
  };

  return (
    <Container fluid className="p-4 bg-light">
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <h1 className="mb-2">Ciliary Protein Interaction Network</h1>
            <p className="text-muted mb-0">
              IFT & BBSome complexes • <em>Homo sapiens</em> • AlphaFold3 Predictions • ipSAE Confidence Scoring
            </p>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Card className="shadow-sm" style={{ height: '40vh' }}>
            <Card.Body style={{ height: '100%', overflowY: 'auto' }}>
              <Form.Group className="mb-3">
                <Form.Label>Select Bait Protein</Form.Label>
                <Form.Select
                  value={selectedBait}
                  onChange={(e) => handleBaitSelection(e.target.value)}
                  className="mb-2"
                >
                  <option value="">Choose a bait protein...</option>
                  {baitProteins.map((bait: any) => {
                    const alias = bait.gene_name && PROTEIN_ALIASES[bait.gene_name] ? ` (${PROTEIN_ALIASES[bait.gene_name]})` : '';
                    return (
                      <option key={bait.uniprot_id} value={bait.uniprot_id}>
                        {bait.gene_name}{alias} ({bait.uniprot_id}) - {bait.interaction_count} interactions
                      </option>
                    );
                  })}
                </Form.Select>
                <Form.Text className="text-muted">
                  Select from {baitProteins.length} available bait proteins
                </Form.Text>
              </Form.Group>

              <hr />
              
              <Form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                <Form.Group className="mb-3">
                  <Form.Label>Search Protein</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Q8NEZ3, WDR19, IFT27, 54, CCNO"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Search by UniProt ID, gene name, protein alias, IFT number, or user-defined name
                  </Form.Text>
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>Search</Button>
              </Form>

              <hr />

              <h5>Confidence Levels</h5>
              <Form>
                {Object.keys(confidenceFilters).map(level => (
                  <Form.Check
                    key={level}
                    type="checkbox"
                    id={`check-${level}`}
                    label={level}
                    checked={(confidenceFilters as any)[level]}
                    onChange={(e) => setConfidenceFilters(prev => ({ ...prev, [level]: e.target.checked }))}
                  />
                ))}
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={9}>
          <Row className="h-100">
            {/* Main Network */}
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body style={{ height: '40vh', position: 'relative', padding: '0' }}>
                  {loading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <Spinner animation="border" variant="primary" />
                      <span className="ms-3">Loading...</span>
                    </div>
                  ) : interactions.length > 0 ? (
                    <NetworkVisualization
                      interactions={interactions}
                      width={networkDimensions.width}
                      height={networkDimensions.height}
                      onNodeClick={handleNodeClick}
                      title={`${searchTerm} Interactions`}
                      centerProtein={searchTerm}
                      showLayoutControl={true}
                      legendType="nodes"
                    />
                  ) : (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <div className="text-center">
                        <h5>No interactions found</h5>
                        <p>Search term: {searchTerm}</p>
                        <p>Click a bait protein to start</p>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Secondary Network */}
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body style={{ height: '40vh', position: 'relative', padding: '0' }}>
                  {secondaryLoading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <Spinner animation="border" variant="secondary" />
                      <span className="ms-3">Loading...</span>
                    </div>
                  ) : secondaryInteractions.length > 0 ? (
                    <NetworkVisualization
                      interactions={secondaryInteractions}
                      width={networkDimensions.width}
                      height={networkDimensions.height}
                      title={`${secondaryProtein} Interactions`}
                      centerProtein={secondaryProtein}
                      showLayoutControl={false}
                      legendType="edges"
                    />
                  ) : (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <div className="text-center">
                        <h5>Click a protein node</h5>
                        <p>Click any protein in the main network to see its interactions here</p>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header>Interaction Details</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Bait</th>
                    <th>Prey</th>
                    <th>Confidence</th>
                    <th>ipSAE</th>
                    <th>iPTM</th>
                    <th>iPAE &lt;3Å</th>
                    <th>iPAE &lt;6Å</th>
                    <th>ipLDDT</th>
                    <th>Experimental</th>
                  </tr>
                </thead>
                <tbody>
                  {interactions.map((inter: any, index) => (
                    <tr key={index}>
                      <td>
                        {getProteinDisplayName(inter, 'bait', true)} (
                        <a
                          href={getProteinLink(inter.bait_uniprot, inter.bait_organism_code)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          {inter.bait_uniprot}
                        </a>
                        )
                      </td>
                      <td>
                        {getProteinDisplayName(inter, 'prey', true)} (
                        <a
                          href={getProteinLink(inter.prey_uniprot, inter.prey_organism_code)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          {inter.prey_uniprot}
                        </a>
                        )
                      </td>
                      <td>
                        {(() => {
                          const level = getConfidenceLevel(inter);
                          const color = confidenceColors[level] || '#000';
                          return (
                            <span style={{ color }}>
                              ● {level}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        <strong>{inter.ipsae ? inter.ipsae.toFixed(3) : 'N/A'}</strong>
                      </td>
                      <td>{inter.iptm.toFixed(2)}</td>
                      <td>
                        {inter.alphafold_version === 'AF2'
                          ? 'N/A'
                          : (inter.contacts_pae_lt_3 ?? 0)
                        }
                      </td>
                      <td>
                        {inter.alphafold_version === 'AF2'
                          ? 'N/A'
                          : (inter.contacts_pae_lt_6 ?? 0)
                        }
                      </td>
                      <td>{inter.interface_plddt ? inter.interface_plddt.toFixed(1) : 'N/A'}</td>
                      <td>
                        {inter.experimental_validation && inter.experimental_validation.validated ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`validation-tooltip-${index}`}>
                                <div style={{ textAlign: 'left' }}>
                                  <strong>Method:</strong> {inter.experimental_validation.method}<br />
                                  <strong>Source:</strong> {inter.experimental_validation.source}<br />
                                  <strong>Date:</strong> {inter.experimental_validation.date}
                                  {inter.experimental_validation.notes && (
                                    <><br /><strong>Notes:</strong> {inter.experimental_validation.notes}</>
                                  )}
                                  {inter.experimental_validation.source_file && (
                                    <><br /><strong>Data File:</strong><br /><small>{inter.experimental_validation.source_file}</small></>
                                  )}
                                </div>
                              </Tooltip>
                            }
                          >
                            <span className="badge bg-success" style={{ cursor: 'pointer' }}>
                              ✓ Yes
                            </span>
                          </OverlayTrigger>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>
  );
}
