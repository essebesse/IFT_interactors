'use client';

import { use, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Spinner } from 'react-bootstrap';

// Dynamically import StructureViewer
const StructureViewer = dynamic(() => import('../../../components/StructureViewer'), {
  ssr: false,
  loading: () => <div className="text-center p-5"><Spinner animation="border" /> Loading structure viewer...</div>
});

interface PageProps {
  params: Promise<{ id: string }>;
}

interface InteractionInfo {
  baitGene: string;
  preyGene: string;
}

export default function StructurePage({ params }: PageProps) {
  const { id } = use(params);
  const [info, setInfo] = useState<InteractionInfo | null>(null);

  useEffect(() => {
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
      background: 'white'
    }}>
      <StructureViewer
        interactionId={parseInt(id)}
        baitGene={info.baitGene}
        preyGene={info.preyGene}
        onClose={() => window.close()}
      />
    </div>
  );
}
