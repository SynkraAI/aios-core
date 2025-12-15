// Synkra AIOS - ES Module Entry Point
import * as core from '@synkra/aios-core/core';
import * as memory from '@synkra/aios-core/memory';
import * as security from '@synkra/aios-core/security';
import * as performance from '@synkra/aios-core/performance';
import * as telemetry from '@synkra/aios-core/telemetry';

// Re-export the AIOS class from CommonJS version
import workspace from './index.js';
const { AIOS } = workspace;

export {
    AIOS,
    core,
    memory,
    security,
    performance,
    telemetry
};

export default AIOS;