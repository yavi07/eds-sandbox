import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
  readBlockConfig,
  toCamelCase,
  toClassName,
  getMetadata,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Applies Section Metadata (style → section classes, other keys → data attributes) and removes
 * the metadata block. The vendored aem.js decorateSections does not handle it.
 * @param {Element} main The container element
 */
function decorateSectionMetadata(main) {
  main.querySelectorAll(':scope > .section').forEach((section) => {
    section.querySelectorAll('div.section-metadata').forEach((meta) => {
      const config = readBlockConfig(meta);
      Object.keys(config).forEach((key) => {
        if (key === 'style') {
          String(config.style).split(',').map((v) => toClassName(v.trim())).filter(Boolean)
            .forEach((cls) => section.classList.add(cls));
        } else {
          section.dataset[toCamelCase(key)] = config[key];
        }
      });
      const wrapper = meta.parentElement;
      meta.remove();
      if (wrapper && wrapper !== section && !wrapper.children.length) wrapper.remove();
    });
  });
}

/**
 * Aside sections (Style "aside"): the last default content that starts with a heading, and
 * everything after it, form the right column; everything before it forms the main column.
 * @param {Element} main The container element
 */
function decorateAsideSections(main) {
  main.querySelectorAll(':scope > .section.aside').forEach((section) => {
    const wrappers = [...section.children];
    let start = -1;
    wrappers.forEach((wrapper, i) => {
      const first = wrapper.firstElementChild;
      if (wrapper.classList.contains('default-content-wrapper') && first && /^H[1-6]$/.test(first.tagName)) {
        start = i;
      }
    });
    if (start <= 0) return;
    const content = document.createElement('div');
    content.className = 'section-main';
    content.append(...wrappers.slice(0, start));
    const aside = document.createElement('div');
    aside.className = 'section-aside';
    aside.append(...wrappers.slice(start));
    section.append(content, aside);
  });
}

/**
 * Gives a page without an authored H1 a screen-reader-only one from the page title,
 * so every page has a main heading. An authored H1 always wins.
 * @param {Element} main The main element
 */
function ensurePageHeading(main) {
  if (main.querySelector('h1')) return;
  const title = getMetadata('og:title') || document.title;
  if (!title) return;
  const h1 = document.createElement('h1');
  h1.className = 'visually-hidden';
  h1.textContent = title;
  main.prepend(h1);
}

/**
 * Keeps the heading outline sequential. Authored default-content headings that skip
 * levels (e.g. an H5 "Share this Adventure" label right after the H1) are re-levelled to
 * one below the previous heading; a `heading-hN` class keeps their original look.
 * Headings inside blocks are left out: blocks run later and may restructure or remove them
 * (e.g. accordion-faq unwraps its question headings), so each block owns its own levels.
 * @param {Element} main The main element
 */
function fixHeadingOrder(main) {
  // the screen-reader H1 from ensurePageHeading sits directly in main and starts the outline
  let previous = main.querySelector(':scope > h1') ? 1 : 0;
  main.querySelectorAll('.default-content-wrapper > :is(h1, h2, h3, h4, h5, h6)').forEach((heading) => {
    const level = Number(heading.tagName[1]);
    // never re-level into a second H1: headings before the first one are left as authored
    if (previous === 0 || level <= previous + 1) {
      previous = level;
      return;
    }
    const fixed = document.createElement(`h${previous + 1}`);
    [...heading.attributes].forEach(({ name, value }) => fixed.setAttribute(name, value));
    fixed.classList.add(`heading-h${level}`);
    fixed.append(...heading.childNodes);
    heading.replaceWith(fixed);
    previous += 1;
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateSectionMetadata(main);
  // blocks first: decorateBlocks only finds blocks at section > wrapper > block
  decorateBlocks(main);
  decorateAsideSections(main);
  ensurePageHeading(main);
  fixHeadingOrder(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('body > header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  import('./consent-check.js');
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
