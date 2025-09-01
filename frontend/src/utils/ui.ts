// src/utils/ui.ts

// A Modif

export type StatusKind = 'success' | 'error' | undefined;

/** [UTIL][UI] setStatusMessage :
 * Affiche un message de statut (succès/erreur) avec des classes Tailwind cohérentes.
 */
export function setStatusMessage(el: HTMLElement, text = '', kind?: StatusKind) 
{
  el.textContent = text;
  const base = 'text-sm';
  const color =
    kind === 'success' ? 'text-green-600' :
    kind === 'error'   ? 'text-red-600'   : '';
  el.className = [base, color].filter(Boolean).join(' ');
}

/** [UTIL][UI] clearStatusMessage : remet la zone de message à l’état neutre. */
export function clearStatusMessage(el: HTMLElement) 
{
  setStatusMessage(el);
}

/** [UTIL][UI] lockButton :
 * Désactive/active le bouton, ajoute aria-disabled, gère le label temporaire.
 */
export function lockButton(btn: HTMLButtonElement, disabled: boolean, loadingLabel?: string) 
{
  btn.disabled = disabled;
  btn.setAttribute('aria-disabled', String(disabled));
  btn.classList.toggle('opacity-70', disabled);
  btn.classList.toggle('cursor-not-allowed', disabled);

  if (disabled) {
    if (!btn.dataset.prevLabel) btn.dataset.prevLabel = btn.textContent || '';
    if (loadingLabel) btn.textContent = loadingLabel;
  } else if (btn.dataset.prevLabel) {
    btn.textContent = btn.dataset.prevLabel;
    delete btn.dataset.prevLabel;
  }
}

/** [UTIL][UI] bindPasswordToggle :
 * Branche un bouton pour basculer l’affichage d’un input mot de passe.
 * Retourne un "unbinder" pour retirer le listener si besoin.
 */
export function bindPasswordToggle
(
  input: HTMLInputElement,
  button: HTMLButtonElement,
  showLabel = 'Show',
  hideLabel = 'Hide'
) {
  const onClick = () => {
    const isPwd = input.type === 'password';
    input.type = isPwd ? 'text' : 'password';
    button.textContent = isPwd ? hideLabel : showLabel;
  };
  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}
