import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/archivo/wdth.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/ui.css";
import "./styles/shell.css";
import "./styles/landing.css";
import "./styles/auth.css";
import "./styles/pages.css";
import "./styles/chat.css";
import { applyTheme } from "./lib/theme";
import App from "./App.jsx";

applyTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
