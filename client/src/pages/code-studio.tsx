import { MonacoCodeEditor } from '@/components/monaco-code-editor';

export function CodeStudioPage() {
  return (
    <div className="container mx-auto p-6 h-[calc(100vh-4rem)]">
      <MonacoCodeEditor />
    </div>
  );
}

export default CodeStudioPage;