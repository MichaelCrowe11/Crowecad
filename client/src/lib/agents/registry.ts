export type AgentId = 'app-architect' | 'cad-assistant' | 'crowe-ai-agent' | 'cursor-cad' | 'pipeline-builder';

export interface AgentInfo {
  id: AgentId;
  name: string;
  description: string;
  entry: string; // route or deep-link anchor
}

export const agents: AgentInfo[] = [
  {
    id: 'app-architect',
    name: 'GPT-5 App Architect',
    description: 'Generates production-ready full‑stack applications and infra.',
    entry: '/ai-studio',
  },
  {
    id: 'cad-assistant',
    name: 'CroweCad Assistant',
    description: 'Natural‑language CAD operations with skill mining.',
    entry: '/workspace',
  },
  {
    id: 'cursor-cad',
    name: 'Cursor CAD Assistant',
    description: 'Real‑time CAD script assistance with Cursor-like UX.',
    entry: '/workspace',
  },
  {
    id: 'crowe-ai-agent',
    name: 'Crowe Logic Agent',
    description: 'Voice, vision, traits; assists across the platform.',
    entry: '/ai-studio#agents',
  },
  {
    id: 'pipeline-builder',
    name: 'AI Pipeline Builder',
    description: 'Compose agents, tools, evals, and deployments.',
    entry: '/ai-studio#pipeline',
  },
];
