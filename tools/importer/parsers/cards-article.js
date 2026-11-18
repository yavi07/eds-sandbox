/* eslint-disable */
/* global WebImporter */
/**
 * Parser: cards-article
 * Rows follow the cards convention: [image cell, text cell (heading with title link,
 * description, optional call to action)].
 *
 * Looks:
 * - default: AEM core image list (div.image-list.list > ul.cmp-image-list > li.cmp-image-list__item).
 *   The image link is dropped: the block re-links the image when the card has a single destination.
 * - category-filter-tabs: AEM tabs (div.tabs) whose panels each hold an image list. The first panel
 *   ("All") lists every card; each other panel is a category. A first row holds the tab labels in
 *   source order ("All, Climbing, ..."); each card row adds a third cell with its categories.
 * - locked: consecutive AEM "secure" list teasers (div.cmp-teaser--secure, members-only content).
 *   The first teaser claims its following secure siblings, so the later ones are no longer in the
 *   page when the import script reaches them. "Read More" stays plain text (needs a sign-in).
 */

const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

function imageListCardRow(item, document) {
  const imageCell = [];
  const img = item.querySelector('.cmp-image-list__item-image img') || item.querySelector('img');
  if (img && img.getAttribute('src')) {
    const image = document.createElement('img');
    image.src = img.getAttribute('src');
    image.alt = img.getAttribute('alt') || img.getAttribute('title') || '';
    imageCell.push(image);
  }

  const bodyCell = [];
  const titleEl = item.querySelector('.cmp-image-list__item-title');
  const titleLink = item.querySelector('a.cmp-image-list__item-title-link[href]')
    || item.querySelector('a.cmp-image-list__item-image-link[href]')
    || item.querySelector('a[href]');
  const href = titleLink ? titleLink.getAttribute('href') : '';
  const title = text(titleEl) || text(item.querySelector('a.cmp-image-list__item-title-link'));

  if (title) {
    const heading = document.createElement('h3');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = title;
      heading.append(a);
    } else {
      heading.textContent = title;
    }
    bodyCell.push(heading);
  } else if (href) {
    // no title text: keep the destination as a plain link so the card stays clickable
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = img && img.getAttribute('alt') ? img.getAttribute('alt') : href;
    p.append(a);
    bodyCell.push(p);
  }

  const desc = item.querySelector('.cmp-image-list__item-description');
  if (text(desc)) {
    const p = document.createElement('p');
    p.textContent = text(desc);
    bodyCell.push(p);
  }

  if (!imageCell.length && !bodyCell.length) return null;
  return [imageCell, bodyCell];
}

function imageListItems(root) {
  let items = [...root.querySelectorAll('li.cmp-image-list__item')];
  if (!items.length) items = [...root.querySelectorAll('article.cmp-image-list__item-content')];
  return items;
}

function parseTabs(element, document) {
  const labels = [...element.querySelectorAll('[role="tab"], .cmp-tabs__tab')].map((t) => text(t)).filter(Boolean);
  const panels = [...element.querySelectorAll('[role="tabpanel"], .cmp-tabs__tabpanel')];
  if (!panels.length) return false;
  const keyOf = (item) => {
    const a = item.querySelector('a[href]');
    return a
      ? a.getAttribute('href').replace(/^https?:\/\/[^/]+/, '')
      : text(item.querySelector('.cmp-image-list__item-title'));
  };
  const cats = new Map();
  panels.slice(1).forEach((panel, i) => {
    const label = labels[i + 1];
    if (!label) return;
    imageListItems(panel).forEach((item) => {
      const key = keyOf(item);
      if (!cats.has(key)) cats.set(key, []);
      if (!cats.get(key).includes(label)) cats.get(key).push(label);
    });
  });
  const cells = [];
  if (labels.length) cells.push([labels.join(', ')]);
  imageListItems(panels[0]).forEach((item) => {
    const row = imageListCardRow(item, document);
    if (!row) return;
    cells.push([...row, (cats.get(keyOf(item)) || []).join(', ')]);
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article (category-filter-tabs)', cells });
  element.replaceWith(block);
  return true;
}

function parseLocked(element, document) {
  const teasers = [element];
  let next = element.nextElementSibling;
  while (next && next.matches('div.cmp-teaser--secure')) {
    teasers.push(next);
    next = next.nextElementSibling;
  }
  const cells = [];
  teasers.forEach((teaser) => {
    const imageCell = [];
    const img = teaser.querySelector('.cmp-teaser__image img');
    const holder = teaser.querySelector('.cmp-teaser__image [data-cmp-src]');
    let src = img && img.getAttribute('src');
    if (!src && holder) src = holder.getAttribute('data-cmp-src').replace('{.width}', '');
    if (src) {
      const image = document.createElement('img');
      image.src = src;
      image.alt = (img && img.getAttribute('alt')) || text(teaser.querySelector('.cmp-teaser__title'));
      imageCell.push(image);
    }
    const bodyCell = [];
    const title = text(teaser.querySelector('.cmp-teaser__title'));
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      bodyCell.push(h3);
    }
    const desc = text(teaser.querySelector('.cmp-teaser__description'));
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      bodyCell.push(p);
    }
    const action = teaser.querySelector('.cmp-teaser__action-container');
    const actionLink = action && action.querySelector('a[href]');
    if (text(action)) {
      const p = document.createElement('p');
      if (actionLink) {
        const a = document.createElement('a');
        a.href = actionLink.getAttribute('href');
        a.textContent = text(action);
        p.append(a);
      } else {
        p.textContent = text(action);
      }
      bodyCell.push(p);
    }
    if (imageCell.length || bodyCell.length) cells.push([imageCell, bodyCell]);
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article (locked)', cells });
  teasers.slice(1).forEach((t) => t.remove());
  element.replaceWith(block);
}

/**
 * Profile look: consecutive AEM contributor experience fragments
 * (section.cmp-experience-fragment--contributor) become one 'cards-article (profile)' block.
 * Row (cards convention): [photo cell, text cell (h3 name, h5 roles line, list of social links
 * as the calls to action)].
 */
function parseProfiles(element, document) {
  const sel = 'section.cmp-experience-fragment--contributor';
  const profiles = [element];
  let next = element.nextElementSibling;
  while (next && next.matches(sel)) {
    profiles.push(next);
    next = next.nextElementSibling;
  }
  const cells = [];
  profiles.forEach((profile) => {
    const imageCell = [];
    const img = profile.querySelector('img');
    if (img && img.getAttribute('src')) {
      const image = document.createElement('img');
      image.src = img.getAttribute('src');
      image.alt = img.getAttribute('alt') || '';
      imageCell.push(image);
    }
    const bodyCell = [];
    const titles = [...profile.querySelectorAll('.cmp-title__text')].map((t) => text(t)).filter(Boolean);
    if (titles[0]) {
      const h3 = document.createElement('h3');
      h3.textContent = titles[0];
      bodyCell.push(h3);
    }
    // Role line(s): source h5.cmp-title__text, kept as h5 headings.
    titles.slice(1).forEach((t) => {
      const h5 = document.createElement('h5');
      h5.textContent = t;
      bodyCell.push(h5);
    });
    const links = [...profile.querySelectorAll('a[href]')].filter((a) => text(a));
    if (links.length) {
      const ul = document.createElement('ul');
      links.forEach((link) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = text(link);
        li.append(a);
        ul.append(li);
      });
      bodyCell.push(ul);
    }
    if (imageCell.length || bodyCell.length) cells.push([imageCell, bodyCell]);
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article (profile)', cells });
  profiles.slice(1).forEach((p) => p.remove());
  element.replaceWith(block);
}

export default function parse(element, { document }) {
  if (element.matches('section.cmp-experience-fragment--contributor')) {
    parseProfiles(element, document);
    return;
  }
  if (element.matches('div.cmp-teaser--secure')) {
    parseLocked(element, document);
    return;
  }
  if (element.matches('div.tabs') && parseTabs(element, document)) return;

  const cells = imageListItems(element)
    .map((item) => imageListCardRow(item, document))
    .filter(Boolean);
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
