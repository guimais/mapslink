import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "leaflet/dist/leaflet.css";
import "./styles/app.css";
import { App } from "./App";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("MapsLink: #root não encontrado.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
