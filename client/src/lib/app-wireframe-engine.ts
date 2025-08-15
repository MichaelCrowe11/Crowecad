/**
 * App Wireframe Engine - Visual Pre-Design for Full Stack Applications
 * Create interactive wireframes that seamlessly flow to GPT-5 development
 */

export interface WireframeComponent {
  id: string;
  type: 'screen' | 'component' | 'modal' | 'form' | 'list' | 'chart' | 'navigation';
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: {
    layout?: 'flex' | 'grid' | 'absolute';
    columns?: number;
    rows?: number;
    padding?: number;
    margin?: number;
    backgroundColor?: string;
    borderRadius?: number;
    shadow?: boolean;
  };
  children?: WireframeComponent[];
  interactions?: WireframeInteraction[];
  dataBinding?: DataBinding;
  annotations?: string[];
}

export interface WireframeInteraction {
  id: string;
  trigger: 'click' | 'hover' | 'swipe' | 'drag' | 'submit' | 'load';
  action: 'navigate' | 'openModal' | 'updateState' | 'apiCall' | 'animation';
  target?: string;
  parameters?: any;
}

export interface DataBinding {
  source: 'api' | 'database' | 'state' | 'props';
  endpoint?: string;
  model?: string;
  fields?: string[];
  realtime?: boolean;
}

export interface WireframeProject {
  id: string;
  name: string;
  description: string;
  type: 'web' | 'mobile' | 'desktop';
  screens: WireframeScreen[];
  components: ComponentLibrary;
  navigation: NavigationFlow;
  dataModels: DataModel[];
  apiEndpoints: APIEndpoint[];
  userFlows: UserFlow[];
  designSystem: DesignSystem;
  metadata: {
    created: Date;
    modified: Date;
    version: string;
    author: string;
    targetUsers: number;
    complexity: 'simple' | 'moderate' | 'complex';
  };
}

export interface WireframeScreen {
  id: string;
  name: string;
  route: string;
  components: WireframeComponent[];
  layout: 'responsive' | 'fixed' | 'fluid';
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  authentication?: 'public' | 'private' | 'role-based';
  roles?: string[];
}

export interface ComponentLibrary {
  custom: WireframeComponent[];
  templates: {
    headers: WireframeComponent[];
    footers: WireframeComponent[];
    forms: WireframeComponent[];
    cards: WireframeComponent[];
    modals: WireframeComponent[];
    dashboards: WireframeComponent[];
  };
}

export interface NavigationFlow {
  type: 'linear' | 'hierarchical' | 'network' | 'dashboard';
  routes: Route[];
  transitions: Transition[];
}

export interface Route {
  id: string;
  path: string;
  screen: string;
  params?: string[];
  guards?: string[];
}

export interface Transition {
  from: string;
  to: string;
  trigger: string;
  animation?: string;
}

export interface DataModel {
  id: string;
  name: string;
  fields: Field[];
  relationships: Relationship[];
  validations: Validation[];
}

export interface Field {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  unique?: boolean;
  default?: any;
}

export interface Relationship {
  type: 'hasOne' | 'hasMany' | 'belongsTo' | 'manyToMany';
  model: string;
  foreignKey?: string;
  through?: string;
}

export interface Validation {
  field: string;
  rule: string;
  message: string;
}

export interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  authentication: boolean;
  requestBody?: any;
  responseSchema?: any;
  errorHandling?: string[];
}

export interface UserFlow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  entryPoint: string;
  exitPoints: string[];
  metrics?: string[];
}

export interface FlowStep {
  id: string;
  screen: string;
  action: string;
  nextStep?: string;
  conditions?: string[];
}

export interface DesignSystem {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    error: string;
    warning: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    headingSizes: number[];
    bodySizes: number[];
    lineHeight: number;
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  components: {
    borderRadius: number;
    shadowLevels: string[];
    animations: string[];
  };
}

// Integration with ecosystem
export interface EcosystemIntegration {
  crowePipeline: {
    pipelineId?: string;
    triggers: string[];
    dataFlow: any[];
    aiModels: string[];
  };
  croweHub: {
    automationId?: string;
    deploymentTarget: string;
    versionControl: {
      repository: string;
      branch: string;
      autoMerge: boolean;
    };
    monitoring: string[];
    scaling: any;
  };
}

export class AppWireframeEngine {
  private project: WireframeProject | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private selectedComponent: WireframeComponent | null = null;
  private draggedComponent: WireframeComponent | null = null;
  private zoom: number = 1;
  private pan: { x: number; y: number } = { x: 0, y: 0 };

  /**
   * Initialize wireframe engine
   */
  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.setupEventListeners();
    this.render();
  }

  /**
   * Create new wireframe project
   */
  createProject(config: {
    name: string;
    type: 'web' | 'mobile' | 'desktop';
    description: string;
  }): WireframeProject {
    this.project = {
      id: this.generateId(),
      name: config.name,
      description: config.description,
      type: config.type,
      screens: [],
      components: this.getDefaultComponentLibrary(),
      navigation: {
        type: 'hierarchical',
        routes: [],
        transitions: []
      },
      dataModels: [],
      apiEndpoints: [],
      userFlows: [],
      designSystem: this.getDefaultDesignSystem(),
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: '1.0.0',
        author: 'User',
        targetUsers: 1000,
        complexity: 'moderate'
      }
    };

    // Add default home screen
    this.addScreen({
      name: 'Home',
      route: '/',
      authentication: 'public'
    });

    return this.project;
  }

  /**
   * Add screen to project
   */
  addScreen(config: {
    name: string;
    route: string;
    authentication?: 'public' | 'private' | 'role-based';
  }): WireframeScreen {
    if (!this.project) throw new Error('No project loaded');

    const screen: WireframeScreen = {
      id: this.generateId(),
      name: config.name,
      route: config.route,
      components: [],
      layout: 'responsive',
      authentication: config.authentication || 'public',
      breakpoints: {
        mobile: 640,
        tablet: 768,
        desktop: 1024
      }
    };

    this.project.screens.push(screen);
    return screen;
  }

  /**
   * Add component to screen
   */
  addComponent(screenId: string, component: Partial<WireframeComponent>): WireframeComponent {
    if (!this.project) throw new Error('No project loaded');

    const screen = this.project.screens.find(s => s.id === screenId);
    if (!screen) throw new Error('Screen not found');

    const newComponent: WireframeComponent = {
      id: this.generateId(),
      type: component.type || 'component',
      name: component.name || 'Component',
      position: component.position || { x: 100, y: 100 },
      size: component.size || { width: 200, height: 100 },
      properties: component.properties || {},
      children: component.children || [],
      interactions: component.interactions || [],
      dataBinding: component.dataBinding,
      annotations: component.annotations || []
    };

    screen.components.push(newComponent);
    this.render();
    return newComponent;
  }

  /**
   * Add interaction to component
   */
  addInteraction(componentId: string, interaction: Partial<WireframeInteraction>): void {
    const component = this.findComponent(componentId);
    if (!component) throw new Error('Component not found');

    const newInteraction: WireframeInteraction = {
      id: this.generateId(),
      trigger: interaction.trigger || 'click',
      action: interaction.action || 'navigate',
      target: interaction.target,
      parameters: interaction.parameters
    };

    if (!component.interactions) component.interactions = [];
    component.interactions.push(newInteraction);
  }

  /**
   * Add data model
   */
  addDataModel(model: Partial<DataModel>): DataModel {
    if (!this.project) throw new Error('No project loaded');

    const newModel: DataModel = {
      id: this.generateId(),
      name: model.name || 'Model',
      fields: model.fields || [],
      relationships: model.relationships || [],
      validations: model.validations || []
    };

    this.project.dataModels.push(newModel);
    return newModel;
  }

  /**
   * Add API endpoint
   */
  addAPIEndpoint(endpoint: Partial<APIEndpoint>): APIEndpoint {
    if (!this.project) throw new Error('No project loaded');

    const newEndpoint: APIEndpoint = {
      id: this.generateId(),
      method: endpoint.method || 'GET',
      path: endpoint.path || '/api/resource',
      description: endpoint.description || '',
      authentication: endpoint.authentication !== undefined ? endpoint.authentication : true,
      requestBody: endpoint.requestBody,
      responseSchema: endpoint.responseSchema,
      errorHandling: endpoint.errorHandling || []
    };

    this.project.apiEndpoints.push(newEndpoint);
    return newEndpoint;
  }

  /**
   * Add user flow
   */
  addUserFlow(flow: Partial<UserFlow>): UserFlow {
    if (!this.project) throw new Error('No project loaded');

    const newFlow: UserFlow = {
      id: this.generateId(),
      name: flow.name || 'User Flow',
      description: flow.description || '',
      steps: flow.steps || [],
      entryPoint: flow.entryPoint || '',
      exitPoints: flow.exitPoints || [],
      metrics: flow.metrics || []
    };

    this.project.userFlows.push(newFlow);
    return newFlow;
  }

  /**
   * Export to GPT-5 for development
   */
  exportToGPT5(): any {
    if (!this.project) throw new Error('No project loaded');

    return {
      wireframe: this.project,
      appRequirements: {
        name: this.project.name,
        description: this.project.description,
        type: this.project.type === 'web' ? 'fullstack' : this.project.type,
        features: this.extractFeatures(),
        users: this.project.metadata.targetUsers,
        screens: this.project.screens.map(s => ({
          name: s.name,
          route: s.route,
          components: s.components.map(c => c.type),
          authentication: s.authentication
        })),
        dataModels: this.project.dataModels,
        apiEndpoints: this.project.apiEndpoints,
        userFlows: this.project.userFlows,
        designSystem: this.project.designSystem
      },
      readyForDevelopment: true
    };
  }

  /**
   * Export to CrowePipeline
   */
  exportToPipeline(): any {
    if (!this.project) throw new Error('No project loaded');

    return {
      projectId: this.project.id,
      name: this.project.name,
      dataFlow: this.generateDataFlow(),
      aiModels: this.identifyAIModels(),
      triggers: this.identifyTriggers(),
      integrations: this.identifyIntegrations()
    };
  }

  /**
   * Export to CroweHub for deployment
   */
  exportToHub(): any {
    if (!this.project) throw new Error('No project loaded');

    return {
      projectId: this.project.id,
      name: this.project.name,
      deploymentConfig: {
        type: this.determineDeploymentType(),
        scaling: this.determineScaling(),
        monitoring: ['performance', 'errors', 'usage'],
        versionControl: {
          repository: `crowecad/${this.project.name.toLowerCase().replace(/\s+/g, '-')}`,
          branch: 'main',
          autoMerge: true
        }
      }
    };
  }

  /**
   * Import from existing app
   */
  async importFromExisting(url: string): Promise<WireframeProject> {
    // Analyze existing app and create wireframe
    // This would use computer vision and DOM analysis
    return this.createProject({
      name: 'Imported App',
      type: 'web',
      description: `Imported from ${url}`
    });
  }

  /**
   * Generate code preview
   */
  generateCodePreview(componentId: string): string {
    const component = this.findComponent(componentId);
    if (!component) return '';

    return `
// ${component.name} Component
export function ${this.toPascalCase(component.name)}() {
  return (
    <div className="${this.generateClassName(component)}">
      ${component.children?.map(c => `<${this.toPascalCase(c.name)} />`).join('\n      ') || ''}
    </div>
  );
}`;
  }

  // Rendering methods
  private render(): void {
    if (!this.canvas || !this.project) return;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(this.pan.x, this.pan.y);
    ctx.scale(this.zoom, this.zoom);

    // Render current screen
    const currentScreen = this.project.screens[0];
    if (currentScreen) {
      this.renderScreen(ctx, currentScreen);
    }

    ctx.restore();
  }

  private renderScreen(ctx: CanvasRenderingContext2D, screen: WireframeScreen): void {
    // Draw screen background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, 1024, 768);

    // Draw components
    screen.components.forEach(component => {
      this.renderComponent(ctx, component);
    });
  }

  private renderComponent(ctx: CanvasRenderingContext2D, component: WireframeComponent): void {
    const { position, size, properties } = component;

    // Draw component outline
    ctx.strokeStyle = this.selectedComponent?.id === component.id ? '#3b82f6' : '#e5e7eb';
    ctx.lineWidth = this.selectedComponent?.id === component.id ? 2 : 1;
    ctx.strokeRect(position.x, position.y, size.width, size.height);

    // Draw component background
    if (properties.backgroundColor) {
      ctx.fillStyle = properties.backgroundColor;
      ctx.fillRect(position.x, position.y, size.width, size.height);
    }

    // Draw component label
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText(component.name, position.x + 5, position.y + 15);

    // Draw children recursively
    if (component.children) {
      component.children.forEach(child => {
        this.renderComponent(ctx, child);
      });
    }
  }

  // Event handling
  private setupEventListeners(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
  }

  private handleMouseDown(e: MouseEvent): void {
    const point = this.getMousePosition(e);
    const component = this.getComponentAtPoint(point);
    
    if (component) {
      this.selectedComponent = component;
      this.draggedComponent = component;
      this.render();
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.draggedComponent) {
      const point = this.getMousePosition(e);
      this.draggedComponent.position = {
        x: point.x - this.draggedComponent.size.width / 2,
        y: point.y - this.draggedComponent.size.height / 2
      };
      this.render();
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    this.draggedComponent = null;
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.zoom = Math.max(0.1, Math.min(5, this.zoom * delta));
    this.render();
  }

  // Helper methods
  private getMousePosition(e: MouseEvent): { x: number; y: number } {
    if (!this.canvas) return { x: 0, y: 0 };
    
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - this.pan.x) / this.zoom,
      y: (e.clientY - rect.top - this.pan.y) / this.zoom
    };
  }

  private getComponentAtPoint(point: { x: number; y: number }): WireframeComponent | null {
    if (!this.project) return null;
    
    const currentScreen = this.project.screens[0];
    if (!currentScreen) return null;

    return currentScreen.components.find(c => 
      point.x >= c.position.x &&
      point.x <= c.position.x + c.size.width &&
      point.y >= c.position.y &&
      point.y <= c.position.y + c.size.height
    ) || null;
  }

  private findComponent(id: string): WireframeComponent | null {
    if (!this.project) return null;
    
    for (const screen of this.project.screens) {
      const component = this.findComponentRecursive(screen.components, id);
      if (component) return component;
    }
    return null;
  }

  private findComponentRecursive(components: WireframeComponent[], id: string): WireframeComponent | null {
    for (const component of components) {
      if (component.id === id) return component;
      if (component.children) {
        const found = this.findComponentRecursive(component.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractFeatures(): string[] {
    if (!this.project) return [];
    
    const features = new Set<string>();
    
    // Extract from screens
    this.project.screens.forEach(screen => {
      if (screen.authentication === 'private') features.add('authentication');
      screen.components.forEach(c => {
        if (c.type === 'form') features.add('forms');
        if (c.type === 'chart') features.add('analytics');
        if (c.type === 'list') features.add('data management');
      });
    });
    
    // Extract from data models
    if (this.project.dataModels.length > 0) features.add('database');
    
    // Extract from API endpoints
    if (this.project.apiEndpoints.length > 0) features.add('api');
    
    // Extract from user flows
    this.project.userFlows.forEach(flow => {
      features.add(flow.name.toLowerCase());
    });
    
    return Array.from(features);
  }

  private generateDataFlow(): any[] {
    if (!this.project) return [];
    
    return this.project.apiEndpoints.map(endpoint => ({
      from: 'frontend',
      to: 'backend',
      via: endpoint.path,
      data: endpoint.requestBody,
      response: endpoint.responseSchema
    }));
  }

  private identifyAIModels(): string[] {
    if (!this.project) return [];
    
    const models = [];
    
    // Check for AI-requiring features
    if (this.project.screens.some(s => s.components.some(c => c.type === 'chart'))) {
      models.push('analytics-model');
    }
    
    if (this.project.apiEndpoints.some(e => e.path.includes('recommend'))) {
      models.push('recommendation-model');
    }
    
    if (this.project.apiEndpoints.some(e => e.path.includes('search'))) {
      models.push('search-model');
    }
    
    return models;
  }

  private identifyTriggers(): string[] {
    if (!this.project) return [];
    
    const triggers = new Set<string>();
    
    this.project.screens.forEach(screen => {
      screen.components.forEach(component => {
        component.interactions?.forEach(interaction => {
          triggers.add(interaction.trigger);
        });
      });
    });
    
    return Array.from(triggers);
  }

  private identifyIntegrations(): string[] {
    if (!this.project) return [];
    
    const integrations = [];
    
    // Check for common integrations
    if (this.project.apiEndpoints.some(e => e.path.includes('payment'))) {
      integrations.push('stripe');
    }
    
    if (this.project.apiEndpoints.some(e => e.path.includes('email'))) {
      integrations.push('sendgrid');
    }
    
    if (this.project.apiEndpoints.some(e => e.path.includes('storage'))) {
      integrations.push('s3');
    }
    
    return integrations;
  }

  private determineDeploymentType(): string {
    if (!this.project) return 'docker';
    
    if (this.project.metadata.targetUsers > 100000) return 'kubernetes';
    if (this.project.type === 'web') return 'vercel';
    return 'docker';
  }

  private determineScaling(): any {
    if (!this.project) return { min: 1, max: 3 };
    
    const users = this.project.metadata.targetUsers;
    
    if (users > 1000000) return { min: 10, max: 100, auto: true };
    if (users > 100000) return { min: 5, max: 50, auto: true };
    if (users > 10000) return { min: 2, max: 10, auto: true };
    return { min: 1, max: 3, auto: false };
  }

  private getDefaultComponentLibrary(): ComponentLibrary {
    return {
      custom: [],
      templates: {
        headers: [],
        footers: [],
        forms: [],
        cards: [],
        modals: [],
        dashboards: []
      }
    };
  }

  private getDefaultDesignSystem(): DesignSystem {
    return {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        background: '#ffffff',
        text: '#111827',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981'
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        headingSizes: [48, 36, 24, 20, 18],
        bodySizes: [16, 14, 12],
        lineHeight: 1.5
      },
      spacing: {
        unit: 4,
        scale: [0, 4, 8, 12, 16, 24, 32, 48, 64]
      },
      components: {
        borderRadius: 8,
        shadowLevels: ['none', 'sm', 'md', 'lg', 'xl'],
        animations: ['fade', 'slide', 'scale', 'rotate']
      }
    };
  }

  private generateClassName(component: WireframeComponent): string {
    const classes = [];
    
    if (component.properties.layout === 'flex') classes.push('flex');
    if (component.properties.layout === 'grid') classes.push('grid');
    if (component.properties.padding) classes.push(`p-${component.properties.padding}`);
    if (component.properties.margin) classes.push(`m-${component.properties.margin}`);
    if (component.properties.shadow) classes.push('shadow-lg');
    
    return classes.join(' ');
  }

  private toPascalCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      word.toUpperCase()
    ).replace(/\s+/g, '');
  }
}

// Export singleton instance
export const appWireframeEngine = new AppWireframeEngine();