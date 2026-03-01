'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Loads and parses an AIOS MCP Federation contract YAML file.
 * Returns a structured contract object with resolved schemas.
 */
class ContractLoader {
  constructor(contractPath) {
    this._contractPath = path.resolve(contractPath);
    this._contract = null;
  }

  /**
   * Load and parse the contract YAML.
   * @returns {object} Parsed contract object
   * @throws {Error} If file not found or YAML is invalid
   */
  load() {
    if (this._contract) return this._contract;

    if (!fs.existsSync(this._contractPath)) {
      throw new Error(`Contract file not found: ${this._contractPath}`);
    }

    const raw = fs.readFileSync(this._contractPath, 'utf8');
    const parsed = yaml.load(raw);

    if (!parsed || !parsed.contract) {
      throw new Error('Invalid contract: missing root "contract" key');
    }

    this._contract = parsed.contract;
    return this._contract;
  }

  /**
   * Get the full contract object.
   */
  get contract() {
    if (!this._contract) this.load();
    return this._contract;
  }

  /**
   * Get AIOS-exposed tool definitions.
   * @returns {Array} Array of tool definitions
   */
  getAiosTools() {
    return this.contract.aios_tools || [];
  }

  /**
   * Get OpenClaw-exposed tool definitions.
   * @returns {Array} Array of tool definitions
   */
  getOpenclawTools() {
    return this.contract.openclaw_tools || [];
  }

  /**
   * Get all tool definitions (both directions).
   * @returns {Array} Combined array of all tool definitions
   */
  getAllTools() {
    return [...this.getAiosTools(), ...this.getOpenclawTools()];
  }

  /**
   * Get a specific tool definition by name.
   * @param {string} toolName - The tool name to find
   * @returns {object|null} Tool definition or null if not found
   */
  getTool(toolName) {
    return this.getAllTools().find(t => t.name === toolName) || null;
  }

  /**
   * Get the handoff protocol configuration.
   * @returns {object} Handoff protocol config
   */
  getHandoffProtocol() {
    return this.contract.handoff || {};
  }

  /**
   * Get contract metadata.
   * @returns {object} Contract metadata (version, protocol, parties)
   */
  getMetadata() {
    const { version, protocol, created, description, parties } = this.contract;
    return { version, protocol, created, description, parties };
  }

  /**
   * Get error definitions for a specific tool.
   * @param {string} toolName - The tool name
   * @returns {Array} Array of error definitions
   */
  getToolErrors(toolName) {
    const tool = this.getTool(toolName);
    return tool ? (tool.errors || []) : [];
  }
}

module.exports = { ContractLoader };
