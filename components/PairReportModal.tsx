'use client';

import { useState, useEffect } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PairReportModalProps {
  show: boolean;
  onHide: () => void;
  interactionId: number;
  baitGene: string;
  preyGene: string;
}

export default function PairReportModal({ show, onHide, interactionId, baitGene, preyGene }: PairReportModalProps) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!show) {
      setMarkdown(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/pair-report/${interactionId}`)
      .then(res => {
        if (!res.ok) throw new Error('Report not available');
        return res.text();
      })
      .then(text => setMarkdown(text))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [show, interactionId]);

  return (
    <Modal show={show} onHide={onHide} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Literature Report: {baitGene} &ndash; {preyGene}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="text-center p-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading report...</p>
          </div>
        )}
        {error && (
          <div className="text-center p-5 text-muted">
            <p>Report not available for this interaction.</p>
          </div>
        )}
        {markdown && (
          <div className="pair-report-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
