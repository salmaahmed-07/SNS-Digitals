/* ═══════════════════════════════════════════════════════════
   SNS DIGITAL — MAIN JAVASCRIPT
   Animations: GSAP, ScrollTrigger, Particles, MacBook, Cursor
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── REDUCED MOTION CHECK ───────────────────────────────── */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══════════════════════════════════════════════════════════
   1. LOADING SCREEN
═══════════════════════════════════════════════════════════ */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const hideLoader = () => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    initHeroScroll();
  };

  document.body.style.overflow = 'hidden';

  if (reducedMotion) {
    setTimeout(hideLoader, 100);
  } else {
    // Hide after SVG draws (paths animate ~2s)
    setTimeout(hideLoader, 2600);
  }
}

/* ═══════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
═══════════════════════════════════════════════════════════ */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');
  if (!cursor || !trail || reducedMotion) return;

  let mx = 0, my = 0;
  let tx = 0, ty = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
  });

  function animateTrail() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    trail.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Scale up on interactive elements
  document.querySelectorAll('a, button, .tilt-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1.5)';
      trail.style.width  = '48px';
      trail.style.height = '48px';
      trail.style.opacity = '0.8';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      trail.style.width  = '32px';
      trail.style.height = '32px';
      trail.style.opacity = '0.5';
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   3. PARTICLE SYSTEM
═══════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas || reducedMotion) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const GOLD = 'rgba(201,168,76,';

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x    = Math.random() * W;
      this.y    = init ? Math.random() * H : H + 10;
      this.size = Math.random() * 2 + 0.5;
      this.spd  = Math.random() * 0.4 + 0.1;
      this.drift= (Math.random() - 0.5) * 0.3;
      this.opac = Math.random() * 0.6 + 0.1;
      this.fade = Math.random() * 0.005 + 0.002;
      this.dir  = 1;
    }
    update() {
      this.y -= this.spd;
      this.x += this.drift;
      this.opac += this.fade * this.dir;
      if (this.opac > 0.7 || this.opac < 0.05) this.dir *= -1;
      if (this.y < -10) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = GOLD + this.opac + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  // Only animate particles when hero is visible and not scrolled past
  let animating = true;
  let scrolledPastHero = false;

  window.addEventListener('scroll', () => {
    scrolledPastHero = window.scrollY > 60;
  }, { passive: true });

  const heroObs = new IntersectionObserver(entries => {
    animating = entries[0].isIntersecting;
  }, { threshold: 0 });
  heroObs.observe(document.getElementById('hero'));

  function loop() {
    requestAnimationFrame(loop);
    if (!animating || scrolledPastHero) return;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
  }
  loop();
}

/* ═══════════════════════════════════════════════════════════
   4. MACBOOK LID ANIMATION + HERO ZOOM
═══════════════════════════════════════════════════════════ */
function initHeroScroll() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const zoomTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Fade hero background to dark espresso to match About section entry
    zoomTimeline.to(hero, {
      backgroundColor: '#322d29',
      ease: 'none',
      duration: 1.0
    }, 0);

    // Parallax on headline
    const heroHeadline = document.getElementById('heroHeadline');
    if (heroHeadline) {
      gsap.to(heroHeadline, {
        y: '-100px',
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    }

    // Fade out scroll hint
    const scrollHint = document.getElementById('heroScrollHint');
    if (scrollHint) {
      gsap.to(scrollHint, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: '5% top',
          end: '20% top',
          scrub: true,
        }
      });
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   5. NAVBAR SCROLL SHRINK + HAMBURGER
═══════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link, .mobile-menu__cta');
  const mobileClose = document.getElementById('mobileClose');
  const navLogo   = document.getElementById('navLogo');

  if (!navbar) return;

  if (navLogo) {
    navLogo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  const openMenu = () => {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  mobileLinks.forEach(l => l.addEventListener('click', closeMenu));
}

/* ═══════════════════════════════════════════════════════════
   6. INTERSECTION OBSERVER REVEALS
═══════════════════════════════════════════════════════════ */
function initRevealObserver() {
  const targets = document.querySelectorAll(
    '.reveal-left, .reveal-right, .reveal-fade, .process-step'
  );
  if (!targets.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(t => obs.observe(t));
}

/* ═══════════════════════════════════════════════════════════
   7. HIGHLIGHT BURST (section headings)
═══════════════════════════════════════════════════════════ */
function initHighlightBursts() {
  const bursts = document.querySelectorAll('.highlight-burst');
  if (!bursts.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('burst'), 300);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  bursts.forEach(b => obs.observe(b));
}

/* ═══════════════════════════════════════════════════════════
   8. UNDERLINE DRAW ON SCROLL
═══════════════════════════════════════════════════════════ */
function initUnderlineDraws() {
  const els = document.querySelectorAll('.underline-draw');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('drawn'), 600);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.8 });

  els.forEach(e => obs.observe(e));
}

/* ═══════════════════════════════════════════════════════════
   9. TEXT HIGHLIGHT SWEEP (word-by-word on scroll)
═══════════════════════════════════════════════════════════ */
function initTextHighlight() {
  const paras = document.querySelectorAll('.highlight-text');
  if (!paras.length || reducedMotion) return;

  paras.forEach(para => {
    // Wrap each word in a span
    const raw = para.innerHTML;
    // Preserve existing HTML (like <span class="underline-draw">)
    // Only wrap text nodes
    wrapTextNodes(para);
  });

  function wrapTextNodes(node) {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const words = child.textContent.split(/(\s+)/);
        const frag  = document.createDocumentFragment();
        words.forEach(w => {
          if (w.trim()) {
            const s = document.createElement('span');
            s.className = 'word';
            s.textContent = w;
            frag.appendChild(s);
          } else if (w) {
            frag.appendChild(document.createTextNode(w));
          }
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SPAN') {
        wrapTextNodes(child);
      }
    });
  }

  // Determine if paragraph is on a dark background
  // (check ancestor background color heuristic)
  function isOnDark(el) {
    let node = el.parentElement;
    while (node && node !== document.body) {
      const bg = getComputedStyle(node).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        // Check if it's a dark color by luminance
        const m = bg.match(/\d+/g);
        if (m) {
          const [r, g, b] = m.map(Number);
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          return lum < 128;
        }
      }
      node = node.parentElement;
    }
    return false;
  }

  // Scroll listener per paragraph
  paras.forEach(para => {
    const words = para.querySelectorAll('.word');
    if (!words.length) return;

    // Set initial (unlit) colour based on context
    const dark = isOnDark(para);
    words.forEach(w => {
      w.style.color = dark ? 'rgba(172,156,141,0.5)' : 'var(--taupe)';
    });

    const obs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;

      words.forEach((word, i) => {
        setTimeout(() => {
          word.classList.add('lit');
          word.style.color = dark ? 'var(--ivory)' : 'var(--espresso)';
        }, i * 55);
      });
      obs.unobserve(para);
    }, { threshold: 0.15 });

    obs.observe(para);
  });
}

/* ═══════════════════════════════════════════════════════════
   10. COUNT-UP STATS
═══════════════════════════════════════════════════════════ */
function initCountUp() {
  const cards = document.querySelectorAll('.stat-card');
  if (!cards.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card   = entry.target;
      const target = parseInt(card.dataset.count, 10);
      const el     = card.querySelector('.count-up');
      if (!el || el.dataset.done) return;
      el.dataset.done = '1';

      if (reducedMotion) {
        el.textContent = target;
        obs.unobserve(card);
        return;
      }

      const duration  = 1800;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      obs.unobserve(card);
    });
  }, { threshold: 0.4 });

  cards.forEach(c => obs.observe(c));
}

/* ═══════════════════════════════════════════════════════════
   11. SERVICES CAROUSEL
═══════════════════════════════════════════════════════════ */
function initServicesCarousel() {
  const track   = document.getElementById('servicesTrack');
  const prevBtn = document.getElementById('servicesPrev');
  const nextBtn = document.getElementById('servicesNext');
  if (!track) return;

  const cards   = track.querySelectorAll('.service-card');
  let current   = 0;
  const visible = () => window.innerWidth > 1024 ? 3 : window.innerWidth > 600 ? 2 : 1;

  function getCardWidth() {
    if (!cards[0]) return 0;
    return cards[0].getBoundingClientRect().width + 24; // gap = 24px
  }

  function goTo(idx) {
    const max = Math.max(0, cards.length - visible());
    current   = Math.max(0, Math.min(idx, max));
    const offset = current * getCardWidth();
    track.style.transform = `translateX(-${offset}px)`;
    // Notify dots
    track.dispatchEvent(new CustomEvent('carousel-change', { detail: { index: current } }));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Listen for goto events from dots
  track.addEventListener('goto', e => goTo(e.detail.index));

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) goTo(dx > 0 ? current + 1 : current - 1);
  });
}

/* ═══════════════════════════════════════════════════════════
   12. 3D CARD TILT
═══════════════════════════════════════════════════════════ */
function initCardTilt() {
  if (reducedMotion) return;
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = -dy * 4;
      const rotY   =  dx * 4;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   13. PORTFOLIO MODAL
═══════════════════════════════════════════════════════════ */
const projects = {
  maison: {
    img:      'assets/portfolio_maison.png',
    alt:      'Maison Vérité luxury fashion e-commerce website',
    category: 'Luxury Fashion · E-Commerce',
    title:    'Maison Vérité',
    desc:     'A complete e-commerce redesign for this iconic luxury fashion house. We crafted an immersive digital boutique — full-bleed editorial photography, bespoke checkout flows, and a performance score that matches the brand\'s pursuit of perfection.',
    tags:     ['Next.js', 'Shopify', 'GSAP', 'Figma', 'Brand Strategy'],
  },
  arcane: {
    img:      'assets/portfolio_arcane.png',
    alt:      'Arcane Analytics SaaS dashboard platform',
    category: 'SaaS · Analytics Platform',
    title:    'Arcane Analytics',
    desc:     'A data intelligence platform built for enterprise scale. We designed and engineered a sophisticated dashboard system capable of visualising millions of data points in real time, with a UI that makes complexity feel effortless.',
    tags:     ['React', 'TypeScript', 'D3.js', 'Node.js', 'AWS'],
  },
  ivory: {
    img:      'assets/portfolio_ivory.png',
    alt:      'The Ivory Tower Hotel boutique booking website',
    category: 'Hospitality · Booking Platform',
    title:    'The Ivory Tower Hotel',
    desc:     'A boutique hotel booking experience that captures the warmth and elegance of this iconic property. Featuring a custom booking engine, virtual room tours, and an editorial content strategy that increased direct bookings by 340%.',
    tags:     ['Vue.js', 'Laravel', 'Stripe', 'Editorial Design', 'SEO'],
  },
};

function initPortfolioModal() {
  const modal   = document.getElementById('projectModal');
  const backdrop= document.getElementById('modalBackdrop');
  const closeBtn= document.getElementById('modalClose');
  if (!modal) return;

  const openModal = (projectKey) => {
    const data = projects[projectKey];
    if (!data) return;
    document.getElementById('modalImg').src            = data.img;
    document.getElementById('modalImg').alt            = data.alt;
    document.getElementById('modalCategory').textContent= data.category;
    document.getElementById('modalTitle').textContent  = data.title;
    document.getElementById('modalDesc').textContent   = data.desc;
    const tags = document.getElementById('modalTags');
    tags.innerHTML = data.tags.map(t => `<span>${t}</span>`).join('');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.project));
  });
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (backdrop)  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ═══════════════════════════════════════════════════════════
   14. TESTIMONIALS SLIDER
═══════════════════════════════════════════════════════════ */
function initTestimonialsSlider() {
  const slides  = document.querySelectorAll('.testimonial-slide');
  const dots    = document.querySelectorAll('.testimonials__dot');
  const prevBtn = document.getElementById('testimonialPrev');
  const nextBtn = document.getElementById('testimonialNext');
  if (!slides.length) return;

  let current = 0;

  const goTo = (idx) => {
    const prev = current;
    slides[prev].classList.remove('active');
    slides[prev].classList.add('exit');
    if (dots[prev]) dots[prev].classList.remove('active');

    // Remove exit class after transition completes
    setTimeout(() => {
      slides[prev] && slides[prev].classList.remove('exit');
    }, 650);

    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  };

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Auto-advance
  if (!reducedMotion) {
    let autoTimer = setInterval(() => goTo(current + 1), 6000);
    const slider  = document.getElementById('testimonialsSlider');
    if (slider) {
      slider.addEventListener('mouseenter', () => clearInterval(autoTimer));
      slider.addEventListener('mouseleave', () => {
        autoTimer = setInterval(() => goTo(current + 1), 6000);
      });
    }
  }

  // Touch swipe
  let startX = 0;
  const sliderEl = document.getElementById('testimonialsSlider');
  if (sliderEl) {
    sliderEl.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    sliderEl.addEventListener('touchend', e => {
      const dx = startX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 50) goTo(dx > 0 ? current + 1 : current - 1);
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   15. CONTACT FORM
═══════════════════════════════════════════════════════════ */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form || !success) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Basic validation
    const name  = form.querySelector('#name');
    const email = form.querySelector('#email');
    const msg   = form.querySelector('#message');
    let valid   = true;

    [name, email, msg].forEach(field => {
      if (!field || !field.value.trim()) {
        field && (field.style.borderColor = '#72383D');
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    if (!valid) return;

    // Simulate send
    const submitBtn = form.querySelector('#formSubmit');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled    = true;

    setTimeout(() => {
      form.style.opacity    = '0';
      form.style.transition = 'opacity 0.4s';
      setTimeout(() => {
        form.style.display = 'none';
        success.classList.add('show');
        success.setAttribute('aria-hidden', 'false');
      }, 400);
    }, 1200);
  });
}

/* ═══════════════════════════════════════════════════════════
   16. BOOKING MODAL
═══════════════════════════════════════════════════════════ */
function initBookingModal() {
  const modal    = document.getElementById('bookingModal');
  const backdrop = document.getElementById('bookingBackdrop');
  const openBtn  = document.getElementById('bookCallBtn');
  const closeBtn = document.getElementById('bookingClose');
  const confirm  = document.getElementById('bookingConfirm');
  if (!modal) return;

  let selectedSlot = null;

  const open  = () => { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; };
  const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };

  if (openBtn)  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  document.querySelectorAll('.booking-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      document.querySelectorAll('.booking-slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      selectedSlot = slot.textContent;
    });
  });

  if (confirm) {
    confirm.addEventListener('click', () => {
      if (!selectedSlot) {
        confirm.textContent = 'Please select a time ↑';
        setTimeout(() => { confirm.textContent = 'Confirm Booking →'; }, 2000);
        return;
      }
      confirm.textContent = '✓ Booked — We\'ll email you!';
      confirm.style.background = '#2d6a3f';
      setTimeout(close, 2500);
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   17. FOOTER STAGGER REVEAL
═══════════════════════════════════════════════════════════ */
function initFooterReveal() {
  const cols = document.querySelectorAll('.footer__col');
  if (!cols.length) return;

  const obs = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    cols.forEach(col => col.classList.add('visible'));
    obs.disconnect();
  }, { threshold: 0.1 });

  const footer = document.getElementById('footer');
  if (footer) obs.observe(footer);
}

/* ═══════════════════════════════════════════════════════════
   18. NAVBAR ACTIVE STATE ON SCROLL
═══════════════════════════════════════════════════════════ */
function initNavActiveState() {
  const sections = ['about','services','work','process','testimonials','contact'];
  const links    = {
    about:        document.getElementById('nav-about'),
    services:     document.getElementById('nav-services'),
    work:         document.getElementById('nav-work'),
    process:      document.getElementById('nav-process'),
    contact:      document.getElementById('nav-contact'),
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id   = entry.target.id;
      const link = links[id];
      if (!link) return;
      if (entry.isIntersecting) {
        Object.values(links).forEach(l => l && l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });

  // Add active style
  const style = document.createElement('style');
  style.textContent = `.navbar__link.active { color: var(--burgundy); }
  .navbar__link.active::after { width: 100%; }`;
  document.head.appendChild(style);
}

/* ═══════════════════════════════════════════════════════════
   19. HERO TAGLINE — LETTER BY LETTER
═══════════════════════════════════════════════════════════ */
function initTaglineLetterReveal() {
  const tagline = document.getElementById('heroTagline');
  if (!tagline || reducedMotion) return;

  const text = tagline.textContent;
  tagline.textContent = '';
  tagline.setAttribute('aria-label', text);

  // Build letter spans
  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.cssText = `
      opacity: 0;
      display: inline-block;
      transform: translateY(8px);
      transition: opacity 0.35s ${i * 38}ms cubic-bezier(0.16,1,0.3,1),
                  transform 0.35s ${i * 38}ms cubic-bezier(0.16,1,0.3,1);
    `;
    tagline.appendChild(span);
  });

  // Trigger after the logo fades in (0.4s delay in CSS)
  setTimeout(() => {
    tagline.querySelectorAll('span').forEach(s => {
      s.style.opacity   = '1';
      s.style.transform = 'translateY(0)';
    });
  }, 600);
}

/* ═══════════════════════════════════════════════════════════
   20. GSAP — STICKY HORIZONTAL PROCESS SCROLL
       Pins the Process section; each step slides in from right
       as the user scrolls, then unpins when all 4 are shown.
═══════════════════════════════════════════════════════════ */
function initStickyProcessScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (reducedMotion) return;
  // Only on desktop (process steps need enough width)
  if (window.innerWidth < 768) return;

  gsap.registerPlugin(ScrollTrigger);

  const section = document.getElementById('process');
  const steps   = gsap.utils.toArray('.process-step');
  if (!section || !steps.length) return;

  // --- Reset CSS-based reveal so GSAP controls them instead ---
  steps.forEach(step => {
    step.classList.remove('visible');
    step.style.opacity   = '0';
    step.style.transform = 'translateX(80px)';
    step.style.transition = 'none'; // GSAP will handle
  });

  // Timeline: each step animates in sequentially
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger : section,
      start   : 'top top',
      // Pin for enough scroll distance: 120vh per step
      end     : `+=${steps.length * 120}vh`,
      pin     : true,
      anticipatePin: 1,
      scrub   : 0.8,
      snap    : {
        snapTo    : 1 / (steps.length - 1),
        duration  : { min: 0.2, max: 0.6 },
        ease      : 'power2.inOut',
      },
    },
  });

  steps.forEach((step, i) => {
    tl.to(step, {
      opacity  : 1,
      x        : 0,
      duration : 1,
      ease     : 'power2.out',
    }, i * 1.2);

    // Circle draw tied to this step's entry
    const circle = step.querySelector('.process-step__circle-draw');
    if (circle) {
      tl.to(circle, {
        strokeDashoffset : 0,
        duration         : 0.8,
        ease             : 'power2.out',
      }, i * 1.2 + 0.3);
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   21. GSAP — SECTION WIPE REVEALS & SMOOTH SCROLL
═══════════════════════════════════════════════════════════ */
function initGSAPAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (reducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll on all in-page anchors (overrides CSS scroll-behavior)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = window.innerWidth < 768 ? 80 : 110;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    });
  });

  // ── Staggered batch reveal for service cards ───────────────
  ScrollTrigger.batch('.service-card', {
    onEnter: batch => {
      gsap.from(batch, {
        opacity  : 0,
        y        : 40,
        stagger  : 0.12,
        duration : 0.8,
        ease     : 'power2.out',
        overwrite: true,
      });
    },
    once: true,
    start: 'top 88%',
  });

  // ── Portfolio cards stagger ────────────────────────────────
  ScrollTrigger.batch('.portfolio-card', {
    onEnter: batch => {
      gsap.from(batch, {
        opacity  : 0,
        scale    : 0.94,
        stagger  : 0.15,
        duration : 0.9,
        ease     : 'power2.out',
        overwrite: true,
      });
    },
    once: true,
    start: 'top 88%',
  });

  // ── Section headings horizontal wipe (alternating sides) ──
  // Even sections from left, odd from right
  const sectionHeadings = [
    { el: '.about__heading',    dir: -1 },
    { el: '.services__heading', dir:  1 },
    { el: '.portfolio__heading',dir: -1 },
    { el: '.process__heading',  dir:  1 },
    { el: '.contact__heading',  dir: -1 },
  ];
  sectionHeadings.forEach(({ el, dir }) => {
    const node = document.querySelector(el);
    if (!node) return;
    gsap.fromTo(node,
      { opacity: 0, x: dir * 60 },
      {
        opacity : 1,
        x       : 0,
        duration: 1,
        ease    : 'power3.out',
        scrollTrigger: {
          trigger : node,
          start   : 'top 85%',
          once    : true,
        },
      }
    );
  });

  // ── Stat cards ripple in ───────────────────────────────────
  ScrollTrigger.batch('.stat-card', {
    onEnter: batch => {
      gsap.from(batch, {
        opacity : 0,
        y       : 30,
        scale   : 0.92,
        stagger : 0.1,
        duration: 0.7,
        ease    : 'back.out(1.4)',
        overwrite: true,
      });
    },
    once : true,
    start: 'top 85%',
  });
}

/* ═══════════════════════════════════════════════════════════
   20. HERO SCROLL HINT VISIBILITY
═══════════════════════════════════════════════════════════ */
function initScrollHint() {
  const hint = document.getElementById('heroScrollHint');
  if (!hint) return;
  // Already animated via CSS. Hide on first scroll.
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) hint.style.opacity = '0';
  }, { passive: true, once: true });
}

/* ═══════════════════════════════════════════════════════════
   22. SERVICES CAROUSEL — DOT INDICATORS
═══════════════════════════════════════════════════════════ */
function initServicesDots() {
  const track   = document.getElementById('servicesTrack');
  const navEl   = document.querySelector('.services__nav');
  if (!track || !navEl) return;

  const cards   = track.querySelectorAll('.service-card');
  const visible = () => window.innerWidth > 1024 ? 3 : window.innerWidth > 600 ? 2 : 1;
  const total   = cards.length;

  // Build dots container
  const dotWrap = document.createElement('div');
  dotWrap.className = 'services__dots';
  dotWrap.setAttribute('role', 'tablist');
  dotWrap.setAttribute('aria-label', 'Service navigation dots');

  for (let i = 0; i < total; i++) {
    const d = document.createElement('button');
    d.className = 'services__dot-indicator' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Go to service ${i + 1}`);
    d.dataset.idx = i;
    dotWrap.appendChild(d);
  }
  // Insert before nav buttons
  navEl.insertBefore(dotWrap, navEl.firstChild);

  // Keep dots in sync — patch the existing carousel goTo
  const origGoTo = window.__servicesGoTo;
  // Listen for custom event dispatched by carousel
  track.addEventListener('carousel-change', e => {
    const current = e.detail.index;
    dotWrap.querySelectorAll('.services__dot-indicator').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  });

  dotWrap.querySelectorAll('.services__dot-indicator').forEach(d => {
    d.addEventListener('click', () => {
      const idx = parseInt(d.dataset.idx, 10);
      track.dispatchEvent(new CustomEvent('goto', { detail: { index: idx } }));
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   SCROLL HINT
═══════════════════════════════════════════════════════════ */
function initScrollHint() {
  const hint = document.getElementById('heroScrollHint');
  if (!hint) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) hint.style.opacity = '0';
  }, { passive: true, once: true });
}

/* ═══════════════════════════════════════════════════════════
   INIT ALL
═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initParticles();
  initTaglineLetterReveal();
  initNavbar();
  initRevealObserver();
  initHighlightBursts();
  initUnderlineDraws();
  initTextHighlight();
  initCountUp();
  initServicesCarousel();
  initServicesDots();
  initCardTilt();
  initPortfolioModal();
  initTestimonialsSlider();
  initContactForm();
  initBookingModal();
  initFooterReveal();
  initNavActiveState();
  initStickyProcessScroll(); // Must run before initGSAPAnimations (both register ScrollTrigger)
  initGSAPAnimations();
  initScrollHint();
});
