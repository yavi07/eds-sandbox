/**
 * accordion-faq: one row per question.
 * Cell 1 = question (label), cell 2 = answer (body). Extra cells are appended to the body.
 */
export default function decorate(block) {
  const items = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    // skip rows authors left empty
    if (!cells.length || (!row.textContent.trim() && !row.querySelector('picture, img'))) return;

    const [labelCell, ...bodyCells] = cells;
    const details = document.createElement('details');
    details.className = 'accordion-faq-item';

    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    if (labelCell) {
      // headings inside <summary> lose their semantics in some screen readers and break the
      // page outline: keep only the question text (and its anchor id) in the summary
      labelCell.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
        if (heading.id && !summary.id) summary.id = heading.id;
        heading.replaceWith(...heading.childNodes);
      });
      summary.append(...labelCell.childNodes);
    }

    const body = document.createElement('div');
    body.className = 'accordion-faq-item-body';
    bodyCells.forEach((cell) => body.append(...cell.childNodes));

    details.append(summary, body);
    items.push(details);
  });

  block.replaceChildren(...items);
}
