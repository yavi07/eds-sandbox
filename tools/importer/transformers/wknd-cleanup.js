/* eslint-disable */
/* global WebImporter */

/**
 * WKND (wknd.site, AEM core components) cleanup transformer.
 *
 * beforeTransform: ONLY replays catalog removals (selectors were captured with the site
 * header/footer still in place, so nothing else may be removed before block discovery).
 *   1. payload.template.pageCleanup[pageUrl]: each selector in order; remove the element when it
 *      matches exactly one, skip when it matches none or several.
 *   2. catalog-template.json cleanup.rules[] (late popups etc.) outside <main>, only for pages
 *      not listed in pageCleanup.
 *
 * afterTransform: removes site chrome (header/footer experience fragments, language selector,
 * sign-in, skip links, consent, tracking iframes/scripts/noscript/link) and tracking attributes.
 */

// Snapshot of migration-work/catalog-template.json cleanup.rules[] (one { rule, type, pages }
// per rule). Empty for the homepage template. A template can also pass its own list as
// payload.template.cleanupRules; that takes precedence.
const CATALOG_CLEANUP_RULES = [];

function pageKey(u) {
  try {
    const { origin, pathname } = new URL(u);
    return `${origin}${pathname.replace(/\/$/, '')}`;
  } catch (e) {
    return u;
  }
}

function pageUrl(payload, document) {
  return payload.params?.originalURL
    || payload.url
    || payload.params?.url
    || document?.location?.href
    || '';
}

function safeQueryAll(root, selector) {
  try {
    return [...root.querySelectorAll(selector)];
  } catch (e) {
    return [];
  }
}

function replayCatalogCleanup(element, payload) {
  const document = payload.document || element.ownerDocument;
  const template = payload.template || {};
  const key = pageKey(pageUrl(payload, document));

  const entry = Object.entries(template.pageCleanup || {}).find(([u]) => pageKey(u) === key);

  if (entry) {
    // In-order replay: each selector was computed right before its removal.
    (entry[1] || []).forEach((item) => {
      const selector = typeof item === 'string' ? item : item?.selector;
      if (!selector) return;
      const matches = safeQueryAll(document, selector);
      if (matches.length === 1) matches[0].remove();
    });
    return;
  }

  // Page not listed: apply generic catalog rules, but never inside <main>.
  const rules = template.cleanupRules || CATALOG_CLEANUP_RULES;
  rules.forEach((r) => {
    const selector = typeof r === 'string' ? r : r?.rule || r?.selector;
    if (!selector) return;
    safeQueryAll(document, selector).forEach((el) => {
      if (el.isConnected && !el.closest('main')) el.remove();
    });
  });
}

const CHROME_SELECTORS = [
  // Header experience fragment (logo, nav, search, language/region selector, sign-in)
  'header',
  '.experiencefragment.cmp-experiencefragment--header',
  '.cmp-experiencefragment--header',
  '.cmp-layoutcontainer--header',
  '.languagenavigation',
  '.cmp-languagenavigation',
  '.cmp-languagenavigation--langnavtoggle',
  '.navigation.cmp-navigation--header',
  '#mobileNav',
  '.cmp-navigation--mobile',
  '.sign-in-buttons',
  '.wknd-sign-in-buttons',
  '.cmp-button--header-search',
  // Footer experience fragment
  'footer',
  '.experiencefragment.cmp-experiencefragment--footer',
  '.cmp-experiencefragment--footer',
  '.cmp-layoutcontainer--footer',
  '.cmp-navigation--footer',
  // Generic nav / skip links / modals
  'nav',
  'a.skip-link',
  'a[href="#main"]',
  'a[href="#content"]',
  '[class*="skip-to"]',
  '[class*="skiplink"]',
  // Cookie / consent
  '#onetrust-consent-sdk',
  '#onetrust-banner-sdk',
  '[id*="cookie" i]',
  '[class*="cookie" i]',
  '[id*="consent" i]',
  '[class*="consent" i]',
  '#truste-consent-track',
  // Third-party share widgets (empty Facebook/Pinterest embeds)
  'div.sharing',
  // Content fragment titles render 0x0 on the source (the page title is a separate component)
  '.cmp-contentfragment__title',
  // Tracking / non-authorable tags
  'iframe[src*="demdex.net"]',
  'iframe[id^="destination_publishing_iframe"]',
  'iframe[src*="doubleclick"]',
  'iframe[src*="googletagmanager"]',
  'script',
  'noscript',
  'style',
  'link',
];

const TRACKING_ATTRIBUTES = [
  'data-cmp-data-layer',
  'data-cmp-clickable',
  'data-cmp-link-accessibility-enabled',
  'data-cmp-link-accessibility-text',
  'data-cmp-data-layer-enabled',
  'data-cmp-data-layer-name',
  'data-lang-nav-processed',
  'data-modal-url',
  'data-current-user-url',
];

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    replayCatalogCleanup(element, payload);
  }

  if (hookName === 'afterTransform') {
    authorBreadcrumbs(element);
    authorLinkLists(element);
    WebImporter.DOMUtils.remove(element, CHROME_SELECTORS);

    TRACKING_ATTRIBUTES.forEach((attr) => {
      element.querySelectorAll(`[${attr}]`).forEach((el) => el.removeAttribute(attr));
    });

    authorButtons(element);
    rewriteInternalLinks(element);
  }
}

// AEM breadcrumb (nav.cmp-breadcrumb > ol > li) becomes a plain authored list (linked ancestors,
// then the current page as text) before the generic `nav` chrome removal runs; the section style
// "breadcrumb" renders it inline.
function authorBreadcrumbs(element) {
  const doc = element.ownerDocument || document;
  element.querySelectorAll('nav.cmp-breadcrumb').forEach((nav) => {
    const ul = doc.createElement('ul');
    nav.querySelectorAll('li.cmp-breadcrumb__item').forEach((item) => {
      const label = item.textContent.replace(/\s+/g, ' ').trim();
      if (!label) return;
      const li = doc.createElement('li');
      const link = item.querySelector('a[href]');
      if (link) {
        const a = doc.createElement('a');
        a.setAttribute('href', link.getAttribute('href'));
        a.textContent = label;
        li.append(a);
      } else {
        li.textContent = label;
      }
      ul.append(li);
    });
    if (ul.children.length) nav.replaceWith(ul);
    else nav.remove();
  });
}

// AEM list component (ul.cmp-list > li > a > title + date spans, e.g. the article "up next"
// sidebar) becomes a plain authored list: linked title, line break, date.
function authorLinkLists(element) {
  const doc = element.ownerDocument || document;
  element.querySelectorAll('ul.cmp-list').forEach((list) => {
    if (list.closest('table')) return;
    const ul = doc.createElement('ul');
    list.querySelectorAll(':scope > li.cmp-list__item').forEach((item) => {
      const link = item.querySelector('a[href]');
      const title = (item.querySelector('.cmp-list__item-title') || link || item).textContent.replace(/\s+/g, ' ').trim();
      if (!title) return;
      const li = doc.createElement('li');
      if (link) {
        const a = doc.createElement('a');
        a.setAttribute('href', link.getAttribute('href'));
        a.textContent = title;
        li.append(a);
      } else {
        li.append(title);
      }
      const date = item.querySelector('.cmp-list__item-date');
      if (date && date.textContent.trim()) {
        li.append(doc.createElement('br'), date.textContent.replace(/\s+/g, ' ').trim());
      }
      ul.append(li);
    });
    if (ul.children.length) list.replaceWith(ul);
  });
}

// AEM core buttons (a.cmp-button in a .button component) become authored EDS buttons: the project's
// decorateButtons needs <strong> (primary) or <em> (secondary) around a link alone in its paragraph.
function authorButtons(element) {
  const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
  element.querySelectorAll('a.cmp-button').forEach((a) => {
    if (a.closest('table')) return; // already inside a parsed block
    const text = (a.querySelector('.cmp-button__text') || a).textContent.trim();
    if (!text) return;
    const component = a.closest('.button');
    const primary = !component || component.classList.contains('cmp-button--primary')
      || !component.className.includes('cmp-button--');
    const link = document.createElement('a');
    link.setAttribute('href', a.getAttribute('href') || '#');
    link.textContent = text;
    const wrap = document.createElement(primary ? 'strong' : 'em');
    wrap.append(link);
    const p = document.createElement('p');
    p.append(wrap);
    (component && !component.querySelector('table') ? component : a).replaceWith(p);
  });
}

// EDS pages have no .html extension: rewrite same-site page links (relative or https://wknd.site)
// to extensionless, site-relative paths. Asset links (/content/dam/...) are left as they are.
function rewriteInternalLinks(element) {
  element.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) return;
    let url;
    try { url = new URL(href, 'https://wknd.site'); } catch (e) { return; }
    if (url.hostname !== 'wknd.site' && url.hostname !== 'www.wknd.site') return;
    if (url.pathname.startsWith('/content/dam/')) return;
    if (!/\.html$/i.test(url.pathname)) return;
    const path = url.pathname.replace(/\.html$/i, '');
    a.setAttribute('href', `${path}${url.search}${url.hash}`);
  });
}
