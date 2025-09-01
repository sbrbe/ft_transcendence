// src/utils/dom.ts

// A Modif

/** [UTIL][DOM] q :
 * querySelector typé, lève une erreur si l’élément est introuvable.
 */
export function q<T extends HTMLElement>(root: ParentNode, selector: string): T 
{
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** [UTIL][DOM] getInputValue :
 * Récupère et trim la valeur d’un input trouvé dans root.
 */
export function getInputValue(root: ParentNode, selector: string) 
{
  return (root.querySelector<HTMLInputElement>(selector)?.value || '').trim();
}
