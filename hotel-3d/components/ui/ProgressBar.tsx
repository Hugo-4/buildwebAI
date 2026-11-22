"use client";
/** Barre de progression de lecture : un trait ambré d'un pixel, tout en haut. */
import { useEffect, useRef } from "react";
import { registerGsap, ScrollTrigger, gsap } from "@/lib/motion";

export default function ProgressBar() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    registerGsap();
    if (!bar.current) return;
    const set = gsap.quickSetter(bar.current, "scaleX");
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => set(s.progress) });
    return () => st.kill();
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-amber" />
    </div>
  );
}
