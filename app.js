/* ─────────────────────────────────────────────
   HotDog — Landing Page Interactions
───────────────────────────────────────────── */

'use strict';

// ── Nav scroll effect ──
const nav = document.getElementById('main-nav');
const onScroll = () => {
  if (window.scrollY > 12) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
};
window.addEventListener('scroll', onScroll, { passive: true });

// ── Mobile nav toggle ──
const hamburger = document.getElementById('hamburger-btn');
const navMobile = document.getElementById('nav-mobile');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
  navMobile.classList.toggle('open', isOpen);
  navMobile.setAttribute('aria-hidden', String(!isOpen));
});

// Close mobile nav when a link is clicked
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navMobile.classList.remove('open');
    navMobile.setAttribute('aria-hidden', 'true');
  });
});

// ── Extract button ──
const extractBtn = document.getElementById('extract-btn');
const urlInput   = document.getElementById('repo-url');

extractBtn.addEventListener('click', () => {
  const val = urlInput.value.trim();
  if (!val) {
    urlInput.focus();
    shakeInput();
    return;
  }
  
  // Basic URL validation
  try {
    new URL(val);
  } catch {
    shakeInput();
    return;
  }
  // Brief loading state, then navigate to analysis page
  extractBtn.disabled = true;
  extractBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" class="spin">
      <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" stroke-dasharray="28" stroke-dashoffset="10"/>
    </svg>
    Initializing agents…
  `;
  setTimeout(() => {
    window.location.href = 'analysis.html?url=' + encodeURIComponent(val);
  }, 700);
});

// ── Shake animation for empty submit ──
function shakeInput() {
  const wrapper = urlInput.closest('.url-input-wrapper');
  wrapper.style.animation = 'none';
  wrapper.offsetHeight; // reflow
  wrapper.style.animation = 'shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both';
  setTimeout(() => { wrapper.style.animation = ''; }, 450);
}

// Inject shake keyframe
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(3px); }
    30%, 50%, 70% { transform: translateX(-4px); }
    40%, 60% { transform: translateX(4px); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .spin { animation: spin 0.8s linear infinite; }
`;
document.head.appendChild(shakeStyle);

// ── Example button — prefill URL ──
const exampleBtn = document.getElementById('example-btn');
const EXAMPLE_URL = 'https://github.com/vercel/next.js';

exampleBtn.addEventListener('click', () => {
  urlInput.value = EXAMPLE_URL;
  urlInput.focus();
  urlInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ── CTA scroll ──
document.getElementById('cta-analyze-btn').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('repo-url').scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => document.getElementById('repo-url').focus(), 600);
});

// ── Enter key submit ──
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') extractBtn.click();
});

// ── Intersection Observer for scroll reveals ──
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Apply to sections below the fold
document.querySelectorAll('.proof-bar, .section-header, .step, .cta-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)';
  revealObserver.observe(el);
});

// Stagger step connectors
document.querySelectorAll('.step-connector').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transition = `opacity 0.4s ${0.1 + i * 0.08}s ease`;
  revealObserver.observe(el);
  // Override to only fade, not translate
  const origCallback = revealObserver;
});
