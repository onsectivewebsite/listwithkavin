# ListWithKavin.ca

A complete, multi-page real estate website for **Kavin** — a Calgary-based real estate agent. Built with pure HTML, CSS, and vanilla JavaScript (zero framework dependencies, zero build step). Drop it on any static host and it runs.

---

## Quick start

```bash
# Option A — open directly
open index.html      # macOS
# (or just double-click index.html in your file manager)

# Option B — serve locally (recommended; some browsers restrict file:// JS)
cd kavin
python3 -m http.server 8000
# then visit http://localhost:8000
```

Deploys cleanly to Netlify, Vercel, GitHub Pages, Cloudflare Pages, or any static host. No build configuration needed.

---

## Project structure

```
kavin/
├── index.html          # Home
├── about.html          # About Kavin
├── buyers.html         # Buyer resources, mortgage calc, AI recs
├── sellers.html        # AI valuation + CMA request
├── listings.html       # Filtered property grid + lightbox
├── testimonials.html   # Client reviews + Google badge
├── blog.html           # Blog index
├── blog-post.html      # Sample inner blog post
├── contact.html        # Contact form, Calendly placeholder, map
├── neighborhoods.html  # Deep-dive guide to 8 Calgary neighborhoods
├── privacy.html        # Privacy policy (template)
├── terms.html          # Terms of use (template)
├── 404.html            # Custom Not Found page
├── styles.css          # Single master stylesheet
├── main.js             # Chatbot, lightbox, filters, valuation, etc.
├── listings.js         # Mock Calgary listings dataset
├── favicon.svg         # SVG favicon (K monogram)
├── og-image.svg        # 1200×630 social sharing preview
├── sitemap.xml         # Search engine sitemap
├── robots.txt          # Crawler directives
├── netlify.toml        # Netlify deploy config (headers, redirects, 404)
├── vercel.json         # Vercel deploy config
└── README.md
```

---

## Brand tokens

Defined as CSS custom properties in `styles.css` (top of file). Change once, propagate everywhere.

| Token        | Value      | Usage                       |
|--------------|------------|-----------------------------|
| `--navy`     | `#0A1628`  | Primary brand color         |
| `--gold`     | `#C9A84C`  | Accent / CTA highlight      |
| `--charcoal` | `#1E1E2F`  | Body text                   |
| `--white`    | `#FFFFFF`  | Surfaces                    |
| `--serif`    | Playfair Display | Headings              |
| `--sans`     | Inter      | Body                        |

---

## What works out of the box

- **Sticky header** with mobile hamburger menu
- **AI chatbot widget** (decision-tree, opens bottom-right on every page)
- **Multi-step AI valuation form** (Home + Sellers pages) — mock model in `main.js → runValuation()`
- **Lightbox photo gallery** with keyboard nav (←/→/Esc), touch swipe, and thumbnails
- **Smart listing filters** — price range, neighborhood multi-select, type, beds, lifestyle tags
- **AI "Best Match" sort** that re-orders listings by selected lifestyle tags
- **Personalized recommendations** (Buyers page) — filters mock listings by tag
- **Mortgage calculator** (Buyers page) — live monthly payment, principal, interest, total
- **FAQ accordions** (Buyer + Seller pages)
- **Newsletter slide-in popup** — appears after 15s, dismissal stored in sessionStorage
- **Smooth scroll reveals** via IntersectionObserver
- **Embedded Google Map** (Contact page) — generic Calgary embed, swap for your office address
- **Save / Compare listings** — heart icon on every card and in lightbox; floating compare bar shows count + thumbnails on every page; side-by-side compare modal with price-per-sqft analysis; localStorage persists across pages and sessions
- **Mobile responsive** — tested down to 320px width
- **SEO meta tags + OG tags** on every page
- **ARIA labels and keyboard accessibility** throughout

---

## How to add real listings

Edit `listings.js`. Each listing is a plain object — push as many as you want:

```js
{
  id: 'kw-009',                       // unique
  address: '123 Some Street SW',
  neighborhood: 'Aspen Woods',        // must match filter values in listings.html
  price: 1250000,                     // raw number, no formatting
  beds: 4,
  baths: 3.5,
  sqft: 2800,
  type: 'Detached',                   // Detached | Condo | Townhouse | Semi
  status: 'For Sale',
  aiValue: '1,210,000 — 1,290,000',  // display string
  tags: ['Luxury', 'Near Schools'],   // any of the listings.html filter tags
  description: 'Free-text description shown in the lightbox panel.',
  images: [
    _img('009-1', 'Exterior · Front Elevation'),  // helper at top of listings.js
    _img('009-2', 'Great Room'),
    // ...or hand-built: { src: 'https://...', label: '...' }
  ]
}
```

**For a real MLS feed:** replace `window.LISTINGS = [...]` with a `fetch()` call to your MLS provider's JSON endpoint (Repliers, RealtyFeed, IDX Broker, etc.), then transform the response to match the schema above before assigning.

---

## Wiring real photos

The site currently uses [Lorem Picsum](https://picsum.photos) as a stable placeholder image service with **deterministic seeds** (the same seed always returns the same image) so every page looks consistent. All photos render with a graceful fallback: if the network image fails to load, the gradient placeholder underneath stays visible.

### Where photos are used

| Location | How photo is set |
|---|---|
| Listing cards & lightbox | `src` field on each image in `listings.js` |
| Hero feature card (Home) | `--photo` CSS variable in inline `style=` on `.hero__feature--photo` |
| Neighborhood cards (Home) | `--photo` CSS variable in inline `style=` on `.hood-card` |
| Blog cards | `--photo` CSS variable in inline `style=` on `.blog-card__media` |
| Featured blog hero | `background-image: url(...)` inline on the featured article |
| Inner blog post hero | `background-image: url(...)` inline at the top of the article |
| About-block portrait | `--photo` CSS variable in inline `style=` on `.about-block__media` |
| Video testimonial | `background-image: url(...)` inline on the video block |

### Option 1 — Use real Unsplash photos (recommended for production)

[Unsplash](https://unsplash.com) hosts free-to-use real estate photography. Search for "Calgary real estate", "modern home interior", etc., then copy the direct image URL (right-click → "Copy image address" on the image detail page). URLs look like:

```
https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80&auto=format
```

Replace any picsum URL with the Unsplash URL. For listings, edit `listings.js` and swap each `_img(...)` call:

```js
images: [
  { src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80&auto=format',
    label: 'Exterior · Front Elevation' },
  // ...
]
```

For the hero, neighborhood, blog, and about photos, edit the inline `style="--photo: url('...')"` or `style="background-image: url('...')"` directly in the HTML.

### Option 2 — Host photos locally

Create an `images/` directory next to `index.html`, drop your photos in, then reference them relatively:

```js
{ src: 'images/listings/kw-001-exterior.jpg', label: 'Exterior · Front Elevation' }
```

```html
<div class="hero__feature hero__feature--photo"
     style="--photo: url('images/hero/aspen-woods.jpg');">
```

Compress and resize before deploying: 1200px wide @ 80% JPEG quality is usually enough for hero/listing imagery; 800px wide for cards. Tools: [Squoosh](https://squoosh.app), [TinyPNG](https://tinypng.com), or `cwebp` for WebP.

### Bulk swap from picsum

The picsum URLs all share a common prefix: `https://picsum.photos/seed/lwk-`. To find and replace them in one pass:

```bash
# preview every picsum URL in the project
grep -rn 'picsum.photos/seed/lwk-' .

# bulk replace one specific seed with a real URL (macOS sed)
sed -i '' "s|https://picsum.photos/seed/lwk-hero-aspen/900/1100|https://images.unsplash.com/photo-1564013799919-ab600027ffc6|" index.html
```

---

## How to connect a real AI chatbot (OpenAI / Anthropic / etc.)

The chatbot lives in `main.js → initChatbot()`. The `userSend()` function currently does keyword-matching for a decision tree.

**To swap in a real model**, replace the body of `userSend()` with a `fetch()` to your AI provider:

```js
async function userSend() {
  const txt = input.value.trim();
  if (!txt) return;
  say('user', txt);
  input.value = '';

  // Show typing indicator
  const typing = say('bot', '…');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: txt,
        system: "You are Kavin's Calgary real estate assistant. Be warm, brief, professional. Recommend listings.html for browsing and contact.html to book a call."
      })
    });
    const { reply } = await res.json();
    typing.textContent = reply;
  } catch (e) {
    typing.textContent = "Sorry, I'm having trouble connecting. Please email kavin@listwithkavin.ca.";
  }
}
```

You'll need a tiny backend (Netlify Function, Vercel Edge Function, Cloudflare Worker, or your own Node server) that holds your `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`) and forwards the message to `https://api.openai.com/v1/chat/completions` or `https://api.anthropic.com/v1/messages`. **Never** ship API keys in client-side code.

---

## How to embed a real Calendly link

The placeholder lives on `about.html` (CTA section) and `contact.html` (Calendly section). Replace the dashed-border `[ Calendly iframe goes here ]` block with:

```html
<!-- Replace the placeholder div with this -->
<div class="calendly-inline-widget"
     data-url="https://calendly.com/YOUR-USERNAME/discovery-call?primary_color=c9a84c"
     style="min-width:320px;height:680px;"></div>
<script src="https://assets.calendly.com/assets/external/widget.js" async></script>
```

Your Calendly URL is at `calendly.com/YOUR-USERNAME` → Event Type → **Share** → **Embed → Inline Embed**. The `primary_color=c9a84c` query param matches our gold accent.

---

## How to add Google Reviews

The placeholder is in `testimonials.html` near the bottom. Three options, from simplest to most powerful:

### Option 1 — Static link (current placeholder)
Replace `href="#"` on the "View on Google →" button with `https://g.page/r/YOUR-PLACE-ID/review`. Visitors click through to leave / read reviews on Google directly. Zero API setup required.

### Option 2 — Embed a Google Reviews widget
Use a third-party service like [Elfsight](https://elfsight.com/google-reviews-widget/), [Trustmary](https://trustmary.com), or [EmbedSocial](https://embedsocial.com). They give you a `<script>` snippet and an embed `<div>`. Paste both into the placeholder. Most include a free tier.

### Option 3 — Direct Google Places API integration
For full control, hit `https://maps.googleapis.com/maps/api/place/details/json?place_id=YOUR_PLACE_ID&fields=reviews,rating&key=YOUR_API_KEY` from a backend (the API key cannot be safely exposed client-side), render the results in HTML. Note: Google Places returns at most 5 reviews per call and you must follow the [attribution rules](https://developers.google.com/maps/documentation/places/web-service/policies).

To find your Place ID, paste your business name at: https://developers.google.com/maps/documentation/places/web-service/place-id

---

## How to wire forms to a real CRM

All forms in this site have `data-mock` attached and submit to a placeholder. To wire to a real CRM:

1. Remove `data-mock` from the `<form>` element
2. Add `action="..."` and `method="POST"` pointing to your endpoint, OR
3. Use a no-code form service: [Formspree](https://formspree.io), [Basin](https://usebasin.com), [Getform](https://getform.io). Add their endpoint as `action`, drop in their hidden fields, and submissions email you directly.

For real estate CRMs (Follow Up Boss, HubSpot, kvCORE, Chime), use their lead-capture webhook URLs as the form `action`.

---

## How the AI valuation model works (and how to upgrade it)

The mock model lives in `main.js → runValuation()`. It's a simple cost-per-sqft × condition multiplier + bed/bath adjustments — purely illustrative.

For a real valuation:
- Use a service like [HouseCanary](https://www.housecanary.com), [Zillow Zestimate API](https://www.zillow.com/howto/api/APIOverview.htm), or Canadian equivalents
- Or train your own model on your private CMA database and serve via a backend endpoint
- Replace `runValuation()` body with a `fetch()` to that endpoint

---

## Accessibility notes

- All interactive elements are keyboard-reachable
- Chatbot, lightbox, and popups have ARIA roles and labels
- Color contrast meets WCAG AA on body text (navy/charcoal on white, gold/white on navy)
- Mobile menu uses focus trapping (close on link click)
- Forms have visible labels and `required` attributes
- Image placeholders include descriptive labels (swap for real `alt` text when you add real photos)

---

## Performance notes

- Zero JavaScript dependencies (no jQuery, no React, no build step)
- Single CSS file, ~40KB unminified
- Single JS file, ~20KB unminified
- Total page weight under 200KB before you add real images
- Google Fonts preconnected for fast first paint
- Add `loading="lazy"` to every real `<img>` you embed

---

## Going further

- **Real estate IDX feeds**: Repliers, IDX Broker, RealtyFeed
- **Analytics**: drop in a Plausible / Fathom / GA4 script in `<head>` before `</head>` of every page (or just `index.html` if you use a single-page tracker). Plausible example:
  ```html
  <script defer data-domain="listwithkavin.ca" src="https://plausible.io/js/script.js"></script>
  ```
- **A/B testing**: works cleanly with VWO, Optimizely, Google Optimize
- **Heatmaps**: Microsoft Clarity is free and great
- **CRM**: Follow Up Boss is the Canadian realtor standard

---

## Deploying

This site has zero build step — every static host accepts the folder as-is.

### Netlify
1. Drag the project folder onto [app.netlify.com](https://app.netlify.com/drop), or
2. `git init && git push` to GitHub, then connect the repo at Netlify.

`netlify.toml` is already in place — it sets security headers, sensible cache durations, and a 404 fallback to `404.html`.

### Vercel
```bash
npm i -g vercel
cd kavin
vercel
```

`vercel.json` ships the same security headers and image cache rules.

### Other hosts
- **Cloudflare Pages**: connect the repo, leave build command empty, output directory `/`.
- **GitHub Pages**: push to `main`, enable Pages from repository settings.
- **AWS S3 + CloudFront**: sync the folder to a bucket with `aws s3 sync . s3://your-bucket --acl public-read`.

### After deploy

1. Confirm the favicon shows in browser tabs (`favicon.svg`)
2. Paste a page URL into [opengraph.xyz](https://www.opengraph.xyz/) to preview the social card (uses `og-image.svg`)
3. Submit `sitemap.xml` to [Google Search Console](https://search.google.com/search-console)
4. Add the site to [Bing Webmaster Tools](https://www.bing.com/webmasters)
5. Replace `https://listwithkavin.ca/` in `sitemap.xml` and the canonical OG URLs in each HTML file if your domain differs

Questions? Email **kavin@listwithkavin.ca**.

---

*Built with the unfair belief that real estate websites can be beautiful too.*
