(() => {
  // ---- Footer year ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Sticky header shrink + hero title scroll-out ----
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  const heroTitleWrap = document.querySelector('.hero-title-wrap');
  if (header || heroTitleWrap) {
    let scrolled = false;
    const SHRINK_AT = 80;
    let ticking = false;
    const update = () => {
      ticking = false;
      if (header) {
        const now = window.scrollY > SHRINK_AT;
        if (now !== scrolled) {
          scrolled = now;
          header.classList.toggle('scrolled', now);
        }
      }
      if (hero && heroTitleWrap) {
        const rect = hero.getBoundingClientRect();
        const scrollPx = -rect.top;
        const fadeRange = rect.height * 0.55;
        const progress = Math.max(0, Math.min(1, scrollPx / fadeRange));
        heroTitleWrap.style.setProperty('--scroll-out', progress.toFixed(3));
      }
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  // ---- Mobile nav toggle ----
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Scroll-triggered reveal ----
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay !== undefined
            ? Number(entry.target.dataset.delay)
            : Math.min(i * 80, 560);
          setTimeout(() => entry.target.classList.add('visible'), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => io.observe(el));

    // Safety net: any element still hidden after 1.2s (e.g. crawler / screenshot
    // tool that doesn't scroll, prefers-reduced-motion users) gets revealed.
    setTimeout(() => {
      reveals.forEach(el => el.classList.add('visible'));
    }, 1200);
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  // ---- Contact form → mailto fallback ----
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const company = (data.get('company') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      if (!name || !email || !message) {
        form.reportValidity();
        return;
      }

      const subject = `Project enquiry from ${name}${company ? ' (' + company + ')' : ''}`;
      const body =
        `Hi Carter,\n\n${message}\n\n` +
        `— ${name}\n${email}${company ? '\n' + company : ''}`;

      const mailto =
        `mailto:carter@evenbetter.nz?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;
    });
  }
})();
