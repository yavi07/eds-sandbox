import { toClassName } from '../../scripts/aem.js';
// eslint-disable-next-line import/no-cycle
import { loadFragment } from '../fragment/fragment.js';

/**
 * tabs-adventure: tab bar switching content panels (Overview, Itinerary, What to Bring).
 * Each row = one tab: cell 1 = tab label, cell 2 = panel content.
 * Panel content holding other blocks can be authored as a fragment: a panel
 * whose only content is a same-site link under /fragments/ (or a pasted bare
 * same-site URL) is replaced by that fragment.
 */

let tabsId = 0;

function fragmentPath(panel) {
  const links = panel.querySelectorAll('a[href]');
  if (links.length !== 1) return null;
  const link = links[0];
  if (panel.textContent.trim() !== link.textContent.trim()) return null;
  try {
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    // only fragment-style links: under /fragments/, or a pasted bare URL
    const bare = link.textContent.trim() === link.href || link.textContent.trim() === url.pathname;
    if (!url.pathname.includes('/fragments/') && !bare) return null;
    return url.pathname.replace(/\.(plain\.)?html$/, '');
  } catch (e) {
    return null;
  }
}

async function hydrateFragment(panel) {
  const path = fragmentPath(panel);
  if (!path) return;
  const fragment = await loadFragment(path);
  if (!fragment) return;
  const nodes = [...fragment.querySelectorAll(':scope > .section')].flatMap((s) => [...s.childNodes]);
  panel.replaceChildren(...(nodes.length ? nodes : fragment.childNodes));
}

function select(tablist, panels, index, focus = false) {
  const tabs = [...tablist.querySelectorAll('[role=tab]')];
  tabs.forEach((tab, i) => {
    const active = i === index;
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
    tab.tabIndex = active ? 0 : -1;
    panels[i].hidden = !active;
  });
  if (focus) tabs[index].focus();
}

export default async function decorate(block) {
  tabsId += 1;
  const rows = [...block.children].filter((r) => r.textContent.trim() || r.querySelector('picture, img'));

  const tablist = document.createElement('div');
  tablist.className = 'tabs-adventure-list';
  tablist.setAttribute('role', 'tablist');

  const panels = [];
  const used = new Set();

  rows.forEach((row, i) => {
    const [labelCell, ...contentCells] = [...row.children];
    const label = labelCell ? labelCell.textContent.trim() : '';
    let key = toClassName(label) || `tab-${i + 1}`;
    if (used.has(key)) key = `${key}-${i + 1}`;
    used.add(key);
    const tabId = `tabs-adventure-${tabsId}-tab-${key}`;
    const panelId = `tabs-adventure-${tabsId}-panel-${key}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-adventure-tab';
    button.id = tabId;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panelId);
    button.textContent = label || `Tab ${i + 1}`;
    button.addEventListener('click', () => select(tablist, panels, i));
    tablist.append(button);

    const panel = document.createElement('div');
    panel.className = 'tabs-adventure-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.tabIndex = 0;
    contentCells.forEach((cell) => panel.append(...cell.childNodes));
    panels.push(panel);
  });

  tablist.addEventListener('keydown', (e) => {
    const tabs = [...tablist.querySelectorAll('[role=tab]')];
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    let next = null;
    if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(tablist, panels, next, true);
  });

  block.replaceChildren(tablist, ...panels);
  if (panels.length) select(tablist, panels, 0);

  await Promise.all(panels.map((panel) => hydrateFragment(panel)));
}
