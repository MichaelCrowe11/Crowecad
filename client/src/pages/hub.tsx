import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sparkles, Boxes, Hammer, Workflow, Brain } from 'lucide-react';

export function CroweHubPage() {
  const cards = [
    {
      title: 'GPT-5 App Architect',
      description: 'Full‑stack application generator with architecture, code, infra, and docs.',
      icon: Sparkles,
      href: '/ai-studio',
      cta: 'Open Studio',
    },
    {
      title: 'CAD Assistants',
      description: 'Natural‑language CAD: design, code generation, DXF/SCAD workflows.',
      icon: Hammer,
      href: '/workspace',
      cta: 'Open Workspace',
    },
    {
      title: 'AI Pipeline Builder',
      description: 'Visual pipelines for agents, tools, evals, and deployments.',
      icon: Workflow,
      href: '/ai-studio#pipeline',
      cta: 'Build Pipeline',
    },
    {
      title: 'Knowledge & Agents',
      description: 'Crowe Logic agent, sub‑agents, and knowledge mining utilities.',
      icon: Brain,
      href: '/ai-studio#agents',
      cta: 'Manage Agents',
    },
    {
      title: 'Asset Library',
      description: 'Reusable components, templates, and CAD assets.',
      icon: Boxes,
      href: '/facility-designer',
      cta: 'Browse Assets',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Crowe Hub</h1>
        <p className="text-gray-300 mt-2">Central place to launch agents and tools.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ title, description, icon: Icon, href, cta }) => (
          <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Icon className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            </div>
            <p className="text-sm text-gray-300 mb-4">{description}</p>
            <Link href={href}>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">{cta}</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CroweHubPage;
