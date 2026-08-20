/*
  Countdown targets come from each .countdown element's data-target attribute:
    Las Vegas / Metallica at the Sphere
      Thursday, February 25, 2027, 2:00 PM PST (UTC-8) = 2027-02-25T22:00:00Z
    Steamboat Hiking
      Thursday, August 5, 2027, 12:00 PM MDT (UTC-6) = 2027-08-05T18:00:00Z
*/

const countdowns = [...document.querySelectorAll('.countdown')].map((el) => ({
  el,
  target: new Date(el.dataset.target),
  values: {
    days: el.querySelector('[data-unit="days"]'),
    hours: el.querySelector('[data-unit="hours"]'),
    minutes: el.querySelector('[data-unit="minutes"]'),
    seconds: el.querySelector('[data-unit="seconds"]')
  }
}));

function pad(num, size) {
  return String(num).padStart(size, '0');
}

function render(countdown, now) {
  const { el, target, values } = countdown;
  const diff = target - now;

  if (diff <= 0) {
    values.days.textContent = '000';
    values.hours.textContent = '00';
    values.minutes.textContent = '00';
    values.seconds.textContent = '00';
    el.classList.add('arrived');
    return;
  }

  values.days.textContent = pad(Math.floor(diff / (1000 * 60 * 60 * 24)), 3);
  values.hours.textContent = pad(Math.floor((diff / (1000 * 60 * 60)) % 24), 2);
  values.minutes.textContent = pad(Math.floor((diff / (1000 * 60)) % 60), 2);
  values.seconds.textContent = pad(Math.floor((diff / 1000) % 60), 2);
}

function updateCountdowns() {
  const now = new Date();
  countdowns.forEach((countdown) => render(countdown, now));
}

updateCountdowns();
setInterval(updateCountdowns, 1000);

/* ---------- Swipe deck ---------- */

const deck = document.getElementById('deck');
const slides = [...deck.querySelectorAll('.slide')];
const dots = [...document.querySelectorAll('.pager-dot')];
const swipeHint = document.getElementById('swipeHint');

// Swiping is handled natively by CSS scroll snapping; this only keeps the
// pager in sync and lets the dots and arrow keys drive the same scroll.
// activeIndex is tracked rather than derived on demand, because after a resize
// scrollLeft still refers to the old slide width.
let activeIndex = 0;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function syncPager() {
  activeIndex = Math.round(deck.scrollLeft / deck.clientWidth);

  dots.forEach((dot, i) => {
    dot.setAttribute('aria-current', String(i === activeIndex));
  });

  swipeHint.classList.toggle('is-hidden', activeIndex > 0);
}

function goTo(index, behavior) {
  activeIndex = Math.max(0, Math.min(slides.length - 1, index));
  deck.scrollTo({
    left: activeIndex * deck.clientWidth,
    behavior: behavior || (prefersReducedMotion.matches ? 'auto' : 'smooth')
  });
}

dots.forEach((dot) => {
  dot.addEventListener('click', () => goTo(Number(dot.dataset.goto)));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    goTo(activeIndex + 1);
  } else if (event.key === 'ArrowLeft') {
    goTo(activeIndex - 1);
  }
});

deck.addEventListener('scroll', syncPager, { passive: true });

// Keep the snap position correct when the viewport size changes.
window.addEventListener('resize', () => goTo(activeIndex, 'auto'));

syncPager();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
