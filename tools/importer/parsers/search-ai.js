/* eslint-disable */
/* global WebImporter */
/**
 * Parser: search-ai
 * Source: WKND Content AI search component (div.contentaisearch / .cmp-contentaisearch__*).
 * The live component queries a search/AI service and renders results client-side. The user
 * chose a look-only recreation, so this project's search-ai block is a custom variant of the
 * library Search block: instead of a query-index URL row it takes key | value rows (see
 * blocks/search-ai/README.md) — Placeholder, Toggle, Summary, Disclaimer, Try Again, Load More,
 * Page Size, then one Result row per static sample result the block filters client-side.
 */
const SAMPLE_RESULTS = [
  ['Bali Surf Camp', '/us/en/adventures/bali-surf-camp', "Surfing in Bali is on the bucket list of every surfer - whether you're a beginner or someone who's been surfing for decades, there will be a break to cater to your ability."],
  ['Beervana in Portland', '/us/en/adventures/beervana-portland', 'This adventure will provide insider access to spectacular local breweries that define the taste and experience of Oregon beer culture and tradition.'],
  ['Climbing New Zealand', '/us/en/adventures/climbing-new-zealand', 'Come join us for a guided rock climbing adventure in the mountains that trained Sir Edmund Hilary.'],
  ['Colorado Rock Climbing', '/us/en/adventures/colorado-rock-climbing', "With all of Colorado's beautiful peaks, rock formations and gorgeous mountain views, it's not hard for rock climbers to find a little slice of climbing paradise."],
  ['Arctic Surfing', '/us/en/magazine/arctic-surfing', 'We traveled to Northern Norway to document the joy of surfing in extreme, but breathtakingly beautiful conditions.'],
  ['San Diego Surf Spots', '/us/en/magazine/san-diego-surf', 'Best beach breaks'],
  ['Ski Touring', '/us/en/magazine/ski-touring', 'Learn about our ski touring experience and how it differs from traditional downhill skiing and even backcountry skiing.'],
];

const SAMPLE_SUMMARY = 'WKND offers guided adventures around the world — from surf camps in Bali and Costa Rica to rock climbing in New Zealand and Colorado — plus magazine stories on surfing, skiing and skating.';

export default function parse(element, { document }) {
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const q = (sel) => element.querySelector(sel);

  const input = q('input.cmp-contentaisearch__input');
  const placeholder = (input && input.getAttribute('placeholder'))
    || 'Search WKND adventures, magazine stories, and more...';
  const toggle = text(q('label.cmp-contentaisearch__ai-toggle')) || 'Show AI-generated summary';
  const summaryTitle = text(q('.cmp-contentaisearch__summary-title')) || 'Generative answer';
  const attribution = text(q('.cmp-contentaisearch__summary-attribution'));
  const disclaimer = text(q('.cmp-contentaisearch__disclaimer'))
    || 'AI-generated responses may be inaccurate. Verify important information before you travel.';
  const tryAgain = text([...element.querySelectorAll('button')].find((b) => /try again/i.test(text(b)))) || 'Try again';
  const loadMore = text(q('.cmp-contentaisearch__load-more')) || 'Load more results';

  const p = (content) => {
    const el = document.createElement('p');
    el.textContent = content;
    return el;
  };

  const title = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = summaryTitle;
  title.append(strong);
  const summaryCell = [title, p(SAMPLE_SUMMARY)];
  if (attribution) summaryCell.push(p(attribution));

  const cells = [
    ['Placeholder', placeholder],
    ['Toggle', toggle],
    ['Summary', summaryCell],
    ['Disclaimer', disclaimer],
    ['Try Again', tryAgain],
    ['Load More', loadMore],
    ['Page Size', '5'],
  ];

  SAMPLE_RESULTS.forEach(([label, href, desc]) => {
    const h3 = document.createElement('h3');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    h3.append(a);
    cells.push(['Result', [h3, p(desc)]]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'search-ai', cells });
  element.replaceWith(block);
}
