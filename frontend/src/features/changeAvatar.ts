import { updateUser } from '../api/users';
import { getSavedUser, setLoggedInUser} from '../utils/ui';
import { AppUser } from '../utils/interface';

export type ChangeAvatarOptions = {

  grid: HTMLElement;
  previewImg: HTMLImageElement;
  urlInput: HTMLInputElement;
  applyUrlBtn: HTMLButtonElement;
  messageEl?: HTMLElement;
  initialValue: string;
  avatars: string[];
  debounceMs?: number;
  fallback?: string; // défaut: '/avatar/default.png'
};

/**
 * Initialise la gestion du changement d’avatar :
 * - mise à jour preview + input
 * - sélection visuelle dans la grille
 * - auto-save (debounce) via /users/:id
 * - MAJ localStorage + event "auth:changed" pour la navbar
 */
export function initChangeAvatar(opts: ChangeAvatarOptions) {
  const {
    grid,
    previewImg,
    urlInput,
    applyUrlBtn,
    messageEl,
    initialValue,
    avatars,
    debounceMs = 250,
    fallback = '/avatar/default.png',
  } = opts;

  // --- helpers locaux ---
  const setMsg = (text = '', kind?: 'success' | 'error') => {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = `text-sm ${
      kind === 'success' ? 'text-green-600' : kind === 'error' ? 'text-red-600' : ''
    }`;
  };

  function normaliseAvatar(input?: string | null): string {
    if (!input) return '';
    const s = input.trim();
    if (!s) return '';
    if (/^(https?:|data:|blob:)/i.test(s)) return s; // URL absolue / data / blob
    const p = s.replace(/^\/+/, '');
    if (p.startsWith('avatar/')) return '/' + p;
    if (!p.includes('/')) return '/avatar/' + p;
    return '/' + p;
  }

  function applyPreview(src: string) {
    previewImg.src = src;
    const onErr = () => {
      previewImg.src = fallback;
      previewImg.removeEventListener('error', onErr);
    };
    previewImg.addEventListener('error', onErr, { once: true });
  }

  function markGridSelection(src: string) {
    const selected = normaliseAvatar(src);
    grid.querySelectorAll<HTMLButtonElement>('button[data-avatar]').forEach((b) => {
      const isSel = normaliseAvatar(b.dataset.avatar || '') === selected;
      b.setAttribute('aria-pressed', String(isSel));
      const ring = b.querySelector('span');
      if (ring) {
        ring.classList.toggle('ring-2', isSel);
        ring.classList.toggle('ring-blue-600', isSel);
        if (!isSel) ring.classList.remove('ring-2', 'ring-blue-600');
      }
    });
  }

  let timer: number | null = null;
  function queueSave(src: string) {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(async () => {
      try {
        await persistAvatar(src);
        setMsg('✅ Avatar mis à jour', 'success');
      } catch (err: any) {
        setMsg(`❌ ${err?.message || 'Échec mise à jour avatar'}`, 'error');
      }
    }, debounceMs);
  }

  async function persistAvatar(src: string) {
    const u = getSavedUser<AppUser>();
    if (!u) throw new Error('Session expirée');
    const updated = await updateUser(u.userId, { avatarPath: src });
    const merged: AppUser = { ...u, avatarPath: updated.avatarPath };
    setLoggedInUser(merged);
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: merged }));
  }

  // --- listeners ---
  function onGridClick(e: Event) {
    const target = e.target as HTMLElement | null;
    const btn = target?.closest('button[data-avatar]') as HTMLButtonElement | null;
    const raw = btn?.dataset.avatar || target?.getAttribute?.('data-avatar') || '';
    if (!raw) return;
    e.preventDefault();

    const src = normaliseAvatar(raw);
    urlInput.value = src;
    applyPreview(src);
    markGridSelection(src);
    queueSave(src);
  }

  function onApplyUrl() {
    const raw = urlInput.value.trim();
    if (!raw) return;
    const src = normaliseAvatar(raw);

    // désélectionne toutes les vignettes (URL custom)
    markGridSelection('__none__');
    applyPreview(src);
    queueSave(src);
  }

  // --- init UI ---
  const start = normaliseAvatar(initialValue) || fallback;
  urlInput.value = start;
  applyPreview(start);
  if (avatars.includes(start)) markGridSelection(start);

  grid.addEventListener('click', onGridClick);
  applyUrlBtn.addEventListener('click', onApplyUrl);

  return {
    /** Permet de changer programmatique la valeur (ex: bouton "Annuler") */
    setValue(src: string, { save = false }: { save?: boolean } = {}) {
      const norm = normaliseAvatar(src) || fallback;
      urlInput.value = norm;
      applyPreview(norm);
      markGridSelection(norm);
      if (save) queueSave(norm);
    },
    destroy() {
      grid.removeEventListener('click', onGridClick);
      applyUrlBtn.removeEventListener('click', onApplyUrl);
      if (timer) window.clearTimeout(timer);
    },
  };
}



