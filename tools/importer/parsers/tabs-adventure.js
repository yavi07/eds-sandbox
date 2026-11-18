/* eslint-disable */
/* global WebImporter */
/**
 * Parser: tabs-adventure
 * Source: AEM core tabs (div.tabs.panelcontainer > div.cmp-tabs) with an
 * ol.cmp-tabs__tablist of li[role=tab] labels and one div[role=tabpanel] per tab.
 * Each panel holds a content fragment (article.cmp-contentfragment) whose visible
 * content is rich text (headings, images, paragraphs, lists).
 * Target: one row per tab -> [label cell, panel content cell].
 *
 * Notes:
 * - The hidden fragment title (h3.cmp-contentfragment__title, 0x0 on source) is dropped.
 * - AEM's CF renderer strips DAM links from the rendered rich text; the original
 *   anchors survive only in the fragment's data-cmp-data-layer "xdm:text". They are
 *   restored onto the matching visible text, mapping
 *   /content/dam/wknd-shared/en/adventures/{folder}/{name} -> /us/en/adventures/{name}.html.
 */
const RESTORE_CF_LINKS = false;

export default function parse(element, { document }) {
  const cells = [];
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  const root = element.querySelector('.cmp-tabs') || element;

  // Tab labels, keyed by the panel they control (fallback: document order).
  const tabs = [...root.querySelectorAll('.cmp-tabs__tablist [role="tab"], .cmp-tabs__tablist .cmp-tabs__tab')]
    .filter((t, i, arr) => arr.indexOf(t) === i);
  let panels = [...root.querySelectorAll('[role="tabpanel"]')];
  if (!panels.length) panels = [...root.querySelectorAll('.cmp-tabs__tabpanel')];
  // Only top-level panels of this tabs component (ignore nested tabs, if any).
  panels = panels.filter((p) => !panels.some((o) => o !== p && o.contains(p)));

  const labelFor = (panel, index) => {
    const id = panel.getAttribute('id');
    let tab = id ? tabs.find((t) => t.getAttribute('aria-controls') === id) : null;
    if (!tab) {
      const labelledBy = panel.getAttribute('aria-labelledby');
      if (labelledBy) tab = tabs.find((t) => t.getAttribute('id') === labelledBy);
    }
    if (!tab) tab = tabs[index];
    if (text(tab)) return text(tab);
    // Fallback: data layer dc:title of the tab item
    try {
      const layer = JSON.parse(panel.getAttribute('data-cmp-data-layer') || '{}');
      const item = Object.values(layer)[0];
      if (item && item['dc:title']) return String(item['dc:title']).trim();
    } catch (e) { /* ignore */ }
    return `Tab ${index + 1}`;
  };

  const mapHref = (href) => {
    if (!href) return href;
    // CF asset name (last segment) matches the page name, e.g.
    // /content/dam/wknd-shared/en/adventures/surf-camp-in-costa-rica/surf-camp-costa-rica
    //   -> /us/en/adventures/surf-camp-costa-rica.html
    const m = href.match(/^\/content\/dam\/wknd-shared\/en\/(adventures|magazine)\/(?:[^/]+\/)*([^/?#.]+)(?:\.[a-z]+)?$/);
    if (m) return `/us/en/${m[1]}/${m[2]}.html`;
    return href;
  };

  // Collect anchors from the content fragment data layer (xdm:text).
  const layerLinks = (scope) => {
    const links = [];
    scope.querySelectorAll('[data-cmp-data-layer]').forEach((el) => {
      let layer;
      try { layer = JSON.parse(el.getAttribute('data-cmp-data-layer') || '{}'); } catch (e) { return; }
      Object.values(layer).forEach((item) => {
        (item && Array.isArray(item.elements) ? item.elements : []).forEach((cfEl) => {
          const html = cfEl && cfEl['xdm:text'];
          if (!html || typeof html !== 'string' || !html.includes('<a')) return;
          const tpl = document.createElement('div');
          tpl.innerHTML = html;
          tpl.querySelectorAll('a[href]').forEach((a) => {
            const label = text(a);
            if (label) links.push({ label, href: mapHref(a.getAttribute('href')) });
          });
        });
      });
    });
    return links;
  };

  // Wrap the first unlinked occurrence of `label` inside `nodes` in an <a>.
  const restoreLink = (nodes, { label, href }) => {
    for (const node of nodes) {
      const walker = document.createTreeWalker(node, 4 /* NodeFilter.SHOW_TEXT */);
      let tn = walker.nextNode();
      while (tn) {
        const value = tn.nodeValue.replace(/ /g, ' ');
        const idx = value.indexOf(label);
        if (idx >= 0 && !(tn.parentElement && tn.parentElement.closest('a'))) {
          const after = tn.splitText(idx);
          after.splitText(label.length);
          const a = document.createElement('a');
          a.href = href;
          a.textContent = label;
          after.replaceWith(a);
          return true;
        }
        tn = walker.nextNode();
      }
    }
    return false;
  };

  const resolveImage = (img) => {
    const holder = img.closest('[data-cmp-src]');
    let src = img.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) {
      const lazy = (holder && holder.getAttribute('data-cmp-src')) || img.getAttribute('data-cmp-src') || img.getAttribute('data-src') || '';
      src = lazy.replace('{.width}', '');
    }
    if (!src) return null;
    const out = document.createElement('img');
    out.src = src;
    out.alt = img.getAttribute('alt') || img.getAttribute('title') || '';
    return out;
  };

  const CONTENT_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, table, img, [data-cmp-src]';

  panels.forEach((panel, index) => {
    const label = labelFor(panel, index);
    const contentCell = [];

    const scopes = [...panel.querySelectorAll('.cmp-contentfragment__elements')];
    const roots = scopes.length ? scopes : [panel];

    roots.forEach((scope) => {
      const matches = [...scope.querySelectorAll(CONTENT_SELECTOR)].filter((el) => {
        if (el.matches('.cmp-contentfragment__title') || el.closest('.cmp-contentfragment__title')) return false;
        if (el.closest('dl')) return false;
        // Skip an image holder that already contains an <img> (the img itself is matched).
        if (el.matches('[data-cmp-src]') && el.querySelector('img')) return false;
        // Keep only outermost text containers (img inside p etc. is kept with its parent).
        const parent = el.parentElement && el.parentElement.closest(CONTENT_SELECTOR);
        return !(parent && scope.contains(parent) && !parent.matches('[data-cmp-src]'));
      });

      // Visible image caption (span.cmp-image__title; the meta[itemprop=caption] copy is hidden).
      // Authored as an emphasised paragraph right after the image.
      const pushCaption = (el) => {
        const holder = el.closest('.cmp-image') || el.closest('[data-cmp-src]');
        const caption = holder && holder.querySelector('.cmp-image__title');
        const label = text(caption);
        if (!label) return;
        const p = document.createElement('p');
        const em = document.createElement('em');
        em.textContent = label;
        p.append(em);
        contentCell.push(p);
      };

      matches.forEach((el) => {
        if (el.matches('img')) {
          const img = resolveImage(el);
          if (img) {
            contentCell.push(img);
            pushCaption(el);
          }
          return;
        }
        if (el.matches('[data-cmp-src]')) {
          const src = (el.getAttribute('data-cmp-src') || '').replace('{.width}', '');
          if (!src) return;
          const img = document.createElement('img');
          img.src = src;
          let alt = '';
          try {
            const layer = JSON.parse(el.getAttribute('data-cmp-data-layer') || '{}');
            const item = Object.values(layer)[0];
            alt = (item && item['dc:title']) || '';
          } catch (e) { /* ignore */ }
          img.alt = alt;
          contentCell.push(img);
          pushCaption(el);
          return;
        }
        if (!text(el) && !el.querySelector('img')) return;
        // Resolve lazy images nested in text containers.
        el.querySelectorAll('img').forEach((img) => {
          const resolved = resolveImage(img);
          if (resolved) img.replaceWith(resolved); else img.remove();
        });
        contentCell.push(el);
      });
    });

    // Restore links stripped by the CF renderer: off, because the live source shows these as plain
    // text and the migration matches the source as rendered. Set RESTORE_CF_LINKS to re-link them.
    if (RESTORE_CF_LINKS && contentCell.length) {
      const textNodes = contentCell.filter((n) => !n.matches('img'));
      layerLinks(panel).forEach((link) => restoreLink(textNodes, link));
    }

    if (!label && !contentCell.length) return;
    cells.push([label, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-adventure', cells });
  element.replaceWith(block);
}
