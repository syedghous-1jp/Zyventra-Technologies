const { Node } = require('./Node');
const { Edge } = require('./Edge');

class Graph {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
    this.index = { byTo: new Map(), byFrom: new Map() };
  }

  addNode(node) {
    if (!this.nodes.has(node.id)) this.nodes.set(node.id, node);
  }

  addEdge(edge) {
    this.edges.push(edge);
    if (!this.index.byFrom.has(edge.from)) this.index.byFrom.set(edge.from, []);
    this.index.byFrom.get(edge.from).push(edge);
    if (!this.index.byTo.has(edge.to)) this.index.byTo.set(edge.to, []);
    this.index.byTo.get(edge.to).push(edge);
  }

  getNode(id) { return this.nodes.get(id); }

  getDependents(nodeId) {
    const edges = this.index.byTo.get(nodeId) || [];
    return edges.map(e => this.getNode(e.from)).filter(Boolean);
  }

  getDependencies(nodeId) {
    const edges = this.index.byFrom.get(nodeId) || [];
    return edges.map(e => this.getNode(e.to)).filter(Boolean);
  }

  getSubgraph(nodeId, depth = 1) {
    const visited = new Set();
    const result = { nodes: [], edges: [] };
    const traverse = (currentId, currentDepth) => {
      if (visited.has(currentId) || currentDepth > depth) return;
      visited.add(currentId);
      const node = this.getNode(currentId);
      if (!node) return;
      result.nodes.push(node);
      const outgoing = this.index.byFrom.get(currentId) || [];
      const incoming = this.index.byTo.get(currentId) || [];
      outgoing.forEach(e => {
        result.edges.push(e);
        if (!visited.has(e.to)) traverse(e.to, currentDepth + 1);
      });
      incoming.forEach(e => {
        result.edges.push(e);
        if (!visited.has(e.from)) traverse(e.from, currentDepth + 1);
      });
    };
    traverse(nodeId, 0);
    return result;
  }

  toJSON() {
    return { nodes: Array.from(this.nodes.values()).map(n => n.toJSON()), edges: this.edges.map(e => e.toJSON()) };
  }

  static fromJSON(data) {
    const g = new Graph();
    data.nodes.forEach(n => g.addNode(Node.fromJSON(n)));
    data.edges.forEach(e => g.addEdge(Edge.fromJSON(e)));
    return g;
  }
}

module.exports = { Graph };
