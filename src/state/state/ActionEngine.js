class ActionEngine {
  generate(report) {
    const actions = [];
    for (const r of report) {
      switch (r.type) {
        case 'INTENT_ONLY':
          actions.push({
            id: r.id,
            action: 'APPLY',
            command: `terraform apply -target=${r.id}`,
            risk: 'low',
            reason: 'Defined in code but not applied',
          });
          break;
        case 'STATE_ONLY':
          actions.push({
            id: r.id,
            action: 'STATE_CLEANUP',
            command: `terraform state rm ${r.id}`,
            risk: 'high',
            reason: 'Exists in state but not in code',
          });
          break;
        case 'CLOUD_ONLY':
          actions.push({
            id: r.id,
            action: 'IMPORT',
            command: `terraform import ${r.id} <cloud-id>`,
            risk: 'high',
            reason: 'Exists in cloud but not tracked',
          });
          break;
        case 'ATTRIBUTE_DRIFT':
          actions.push({
            id: r.id,
            action: 'RECONCILE',
            command: 'terraform apply',
            risk: 'medium',
            reason: 'Mismatch between state and cloud',
          });
          break;
        default:
          break;
      }
    }
    return actions;
  }
}

module.exports = { ActionEngine };
