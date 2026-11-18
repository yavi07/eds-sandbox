import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * hero-teaser: promotes one item with an image, title, description and CTA.
 * Content: an image (own row or cell) + text (optional eyebrow paragraph,
 * heading, description, CTA link). Rows/cells may be in any order.
 * Default: full-width background image with an overlapping text box.
 * Option `image-beside-text-panel`: image and text panel side by side.
 */
export default function decorate(block) {
  const cells = [...block.children]
    .flatMap((row) => [...row.children])
    .filter((c) => c.textContent.trim() || c.querySelector('picture, img'));

  const media = document.createElement('div');
  media.className = 'hero-teaser-image';
  const content = document.createElement('div');
  content.className = 'hero-teaser-content';

  cells.forEach((cell) => {
    const pic = !media.children.length && (cell.querySelector('picture') || cell.querySelector('img'));
    if (pic) {
      // a picture wrapped in a paragraph: drop the empty wrapper
      const wrap = pic.parentElement;
      media.append(pic);
      if (wrap !== cell && !wrap.textContent.trim() && !wrap.children.length) wrap.remove();
    }
    if (cell.textContent.trim()) content.append(...cell.childNodes);
  });

  // a short paragraph before the first heading is an eyebrow ("Featured Article")
  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    let prev = heading.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'P' && !prev.querySelector('a')) prev.classList.add('hero-teaser-eyebrow');
      prev = prev.previousElementSibling;
    }
  }

  // a paragraph holding only a link is the call to action (rendered as a button)
  content.querySelectorAll(':scope > p').forEach((p) => {
    const link = p.querySelector('a');
    if (link && p.textContent.trim() === link.textContent.trim()) p.classList.add('hero-teaser-cta');
  });

  media.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, true, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]));
  });

  const children = [];
  if (media.children.length) children.push(media);
  else block.classList.add('no-image');
  if (content.children.length) children.push(content);
  block.replaceChildren(...children);
}
