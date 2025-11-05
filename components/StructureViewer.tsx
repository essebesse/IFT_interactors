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
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import { Color } from 'molstar/lib/mol-util/color';
import { Script } from 'molstar/lib/mol-script/script';
import { StructureSelection } from 'molstar/lib/mol-model/structure';
import { setStructureOverpaint, clearStructureOverpaint } from 'molstar/lib/mol-plugin-state/helpers/structure-overpaint';
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
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

type ColorMode = 'chain' | 'pae';

export default function StructureViewer({
  interactionId,
  baitGene,
  preyGene,
  onClose,
  isFullscreen,
  onToggleFullscreen
}: StructureViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pluginRef = useRef<PluginUIContext | null>(null);

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
        if (!containerRef.current) return;

        const plugin = await createPluginUI({
          target: containerRef.current,
          render: renderReact18,
          spec: DefaultPluginUISpec()
        });

        pluginRef.current = plugin;

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
      setStructureLoaded(false);
      setContactData(null);
      setColorMode('chain');

      try {
        const plugin = pluginRef.current!;

        // Clear any existing structures
        await plugin.clear();

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
        const data = await plugin.builders.data.download(
          { url: `/api/structure/${interactionId}`, isBinary: false },
          { state: { isGhost: false } }
        );

        const trajectory = await plugin.builders.structure.parseTrajectory(data, 'mmcif');

        // Apply default preset (chains will get default colors)
        await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');

        setStructureLoaded(true);
        setLoading(false);

      } catch (err) {
        console.error('Error loading structure:', err);
        setError(err instanceof Error ? err.message : 'Failed to load structure');
        setLoading(false);
      }
    };

    loadStructure();
  }, [interactionId]);

  // Toggle color mode and apply PAE coloring
  const handleColorModeToggle = async () => {
    if (!pluginRef.current || !structureLoaded) return;

    const newMode = colorMode === 'chain' ? 'pae' : 'chain';
    setColorMode(newMode);

    const plugin = pluginRef.current;

    try {
      if (newMode === 'pae' && contactData) {
        // Apply PAE-based coloring
        await applyPAEColoring(plugin, contactData);
      } else {
        // Clear overpaint to return to default chain coloring
        const structures = plugin.managers.structure.hierarchy.current.structures;
        if (structures.length > 0) {
          await clearStructureOverpaint(plugin, structures[0].components);
        }
      }
    } catch (err) {
      console.error('Error toggling color mode:', err);
    }
  };

  // Apply PAE-based coloring to structure
  const applyPAEColoring = async (plugin: PluginUIContext, contactData: ContactData) => {
    try {
      console.log('=== Starting PAE highlighting ===');
      console.log('Contact data:', contactData.data.summary);

      // Get the structure
      const structures = plugin.managers.structure.hierarchy.current.structures;
      console.log('Found structures:', structures.length);

      if (structures.length === 0) {
        alert('No structure found for PAE highlighting');
        return;
      }

      const structure = structures[0];
      const structureData = structure.cell.obj?.data;
      if (!structureData) {
        alert('No structure data found');
        return;
      }

      // Collect high-confidence interface residues (PAE < 6Å)
      const goodResidues = new Set<string>();
      for (const contact of contactData.data.contacts) {
        if (contact.pae < 6) {
          goodResidues.add(`${contact.chain1}:${contact.resi1}`);
          goodResidues.add(`${contact.chain2}:${contact.resi2}`);
        }
      }

      console.log(`Found ${goodResidues.size} residues with PAE < 6Å`);

      if (goodResidues.size === 0) {
        alert('No high-confidence interface residues found (PAE < 6Å)');
        return;
      }

      // Convert to array and limit
      const residuesToHighlight = Array.from(goodResidues)
        .slice(0, 100)
        .map(key => {
          const [chain, resi] = key.split(':');
          return { chain, resi: parseInt(resi) };
        });

      console.log(`Highlighting first ${residuesToHighlight.length} residues`);

      // Create selection
      const selection = Script.getStructureSelection(
        Q => Q.struct.generator.atomGroups({
          'residue-test': Q.core.logic.or(
            residuesToHighlight.map(r =>
              Q.core.logic.and([
                Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_asym_id(), r.chain]),
                Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_seq_id(), r.resi])
              ])
            )
          )
        }),
        structureData
      );

      console.log('Selection created, applying overpaint...');

      // Apply overpaint
      await setStructureOverpaint(
        plugin,
        structure.components,
        Color(0x00ff00),  // Bright green
        async () => StructureSelection.toLociWithSourceUnits(selection)
      );

      console.log('✓ PAE highlighting complete!');
      alert(`✓ Highlighted ${residuesToHighlight.length} interface residues (PAE < 6Å) in green`);

    } catch (err) {
      console.error('!!! Error applying PAE highlighting:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="structure-viewer-container">
      {/* Header */}
      <div className="structure-viewer-header">
        <h4>
          3D Structure: {baitGene} ↔ {preyGene}
        </h4>
        <div className="d-flex gap-2">
          <button
            onClick={onToggleFullscreen}
            className="btn btn-sm btn-outline-secondary"
            title={isFullscreen ? "Minimize viewer" : "Fullscreen viewer"}
          >
            {isFullscreen ? "⊡ Minimize" : "⛶ Fullscreen"}
          </button>
          <button
            onClick={onClose}
            className="btn btn-sm btn-secondary"
          >
            ✕ Close
          </button>
        </div>
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
          height: isFullscreen ? 'calc(100vh - 250px)' : '600px',
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
              <p className="text-muted small mb-2">
                Each protein chain is colored distinctly. {baitGene} and {preyGene} are shown in different colors for clarity.
              </p>
            </div>
          ) : (
            <div>
              <strong>PAE Interface Highlighting:</strong>
              <p className="text-muted small mb-2">
                High-confidence interface residues (PAE &lt; 6Å) highlighted in bright green.
                Chains retain their normal distinct colors.
              </p>
              <div className="d-flex gap-3 mt-2">
                <div>
                  <span className="color-box" style={{ backgroundColor: '#00ff00' }}></span>
                  Interface (PAE &lt; 6Å)
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .structure-viewer-container {
          padding: 20px;
          ${isFullscreen ? `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            z-index: 9999;
            background: white;
            overflow: auto;
          ` : ''}
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
