/**
 * La pente à 12° de tout le système.
 * Une coupe exprimée en % de la hauteur d'un élément change d'angle avec ses
 * proportions ; on la calcule donc depuis la largeur réelle : montée = tan(12°) × largeur.
 */
export const TAN12 = 0.2126;

/** Montée de l'arête, en % de la hauteur de l'élément (plafonnée). */
export function slopeRise(el: HTMLElement, max = 90) {
  const h = el.offsetHeight || 1;
  return Math.min(((TAN12 * el.offsetWidth) / h) * 100, max);
}

/** Polygone ouvert : arête montant de gauche à droite, le reste plein. */
export const slopeOpen = (rise: number) => `polygon(0% ${rise.toFixed(2)}%, 100% 0%, 100% 100%, 0% 100%)`;

/**
 * Polygone fermé : la même arête posée sous le bas de l'élément, sans surface
 * (bas et haut confondus). Rien ne dépasse, même un texte décalé vers le bas.
 */
export const slopeShut = (rise: number) => {
  const l = (100 + rise).toFixed(2);
  return `polygon(0% ${l}%, 100% 100%, 100% 100%, 0% ${l}%)`;
};
