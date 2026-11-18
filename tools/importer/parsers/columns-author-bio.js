/* eslint-disable */
/* global WebImporter */
/**
 * Parser: columns-author-bio
 * Source: author byline experience fragment
 * (div.experiencefragment > ... separator hr, div.byline > div.cmp-byline
 *  [div.cmp-byline__image img, h2.cmp-byline__name, p.cmp-byline__occupations],
 *  then div.cmp-buildingblock--btn-list with icon-only a.cmp-button social buttons).
 * Target (blocks/columns-author-bio): one row = headshot | name heading + role | social links.
 * The separator is dropped. Empty cells are padded so the row always has 3 columns.
 */
export default function parse(element, { document }) {
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const byline = element.querySelector('.cmp-byline') || element.querySelector('div.byline') || element;

  // Column 1: headshot
  const imageCell = [];
  const srcImg = byline.querySelector('.cmp-byline__image img, img');
  if (srcImg) {
    const img = document.createElement('img');
    const src = srcImg.getAttribute('src') || srcImg.getAttribute('data-src') || '';
    img.src = src ? new URL(src, 'https://wknd.site').href : '';
    const name = text(byline.querySelector('.cmp-byline__name'));
    img.alt = srcImg.getAttribute('alt') || name || '';
    if (img.src) imageCell.push(img);
  }

  // Column 2: name heading + role
  const textCell = [];
  const nameEl = byline.querySelector('.cmp-byline__name');
  if (text(nameEl)) {
    const h = document.createElement(/^H[1-6]$/.test(nameEl.tagName) ? nameEl.tagName : 'h2');
    h.textContent = text(nameEl);
    textCell.push(h);
  }
  const roleEl = byline.querySelector('.cmp-byline__occupations');
  if (text(roleEl)) {
    const p = document.createElement('p');
    p.textContent = text(roleEl);
    textCell.push(p);
  }

  // Column 3: social links (icon-only buttons; label from visible text / aria-label / data layer title)
  const socialCell = [];
  const links = [...element.querySelectorAll('.button a.cmp-button, a.cmp-button')]
    .filter((a, i, arr) => arr.indexOf(a) === i && !byline.contains(a));
  links.forEach((src) => {
    let label = text(src.querySelector('.cmp-button__text')) || text(src);
    if (!label) {
      const icon = src.querySelector('[class*="cmp-button__icon--"]');
      const m = icon && icon.className.match(/cmp-button__icon--([a-z0-9-]+)/i);
      label = (m && m[1]) || (src.getAttribute('aria-label') || '').replace(/\s*social media\s*$/i, '').trim();
    }
    if (!label) return;
    const a = document.createElement('a');
    a.href = src.getAttribute('href') || '#';
    a.textContent = label;
    const p = document.createElement('p');
    p.append(a);
    socialCell.push(p);
  });

  if (!imageCell.length && !textCell.length && !socialCell.length) {
    element.remove();
    return;
  }

  const cells = [[imageCell, textCell, socialCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-author-bio', cells });
  element.replaceWith(block);
}
