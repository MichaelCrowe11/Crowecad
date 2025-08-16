/**
 * Development Resources Page
 * Browse code snippets, UI components, APIs, and development tools
 */

import { DevResourcesBrowser } from "@/components/dev-resources-browser";

export default function DevResourcesPage() {
  return (
    <div className="h-screen flex flex-col">
      <DevResourcesBrowser />
    </div>
  );
}