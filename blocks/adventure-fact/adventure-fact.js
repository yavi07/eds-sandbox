/**
 * adventure-fact: label/value trip facts (e.g. "Activity" / "Rock Climbing").
 * Each row is one fact: cell 1 = label, cell 2 = value.
 * A single-cell row is read as: first paragraph = label, remaining content = value
 * (or, if it has only one paragraph, a value with no label).
 */
export default function decorate(block) {
  const dl = document.createElement('dl');
  dl.className = 'adventure-fact-list';

  [...block.children].forEach((row) => {
    const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('a, picture'));
    if (!cells.length) return;

    const dt = document.createElement('dt');
    dt.className = 'adventure-fact-label';
    const dd = document.createElement('dd');
    dd.className = 'adventure-fact-value';

    if (cells.length >= 2) {
      dt.append(...cells[0].childNodes);
      cells.slice(1).forEach((cell) => dd.append(...cell.childNodes));
    } else {
      const parts = [...cells[0].children];
      if (parts.length >= 2) {
        dt.append(...parts[0].childNodes);
        parts.slice(1).forEach((p) => dd.append(p));
      } else {
        dd.append(...cells[0].childNodes);
      }
    }

    // a lone paragraph adds nothing inside dt/dd; unwrap it so the text sits directly in the term
    [dt, dd].forEach((el) => {
      const only = el.children.length === 1 ? el.firstElementChild : null;
      if (only && only.tagName === 'P' && !el.textContent.replace(only.textContent, '').trim()) {
        only.replaceWith(...only.childNodes);
      }
    });

    const item = document.createElement('div');
    item.className = 'adventure-fact-item';
    if (dt.textContent.trim()) item.append(dt);
    item.append(dd);
    dl.append(item);
  });

  block.replaceChildren(dl);
}
