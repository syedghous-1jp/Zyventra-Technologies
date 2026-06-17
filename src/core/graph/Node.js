class Node {
  constructor(id, type, file, properties = {}) {
    this.id = id;
    this.type = type;
    this.file = file;
    this.properties = properties;
    this.metadata = { parsed: true, lines: [] };
  }

  toJSON() {
    return { id: this.id, type: this.type, file: this.file, properties: this.properties, metadata: this.metadata };
  }

  static fromJSON(data) {
    const node = new Node(data.id, data.type, data.file, data.properties);
    node.metadata = data.metadata || {};
    return node;
  }
}

module.exports = { Node };
