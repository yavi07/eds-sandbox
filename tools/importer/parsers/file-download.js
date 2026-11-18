/* eslint-disable */
/* global WebImporter */
/**
 * Parser: file-download
 * Source: AEM core download component
 * (div.download > div.cmp-download > h3.cmp-download__title, div.cmp-download__description,
 *  dl.cmp-download__properties [filename|size|format], a.cmp-download__action).
 * Target (blocks/file-download): one row per file = link (text = file name) | size | type.
 * The block only renders link/size/type, so the component title and description are kept
 * as default content (heading + paragraphs) placed directly before the block.
 * Asset links stay absolute on https://wknd.site (DAM assets are not migrated).
 */
export default function parse(element, { document }) {
  // A page-scoped catalog selector may claim only part of the component (e.g. its dl of file
  // details): parse the whole download component instead.
  const component = element.closest('div.download');
  if (component && component !== element) {
    parse(component, { document });
    return;
  }
  const ORIGIN = 'https://wknd.site';
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const root = element.querySelector('.cmp-download') || element;

  const absolute = (href) => {
    if (!href) return '';
    try {
      return new URL(href, ORIGIN).href;
    } catch (e) {
      return href;
    }
  };

  const prop = (name) => {
    const el = root.querySelector(`.cmp-download__property--${name} dd, .cmp-download__property--${name} .cmp-download__property-content`);
    return text(el);
  };

  const titleEl = root.querySelector('.cmp-download__title');
  const titleLink = root.querySelector('a.cmp-download__title-link');
  const actionLink = root.querySelector('a.cmp-download__action');
  const anyLink = root.querySelector('a[href]');
  const srcLink = actionLink || titleLink || anyLink;
  const href = absolute(srcLink && srcLink.getAttribute('href'));

  const filename = prop('filename');
  const size = prop('size');
  const format = prop('format');

  // Default content preceding the block: title + description
  const before = [];
  const title = text(titleEl);
  if (title) {
    const h = document.createElement(/^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName : 'h3');
    h.textContent = title;
    before.push(h);
  }
  const desc = root.querySelector('.cmp-download__description');
  if (desc && text(desc)) {
    const paras = [...desc.children].filter((c) => text(c));
    if (paras.length) before.push(...paras);
    else {
      const p = document.createElement('p');
      p.textContent = text(desc);
      before.push(p);
    }
  }

  const cells = [];
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    const fallbackName = (() => {
      try {
        return decodeURIComponent(new URL(href).pathname.split('/').pop().replace(/\.coredownload\.[a-z0-9]+$/i, ''));
      } catch (e) {
        return '';
      }
    })();
    a.textContent = filename || fallbackName || text(srcLink) || href;
    const label = text(actionLink) || title;
    if (label && label !== a.textContent) a.title = label;
    cells.push([a, size, format]);
  }

  if (!cells.length) {
    // Nothing downloadable (e.g. an unconfigured, empty download component on western-australia):
    // keep whatever text exists rather than emitting an empty block
    if (before.length) element.replaceWith(...before);
    else element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'file-download', cells });
  element.replaceWith(...before, block);
}
