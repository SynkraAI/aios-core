'use strict';

const Ajv = require('ajv');
const addFormats = require('ajv-formats');

/**
 * Validates contract structure and tool I/O against contract schemas.
 * Uses AJV for JSON Schema validation.
 */
class ContractValidator {
  constructor() {
    this._ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this._ajv);
    this._compiledSchemas = new Map();
  }

  /**
   * Validate the overall contract structure.
   * @param {object} contract - Parsed contract object (the `contract` key contents)
   * @returns {{ valid: boolean, errors: Array }} Validation result
   */
  validateContract(contract) {
    const errors = [];

    if (!contract) {
      return { valid: false, errors: [{ path: 'contract', message: 'Contract is null or undefined' }] };
    }

    // Required top-level fields
    const requiredFields = ['version', 'protocol', 'parties', 'aios_tools', 'openclaw_tools', 'handoff'];
    for (const field of requiredFields) {
      if (!contract[field]) {
        errors.push({ path: `contract.${field}`, message: `Missing required field: ${field}` });
      }
    }

    // Validate version format
    if (contract.version && !/^\d+\.\d+\.\d+$/.test(contract.version)) {
      errors.push({ path: 'contract.version', message: 'Version must be semver format (x.y.z)' });
    }

    // Validate parties
    if (contract.parties) {
      for (const party of ['provider', 'consumer']) {
        if (!contract.parties[party]) {
          errors.push({ path: `contract.parties.${party}`, message: `Missing party: ${party}` });
        } else if (!contract.parties[party].name) {
          errors.push({ path: `contract.parties.${party}.name`, message: `Party ${party} missing name` });
        }
      }
    }

    // Validate tool definitions
    if (Array.isArray(contract.aios_tools)) {
      for (const tool of contract.aios_tools) {
        errors.push(...this._validateToolDefinition(tool, 'aios_tools'));
      }
    }

    if (Array.isArray(contract.openclaw_tools)) {
      for (const tool of contract.openclaw_tools) {
        errors.push(...this._validateToolDefinition(tool, 'openclaw_tools'));
      }
    }

    // Validate handoff protocol
    if (contract.handoff) {
      errors.push(...this._validateHandoff(contract.handoff));
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate a tool's input data against its contract schema.
   * @param {string} toolName - Name of the tool
   * @param {object} input - Input data to validate
   * @param {object} toolDef - Tool definition from contract
   * @returns {{ valid: boolean, errors: Array }}
   */
  validateInput(toolName, input, toolDef) {
    if (!toolDef || !toolDef.input_schema) {
      return { valid: false, errors: [{ path: toolName, message: 'Tool definition or input_schema missing' }] };
    }

    return this._validateAgainstSchema(`${toolName}:input`, input, toolDef.input_schema);
  }

  /**
   * Validate a tool's output data against its contract schema.
   * @param {string} toolName - Name of the tool
   * @param {object} output - Output data to validate
   * @param {object} toolDef - Tool definition from contract
   * @returns {{ valid: boolean, errors: Array }}
   */
  validateOutput(toolName, output, toolDef) {
    if (!toolDef || !toolDef.output_schema) {
      return { valid: false, errors: [{ path: toolName, message: 'Tool definition or output_schema missing' }] };
    }

    return this._validateAgainstSchema(`${toolName}:output`, output, toolDef.output_schema);
  }

  /**
   * Validate a handoff message against the handoff protocol schema.
   * @param {object} message - Handoff message to validate
   * @param {object} handoffConfig - Handoff configuration from contract
   * @returns {{ valid: boolean, errors: Array }}
   */
  validateHandoffMessage(message, handoffConfig) {
    if (!handoffConfig || !handoffConfig.schema) {
      return { valid: false, errors: [{ path: 'handoff', message: 'Handoff config or schema missing' }] };
    }

    return this._validateAgainstSchema('handoff:message', message, handoffConfig.schema);
  }

  /**
   * Validate data against a JSON Schema using AJV.
   * @private
   */
  _validateAgainstSchema(key, data, schema) {
    let validate = this._compiledSchemas.get(key);
    if (!validate) {
      try {
        validate = this._ajv.compile(schema);
        this._compiledSchemas.set(key, validate);
      } catch (err) {
        return {
          valid: false,
          errors: [{ path: key, message: `Schema compilation error: ${err.message}` }]
        };
      }
    }

    const valid = validate(data);
    if (valid) return { valid: true, errors: [] };

    const errors = (validate.errors || []).map(e => ({
      path: `${key}${e.instancePath}`,
      message: e.message,
      params: e.params
    }));

    return { valid: false, errors };
  }

  /**
   * Validate a single tool definition structure.
   * @private
   */
  _validateToolDefinition(tool, section) {
    const errors = [];
    const prefix = `contract.${section}`;

    if (!tool.name) {
      errors.push({ path: prefix, message: 'Tool missing required field: name' });
      return errors;
    }

    const toolPath = `${prefix}.${tool.name}`;

    if (!tool.description) {
      errors.push({ path: toolPath, message: 'Tool missing required field: description' });
    }

    if (!tool.input_schema) {
      errors.push({ path: `${toolPath}.input_schema`, message: 'Tool missing required field: input_schema' });
    } else if (tool.input_schema.type !== 'object') {
      errors.push({ path: `${toolPath}.input_schema`, message: 'input_schema must have type: object' });
    }

    if (!tool.output_schema) {
      errors.push({ path: `${toolPath}.output_schema`, message: 'Tool missing required field: output_schema' });
    } else if (tool.output_schema.type !== 'object') {
      errors.push({ path: `${toolPath}.output_schema`, message: 'output_schema must have type: object' });
    }

    if (tool.errors && !Array.isArray(tool.errors)) {
      errors.push({ path: `${toolPath}.errors`, message: 'errors must be an array' });
    } else if (Array.isArray(tool.errors)) {
      for (const err of tool.errors) {
        if (!err.code) {
          errors.push({ path: `${toolPath}.errors`, message: 'Error definition missing: code' });
        }
        if (!err.description) {
          errors.push({ path: `${toolPath}.errors`, message: `Error ${err.code || '?'} missing: description` });
        }
      }
    }

    return errors;
  }

  /**
   * Validate handoff protocol structure.
   * @private
   */
  _validateHandoff(handoff) {
    const errors = [];

    if (!handoff.format) {
      errors.push({ path: 'contract.handoff.format', message: 'Missing required field: format' });
    }

    if (!handoff.required_fields || !Array.isArray(handoff.required_fields)) {
      errors.push({ path: 'contract.handoff.required_fields', message: 'Missing or invalid: required_fields' });
    }

    if (!handoff.schema) {
      errors.push({ path: 'contract.handoff.schema', message: 'Missing required field: schema' });
    }

    if (handoff.max_payload_tokens && typeof handoff.max_payload_tokens !== 'number') {
      errors.push({ path: 'contract.handoff.max_payload_tokens', message: 'max_payload_tokens must be a number' });
    }

    return errors;
  }
}

module.exports = { ContractValidator };
