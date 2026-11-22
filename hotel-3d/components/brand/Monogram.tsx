/**
 * Monogramme « LA en pente » : le fût du L et le délié du A forment
 * la pente du massif ; la traverse suit l'angle de 12° de la composition.
 * Tracé construit (pas de texte), une seule couleur : currentColor.
 */
type Props = { className?: string; title?: string };

export default function Monogram({ className, title = "L'Arolle" }: Props) {
  return (
    <svg viewBox="40 24 200 208" className={className} role="img" aria-label={title} fill="currentColor">
      <path d="M70 40 L102 40 L102 216 L70 216 Z" />
      <path d="M56 40 L102 40 L102 48 L56 48 Z" />
      <path d="M94 40 L108 40 L209.61 216 L195.61 216 Z" />
      <path d="M56 208 L223.61 208 L223.61 216 L56 216 Z" />
      <path d="M102 156 L163.31 142.97 L163.31 149.97 L102 163 Z" />
    </svg>
  );
}
