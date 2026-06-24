const light = document.querySelector(".light");
const flashlightSection = document.querySelector(".flashlight-section");

function moveLight(x, y) {
  const px = (x / window.innerWidth) * 100;
  const py = (y / window.innerHeight) * 100;

  light.style.background = `radial-gradient(
    circle at ${px}% ${py}%,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.4) 8.5%,
    rgba(0, 0, 0, 0.6) 9.5%,
    rgba(0, 0, 0, 0.9) 11%,
    rgba(0, 0, 0, 1) 15%,
    rgba(0, 0, 0, 1) 100%
  )`;
}

// Desktop: follow the cursor while over the flashlight section.
flashlightSection.addEventListener("mousemove", (e) => {
  moveLight(e.clientX, e.clientY);
});

// Touch: follow the finger, nudged above the fingertip so the revealed
// text isn't hidden under it. Bound to the section (not window) so the
// cards section below can still scroll normally.
const TOUCH_OFFSET_Y = 56;

function handleTouch(e) {
  if (!e.touches.length) return;
  const t = e.touches[0];
  moveLight(t.clientX, t.clientY - TOUCH_OFFSET_Y);
}

flashlightSection.addEventListener("touchstart", handleTouch, { passive: false });
flashlightSection.addEventListener("touchmove", (e) => {
  e.preventDefault(); // lock scrolling on the flashlight section only
  handleTouch(e);
}, { passive: false });

// Scroll-down button → smooth scroll to the cards section.
const scrollBtn = document.getElementById("scrollDown");
const cardsSection = document.getElementById("cards");

if (scrollBtn && cardsSection) {
  scrollBtn.addEventListener("click", () => {
    cardsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// Reveal section-header + cards on scroll, with a light stagger.
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = Number(el.dataset.revealDelay) || 0;
    setTimeout(() => el.classList.add("is-visible"), delay);
    revealObserver.unobserve(el);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

revealEls.forEach((el, i) => {
  el.dataset.revealDelay = i === 0 ? 0 : (i - 1) * 80;
  revealObserver.observe(el);
});

// ---------------------------------------------------------------------------
// Neon white waves — animated background for the cards section.
// Adapted from demos/ocean_waves: sized to the section (not the window),
// recolored to translucent white with glowing crests, anchored to the bottom
// band, paused while off-screen, and reduced-motion aware.
// ---------------------------------------------------------------------------
(function () {
  const section = document.querySelector(".cards-section");
  const canvas = document.querySelector(".waves-canvas");
  if (!section || !canvas) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0;
  let h = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = section.offsetWidth;
    h = section.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(section);
  } else {
    window.addEventListener("resize", resize);
  }
  resize();

  class Wave {
    constructor(amp, length, speed, offset, fillAlpha, lineAlpha) {
      this.amp = amp;
      this.length = length;
      this.speed = speed;
      this.offset = offset;
      this.fillAlpha = fillAlpha;
      this.lineAlpha = lineAlpha;
    }

    draw(time) {
      const baseline = h - Math.min(h * 0.55, 360);

      // Translucent white body filled down to the bottom.
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) {
        const y = Math.sin(x * this.length + time * this.speed + this.offset) * this.amp;
        ctx.lineTo(x, baseline + y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.fillAlpha})`;
      ctx.fill();

      // Glowing neon crest.
      ctx.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const y = baseline + Math.sin(x * this.length + time * this.speed + this.offset) * this.amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.lineAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  const waves = [
    new Wave(80, 0.006, 0.0007, 5, 0.035, 0.12),
    new Wave(55, 0.008, 0.0010, 2, 0.050, 0.20),
    new Wave(35, 0.010, 0.0015, 0, 0.070, 0.38),
  ];

  // White glow that follows the cursor (off-canvas until the pointer enters).
  let glowX = -9999;
  let glowY = -9999;

  section.addEventListener("mousemove", (e) => {
    const rect = section.getBoundingClientRect();
    glowX = e.clientX - rect.left;
    glowY = e.clientY - rect.top;
  });
  section.addEventListener("mouseleave", () => {
    glowX = -9999;
    glowY = -9999;
  });

  function drawGlow() {
    if (glowX < -1000) return;
    const g = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 260);
    g.addColorStop(0, "rgba(255, 255, 255, 0.16)");
    g.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function render(time) {
    ctx.clearRect(0, 0, w, h);
    waves.forEach((wave) => wave.draw(time));
    drawGlow();
  }

  let rafId = null;
  function loop(time) {
    render(time);
    rafId = requestAnimationFrame(loop);
  }

  if (reduceMotion) {
    render(0);
  } else {
    // Only run the animation loop while the cards section is visible.
    const visObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && rafId === null) {
          rafId = requestAnimationFrame(loop);
        } else if (!entry.isIntersecting && rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    }, { threshold: 0 });
    visObserver.observe(section);
  }
})();

// ---------------------------------------------------------------------------
// Section 3 — agent profile card animations (GSAP + ScrollTrigger).
// Rings spin, the photo floats and pops in on scroll, the info staggers up.
// ---------------------------------------------------------------------------
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  // Only run motion when the user hasn't asked for reduced motion.
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Continuously rotating accent rings (opposite directions).
    gsap.to(".agent-ring--outer", { rotation: 360, duration: 26, ease: "none", repeat: -1 });
    gsap.to(".agent-ring--inner", { rotation: -360, duration: 16, ease: "none", repeat: -1 });

    // Gentle floating of the whole photo block.
    gsap.to(".agent-photo", { y: -14, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true });

    // Photo pops in when the card scrolls into view.
    gsap.from(".agent-photo-frame", {
      autoAlpha: 0,
      scale: 0.6,
      rotation: -12,
      duration: 1.1,
      ease: "back.out(1.7)",
      scrollTrigger: { trigger: ".agent-card", start: "top 75%" },
    });

    // Info staggers up just after.
    gsap.from(".agent-info > *", {
      y: 26,
      autoAlpha: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: ".agent-card", start: "top 70%" },
    });
  });

  // Recalculate trigger positions once fonts/images settle.
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

