import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * columns-author-bio: author headshot, name/role and social links side by side.
 * One row, cells in any order: a picture-only cell (headshot), a text cell
 * (name heading + role) and a links-only cell (social profiles).
 * Cells are classified by content, so authors may omit or reorder them.
 */

const NETWORKS = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'pinterest', 'tiktok'];

function detectNetwork(a) {
  let host = '';
  try {
    host = new URL(a.href, window.location.href).hostname.replace(/^www\./, '');
  } catch (e) {
    // ignore malformed URLs
  }
  const text = a.textContent.trim().toLowerCase();
  if (host === 'x.com' || text === 'x') return 'twitter';
  return NETWORKS.find((n) => host.includes(n) || text.includes(n));
}

function isLinksOnly(cell) {
  const links = cell.querySelectorAll('a');
  if (!links.length) return false;
  const linkText = [...links].map((a) => a.textContent).join('').replace(/\s/g, '');
  return cell.textContent.replace(/\s/g, '') === linkText;
}

export default function decorate(block) {
  const cells = [...block.children]
    .flatMap((row) => [...row.children])
    .filter((c) => c.textContent.trim() || c.querySelector('picture, img, a'));

  const wrapper = document.createElement('div');
  wrapper.className = 'columns-author-bio-row';

  cells.forEach((cell) => {
    if (cell.querySelector('picture, img') && !cell.textContent.trim()) {
      cell.className = 'columns-author-bio-image';
    } else if (isLinksOnly(cell)) {
      cell.className = 'columns-author-bio-social';
      const list = document.createElement('ul');
      cell.querySelectorAll('a').forEach((a) => {
        a.classList.remove('button', 'primary', 'secondary');
        const network = detectNetwork(a);
        if (network) {
          a.dataset.network = network;
          if (!a.getAttribute('aria-label')) a.setAttribute('aria-label', network);
        }
        const li = document.createElement('li');
        li.append(a);
        list.append(li);
      });
      cell.replaceChildren(list);
    } else {
      cell.className = 'columns-author-bio-text';
    }
    wrapper.append(cell);
  });

  wrapper.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]));
  });

  block.replaceChildren(wrapper);
}
