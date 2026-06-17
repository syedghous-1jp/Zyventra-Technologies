const { execa } = require('execa');

class StateParser {
  async loadFromTerraformState(statePath) {
    const result = await execa('terraform', ['show', '-json', statePath]);
    const state = JSON.parse(result.stdout);
    return this.normalize(state);
  }

  normalize(state) {
    const resources = [];
    const values = state.values?.root_module?.resources || [];
    for (const r of values) {
      resources.push({
        id: `${r.type}.${r.name}`,
        type: r.type,
        name: r.name,
        provider: r.provider,
        attributes: r.values,
        raw: r,
      });
    }
    return resources;
  }
}

module.exports = { StateParser };
