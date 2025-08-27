// src/utils/sanitize.ts

// A Modif

// But : empêcher l’injection HTML lors d’un rendu via template string. anti injection xss

/** [UTIL] escapeHtml : échappe un texte pour insertion dans le DOM. */
export function escapeHtml(s: string) 
{
  return s.replace(/[&<>"']/g, (m) =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m]!)
  );
}

/** [UTIL] escapeAttr : version orientée attribut (échappe aussi les guillemets). */
export function escapeAttr(s: string) 
{
  return escapeHtml(s).replace(/"/g, '&quot;');
}
