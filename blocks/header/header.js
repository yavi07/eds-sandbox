// desktop layout (horizontal nav, no hamburger) starts at 1200px
const isDesktop = window.matchMedia('(min-width: 1200px)');

/**
 * Fetches the nav fragment. Metadata-independent dual fetch:
 * /content/nav.plain.html (local aem up) first, then /nav.plain.html (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchNav() {
  const paths = ['/content/nav.plain.html', '/nav.plain.html'];
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
 * Rewrites relative image paths in the fragment against the fragment URL
 * so `images/x.svg` resolves next to wherever nav.plain.html was served from.
 * @param {Element} root fragment root
 * @param {string} base fragment URL
 */
function resolveImages(root, base) {
  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:|data:|\/)/.test(src)) img.src = new URL(src, base).href;
    img.loading = 'eager';
  });
}

/**
 * Normalizes a path for comparison (drops .html and trailing slash).
 * @param {string} href link href
 * @returns {string} normalized pathname, or '' for external links
 */
function normalizePath(href) {
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return '';
    return url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  } catch (e) {
    return '';
  }
}

/** Current page path without the local /content prefix. */
function currentPath() {
  return normalizePath(window.location.href).replace(/^\/content(?=\/)/, '');
}

/**
 * Wraps the direct text of a list item (its label) in a span.
 * @param {Element} li list item
 * @param {string} className class for the label span
 */
function wrapLabel(li, className) {
  const span = document.createElement('span');
  span.className = className;
  [...li.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      span.textContent += node.textContent.trim();
      node.remove();
    }
  });
  const img = li.querySelector(':scope > img, :scope > picture');
  if (img) img.after(span);
  else li.prepend(span);
}

/**
 * Builds the locale picker (toggle + dropdown) from a list of
 * country items, each with a flag image, a label and a nested list of links.
 * @param {Element} list the locale list from the fragment
 * @returns {Element} locale picker element
 */
function buildLocalePicker(list) {
  const picker = document.createElement('div');
  picker.className = 'nav-locale';

  list.classList.add('nav-locale-list');
  list.querySelectorAll(':scope > li').forEach((li) => {
    li.classList.add('nav-locale-country');
    li.querySelector(':scope > img, :scope > picture')?.classList.add('nav-locale-flag');
    wrapLabel(li, 'nav-locale-country-name');
    li.querySelector(':scope > ul')?.classList.add('nav-locale-languages');
  });

  // current locale = link whose path prefixes the current page path, else first link
  const links = [...list.querySelectorAll('a')];
  const here = currentPath();
  const current = links
    .filter((a) => {
      const p = normalizePath(a.href);
      return p && (here === p || here.startsWith(`${p}/`));
    })
    .sort((a, b) => normalizePath(b.href).length - normalizePath(a.href).length)[0] || links[0];
  if (current) {
    current.classList.add('active');
    current.setAttribute('aria-current', 'true');
  }

  const toggle = document.createElement('a');
  toggle.className = 'nav-locale-toggle';
  toggle.href = '#locale';
  toggle.setAttribute('role', 'button');
  toggle.setAttribute('aria-expanded', 'false');
  const flag = current?.closest('.nav-locale-country')?.querySelector('.nav-locale-flag');
  if (flag) {
    const flagClone = flag.cloneNode(true);
    flagClone.className = 'nav-locale-toggle-flag';
    flagClone.alt = '';
    toggle.append(flagClone);
  }
  const label = document.createElement('span');
  label.className = 'nav-locale-toggle-label';
  label.textContent = current ? current.textContent.trim() : '';
  toggle.append(label);
  toggle.setAttribute('aria-label', `Toggle Language ${label.textContent}`);

  const dropdown = document.createElement('div');
  dropdown.className = 'nav-locale-dropdown';
  dropdown.append(list);

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    picker.classList.remove('open');
  };
  const position = () => {
    // panel sits 240px left of the toggle start (source geometry), kept inside the viewport
    const rect = toggle.getBoundingClientRect();
    const width = dropdown.offsetWidth || 360;
    const maxLeft = document.documentElement.clientWidth - width;
    const left = Math.max(0, Math.min(rect.left - 240, maxLeft));
    dropdown.style.left = `${Math.round(left)}px`;
  };
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    picker.classList.toggle('open', open);
    if (open) position();
  });
  document.addEventListener('click', (e) => {
    if (!picker.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') close();
  });
  window.addEventListener('resize', () => {
    if (picker.classList.contains('open')) position();
  });

  picker.append(toggle, dropdown);
  return picker;
}

/**
 * Marks links pointing at the current page (or its section) as active.
 * @param {Element} root container with links
 */
function markActive(root) {
  const here = currentPath();
  root.querySelectorAll('a').forEach((a) => {
    const p = normalizePath(a.href);
    if (!p) return;
    const isTop = a.closest('li')?.querySelector(':scope > ul');
    const active = isTop ? here === p : (here === p || here.startsWith(`${p}/`));
    if (active) {
      a.closest('li').classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
}

/**
 * Opens or closes the mobile drawer.
 * @param {Element} nav nav element
 * @param {boolean} [force] desired state
 */
function toggleDrawer(nav, force) {
  const open = force !== undefined ? force : !nav.classList.contains('drawer-open');
  nav.classList.toggle('drawer-open', open);
  const button = nav.querySelector('.nav-hamburger button');
  if (button) {
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  // source pushes the page right by the drawer width while the drawer is open
  const shift = open ? 'translateX(275px)' : '';
  document.querySelectorAll('body > main, body > footer').forEach((el) => {
    el.style.transition = 'transform 0.5s';
    el.style.transform = shift;
  });
  document.body.style.overflowY = open ? 'hidden' : '';
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const tmp = document.createElement('div');
  tmp.innerHTML = fragment.html;
  resolveImages(tmp, fragment.base);
  const sections = [...tmp.children].filter((el) => el.tagName === 'DIV');

  // identify sections by content, not position
  const utility = sections.find((s) => s.querySelector('ul ul a') && s.querySelector('ul > li > img, ul > li > picture'));
  const brand = sections.find((s) => s !== utility && s.querySelector('a img') && !s.querySelector('ul'));
  const navList = sections.find((s) => s !== utility && s.querySelector(':scope > ul'));
  const tools = sections.find((s) => ![utility, brand, navList].includes(s));

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  // utility row: sign in + locale picker
  const utilityRow = document.createElement('div');
  utilityRow.className = 'nav-utility';
  const utilityInner = document.createElement('div');
  utilityInner.className = 'nav-utility-inner';
  if (utility) {
    const signIn = document.createElement('div');
    signIn.className = 'nav-signin';
    utility.querySelectorAll(':scope > p').forEach((p) => signIn.append(...p.childNodes));
    // sign in is look-only in this migration
    signIn.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
    utilityInner.append(signIn);
    const list = utility.querySelector(':scope > ul');
    if (list) utilityInner.append(buildLocalePicker(list));
  }
  utilityRow.append(utilityInner);

  // main row: hamburger + logo + sections + tools
  const mainRow = document.createElement('div');
  mainRow.className = 'nav-main';
  const mainInner = document.createElement('div');
  mainInner.className = 'nav-main-inner';

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav-drawer" aria-expanded="false" aria-label="Open navigation">
      <span class="nav-hamburger-icon"><span></span><span></span><span></span></span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleDrawer(nav));
  mainInner.append(hamburger);

  if (brand) {
    const brandEl = document.createElement('div');
    brandEl.className = 'nav-brand';
    brandEl.append(...(brand.querySelector('p') || brand).childNodes);
    mainInner.append(brandEl);
  }

  let drawer;
  if (navList) {
    const sectionsEl = document.createElement('nav');
    sectionsEl.className = 'nav-sections';
    sectionsEl.setAttribute('aria-label', 'Site sections');
    const list = navList.querySelector(':scope > ul');
    markActive(list);
    // items that carry a nested list are parents (e.g. Home): shown in the drawer only
    list.querySelectorAll(':scope > li').forEach((li) => {
      if (li.querySelector(':scope > ul')) li.classList.add('nav-parent');
    });

    // drawer (mobile/tablet): flat list of all links
    drawer = document.createElement('div');
    drawer.className = 'nav-drawer';
    drawer.id = 'nav-drawer';
    const drawerList = document.createElement('ul');
    list.querySelectorAll('li').forEach((li) => {
      const link = li.querySelector(':scope > a');
      if (!link) return;
      const item = document.createElement('li');
      if (li.classList.contains('active')) item.classList.add('active');
      item.append(link.cloneNode(true));
      drawerList.append(item);
    });
    drawer.append(drawerList);

    sectionsEl.append(list);
    mainInner.append(sectionsEl);
  }

  if (tools) {
    const toolsEl = document.createElement('div');
    toolsEl.className = 'nav-tools';
    tools.querySelectorAll(':scope > p').forEach((p) => toolsEl.append(...p.childNodes));
    toolsEl.querySelectorAll('a').forEach((a) => {
      if (a.querySelector('img') && !a.getAttribute('aria-label')) {
        a.setAttribute('aria-label', a.title || a.querySelector('img').alt || 'Search');
      }
      if (normalizePath(a.href) && normalizePath(a.href) === currentPath()) a.classList.add('active');
    });
    mainInner.append(toolsEl);
  }

  mainRow.append(mainInner);
  nav.append(utilityRow, mainRow);
  if (drawer) nav.append(drawer);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // scrolled state: main row shrinks and gains a shadow
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 0);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // close the drawer on Escape / when crossing to desktop width
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && nav.classList.contains('drawer-open')) toggleDrawer(nav, false);
  });
  isDesktop.addEventListener('change', () => {
    toggleDrawer(nav, false);
    nav.querySelector('.nav-locale.open .nav-locale-toggle')?.click();
  });
}
