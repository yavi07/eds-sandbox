/**
 * callout: boxed pull quote / definition inside article content.
 * Row 1 = quote or callout text (may include a CTA link).
 * Row 2 (optional) = attribution (e.g. "- Sofia Sjoberg").
 * If only one row is authored and its last paragraph starts with a dash, that
 * paragraph is treated as the attribution.
 */
export default function decorate(block) {
  const rows = [...block.children].filter((r) => r.textContent.trim() || r.querySelector('picture, a'));

  const body = document.createElement('div');
  body.className = 'callout-body';
  const attribution = document.createElement('div');
  attribution.className = 'callout-attribution';

  rows.forEach((row, i) => {
    const target = i === 0 ? body : attribution;
    [...row.children].forEach((cell) => target.append(...cell.childNodes));
  });

  if (rows.length === 1) {
    const paragraphs = body.querySelectorAll(':scope > p');
    const last = paragraphs[paragraphs.length - 1];
    if (paragraphs.length > 1 && /^\s*[-–—]/.test(last.textContent)) {
      attribution.append(last);
    }
  }

  const children = [body];
  if (attribution.textContent.trim()) children.push(attribution);
  block.replaceChildren(...children);
}
