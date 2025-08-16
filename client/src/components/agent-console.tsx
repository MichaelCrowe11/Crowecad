import { agents } from '@/lib/agents/registry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export function AgentConsole() {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle>Agent Console</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-3">
          {agents.map(a => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-white/10 p-3">
              <div>
                <div className="text-white font-medium">{a.name}</div>
                <div className="text-xs text-gray-300">{a.description}</div>
              </div>
              <Link href={a.entry}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Open</Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default AgentConsole;
