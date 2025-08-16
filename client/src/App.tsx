import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NavigationHeader } from "@/components/navigation-header";
import NotFound from "@/pages/not-found";
import { LandingPage as Landing } from "@/pages/landing";
import { CadWorkspace as CADWorkspace } from "@/pages/cad-workspace";
import FacilityDesigner from "@/pages/facility-designer";
import CollaborativeWorkspace from "@/pages/CollaborativeWorkspace";
import { AIStudioPage } from "@/pages/ai-studio";
import { CroweHubPage } from "@/pages/hub";
import DatasetsPage from "@/pages/datasets";

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <NavigationHeader />
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/" component={Landing} />
              <Route path="/workspace" component={CADWorkspace} />
              <Route path="/facility-designer" component={FacilityDesigner} />
              <Route path="/collaborative" component={CollaborativeWorkspace} />
              <Route path="/ai-studio" component={AIStudioPage} />
              <Route path="/hub" component={CroweHubPage} />
              <Route path="/datasets" component={DatasetsPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;