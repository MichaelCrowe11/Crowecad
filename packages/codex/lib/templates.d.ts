export declare class TemplateManager {
    private templates;
    private templateDir;
    constructor(templateDir?: string);
    private loadBuiltInTemplates;
    getTemplate(name: string): Promise<string | undefined>;
    getDefaultTemplate(type: string): Promise<string | undefined>;
    saveTemplate(name: string, content: string): Promise<void>;
    listTemplates(): Promise<string[]>;
    renderTemplate(template: string, variables: Record<string, any>): string;
}
//# sourceMappingURL=templates.d.ts.map