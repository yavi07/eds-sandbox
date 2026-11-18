import { toClassName } from '../../scripts/aem.js';

/**
 * search-ai: look-only AI-powered search UI with static, authored results.
 * No live search or AI service is called; everything below is client-side.
 *
 * Rows are identified by the first cell (case-insensitive key), value in cell 2:
 *   Placeholder      | input placeholder text
 *   Toggle           | label of the AI summary switch
 *   Summary          | AI-generated summary content (rich text)
 *   Disclaimer       | disclaimer shown under the summary
 *   Result           | one result item (title link + description); repeat per item
 *   Try Again        | label of the "Try again" button
 *   Load More        | label of the "Load more results" button
 *   Page Size        | number of results shown before "Load more" (default 5)
 * Rows with an unknown key (or a single cell) are treated as result items.
 */

const KEYS = {
  placeholder: 'placeholder',
  toggle: 'toggle',
  'toggle-label': 'toggle',
  'summary-toggle': 'toggle',
  summary: 'summary',
  'ai-summary': 'summary',
  disclaimer: 'disclaimer',
  result: 'result',
  results: 'result',
  'try-again': 'tryAgain',
  'load-more': 'loadMore',
  'load-more-results': 'loadMore',
  'page-size': 'pageSize',
  'results-per-page': 'pageSize',
};

const DEFAULTS = {
  placeholder: 'Search',
  toggle: 'Show AI-generated summary',
  tryAgain: 'Try again',
  loadMore: 'Load more results',
  pageSize: 5,
};

function readConfig(block) {
  const config = { results: [] };
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!row.textContent.trim() && !row.querySelector('picture, img')) return;
    const key = cells.length > 1 ? KEYS[toClassName(cells[0].textContent)] : undefined;
    if (!key || key === 'result') {
      const source = key === 'result' ? cells.slice(1) : cells;
      const item = document.createElement('div');
      source.forEach((cell) => item.append(...cell.childNodes));
      if (item.textContent.trim() || item.querySelector('picture, img')) config.results.push(item);
      return;
    }
    const value = cells.slice(1);
    if (key === 'summary' || key === 'disclaimer') {
      const holder = document.createElement('div');
      value.forEach((cell) => holder.append(...cell.childNodes));
      config[key] = holder;
    } else {
      config[key] = value.map((c) => c.textContent.trim()).join(' ').trim();
    }
  });
  const size = parseInt(config.pageSize, 10);
  config.pageSize = Number.isFinite(size) && size > 0 ? size : DEFAULTS.pageSize;
  ['placeholder', 'toggle', 'tryAgain', 'loadMore'].forEach((k) => {
    if (!config[k]) config[k] = DEFAULTS[k];
  });
  return config;
}

function button(className, label) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `button ${className}`;
  btn.textContent = label;
  return btn;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/**
 * Splits authored summary content into the source's card parts: a title paragraph
 * (only bold text, e.g. "Generative answer"), an attribution paragraph ("Powered by ...")
 * and the answer text (everything else).
 */
function buildSummaryCard(content) {
  const header = el('div', 'search-ai-summary-header');
  const heading = el('div', 'search-ai-summary-heading');
  header.append(el('span', 'search-ai-summary-icon'), heading);
  header.firstChild.setAttribute('aria-hidden', 'true');
  const text = el('div', 'search-ai-summary-text');
  let title;
  let attribution;
  [...content.children].forEach((child) => {
    const value = child.textContent.trim();
    const strong = child.querySelector(':scope > strong, :scope > b');
    if (!title && child.tagName === 'P' && strong && strong.textContent.trim() === value) {
      title = el('p', 'search-ai-summary-title', value);
    } else if (!attribution && child.tagName === 'P' && /^powered by\b/i.test(value)) {
      attribution = el('p', 'search-ai-summary-attribution', value);
    } else {
      text.append(child);
    }
  });
  if (!text.children.length && content.textContent.trim()) text.append(...content.childNodes);
  if (title) heading.append(title);
  if (attribution) heading.append(attribution);
  const parts = [];
  if (title || attribution) parts.push(header);
  if (text.childNodes.length) parts.push(text);
  return parts;
}

let searchId = 0;

export default function decorate(block) {
  searchId += 1;
  const id = `search-ai-${searchId}`;
  const config = readConfig(block);

  // search form
  const form = el('form', 'search-ai-form');
  form.setAttribute('role', 'search');
  const field = el('div', 'search-ai-field');
  const label = el('label', 'search-ai-label', 'Search');
  label.htmlFor = `${id}-input`;
  const icon = el('span', 'search-ai-icon');
  icon.setAttribute('aria-hidden', 'true');
  const input = el('input', 'search-ai-input');
  input.type = 'search';
  input.id = `${id}-input`;
  input.name = 'q';
  input.placeholder = config.placeholder;
  input.autocomplete = 'off';
  const clear = el('button', 'search-ai-clear');
  clear.type = 'button';
  clear.setAttribute('aria-label', 'Clear');
  clear.hidden = true;
  clear.append(el('span', 'search-ai-clear-icon'));
  clear.firstChild.setAttribute('aria-hidden', 'true');
  field.append(label, icon, input, clear);

  // AI summary switch
  const toggle = el('label', 'search-ai-toggle');
  const toggleInput = el('input', 'search-ai-toggle-input');
  toggleInput.type = 'checkbox';
  toggleInput.setAttribute('role', 'switch');
  toggleInput.checked = true;
  toggleInput.setAttribute('aria-controls', `${id}-summary`);
  toggle.append(toggleInput, el('span', 'search-ai-toggle-label', config.toggle));
  form.append(field, toggle);

  // summary panel: card with header, answer, sources, disclaimer
  const summary = el('section', 'search-ai-summary');
  summary.id = `${id}-summary`;
  summary.setAttribute('aria-live', 'polite');
  const card = el('div', 'search-ai-summary-card');
  if (config.summary) card.append(...buildSummaryCard(config.summary));
  const sources = el('div', 'search-ai-sources-section');
  const sourcesList = el('ul', 'search-ai-sources');
  sources.append(el('p', 'search-ai-sources-label', 'Sources'), sourcesList);
  card.append(sources);
  if (config.disclaimer) {
    config.disclaimer.className = 'search-ai-disclaimer';
    card.append(config.disclaimer);
  }
  const tryAgain = button('search-ai-try-again', config.tryAgain);
  card.append(tryAgain);
  summary.append(card);

  // results toolbar (list / cards layout)
  const toolbar = el('div', 'search-ai-results-toolbar');
  const layoutToggle = el('div', 'search-ai-layout-toggle');
  layoutToggle.setAttribute('role', 'group');
  layoutToggle.setAttribute('aria-label', 'Results layout');
  const layouts = ['card', 'list'].map((layout) => {
    const btn = el('button', 'search-ai-layout-btn', layout === 'card' ? 'Cards' : 'List');
    btn.type = 'button';
    btn.dataset.layout = layout;
    btn.setAttribute('aria-pressed', layout === 'list');
    return btn;
  });
  layoutToggle.append(...layouts);
  toolbar.append(layoutToggle);
  block.classList.add('search-ai-list');
  layoutToggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.search-ai-layout-btn');
    if (!btn) return;
    layouts.forEach((b) => b.setAttribute('aria-pressed', b === btn));
    block.classList.toggle('search-ai-list', btn.dataset.layout === 'list');
    block.classList.toggle('search-ai-card', btn.dataset.layout === 'card');
  });

  // results
  const list = el('ul', 'search-ai-results');
  list.setAttribute('aria-label', 'Search results');
  config.results.forEach((item) => {
    const li = el('li', 'search-ai-result');
    li.append(...item.childNodes);
    li.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
    li.querySelectorAll('.button-container, .button-wrapper').forEach((p) => p.classList.remove('button-container', 'button-wrapper'));
    list.append(li);
  });
  const empty = el('p', 'search-ai-empty', 'No results match your search.');
  empty.hidden = true;
  const loadMore = button('search-ai-load-more', config.loadMore);

  let visible = config.pageSize;
  const render = () => {
    const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = [...list.children].filter((li) => {
      const text = li.textContent.toLowerCase();
      return terms.every((t) => text.includes(t));
    });
    [...list.children].forEach((li) => { li.hidden = true; });
    matches.slice(0, visible).forEach((li) => { li.hidden = false; });
    empty.hidden = matches.length > 0 || !config.results.length;
    loadMore.hidden = matches.length <= visible;
    // sources: titles of the top matches, as chips
    sourcesList.replaceChildren(...matches.slice(0, 6).map((li) => {
      const titleLink = li.querySelector('h1 a, h2 a, h3 a, h4 a, h5 a, h6 a, a');
      const chip = el(titleLink ? 'a' : 'span', 'search-ai-source-chip');
      chip.textContent = (titleLink || li.firstElementChild || li).textContent.trim();
      if (titleLink) chip.href = titleLink.href;
      const chipItem = el('li');
      chipItem.append(chip);
      return chipItem;
    }));
    sources.hidden = !sourcesList.children.length;
  };

  // as on the source, the summary and results only appear once a search has been made
  const results = el('div', 'search-ai-body');
  results.hidden = true;
  const search = () => {
    visible = config.pageSize;
    results.hidden = !input.value.trim();
    render();
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    search();
  });
  input.addEventListener('search', search);
  input.addEventListener('input', () => {
    clear.hidden = !input.value;
  });
  clear.addEventListener('click', () => {
    input.value = '';
    clear.hidden = true;
    search();
    input.focus();
  });
  loadMore.addEventListener('click', () => {
    visible += config.pageSize;
    render();
  });
  toggleInput.addEventListener('change', () => {
    summary.hidden = !toggleInput.checked;
  });
  tryAgain.addEventListener('click', () => {
    // client-side only: replay a short "regenerating" state
    summary.setAttribute('aria-busy', 'true');
    setTimeout(() => summary.removeAttribute('aria-busy'), 600);
  });

  const resultsSection = el('div', 'search-ai-results-section');
  resultsSection.append(toolbar, list, empty, loadMore);
  const hasSummary = config.summary || config.disclaimer;
  if (hasSummary) results.append(summary);
  results.append(resultsSection);

  block.replaceChildren(form, results);
  if (!hasSummary) toggle.hidden = true;
  render();
}
