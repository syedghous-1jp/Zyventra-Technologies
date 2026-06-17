class ReconciliationEngine {
  constructor(intent, state, cloud) {
    this.intent = new Map(intent.nodes ? Array.from(intent.nodes.values()).map(r => [r.id, r]) : intent.map(r => [r.id, r]));
    this.state = new Map(state.map(r => [r.id, r]));
    this.cloud = new Map(cloud.map(r => [r.id, r]));
  }

  reconcile() {
    const allKeys = new Set([...this.intent.keys(), ...this.state.keys(), ...this.cloud.keys()]);
    const results = [];
    for (const key of allKeys) {
      const i = this.intent.get(key);
      const s = this.state.get(key);
      const c = this.cloud.get(key);
      results.push({
        id: key,
        type: this.classify(i, s, c),
        intent: !!i,
        state: !!s,
        cloud: !!c,
        details: { i, s, c },
      });
    }
    return results;
  }

  classify(i, s, c) {
    if (i && !s && !c) return 'INTENT_ONLY';
    if (!i && s && !c) return 'STATE_ONLY';
    if (!i && !s && c) return 'CLOUD_ONLY';
    if (i && s && c) {
      if (JSON.stringify(i.properties) !== JSON.stringify(c.attributes)) return 'ATTRIBUTE_DRIFT';
      return 'MATCH';
    }
    return 'UNKNOWN';
  }
}

module.exports = { ReconciliationEngine };
