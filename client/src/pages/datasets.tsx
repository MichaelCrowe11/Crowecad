/**
 * CAD Datasets Page
 * Browse and explore millions of CAD models from various sources
 */

import { CadDatasetsBrowser } from "@/components/cad-datasets-browser";
import { NavigationHeader } from "@/components/navigation-header";

export default function DatasetsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavigationHeader />
      <div className="flex-1 overflow-hidden">
        <CadDatasetsBrowser />
      </div>
    </div>
  );
}