'use strict';

const {
  formatAsHtml,
  _sanitize,
  _buildVisNodes,
  _buildVisEdges,
  _buildLegend,
  CATEGORY_COLORS,
} = require('../../.aios-core/core/graph-dashboard/formatters/html-formatter');

const MOCK_GRAPH_DATA = {
  nodes: [
    { id: 'dev', label: 'dev', group: 'agents', path: '.aios-core/agents/dev.md', dependencies: ['task-a'] },
    { id: 'task-a', label: 'task-a', group: 'tasks', path: '.aios-core/tasks/task-a.md', dependencies: [] },
    { id: 'tmpl-story', label: 'story-tmpl', group: 'templates', path: '.aios-core/templates/story-tmpl.yaml' },
    { id: 'script-1', label: 'build.js', group: 'scripts', path: '.aios-core/scripts/build.js' },
  ],
  edges: [
    { from: 'dev', to: 'task-a' },
    { from: 'dev', to: 'tmpl-story' },
  ],
  source: 'code-intel',
  isFallback: false,
};

describe('html-formatter', () => {
  describe('formatAsHtml', () => {
    it('should return a complete HTML string with vis-network CDN', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('https://unpkg.com/vis-network/standalone/umd/vis-network.min.js');
      expect(html).toContain('</html>');
    });

    it('should embed JSON data that can be parsed back', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      const nodesMatch = html.match(/new vis\.DataSet\((\[.*?\])\)/s);
      expect(nodesMatch).toBeTruthy();
      const parsed = JSON.parse(nodesMatch[1]);
      expect(parsed.length).toBe(4);
      expect(parsed[0].id).toBe('dev');
    });

    it('should include meta charset utf-8', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('<meta charset="utf-8">');
    });

    it('should use dark theme background', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('#1e1e1e');
    });

    it('should include physics stabilization config', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('stabilization');
      expect(html).toContain('iterations: 100');
    });

    it('should include legend with all categories', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).toContain('id="legend"');
      expect(html).toContain('tasks');
      expect(html).toContain('agents');
      expect(html).toContain('templates');
      expect(html).toContain('scripts');
    });

    it('should generate valid HTML for empty graph', () => {
      const html = formatAsHtml({ nodes: [], edges: [] });
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('new vis.DataSet([])');
      expect(html).toContain('</html>');
    });

    it('should add meta-refresh when autoRefresh option is set', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA, { autoRefresh: true, refreshInterval: 5 });
      expect(html).toContain('<meta http-equiv="refresh" content="5">');
    });

    it('should NOT add meta-refresh by default', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA);
      expect(html).not.toContain('http-equiv="refresh"');
    });

    it('should default refreshInterval to 5 when autoRefresh is true', () => {
      const html = formatAsHtml(MOCK_GRAPH_DATA, { autoRefresh: true });
      expect(html).toContain('content="5"');
    });
  });

  describe('_sanitize', () => {
    it('should escape HTML special characters', () => {
      expect(_sanitize('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(_sanitize('a & b')).toBe('a &amp; b');
    });

    it('should escape single quotes', () => {
      expect(_sanitize("it's")).toBe('it&#x27;s');
    });

    it('should handle non-string input', () => {
      expect(_sanitize(123)).toBe('123');
      expect(_sanitize(null)).toBe('null');
    });
  });

  describe('_buildVisNodes', () => {
    it('should apply correct colors per category', () => {
      const nodes = _buildVisNodes(MOCK_GRAPH_DATA.nodes);

      const agentNode = nodes.find((n) => n.id === 'dev');
      expect(agentNode.color).toBe(CATEGORY_COLORS.agents.color);
      expect(agentNode.shape).toBe(CATEGORY_COLORS.agents.shape);

      const taskNode = nodes.find((n) => n.id === 'task-a');
      expect(taskNode.color).toBe(CATEGORY_COLORS.tasks.color);

      const tmplNode = nodes.find((n) => n.id === 'tmpl-story');
      expect(tmplNode.color).toBe(CATEGORY_COLORS.templates.color);
      expect(tmplNode.shape).toBe(CATEGORY_COLORS.templates.shape);

      const scriptNode = nodes.find((n) => n.id === 'script-1');
      expect(scriptNode.color).toBe(CATEGORY_COLORS.scripts.color);
    });

    it('should include tooltip with path, type, and dependencies count', () => {
      const nodes = _buildVisNodes(MOCK_GRAPH_DATA.nodes);
      const devNode = nodes.find((n) => n.id === 'dev');
      expect(devNode.title).toContain('Type: agents');
      expect(devNode.title).toContain('Path: .aios-core/agents/dev.md');
      expect(devNode.title).toContain('Dependencies: 1');
    });

    it('should use default color for unknown category', () => {
      const nodes = _buildVisNodes([{ id: 'x', label: 'x', group: 'unknown' }]);
      expect(nodes[0].color).toBe('#b0bec5');
    });

    it('should handle null/undefined nodes', () => {
      expect(_buildVisNodes(null)).toEqual([]);
      expect(_buildVisNodes(undefined)).toEqual([]);
    });
  });

  describe('_buildVisEdges', () => {
    it('should map edges with arrows', () => {
      const edges = _buildVisEdges(MOCK_GRAPH_DATA.edges);
      expect(edges).toHaveLength(2);
      expect(edges[0]).toEqual({ from: 'dev', to: 'task-a', arrows: 'to' });
    });

    it('should handle null/undefined edges', () => {
      expect(_buildVisEdges(null)).toEqual([]);
      expect(_buildVisEdges(undefined)).toEqual([]);
    });
  });

  describe('_buildLegend', () => {
    it('should contain all category names', () => {
      const legend = _buildLegend();
      expect(legend).toContain('tasks');
      expect(legend).toContain('agents');
      expect(legend).toContain('templates');
      expect(legend).toContain('scripts');
    });

    it('should contain category colors', () => {
      const legend = _buildLegend();
      expect(legend).toContain(CATEGORY_COLORS.tasks.color);
      expect(legend).toContain(CATEGORY_COLORS.agents.color);
    });
  });

  describe('CLI integration (FORMAT_MAP)', () => {
    it('should have html in FORMAT_MAP', () => {
      const { FORMAT_MAP } = require('../../.aios-core/core/graph-dashboard/cli');
      expect(FORMAT_MAP.html).toBe(formatAsHtml);
    });

    it('should have html in VALID_FORMATS', () => {
      const { VALID_FORMATS } = require('../../.aios-core/core/graph-dashboard/cli');
      expect(VALID_FORMATS).toContain('html');
    });

    it('should have html in WATCH_FORMAT_MAP', () => {
      const { WATCH_FORMAT_MAP } = require('../../.aios-core/core/graph-dashboard/cli');
      expect(WATCH_FORMAT_MAP.html).toBeDefined();
      expect(WATCH_FORMAT_MAP.html.filename).toBe('graph.html');
    });

    it('should parse --format=html correctly', () => {
      const { parseArgs } = require('../../.aios-core/core/graph-dashboard/cli');
      const args = parseArgs(['--deps', '--format=html']);
      expect(args.format).toBe('html');
      expect(args.command).toBe('--deps');
    });

    it('should parse --format html correctly', () => {
      const { parseArgs } = require('../../.aios-core/core/graph-dashboard/cli');
      const args = parseArgs(['--deps', '--format', 'html']);
      expect(args.format).toBe('html');
    });
  });

  describe('XSS prevention', () => {
    it('should sanitize node labels with script tags', () => {
      const maliciousData = {
        nodes: [{ id: 'xss', label: '<img src=x onerror=alert(1)>', group: 'tasks' }],
        edges: [],
      };
      const html = formatAsHtml(maliciousData);
      expect(html).not.toContain('<img src=x');
      expect(html).toContain('&lt;img src=x');
    });

    it('should sanitize node labels with embedded quotes', () => {
      const maliciousData = {
        nodes: [{ id: 'q', label: '"); alert("xss', group: 'tasks' }],
        edges: [],
      };
      const html = formatAsHtml(maliciousData);
      expect(html).not.toContain('"); alert("xss');
    });
  });
});
