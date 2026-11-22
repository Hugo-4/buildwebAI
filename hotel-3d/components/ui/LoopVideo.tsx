"use client";
/**
 * Vidéo d'ambiance en boucle (muette, sans contrôles visibles).
 * - Ne se charge et ne joue que lorsqu'elle est à l'écran (économie de données).
 * - prefers-reduced-motion : l'affiche seule, aucune lecture.
 * - Les fichiers sont des allers-retours (aucun saut à la boucle).
 */
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

type Props = { src: string; poster: string; label: string; className?: string };

export default function LoopVideo({ src, poster, label, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (prefersReducedMotion()) {
      setStill(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) v.src = src;
          v.play().catch(() => {});
        } else v.pause();
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  if (still) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt={label} className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
