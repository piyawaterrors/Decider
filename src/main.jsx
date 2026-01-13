import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Prevent Buy Me a Coffee script errors if legacy scripts are cached
if (typeof window !== "undefined") {
  window.bmc_widget_config = window.bmc_widget_config || {};
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
