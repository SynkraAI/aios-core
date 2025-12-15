// Synkra AIOS - TypeScript Definitions
declare module '@synkra/aios-core/workspace' {
    export class AIOS {
        constructor(config?: any);
        initialize(): Promise<AIOS>;
        createAgent(config: any): Promise<any>;
        createTask(taskConfig: any): Promise<any>;
        search(query: string, options?: any): Promise<any[]>;
        healthCheck(): Promise<any>;
    }

    export * as core from '@synkra/aios-core/core';
    export * as memory from '@synkra/aios-core/memory';
    export * as security from '@synkra/aios-core/security';
    export * as performance from '@synkra/aios-core/performance';
    export * as telemetry from '@synkra/aios-core/telemetry';

    export default AIOS;
}