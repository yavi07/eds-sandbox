/* eslint-disable */
/* global WebImporter */
/**
 * Parser: hero-teaser
 * Source: AEM core teaser.
 *   - div.teaser.cmp-teaser--featured  -> variant "image-beside-text-panel"
 *   - div.teaser.cmp-teaser--imagebottom (not featured) -> variant "image-bottom"
 *     (image cropped from its bottom edge)
 *   - other teasers (e.g. cmp-teaser--hero) -> default
 * Target (1 column): row 1 = image, row 2 = text
 *   (optional eyebrow <p> from the pretitle, heading, description, CTA link).
 */
export default function parse(element, { document }) {
  const cells = [];

  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  const isFeatured = element.classList.contains('cmp-teaser--featured')
    || !!element.closest('.cmp-teaser--featured');
  const isImageBottom = element.classList.contains('cmp-teaser--imagebottom')
    || !!element.closest('.cmp-teaser--imagebottom');
  let name = 'hero-teaser';
  if (isFeatured) name = 'hero-teaser (image-beside-text-panel)';
  else if (isImageBottom) name = 'hero-teaser (image-bottom)';

  // Image row
  const img = element.querySelector('.cmp-teaser__image img, .cmp-image img') || element.querySelector('img');
  if (img && img.getAttribute('src')) {
    const image = document.createElement('img');
    image.src = img.getAttribute('src');
    image.alt = img.getAttribute('alt') || img.getAttribute('title') || '';
    cells.push([image]);
  }

  // Text row
  const textCell = [];

  // Eyebrow: a short paragraph above the heading
  const pretitle = element.querySelector('.cmp-teaser__pretitle');
  if (text(pretitle)) {
    const p = document.createElement('p');
    p.textContent = text(pretitle);
    textCell.push(p);
  }

  const titleEl = element.querySelector('.cmp-teaser__title');
  if (text(titleEl)) {
    const level = /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : 'h2';
    const heading = document.createElement(level);
    const titleLink = titleEl.querySelector('a[href]');
    if (titleLink) {
      const a = document.createElement('a');
      a.href = titleLink.getAttribute('href');
      a.textContent = text(titleEl);
      heading.append(a);
    } else {
      heading.textContent = text(titleEl);
    }
    textCell.push(heading);
  }

  const desc = element.querySelector('.cmp-teaser__description');
  if (text(desc)) {
    const paras = [...desc.querySelectorAll('p')].filter((p) => text(p));
    if (paras.length) {
      paras.forEach((p) => textCell.push(p));
    } else {
      const p = document.createElement('p');
      p.textContent = text(desc);
      textCell.push(p);
    }
  }

  element.querySelectorAll('.cmp-teaser__action-link[href]').forEach((link) => {
    if (!text(link)) return;
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.textContent = text(link);
    p.append(a);
    textCell.push(p);
  });

  if (textCell.length) cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
