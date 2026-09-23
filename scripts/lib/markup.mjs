// Marcação leve usada nos textos dos carrosséis:
//   ==texto==   destaque vermelho
//   **texto**   negrito
//   *texto*     itálico (serifada nos títulos)
//   [VARIÁVEL]  destaque de variável (só dentro de prompts)
//   →           seta desenhada em SVG (a fonte não tem o glifo)

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const SETA =
  '<svg class="ico-seta" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h17m-6-6.5L20 12l-6 6.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const seta = (s) => s.replace(/→/g, SETA);

export function inline(text) {
  let s = escapeHtml(String(text ?? '').trim());
  s = s.replace(/==(.+?)==/g, '<mark>$1</mark>');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>');
  s = seta(s);
  return s.replace(/\n/g, '<br>');
}

// Parágrafos separados por linha em branco.
export function blocks(text) {
  return String(text ?? '')
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((p) => `<p>${inline(p)}</p>`)
    .join('');
}

// Texto de prompt: preserva quebras de linha e destaca [VARIÁVEIS].
// Só conta como variável o que estiver em MAIÚSCULAS, para não marcar
// sintaxe de busca como [tiab] ou [Mesh].
export function promptText(text) {
  let s = escapeHtml(String(text ?? '').replace(/\s+$/, ''));
  s = s.replace(/\[([^\]\na-zß-ÿ]+)\]/g, '<span class="var">[$1]</span>');
  return seta(s);
}

// Remove a marcação, para alt text e legendas.
export function plain(text) {
  return String(text ?? '')
    .replace(/==(.+?)==/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1$2')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}
