// AIOS-FullStack Workspace - ES Module Entry Point
import * as core from '@aios-fullstack/core';
import * as memory from '@aios-fullstack/memory';
import * as security from '@aios-fullstack/security';
import * as performance from '@aios-fullstack/performance';
import * as telemetry from '@aios-fullstack/telemetry';

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