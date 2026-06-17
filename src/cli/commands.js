const { GraphStore } = require('../core/graph/GraphStore');
const { QueryEngine } = require('../core/graph/QueryEngine');
const { StateParser } = require('../state/StateParser');
const { CloudInventory } = require('../state/CloudInventory');
const { ReconciliationEngine } = require('../state/ReconciliationEngine');
const { ActionEngine } = require('../state/ActionEngine');

async function buildCommand(options) {
  console.log(`🔍 Building infrastructure graph from ${options.path}...`);
  const store = new GraphStore(options.path);
  const graph = await store.buildBaseGraph(options.path);
  store.saveSnapshot('base', graph);
  console.log(`✅ Graph built: ${graph.nodes.size} nodes, ${graph.edges.length} edges`);
}

async function queryCommand(resourceId, options) {
  console.log(`🔍 Querying resource: ${resourceId} (depth: ${options.depth})`);
  const store = new GraphStore('.');
  const graph = store.loadSnapshot('base');
  if (!graph) {
    console.error('❌ No graph found. Run `zyventra build` first.');
    return;
  }
  const engine = new QueryEngine(graph);
  const result = engine.getImpactSubgraph(resourceId, parseInt(options.depth));
  console.log(`📊 Subgraph: ${result.nodes.length} nodes, ${result.edges.length} edges`);
  console.log(JSON.stringify(result, null, 2));
}

async function reconcileCommand(options) {
  console.log(`🔍 Reconciling intent, state, and cloud...`);

  // 1. Load Intent (code)
  const store = new GraphStore(options.dir || '.');
  const intent = store.loadSnapshot('base');
  if (!intent) {
    console.error('❌ No intent graph found. Run `zyventra build` first.');
    return;
  }
  console.log(`📦 Intent: ${intent.nodes.size} nodes, ${intent.edges.length} edges`);

  // 2. Load State (Terraform)
  const stateParser = new StateParser();
  const state = await stateParser.loadFromTerraformState(options.state);
  console.log(`📦 State: ${state.length} resources`);

  // 3. Load Cloud (AWS)
  const cloud = new CloudInventory();
  const cloudResources = await cloud.fetchAll();
  console.log(`☁️ Cloud: ${cloudResources.length} resources`);

  // 4. Reconcile
  const engine = new ReconciliationEngine(intent, state, cloudResources);
  const report = engine.reconcile();

  // 5. Generate actions
  const actions = new ActionEngine().generate(report);

  // 6. Output
  console.log('\n📊 RECONCILIATION REPORT:');
  console.table(report);

  console.log('\n⚠️ SUGGESTED ACTIONS (non-executing):');
  console.table(actions);
}

module.exports = { buildCommand, queryCommand, reconcileCommand };
