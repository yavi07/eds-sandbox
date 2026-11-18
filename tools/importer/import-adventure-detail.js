/* eslint-disable */
/* global WebImporter */

import carouselGalleryParser from './parsers/carousel-gallery.js';
import adventureFactParser from './parsers/adventure-fact.js';
import tabsAdventureParser from './parsers/tabs-adventure.js';
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';

const PAGE_TEMPLATE = {
  "name": "adventure-detail",
  "urls": [
    "https://wknd.site/us/en/adventures/bali-surf-camp.html",
    "https://wknd.site/us/en/adventures/beervana-portland.html",
    "https://wknd.site/us/en/adventures/climbing-new-zealand.html",
    "https://wknd.site/us/en/adventures/colorado-rock-climbing.html",
    "https://wknd.site/us/en/adventures/cycling-southern-utah.html",
    "https://wknd.site/us/en/adventures/cycling-tuscany.html",
    "https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html",
    "https://wknd.site/us/en/adventures/gastronomic-marais-tour.html",
    "https://wknd.site/us/en/adventures/napa-wine-tasting.html",
    "https://wknd.site/us/en/adventures/riverside-camping-australia.html",
    "https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html",
    "https://wknd.site/us/en/adventures/surf-camp-costa-rica.html",
    "https://wknd.site/us/en/adventures/tahoe-skiing.html",
    "https://wknd.site/us/en/adventures/west-coast-cycling.html",
    "https://wknd.site/us/en/adventures/whistler-mountain-biking.html",
    "https://wknd.site/us/en/adventures/yosemite-backpacking.html"
  ],
  "description": "Detail page with image gallery carousel, title with trip fact sidebar, and tabbed content (overview, itinerary, what to bring)",
  "blocks": [
    {
      "name": "carousel-gallery",
      "instances": [
        "div.carousel.cmp-carousel--mini"
      ],
      "pageInstances": {
        "https://wknd.site/us/en/adventures/bali-surf-camp.html": [
          "#container-3fc977da6e > div > div.carousel.panelcontainer.cmp-carousel--mini.aem-GridColumn.aem-GridColumn--default--12"
        ],
        "https://wknd.site/us/en/adventures/beervana-portland.html": [
          "#container-9265034fbc > div.carousel.panelcontainer.cmp-carousel--mini"
        ],
        "https://wknd.site/us/en/adventures/climbing-new-zealand.html": [
          "#container-ed97fcfff5 > div.carousel.panelcontainer.cmp-carousel--mini"
        ],
        "https://wknd.site/us/en/adventures/colorado-rock-climbing.html": [
          "#container-8aabbbb1a4 > div > div.carousel.panelcontainer.cmp-carousel--mini.aem-GridColumn.aem-GridColumn--default--12"
        ],
        "https://wknd.site/us/en/adventures/cycling-southern-utah.html": [
          "#container-1244357321 > div > div.carousel.panelcontainer.cmp-carousel--mini.aem-GridColumn.aem-GridColumn--default--12"
        ],
        "https://wknd.site/us/en/adventures/cycling-tuscany.html": [
          "#container-0a9e195c1b > div.carousel.panelcontainer.cmp-carousel--mini"
        ],
        "https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html": [
          "#container-6ac9572856 > div.carousel.panelcontainer.cmp-carousel--mini"
        ],
        "https://wknd.site/us/en/adventures/gastronomic-marais-tour.html": [
          "#container-f825f1979f > div > div.carousel.panelcontainer.cmp-carousel--mini.aem-GridColumn.aem-GridColumn--default--12"
        ],
        "https://wknd.site/us/en/adventures/napa-wine-tasting.html": [
          "#container-a99e80f491 > div > div.carousel.panelcontainer.cmp-carousel--mini.aem-GridColumn.aem-GridColumn--default--12"
        ],
        "https://wknd.site/us/en/adventures/riverside-camping-australia.html": [
          "#container-81a420a938 > div.carousel.panelcontainer.cmp-carousel--mini"
        ],
        "https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html": [
          "#container-876f8877ae > div.carousel.panelcontainer.cmp-carousel--mini"
        ],
        "https://wknd.site/us/en/adventures/surf-camp-costa-rica.html": [
          "#container-bfe3376af3 > div.carousel.panelcontainer.cmp-carousel--mini"
        ],
        "https://wknd.site/us/en/adventures/tahoe-skiing.html": [
          "#container-e31226bb97 > div > div.carousel.panelcontainer.cmp-carousel--mini.aem-GridColumn.aem-GridColumn--default--12"
        ],
        "https://wknd.site/us/en/adventures/west-coast-cycling.html": [
          "#container-a7c6865ac5 > div > div.carousel.panelcontainer.cmp-carousel--mini.aem-GridColumn.aem-GridColumn--default--12"
        ],
        "https://wknd.site/us/en/adventures/whistler-mountain-biking.html": [
          "#container-d7269ce1e5 > div.carousel.panelcontainer.cmp-carousel--mini"
        ],
        "https://wknd.site/us/en/adventures/yosemite-backpacking.html": [
          "#container-8484a21407 > div > div.carousel.panelcontainer.cmp-carousel--mini.aem-GridColumn.aem-GridColumn--default--12"
        ]
      }
    },
    {
      "name": "adventure-fact",
      "instances": [
        "div.contentfragment.cmp-contentfragment--elements"
      ],
      "pageInstances": {
        "https://wknd.site/us/en/adventures/beervana-portland.html": [
          "#contentfragment-00299ec5f5 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--activity",
          "#contentfragment-00299ec5f5 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--adventureType",
          "#contentfragment-00299ec5f5 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--tripLength",
          "#contentfragment-00299ec5f5 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--groupSize",
          "#contentfragment-00299ec5f5 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--difficulty",
          "#contentfragment-00299ec5f5 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--price"
        ],
        "https://wknd.site/us/en/adventures/climbing-new-zealand.html": [
          "#contentfragment-71006a1398 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--activity",
          "#contentfragment-71006a1398 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--adventureType",
          "#contentfragment-71006a1398 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--tripLength",
          "#contentfragment-71006a1398 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--groupSize",
          "#contentfragment-71006a1398 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--difficulty",
          "#contentfragment-71006a1398 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--price"
        ],
        "https://wknd.site/us/en/adventures/cycling-tuscany.html": [
          "#contentfragment-78977aa9be > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--activity",
          "#contentfragment-78977aa9be > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--adventureType",
          "#contentfragment-78977aa9be > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--tripLength",
          "#contentfragment-78977aa9be > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--groupSize",
          "#contentfragment-78977aa9be > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--difficulty",
          "#contentfragment-78977aa9be > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--price"
        ],
        "https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html": [
          "#contentfragment-658eefb9b1 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--activity",
          "#contentfragment-658eefb9b1 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--adventureType",
          "#contentfragment-658eefb9b1 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--tripLength",
          "#contentfragment-658eefb9b1 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--groupSize",
          "#contentfragment-658eefb9b1 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--difficulty",
          "#contentfragment-658eefb9b1 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--price"
        ],
        "https://wknd.site/us/en/adventures/riverside-camping-australia.html": [
          "#contentfragment-36b58afd20 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--activity",
          "#contentfragment-36b58afd20 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--adventureType",
          "#contentfragment-36b58afd20 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--tripLength",
          "#contentfragment-36b58afd20 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--groupSize",
          "#contentfragment-36b58afd20 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--difficulty",
          "#contentfragment-36b58afd20 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--price"
        ],
        "https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html": [
          "#contentfragment-047cc96d7d > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--activity",
          "#contentfragment-047cc96d7d > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--adventureType",
          "#contentfragment-047cc96d7d > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--tripLength",
          "#contentfragment-047cc96d7d > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--groupSize",
          "#contentfragment-047cc96d7d > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--difficulty",
          "#contentfragment-047cc96d7d > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--price"
        ],
        "https://wknd.site/us/en/adventures/surf-camp-costa-rica.html": [
          "#contentfragment-a72813719b > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--activity",
          "#contentfragment-a72813719b > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--adventureType",
          "#contentfragment-a72813719b > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--tripLength",
          "#contentfragment-a72813719b > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--groupSize",
          "#contentfragment-a72813719b > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--difficulty",
          "#contentfragment-a72813719b > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--price"
        ],
        "https://wknd.site/us/en/adventures/whistler-mountain-biking.html": [
          "#contentfragment-029165e1a5 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--activity",
          "#contentfragment-029165e1a5 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--adventureType",
          "#contentfragment-029165e1a5 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--tripLength",
          "#contentfragment-029165e1a5 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--groupSize",
          "#contentfragment-029165e1a5 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--difficulty",
          "#contentfragment-029165e1a5 > dl > div.cmp-contentfragment__element.cmp-contentfragment__element--price"
        ]
      }
    },
    {
      "name": "tabs-adventure",
      "instances": [
        "div.tabs.panelcontainer"
      ],
      "pageInstances": {
        "https://wknd.site/us/en/adventures/bali-surf-camp.html": [
          "#container-52a201bd68 > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/beervana-portland.html": [
          "#container-637ff60361 > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/climbing-new-zealand.html": [
          "#container-b24611da1b > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/colorado-rock-climbing.html": [
          "#container-d3be088fce > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/cycling-southern-utah.html": [
          "#container-0e4025cef9 > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/cycling-tuscany.html": [
          "#container-c335da8a15 > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html": [
          "#container-baf9138202 > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/gastronomic-marais-tour.html": [
          "#container-e66719e029 > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/napa-wine-tasting.html": [
          "#container-b3767c5983 > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/riverside-camping-australia.html": [
          "#container-6269f53c58 > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html": [
          "#container-1e8e161b13 > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/surf-camp-costa-rica.html": [
          "#container-e48e910fac > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/tahoe-skiing.html": [
          "#container-0245a02c6b > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/west-coast-cycling.html": [
          "#container-40266217de > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/whistler-mountain-biking.html": [
          "#container-ab39fb2c54 > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ],
        "https://wknd.site/us/en/adventures/yosemite-backpacking.html": [
          "#container-6d13c2a6dc > div > div.tabs.panelcontainer.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--default--none.aem-GridColumn--phone--none.aem-GridColumn--phone--12.aem-GridColumn--tablet--none.aem-GridColumn--default--9.aem-GridColumn.aem-GridColumn--offset--phone--0.aem-GridColumn--offset--default--0"
        ]
      }
    }
  ],
  "sections": [
    {
      "id": "breadcrumb",
      "name": "Breadcrumb",
      "selector": [
        "div.breadcrumb"
      ],
      "style": "breadcrumb",
      "blocks": [],
      "defaultContent": [
        "div.breadcrumb"
      ]
    },
    {
      "id": "gallery",
      "name": "Photo gallery",
      "selector": [
        "div.carousel.cmp-carousel--mini"
      ],
      "style": null,
      "blocks": [
        "carousel-gallery"
      ],
      "defaultContent": []
    },
    {
      "id": "details",
      "name": "Title, trip facts sidebar and tabs",
      "selector": [
        ".cmp-layout-container--fixed:has(div.tabs)"
      ],
      "style": "sidebar, underline-title",
      "blocks": [
        "adventure-fact",
        "tabs-adventure"
      ],
      "defaultContent": [
        "div.title"
      ]
    }
  ]
};

const parsers = {
  'carousel-gallery': carouselGalleryParser,
  'adventure-fact': adventureFactParser,
  'tabs-adventure': tabsAdventureParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [wkndSectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
const transformers = [wkndCleanupTransformer, ...lateTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left `main` before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
