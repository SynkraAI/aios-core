// AIOS-FullStack Workspace - TypeScript Definitions
declare module '@aios-fullstack/workspace' {
    export class AIOS {
        constructor(config?: any);
        initialize(): Promise<AIOS>;
        createAgent(config: any): Promise<any>;
        createTask(taskConfig: any): Promise<any>;
        search(query: string, options?: any): Promise<any[]>;
        healthCheck(): Promise<any>;
    }
    
    export * as core from '@aios-fullstack/core';
    export * as memory from '@aios-fullstack/memory';
    export * as security from '@aios-fullstack/security';
    export * as performance from '@aios-fullstack/performance';
    export * as telemetry from '@aios-fullstack/telemetry';
    
    export default AIOS;
}