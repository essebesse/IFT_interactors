#!/usr/bin/env node
/**
 * Export Network for Cytoscape
 * Generates SIF and node/edge attribute files for Cytoscape visualization
 */

import fs from 'fs';

function main() {
  console.log('Loading categorized interactions...');

  const categorized = JSON.parse(
    fs.readFileSync('data/categorized_interactions.json', 'utf8')
  );

  // Collect unique nodes
  const nodes = new Map();

  for (const interaction of categorized) {
    if (!nodes.has(interaction.bait_gene)) {
      nodes.set(interaction.bait_gene, {
        name: interaction.bait_gene,
        uniprot: interaction.bait_uniprot,
        category: interaction.bait_category,
        type: 'bait'
      });
    }

    if (!nodes.has(interaction.prey_gene)) {
      nodes.set(interaction.prey_gene, {
        name: interaction.prey_gene,
        uniprot: interaction.prey_uniprot,
        category: interaction.prey_category,
        type: 'prey'
      });
    }
  }

  console.log(`\nExporting ${nodes.size} nodes and ${categorized.length} edges`);

  // Generate SIF file (Simple Interaction Format)
  const sifLines = [];
  for (const interaction of categorized) {
    sifLines.push(`${interaction.bait_gene}\tinteracts_with\t${interaction.prey_gene}`);
  }
  fs.writeFileSync('data/cytoscape_network.sif', sifLines.join('\n'));

  // Generate node attributes file
  const nodeAttrLines = ['name\tuniprot_id\tcategory\tnode_type'];
  for (const [name, node] of nodes) {
    nodeAttrLines.push(`${name}\t${node.uniprot}\t${node.category}\t${node.type}`);
  }
  fs.writeFileSync('data/cytoscape_node_attributes.txt', nodeAttrLines.join('\n'));

  // Generate edge attributes file
  const edgeAttrLines = [
    'source\ttarget\tinteraction_category\tipsae\tiptm\t' +
    'contacts_lt_3\tcontacts_lt_6\tinterface_plddt\tconfidence_level'
  ];

  for (const interaction of categorized) {
    const confidenceLevel = interaction.ipsae >= 0.7 ? 'High' :
                           interaction.ipsae >= 0.5 ? 'Medium' : 'Low';

    edgeAttrLines.push(
      `${interaction.bait_gene}\t${interaction.prey_gene}\t` +
      `${interaction.interaction_category}\t${interaction.ipsae}\t${interaction.iptm}\t` +
      `${interaction.contacts_lt_3}\t${interaction.contacts_lt_6}\t` +
      `${interaction.interface_plddt}\t${confidenceLevel}`
    );
  }
  fs.writeFileSync('data/cytoscape_edge_attributes.txt', edgeAttrLines.join('\n'));

  // Generate GraphML format (alternative, more feature-rich)
  const graphml = generateGraphML(nodes, categorized);
  fs.writeFileSync('data/cytoscape_network.graphml', graphml);

  // Generate Cytoscape style file (JSON for Cytoscape.js)
  const style = generateCytoscapeStyle();
  fs.writeFileSync('data/cytoscape_style.json', JSON.stringify(style, null, 2));

  console.log('\n✓ Generated files:');
  console.log('  - data/cytoscape_network.sif (Simple Interaction Format)');
  console.log('  - data/cytoscape_node_attributes.txt');
  console.log('  - data/cytoscape_edge_attributes.txt');
  console.log('  - data/cytoscape_network.graphml (GraphML format)');
  console.log('  - data/cytoscape_style.json (Cytoscape.js style)');
  console.log('\nImport into Cytoscape:');
  console.log('  1. File → Import → Network from File → Select cytoscape_network.sif');
  console.log('  2. File → Import → Table from File → Select node/edge attribute files');
  console.log('  3. Apply visual style based on node_type, category, and confidence_level');
}

function generateGraphML(nodes, edges) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';

  // Define node attributes
  xml += '  <key id="uniprot" for="node" attr.name="uniprot_id" attr.type="string"/>\n';
  xml += '  <key id="category" for="node" attr.name="category" attr.type="string"/>\n';
  xml += '  <key id="type" for="node" attr.name="node_type" attr.type="string"/>\n';

  // Define edge attributes
  xml += '  <key id="int_cat" for="edge" attr.name="interaction_category" attr.type="string"/>\n';
  xml += '  <key id="ipsae" for="edge" attr.name="ipsae" attr.type="double"/>\n';
  xml += '  <key id="iptm" for="edge" attr.name="iptm" attr.type="double"/>\n';
  xml += '  <key id="conf" for="edge" attr.name="confidence_level" attr.type="string"/>\n';

  xml += '  <graph id="IFT_BBSome_Network" edgedefault="undirected">\n';

  // Add nodes
  for (const [name, node] of nodes) {
    xml += `    <node id="${escapeXml(name)}">\n`;
    xml += `      <data key="uniprot">${escapeXml(node.uniprot)}</data>\n`;
    xml += `      <data key="category">${escapeXml(node.category)}</data>\n`;
    xml += `      <data key="type">${escapeXml(node.type)}</data>\n`;
    xml += `    </node>\n`;
  }

  // Add edges
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const confidenceLevel = edge.ipsae >= 0.7 ? 'High' :
                           edge.ipsae >= 0.5 ? 'Medium' : 'Low';

    xml += `    <edge id="e${i}" source="${escapeXml(edge.bait_gene)}" target="${escapeXml(edge.prey_gene)}">\n`;
    xml += `      <data key="int_cat">${escapeXml(edge.interaction_category)}</data>\n`;
    xml += `      <data key="ipsae">${edge.ipsae}</data>\n`;
    xml += `      <data key="iptm">${edge.iptm}</data>\n`;
    xml += `      <data key="conf">${confidenceLevel}</data>\n`;
    xml += `    </edge>\n`;
  }

  xml += '  </graph>\n';
  xml += '</graphml>\n';

  return xml;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateCytoscapeStyle() {
  return [
    {
      selector: 'node',
      style: {
        'label': 'data(id)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '10px',
        'width': '30px',
        'height': '30px'
      }
    },
    {
      selector: 'node[type = "bait"]',
      style: {
        'background-color': '#3498db',
        'shape': 'roundrectangle'
      }
    },
    {
      selector: 'node[type = "prey"]',
      style: {
        'background-color': '#95a5a6',
        'shape': 'ellipse'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#bdc3c7',
        'curve-style': 'bezier'
      }
    },
    {
      selector: 'edge[confidence_level = "High"]',
      style: {
        'line-color': '#27ae60',
        'width': 4
      }
    },
    {
      selector: 'edge[confidence_level = "Medium"]',
      style: {
        'line-color': '#f39c12',
        'width': 3
      }
    },
    {
      selector: 'edge[confidence_level = "Low"]',
      style: {
        'line-color': '#e74c3c',
        'width': 2
      }
    }
  ];
}

main();
