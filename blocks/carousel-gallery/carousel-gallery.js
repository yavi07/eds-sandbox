import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * carousel-gallery: rotating photo slides with dot indicators and prev/next arrows.
 * Each row = one slide: cell 1 = image, cell 2 (optional) = slide text
 * (heading, description, CTA). Option `image`: the slide text is shown as a
 * panel overlapping the bottom of the image.
 */

let carouselId = 0;

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]));
  });
}

function setActive(block, index) {
  const slides = [...block.querySelectorAll('.carousel-gallery-slide')];
  block.dataset.activeSlide = index;
  slides.forEach((slide, i) => {
    const active = i === index;
    slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    slide.querySelectorAll('a, button').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });
  block.querySelectorAll('.carousel-gallery-indicator button').forEach((btn, i) => {
    if (i === index) btn.setAttribute('aria-current', 'true');
    else btn.removeAttribute('aria-current');
  });
}

function showSlide(block, requested) {
  const slides = block.querySelectorAll('.carousel-gallery-slide');
  if (!slides.length) return;
  const index = (requested + slides.length) % slides.length;
  block.querySelector('.carousel-gallery-slides').scrollTo({
    top: 0,
    left: slides[index].offsetLeft,
    behavior: 'smooth',
  });
  setActive(block, index);
}

function createSlide(row, index, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-gallery-slide';
  slide.id = `carousel-gallery-${id}-slide-${index}`;
  slide.dataset.slideIndex = index;
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');

  const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('picture, img'));
  const imageCell = cells.find((c) => c.querySelector('picture, img'));
  const textCells = cells.filter((c) => c !== imageCell && c.textContent.trim());

  if (imageCell) {
    const media = document.createElement('div');
    media.className = 'carousel-gallery-slide-image';
    // keep only the picture/img; any text in the image cell moves to the content
    const pic = imageCell.querySelector('picture') || imageCell.querySelector('img');
    media.append(pic);
    if (imageCell.textContent.trim()) textCells.unshift(imageCell);
    slide.append(media);
  }

  if (textCells.length) {
    const content = document.createElement('div');
    content.className = 'carousel-gallery-slide-content';
    textCells.forEach((cell) => content.append(...cell.childNodes));
    slide.append(content);
    const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && heading.id) slide.setAttribute('aria-labelledby', heading.id);
  }

  if (!slide.hasAttribute('aria-labelledby')) {
    const alt = slide.querySelector('img')?.alt;
    if (alt) slide.setAttribute('aria-label', alt);
  }
  return slide;
}

export default function decorate(block) {
  carouselId += 1;
  const id = carouselId;
  block.id = block.id || `carousel-gallery-${id}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');

  const rows = [...block.children].filter((r) => r.textContent.trim() || r.querySelector('picture, img'));

  const container = document.createElement('div');
  container.className = 'carousel-gallery-slides-container';
  const slidesList = document.createElement('ul');
  slidesList.className = 'carousel-gallery-slides';
  container.append(slidesList);

  rows.forEach((row, i) => slidesList.append(createSlide(row, i, id)));
  optimizeImages(slidesList);

  const children = [container];

  if (rows.length > 1) {
    const controls = document.createElement('div');
    controls.className = 'carousel-gallery-controls';

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Carousel slide controls');
    const indicators = document.createElement('ol');
    indicators.className = 'carousel-gallery-indicators';
    rows.forEach((_, i) => {
      const li = document.createElement('li');
      li.className = 'carousel-gallery-indicator';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Show slide ${i + 1} of ${rows.length}`);
      btn.setAttribute('aria-controls', `carousel-gallery-${id}-slide-${i}`);
      btn.addEventListener('click', () => showSlide(block, i));
      li.append(btn);
      indicators.append(li);
    });
    nav.append(indicators);

    const arrows = document.createElement('div');
    arrows.className = 'carousel-gallery-arrows';
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'carousel-gallery-prev';
    prev.setAttribute('aria-label', 'Previous');
    prev.addEventListener('click', () => showSlide(block, Number(block.dataset.activeSlide || 0) - 1));
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'carousel-gallery-next';
    next.setAttribute('aria-label', 'Next');
    next.addEventListener('click', () => showSlide(block, Number(block.dataset.activeSlide || 0) + 1));
    arrows.append(prev, next);

    controls.append(nav, arrows);
    children.push(controls);
  }

  block.replaceChildren(...children);
  setActive(block, 0);

  if (rows.length > 1 && 'IntersectionObserver' in window) {
    // keep indicators in sync when users swipe/scroll the slides
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(block, Number(entry.target.dataset.slideIndex));
      });
    }, { root: slidesList, threshold: 0.6 });
    slidesList.querySelectorAll('.carousel-gallery-slide').forEach((s) => observer.observe(s));
  }
}
