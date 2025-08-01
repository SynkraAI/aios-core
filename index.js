// AIOS-FullStack Workspace - Complete Framework Entry Point
const core = require('@aios-fullstack/core');
const memory = require('@aios-fullstack/memory');
const security = require('@aios-fullstack/security');
const performance = require('@aios-fullstack/performance');
const telemetry = require('@aios-fullstack/telemetry');

// Main AIOS class that orchestrates all components
class AIOS {
    constructor(config = {}) {
        this.config = config;
        this.core = null;
        this.memory = null;
        this.security = null;
        this.performance = null;
        this.telemetry = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return this;

        try {
            // Initialize security first
            this.security = new security.Sanitizer(this.config.security);
            
            // Initialize memory layer
            this.memory = new memory.MemoryAdapter(this.config.memory);
            await this.memory.initialize();
            
            // Initialize performance monitoring
            this.performance = new performance.PerformanceMonitor(this.config.performance);
            
            // Initialize telemetry (with consent)
            if (this.config.telemetry?.enabled !== false) {
                this.telemetry = new telemetry.ConsentManager(this.config.telemetry);
            }
            
            // Initialize core meta-agent
            this.core = new core.MetaAgent({
                ...this.config.core,
                memory: this.memory,
                security: this.security,
                performance: this.performance,
                telemetry: this.telemetry
            });
            
            this.initialized = true;
            return this;
        } catch (error) {
            throw new Error(`AIOS initialization failed: ${error.message}`);
        }
    }

    // Convenience methods
    async createAgent(config) {
        if (!this.initialized) await this.initialize();
        return this.core.createAgent(config);
    }

    async createTask(taskConfig) {
        if (!this.initialized) await this.initialize();
        return this.core.createTask(taskConfig);
    }

    async search(query, options = {}) {
        if (!this.initialized) await this.initialize();
        return this.memory.search(query, options);
    }

    // Health check
    async healthCheck() {
        return {
            initialized: this.initialized,
            components: {
                core: !!this.core,
                memory: !!this.memory,
                security: !!this.security,
                performance: !!this.performance,
                telemetry: !!this.telemetry
            },
            version: require('./package.json').version
        };
    }
}

module.exports = {
    AIOS,
    core,
    memory,
    security,
    performance,
    telemetry
};