// src/features/changePassword.ts
import { updatePassword } from '../api/auth';

export interface ChangePasswordOpts {
  userId: string;
  formEl: HTMLFormElement;
  oldInput: HTMLInputElement;
  newInput: HTMLInputElement;
  newInput2: HTMLInputElement;
  saveBtn: HTMLButtonElement;
  msgEl: HTMLElement;
}

export function initChangePassword(opts: ChangePasswordOpts) {
  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setMsg(opts.msgEl);

    const oldPwd = opts.oldInput.value.trim();
    const n1     = opts.newInput.value.trim();
    const n2     = opts.newInput2.value.trim();

    if (!oldPwd || !n1) return setMsg(opts.msgEl, '❌ Champs requis.', 'error');
    if (n1 !== n2)      return setMsg(opts.msgEl, '❌ Les mots de passe ne correspondent pas.', 'error');

    lockBtn(opts.saveBtn, true, 'Mise à jour…');

    try {
      await updatePassword(opts.userId, oldPwd, n1);
      setMsg(opts.msgEl, '✅ Mot de passe modifié avec succès !', 'success');
      opts.oldInput.value = '';
      opts.newInput.value = '';
      opts.newInput2.value = '';
    } catch (err: any) {
      setMsg(opts.msgEl, `❌ ${err?.message || 'Erreur lors du changement de mot de passe'}`, 'error');
    } finally {
      lockBtn(opts.saveBtn, false);
    }
  };

  opts.formEl.addEventListener('submit', onSubmit);

  return {
    destroy() {
      opts.formEl.removeEventListener('submit', onSubmit);
    }
  };
}

/* ---------- helpers ---------- */
function setMsg(el: HTMLElement, text = '', kind?: 'success'|'error') {
  el.textContent = text;
  el.className = `text-sm ${
    kind === 'success' ? 'text-green-600' : kind === 'error' ? 'text-red-600' : ''
  }`;
}
function lockBtn(btn: HTMLButtonElement, disabled: boolean, label?: string) {
  btn.disabled = disabled;
  btn.classList.toggle('opacity-70', disabled);
  btn.classList.toggle('cursor-not-allowed', disabled);
  if (label && disabled) btn.textContent = label;
}
