'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Spinner } from 'react-bootstrap';

// Dynamically import StructureViewer
const StructureViewer = dynamic(() => import('../../../components/StructureViewer'), {
  ssr: false,
  loading: () => <div className="text-center p-5"><Spinner animation="border" /> Loading structure viewer...</div>
});

interface InteractionInfo {
  baitGene: string;
  preyGene: string;
}

export default function StructurePage() {
  const params = useParams();
  const id = params.id as string;
  const [info, setInfo] = useState<InteractionInfo | null>(null);

  useEffect(() => {
    if (!id) return;

    // Fetch interaction info from manifest
    fetch('/cif_manifest.json')
      .then(res => res.json())
      .then(data => {
        const entry = data.entries[id];
        if (entry) {
          setInfo({
            baitGene: entry.bait_gene || 'Unknown',
            preyGene: entry.prey_gene || 'Unknown'
          });
        }
      })
      .catch(err => console.error('Failed to load interaction info:', err));
  }, [id]);

  if (!info) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'auto',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '95vw',
        height: '95vh',
        maxWidth: '1920px',
        maxHeight: '1080px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <StructureViewer
          interactionId={parseInt(id)}
          baitGene={info.baitGene}
          preyGene={info.preyGene}
          onClose={() => window.close()}
          closeButtonText="✕ Close Window"
        />
      </div>
    </div>
  );
}
