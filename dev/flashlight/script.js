const light = document.querySelector(".light");

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

// Desktop: follow the cursor.
window.addEventListener("mousemove", (e) => {
  moveLight(e.clientX, e.clientY);
});

// Touch: follow the finger, nudging the light above the fingertip
// so the revealed text isn't hidden under it.
const TOUCH_OFFSET_Y = 56;

function handleTouch(e) {
  if (!e.touches.length) return;
  const t = e.touches[0];
  moveLight(t.clientX, t.clientY - TOUCH_OFFSET_Y);
}

window.addEventListener("touchstart", handleTouch, { passive: false });
window.addEventListener("touchmove", (e) => {
  e.preventDefault();
  handleTouch(e);
}, { passive: false });
