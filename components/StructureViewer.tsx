'use client';

/**
 * Structure Viewer Component
 * ===========================
 *
 * 3D structure visualization using Mol* (Molstar) with automatic PAE-based interface coloring.
 *
 * Features:
 * - Load CIF files from API
 * - Automatic PAE interface highlighting (on by default):
 *   - Yellow: Very High Confidence (PAE <3Å)
 *   - Magenta: High Confidence (PAE 3-6Å)
 * - Distinct chain colors for protein visualization
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
import { setStructureOverpaint } from 'molstar/lib/mol-plugin-state/helpers/structure-overpaint';
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
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [structureLoaded, setStructureLoaded] = useState(false);
  const [pluginReady, setPluginReady] = useState(false);

  // Initialize Mol* plugin
  useEffect(() => {
    if (!containerRef.current || pluginRef.current) return;

    const initPlugin = async () => {
      try {
        console.log('### INITIALIZING MOLSTAR PLUGIN ###');
        if (!containerRef.current) return;

        // Custom spec to disable external network calls
        const customSpec = DefaultPluginUISpec();

        console.log('Filtering behaviors to remove external calls...');
        // Disable all external behaviors and validation
        customSpec.behaviors = customSpec.behaviors.filter(b =>
          b.transformer.definition.name !== 'rcsb-assembly-symmetry' &&
          b.transformer.definition.name !== 'pdbe-structure-quality-report'
        );

        console.log('Creating Molstar UI...');
        const plugin = await createPluginUI({
          target: containerRef.current,
          render: renderReact18,
          spec: customSpec
        });

        console.log('✓ Molstar plugin initialized successfully!');
        pluginRef.current = plugin;
        setPluginReady(true);

      } catch (err) {
        console.error('!!! Failed to initialize Mol*:', err);
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
    console.log('Structure loading useEffect triggered, interactionId:', interactionId);
    console.log('Plugin ready?', pluginReady);
    console.log('Plugin ref exists?', !!pluginRef.current);

    if (!pluginReady || !pluginRef.current) {
      console.log('⚠️ Plugin not ready, skipping structure load');
      return;
    }

    const loadStructure = async () => {
      console.log('=== STARTING STRUCTURE LOAD ===');
      console.log('Interaction ID:', interactionId);

      setLoading(true);
      setError(null);
      setStructureLoaded(false);
      setContactData(null);

      try {
        const plugin = pluginRef.current!;

        // Clear any existing structures
        console.log('Clearing existing structures...');
        await plugin.clear();

        // Fetch PAE contact data
        console.log('Fetching PAE data from:', `/api/structure/${interactionId}/pae`);
        const paeResponse = await fetch(`/api/structure/${interactionId}/pae`);
        let paeData: ContactData | null = null;
        if (paeResponse.ok) {
          paeData = await paeResponse.json();
          setContactData(paeData);
          console.log('PAE data loaded successfully');
        } else {
          console.warn('PAE contact data not available');
        }

        // Load structure into Mol*
        console.log('Fetching CIF from:', `/api/structure/${interactionId}`);
        const data = await plugin.builders.data.download(
          { url: `/api/structure/${interactionId}`, isBinary: false },
          { state: { isGhost: false } }
        );
        console.log('CIF data downloaded, parsing...');

        const trajectory = await plugin.builders.structure.parseTrajectory(data, 'mmcif');

        // Apply default preset (chains will get default colors)
        await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');

        // Automatically apply PAE coloring if data is available
        if (paeData) {
          console.log('Automatically applying PAE interface coloring...');
          await applyPAEColoring(plugin, paeData);
        }

        setStructureLoaded(true);
        setLoading(false);

      } catch (err) {
        console.error('Error loading structure:', err);
        setError(err instanceof Error ? err.message : 'Failed to load structure');
        setLoading(false);
      }
    };

    loadStructure();
  }, [interactionId, pluginReady]);


  // Apply PAE-based coloring to structure
  const applyPAEColoring = async (plugin: PluginUIContext, contactData: ContactData) => {
    try {
      console.log('=== Starting PAE interface highlighting ===');
      console.log('Contact data:', contactData.data.summary);

      // Get the structure
      const structures = plugin.managers.structure.hierarchy.current.structures;
      console.log('Found structures:', structures.length);

      if (structures.length === 0) {
        console.warn('No structure found for PAE highlighting');
        return;
      }

      const structure = structures[0];
      const structureData = structure.cell.obj?.data;
      if (!structureData) {
        console.warn('No structure data found');
        return;
      }

      // Separate residues by PAE confidence tiers
      const veryHighConfidence = new Set<string>(); // PAE <3Å
      const highConfidence = new Set<string>();     // PAE 3-6Å

      for (const contact of contactData.data.contacts) {
        if (contact.pae < 3) {
          veryHighConfidence.add(`${contact.chain1}:${contact.resi1}`);
          veryHighConfidence.add(`${contact.chain2}:${contact.resi2}`);
        } else if (contact.pae < 6) {
          highConfidence.add(`${contact.chain1}:${contact.resi1}`);
          highConfidence.add(`${contact.chain2}:${contact.resi2}`);
        }
      }

      console.log(`PAE <3Å (Very High): ${veryHighConfidence.size} residues`);
      console.log(`PAE 3-6Å (High): ${highConfidence.size} residues`);

      // Helper function to create selection from residue set
      const createSelection = (residues: Set<string>) => {
        const residueArray = Array.from(residues).map(key => {
          const [chain, resi] = key.split(':');
          return { chain, resi: parseInt(resi) };
        });

        return Script.getStructureSelection(
          Q => Q.struct.generator.atomGroups({
            'residue-test': Q.core.logic.or(
              residueArray.map(r =>
                Q.core.logic.and([
                  Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_asym_id(), r.chain]),
                  Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_seq_id(), r.resi])
                ])
              )
            )
          }),
          structureData
        );
      };

      // Apply very high confidence (PAE <3Å) in bright yellow
      if (veryHighConfidence.size > 0) {
        const selection = createSelection(veryHighConfidence);
        await setStructureOverpaint(
          plugin,
          structure.components,
          Color(0xFFFF00),  // Bright yellow
          async () => StructureSelection.toLociWithSourceUnits(selection)
        );
        console.log(`✓ Highlighted ${veryHighConfidence.size} residues (PAE <3Å) in yellow`);
      }

      // Apply high confidence (PAE 3-6Å) in bright magenta
      if (highConfidence.size > 0) {
        const selection = createSelection(highConfidence);
        await setStructureOverpaint(
          plugin,
          structure.components,
          Color(0xFF00FF),  // Bright magenta
          async () => StructureSelection.toLociWithSourceUnits(selection)
        );
        console.log(`✓ Highlighted ${highConfidence.size} residues (PAE 3-6Å) in magenta`);
      }

      console.log('✓ PAE interface highlighting complete!');

    } catch (err) {
      console.error('!!! Error applying PAE highlighting:', err);
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

      {/* Info Panel */}
      {structureLoaded && contactData && (
        <div className="structure-info">
          <div className="contact-summary">
            <strong>Interface Contacts:</strong> {contactData.data.summary.total_contacts}
            {' '}(Very High: {contactData.data.summary.very_high_count},
            {' '}High: {contactData.data.summary.high_count},
            {' '}Medium: {contactData.data.summary.medium_count},
            {' '}Low: {contactData.data.summary.low_count})
          </div>
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
      {structureLoaded && contactData && (
        <div className="structure-legend mt-3">
          <div>
            <strong>Interface Coloring:</strong>
            <p className="text-muted small mb-2">
              Protein chains shown in distinct colors. Interface residues highlighted by PAE confidence:
            </p>
            <div className="d-flex gap-3 mt-2 flex-wrap">
              <div>
                <span className="color-box" style={{ backgroundColor: '#FFFF00' }}></span>
                Very High Confidence (PAE &lt;3Å)
              </div>
              <div>
                <span className="color-box" style={{ backgroundColor: '#FF00FF' }}></span>
                High Confidence (PAE 3-6Å)
              </div>
            </div>
          </div>
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

        .structure-info {
          background: #f8f9fa;
          padding: 10px 15px;
          border-radius: 4px;
          margin-bottom: 15px;
        }

        .contact-summary {
          font-size: 0.9rem;
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
