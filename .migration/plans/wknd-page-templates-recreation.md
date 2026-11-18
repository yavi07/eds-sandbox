# WKND Site: Page Templates and Pixel-Perfect Recreation Plan

## 1. Page templates found on wknd.site (US English)

I went through the homepage, the main navigation and the links on every page type. The US English site uses **8 page templates**:

| # | Template | Example URL | Pages (approx.) | Main sections, top to bottom |
|---|----------|-------------|-----------------|------------------------------|
| 1 | **Homepage** | `/us/en.html` | 1 | Welcome hero with a call to action → carousel of 3 featured adventures → featured article (camping) → "Recent Articles" with 4 cards → "Next Adventures" (climbing) → "Where do you want to go?" with 4 options |
| 2 | **Magazine Landing** | `/us/en/magazine.html` | 1 | Featured article (Western Australia) → "All Articles" grid with 4 cards → "Members Only" callout (asks you to sign in) → 2 teasers (Alaskan Adventure, Fly Fishing the Amazon) |
| 3 | **Magazine Article** | `/us/en/magazine/*.html` | 5 (Arctic Surfing, San Diego Surf, Ski Touring, LA Skateparks, Western Australia) | Full-width hero image → breadcrumb → title and byline → long article text with images and pull quotes → author bio with social links → share buttons → 4 related articles |
| 4 | **Adventures Landing** | `/us/en/adventures.html` | 1 | Title and tagline → hero image with caption → "Current Adventures" with filter tabs (All, Climbing, Cycling, Skiing, Surfing, Travel) → list of adventures for each tab |
| 5 | **Adventure Detail** | `/us/en/adventures/*.html` | 16 (Bali Surf Camp, Beervana Portland, Climbing New Zealand, Colorado Rock Climbing, Cycling Southern Utah, Cycling Tuscany, Downhill Skiing Wyoming, Gastronomic Marais Tour, Napa Wine Tasting, Riverside Camping, Ski Touring Mont Blanc, Surf Camp Costa Rica, Tahoe Skiing, West Coast Cycling, Whistler Mountain Biking, Yosemite Backpacking) | Image carousel (3 images) → title and quick facts (activity, trip length, group size, difficulty, price) → Pinterest share → tabs for Overview, Itinerary and What to Bring |
| 6 | **FAQ** | `/us/en/faqs.html` | 1 | Hero image with caption → intro text → FAQ accordion (7 questions) → "Need more help?" contact box |
| 7 | **About Us** | `/us/en/about-us.html` | 1 | Page title → "Contributors" profile cards (4 people) → "WKND Guides" profile cards (3 people), each card with photo, role and social links |
| 8 | **AI-Powered Search** | `/us/en/ai-powered-search.html` | 1 | Search box with an "AI-generated summary" toggle, a loading state, a disclaimer, "Try again" and "Load more results". This content is generated live, not written by authors. |

**Shared on every page:** the header (country and language picker, WKND logo, navigation, Sign In) and the footer (logo, navigation, social icons, copyright and disclaimer text).

**Other languages:** the same structure exists for 10 more country and language versions (`/us/es`, `/ca/en`, `/ca/fr`, `/ch/de`, `/ch/fr`, `/ch/it`, `/de/de`, `/fr/fr`, `/es/es`, `/it/it`). In total that is about **27 pages for US English** and about **270 pages across all languages**.

> These counts come from links on the site's pages. In step 1 I'll check them against the sitemap or a full crawl, which can turn up pages not linked from the navigation, such as error or members-only pages.

## 2. What the project already has

- **Blocks:** banner, cards, columns, footer, fragment, header, hero, widget
- **Content source:** Document Authoring (`yavi07/eds-sandbox`)
- **No site catalog and no import scripts yet**

## 3. Block needs by template

| Block or feature | Used by | Status |
|---|---|---|
| Header with country and language picker | All | Exists, needs restyling and the picker |
| Footer | All | Exists, needs restyling |
| Hero, with caption and full-width variants | Home, Article, Adventures, FAQ | Exists, needs variants |
| Carousel | Home (featured), Adventure Detail (images) | New |
| Cards: article, adventure and profile variants | Home, Magazine, Article (related), Adventures, About Us | Exists, needs variants |
| Teaser or featured article (image and text side by side) | Home, Magazine | Use columns or a new teaser block |
| Tabs | Adventures (filters), Adventure Detail | New |
| Accordion | FAQ | New |
| Breadcrumb | Article | New, can be built automatically |
| Byline and author bio | Article | New |
| Quote | Article | New |
| Social share | Article, Adventure Detail | New |
| Adventure quick facts | Adventure Detail | New, or a columns variant |
| Members-only callout | Magazine | Banner variant, sign-in is static only |
| AI search | AI Search | New widget that runs in the browser. It needs a decision (see below). |

## 4. Approach

1. **Find all pages and build the catalog.** Collect every URL, group the pages into the 8 templates above and create the site catalog.
2. **Bring over the site-wide design.** Copy fonts, colors, spacing and breakpoints from the original site into the global styles.
3. **Header and footer.** Rebuild both to match, on desktop and mobile, including the country and language picker.
4. **Migrate the templates one at a time, simplest first:** FAQ → About Us → Magazine Article → Adventure Detail → Adventures Landing → Magazine Landing → Homepage → AI Search. For each template:
   - analyse the page and name the block variants
   - map the blocks, then build the import scripts and run the import for every page in the template
   - style the blocks using the original site's measured styles
5. **Pixel-perfect check.** Compare each block and full page side by side against the original at desktop, tablet and mobile widths, and fix any differences. Then compare every page across the site.
6. **Other languages.** After US English is approved, run the same import scripts on the other language versions.
7. **Hand-off.** Commit the code on a branch and open a PR with the required preview links. Content stays local unless you explicitly ask me to upload it to Document Authoring or preview it.

## 5. Decisions needed before starting

- **Language scope:** US English only first (my recommendation), or all 11 languages?
- **AI-Powered Search:** rebuild only the look with sample results, connect it to a real search service, or leave it out?
- **Members-only and Sign In:** copy only the look (my recommendation), or also build a working login?
- **What "pixel-perfect" means:** which screen widths to match (for example 375, 768, 1200 and 1440 px) and how much difference is acceptable.

## Checklist

- [ ] Confirm language scope, AI search approach, members-only handling and the screen widths to match
- [ ] Collect every URL from the sitemap or a crawl and confirm the page count for each template
- [ ] Create the site catalog with the 8 templates and their pages
- [ ] Bring over the site-wide design: fonts, colors, spacing, buttons, breakpoints
- [ ] Rebuild the header, including the country and language picker, for desktop and mobile
- [ ] Rebuild the footer for desktop and mobile
- [ ] Migrate the FAQ template (accordion, contact box)
- [ ] Migrate the About Us template (profile cards)
- [ ] Migrate the Magazine Article template (5 pages: breadcrumb, byline, quote, author bio, share, related cards)
- [ ] Migrate the Adventure Detail template (16 pages: image carousel, quick facts, tabs)
- [ ] Migrate the Adventures Landing template (filter tabs and adventure cards)
- [ ] Migrate the Magazine Landing template (featured article, article grid, members-only callout, teasers)
- [ ] Migrate the Homepage template (hero, featured carousel, recent articles, next adventures, destinations)
- [ ] Build the AI-Powered Search page in the way you choose
- [ ] Compare every block and page against the original at all chosen screen widths and fix differences
- [ ] Compare the full site page by page and confirm everything matches
- [ ] (If in scope) Import and check the other 10 language versions
- [ ] Commit the code on a branch and open a PR with preview links

*Plan mode is on, so I can't make any changes yet. Switch to Execute mode and I'll start with the first checklist item.*
