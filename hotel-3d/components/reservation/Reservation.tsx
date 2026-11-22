"use client";
/**
 * Chapitre 6 — Réserver.
 * Formulaire épuré : arrivée, départ, voyageurs, suite. Micro-interactions :
 * soulignement qui se trace au focus, compteurs qui roulent, bouton magnétique
 * avec état d'envoi, message de confirmation qui récapitule la demande.
 *
 * Pas de moteur de réservation : c'est une DEMANDE de disponibilité.
 * Brancher l'envoi dans `submit()` (API, e-mail, CRM).
 */
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, type FormEvent } from "react";
import Magnetic from "@/components/ui/Magnetic";
import RevealLines from "@/components/ui/RevealLines";
import { BEZIER } from "@/lib/motion";

const SUITES = ["Suite Arête", "Suite Lauze", "Suite Combe", "Suite Cembro"];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const fmt = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" });

/** Compteur ± : le chiffre roule vers le haut ou vers le bas selon le sens. */
function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();
  const set = (v: number) => {
    setDir(v > value ? 1 : -1);
    onChange(Math.min(max, Math.max(min, v)));
  };
  return (
    <div className="flex items-center justify-between border-b border-ink/25 py-4" role="group" aria-label={label}>
      <span className="caps text-ink/70">{label}</span>
      <div className="flex items-center gap-5">
        <button type="button" className="step-btn" onClick={() => set(value - 1)} disabled={value <= min} aria-label={`Retirer un ${label.toLowerCase().replace(/s$/, "")}`}>
          <svg viewBox="0 0 16 16" aria-hidden><path d="M3 8h10" stroke="currentColor" strokeWidth="1.25" /></svg>
        </button>
        <span className="relative inline-block h-[1.5em] w-[1.6ch] overflow-hidden text-center text-[1.25rem] tabular-nums" aria-live="polite">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.span
              key={value}
              custom={dir}
              className="absolute inset-0"
              initial={{ y: reduce ? 0 : `${dir * 100}%` }}
              animate={{ y: 0 }}
              exit={{ y: reduce ? 0 : `${dir * -100}%` }}
              transition={{ duration: 0.35, ease: BEZIER.outExpo }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </span>
        <button type="button" className="step-btn" onClick={() => set(value + 1)} disabled={value >= max} aria-label={`Ajouter un ${label.toLowerCase().replace(/s$/, "")}`}>
          <svg viewBox="0 0 16 16" aria-hidden><path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.25" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function Reservation() {
  const today = useMemo(() => new Date(), []);
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [suite, setSuite] = useState(SUITES[0]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const reduce = useReducedMotion();

  const nights =
    arrival && departure ? Math.round((+new Date(departure) - +new Date(arrival)) / 86_400_000) : 0;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!arrival) e.arrival = "Choisissez une date d’arrivée.";
    if (!departure) e.departure = "Choisissez une date de départ.";
    else if (arrival && nights < 1) e.departure = "Le départ doit suivre l’arrivée d’au moins une nuit.";
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Indiquez une adresse e-mail pour recevoir la réponse.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    // Démo : à remplacer par l'appel réel (fetch('/api/reservation', …))
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("sent");
  }

  return (
    <section id="reserver" data-header="dark" aria-labelledby="res-title" className="border-t border-rule bg-snow py-[var(--section-y)] text-ink">
      <div className="grid grid-cols-4 gap-y-16 px-[var(--gutter)] md:grid-cols-6">
        <div className="col-span-4 md:col-span-2 md:col-start-1">
          <RevealLines
            as="h2"
            id="res-title"
            lines={["Votre séjour", "commence ici"]}
            className="title text-[clamp(2.4rem,4.6vw,4.6rem)]"
          />
          <p className="mt-8 max-w-[34ch] text-[1.125rem] leading-relaxed text-ink/85">
            Dites-nous vos dates : la réception vous répond dans l&rsquo;heure avec la disponibilité et le tarif de la suite.
          </p>
        </div>

        <div className="col-span-4 md:col-span-3 md:col-start-4">
          <AnimatePresence mode="wait" initial={false}>
            {status !== "sent" ? (
              <motion.form
                key="form"
                noValidate
                onSubmit={submit}
                exit={{ opacity: 0, y: reduce ? 0 : -16, transition: { duration: 0.25, ease: BEZIER.in } }}
              >
                <div className="grid gap-x-8 sm:grid-cols-2">
                  <Field label="Arrivée" error={errors.arrival} id="arrivee">
                    <input
                      id="arrivee"
                      type="date"
                      min={iso(today)}
                      value={arrival}
                      onChange={(e) => setArrival(e.target.value)}
                      aria-invalid={!!errors.arrival}
                      aria-describedby={errors.arrival ? "arrivee-err" : undefined}
                      className="field-input"
                    />
                  </Field>
                  <Field label="Départ" error={errors.departure} id="depart">
                    <input
                      id="depart"
                      type="date"
                      min={arrival || iso(today)}
                      value={departure}
                      onChange={(e) => setDeparture(e.target.value)}
                      aria-invalid={!!errors.departure}
                      aria-describedby={errors.departure ? "depart-err" : undefined}
                      className="field-input"
                    />
                  </Field>
                </div>
                <p className="caps mt-2 h-5 text-ink/60" aria-live="polite">
                  {nights > 0 ? `${nights} nuit${nights > 1 ? "s" : ""}` : ""}
                </p>

                <Stepper label="Adultes" value={adults} min={1} max={6} onChange={setAdults} />
                <Stepper label="Enfants" value={children} min={0} max={4} onChange={setChildren} />

                <fieldset className="mt-8">
                  <legend className="caps text-ink/70">Suite souhaitée</legend>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {SUITES.map((s) => (
                      <label key={s} className="suite-chip">
                        <input type="radio" name="suite" value={s} checked={suite === s} onChange={() => setSuite(s)} className="sr-only" />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <Field label="E-mail" error={errors.email} id="email" className="mt-8">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-err" : undefined}
                    className="field-input"
                  />
                </Field>

                <div className="mt-12 flex items-center gap-6">
                  <Magnetic strength={0.3}>
                    <button type="submit" className="btn caps text-[0.8125rem]" disabled={status === "sending"} aria-busy={status === "sending"}>
                      {status === "sending" ? (
                        <>
                          <span className="spinner" aria-hidden /> Envoi…
                        </>
                      ) : (
                        "Demander la disponibilité"
                      )}
                    </button>
                  </Magnetic>
                  <span className="text-[0.9375rem] text-ink/70">Sans engagement</span>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="sent"
                role="status"
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: BEZIER.outExpo } }}
                className="border-t border-ink/25 pt-10"
              >
                <p className="title text-[clamp(2rem,3.4vw,3rem)]">Demande envoyée</p>
                <p className="mt-6 max-w-[42ch] leading-relaxed">
                  {suite}, du {fmt(arrival)} au {fmt(departure)}, {adults} adulte{adults > 1 ? "s" : ""}
                  {children ? ` et ${children} enfant${children > 1 ? "s" : ""}` : ""}. Réponse à {email} dans l&rsquo;heure.
                </p>
                <button type="button" className="caps link-line mt-10" onClick={() => setStatus("idle")}>
                  Modifier la demande
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Field({ label, error, id, children, className = "" }: { label: string; error?: string; id: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id} className="caps text-ink/70">
        {label}
      </label>
      {children}
      <span className="field-line" aria-hidden />
      {error && (
        <p id={`${id}-err`} className="mt-2 text-[0.875rem] text-[#9b2c1f]">
          {error}
        </p>
      )}
    </div>
  );
}
