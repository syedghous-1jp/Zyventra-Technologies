const fs = require('fs-extra');
const path = require('path');
const { Graph } = require('./Graph');

class GraphStore {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.cacheDir = path.join(baseDir, '.zyventra-cache');
    fs.ensureDirSync(this.cacheDir);
  }

  saveSnapshot(name, graph) {
    const file = path.join(this.cacheDir, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify(graph.toJSON(), null, 2));
  }

  loadSnapshot(name) {
    const file = path.join(this.cacheDir, `${name}.json`);
    if (!fs.existsSync(file)) return null;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Graph.fromJSON(data);
  }

  async buildBaseGraph(root) {
    const graph = new Graph();
    const files = this.scanFiles(root);
    for (const file of files) {
      const parser = this.getParser(file);
      if (!parser) continue;
      const result = parser.parse(file);
      result.nodes.forEach(n => graph.addNode(n));
      result.edges.forEach(e => graph.addEdge(e));
    }
    return graph;
  }

  scanFiles(root) {
    const files = [];
    const traverse = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          if (item === '.terraform' || item === 'node_modules') return;
          traverse(fullPath);
        } else if (/\.(tf|json|ya?ml)$/.test(item)) {
          files.push(fullPath);
        }
      });
    };
    traverse(root);
    return files;
  }

  getParser(file) {
    const parsers = {
      '.tf': require('../parsers/terraform'),
      '.json': require('../parsers/iam'),
      '.yaml': require('../parsers/yaml'),
      '.yml': require('../parsers/yaml'),
    };
    const ext = file.slice(file.lastIndexOf('.'));
    return parsers[ext] ? new parsers[ext]() : null;
  }
}

module.exports = { GraphStore };
