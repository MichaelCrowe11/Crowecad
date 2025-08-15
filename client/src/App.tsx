import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import { LandingPage as Landing } from "@/pages/landing";
import { CadWorkspace as CADWorkspace } from "@/pages/cad-workspace";
import FacilityDesigner from "@/pages/facility-designer";
import CollaborativeWorkspace from "@/pages/CollaborativeWorkspace";
import { AIStudioPage } from "@/pages/ai-studio";

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/workspace" component={CADWorkspace} />
          <Route path="/facility-designer" component={FacilityDesigner} />
          <Route path="/collaborative" component={CollaborativeWorkspace} />
          <Route path="/ai-studio" component={AIStudioPage} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;