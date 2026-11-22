import { type PropsWithChildren, lazy, Suspense, useCallback, useLayoutEffect, useRef, useState } from "react";
import { PrototypeGuideContext, type GuideScene } from "./prototype-guide-context";

const PrototypeGuide = lazy(() => import("./prototype-guide-panel"));

export function PrototypeGuideProvider({ children }: PropsWithChildren) {
  useLayoutEffect(() => {
    const phone = document.querySelector<HTMLElement>(".phone-scale-box");
    const stage = document.querySelector<HTMLElement>(".phone-stage");
    if (!phone || !stage) return;
    const root = document.documentElement;
    const properties = ["--prototype-tools-left", "--prototype-tools-top"] as const;
    const previous = properties.map(name => root.style.getPropertyValue(name));
    let frame = 0;
    const position = () => {
      const bounds = phone.getBoundingClientRect();
      root.style.setProperty(properties[0], `${Math.round((bounds.right + 16) * 100) / 100}px`);
      root.style.setProperty(properties[1], `${Math.round(Math.max(12, bounds.top) * 100) / 100}px`);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(position);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(phone);
    observer.observe(stage);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    position();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      properties.forEach((name, index) => previous[index] ? root.style.setProperty(name, previous[index]) : root.style.removeProperty(name));
    };
  }, []);
  const [entries, setEntries] = useState<Record<string, GuideScene & { sequence: number }>>({});
  const sequence = useRef(0);
  const register = useCallback((owner: string, scene: GuideScene) => {
    sequence.current += 1;
    const next = { ...scene, sequence: sequence.current };
    setEntries(current => ({ ...current, [owner]: next }));
  }, []);
  const remove = useCallback((owner: string) => {
    setEntries(current => {
      if (!(owner in current)) return current;
      const next = { ...current };
      delete next[owner];
      return next;
    });
  }, []);
  const current = Object.values(entries).sort((a, b) =>
    Number(a.layer === "overlay") - Number(b.layer === "overlay") || a.sequence - b.sequence,
  ).at(-1);
  return <PrototypeGuideContext.Provider value={{ register, remove }}>
    {children}
    <Suspense fallback={null}><PrototypeGuide scene={current} /></Suspense>
  </PrototypeGuideContext.Provider>;
}

