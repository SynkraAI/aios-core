'use strict';

const CATEGORY_COLORS = {
  tasks: { color: '#4fc3f7', shape: 'box' },
  agents: { color: '#66bb6a', shape: 'dot' },
  templates: { color: '#ffd54f', shape: 'diamond' },
  scripts: { color: '#90a4ae', shape: 'box' },
};

const DEFAULT_COLOR = { color: '#b0bec5', shape: 'box' };

/**
 * Sanitize a string for safe embedding inside HTML/JS.
 * Prevents XSS by escaping HTML entities and JS-breaking chars.
 * @param {string} str - Raw string
 * @returns {string} Sanitized string
 */
function _sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Build vis-network nodes array with category-based styling.
 * @param {Array} nodes - Raw graph nodes
 * @returns {Array} Styled nodes for vis-network
 */
function _buildVisNodes(nodes) {
  const seen = new Set();
  return (nodes || []).reduce((acc, node) => {
    if (seen.has(node.id)) return acc;
    seen.add(node.id);

    const category = (node.group || node.category || '').toLowerCase();
    const style = CATEGORY_COLORS[category] || DEFAULT_COLOR;
    const depsCount = node.dependencies ? node.dependencies.length : 0;

    acc.push({
      id: node.id,
      label: _sanitize(node.label || node.id),
      color: style.color,
      shape: style.shape,
      title: [
        `<b>${_sanitize(node.label || node.id)}</b>`,
        `Type: ${_sanitize(node.group || node.category || 'unknown')}`,
        node.path ? `Path: ${_sanitize(node.path)}` : null,
        `Dependencies: ${depsCount}`,
      ].filter(Boolean).join('<br>'),
    });
    return acc;
  }, []);
}

/**
 * Build vis-network edges array.
 * @param {Array} edges - Raw graph edges
 * @returns {Array} Edges for vis-network
 */
function _buildVisEdges(edges) {
  return (edges || []).map((edge) => ({
    from: edge.from,
    to: edge.to,
    arrows: 'to',
  }));
}

/**
 * Build the legend HTML for the graph.
 * @returns {string} Legend HTML
 */
function _buildLegend() {
  const items = Object.entries(CATEGORY_COLORS).map(([name, style]) => {
    const shapeIcon = style.shape === 'dot' ? '&#9679;' : style.shape === 'diamond' ? '&#9670;' : '&#9632;';
    return `<span style="color:${style.color}">${shapeIcon}</span> ${name}`;
  });

  return '<div id="legend" style="position:fixed;top:10px;right:10px;background:rgba(30,30,30,0.9);'
    + 'padding:10px 14px;border-radius:6px;color:#ccc;font-family:monospace;font-size:12px;z-index:10;">'
    + items.join('<br>') + '</div>';
}

/**
 * Format graph data as a self-contained HTML page with vis-network.
 * @param {Object} graphData - Normalized graph data { nodes, edges, source, isFallback }
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.autoRefresh] - Add meta-refresh for watch mode
 * @param {number} [options.refreshInterval] - Refresh interval in seconds (default: 5)
 * @returns {string} Complete HTML string
 */
function formatAsHtml(graphData, options = {}) {
  const visNodes = _buildVisNodes(graphData.nodes);
  const visEdges = _buildVisEdges(graphData.edges);
  const legend = _buildLegend();

  const nodesJson = JSON.stringify(visNodes);
  const edgesJson = JSON.stringify(visEdges);

  const metaRefresh = options.autoRefresh
    ? `<meta http-equiv="refresh" content="${options.refreshInterval || 5}">`
    : '';

  const nodeCount = visNodes.length;
  const isLargeGraph = nodeCount > 200;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AIOS Graph Dashboard</title>
  ${metaRefresh}
  <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style>
    body { margin: 0; background: #1e1e1e; overflow: hidden; }
    #graph { width: 100vw; height: 100vh; }
    #status { position: fixed; top: 10px; left: 10px; color: #4fc3f7; font-family: monospace; font-size: 13px; z-index: 100; background: rgba(30,30,30,0.9); padding: 6px 12px; border-radius: 4px; }
  </style>
</head>
<body>
  <div id="status">Loading vis-network...</div>
  ${legend}
  <div id="graph"></div>
  <script>
    var statusEl = document.getElementById('status');
    try {
      if (typeof vis === 'undefined') {
        statusEl.textContent = 'ERROR: vis-network failed to load from CDN';
        statusEl.style.color = '#f44336';
      } else {
        statusEl.textContent = 'Creating graph (${nodeCount} nodes)...';
        var nodes = new vis.DataSet(${nodesJson});
        var edges = new vis.DataSet(${edgesJson});
        var container = document.getElementById('graph');
        var data = { nodes: nodes, edges: edges };
        var options = {
          physics: {
            stabilization: { iterations: ${isLargeGraph ? 200 : 100}, updateInterval: 25 },
            barnesHut: {
              gravitationalConstant: ${isLargeGraph ? -2000 : -3000},
              springLength: ${isLargeGraph ? 200 : 150},
              springConstant: 0.01,
              damping: 0.3
            }
          },
          nodes: {
            font: { color: '#ccc', size: ${isLargeGraph ? 10 : 12} },
            borderWidth: 1,
            scaling: { min: 5, max: 20 }
          },
          edges: {
            color: { color: '#555', highlight: '#aaa' },
            smooth: ${isLargeGraph ? 'false' : '{ type: "cubicBezier" }'}
          },
          interaction: {
            hover: true,
            tooltipDelay: 200,
            hideEdgesOnDrag: ${isLargeGraph ? 'true' : 'false'},
            hideEdgesOnZoom: ${isLargeGraph ? 'true' : 'false'}
          }
        };
        var network = new vis.Network(container, data, options);
        network.on('stabilizationProgress', function(params) {
          var pct = Math.round(params.iterations / params.total * 100);
          statusEl.textContent = 'Stabilizing... ' + pct + '%';
        });
        network.on('stabilizationIterationsDone', function() {
          statusEl.textContent = 'Graph ready — ${nodeCount} nodes, ' + edges.length + ' edges';
          statusEl.style.color = '#66bb6a';
          network.fit({ animation: { duration: 500 } });
          setTimeout(function() { statusEl.style.display = 'none'; }, 4000);
        });
      }
    } catch(e) {
      statusEl.textContent = 'JS Error: ' + e.message;
      statusEl.style.color = '#f44336';
    }
  </script>
</body>
</html>`;
}

module.exports = {
  formatAsHtml,
  _sanitize,
  _buildVisNodes,
  _buildVisEdges,
  _buildLegend,
  CATEGORY_COLORS,
  DEFAULT_COLOR,
};
