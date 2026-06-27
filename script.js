/**
 * ADSD Steel Technical Services – Main JavaScript
 * Features:
 *  - Page loader with animated logo
 *  - Custom cursor with inversion effect (dot + ring)
 *  - Sticky header with scroll detection
 *  - Mobile navigation toggle
 *  - Active nav link on scroll (Intersection Observer)
 *  - Hero particle canvas animation
 *  - Scroll-reveal animations (Intersection Observer)
 *  - Animated counter numbers
 *  - Magnetic button effect on hover
 *  - Contact form with validation & success state
 *  - Back-to-top button
 *  - Footer year auto-update
 */

/* ── Utility: wait for DOM ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. PAGE LOADER ─────────────────────────────────── */
  const loader = document.getElementById('loader');
  document.body.classList.add('loading');

  // Hide loader after ~2s (matches CSS fill animation)
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
    // Trigger hero reveal animations
    triggerHeroAnimations();
  }, 2200);


  /* ── 2. CUSTOM CURSOR (INVERSION EFFECT) ──────────────── */
  const cursorDot  = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
    requestAnimationFrame(() => {
      ringX += (mouseX - ringX) * 0.25;
      ringY += (mouseY - ringY) * 0.25;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';
    });
  });

  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
    cursorRing.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = '1';
    cursorRing.style.opacity = '1';
  });

  const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .service-card, .why-card, .gallery-item');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
  });


  /* ── 3. STICKY HEADER ───────────────────────────────── */
  const header = document.getElementById('header');

  const handleHeaderScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // run once on load


  /* ── 4. MOBILE NAVIGATION ───────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navList   = document.getElementById('navList');

  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile nav when a link is clicked
  navList.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (navList.classList.contains('open') &&
        !navList.contains(e.target) &&
        !navToggle.contains(e.target)) {
      navList.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    }
  });


  /* ── 5. ACTIVE NAV LINK ON SCROLL ──────────────────── */
  const sections    = document.querySelectorAll('section[id]');
  const navLinks    = document.querySelectorAll('.nav__link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(section => sectionObserver.observe(section));


  /* ── 6. HERO PARTICLE CANVAS ────────────────────────── */
  const canvas  = document.getElementById('heroCanvas');
  const ctx     = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  const resizeCanvas = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Cache theme colours once for the canvas (works for both dark & light themes)
  const cssVars   = getComputedStyle(document.documentElement);
  const clrPrimary = cssVars.getPropertyValue('--clr-primary').trim() || '#3dbfe0';
  const clrAccent  = cssVars.getPropertyValue('--clr-accent').trim()  || '#8dc63f';

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height;
      this.size  = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.6 ? clrPrimary : clrAccent;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      // Wrap around edges
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle   = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Create particles
  const PARTICLE_COUNT = 90;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  // Draw connecting lines between nearby particles
  const drawConnections = () => {
    const MAX_DIST = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / MAX_DIST) * 0.12;
          ctx.strokeStyle = clrPrimary;
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  };

  const animateParticles = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animFrame = requestAnimationFrame(animateParticles);
  };

  animateParticles();


  /* ── 7. SCROLL REVEAL ANIMATIONS ───────────────────── */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, parseInt(delay));
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // Hero animations triggered after loader hides
  function triggerHeroAnimations() {
    document.querySelectorAll('.hero .reveal-up').forEach(el => {
      const delay = el.dataset.delay || 0;
      setTimeout(() => el.classList.add('visible'), parseInt(delay));
    });
  }


  /* ── 8. ANIMATED COUNTER NUMBERS ───────────────────── */
  const counters = document.querySelectorAll('.hero__stat-num[data-count]');
  let countersStarted = false;

  const startCounters = () => {
    if (countersStarted) return;
    countersStarted = true;

    counters.forEach(counter => {
      const target   = parseInt(counter.dataset.count);
      const duration = 2000; // ms
      const step     = target / (duration / 16); // ~60fps
      let current    = 0;

      const tick = () => {
        current += step;
        if (current >= target) {
          counter.textContent = target;
        } else {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    });
  };

  // Start counters when hero section is visible
  const heroSection = document.getElementById('home');
  const counterObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      // Delay to sync with loader
      setTimeout(startCounters, 2400);
      counterObserver.unobserve(heroSection);
    }
  }, { threshold: 0.3 });
  counterObserver.observe(heroSection);


  /* ── 9. CONTACT FORM ────────────────────────────────── */
  const contactForm   = document.getElementById('contactForm');
  const formSuccess   = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic validation
      const name    = contactForm.querySelector('#name').value.trim();
      const email   = contactForm.querySelector('#email').value.trim();
      const message = contactForm.querySelector('#message').value.trim();

      if (!name || !email || !message) {
        // Shake invalid fields
        [contactForm.querySelector('#name'),
         contactForm.querySelector('#email'),
         contactForm.querySelector('#message')].forEach(field => {
          if (!field.value.trim()) {
            field.style.borderColor = '#e63946';
            field.addEventListener('input', () => {
              field.style.borderColor = '';
            }, { once: true });
          }
        });
        return;
      }

      // Simulate form submission (replace with real backend/API as needed)
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending...</span>';

      setTimeout(() => {
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Message</span> <i class="fa-solid fa-paper-plane"></i>';
        formSuccess.classList.add('visible');

        // Hide success message after 6s
        setTimeout(() => formSuccess.classList.remove('visible'), 6000);
      }, 1500);
    });
  }


  /* ── 10. BACK TO TOP ────────────────────────────────── */
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* ── 11. FOOTER YEAR ────────────────────────────────── */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ── 12. SMOOTH SCROLL FOR ANCHOR LINKS ─────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerH = header.offsetHeight;
        const top     = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ── 13. SERVICE CARD TILT EFFECT ───────────────────── */
  const tiltCards = document.querySelectorAll('.service-card, .why-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const centerX = rect.width  / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) *  5;

      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });


  /* ── 14. TICKER PAUSE ON HOVER ──────────────────────── */
  const tickerTrack = document.querySelector('.ticker__track');
  if (tickerTrack) {
    tickerTrack.addEventListener('mouseenter', () => {
      tickerTrack.style.animationPlayState = 'paused';
    });
    tickerTrack.addEventListener('mouseleave', () => {
      tickerTrack.style.animationPlayState = 'running';
    });
  }


  /* ── 15. GALLERY ITEM STAGGER ───────────────────────── */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        galleryObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  galleryItems.forEach(item => {
    item.style.opacity  = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    galleryObserver.observe(item);
  });


  /* -- 16. MAGNETIC BUTTON EFFECT -- */
  const magneticButtons = document.querySelectorAll('.btn--primary, .btn--ghost');
  
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 80;
      
      if (distance < maxDistance) {
        const strength = (1 - distance / maxDistance) * 15;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.02)`;
      }
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });


  /* ── 17. CLIENT REVIEWS ─────────────────────────────── */
  const reviewForm    = document.getElementById('reviewForm');
  const starPicker    = document.getElementById('starPicker');
  const reviewsCards  = document.getElementById('reviewsCards');

  // Reviews data – seed with the 3 pre-built cards already in HTML
  let reviewsData = [
    { name: 'MBS – MEEMAR BUILDING SYSTEM', company: 'Main Contractor', rating: 5, text: '', date: 'MAY 12, 2026', initials: 'M—' },
    { name: 'LAMPRELL',                      company: 'Site Engineer',    rating: 5, text: '', date: 'APR 28, 2026', initials: 'L' },
    { name: 'AL GHURAIR IRON & STEEL',       company: 'Facilities Manager', rating: 5, text: '', date: 'MAR 9, 2026', initials: 'AG' },
  ];

  let selectedRating = 0;

  // --- Star picker interaction ---
  if (starPicker) {
    const stars = starPicker.querySelectorAll('.reviews__star');

    const paintStars = (upTo) => {
      stars.forEach((s, i) => {
        const icon = s.querySelector('i');
        if (i < upTo) {
          icon.className = 'fa-solid fa-star';
          s.classList.add('active');
        } else {
          icon.className = 'fa-regular fa-star';
          s.classList.remove('active');
        }
      });
    };

    stars.forEach((star, idx) => {
      star.addEventListener('mouseenter', () => paintStars(idx + 1));
      star.addEventListener('mouseleave', () => paintStars(selectedRating));
      star.addEventListener('click', () => {
        selectedRating = idx + 1;
        paintStars(selectedRating);
      });
    });
  }

  // --- Update score display ---
  const updateScoreDisplay = () => {
    const total = reviewsData.length;
    if (!total) return;

    const avg = reviewsData.reduce((s, r) => s + r.rating, 0) / total;
    const counts = [0, 0, 0, 0, 0]; // index 0 = 1-star, 4 = 5-star
    reviewsData.forEach(r => counts[r.rating - 1]++);

    // Update average
    const avgEl = document.getElementById('reviewsAvgScore');
    if (avgEl) avgEl.textContent = avg.toFixed(1);

    // Update avg stars
    const avgStarsEl = document.getElementById('reviewsAvgStars');
    if (avgStarsEl) {
      avgStarsEl.innerHTML = '';
      for (let i = 1; i <= 5; i++) {
        const icon = document.createElement('i');
        icon.className = i <= Math.round(avg) ? 'fa-solid fa-star' : 'fa-regular fa-star';
        avgStarsEl.appendChild(icon);
      }
    }

    // Update count
    const countEl = document.getElementById('reviewsCount');
    if (countEl) countEl.textContent = total + (total === 1 ? ' REVIEW' : ' REVIEWS');

    // Update bars
    const maxCount = Math.max(...counts, 1);
    for (let star = 1; star <= 5; star++) {
      const barEl = document.querySelector(`#reviewsBars .reviews__bar-row:nth-child(${6 - star}) .reviews__bar-fill`);
      const countLabel = document.getElementById('bar' + star + 'Count');
      const cnt = counts[star - 1];
      if (barEl)    barEl.style.width = ((cnt / maxCount) * 100) + '%';
      if (countLabel) countLabel.textContent = cnt;
    }
  };

  // --- Build initials from name ---
  const makeInitials = (name) => {
    return name.split(/\s+/).map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
  };

  // --- Format date ---
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  };

  // --- Render a new review card ---
  const renderReviewCard = (review, prepend = true) => {
    const starsHtml = Array.from({ length: 5 }, (_, i) =>
      `<i class="fa-${i < review.rating ? 'solid' : 'regular'} fa-star"></i>`
    ).join('');

    const card = document.createElement('div');
    card.className = 'review-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    card.innerHTML = `
      <div class="review-card__header">
        <div class="review-card__avatar">${review.initials}</div>
        <div class="review-card__meta">
          <strong>${review.name}</strong>
          <span>${review.company || ''}</span>
        </div>
      </div>
      <div class="review-card__stars">${starsHtml}</div>
      <p class="review-card__text">${review.text}</p>
      <span class="review-card__date">${review.date}</span>
    `;

    if (prepend && reviewsCards.firstChild) {
      reviewsCards.insertBefore(card, reviewsCards.firstChild);
    } else {
      reviewsCards.appendChild(card);
    }

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    });
  };

  // --- Form submit ---
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal    = document.getElementById('reviewName').value.trim();
      const companyVal = document.getElementById('reviewCompany').value.trim();
      const textVal    = document.getElementById('reviewText').value.trim();

      // Validate
      let valid = true;
      [document.getElementById('reviewName'), document.getElementById('reviewText')].forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = 'var(--clr-red)';
          field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
          valid = false;
        }
      });
      if (selectedRating === 0) {
        starPicker.style.outline = '2px solid var(--clr-red)';
        starPicker.style.borderRadius = '6px';
        setTimeout(() => { starPicker.style.outline = ''; }, 2000);
        valid = false;
      }
      if (!valid) return;

      const newReview = {
        name:     nameVal.toUpperCase(),
        company:  companyVal,
        rating:   selectedRating,
        text:     textVal,
        date:     formatDate(new Date()),
        initials: makeInitials(nameVal),
      };

      reviewsData.unshift(newReview);
      renderReviewCard(newReview, true);
      updateScoreDisplay();

      // Reset form
      reviewForm.reset();
      selectedRating = 0;
      if (starPicker) {
        starPicker.querySelectorAll('.reviews__star').forEach(s => {
          s.querySelector('i').className = 'fa-regular fa-star';
          s.classList.remove('active');
        });
      }
    });
  }

  // Initial score render
  updateScoreDisplay();

  // Add cursor hover for review elements
  document.querySelectorAll('.review-card, .reviews__star').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
  });

}); // end DOMContentLoaded
