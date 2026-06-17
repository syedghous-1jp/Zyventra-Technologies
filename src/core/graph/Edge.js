class Edge {
  constructor(fromId, toId, type, file, line, confidence = 1.0) {
    this.from = fromId;
    this.to = toId;
    this.type = type;
    this.file = file;
    this.line = line;
    this.confidence = confidence;
    this.metadata = { resolved: true };
  }

  toJSON() {
    return { from: this.from, to: this.to, type: this.type, file: this.file, line: this.line, confidence: this.confidence, metadata: this.metadata };
  }

  static fromJSON(data) {
    const edge = new Edge(data.from, data.to, data.type, data.file, data.line, data.confidence);
    edge.metadata = data.metadata || {};
    return edge;
  }
}

module.exports = { Edge };
