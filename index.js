#!/usr/bin/env node

const { program } = require('commander');
const { version } = require('./package.json');

const { buildCommand, queryCommand, reconcileCommand } = require('./src/cli/commands');

program
  .name('zyventra')
  .description('Infrastructure intelligence platform — reconcile intent, state, and cloud reality')
  .version(version);

program
  .command('build')
  .description('Build infrastructure graph from IaC files')
  .option('-p, --path <path>', 'Path to infrastructure code', '.')
  .action((options) => buildCommand(options));

program
  .command('query')
  .description('Query the infrastructure graph')
  .argument('<resource-id>', 'Resource ID to query')
  .option('-d, --depth <number>', 'Dependency depth', '1')
  .action((resourceId, options) => queryCommand(resourceId, options));

program
  .command('reconcile')
  .description('Reconcile code, state, and cloud reality (3-way diff)')
  .option('-s, --state <path>', 'Path to Terraform state file (terraform.tfstate)')
  .option('-c, --cloud <provider>', 'Cloud provider (aws, gcp, azure)', 'aws')
  .option('-d, --dir <path>', 'Path to infrastructure code', '.')
  .action((options) => reconcileCommand(options));

program.parse();
