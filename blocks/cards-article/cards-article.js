import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

/**
 * cards-article: grid of article/adventure teasers.
 * Each row = one card: image cell + body cell (title, description, link).
 * Option `category-filter-tabs`: each row may add a further cell listing the
 * card's categories (comma-separated plain text). A tab bar ("All" + every
 * category in authored order) filters the cards client-side. An optional first
 * row with a single plain-text cell lists the tab labels in order; its first
 * label names the "show all" tab (e.g. "All, Climbing, Cycling").
 */

const SOCIAL_NETWORKS = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'pinterest'];

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

function isCategoryCell(cell) {
  return !cell.querySelector('picture, img, a, h1, h2, h3, h4, h5, h6')
    && cell.textContent.trim() !== '';
}

function parseCategories(cell) {
  return cell.textContent.split(/[,;\n]/).map((c) => c.trim()).filter(Boolean);
}

function buildFilterTabs(block, ul, categories, allLabel = 'All') {
  const tablist = document.createElement('div');
  tablist.className = 'cards-article-filters';
  tablist.setAttribute('role', 'toolbar');
  tablist.setAttribute('aria-label', 'Filter by category');

  const all = { key: 'all', label: allLabel };
  [all, ...categories].forEach(({ key, label }, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cards-article-filter';
    button.dataset.filter = key;
    button.textContent = label;
    button.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    button.addEventListener('click', () => {
      tablist.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === button ? 'true' : 'false'));
      ul.querySelectorAll(':scope > li').forEach((li) => {
        const cats = (li.dataset.categories || '').split(' ');
        li.hidden = key !== 'all' && !cats.includes(key);
      });
    });
    tablist.append(button);
  });

  block.prepend(tablist);
}

export default function decorate(block) {
  const withFilters = block.classList.contains('category-filter-tabs');
  const categories = new Map();

  const ul = document.createElement('ul');
  ul.className = 'cards-article-list';

  // optional tab-order row (filter option only): one plain-text cell, no image/link/heading
  let allLabel;
  const [firstRow] = block.children;
  if (withFilters && firstRow) {
    const filled = [...firstRow.children].filter((c) => c.textContent.trim() || c.querySelector('picture, img, a'));
    if (filled.length === 1 && isCategoryCell(filled[0])) {
      const [first, ...labels] = parseCategories(filled[0]);
      allLabel = first;
      labels.forEach((label) => {
        const key = toClassName(label);
        if (key && !categories.has(key)) categories.set(key, label);
      });
      firstRow.remove();
    }
  }

  [...block.children].forEach((row) => {
    const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('picture, img, a'));
    if (!cells.length) return;

    const li = document.createElement('li');
    li.className = 'cards-article-card';

    // category cell: a trailing plain-text cell after the body cell (filter option only)
    const textCells = cells.filter((c) => c.textContent.trim());
    if (withFilters && textCells.length > 1 && isCategoryCell(cells[cells.length - 1])) {
      const cats = parseCategories(cells.pop());
      const keys = cats.map((label) => {
        const key = toClassName(label);
        if (key && !categories.has(key)) categories.set(key, label);
        return key;
      }).filter(Boolean);
      li.dataset.categories = keys.join(' ');
    }

    const body = document.createElement('div');
    body.className = 'cards-article-card-body';
    cells.forEach((cell) => {
      const onlyPicture = cell.querySelector('picture, img') && !cell.textContent.trim();
      if (onlyPicture && !li.querySelector('.cards-article-card-image')) {
        cell.className = 'cards-article-card-image';
        li.append(cell);
      } else {
        body.append(...cell.childNodes);
      }
    });
    if (body.childNodes.length) li.append(body);

    // title text gets its own span (as on the source teaser) so the link and label style apart
    body.querySelectorAll(':scope > :is(h1, h2, h3, h4, h5, h6) > a').forEach((a) => {
      const label = document.createElement('span');
      label.className = 'cards-article-card-title';
      label.append(...a.childNodes);
      a.append(label);
    });

    // make the image clickable when the card has a single destination
    const links = [...body.querySelectorAll('a[href]')];
    const hrefs = new Set(links.map((a) => a.href));
    const image = li.querySelector('.cards-article-card-image');
    if (image && hrefs.size === 1 && !image.querySelector('a')) {
      const a = document.createElement('a');
      a.href = links[0].href;
      a.tabIndex = -1;
      a.setAttribute('aria-hidden', 'true');
      a.append(...image.childNodes);
      image.append(a);
    }

    // profile option: a list of links naming a social network becomes an icon bar
    if (block.classList.contains('profile')) {
      body.querySelectorAll(':scope > ul').forEach((list) => {
        const tagged = [...list.querySelectorAll('a[href]')].filter((a) => {
          const network = SOCIAL_NETWORKS.find((n) => `${a.textContent} ${a.href}`.toLowerCase().includes(n));
          if (!network) return false;
          a.classList.add('cards-article-social-link', `cards-article-social-${network}`);
          a.setAttribute('aria-label', a.textContent.trim());
          return true;
        });
        if (tagged.length) list.classList.add('cards-article-social');
      });
    }

    ul.append(li);
  });

  optimizeImages(ul);
  block.replaceChildren(ul);

  if (withFilters && categories.size) {
    buildFilterTabs(block, ul, [...categories].map(([key, label]) => ({ key, label })), allLabel);
  }
}
