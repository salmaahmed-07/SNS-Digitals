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

  // Scroll listener per paragraph using GSAP ScrollTrigger scrub
  paras.forEach(para => {
    const words = para.querySelectorAll('.word');
    if (!words.length) return;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.to(words, {
        color: '#ffffff',
        textShadow: '0 0 12px rgba(255, 255, 255, 0.45)',
        stagger: 0.1,
        scrollTrigger: {
          trigger: para,
          start: 'top 95%',
          end: 'bottom 50%',
          scrub: true
        }
      });
    }
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
  // Prevent description modal from opening when clicking the "View Project" CTA link
  document.querySelectorAll('.portfolio-card__cta').forEach(cta => {
    cta.addEventListener('click', e => {
      e.stopPropagation();
    });
  });
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (backdrop)  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ═══════════════════════════════════════════════════════════
   13b. SERVICE MODAL
═══════════════════════════════════════════════════════════ */
const serviceData = {
  web: {
    title: 'Web Design & Development',
    desc: 'Our web design process combines striking aesthetics with robust engineering. We build pixel-perfect interfaces that deliver frictionless user experiences, optimized for speed, accessibility, and conversion.'
  },
  ecommerce: {
    title: 'E-Commerce Solutions',
    desc: 'We engineer high-performance online stores that turn visitors into loyal customers. From headless commerce architectures to bespoke Shopify themes, we build platforms that scale with your ambitions.'
  },
  brand: {
    title: 'Brand Identity Systems',
    desc: 'A brand is more than a logo—it’s a feeling. We craft comprehensive visual languages, including typography, color systems, and brand guidelines, ensuring your identity commands attention across every touchpoint.'
  },
  software: {
    title: 'Custom Software',
    desc: 'Off-the-shelf solutions rarely fit perfectly. We design and build bespoke software applications, internal tools, and SaaS products tailored exactly to your complex operational workflows.'
  },
  seo: {
    title: 'SEO & Performance',
    desc: 'A beautiful website needs to be found. Our technical SEO and performance optimization strategies ensure your digital presence ranks high, loads instantly, and outpaces the competition.'
  },
  support: {
    title: 'Maintenance & Support',
    desc: 'Digital products are living ecosystems. We provide ongoing support, security updates, and iterative enhancements to keep your platform secure, fast, and relevant long after launch.'
  }
};

/* window.openServiceModal is always available for inline onclick handlers */
window.openServiceModal = function(key) {
  const data = serviceData[key];
  if (!data) return;
  const modal = document.getElementById('serviceModal');
  if (!modal) return;
  document.getElementById('serviceModalTitle').textContent = data.title;
  document.getElementById('serviceModalDesc').textContent = data.desc;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

function initServiceModal() {
  const modal = document.getElementById('serviceModal');
  const backdrop = document.getElementById('serviceModalBackdrop');
  const closeBtn = document.getElementById('serviceModalClose');
  const ctaBtn = document.getElementById('serviceModalCta');
  if (!modal) return;

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      closeModal();
      const target = document.getElementById('contact');
      if (target) {
        const navHVal = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim();
        const navH = parseInt(navHVal) || 72;
        const topSpacing = window.innerWidth < 768 ? 14 : 24;
        const offset = navH + topSpacing + 10;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      }
    });
  }
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

    // Save to localStorage
    const nameVal    = form.querySelector('#name').value.trim();
    const emailVal   = form.querySelector('#email').value.trim();
    const companyVal = (form.querySelector('#company')?.value || '').trim();
    const projType   = form.querySelector('#project-type')?.value || '';
    const msgVal     = form.querySelector('#message').value.trim();
    const inquiry = {
      id:        Date.now(),
      name:      nameVal,
      email:     emailVal,
      company:   companyVal,
      service:   projType,
      message:   msgVal,
      timestamp: new Date().toISOString(),
      read:      false,
    };
    const inquiries = JSON.parse(localStorage.getItem('sns_inquiries') || '[]');
    inquiries.unshift(inquiry);
    localStorage.setItem('sns_inquiries', JSON.stringify(inquiries));
    if (typeof window.refreshMeetingRequests === 'function') window.refreshMeetingRequests();

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
   16. BOOKING MODAL (2-step)
═══════════════════════════════════════════════════════════ */
function initBookingModal() {
  const modal    = document.getElementById('bookingModal');
  const backdrop = document.getElementById('bookingBackdrop');
  const openBtn  = document.getElementById('bookCallBtn');
  const closeBtn = document.getElementById('bookingClose');
  if (!modal) return;

  // Step elements
  const step1      = document.getElementById('bookingStep1');
  const step2      = document.getElementById('bookingStep2');
  const dot1       = document.getElementById('bstep-1');
  const dot2       = document.getElementById('bstep-2');
  const stepLine   = modal.querySelector('.booking-step-line');
  const nextBtn    = document.getElementById('bookingNext');
  const backBtn    = document.getElementById('bookingBack');
  const confirmBtn = document.getElementById('bookingConfirm');

  // Step 1 fields
  const nameInput    = document.getElementById('booking-name');
  const phoneInput   = document.getElementById('booking-phone');
  const countrySelect = document.getElementById('booking-country');
  const nameErr      = document.getElementById('booking-name-err');
  const phoneErr     = document.getElementById('booking-phone-err');

  let selectedSlot = null;
  let clientName   = '';
  let clientPhone  = '';

  /* ── open / close ───────────────────── */
  const goToStep1 = () => {
    step1.style.display = '';
    step2.style.display = 'none';
    dot1.classList.add('active');    dot1.classList.remove('done');
    dot2.classList.remove('active'); dot2.classList.remove('done');
    if (stepLine) stepLine.classList.remove('done');
    selectedSlot = null;
    document.querySelectorAll('.booking-slot').forEach(s => s.classList.remove('selected'));
  };

  const open = () => {
    goToStep1();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => nameInput && nameInput.focus(), 300);
  };

  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (openBtn)  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  /* ── Step 1 → Step 2 ───────────────── */
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      let valid = true;

      // Validate name
      const name = nameInput ? nameInput.value.trim() : '';
      if (!name) {
        nameInput && nameInput.classList.add('error');
        nameErr && nameErr.classList.add('visible');
        valid = false;
      } else {
        nameInput && nameInput.classList.remove('error');
        nameErr && nameErr.classList.remove('visible');
      }

      // Validate phone (at least 6 digits)
      const phone = phoneInput ? phoneInput.value.trim() : '';
      if (!phone || phone.replace(/\D/g,'').length < 6) {
        phoneInput && phoneInput.classList.add('error');
        phoneErr && phoneErr.classList.add('visible');
        valid = false;
      } else {
        phoneInput && phoneInput.classList.remove('error');
        phoneErr && phoneErr.classList.remove('visible');
      }

      if (!valid) return;

      // Store for later
      clientName  = name;
      clientPhone = (countrySelect ? countrySelect.value : '+20') + ' ' + phone;

      // Animate to step 2
      step1.style.display = 'none';
      step2.style.display = '';
      dot1.classList.remove('active'); dot1.classList.add('done');
      dot2.classList.add('active');
      if (stepLine) stepLine.classList.add('done');
    });
  }

  /* ── Back ──────────────────────────── */
  if (backBtn) backBtn.addEventListener('click', goToStep1);

  /* ── Slot selection ────────────────── */
  document.querySelectorAll('.booking-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      document.querySelectorAll('.booking-slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      selectedSlot = slot.textContent.trim();
    });
  });

  /* ── Confirm ───────────────────────── */
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (!selectedSlot) {
        confirmBtn.textContent = 'Please select a time ↑';
        setTimeout(() => { confirmBtn.textContent = 'Confirm Booking →'; }, 2000);
        return;
      }

      // Save booking to localStorage
      const booking = {
        id:        Date.now(),
        name:      clientName,
        phone:     clientPhone,
        slot:      selectedSlot,
        timestamp: new Date().toISOString(),
        read:      false,
      };
      const bookings = JSON.parse(localStorage.getItem('sns_bookings') || '[]');
      bookings.unshift(booking);
      localStorage.setItem('sns_bookings', JSON.stringify(bookings));
      if (typeof window.refreshMeetingRequests === 'function') window.refreshMeetingRequests();

      confirmBtn.textContent = '✓ Booked — We\'ll email you!';
      confirmBtn.style.background = '#2d6a3f';
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
      // Pin for enough scroll distance: 50vh per step
      end     : `+=${steps.length * 50}vh`,
      pin     : true,
      anticipatePin: 1,
      scrub   : 0.3,
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
      
      const navHVal = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim();
      const navH = parseInt(navHVal) || 72;
      const topSpacing = window.innerWidth < 768 ? 14 : 24;
      const offset = navH + topSpacing + 10;
      
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
   ADMIN LOGIN (Ctrl + Alt + Z)
═══════════════════════════════════════════════════════════ */
function initAdminLogin() {
  const ADMIN_PASSWORD = 'sns2026'; // ← change this to your real password

  const modal      = document.getElementById('adminModal');
  const backdrop   = document.getElementById('adminModalBackdrop');
  const card       = modal ? modal.querySelector('.admin-modal__card') : null;
  const closeBtn   = document.getElementById('adminModalClose');
  const input      = document.getElementById('adminPasswordInput');
  const submitBtn  = document.getElementById('adminSubmitBtn');
  const feedback   = document.getElementById('adminFeedback');
  const toggleBtn  = document.getElementById('adminTogglePassword');
  const dashboard  = document.getElementById('adminDashboard');

  if (!modal || !card) return;

  /* ── open / close ───────────────── */
  const openModal = () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (input) { input.value = ''; input.focus(); }
    if (feedback) { feedback.textContent = ''; feedback.className = 'admin-modal__feedback'; }
    if (input) { input.className = 'admin-modal__input'; }
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  /* ── Ctrl + Alt + Z trigger ─────── */
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      // Don't re-open if dashboard already open
      if (dashboard && dashboard.classList.contains('open')) return;
      openModal();
    }
    if (e.key === 'Escape') closeModal();
  });

  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (backdrop)  backdrop.addEventListener('click', closeModal);

  /* ── Show/hide password toggle ──── */
  if (toggleBtn && input) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      toggleBtn.innerHTML = isPassword
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
             <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
             <line x1="1" y1="1" x2="23" y2="23"/>
           </svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
             <circle cx="12" cy="12" r="3"/>
           </svg>`;
    });
  }

  /* ── Submit logic ───────────────── */
  const handleSubmit = () => {
    if (!input || !feedback) return;
    const entered = input.value.trim();

    if (!entered) {
      showError('Please enter a password.');
      return;
    }

    if (entered === ADMIN_PASSWORD) {
      // ✅ Correct
      input.className = 'admin-modal__input success';
      feedback.textContent = '✓ Access granted. Opening dashboard…';
      feedback.className = 'admin-modal__feedback success';
      submitBtn.disabled = true;

      setTimeout(() => {
        closeModal();
        openDashboard();
      }, 1000);
    } else {
      // ❌ Wrong
      showError('Incorrect password. Please try again.');
    }
  };

  const showError = (message) => {
    input.className = 'admin-modal__input error';
    feedback.textContent = message;
    feedback.className = 'admin-modal__feedback error';

    // Shake card
    card.classList.remove('shake');
    void card.offsetWidth; // reflow to restart animation
    card.classList.add('shake');
    card.addEventListener('animationend', () => card.classList.remove('shake'), { once: true });
  };

  const openDashboard = () => {
    if (!dashboard) return;
    dashboard.classList.add('open');
    dashboard.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (submitBtn) submitBtn.disabled = false;
  };

  if (submitBtn) submitBtn.addEventListener('click', handleSubmit);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSubmit();
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   ADMIN DASHBOARD INTERACTIONS
═══════════════════════════════════════════════════════════ */
function initAdminDashboard() {
  const dashboard = document.getElementById('adminDashboard');
  const logoutBtn = document.getElementById('adminLogout');
  const navItems  = document.querySelectorAll('.admin-dash__nav-item');
  const sections  = document.querySelectorAll('.admin-section');
  const saveBtn   = document.getElementById('settings-save-btn');

  if (!dashboard) return;

  /* ── Logout ─────────────────────── */
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      dashboard.classList.remove('open');
      dashboard.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }

  /* ── Sidebar navigation ─────────── */
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.section;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      sections.forEach(s => {
        s.classList.remove('active');
        if (s.id === `dash-${target}`) {
          s.classList.add('active');
        }
      });
    });
  });

  /* ── Settings save (demo) ───────── */
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const orig = saveBtn.textContent;
      saveBtn.textContent = '✓ Saved!';
      saveBtn.style.background = 'linear-gradient(135deg,#27ae60 0%,#1a7a43 100%)';
      setTimeout(() => {
        saveBtn.textContent = orig;
        saveBtn.style.background = '';
      }, 2000);
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   MEETING REQUESTS DASHBOARD
═══════════════════════════════════════════════════════════ */
function initMeetingRequests() {
  const badge            = document.getElementById('meetingsBadge');
  const inquiriesList    = document.getElementById('inquiries-list');
  const bookingsList     = document.getElementById('bookings-list');
  const inquiriesEmpty   = document.getElementById('inquiries-empty');
  const bookingsEmpty    = document.getElementById('bookings-empty');
  const inquiriesCount   = document.getElementById('inquiries-count');
  const bookingsCount    = document.getElementById('bookings-count');
  const tabs             = document.querySelectorAll('.meetings-tab');
  const panels           = document.querySelectorAll('.meetings-panel');

  if (!inquiriesList || !bookingsList) return;

  /* ── seed example data (when both arrays are empty) ─── */
  const _existingI = JSON.parse(localStorage.getItem('sns_inquiries') || '[]');
  const _existingB = JSON.parse(localStorage.getItem('sns_bookings')  || '[]');
  if (_existingI.length === 0 && _existingB.length === 0) {
    const exampleInquiries = [
      {
        id: 1719000001000,
        name: 'James Carter',
        email: 'james.carter@techflow.io',
        company: 'TechFlow Inc.',
        service: 'web',
        message: 'Hi! We need a complete redesign of our corporate site. We currently have about 20 pages and are looking for a modern, dark-themed design that reflects our brand identity. Budget is flexible for the right agency.',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        read: false,
      },
      {
        id: 1719000002000,
        name: 'Layla Hassan',
        email: 'layla@lumierecosm.com',
        company: 'Lumière Cosmetics',
        service: 'ecommerce',
        message: 'We are launching a new skincare line and need a full e-commerce build — product catalog, cart, checkout, and integration with Shopify or WooCommerce.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        read: false,
      },
      {
        id: 1719000003000,
        name: 'Omar Farouk',
        email: 'o.farouk@arcanely.com',
        company: 'Arcane Analytics',
        service: 'software',
        message: 'Looking for a custom SaaS dashboard with real-time data visualization, user roles, and export functionality.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true,
      },
    ];
    const exampleBookings = [
      {
        id: 1719000004000,
        name: 'Nour El-Din',
        phone: '+20 0112 345 6789',
        slot: 'Mon, Jun 16 · 10:00 AM',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        read: false,
      },
      {
        id: 1719000005000,
        name: 'Mia Khalil',
        phone: '+971 050 987 6543',
        slot: 'Wed, Jun 18 · 3:00 PM',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        read: true,
      },
    ];
    localStorage.setItem('sns_inquiries', JSON.stringify(exampleInquiries));
    localStorage.setItem('sns_bookings',  JSON.stringify(exampleBookings));
  }

  /* ── helpers ───────────────────────────── */
  const fmtTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
           + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const serviceLabel = {
    web:       'Web Design & Development',
    ecommerce: 'E-Commerce Solutions',
    brand:     'Brand Identity',
    software:  'Custom Software',
    seo:       'SEO & Performance',
    support:   'Maintenance & Support',
    other:     'Other',
  };

  /* ── render ─────────────────────────────── */
  const render = () => {
    const inquiries = JSON.parse(localStorage.getItem('sns_inquiries') || '[]');
    const bookings  = JSON.parse(localStorage.getItem('sns_bookings')  || '[]');

    const unreadI = inquiries.filter(i => !i.read).length;
    const unreadB = bookings.filter(b  => !b.read).length;
    const totalUnread = unreadI + unreadB;

    // Badge
    if (badge) {
      badge.textContent = totalUnread > 0 ? totalUnread : '';
      badge.classList.toggle('visible', totalUnread > 0);
    }

    // Tab counts
    if (inquiriesCount) inquiriesCount.textContent = inquiries.length;
    if (bookingsCount)  bookingsCount.textContent  = bookings.length;

    /* inquiries */
    inquiriesList.innerHTML = '';
    if (inquiries.length === 0) {
      inquiriesEmpty.style.display = 'flex';
    } else {
      inquiriesEmpty.style.display = 'none';
      inquiries.forEach(inq => {
        const card = document.createElement('div');
        card.className = 'meeting-card' + (inq.read ? '' : ' unread');
        card.dataset.id = inq.id;
        const svcLabel = serviceLabel[inq.service] || inq.service || 'Not specified';
        const msgShort = inq.message.length > 120;
        card.innerHTML = `
          <div class="meeting-card__body">
            <div class="meeting-card__header">
              <span class="meeting-card__name">${escHtml(inq.name)}</span>
              <span class="meeting-card__badge ${inq.read ? 'meeting-card__badge--read' : 'meeting-card__badge--new'}">${inq.read ? 'Read' : 'New'}</span>
            </div>
            <div class="meeting-card__meta">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${escHtml(inq.email)}</span>
              ${inq.company ? `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>${escHtml(inq.company)}</span>` : ''}
            </div>
            <div class="meeting-card__service">🎯 ${escHtml(svcLabel)}</div>
            <div class="meeting-card__message${msgShort ? '' : ''}" id="inq-msg-${inq.id}">${escHtml(inq.message)}</div>
            ${msgShort ? `<button class="meeting-card__expand" data-target="inq-msg-${inq.id}">Show more ▾</button>` : ''}
          </div>
          <div class="meeting-card__actions">
            <span class="meeting-card__time">${fmtTime(inq.timestamp)}</span>
            <button class="meeting-card__delete" title="Delete" data-type="inquiry" data-id="${inq.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
        `;
        inquiriesList.appendChild(card);
      });
    }

    /* bookings */
    bookingsList.innerHTML = '';
    if (bookings.length === 0) {
      bookingsEmpty.style.display = 'flex';
    } else {
      bookingsEmpty.style.display = 'none';
      bookings.forEach(bk => {
        const card = document.createElement('div');
        card.className = 'meeting-card' + (bk.read ? '' : ' unread');
        card.dataset.id = bk.id;
        card.innerHTML = `
          <div class="meeting-card__body">
            <div class="meeting-card__header">
              <span class="meeting-card__name">${bk.name ? escHtml(bk.name) : '30-Minute Call'}</span>
              <span class="meeting-card__badge ${bk.read ? 'meeting-card__badge--read' : 'meeting-card__badge--new'}">${bk.read ? 'Read' : 'New'}</span>
            </div>
            ${bk.phone ? `
            <div class="meeting-card__meta">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .99h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.92z"/></svg>${escHtml(bk.phone)}</span>
            </div>` : ''}
            <div class="meeting-card__slot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${escHtml(bk.slot)}
            </div>
          </div>
          <div class="meeting-card__actions">
            <span class="meeting-card__time">${fmtTime(bk.timestamp)}</span>
            <button class="meeting-card__delete" title="Delete" data-type="booking" data-id="${bk.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
        `;
        bookingsList.appendChild(card);
      });
    }

    /* attach card events */
    attachCardEvents();
  };

  /* ── escape helper ──────────────────────── */
  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── card interaction events ─────────────── */
  const attachCardEvents = () => {
    /* delete buttons */
    document.querySelectorAll('.meeting-card__delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.type;
        const id   = Number(btn.dataset.id);
        if (type === 'inquiry') {
          let arr = JSON.parse(localStorage.getItem('sns_inquiries') || '[]');
          arr = arr.filter(x => x.id !== id);
          localStorage.setItem('sns_inquiries', JSON.stringify(arr));
        } else {
          let arr = JSON.parse(localStorage.getItem('sns_bookings') || '[]');
          arr = arr.filter(x => x.id !== id);
          localStorage.setItem('sns_bookings', JSON.stringify(arr));
        }
        render();
      });
    });

    /* expand message */
    document.querySelectorAll('.meeting-card__expand').forEach(btn => {
      btn.addEventListener('click', () => {
        const msgEl = document.getElementById(btn.dataset.target);
        if (!msgEl) return;
        msgEl.classList.toggle('expanded');
        btn.textContent = msgEl.classList.contains('expanded') ? 'Show less ▴' : 'Show more ▾';
      });
    });

    /* click card body → mark as read */
    document.querySelectorAll('.meeting-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = Number(card.dataset.id);
        let changed = false;
        ['sns_inquiries','sns_bookings'].forEach(key => {
          let arr = JSON.parse(localStorage.getItem(key) || '[]');
          const item = arr.find(x => x.id === id);
          if (item && !item.read) { item.read = true; changed = true; }
          localStorage.setItem(key, JSON.stringify(arr));
        });
        if (changed) render();
      });
    });
  };

  /* ── tab switching ──────────────────────── */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t  => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      const panel = document.getElementById(`meetings-panel-${tab.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── mark all read when section opened ──── */
  const meetingsNavBtn = document.getElementById('dash-nav-meetings');
  if (meetingsNavBtn) {
    meetingsNavBtn.addEventListener('click', () => {
      // Mark all as read after a small delay (user sees the section)
      setTimeout(() => {
        ['sns_inquiries','sns_bookings'].forEach(key => {
          let arr = JSON.parse(localStorage.getItem(key) || '[]');
          arr.forEach(x => { x.read = true; });
          localStorage.setItem(key, JSON.stringify(arr));
        });
        render();
      }, 800);
    });
  }

  /* ── expose global refresh ──────────────── */
  window.refreshMeetingRequests = render;

  /* ── initial render ─────────────────────── */
  render();
}

/* ═══════════════════════════════════════════════════════════
   CUSTOM SELECT UI
═══════════════════════════════════════════════════════════ */
function initCustomSelects() {
  const selects = document.querySelectorAll('select');
  selects.forEach(select => {
    if (select.closest('.custom-select-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    
    // Copy context info
    if (select.classList.contains('booking-country-select')) wrapper.classList.add('booking-country-wrapper');
    if (select.classList.contains('project-form__select')) wrapper.classList.add('project-form-wrapper');

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    select.style.display = 'none';

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-select-options';

    const renderDisplay = () => {
       const selectedOpt = select.options[select.selectedIndex];
       if (selectedOpt) {
          trigger.innerHTML = `<span>${selectedOpt.innerHTML}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
       } else {
          trigger.innerHTML = `<span>Select...</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
       }
       if (select.classList.contains('error')) trigger.classList.add('error');
       else trigger.classList.remove('error');
    };

    const populateOptions = () => {
       optionsContainer.innerHTML = '';
       Array.from(select.options).forEach((opt, index) => {
          if (opt.disabled && opt.value === '') return;
          const optionDiv = document.createElement('div');
          optionDiv.className = 'custom-select-option';
          if (select.selectedIndex === index) optionDiv.classList.add('selected');
          optionDiv.innerHTML = opt.innerHTML;
          
          optionDiv.addEventListener('click', (e) => {
             e.stopPropagation();
             select.selectedIndex = index;
             select.dispatchEvent(new Event('change'));
             wrapper.classList.remove('open');
          });
          optionsContainer.appendChild(optionDiv);
       });
    };

    populateOptions();
    renderDisplay();

    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsContainer);

    select.addEventListener('change', () => {
       renderDisplay();
       populateOptions();
    });

    trigger.addEventListener('click', (e) => {
       e.stopPropagation();
       document.querySelectorAll('.custom-select-wrapper').forEach(w => {
         if (w !== wrapper) w.classList.remove('open');
       });
       wrapper.classList.toggle('open');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
  });
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
       if (m.type === 'attributes' && m.attributeName === 'class') {
           const wrapper = m.target.closest('.custom-select-wrapper');
           if(wrapper) {
             const trigger = wrapper.querySelector('.custom-select-trigger');
             if(m.target.classList.contains('error')) trigger.classList.add('error');
             else trigger.classList.remove('error');
           }
       }
    });
  });
  selects.forEach(s => observer.observe(s, { attributes: true }));
}

/* ═══════════════════════════════════════════════════════════
   PROJECT ADD / EDIT MODAL
═══════════════════════════════════════════════════════════ */
function initProjectFormModal() {
  const modal      = document.getElementById('projectFormModal');
  const backdrop   = document.getElementById('projectFormBackdrop');
  const closeBtn   = document.getElementById('projectFormClose');
  const cancelBtn  = document.getElementById('projectFormCancel');
  const form       = document.getElementById('projectForm');
  const titleEl    = document.getElementById('projectFormTitle');
  const addBtn     = document.getElementById('addProjectBtn');
  const tbody      = document.getElementById('projectsTableBody');

  // Form fields
  const fName         = document.getElementById('pf-name');
  const fClient       = document.getElementById('pf-client');
  const fType         = document.getElementById('pf-type');
  const fTypeOther    = document.getElementById('pf-type-other');
  const fStatus       = document.getElementById('pf-status');
  const fDeadlineType = document.getElementById('pf-deadline-type');
  const fDeadlineDate = document.getElementById('pf-deadline-date');
  const fBudget       = document.getElementById('pf-budget');
  const fEditRow      = document.getElementById('pf-edit-row'); // stores row index

  if (!modal) return;

  const statusLabels = {
    tostart:  'To Start',
    live:     'Live',
    progress: 'In Progress',
    testing:  'Testing',
    pending:  'Pending',
  };

  /* ── dynamic form behavior ────────── */
  fType.addEventListener('change', () => {
    if (fType.value === 'Other') {
      fTypeOther.style.display = 'block';
      fTypeOther.required = true;
    } else {
      fTypeOther.style.display = 'none';
      fTypeOther.required = false;
      fTypeOther.value = '';
    }
  });

  fDeadlineType.addEventListener('change', () => {
    if (fDeadlineType.value === 'date') {
      fDeadlineDate.style.display = 'block';
      fDeadlineDate.required = true;
    } else {
      fDeadlineDate.style.display = 'none';
      fDeadlineDate.required = false;
      fDeadlineDate.value = '';
    }
  });

  /* ── helpers ──────────────────────── */
  const openModal = (mode = 'add', rowEl = null) => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    if (mode === 'add') {
      titleEl.textContent = 'Add Project';
      form.reset();
      fEditRow.value = '';
      fTypeOther.style.display = 'none';
      fTypeOther.required = false;
      fDeadlineDate.style.display = 'none';
      fDeadlineDate.required = false;
      Array.from(form.querySelectorAll('select')).forEach(s => s.dispatchEvent(new Event('change')));
    } else {
      titleEl.textContent = 'Edit Project';
      // Read cells: Name, Client, Type, Status badge text, Deadline, Budget
      const cells = rowEl.querySelectorAll('td');
      fName.value   = cells[0].textContent.trim();
      fClient.value = cells[1].textContent.trim();

      const typeVal = cells[2].textContent.trim();
      // Check if the type exists in the dropdown options
      const typeOptionExists = Array.from(fType.options).some(opt => opt.value === typeVal);
      if (typeOptionExists && typeVal !== 'Other') {
        fType.value = typeVal;
        fType.dispatchEvent(new Event('change'));
        fTypeOther.style.display = 'none';
        fTypeOther.required = false;
        fTypeOther.value = '';
      } else {
        fType.value = 'Other';
        fType.dispatchEvent(new Event('change'));
        fTypeOther.style.display = 'block';
        fTypeOther.required = true;
        fTypeOther.value = typeVal;
      }

      // Map badge text back to option value
      const badgeText = cells[3].querySelector('.admin-badge')?.textContent.trim() || '';
      const statusKey = Object.keys(statusLabels).find(k => statusLabels[k] === badgeText) || '';
      fStatus.value   = statusKey;
      fStatus.dispatchEvent(new Event('change'));

      const deadlineVal = cells[4].textContent.trim();
      if (deadlineVal === 'Delivered') {
        fDeadlineType.value = 'delivered';
        fDeadlineType.dispatchEvent(new Event('change'));
        fDeadlineDate.style.display = 'none';
        fDeadlineDate.required = false;
        fDeadlineDate.value = '';
      } else if (deadlineVal) {
        fDeadlineType.value = 'date';
        fDeadlineType.dispatchEvent(new Event('change'));
        fDeadlineDate.style.display = 'block';
        fDeadlineDate.required = true;
        const parsedDate = new Date(deadlineVal + ' 2026'); // Assume current year for parsing
        if (!isNaN(parsedDate)) {
           fDeadlineDate.value = parsedDate.toISOString().split('T')[0];
        } else {
           fDeadlineDate.value = '';
        }
      }

      fBudget.value   = cells[5].textContent.trim();
      fEditRow.value  = rowEl.dataset.rowIndex || '';
    }
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  /* ── open via "Add Project" button ── */
  if (addBtn) addBtn.addEventListener('click', () => openModal('add'));

  /* ── open via edit button (global handler for dynamic rows) ── */
  window.openEditProject = (btn) => {
    const row = btn.closest('tr');
    if (!row) return;
    openModal('edit', row);
  };

  /* ── close ───────────────────────── */
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (backdrop)  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  /* ── form submit ─────────────────── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name     = fName.value.trim();
    const client   = fClient.value.trim();
    const type     = fType.value === 'Other' ? fTypeOther.value.trim() : fType.value;
    const status   = fStatus.value;
    const deadlineType = fDeadlineType.value;
    
    let deadline   = '';
    if (deadlineType === 'delivered') {
      deadline = 'Delivered';
    } else if (deadlineType === 'date' && fDeadlineDate.value) {
      // Format the date nicely (e.g. "Aug 1")
      const d = new Date(fDeadlineDate.value);
      deadline = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    }
    
    const budget   = fBudget.value.trim();

    // Check all required fields
    if (!name || !client || !type || !status || !deadlineType || (deadlineType === 'date' && !fDeadlineDate.value) || !budget) {
      // Quick shake on empty fields
      const fieldsToCheck = [
        fName, 
        fClient, 
        fType.value === 'Other' ? fTypeOther : fType,
        fStatus,
        fDeadlineType,
        fDeadlineType.value === 'date' ? fDeadlineDate : null,
        fBudget
      ].filter(Boolean); // remove nulls

      fieldsToCheck.forEach(f => {
        if (!f.value.trim()) {
          f.style.borderColor = '#c0392b';
          f.addEventListener('input', () => { f.style.borderColor = ''; }, { once: true });
          f.addEventListener('change', () => { f.style.borderColor = ''; }, { once: true });
        }
      });
      return;
    }

    const badgeLabel = statusLabels[status] || status;
    const editRowEl  = fEditRow.value ? tbody.querySelector(`tr[data-row-index="${fEditRow.value}"]`) : null;

    const editIconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    const deleteIconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;

    if (editRowEl) {
      // ── Update existing row ──────────
      const cells = editRowEl.querySelectorAll('td');
      cells[0].textContent = name;
      cells[1].textContent = client;
      cells[2].textContent = type;
      cells[3].innerHTML   = `<span class="admin-badge ${status}">${badgeLabel}</span>`;
      cells[4].textContent = deadline;
      cells[5].textContent = budget;
      // edit/delete buttons stay in cells[6]
    } else {
      // ── Append new row ───────────────
      const rowIndex = `row-${Date.now()}`;
      const tr = document.createElement('tr');
      tr.dataset.rowIndex = rowIndex;
      tr.innerHTML = `
        <td>${name}</td>
        <td>${client}</td>
        <td>${type}</td>
        <td><span class="admin-badge ${status}">${badgeLabel}</span></td>
        <td>${deadline}</td>
        <td>${budget}</td>
        <td>
          <div class="admin-actions-cell">
            <button class="admin-edit-btn" aria-label="Edit project" onclick="window.openEditProject(this)">${editIconSVG}</button>
            <button class="admin-delete-btn" aria-label="Delete project" onclick="window.deleteProject(this)">${deleteIconSVG}</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    }

    closeModal();
  });

  /* ── delete via trash button ───────────────────────── */
  const deleteModal    = document.getElementById('deleteConfirmModal');
  const deleteBackdrop = document.getElementById('deleteConfirmBackdrop');
  const deleteCancel   = document.getElementById('deleteConfirmCancel');
  const deleteYes      = document.getElementById('deleteConfirmYes');
  let rowToDelete      = null;

  const closeDeleteModal = () => {
    if (deleteModal) {
      deleteModal.classList.remove('open');
      deleteModal.setAttribute('aria-hidden', 'true');
    }
    rowToDelete = null;
  };

  if (deleteCancel) deleteCancel.addEventListener('click', closeDeleteModal);
  if (deleteBackdrop) deleteBackdrop.addEventListener('click', closeDeleteModal);

  if (deleteYes) {
    deleteYes.addEventListener('click', () => {
      if (rowToDelete) {
        rowToDelete.style.opacity = '0';
        rowToDelete.style.transform = 'scale(0.95)';
        rowToDelete.style.transition = 'all 0.3s ease';
        setTimeout(() => {
          rowToDelete.remove();
          closeDeleteModal();
        }, 300);
      } else {
        closeDeleteModal();
      }
    });
  }

  window.deleteProject = (btn) => {
    const row = btn.closest('tr');
    if (!row || !deleteModal) return;
    rowToDelete = row;
    deleteModal.classList.add('open');
    deleteModal.setAttribute('aria-hidden', 'false');
  };
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
  initServiceModal();
  initTestimonialsSlider();
  initContactForm();
  initBookingModal();
  initFooterReveal();
  initNavActiveState();
  initStickyProcessScroll(); // Must run before initGSAPAnimations (both register ScrollTrigger)
  initGSAPAnimations();
  initScrollHint();
  initAdminLogin();
  initAdminDashboard();
  initMeetingRequests();
  initCustomSelects();
  initProjectFormModal();
});


if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  });
}

window.addEventListener('load', () => {
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
});
