/* =========================================================
   ListWithKavin.ca — Master JS
   ---------------------------------------------------------
   Sections:
     1. Header scroll / Mobile nav / Active link
     2. Smooth-scroll reveal (IntersectionObserver)
     3. Listings rendering (cards) via safe DOM helpers
     4. Filters (listings page) + AI "Best Match" sort
     5. Lightbox gallery (keyboard / swipe / thumbs)
     6. AI valuation form (multi-step) + mock model
     7. Mortgage calculator
     8. Chatbot widget (decision-tree)
     9. Newsletter slide-in popup
    10. FAQ accordion
    11. Generic mock form handlers
   ---------------------------------------------------------
   NOTE ON HTML INJECTION: this file never inserts free-form
   user input into the DOM. All listing fields come from the
   trusted listings.js dataset and are set via textContent /
   element creation (no innerHTML). Chatbot/user messages go
   through textContent only. To wire to a real backend, keep
   the same pattern: build elements with `el()` below.
   ========================================================= */

(() => {
  'use strict';

  /* ---------- tiny safe DOM helpers ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // el('div', { class: 'foo' }, ['text', el('span', {}, ['hi'])])
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const k in attrs) {
      if (attrs[k] == null) continue;
      if (k === 'class')        node.className = attrs[k];
      else if (k === 'dataset') Object.assign(node.dataset, attrs[k]);
      else if (k === 'style' && typeof attrs[k] === 'object') Object.assign(node.style, attrs[k]);
      else if (k.startsWith('on') && typeof attrs[k] === 'function') node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null || c === false) return;
      node.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
    });
    return node;
  }
  const fmtPrice = (n) => '$' + n.toLocaleString('en-CA');

  /* ---------- 1. HEADER + MOBILE NAV ---------- */
  const header = $('.site-header');
  const navToggle = $('.nav-toggle');
  const navLinks  = $('.nav__links');

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('is-open');
      navLinks.classList.toggle('is-open');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navToggle.classList.remove('is-open');
      navLinks.classList.remove('is-open');
    }));
  }

  // mark active nav link
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  $$('.nav__links a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('is-active');
  });

  /* ---------- 2. REVEAL ON SCROLL ---------- */
  function watchReveals() {
    const revealEls = $$('.reveal:not(.is-visible)');
    if (!revealEls.length) return;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
      revealEls.forEach(el => io.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('is-visible'));
    }
  }
  watchReveals();

  /* Render a listing image. Accepts either:
       - an image object { src, label } → renders <img> (real photo) with gradient fallback
       - a plain string label             → renders gradient-only placeholder
     The gradient placeholder is also used as graceful fallback if the network image fails to load.
  */
  function makePlaceholder(image, seed) {
    const isObj = image && typeof image === 'object';
    const label = isObj ? (image.label || '') : (image || '');
    const src   = isObj ? image.src : null;

    const hues = [212, 38, 200, 24, 220, 34, 210];
    const h1 = hues[seed % hues.length];
    const h2 = (h1 + 25) % 360;

    // Gradient + label fallback element
    const gradient = el('div', {
      class: 'img-placeholder',
      style: {
        background: `linear-gradient(135deg, hsl(${h1} 40% 18%) 0%, hsl(${h2} 30% 10%) 100%)`,
        position: 'absolute', inset: '0',
        display: 'grid', placeItems: 'center',
        color: 'rgba(255,255,255,.55)',
        fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
        textAlign: 'center', padding: '20px'
      }
    }, [
      el('span', { style: { fontSize: '.9rem', letterSpacing: '.05em', maxWidth: '80%' } }, [label])
    ]);

    // Container that always lays out at 100%×100%
    const wrap = el('div', {
      style: { position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }
    });
    wrap.appendChild(gradient);

    if (src) {
      // Real photo on top of the gradient. If it loads, fade in. If it errors, the gradient remains visible.
      const img = el('img', {
        src,
        alt: label,
        loading: 'lazy',
        style: {
          position: 'absolute', inset: '0',
          width: '100%', height: '100%', objectFit: 'cover',
          opacity: '0', transition: 'opacity .5s ease',
          zIndex: '1'
        }
      });
      img.addEventListener('load',  () => { img.style.opacity = '1'; });
      img.addEventListener('error', () => { img.remove(); /* fall back to gradient only */ });
      wrap.appendChild(img);
    }

    return wrap;
  }

  /* ---------- 3. LISTING CARDS ---------- */
  const listingsData = window.LISTINGS || [];

  function buildListingCard(l, idx) {
    const saveBtn = el('button', {
      class: 'save-btn' + (isSaved(l.id) ? ' is-saved' : ''),
      dataset: { save: l.id },
      'aria-label': 'Save listing',
      'aria-pressed': isSaved(l.id) ? 'true' : 'false',
      onclick: (e) => { e.stopPropagation(); toggleSave(l.id); }
    });

    const media = el('div', { class: 'listing-card__media', dataset: { gallery: l.id } }, [
      makePlaceholder(l.images[0] || { label: l.neighborhood }, idx),
      el('span', { class: 'listing-card__badge' }, [l.status]),
      saveBtn,
      el('span', { class: 'listing-card__ai', title: 'AI-Estimated Value' }, [`AI · $${l.aiValue}`]),
      el('span', { class: 'listing-card__gallery-btn' }, [`⊞ ${l.images.length} Photos`])
    ]);

    const meta = el('div', { class: 'listing-card__meta' }, [
      el('span', {}, [el('strong', {}, [String(l.beds)]),  'Beds']),
      el('span', {}, [el('strong', {}, [String(l.baths)]), 'Baths']),
      el('span', {}, [el('strong', {}, [l.sqft.toLocaleString()]), 'SqFt']),
      el('span', {}, [el('strong', {}, [l.type])])
    ]);

    const actions = el('div', { class: 'listing-card__actions' }, [
      el('button', { class: 'btn btn--navy btn--sm', dataset: { gallery: l.id } }, ['View Gallery']),
      el('button', { class: 'btn btn--gold btn--sm', dataset: { showing: l.id } }, ['Schedule Showing'])
    ]);

    const body = el('div', { class: 'listing-card__body' }, [
      el('span', { class: 'listing-card__hood' }, [l.neighborhood]),
      el('h3',   { class: 'listing-card__addr' }, [l.address]),
      el('div',  { class: 'listing-card__price' }, [fmtPrice(l.price)]),
      meta,
      actions
    ]);

    return el('article', { class: 'listing-card reveal', dataset: { id: l.id } }, [media, body]);
  }

  function replaceChildren(parent, nodes) {
    while (parent.firstChild) parent.removeChild(parent.firstChild);
    nodes.forEach(n => parent.appendChild(n));
  }

  // Featured grid (home page) — first 3 listings
  const featuredGrid = $('#featuredListings');
  if (featuredGrid) {
    replaceChildren(featuredGrid, listingsData.slice(0, 3).map((l, i) => buildListingCard(l, i)));
  }

  // Recommendations (buyer page) — filtered subset
  const recGrid = $('#recommendations');
  if (recGrid) {
    const picks = listingsData.filter(l => l.tags.includes('Near Schools')).slice(0, 3);
    replaceChildren(recGrid, picks.map((l, i) => buildListingCard(l, i)));
  }

  // Full listings grid (listings page)
  const fullGrid = $('#allListings');
  if (fullGrid) renderListings(listingsData);

  function renderListings(arr) {
    if (!fullGrid) return;
    if (!arr.length) {
      const empty = el('div', { style: { padding: '60px 20px', textAlign: 'center', color: 'var(--muted)', gridColumn: '1 / -1' } }, [
        el('p', { style: { fontSize: '1.1rem' } }, ['No listings match your filters.']),
        el('p', { style: { fontSize: '.9rem', marginTop: '8px' } }, ['Try widening your price range or removing a lifestyle tag.'])
      ]);
      replaceChildren(fullGrid, [empty]);
    } else {
      replaceChildren(fullGrid, arr.map((l, i) => buildListingCard(l, i)));
    }
    const count = $('#listingCount');
    if (count) {
      replaceChildren(count, [
        el('strong', {}, [String(arr.length)]),
        ' ' + (arr.length === 1 ? 'home' : 'homes') + ' available'
      ]);
    }
    rebindGalleryButtons();
    watchReveals();
  }

  /* ---------- 4. FILTERS ---------- */
  const filterForm = $('#filterForm');
  let currentSort = 'default';

  if (filterForm) {
    filterForm.addEventListener('input',  applyFilters);
    filterForm.addEventListener('change', applyFilters);

    const bestMatchBtn = $('#bestMatchSort');
    if (bestMatchBtn) {
      bestMatchBtn.addEventListener('click', () => {
        currentSort = currentSort === 'best' ? 'default' : 'best';
        bestMatchBtn.classList.toggle('is-active', currentSort === 'best');
        const label = bestMatchBtn.querySelector('.label');
        if (label) label.textContent = currentSort === 'best' ? 'AI Best-Match Active ✓' : 'Best Match for Me';
        applyFilters();
      });
    }

    const maxPrice = $('#maxPrice');
    const maxPriceOut = $('#maxPriceOut');
    if (maxPrice && maxPriceOut) {
      const refresh = () => maxPriceOut.textContent = '$' + Number(maxPrice.value).toLocaleString();
      maxPrice.addEventListener('input', refresh);
      refresh();
    }
  }

  function applyFilters() {
    if (!filterForm) return;
    const data = new FormData(filterForm);
    const maxPrice = Number(data.get('maxPrice')) || Infinity;
    const minPrice = Number(data.get('minPrice')) || 0;
    const hoods = data.getAll('hood');
    const types = data.getAll('type');
    const beds  = Number(data.get('beds')) || 0;
    const tags  = data.getAll('tag');

    let out = listingsData.filter(l => {
      if (l.price < minPrice || l.price > maxPrice) return false;
      if (hoods.length && !hoods.includes(l.neighborhood)) return false;
      if (types.length && !types.includes(l.type)) return false;
      if (beds && l.beds < beds) return false;
      if (tags.length && !tags.every(t => l.tags.includes(t))) return false;
      return true;
    });

    if (currentSort === 'best' && tags.length) {
      out = out.slice().sort((a, b) => {
        const score = (l) => tags.reduce((s, t) => s + (l.tags.includes(t) ? 1 : 0), 0)
                          + (hoods.includes(l.neighborhood) ? 1 : 0);
        return score(b) - score(a);
      });
    }
    renderListings(out);
  }

  /* ---------- 5. LIGHTBOX ---------- */
  const lightbox      = $('#lightbox');
  const lbImage       = $('#lbImage');
  const lbDetails     = $('#lbDetails');
  const lbThumbs      = $('#lbThumbs');
  const lbCounter     = $('#lbCounter');
  const lbPrevBtn     = $('.lightbox__prev');
  const lbNextBtn     = $('.lightbox__next');
  const lbCloseBtn    = $('.lightbox__close');

  let currentListing = null;
  let currentIdx = 0;

  function openGallery(id) {
    const l = listingsData.find(x => x.id === id);
    if (!l || !lightbox) return;
    currentListing = l;
    currentIdx = 0;
    renderLightbox();
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function renderLightbox() {
    if (!currentListing) return;
    const l = currentListing;

    // main image
    replaceChildren(lbImage, [ makePlaceholder(l.images[currentIdx], currentIdx + (l.id.charCodeAt(3) || 1)) ]);

    if (lbCounter) lbCounter.textContent = `${currentIdx + 1} / ${l.images.length} · ${l.images[currentIdx].label}`;

    // details panel
    if (lbDetails) {
      const meta = el('div', { class: 'meta' }, [
        el('span', {}, [el('strong', {}, [String(l.beds)]),  ' Beds']),
        el('span', {}, [el('strong', {}, [String(l.baths)]), ' Baths']),
        el('span', {}, [el('strong', {}, [l.sqft.toLocaleString()]), ' SqFt']),
        el('span', {}, [el('strong', {}, [l.type])])
      ]);

      const showingBtn = el('button', {
        class: 'btn btn--gold',
        dataset: { showing: l.id },
        style: { marginTop: '24px' }
      }, ['Book a Showing']);

      const cmaBtn = el('button', {
        class: 'btn btn--ghost-dark',
        dataset: { cma: l.id },
        style: { marginTop: '8px' }
      }, ['Request Full Info Package']);

      replaceChildren(lbDetails, [
        el('span', { class: 'listing-card__hood' }, [l.neighborhood]),
        el('h3', {}, [l.address]),
        el('div', { class: 'price' }, [fmtPrice(l.price)]),
        meta,
        el('p', { class: 'desc' }, [l.description]),
        el('div', { style: { fontSize: '.78rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' } }, ['AI-Estimated Value']),
        el('div', { style: { fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: 'var(--navy)', fontWeight: '700' } }, [`$${l.aiValue}`]),
        showingBtn, cmaBtn
      ]);
    }

    // thumbnails
    if (lbThumbs) {
      const thumbBtns = l.images.map((im, i) => {
        const b = el('button', {
          dataset: { idx: String(i) },
          class: i === currentIdx ? 'is-active' : '',
          'aria-label': `View image ${i + 1}`,
          onclick: () => { currentIdx = i; renderLightbox(); }
        }, [ makePlaceholder(im, i) ]);
        return b;
      });
      replaceChildren(lbThumbs, thumbBtns);
    }
    bindShowingButtons();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    currentListing = null;
  }
  function navLightbox(dir) {
    if (!currentListing) return;
    const len = currentListing.images.length;
    currentIdx = (currentIdx + dir + len) % len;
    renderLightbox();
  }

  if (lightbox) {
    lbCloseBtn?.addEventListener('click', closeLightbox);
    lbPrevBtn?.addEventListener('click', () => navLightbox(-1));
    lbNextBtn?.addEventListener('click', () => navLightbox(1));
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  navLightbox(-1);
      if (e.key === 'ArrowRight') navLightbox(1);
    });
    // swipe
    let touchX = 0;
    lbImage?.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    lbImage?.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) navLightbox(dx > 0 ? -1 : 1);
    });
    lbImage?.addEventListener('click', (e) => { if (e.target === lbImage) closeLightbox(); });
  }

  function rebindGalleryButtons() {
    $$('[data-gallery]').forEach(el2 => {
      el2.onclick = (e) => { e.stopPropagation(); openGallery(el2.dataset.gallery); };
    });
    bindShowingButtons();
  }
  rebindGalleryButtons();

  function bindShowingButtons() {
    $$('[data-showing]').forEach(b => {
      b.onclick = (e) => {
        e.stopPropagation();
        const l = listingsData.find(x => x.id === b.dataset.showing);
        alert(`Showing requested for ${l?.address || 'this property'}.\n\nKavin's office will reach out within 1 business hour to confirm date & time.\n\n— Demo placeholder: wire this to your CRM (HubSpot, Follow Up Boss, Calendly).`);
      };
    });
    $$('[data-cma]').forEach(b => {
      b.onclick = (e) => {
        e.stopPropagation();
        alert(`Full info package will be sent.\n\n— Demo placeholder.`);
      };
    });
  }

  /* ---------- 6. AI VALUATION FORM ---------- */
  $$('.val-form').forEach(initValForm);

  function initValForm(form) {
    const steps = $$('.val-form__step', form);
    const dots  = $$('.val-form__steps span', form);
    const result = $('.val-result', form);
    let step = 0;

    const showStep = (i) => {
      steps.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
      dots.forEach((d, idx) => d.classList.toggle('is-active', idx <= i));
    };

    form.addEventListener('click', (e) => {
      const next   = e.target.closest('[data-next]');
      const back   = e.target.closest('[data-back]');
      const submit = e.target.closest('[data-submit]');
      if (next) {
        const required = $$('input[required], select[required]', steps[step]);
        for (const r of required) {
          if (!r.value) { r.focus(); r.style.borderColor = '#c0392b'; return; }
          r.style.borderColor = '';
        }
        step = Math.min(step + 1, steps.length - 1);
        showStep(step);
      } else if (back) {
        step = Math.max(step - 1, 0);
        showStep(step);
      } else if (submit) {
        e.preventDefault();
        runValuation(form, result);
      }
    });
  }

  function runValuation(form, resultEl) {
    const data = new FormData(form);
    const sqft = Number(data.get('sqft')) || 1500;
    const beds = Number(data.get('beds')) || 3;
    const baths = Number(data.get('baths')) || 2;
    const condition = data.get('condition') || 'good';
    const type = String(data.get('type') || 'detached').toLowerCase();

    // Mock valuation model — purely illustrative
    const basePerSqft = { detached: 540, semi: 470, townhouse: 430, condo: 560 }[type] || 500;
    const condMult = { excellent: 1.08, good: 1.00, fair: 0.92, dated: 0.85 }[condition] || 1;
    const base = sqft * basePerSqft * condMult;
    const adj = (beds - 3) * 12000 + (baths - 2) * 8000;
    const mid = base + adj;
    const low  = Math.round(mid * 0.96 / 1000) * 1000;
    const high = Math.round(mid * 1.05 / 1000) * 1000;

    if (resultEl) {
      const rangeEl = el('div', { class: 'val-result__range' }, [
        el('span', {}, [fmtPrice(low)]),
        ' – ',
        el('span', {}, [fmtPrice(high)])
      ]);

      const ctaBtn = el('button', {
        class: 'btn btn--gold',
        type: 'button',
        onclick: () => { window.location.href = 'contact.html#contact-form-section'; }
      }, ['Get a Full Comparative Market Analysis']);

      replaceChildren(resultEl, [
        el('div', { class: 'eyebrow' }, ['AI-Generated Valuation']),
        el('p', { style: { color: 'var(--muted)', fontSize: '.9rem', marginBottom: '8px' } }, ['Based on comparable Calgary sales and current market conditions']),
        rangeEl,
        el('p', { class: 'val-result__note' }, [`Estimated market value range · ${condition} condition · ${sqft.toLocaleString()} SqFt`]),
        ctaBtn,
        el('p', { style: { fontSize: '.75rem', color: 'var(--muted)', marginTop: '18px' } }, [
          'This AI estimate is informational only. For a precision valuation, Kavin will personally review your home’s comps within 24 hours.'
        ])
      ]);
      resultEl.classList.add('is-shown');
      $$('.val-form__step', resultEl.closest('.val-form')).forEach(s => s.classList.remove('is-active'));
    }
  }

  /* ---------- 7. MORTGAGE CALCULATOR ---------- */
  const calc = $('#mortgageCalc');
  if (calc) {
    const update = () => {
      const price = Number($('#mcPrice', calc).value) || 0;
      const down  = Number($('#mcDown', calc).value)  || 0;
      const rate  = Number($('#mcRate', calc).value)  || 0;
      const years = Number($('#mcYears', calc).value) || 25;

      const principal = Math.max(price - down, 0);
      const r = (rate / 100) / 12;
      const n = years * 12;
      const monthly = r === 0 ? principal / n : principal * (r * Math.pow(1+r, n)) / (Math.pow(1+r, n) - 1);

      $('#mcMonthly', calc).textContent = monthly && isFinite(monthly)
        ? '$' + monthly.toLocaleString('en-CA', { maximumFractionDigits: 0 })
        : '—';
      $('#mcPrincipal', calc).textContent = '$' + principal.toLocaleString('en-CA');
      $('#mcInterest', calc).textContent  = '$' + Math.max(0, (monthly * n) - principal).toLocaleString('en-CA', { maximumFractionDigits: 0 });
      $('#mcTotal', calc).textContent     = '$' + (monthly * n).toLocaleString('en-CA', { maximumFractionDigits: 0 });
    };
    calc.addEventListener('input', update);
    update();
  }

  /* ---------- 8. CHATBOT ---------- */
  const bot = $('#chatbot');
  if (bot) initChatbot(bot);

  function initChatbot(root) {
    const toggle = $('.chatbot__toggle', root);
    const body   = $('#chatBody', root);
    const opts   = $('#chatOptions', root);
    const input  = $('#chatInput', root);
    const sendBtn= $('#chatSend', root);
    let started = false;

    toggle.addEventListener('click', () => {
      root.classList.toggle('is-open');
      if (root.classList.contains('is-open') && !started) {
        started = true;
        say('bot', "Hi 👋 I'm Kavin's AI assistant. I help Calgary buyers and sellers 24/7. What brings you here today?");
        showOptions([
          { label: "I'm buying a home",   next: 'buy' },
          { label: "I'm selling my home", next: 'sell' },
          { label: "Just exploring",      next: 'explore' }
        ]);
      }
    });

    sendBtn.addEventListener('click', userSend);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') userSend(); });

    function userSend() {
      const txt = input.value.trim();
      if (!txt) return;
      say('user', txt);
      input.value = '';
      const t = txt.toLowerCase();
      setTimeout(() => {
        if (t.includes('worth') || t.includes('value') || t.includes('sell')) {
          say('bot', "Great — I can get you an instant AI-powered home value in 60 seconds. Want to start?");
          showOptions([{ label: 'Yes, value my home', href: 'sellers.html#valuation' }, { label: 'Talk to Kavin', href: 'contact.html' }]);
        } else if (t.includes('neighborhood') || t.includes('neighbourhood') || t.includes('aspen') || t.includes('beltline') || t.includes('mahogany') || t.includes('tuscany') || t.includes('inglewood') || t.includes('bridgeland') || t.includes('elbow') || t.includes('west springs')) {
          say('bot', "Kavin has a deep guide on Calgary's 8 most-loved neighborhoods — median prices, vibe, schools, the works.");
          showOptions([{ label: 'Open the Guide', href: 'neighborhoods.html' }, { label: 'Talk to Kavin', href: 'contact.html' }]);
        } else if (t.includes('600') || t.includes('budget') || t.includes('under') || t.includes('price')) {
          say('bot', "I can match you to active Calgary listings in your budget. Browse all or pick a neighborhood?");
          showOptions([{ label: 'Browse Listings', href: 'listings.html' }, { label: 'See Neighborhoods Guide', href: 'neighborhoods.html' }]);
        } else if (t.includes('investment') || t.includes('rental') || t.includes('roi')) {
          say('bot', "Smart play. Bridgeland and the Beltline have strong rental yields right now. Want investor-focused listings?");
          showOptions([{ label: 'See investor picks', href: 'listings.html' }, { label: 'Book a strategy call', href: 'contact.html' }]);
        } else {
          say('bot', "Happy to help with that. Want me to connect you with Kavin directly?");
          showOptions([{ label: 'Yes — book a call', href: 'contact.html' }, { label: 'Browse listings', href: 'listings.html' }]);
        }
      }, 650);
    }

    function say(role, text) {
      const div = el('div', { class: `chat-msg chat-msg--${role}` }, [text]);
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    function showOptions(list) {
      replaceChildren(opts, []);
      list.forEach(o => {
        const b = el('button', {
          onclick: () => {
            say('user', o.label);
            replaceChildren(opts, []);
            if (o.href) {
              setTimeout(() => { say('bot', 'Opening that for you now…'); window.location.href = o.href; }, 600);
              return;
            }
            setTimeout(() => respond(o.next), 600);
          }
        }, [o.label]);
        opts.appendChild(b);
      });
    }

    function respond(key) {
      switch (key) {
        case 'buy':
          say('bot', 'Excellent. Are you a first-time buyer, moving up, or investing?');
          showOptions([
            { label: 'First-time buyer', next: 'firstTime' },
            { label: 'Moving up',        next: 'moveUp' },
            { label: 'Investor',         next: 'investor' }
          ]); break;
        case 'sell':
          say('bot', 'I can give you an instant AI valuation, or set up a free CMA with Kavin. Which works?');
          showOptions([
            { label: 'Get instant AI valuation', href: 'sellers.html#valuation' },
            { label: 'Book free CMA',            href: 'sellers.html#cma' }
          ]); break;
        case 'explore':
          say('bot', 'Sounds good. Peek at Kavin’s featured Calgary listings, read the neighborhoods guide, or browse the blog?');
          showOptions([
            { label: 'Featured listings',     href: 'listings.html' },
            { label: 'Neighborhoods guide',   href: 'neighborhoods.html' },
            { label: 'Market update blog',   href: 'blog.html' }
          ]); break;
        case 'firstTime':
          say('bot', 'Welcome! Kavin specializes in first-time buyers. Start with our step-by-step guide and mortgage tools.');
          showOptions([
            { label: 'Open Buyer Guide', href: 'buyers.html' },
            { label: 'Talk to Kavin',    href: 'contact.html' }
          ]); break;
        case 'moveUp':
          say('bot', 'Selling and buying simultaneously? Kavin runs a coordinated dual-transaction strategy — let’s set up a quick call.');
          showOptions([
            { label: 'Book consultation',   href: 'contact.html' },
            { label: 'See luxury listings', href: 'listings.html' }
          ]); break;
        case 'investor':
          say('bot', 'Calgary has some of the strongest rental yields in Canada right now. Want the latest investor data?');
          showOptions([
            { label: 'See investment listings', href: 'listings.html' },
            { label: 'Read market update',     href: 'blog.html' }
          ]); break;
        case 'hoodNW':
          say('bot', 'NW Calgary — Tuscany, Edgemont, Citadel. Family-focused with great schools. Browse these and more:');
          showOptions([{ label: 'See NW listings', href: 'listings.html' }]); break;
        case 'hoodSW':
          say('bot', 'SW Calgary — Aspen Woods, Elbow Park, West Springs. Luxury territory. Want a tailored list?');
          showOptions([{ label: 'See SW listings', href: 'listings.html' }]); break;
      }
    }
  }

  /* ---------- 9. NEWSLETTER POPUP ---------- */
  const popup = $('#newsletterPopup');
  if (popup && !sessionStorage.getItem('newsletterDismissed')) {
    setTimeout(() => popup.classList.add('is-shown'), 15000);
    $('.newsletter-popup__close', popup)?.addEventListener('click', () => {
      popup.classList.remove('is-shown');
      sessionStorage.setItem('newsletterDismissed', '1');
    });
    $('form', popup)?.addEventListener('submit', (e) => {
      e.preventDefault();
      replaceChildren(popup, [
        el('h4', {}, ["You're on the list ✨"]),
        el('p', {}, ["Watch your inbox for Kavin's monthly Calgary market briefing."])
      ]);
      sessionStorage.setItem('newsletterDismissed', '1');
      setTimeout(() => popup.classList.remove('is-shown'), 3500);
    });
  }

  /* ---------- 10. ACCORDION ---------- */
  $$('.accordion__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion__item');
      const open = item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.accordion__item').forEach(i => i.classList.remove('is-open'));
      if (!open) item.classList.add('is-open');
    });
  });

  /* ---------- 11. GENERIC FORMS ---------- */
  $$('form[data-mock]').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const successId = f.dataset.success;
      const successEl = successId ? document.getElementById(successId) : null;
      if (successEl) {
        successEl.style.display = 'block';
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        f.style.display = 'none';
      } else {
        alert(`Thanks — Kavin's team will be in touch within 1 business hour.\n\n— Demo placeholder.`);
        f.reset();
      }
    });
  });

  $('#quickSearchForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.href = 'listings.html';
  });

  /* =========================================================
     SAVE / COMPARE — persists across pages via localStorage
     - Heart icon on every listing card and in the lightbox
     - Floating bottom bar shows count & quick-open button
     - Modal compares saved listings side-by-side
     ========================================================= */
  const SAVE_KEY = 'lwk-saved';
  let savedSet;
  try {
    savedSet = new Set(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
  } catch (_) {
    savedSet = new Set();
  }

  function isSaved(id) { return savedSet.has(id); }

  function toggleSave(id) {
    if (savedSet.has(id)) savedSet.delete(id);
    else                  savedSet.add(id);
    persistSaved();
    refreshSaveUI();
    renderCompareBar();
    // If the modal is open, re-render its grid to reflect the change
    if (compareModal?.classList.contains('is-open')) renderCompareModal();
  }
  function clearSaved() {
    savedSet.clear();
    persistSaved();
    refreshSaveUI();
    renderCompareBar();
    if (compareModal?.classList.contains('is-open')) renderCompareModal();
  }
  function persistSaved() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify([...savedSet])); } catch (_) {}
  }
  function refreshSaveUI() {
    // Card save buttons (heart icon, .save-btn class)
    $$('.save-btn').forEach(b => {
      const on = savedSet.has(b.dataset.save);
      b.classList.toggle('is-saved', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    // Lightbox save button (text style, no heart-from-CSS)
    $$('button[data-save-lightbox]').forEach(b => {
      const on = savedSet.has(b.dataset.save);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? '♥  Saved to Compare' : '♡  Save Listing';
      b.style.background = on ? 'var(--navy)' : 'transparent';
      b.style.color      = on ? 'var(--white)' : 'var(--navy)';
    });
  }

  /* Build the floating bar lazily on first call */
  let compareBar = null;
  function ensureCompareBar() {
    if (compareBar) return compareBar;
    compareBar = el('aside', { class: 'compare-bar', id: 'compareBar', role: 'region', 'aria-label': 'Saved listings' }, [
      el('span', { class: 'compare-bar__count', id: 'compareCount' }, ['0 saved']),
      el('span', { class: 'compare-bar__thumbs', id: 'compareThumbs' }),
      el('button', { class: 'compare-bar__open', onclick: openCompareModal }, ['Compare →']),
      el('button', {
        class: 'compare-bar__clear',
        'aria-label': 'Clear saved',
        onclick: () => { if (confirm('Clear all saved listings?')) clearSaved(); }
      }, ['×'])
    ]);
    document.body.appendChild(compareBar);
    return compareBar;
  }
  function renderCompareBar() {
    const bar = ensureCompareBar();
    if (savedSet.size === 0) { bar.classList.remove('is-shown'); return; }
    bar.classList.add('is-shown');
    $('#compareCount', bar).textContent = savedSet.size === 1 ? '1 saved' : `${savedSet.size} saved`;
    // Thumbnails — first photo of each saved listing, up to 4
    const thumbsWrap = $('#compareThumbs', bar);
    if (thumbsWrap) {
      while (thumbsWrap.firstChild) thumbsWrap.removeChild(thumbsWrap.firstChild);
      [...savedSet].slice(0, 4).forEach(id => {
        const l = listingsData.find(x => x.id === id);
        if (!l) return;
        const src = l.images[0]?.src;
        const t = el('span', {
          class: 'compare-bar__thumb',
          title: l.address,
          style: src ? { backgroundImage: `url(${src})` } : {}
        });
        thumbsWrap.appendChild(t);
      });
    }
  }

  /* Compare modal — built lazily */
  let compareModal = null;
  function ensureCompareModal() {
    if (compareModal) return compareModal;
    const head = el('div', { class: 'compare-modal__head' }, [
      el('h2', {}, [
        document.createTextNode('Compare Your '),
        el('em', {}, ['Saved Listings'])
      ])
    ]);
    const grid = el('div', { class: 'compare-grid', id: 'compareGrid' });
    compareModal = el('div', { class: 'compare-modal', id: 'compareModal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Compare saved listings' }, [
      el('button', {
        class: 'compare-modal__close',
        'aria-label': 'Close compare',
        onclick: closeCompareModal
      }, ['×']),
      el('div', { class: 'compare-modal__inner' }, [head, grid])
    ]);
    document.body.appendChild(compareModal);
    // Close on backdrop click
    compareModal.addEventListener('click', (e) => {
      if (e.target === compareModal) closeCompareModal();
    });
    return compareModal;
  }
  function openCompareModal() {
    ensureCompareModal();
    renderCompareModal();
    compareModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeCompareModal() {
    if (!compareModal) return;
    compareModal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function renderCompareModal() {
    if (!compareModal) return;
    const grid = $('#compareGrid', compareModal);
    if (!grid) return;
    while (grid.firstChild) grid.removeChild(grid.firstChild);

    if (savedSet.size === 0) {
      grid.appendChild(el('div', { class: 'compare-empty', style: { gridColumn: '1 / -1' } }, [
        el('h3', {}, ['No saved listings yet']),
        el('p', {}, ['Click the heart on any listing card to start comparing.']),
        el('a', { href: 'listings.html', class: 'btn btn--gold', style: { marginTop: '20px' } }, ['Browse Listings'])
      ]));
      return;
    }

    [...savedSet].forEach(id => {
      const l = listingsData.find(x => x.id === id);
      if (!l) return;
      const media = el('div', {
        class: 'compare-card__media',
        style: l.images[0]?.src ? { backgroundImage: `url(${l.images[0].src})` } : {}
      }, [
        el('button', {
          class: 'compare-card__remove',
          'aria-label': 'Remove from compare',
          onclick: () => toggleSave(l.id)
        }, ['×'])
      ]);

      grid.appendChild(el('article', { class: 'compare-card' }, [
        media,
        el('div', { class: 'compare-card__body' }, [
          el('div', { class: 'compare-card__hood' }, [l.neighborhood]),
          el('h3', { class: 'compare-card__addr' }, [l.address]),
          el('div', { class: 'compare-card__price' }, [fmtPrice(l.price)]),
          el('div', { class: 'compare-card__row' }, [ el('span', {}, ['Beds']),     el('span', {}, [String(l.beds)]) ]),
          el('div', { class: 'compare-card__row' }, [ el('span', {}, ['Baths']),    el('span', {}, [String(l.baths)]) ]),
          el('div', { class: 'compare-card__row' }, [ el('span', {}, ['SqFt']),     el('span', {}, [l.sqft.toLocaleString()]) ]),
          el('div', { class: 'compare-card__row' }, [ el('span', {}, ['$ / SqFt']), el('span', {}, ['$' + Math.round(l.price / l.sqft).toLocaleString('en-CA')]) ]),
          el('div', { class: 'compare-card__row' }, [ el('span', {}, ['Type']),     el('span', {}, [l.type]) ]),
          el('div', { class: 'compare-card__row' }, [ el('span', {}, ['AI Value']), el('span', {}, ['$' + l.aiValue]) ]),
          el('a', {
            href: 'listings.html',
            class: 'btn btn--gold',
            style: { marginTop: '20px', display: 'block', textAlign: 'center' }
          }, ['View Listing'])
        ])
      ]));
    });
  }

  // Esc closes the compare modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && compareModal?.classList.contains('is-open')) closeCompareModal();
  });

  // Initialize on load — bar appears if there are saved items from a previous visit
  renderCompareBar();

  /* Lightbox: inject a save button into the details panel whenever it's re-rendered.
     Uses inline styles (no .save-btn class) to avoid the CSS heart ::before pseudo-element. */
  if (lbDetails) {
    new MutationObserver(() => {
      if (!currentListing) return;
      if ($('button[data-save-lightbox]', lbDetails)) return;
      const id = currentListing.id;
      const on = isSaved(id);
      const btn = el('button', {
        type: 'button',
        dataset: { save: id, saveLightbox: '1' },
        'aria-label': 'Save this listing for compare',
        'aria-pressed': on ? 'true' : 'false',
        style: {
          display: 'block',
          width: '100%',
          padding: '14px 20px',
          borderRadius: '4px',
          background: on ? 'var(--navy)' : 'transparent',
          color: on ? 'var(--white)' : 'var(--navy)',
          border: '1px solid var(--navy)',
          fontWeight: '600',
          fontSize: '.75rem',
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          marginTop: '10px',
          cursor: 'pointer'
        },
        onclick: (e) => { e.stopPropagation(); toggleSave(id); }
      });
      btn.textContent = on ? '♥  Saved to Compare' : '♡  Save Listing';
      lbDetails.appendChild(btn);
    }).observe(lbDetails, { childList: true });
  }

})();
