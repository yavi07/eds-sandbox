/* eslint-disable */
/* global WebImporter */

/**
 * WKND section transformer (generic; driven by payload.template.sections).
 *
 * beforeTransform (parser targets still exist): walk sections in reverse and insert <hr> before
 * every non-first section. Styled sections get a temporary data-excat-section-id on their <hr>;
 * a styled first section gets a temporary marked <hr> too.
 * afterTransform: walk in reverse and add a Section Metadata block after each styled section's
 * marker (or the surviving section element), then drop the markers and the first section's <hr>.
 */

const MARKER = 'data-excat-section-id';

function queryAll(document, selector) {
  try {
    return [...document.querySelectorAll(selector)];
  } catch (e) {
    return [];
  }
}

// Resolve each section's element: selectors tried in order, first match that neither contains
// nor sits inside an element already resolved for another section (e.g. a hero teaser selector
// that would otherwise hit a slide inside the hero carousel). A section with `nested: true`
// (e.g. a separator that splits a source container) may start inside another section's element.
function resolveSections(document, sections) {
  const taken = [];
  return sections.map((section) => {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    let found = null;
    selectors.some((selector) => {
      if (!selector) return false;
      found = queryAll(document, selector).find(
        (el) => !taken.some((t) => t === el || (!section.nested && t.contains(el)) || el.contains(t)),
      ) || null;
      return Boolean(found);
    });
    if (found) taken.push(found);
    return found;
  });
}

function getSections(payload) {
  const sections = payload.template?.sections;
  if (!Array.isArray(sections) || !sections.length) return null;
  // one section still needs its Section Metadata when it has a style
  return sections.length > 1 || sections.some((s) => s.style) ? sections : null;
}

export default function transform(hookName, element, payload) {
  const sections = getSections(payload);
  if (!sections) return;
  const document = payload.document || element.ownerDocument;

  if (hookName === 'beforeTransform') {
    const elements = resolveSections(document, sections);
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = elements[i];
      if (el && el.parentNode) {
        if (i > 0 || section.style) {
          const hr = document.createElement('hr');
          if (section.style) hr.setAttribute(MARKER, section.id || String(i));
          el.parentNode.insertBefore(hr, el);
        }
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (section.style) {
        const id = section.id || String(i);
        const marker = document.querySelector(`hr[${MARKER}="${id}"]`);
        const anchor = marker || resolveSections(document, [section])[0];
        if (anchor && anchor.parentNode) {
          const meta = WebImporter.Blocks.createBlock(document, {
            name: 'Section Metadata',
            cells: { style: section.style },
          });
          anchor.after(meta);
        }
        if (marker) {
          if (i === 0) marker.remove();
          else marker.removeAttribute(MARKER);
        }
      }
    }
    // Safety: never leave temporary markers behind.
    document.querySelectorAll(`[${MARKER}]`).forEach((el) => el.removeAttribute(MARKER));
  }
}
