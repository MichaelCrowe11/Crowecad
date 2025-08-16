export type NodeType = 'llm' | 'tool' | 'eval' | 'data' | 'router';

export interface PipelineNode {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, unknown>;
}

export interface PipelineEdge {
  from: string;
  to: string;
  condition?: string;
}

export interface PipelineSpec {
  id: string;
  name: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
}

export class PipelineOrchestrator {
  constructor(private spec: PipelineSpec) {}

  validate(): { ok: boolean; errors: string[] } {
    const errors: string[] = [];
    const ids = new Set(this.spec.nodes.map(n => n.id))
    for (const e of this.spec.edges) {
      if (!ids.has(e.from)) errors.push(`Missing node: ${e.from}`)
      if (!ids.has(e.to)) errors.push(`Missing node: ${e.to}`)
    }
    return { ok: errors.length === 0, errors };
  }

  toJson(): string {
    return JSON.stringify(this.spec, null, 2)
  }
}
