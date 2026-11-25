"use client";
/**
 * Vidéo d'ambiance en boucle (muette, sans contrôles visibles).
 * - L'affiche est une image chargée à la demande (lazy) ; la vidéo ne se charge et ne
 *   joue que lorsqu'elle est à l'écran, puis remplace l'affiche dès qu'elle tourne.
 * - prefers-reduced-motion : l'affiche seule, aucune lecture.
 * - Les fichiers sont des allers-retours (aucun saut à la boucle).
 */
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

type Props = { src: string; poster: string; label: string; className?: string };

export default function LoopVideo({ src, poster, label, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);
  const [playing, setPlaying] = useState(false);

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

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt={still ? label : ""} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      {!still && (
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          aria-label={label}
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
