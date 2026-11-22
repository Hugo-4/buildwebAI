/**
 * Monogramme « A-pente » : un A didone (délié à gauche, plein à droite) dont la
 * traverse suit la pente à 12° et sort de la lettre comme une trace de ski.
 * Tracé construit (pas de texte), une seule couleur : currentColor.
 */
type Props = { className?: string; title?: string };

export default function Monogram({ className, title = "L'Arolle" }: Props) {
  return (
    <svg viewBox="44 28 198 196" className={className} role="img" aria-label={title || undefined} aria-hidden={title ? undefined : true} fill="currentColor">
      <path d="M124 36 L132 36 L66.5 216 L58.5 216 Z" />
      <path d="M124 36 L136 36 L201.5 216 L172.2 216 Z" />
      <path d="M50 210 L76 210 L76 216 L50 216 Z M160 210 L212 210 L212 216 L160 216 Z" />
      <path d="M78 168 L236 134.42 L236 140.42 L78 174 Z" />
    </svg>
  );
}
