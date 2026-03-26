import { useCallback, useEffect, useRef } from "react";
import createGlobe from "cobe";

const defaultMarkers = [
  { id: "hq", location: [37.78, -122.44] },
  { id: "eu", location: [52.52, 13.41] },
  { id: "asia", location: [35.68, 139.65] },
  { id: "latam", location: [-23.55, -46.63] },
];

export function GlobeInteractive({ markers = defaultMarkers, className = "", speed = 0.0024 }) {
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);

  const handlePointerDown = useCallback((event) => {
    pointerInteracting.current = { x: event.clientX, y: event.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }

    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!pointerInteracting.current) return;

      dragOffset.current = {
        phi: (event.clientX - pointerInteracting.current.x) / 320,
        theta: (event.clientY - pointerInteracting.current.y) / 1100,
      };
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let globe = null;
    let resizeObserver = null;
    let phi = 0;
    let raf = 0;

    const initialize = () => {
      const width = canvas.offsetWidth;
      if (!width) return;

      if (globe) globe.destroy();

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.18,
        dark: 0.1,
        diffuse: 1.2,
        mapSamples: 18000,
        mapBrightness: 2.2,
        baseColor: [0.07, 0.16, 0.38],
        markerColor: [0.16, 0.42, 0.95],
        glowColor: [0.9, 0.94, 1],
        markerSize: 0.07,
        markers: markers.map((marker) => ({
          location: marker.location,
          size: 0.07,
        })),
        onRender: (state) => {
          if (!isPausedRef.current) phi += speed;

          state.phi = phi + phiOffsetRef.current + dragOffset.current.phi;
          state.theta = 0.18 + thetaOffsetRef.current + dragOffset.current.theta;
          state.width = width;
          state.height = width;
        },
      });

      canvas.style.opacity = "1";
    };

    initialize();

    resizeObserver = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(initialize);
    });
    resizeObserver.observe(canvas);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (resizeObserver) resizeObserver.disconnect();
      if (globe) globe.destroy();
    };
  }, [markers, speed]);

  return (
    <div className={`globe-interactive ${className}`.trim()}>
      <canvas ref={canvasRef} onPointerDown={handlePointerDown} className="globe-interactive__canvas" />
    </div>
  );
}
