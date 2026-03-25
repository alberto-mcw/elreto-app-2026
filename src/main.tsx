import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Lock to portrait orientation (works on Android PWA / Chrome fullscreen)
if (screen.orientation?.lock) {
  screen.orientation.lock('portrait').catch(() => {});
}

// Force page reload when a new service worker takes control so users always get fresh assets
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
