/**
 * Fetches the footer fragment. Pages previewed from the local workspace live under /content/,
 * so they read /content/footer.plain.html first; published pages (DA/EDS) only fetch
 * /footer.plain.html, which avoids a 404 request on every page.
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchFooter() {
  const paths = window.location.pathname.startsWith('/content/')
    ? ['/content/footer.plain.html', '/footer.plain.html']
    : ['/footer.plain.html'];
  // eslint-disable-next-line no-restricted-syntax
  for (const path of paths) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(path);
    if (resp.ok) {
      // eslint-disable-next-line no-await-in-loop
      const html = await resp.text();
      return { html, base: new URL(path, window.location.href).href };
    }
  }
  return null;
}

/**
 * Makes the served fragment match the authored one. Edge Delivery wraps list-item content in
 * <p> and turns images into responsive <picture> elements; the footer only holds a logo and
 * small icons, so each picture is replaced by its <img> and a list item's paragraphs unwrapped.
 * @param {Element} root fragment root
 */
function normalizeFragment(root) {
  root.querySelectorAll('picture').forEach((picture) => {
    const img = picture.querySelector('img');
    if (img) picture.replaceWith(img);
  });
  root.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
}

/**
 * Rewrites relative image paths against the fragment URL so `images/x.svg`
 * resolves next to wherever footer.plain.html was served from.
 * @param {Element} root fragment root
 * @param {string} base fragment URL
 */
function resolveImages(root, base) {
  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:|data:|\/)/.test(src)) img.src = new URL(src, base).href;
    // the footer sits below the fold: never compete with the page's main images
    img.loading = 'lazy';
    img.fetchPriority = 'low';
  });
}

/**
 * Normalizes a same-origin href for comparison (drops .html, trailing slash, /content prefix).
 * @param {string} href link href
 * @returns {string} normalized pathname, or '' for external links
 */
function normalizePath(href) {
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return '';
    const p = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    return p.replace(/^\/content(?=\/)/, '');
  } catch (e) {
    return '';
  }
}

/**
 * True if the element holds only linked images (a logo/icon row) and no text.
 * @param {Element} node element
 * @returns {boolean}
 */
function isImageOnly(node) {
  return !!node.querySelector('img') && !node.textContent.trim();
}

/**
 * Creates an element with a class name.
 * @param {string} tag tag name
 * @param {string} className class
 * @returns {Element}
 */
function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

/**
 * Builds the link list as a navigation landmark; nested lists keep their
 * parent link (hidden via CSS) and child links render as the visible row.
 * @param {Element} list ul from the fragment
 * @returns {Element}
 */
function buildNav(list) {
  const nav = el('nav', 'footer-nav');
  nav.setAttribute('aria-label', 'Footer navigation');
  list.querySelectorAll('li').forEach((li) => {
    li.classList.add(li.parentElement.closest('li') ? 'footer-nav-item' : 'footer-nav-parent');
  });
  const here = normalizePath(window.location.href);
  list.querySelectorAll('.footer-nav-item > a').forEach((a) => {
    if (normalizePath(a.href) === here) a.setAttribute('aria-current', 'page');
  });
  nav.append(list);
  return nav;
}

/**
 * Decorates an image-link list (social icons): each link gets an accessible
 * name from its image alt, and the authored icon image becomes a CSS-masked
 * glyph so it takes the footer's icon colour (like the source icon font).
 * @param {Element} list ul from the fragment
 * @returns {Element}
 */
function buildIconList(list) {
  list.classList.add('footer-social');
  list.querySelectorAll('a').forEach((a) => {
    const img = a.querySelector('img');
    if (!img) return;
    if (img.alt && !a.getAttribute('aria-label')) a.setAttribute('aria-label', img.alt);
    const icon = el('span', 'footer-social-icon');
    icon.setAttribute('aria-hidden', 'true');
    icon.style.setProperty('--icon-url', `url("${img.src}")`);
    img.replaceWith(icon);
  });
  return list;
}

/**
 * Loads and decorates the footer.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  // parse in an inert document so no image starts loading before its loading hint is set
  const tmp = new DOMParser().parseFromString(fragment.html, 'text/html').body;
  normalizeFragment(tmp);
  resolveImages(tmp, fragment.base);

  const inner = el('div', 'footer-inner');
  const top = el('div', 'footer-top');
  const legal = el('div', 'footer-legal');

  // each top-level section div contributes its children, classified by shape
  [...tmp.children].forEach((section) => {
    const nodes = section.tagName === 'DIV' ? [...section.children] : [section];
    nodes.forEach((node) => {
      if (/^H[1-6]$/.test(node.tagName)) {
        // the footer starts a new part of the page outline: always an H2 (styled by class)
        const title = el('h2', 'footer-follow-title');
        if (node.id) title.id = node.id;
        title.append(...node.childNodes);
        top.append(title);
      } else if (node.tagName === 'UL' && isImageOnly(node)) {
        top.append(buildIconList(node));
      } else if (node.tagName === 'UL') {
        top.append(buildNav(node));
      } else if (isImageOnly(node) && !top.querySelector('.footer-brand')) {
        node.classList.add('footer-brand');
        top.append(node);
      } else {
        legal.append(node);
      }
    });
  });

  if (top.children.length) inner.append(top);
  if (legal.children.length) inner.append(legal);
  block.append(inner);
}
