import slugify from 'slugify';
import { randomBytes } from 'crypto';

export function generateId(title) {
  const slug = slugify(title, { lower: true, strict: true });
  const suffix = randomBytes(4).toString('hex');
  return `${slug}-${suffix}`;
}

export function renderBlocks(blocks) {
  return blocks.map(block => {
    switch (block.type) {
      case 'text':
        return `<p>${block.value}</p>`;
      case 'heading':
        return `<h${block.level || 2} class="block-heading">${block.value}</h${block.level || 2}>`;
      case 'code':
        return `<div class="block-code"><span class="code-lang">${block.lang || ''}</span><pre><code>${escHtml(block.value)}</code></pre></div>`;
      case 'callout':
        return `<div class="block-callout variant-${block.variant || 'info'}"><span class="callout-icon">${calloutIcon(block.variant)}</span><span>${block.value}</span></div>`;
      case 'list':
        const tag = block.ordered ? 'ol' : 'ul';
        return `<${tag} class="block-list">${block.items.map(i => `<li>${i}</li>`).join('')}</${tag}>`;
      case 'table':
        return `<div class="block-table-wrap"><table class="block-table"><thead><tr>${block.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${block.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
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
