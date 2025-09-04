import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Enable accessibility testing in development
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then(axe => {
    axe.default(React, { createRoot }, 1000);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
