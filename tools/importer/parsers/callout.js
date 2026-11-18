/* eslint-disable */
/* global WebImporter */
/**
 * Parser: callout
 * Source: AEM text component styled as a pull quote
 * (div.text.cmp-text--quote > div.cmp-text > blockquote + optional trailing p).
 * Target (blocks/callout): row 1 = quote text (inline formatting/links kept),
 * row 2 (optional) = attribution, taken from the elements that follow the blockquote.
 * Without a blockquote, the last paragraph is the attribution only if it starts with a dash.
 */
export default function parse(element, { document }) {
  const hasText = (el) => !!(el && (el.textContent.replace(/ /g, ' ').trim() || el.querySelector('img, picture, a')));
  const root = element.querySelector('.cmp-text') || element;

  // Content children of the text component (skip empty nodes and scripts)
  const children = [...root.children].filter((c) => !/^(SCRIPT|STYLE)$/.test(c.tagName) && hasText(c));

  const quoteCell = [];
  const attributionCell = [];
  const quote = children.find((c) => c.tagName === 'BLOCKQUOTE') || root.querySelector('blockquote');

  if (quote) {
    // Unwrap blockquote content into a paragraph so inline formatting (b/i/u/a/br) survives
    const p = document.createElement('p');
    p.append(...[...quote.childNodes]);
    quoteCell.push(p);
    let after = false;
    children.forEach((c) => {
      if (c === quote || c.contains(quote)) { after = true; return; }
      (after ? attributionCell : quoteCell).push(c);
    });
    // Content before the blockquote stays in row 1, ahead of the quote
    if (quoteCell.length > 1) quoteCell.push(quoteCell.shift());
  } else {
    quoteCell.push(...children);
    const last = quoteCell[quoteCell.length - 1];
    if (quoteCell.length > 1 && /^\s*[-–—]/.test(last.textContent)) {
      attributionCell.push(quoteCell.pop());
    }
  }

  if (!quoteCell.length) {
    const txt = root.textContent.replace(/\s+/g, ' ').trim();
    if (txt) quoteCell.push(txt);
  }

  const cells = [[quoteCell]];
  if (attributionCell.length) cells.push([attributionCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'callout', cells });
  element.replaceWith(block);
}
