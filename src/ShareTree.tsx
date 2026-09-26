import { useEffect, useRef } from "react";
import {
  createShareTreeScene,
  type ShareTreeScene,
  type ShareTreeSeason,
  type ShareTreeView,
} from "./share-tree-scene";

export default function ShareTree({
  url,
  view,
  season,
  onCapture,
  onReady,
  onError,
}: {
  url: string;
  view: ShareTreeView;
  season: ShareTreeSeason;
  onCapture?: (dataUrl: string | null, season: ShareTreeSeason) => void;
  onReady?: () => void;
  onError?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<ShareTreeScene | null>(null);
  const sceneSeason = useRef(season);
  const current = useRef({ view, season, onCapture, onReady, onError });
  current.current = { view, season, onCapture, onReady, onError };

  useEffect(() => {
    const element = host.current;
    const surface = canvas.current;
    if (!element || !surface) return;
    let stopped = false;
    let failed = false;
    let observer: ResizeObserver | undefined;
    function fail() {
      if (stopped || failed) return;
      failed = true;
      element!.dataset.ready = "false";
      current.current.onError?.();
    }
    function lost(event: Event) {
      event.preventDefault();
      fail();
    }
    surface.addEventListener("webglcontextlost", lost);
    try {
      sceneSeason.current = current.current.season;
      const controller = createShareTreeScene({
        canvas: surface,
        url,
        season: current.current.season,
        onStable: (next) => {
          if (!stopped) element.dataset.view = next;
        },
        onCapture: (image) => {
          if (!stopped) {
            current.current.onCapture?.(image, sceneSeason.current);
          }
        },
      });
      scene.current = controller;
      element.dataset.ready = "true";
      current.current.onReady?.();
      controller.setView(current.current.view);
      observer = new ResizeObserver(([entry]) => {
        if (!stopped && entry) {
          controller.resize(entry.contentRect.width, entry.contentRect.height);
        }
      });
      observer.observe(element);
    } catch {
      fail();
    }
    return () => {
      stopped = true;
      observer?.disconnect();
      surface.removeEventListener("webglcontextlost", lost);
      scene.current?.dispose();
      scene.current = null;
    };
  }, [url]);

  useEffect(() => {
    scene.current?.setView(view);
  }, [view]);

  useEffect(() => {
    if (!scene.current || sceneSeason.current === season) return;
    sceneSeason.current = season;
    scene.current.setSeason(season);
  }, [season]);

  return (
    <div className="share-tree" ref={host} data-ready="false" data-view="transition">
      <canvas ref={canvas} aria-hidden="true" style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
