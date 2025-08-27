// src/utils/avatar.ts

// A Modif

/** [UTIL] normalizeAvatar :
 * Rend une URL d’avatar exploitable (http/data/blob inchangés ; "avatar/x.png" → "/avatar/x.png")
 */
export function normalizeAvatar(input?: string | null, base = 'avatar'): string 
{
  if (!input) return '';
  const s = input.trim();
  if (!s) return '';
  if (/^(https?:|data:|blob:)/i.test(s)) return s;
  const p = s.replace(/^\/+/, '');
  if (p.startsWith(`${base}/`)) return '/' + p;
  if (!p.includes('/')) return `/${base}/${p}`;
  return '/' + p;
}

/** [UTIL] applyImgWithFallback :
 * Applique une source à <img> avec gestion d’un fallback en cas d’erreur.
 */
export function applyImgWithFallback(img: HTMLImageElement, src: string, fallback = '/avatar/default.png') 
{
  img.src = src;
  const onErr = () => 
  {
    img.src = fallback;
    img.removeEventListener('error', onErr);
  };
  img.addEventListener('error', onErr, { once: true });
}
