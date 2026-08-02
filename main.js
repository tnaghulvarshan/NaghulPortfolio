/* ============================================================
   T. NAGHUL VARSHAN — CINEMATIC INTERACTIVE JAVASCRIPT ENGINE
   Features: 3D Canvas Frame Engine, Spotlight Cursor, Count-Up Stats,
             Navbar Scroll Blur, 3D Tilt Cards, Scroll Reveal
   ============================================================ */

const TOTAL_FRAMES = 200;
const frames = [];
let loadedCount = 0;

const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');
const loaderBar = document.getElementById('loader-bar');
const loaderText = document.getElementById('loader-text');
const loadingOverlay = document.getElementById('loading-overlay');
const cursorGlow = document.getElementById('cursor-glow');

let targetFrame = 0;
let currentFrame = 0;

// 1. Resize Canvas Fit
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  renderCurrentFrame();
}

window.addEventListener('resize', resizeCanvas);

function getFramePath(index) {
  return `/frames/frame_${index + 1}.jpg`;
}

function hideOverlay() {
  if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
    loadingOverlay.classList.add('hidden');
  }
}

// 2. Preload 200 Animation Frames
function preloadFrames() {
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFramePath(i);

    img.onload = () => {
      loadedCount++;
      const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
      if (loaderBar) loaderBar.style.width = `${percent}%`;
      if (loaderText) loaderText.textContent = `INITIALIZING CINEMATIC EXPERIENCE... ${percent}%`;

      if (i === 0) {
        renderCurrentFrame();
      }

      if (loadedCount >= TOTAL_FRAMES) {
        hideOverlay();
      }
    };

    img.onerror = () => {
      loadedCount++;
      if (loadedCount >= TOTAL_FRAMES) {
        hideOverlay();
      }
    };

    frames.push(img);
  }

  setTimeout(hideOverlay, 1500);
}

// 3. Canvas Object-Fit Cover Rendering
function drawImageProp(ctx, img) {
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (canvasRatio > imgRatio) {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    offsetX = 0;
    offsetY = (canvasHeight - drawHeight) / 2;
  } else {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imgRatio;
    offsetX = (canvasWidth - drawWidth) / 2;
    offsetY = 0;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

function getValidFrameIndex(idx) {
  const roundIdx = Math.round(idx);
  if (frames[roundIdx] && frames[roundIdx].complete && frames[roundIdx].naturalWidth > 0) {
    return roundIdx;
  }
  for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
    const prev = roundIdx - offset;
    if (prev >= 0 && frames[prev] && frames[prev].complete && frames[prev].naturalWidth > 0) return prev;
    const next = roundIdx + offset;
    if (next < TOTAL_FRAMES && frames[next] && frames[next].complete && frames[next].naturalWidth > 0) return next;
  }
  return 0;
}

function renderCurrentFrame() {
  const validIndex = getValidFrameIndex(currentFrame);
  if (frames[validIndex]) {
    drawImageProp(ctx, frames[validIndex]);
  }
}

// 4. Frame Scrubbing Calculation attached to Scroll
function updateTargetFrame() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop || window.pageYOffset || 0;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  const scrollFraction = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
  targetFrame = scrollFraction * (TOTAL_FRAMES - 1);

  // Update Blurred Glass Navbar on scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    if (scrollTop > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
}

window.addEventListener('scroll', updateTargetFrame, { passive: true });
window.addEventListener('wheel', updateTargetFrame, { passive: true });
window.addEventListener('touchmove', updateTargetFrame, { passive: true });

function animLoop() {
  updateTargetFrame();
  const ease = 0.2;
  const diff = targetFrame - currentFrame;

  if (Math.abs(diff) > 0.01) {
    currentFrame += diff * ease;
    renderCurrentFrame();
  }

  requestAnimationFrame(animLoop);
}

// 5. Spotlight Cursor Track
window.addEventListener('mousemove', (e) => {
  if (cursorGlow) {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  }
});

// 6. Number Counter Animation for Statistics
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  counters.forEach((counter) => {
    const target = +counter.getAttribute('data-target');
    const duration = 1200; // Smooth 1.2s duration
    const startTime = performance.now();

    function updateCount(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(easedProgress * target);
      counter.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        counter.textContent = target;
      }
    }
    requestAnimationFrame(updateCount);
  });
}

// DOM Elements & Interactivity Setup
document.addEventListener('DOMContentLoaded', () => {
  
  // Mobile Hamburger Navbar Toggle
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const spideyNav = document.getElementById('spidey-nav');
  const navLinks = document.querySelectorAll('.spidey-nav-link');

  if (hamburgerBtn && spideyNav) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      spideyNav.classList.toggle('open');
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        spideyNav.classList.remove('open');
      });
    });
  }

  // Active Link Highlight on Scroll
  const sections = document.querySelectorAll('section');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Scroll Reveal Observer
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window && revealElements.length) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  // Dedicated Observer for Stats Counter grid to start precisely when in sight
  const statsGrid = document.querySelector('.stats-counter-grid');
  if (statsGrid && 'IntersectionObserver' in window) {
    let statsAnimated = false;
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsAnimated) {
          animateCounters();
          statsAnimated = true;
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    statsObserver.observe(statsGrid);
  } else {
    animateCounters();
  }

  // 3D Card Tilt Effect on Mouse Move
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
    });
  });

});

// Initial Execution Call
resizeCanvas();
preloadFrames();
updateTargetFrame();
requestAnimationFrame(animLoop);
