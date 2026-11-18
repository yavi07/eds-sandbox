/* eslint-disable */
/* global WebImporter */
/**
 * Parser: accordion-faq
 * Source: AEM core accordion (div.accordion > .cmp-accordion > .cmp-accordion__item:
 *   h3.cmp-accordion__header > button > span.cmp-accordion__title, then
 *   .cmp-accordion__panel holding a container of text components).
 * Target (accordion convention, 2 columns): one row per item ->
 *   [title cell (question), content cell (answer rich text)].
 */
export default function parse(element, { document }) {
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const cells = [];

  const items = [...element.querySelectorAll('.cmp-accordion__item')]
    .filter((item) => !item.parentElement.closest('.cmp-accordion__item'));

  items.forEach((item) => {
    const title = text(item.querySelector('.cmp-accordion__title'))
      || text(item.querySelector('.cmp-accordion__button'))
      || text(item.querySelector('.cmp-accordion__header'));
    const panel = item.querySelector('.cmp-accordion__panel');
    const content = [];
    if (panel) {
      const parts = [...panel.querySelectorAll('p, ul, ol, h2, h3, h4, h5, h6, blockquote, table, img')]
        .filter((el) => {
          const parent = el.parentElement && el.parentElement.closest('p, ul, ol, blockquote, table');
          return !(parent && panel.contains(parent));
        });
      parts.forEach((el) => {
        if (el.matches('img')) {
          const src = el.getAttribute('src') || (el.getAttribute('data-cmp-src') || '').replace('{.width}', '');
          if (!src) return;
          const img = document.createElement('img');
          img.src = src;
          img.alt = el.getAttribute('alt') || '';
          content.push(img);
          return;
        }
        if (text(el) || el.querySelector('img')) content.push(el);
      });
      if (!content.length && text(panel)) {
        const p = document.createElement('p');
        p.textContent = text(panel);
        content.push(p);
      }
    }
    if (!title && !content.length) return;
    // Keep the source question heading (h3.cmp-accordion__header) in the title cell.
    let titleCell = title;
    if (title) {
      const level = (item.querySelector('.cmp-accordion__header') || {}).tagName || '';
      titleCell = document.createElement(/^H[1-6]$/.test(level) ? level.toLowerCase() : 'h3');
      titleCell.textContent = title;
    }
    cells.push([titleCell, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
