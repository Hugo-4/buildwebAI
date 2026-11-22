/**
 * Les filets verticaux qui règlent toute la page, comme un plan d'architecte :
 * six colonnes (quatre sur téléphone), alignées sur les gouttières du contenu.
 * Fixes, au-dessus des fonds et des images, sous le texte et l'interface ;
 * gris moyen à faible opacité pour rester visibles sur la neige comme sur une photo.
 */
export default function GridLines() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[5] px-[var(--gutter)]">
      <div className="grid h-full grid-cols-4 border-r border-[rgb(128_134_140/0.16)] md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className={`h-full border-l border-[rgb(128_134_140/0.16)] ${i >= 4 ? "hidden md:block" : ""}`} />
        ))}
      </div>
    </div>
  );
}
