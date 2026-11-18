/* eslint-disable */
/* global WebImporter */
/**
 * Parser: carousel-gallery
 * Source: AEM core carousel (div.carousel) whose slides are div.cmp-carousel__item panels.
 * Target (library convention, 2 columns): one row per slide -> [image cell, text cell].
 *
 * Looks:
 * - Homepage hero (div.carousel.cmp-carousel--hero): each slide holds a cmp-teaser
 *   (pretitle, title, description, CTA, image) -> 'carousel-gallery (image)'.
 * - Adventure photo gallery (div.carousel.cmp-carousel--mini) and any other carousel:
 *   DEFAULT look -> plain 'carousel-gallery'. Slides are image-only, so the text cell
 *   is an empty pad unless a slide has visible text.
 */
export default function parse(element, { document }) {
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  const isHero = element.matches('.cmp-carousel--hero')
    || !!element.querySelector('.cmp-carousel--hero')
    || (!element.matches('.cmp-carousel--mini') && !element.querySelector('.cmp-carousel--mini')
      && !!element.querySelector('.cmp-teaser'));

  // Slides: prefer the carousel item panels; fall back to teasers / image components.
  let slides = [...element.querySelectorAll('.cmp-carousel__item')];
  if (!slides.length) slides = [...element.querySelectorAll('.cmp-teaser')];
  if (!slides.length) slides = [...element.querySelectorAll('.cmp-image')];
  // Outermost only (no double-selection of nested matches).
  slides = slides.filter((s) => !slides.some((o) => o !== s && o.contains(s)));

  const buildImage = (slide) => {
    const img = slide.querySelector('.cmp-teaser__image img, .cmp-image img') || slide.querySelector('img');
    const holder = (img && img.closest('[data-cmp-src]')) || slide.querySelector('[data-cmp-src]')
      || (slide.matches('[data-cmp-src]') ? slide : null);
    let src = img ? img.getAttribute('src') || '' : '';
    if (!src || src.startsWith('data:')) {
      const lazy = (holder && holder.getAttribute('data-cmp-src'))
        || (img && (img.getAttribute('data-cmp-src') || img.getAttribute('data-src'))) || '';
      src = lazy.replace('{.width}', '');
    }
    if (!src) return null;
    const out = document.createElement('img');
    out.src = src;
    let alt = img ? img.getAttribute('alt') || img.getAttribute('title') || '' : '';
    if (!alt && holder) {
      try {
        const layer = JSON.parse(holder.getAttribute('data-cmp-data-layer') || '{}');
        const item = Object.values(layer)[0];
        alt = (item && item['dc:title']) || '';
      } catch (e) { /* ignore */ }
    }
    out.alt = alt;
    return out;
  };

  const buildTeaserText = (slide) => {
    const textCell = [];
    const pretitle = slide.querySelector('.cmp-teaser__pretitle');
    if (text(pretitle)) {
      const p = document.createElement('p');
      p.textContent = text(pretitle);
      textCell.push(p);
    }

    const titleEl = slide.querySelector('.cmp-teaser__title');
    if (text(titleEl)) {
      const level = /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : 'h2';
      const heading = document.createElement(level);
      const titleLink = titleEl.querySelector('a[href]');
      if (titleLink) {
        const a = document.createElement('a');
        a.href = titleLink.getAttribute('href');
        a.textContent = text(titleEl);
        heading.append(a);
      } else {
        heading.textContent = text(titleEl);
      }
      textCell.push(heading);
    }

    const desc = slide.querySelector('.cmp-teaser__description');
    if (text(desc)) {
      const paras = [...desc.querySelectorAll('p')].filter((p) => text(p));
      if (paras.length) {
        paras.forEach((p) => textCell.push(p));
      } else {
        const p = document.createElement('p');
        p.textContent = text(desc);
        textCell.push(p);
      }
    }

    slide.querySelectorAll('.cmp-teaser__action-link[href]').forEach((link) => {
      if (!text(link)) return;
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = text(link);
      p.append(a);
      textCell.push(p);
    });
    return textCell;
  };

  // Generic slide text (non-teaser slides): headings, paragraphs, lists, captions.
  const buildPlainText = (slide) => {
    if (slide.querySelector('.cmp-teaser')) return buildTeaserText(slide);
    const textCell = [];
    const sel = 'h1, h2, h3, h4, h5, h6, p, ul, ol, .cmp-image__title, figcaption';
    const found = [...slide.querySelectorAll(sel)]
      .filter((el) => text(el))
      .filter((el) => {
        const parent = el.parentElement && el.parentElement.closest(sel);
        return !(parent && slide.contains(parent));
      });
    found.forEach((el) => {
      if (el.matches('.cmp-image__title, figcaption')) {
        const p = document.createElement('p');
        p.textContent = text(el);
        textCell.push(p);
      } else {
        textCell.push(el);
      }
    });
    return textCell;
  };

  const cells = [];
  slides.forEach((slide) => {
    const img = buildImage(slide);
    const imageCell = img ? [img] : [];
    const textCell = isHero ? buildTeaserText(slide) : buildPlainText(slide);
    if (!imageCell.length && !textCell.length) return;
    cells.push([imageCell, textCell.length ? textCell : '']);
  });

  const name = isHero ? 'carousel-gallery (image)' : 'carousel-gallery';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
