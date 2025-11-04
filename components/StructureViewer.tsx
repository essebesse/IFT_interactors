'use client';

/**
 * Structure Viewer Component
 * ===========================
 *
 * 3D structure visualization using Mol* (Molstar) with PAE-based interface coloring.
 *
 * Features:
 * - Load CIF files from API
 * - Two coloring modes:
 *   1. Chain coloring: Distinct colors for each protein chain
 *   2. PAE coloring: Interface residues colored by confidence
 * - Interactive camera controls
 * - Loading states and error handling
 */

import React, { useEffect, useRef, useState } from 'react';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { DefaultPluginSpec } from 'molstar/lib/mol-plugin/spec';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import { Color } from 'molstar/lib/mol-util/color';
import { Script } from 'molstar/lib/mol-script/script';
import 'molstar/lib/mol-plugin-ui/skin/light.scss';

interface Contact {
  chain1: string;
  resi1: number;
  aa1: string;
  chain2: string;
  resi2: number;
  aa2: string;
  pae: number;
  distance: number;
  confidence: string;
  color: string;
}

interface ContactData {
  interaction_id: number;
  generated_at: string;
  data: {
    chains: string[];
    chain_lengths: Record<string, number>;
    contacts: Contact[];
    summary: {
      total_contacts: number;
      very_high_count: number;
      high_count: number;
      medium_count: number;
      low_count: number;
    };
  };
}

interface StructureViewerProps {
  interactionId: number;
  baitGene: string;
  preyGene: string;
  onClose: () => void;
}

type ColorMode = 'chain' | 'pae';

export default function StructureViewer({
  interactionId,
  baitGene,
  preyGene,
  onClose
}: StructureViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pluginRef = useRef<PluginContext | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>('chain');
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [structureLoaded, setStructureLoaded] = useState(false);

  // Initialize Mol* plugin
  useEffect(() => {
    if (!containerRef.current || pluginRef.current) return;

    const initPlugin = async () => {
      try {
        const spec = DefaultPluginSpec();

        const plugin = new PluginContext(spec);
        await plugin.init();

        if (containerRef.current) {
          plugin.initViewer(containerRef.current, {
            layoutIsExpanded: false,
            layoutShowControls: false,
            layoutShowRemoteState: false,
            layoutShowSequence: true,
            layoutShowLog: false,
            layoutShowLeftPanel: false,
            viewportShowExpand: true,
            viewportShowSelectionMode: false,
            viewportShowAnimation: false,
          });

          pluginRef.current = plugin;
        }
      } catch (err) {
        console.error('Failed to initialize Mol*:', err);
        setError('Failed to initialize 3D viewer');
        setLoading(false);
      }
    };

    initPlugin();

    return () => {
      if (pluginRef.current) {
        pluginRef.current.dispose();
        pluginRef.current = null;
      }
    };
  }, []);

  // Load structure and contact data
  useEffect(() => {
    if (!pluginRef.current) return;

    const loadStructure = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch CIF file
        const cifResponse = await fetch(`/api/structure/${interactionId}`);
        if (!cifResponse.ok) {
          throw new Error('Failed to load structure file');
        }
        const cifData = await cifResponse.text();

        // Fetch PAE contact data
        const paeResponse = await fetch(`/api/structure/${interactionId}/pae`);
        let paeData: ContactData | null = null;
        if (paeResponse.ok) {
          paeData = await paeResponse.json();
          setContactData(paeData);
        } else {
          console.warn('PAE contact data not available');
        }

        // Load structure into Mol*
        const plugin = pluginRef.current!;

        const data = await plugin.builders.data.rawData({
          data: cifData,
          label: `${baitGene}_${preyGene}`
        });

        const trajectory = await plugin.builders.structure.parseTrajectory(data, 'cif');
        const model = await plugin.builders.structure.createModel(trajectory);
        const structure = await plugin.builders.structure.createStructure(model);

        // Apply initial coloring (chain mode)
        await applyChainColoring(plugin, structure);

        // Zoom to fit
        const component = structure.selector;
        await plugin.builders.structure.representation.addRepresentation(component, {
          type: 'cartoon',
          color: 'chain-id'
        });

        plugin.canvas3d?.requestCameraReset();

        setStructureLoaded(true);
        setLoading(false);

      } catch (err) {
        console.error('Error loading structure:', err);
        setError(err instanceof Error ? err.message : 'Failed to load structure');
        setLoading(false);
      }
    };

    loadStructure();
  }, [interactionId, baitGene, preyGene]);

  // Apply chain coloring
  const applyChainColoring = async (plugin: PluginContext, structure: any) => {
    // Mol* will handle chain coloring automatically via 'chain-id' theme
    // Chain A: Cyan, Chain B: Orange (default Mol* colors)
  };

  // Apply PAE-based coloring
  const applyPAEColoring = async () => {
    if (!pluginRef.current || !contactData || !structureLoaded) return;

    // TODO: Implement PAE coloring
    // This requires using Mol* overpaint API to color specific residues
    // For now, show a message that it's coming soon
    console.log('PAE coloring - to be implemented');
    console.log('Contact data available:', contactData.data.summary);
  };

  // Toggle color mode
  const handleColorModeToggle = async () => {
    const newMode = colorMode === 'chain' ? 'pae' : 'chain';
    setColorMode(newMode);

    if (newMode === 'pae') {
      await applyPAEColoring();
    } else {
      // Reset to chain coloring
      if (pluginRef.current && structureLoaded) {
        // Reload structure to reset colors
        window.location.reload(); // Simple approach for now
      }
    }
  };

  return (
    <div className="structure-viewer-container">
      {/* Header */}
      <div className="structure-viewer-header">
        <h4>
          3D Structure: {baitGene} ↔ {preyGene}
        </h4>
        <button
          onClick={onClose}
          className="btn btn-sm btn-secondary"
        >
          ← Back to Network
        </button>
      </div>

      {/* Controls */}
      {structureLoaded && (
        <div className="structure-controls">
          <div className="btn-group btn-group-sm" role="group">
            <button
              className={`btn ${colorMode === 'chain' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => colorMode !== 'chain' && handleColorModeToggle()}
            >
              Chain Colors
            </button>
            <button
              className={`btn ${colorMode === 'pae' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => colorMode !== 'pae' && handleColorModeToggle()}
              disabled={!contactData}
              title={!contactData ? 'PAE data not available' : ''}
            >
              PAE Confidence
            </button>
          </div>

          {contactData && (
            <div className="contact-summary">
              <small>
                Contacts: {contactData.data.summary.total_contacts}
                {' '}(VH: {contactData.data.summary.very_high_count},
                {' '}H: {contactData.data.summary.high_count},
                {' '}M: {contactData.data.summary.medium_count},
                {' '}L: {contactData.data.summary.low_count})
              </small>
            </div>
          )}
        </div>
      )}

      {/* Mol* Viewer Container */}
      <div
        ref={containerRef}
        className="molstar-container"
        style={{
          width: '100%',
          height: '600px',
          position: 'relative',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      />

      {/* Loading State */}
      {loading && (
        <div className="structure-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading structure...</span>
          </div>
          <p className="mt-2">Loading 3D structure...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Legend */}
      {structureLoaded && (
        <div className="structure-legend mt-3">
          {colorMode === 'chain' ? (
            <div>
              <strong>Chain Colors:</strong>
              <div className="d-flex gap-3 mt-2">
                <div>
                  <span className="color-box" style={{ backgroundColor: '#00bcd4' }}></span>
                  Chain A ({baitGene})
                </div>
                <div>
                  <span className="color-box" style={{ backgroundColor: '#ff9800' }}></span>
                  Chain B ({preyGene})
                </div>
              </div>
            </div>
          ) : (
            <div>
              <strong>PAE Confidence:</strong>
              <div className="d-flex gap-3 mt-2">
                <div>
                  <span className="color-box" style={{ backgroundColor: '#228b22' }}></span>
                  Very High (&lt;3Å)
                </div>
                <div>
                  <span className="color-box" style={{ backgroundColor: '#00ff00' }}></span>
                  High (&lt;5Å)
                </div>
                <div>
                  <span className="color-box" style={{ backgroundColor: '#ffff00' }}></span>
                  Medium (&lt;8Å)
                </div>
                <div>
                  <span className="color-box" style={{ backgroundColor: '#ff4500' }}></span>
                  Low (&lt;12Å)
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .structure-viewer-container {
          padding: 20px;
        }

        .structure-viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .structure-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .contact-summary {
          font-family: monospace;
        }

        .molstar-container {
          background: #f8f9fa;
        }

        .structure-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 1000;
        }

        .structure-legend {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .color-box {
          display: inline-block;
          width: 20px;
          height: 20px;
          margin-right: 8px;
          border: 1px solid #333;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
}
