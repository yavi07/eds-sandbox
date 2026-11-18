/* eslint-disable */
/* global WebImporter */
/**
 * Parser: adventure-fact
 * Source: AEM core content fragment rendered as elements
 * (div.contentfragment.cmp-contentfragment--elements > article > dl.cmp-contentfragment__elements
 *  > div.cmp-contentfragment__element > dt label + dd value).
 * The element may also be a single div.cmp-contentfragment__element (one row).
 * Target: one row per fact -> [label cell, value cell].
 * The hidden fragment title (h3.cmp-contentfragment__title) is dropped.
 */
export default function parse(element, { document }) {
  const cells = [];
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  // A single fact row claimed by a page-scoped catalog selector stands for its whole fragment:
  // parse every row of the fragment into one block and replace the fragment, so the later rows
  // (claimed separately) are no longer in the page when the import script reaches them.
  if (element.matches('.cmp-contentfragment__element')) {
    const fragment = element.closest('div.contentfragment, .cmp-contentfragment');
    if (fragment && fragment !== element) {
      parse(fragment, { document });
      return;
    }
  }

  let items;
  if (element.matches('.cmp-contentfragment__element')) {
    items = [element];
  } else {
    items = [...element.querySelectorAll('.cmp-contentfragment__element')];
    if (!items.length) {
      // Fallback: bare dt/dd pairs in document order.
      items = [...element.querySelectorAll('dt')].map((dt) => {
        const wrap = document.createElement('div');
        const dd = dt.nextElementSibling && dt.nextElementSibling.matches('dd') ? dt.nextElementSibling : null;
        wrap.append(dt.cloneNode(true));
        if (dd) wrap.append(dd.cloneNode(true));
        return wrap;
      });
    }
  }

  items.forEach((item) => {
    const dt = item.querySelector('dt, .cmp-contentfragment__element-title');
    const dd = item.querySelector('dd, .cmp-contentfragment__element-value');
    const label = text(dt);

    let value = '';
    if (dd) {
      const rich = [...dd.children].filter((c) => text(c) || c.querySelector('img'));
      if (rich.length && rich.some((c) => /^(P|UL|OL|A|IMG|PICTURE|STRONG|EM|B|I)$/.test(c.tagName))) {
        value = rich;
      } else {
        value = text(dd);
      }
    }

    if (!label && (!value || !value.length)) return;
    cells.push([label, value]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'adventure-fact', cells });
  element.replaceWith(block);
}
