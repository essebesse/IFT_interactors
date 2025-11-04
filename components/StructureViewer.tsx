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
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
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
        // Reset to default chain coloring
        const structureNodes = plugin.state.data.select(node =>
          node.obj?.type === 'structure'
        );

        for (const node of structureNodes) {
          const structure = node.obj?.data;
          if (!structure) continue;

          // Reapply default preset to restore chain coloring
          await plugin.builders.structure.representation.applyPreset(
            node.ref,
            'default'
          );
        }
      }
    } catch (err) {
      console.error('Error toggling color mode:', err);
    }
  };

  // Apply PAE-based coloring to structure
  const applyPAEColoring = async (plugin: PluginUIContext, contactData: ContactData) => {
    // Build residue-to-color map from contact data
    const residueColors = new Map<string, Color>();

    // Color map based on PAE confidence
    const colorMap = {
      'Very High': Color.fromRgb(34, 139, 34),    // Dark green
      'High': Color.fromRgb(0, 255, 0),            // Lime green
      'Medium': Color.fromRgb(255, 255, 0),        // Yellow
      'Low': Color.fromRgb(255, 69, 0)             // Orange-red
    };

    // Map all interface residues to colors
    for (const contact of contactData.data.contacts) {
      const key1 = `${contact.chain1}:${contact.resi1}`;
      const key2 = `${contact.chain2}:${contact.resi2}`;
      const color = colorMap[contact.confidence as keyof typeof colorMap] || Color.fromRgb(128, 128, 128);

      residueColors.set(key1, color);
      residueColors.set(key2, color);
    }

    // Get all structure representations
    const structureRefs = plugin.state.data.select(node =>
      node.obj?.type === 'structure'
    );

    for (const structureNode of structureRefs) {
      // Remove existing representations
      const repNodes = plugin.state.data.select(node =>
        node.ref.startsWith(structureNode.ref) && node.obj?.type === 'representation'
      );

      for (const repNode of repNodes) {
        await plugin.build().delete(repNode.ref).commit();
      }

      // Create new cartoon representation with PAE coloring
      await plugin.builders.structure.representation.addRepresentation(
        structureNode.ref,
        {
          type: 'cartoon',
          color: 'uniform',
          colorParams: { value: Color.fromRgb(200, 200, 200) } // Default gray
        }
      );

      // Add ball-and-stick representation for interface residues
      for (const [residueKey, color] of residueColors) {
        const [chain, resi] = residueKey.split(':');

        try {
          const selection = Script.getStructureSelection(
            Q => Q.struct.generator.atomGroups({
              'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_asym_id(), chain]),
              'residue-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_seq_id(), parseInt(resi)])
            }),
            structureNode.obj!.data
          );

          await plugin.builders.structure.representation.addRepresentation(
            structureNode.ref,
            {
              type: 'ball-and-stick',
              color: 'uniform',
              colorParams: { value: color },
              size: 'uniform',
              sizeParams: { value: 0.8 }
            },
            { selection }
          );
        } catch (err) {
          // Skip residues that can't be selected (might be missing in structure)
          continue;
        }
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
              <strong>PAE Interface Coloring:</strong>
              <p className="text-muted small mb-2">
                Protein chains shown in gray. Interface residues highlighted by PAE confidence:
              </p>
              <div className="d-flex gap-3 mt-2">
                <div>
                  <span className="color-box" style={{ backgroundColor: '#228b22' }}></span>
                  Very High (&lt;3Å)
                </div>
                <div>
                  <span className="color-box" style={{ backgroundColor: '#00ff00' }}></span>
                  High (3-5Å)
                </div>
                <div>
                  <span className="color-box" style={{ backgroundColor: '#ffff00' }}></span>
                  Medium (5-8Å)
                </div>
                <div>
                  <span className="color-box" style={{ backgroundColor: '#ff4500' }}></span>
                  Low (8-12Å)
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
