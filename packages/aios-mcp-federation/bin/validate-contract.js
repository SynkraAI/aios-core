#!/usr/bin/env node
'use strict';

const path = require('path');
const { ContractLoader } = require('../src/contract-loader');
const { ContractValidator } = require('../src/contract-validator');

const contractPath = process.argv[2];

if (!contractPath) {
  console.error('Usage: validate-contract <contract-path>');
  console.error('Example: validate-contract contracts/aios-openclaw-contract.yaml');
  process.exit(1);
}

try {
  const resolvedPath = path.resolve(contractPath);
  console.log(`Validating contract: ${resolvedPath}\n`);

  const loader = new ContractLoader(resolvedPath);
  const contract = loader.load();

  const validator = new ContractValidator();
  const result = validator.validateContract(contract);

  if (result.valid) {
    const meta = loader.getMetadata();
    const aiosTools = loader.getAiosTools();
    const openclawTools = loader.getOpenclawTools();

    console.log('Contract is VALID\n');
    console.log(`  Version:    ${meta.version}`);
    console.log(`  Protocol:   ${meta.protocol}`);
    console.log(`  Provider:   ${meta.parties.provider.name}`);
    console.log(`  Consumer:   ${meta.parties.consumer.name}`);
    console.log(`  AIOS tools: ${aiosTools.map(t => t.name).join(', ')}`);
    console.log(`  OClaw tools: ${openclawTools.map(t => t.name).join(', ')}`);
    console.log();
    process.exit(0);
  } else {
    console.error('Contract is INVALID\n');
    for (const err of result.errors) {
      console.error(`  [${err.path}] ${err.message}`);
    }
    console.error(`\n${result.errors.length} error(s) found.`);
    process.exit(1);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
