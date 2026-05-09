import slugify from 'slugify';
import { randomBytes } from 'crypto';

export function generateId(title) {
  const slug = slugify(title, { lower: true, strict: true });
  const suffix = randomBytes(4).toString('hex');
  return `${slug}-${suffix}`;
}

function linkifyUrls(text) {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]*)/g;
  return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

export function renderBlocks(blocks) {
  return blocks.map(block => {
    switch (block.type) {
      case 'text':
        return `<p>${linkifyUrls(block.value)}</p>`;
      case 'heading':
        return `<h${block.level || 2} class="block-heading">${linkifyUrls(block.value)}</h${block.level || 2}>`;
      case 'code':
        return `<div class="block-code"><span class="code-lang">${block.lang || ''}</span><pre><code>${escHtml(block.value)}</code></pre></div>`;
      case 'callout':
        return `<div class="block-callout variant-${block.variant || 'info'}"><span class="callout-icon">${calloutIcon(block.variant)}</span><span>${linkifyUrls(block.value)}</span></div>`;
      case 'list': {
        const tag = block.ordered ? 'ol' : 'ul';
        return `<${tag} class="block-list">${block.items.map(i => `<li>${linkifyUrls(i)}</li>`).join('')}</${tag}>`;
      }
      case 'table':
        return `<div class="block-table-wrap"><table class="block-table"><thead><tr>${block.headers.map(h => `<th>${linkifyUrls(h)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(r => `<tr>${r.map(c => `<td>${linkifyUrls(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      case 'divider':
        return `<hr class="block-divider">`;
      default:
        return `<p>${JSON.stringify(block)}</p>`;
    }
  }).join('\n');
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function calloutIcon(variant) {
  return { info: 'ℹ', warning: '⚠', tip: '✦', danger: '✕' }[variant] || 'ℹ';
}
