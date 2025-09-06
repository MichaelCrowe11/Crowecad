export declare class CodeGenerator {
    private engine;
    constructor(engine: any);
    generate(options: any): Promise<{
        code: string;
        metadata?: any;
    }>;
    generateFunction(name: string, params: string[], returnType: string, body: string): string;
    generateClass(name: string, properties: any[], methods: any[]): string;
    generateInterface(name: string, properties: any[]): string;
    generateReactComponent(name: string, props: any[], hooks?: string[]): string;
    generateAPI(endpoint: string, method: string, params: any[]): string;
    generateTest(functionName: string, testCases: any[], framework?: string): string;
}
//# sourceMappingURL=generator.d.ts.map