/* ============================================================
   WEST EURO AUTO LTD — interactions
   ============================================================ */

(() => {
  'use strict';

  /* ---------- NAV: scrolled state + section colour ---------- */
  const nav = document.getElementById('nav');
  const sections = [
    { sel: '.hero',     light: false },
    { sel: '.story',    light: true  },
    { sel: '.foreman',  light: false },
    { sel: '.services', light: true  },
    { sel: '.rates',    light: false },
    { sel: '.brands',   light: true  },
    { sel: '.find',     light: false },
    { sel: '.contact',  light: true  },
    { sel: '.foot',     light: false },
  ].map(s => ({ ...s, el: document.querySelector(s.sel) })).filter(s => s.el);

  let ticking = false;

  function updateNav() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 30);

    const probe = y + 64;
    let cur = sections[0];
    for (const s of sections) {
      if (s.el.offsetTop <= probe) cur = s;
      else break;
    }
    nav.classList.toggle('is-light', !!cur.light);

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });
  updateNav();

  /* ---------- BURGER ---------- */
  const burger = document.getElementById('burger');
  const panel  = document.getElementById('navPanel');
  burger?.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    panel.setAttribute('aria-hidden', String(open));
    panel.classList.toggle('is-open', !open);
    document.body.style.overflow = !open ? 'hidden' : '';
  });
  panel?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      panel.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  /* ---------- YEAR DROPDOWN (2026 → 1980) ---------- */
  const yearSelect = document.getElementById('yearSelect');
  if (yearSelect) {
    const frag = document.createDocumentFragment();
    for (let y = 2026; y >= 1980; y--) {
      const opt = document.createElement('option');
      opt.value = String(y);
      opt.textContent = String(y);
      frag.appendChild(opt);
    }
    yearSelect.appendChild(frag);
  }

  /* ---------- CONTACT FORM (mailto, no backend) ---------- */
  const form = document.getElementById('enquiryForm');
  const sent = document.getElementById('sentMsg');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const subject = `Enquiry — ${data.make || 'Vehicle'} ${data.model || ''} (${data.rego || 'no rego'})`;
    const body =
      `Hi Nick,\n\n` +
      `${data.message || ''}\n\n` +
      `— Vehicle ——————————\n` +
      `Make:   ${data.make || ''}\n` +
      `Model:  ${data.model || ''}\n` +
      `Year:   ${data.year || ''}\n` +
      `Rego:   ${data.rego || ''}\n\n` +
      `— Contact —————————\n` +
      `Name:   ${data.name || ''}\n` +
      `Phone:  ${data.phone || ''}\n` +
      `Email:  ${data.email || ''}\n`;

    const href =
      `mailto:Nick@WestEuroAuto.co.nz?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = href;

    if (sent) sent.textContent = "Opening your mail app… if nothing happens, call 09 833 1190.";
  });

  /* ---------- SCROLL REVEAL ---------- */
  const targets = document.querySelectorAll(
    '.sec__head, .story__copy, .story__plate, .foreman__photo, .foreman__copy, ' +
    '.svc, .rates__card, .brands__list, .find__map, .find__card, ' +
    '.contact__info, .contact__form'
  );
  targets.forEach(t => t.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  targets.forEach(t => io.observe(t));

  /* ---------- HERO PARALLAX (mouse + scroll) ---------- */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const blobs = hero ? [...hero.querySelectorAll('.blob')] : [];

  if (!reduced && hero && blobs.length) {
    // per-blob depth weights — mouse XY + scroll Y
    const layers = [
      { mx: 28, my: 22, sy: -0.18 },  // blob 1 — far back
      { mx: 58, my: 40, sy: -0.30 },  // blob 2 — mid
      { mx: 88, my: 60, sy: -0.42 },  // blob 3 — closest
      { mx: 42, my: 30, sy: -0.24 },  // blob 4 — mid
    ];

    let mxTarget = 0, myTarget = 0;
    let mxCur = 0,    myCur = 0;
    let scY = 0;
    let inView = true;
    let trackingMouse = false;

    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const rect = hero.getBoundingClientRect();
      mxTarget = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      myTarget = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
      trackingMouse = true;
    });
    hero.addEventListener('pointerleave', () => {
      mxTarget = 0;
      myTarget = 0;
      trackingMouse = false;
    });

    // pause when hero is off-screen
    const vis = new IntersectionObserver(
      (entries) => { inView = entries[0].isIntersecting; },
      { threshold: 0, rootMargin: '100px 0px' }
    );
    vis.observe(hero);

    const tick = () => {
      if (inView) {
        // lerp toward target for buttery motion
        mxCur += (mxTarget - mxCur) * 0.07;
        myCur += (myTarget - myCur) * 0.07;
        scY = window.scrollY;

        for (let i = 0; i < blobs.length; i++) {
          const l = layers[i] || layers[0];
          const tx = mxCur * l.mx;
          const ty = myCur * l.my + scY * l.sy;
          // `translate` composes with the existing `transform: translate(...) scale(...)` keyframe
          blobs[i].style.translate = `${tx.toFixed(2)}px ${ty.toFixed(2)}px`;
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- SECTION SCROLL PARALLAX ---------- */
  const pSections = document.querySelectorAll(
    '.story, .foreman, .services, .rates, .brands, .find, .contact, .foot'
  );

  if (!reduced && pSections.length) {
    const pVisible = new Set();
    const pObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) pVisible.add(e.target);
          else pVisible.delete(e.target);
        });
      },
      { rootMargin: '30% 0px 30% 0px', threshold: 0 }
    );
    pSections.forEach(s => pObs.observe(s));

    const writeScroll = () => {
      const vh = window.innerHeight;
      const vMid = vh / 2;
      pVisible.forEach(s => {
        const rect = s.getBoundingClientRect();
        const sMid = rect.top + rect.height / 2;
        // -1..+1 as section center moves from viewport bottom to top
        const scroll = (vMid - sMid) / vh;
        s.style.setProperty('--scroll', scroll.toFixed(3));
      });
    };

    // Compute initial values for anything already on screen — no first-paint snap.
    pSections.forEach(s => {
      const rect = s.getBoundingClientRect();
      if (rect.bottom > -window.innerHeight * 0.3 && rect.top < window.innerHeight * 1.3) {
        pVisible.add(s);
      }
    });
    writeScroll();

    let lastY = window.scrollY;
    const pTick = () => {
      const y = window.scrollY;
      if (y !== lastY && pVisible.size) {
        writeScroll();
        lastY = y;
      }
      requestAnimationFrame(pTick);
    };
    requestAnimationFrame(pTick);
  }

  /* ---------- SMOOTH SCROLL (offset for sticky nav) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
