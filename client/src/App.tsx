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
import { AIStudioPage } from "@/pages/ai-studio";
import { CroweHubPage } from "@/pages/hub";
import DatasetsPage from "@/pages/datasets";
import DevResourcesPage from "@/pages/dev-resources";
import APIHubPage from "@/pages/api-hub";
import CodeStudioPage from "@/pages/code-studio";

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {/* Skip to main content link for keyboard navigation */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <NavigationHeader />
          <main id="main-content" className="flex-1" tabIndex={-1} role="main">
            <Switch>
              <Route path="/" component={Landing} />
              <Route path="/workspace" component={CADWorkspace} />
              <Route path="/facility-designer" component={FacilityDesigner} />
              <Route path="/ai-studio" component={AIStudioPage} />
              <Route path="/hub" component={CroweHubPage} />
              <Route path="/datasets" component={DatasetsPage} />
              <Route path="/dev-resources" component={DevResourcesPage} />
              <Route path="/api-hub" component={APIHubPage} />
              <Route path="/code-studio" component={CodeStudioPage} />
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