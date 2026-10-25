/**
 * Ahmed Hannan — Personal Portfolio Interactive Scripts
 * Architectural Matte Aesthetic & 3D Tensor Manifold Simulation
 */

document.addEventListener('DOMContentLoaded', () => {
  initTensorMeshCanvas();
  initCardSpotlight();
  initScrollReveal();
  initTypewriter();
  initStatsCounter();
  initCategoryFilter();
  initNavbarScrollSpy();
  initMobileMenu();
  initEmailCopy();
  initSmoothScroll();
  initRepoSearch();
});

/* ==========================================================================
   1. 3D TENSOR MANIFOLD / TOPOLOGICAL WAVE SIMULATION
   Mathematical perspective-projected grid with harmonic elevation & mouse ripples
   ========================================================================== */
function initTensorMeshCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let animationFrameId;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = canvas.parentElement.offsetWidth;
    height = canvas.parentElement.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);

  // 3D Grid Parameters
  const cols = Math.min(Math.floor(width / 34), 48);
  const rows = 26;
  const gridWidth = Math.max(width * 1.35, 1200);
  const gridDepth = 900;
  const spacingX = gridWidth / (cols - 1);
  const spacingZ = gridDepth / (rows - 1);

  // Perspective Camera
  const focalLength = 550;
  const cameraY = -220; // Elevated camera looking down
  const cameraTilt = 0.42; // Pitch angle in radians
  const cosTilt = Math.cos(cameraTilt);
  const sinTilt = Math.sin(cameraTilt);

  // Mouse interaction state
  const mouse = {
    x: width * 0.5,
    y: height * 0.4,
    targetX: width * 0.5,
    targetY: height * 0.4,
    active: false,
    radius: 280,
  };

  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    });

    heroSection.addEventListener('mouseleave', () => {
      mouse.active = false;
    });
  }

  let time = 0;

  function animate() {
    time += 0.016;

    // Smooth mouse interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    ctx.clearRect(0, 0, width, height);

    const projectedPoints = [];
    const originX = width * 0.5;
    const originY = height * 0.48;

    // Compute 3D coordinates and perspective projection
    for (let r = 0; r < rows; r++) {
      projectedPoints[r] = [];
      const baseZ = r * spacingZ + 80;

      for (let c = 0; c < cols; c++) {
        const baseX = (c - (cols - 1) * 0.5) * spacingX;

        // Base harmonic wave equation (representing a high-dimensional loss surface)
        const u = c * 0.22;
        const v = r * 0.24;
        let waveHeight =
          Math.sin(u + time * 0.9) * Math.cos(v + time * 0.7) * 28 +
          Math.sin((u + v) * 0.6 - time * 1.1) * 16 +
          Math.cos(u * 0.5 - time * 0.5) * 10;

        // Interactive mouse gravitational ripple
        if (mouse.active) {
          // Approximate screen-to-world distance
          const screenDx = baseX + originX - mouse.x;
          const screenDy = baseZ * 0.4 + originY - mouse.y;
          const dist2D = Math.sqrt(screenDx * screenDx + screenDy * screenDy);

          if (dist2D < mouse.radius) {
            const influence = (1 - dist2D / mouse.radius);
            const ripple = Math.sin(dist2D * 0.05 - time * 4) * 36 * influence * influence;
            waveHeight -= ripple;
          }
        }

        // Apply camera rotation (pitch tilt around X axis)
        const relY = waveHeight - cameraY;
        const rotY = relY * cosTilt - baseZ * sinTilt;
        const rotZ = relY * sinTilt + baseZ * cosTilt;

        if (rotZ > 10) {
          const scale = focalLength / rotZ;
          const projX = originX + baseX * scale;
          const projY = originY + rotY * scale;

          // Normalized depth factor for shading (0 = far/fade, 1 = near)
          const depthAlpha = Math.max(0, Math.min(1, 1 - (rotZ - 100) / 950));

          projectedPoints[r][c] = {
            x: projX,
            y: projY,
            z: rotZ,
            alpha: depthAlpha,
            wave: waveHeight,
          };
        } else {
          projectedPoints[r][c] = null;
        }
      }
    }

    // Render wireframe grid lines with depth-faded alpha
    ctx.lineWidth = 1;

    // Longitudinal lines (Z-direction)
    for (let c = 0; c < cols; c += 2) {
      ctx.beginPath();
      let started = false;

      for (let r = 0; r < rows; r++) {
        const p = projectedPoints[r][c];
        if (p && p.alpha > 0.02) {
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        } else {
          started = false;
        }
      }

      const colAlpha = 0.16 * (1 - Math.abs(c - cols * 0.5) / (cols * 0.5));
      ctx.strokeStyle = `rgba(185, 49, 63, ${Math.max(0, colAlpha)})`;
      ctx.stroke();
    }

    // Latitudinal lines (X-direction)
    for (let r = 0; r < rows; r++) {
      ctx.beginPath();
      let started = false;

      for (let c = 0; c < cols; c++) {
        const p = projectedPoints[r][c];
        if (p && p.alpha > 0.02) {
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        } else {
          started = false;
        }
      }

      // Smooth depth fading
      const rAlpha = (r / rows) * 0.14 + 0.02;
      ctx.strokeStyle = `rgba(255, 255, 255, ${rAlpha})`;
      ctx.stroke();
    }

    // Render tensor node markers at key topological intersections
    for (let r = 2; r < rows; r += 3) {
      for (let c = 2; c < cols; c += 3) {
        const p = projectedPoints[r][c];
        if (p && p.alpha > 0.15) {
          const isCrimsonNode = (r + c) % 6 === 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, isCrimsonNode ? 2.2 : 1.3, 0, Math.PI * 2);

          if (isCrimsonNode) {
            ctx.fillStyle = `rgba(185, 49, 63, ${p.alpha * 0.85})`;
          } else {
            ctx.fillStyle = `rgba(244, 244, 246, ${p.alpha * 0.5})`;
          }
          ctx.fill();
        }
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. CARD MOUSE SPOTLIGHT (Linear / Vercel Matte Lighting)
   ========================================================================== */
function initCardSpotlight() {
  const cards = document.querySelectorAll(
    '.project-card, .repo-dir-card, .timeline-card, .skill-category-card, .cv-card, .contact-channel-card, .contact-form-card'
  );

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mouse-x', '-999px');
      card.style.setProperty('--mouse-y', '-999px');
    });
  });
}

/* ==========================================================================
   3. SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(
    '.project-card, .repo-dir-card, .timeline-card, .skill-category-card, .cv-card, .contact-channel-card, .contact-form-card'
  );

  revealElements.forEach((el) => {
    el.classList.add('reveal-on-scroll');
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   4. HERO SUBTITLE TYPEWRITER
   ========================================================================== */
function initTypewriter() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const roles = [
    'Full-Stack Developer',
    'AI & Machine Learning Engineer',
    'Generative Deep Learning Researcher',
    'High-Performance Systems Engineer',
    'Computer Scientist (FAST-NUCES)'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const typeSpeed = 65;
  const deleteSpeed = 30;
  const pauseEnd = 1800;

  function type() {
    const currentRole = roles[roleIdx];

    if (!isDeleting) {
      charIdx++;
      el.textContent = currentRole.substring(0, charIdx);
      if (charIdx === currentRole.length) {
        isDeleting = true;
        setTimeout(type, pauseEnd);
        return;
      }
      setTimeout(type, typeSpeed);
    } else {
      charIdx--;
      el.textContent = currentRole.substring(0, charIdx);
      if (charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        setTimeout(type, 300);
        return;
      }
      setTimeout(type, deleteSpeed);
    }
  }

  type();
}

/* ==========================================================================
   5. HERO STATS COUNTER ANIMATION
   ========================================================================== */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  let animated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          statNumbers.forEach((item) => {
            const target = parseInt(item.getAttribute('data-target'), 10);
            if (isNaN(target)) return;

            const suffix = item.querySelector('span')
              ? item.querySelector('span').outerHTML
              : '';
            const duration = 1200;
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              item.innerHTML = Math.floor(current) + suffix;
            }, stepTime);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  const heroSection = document.getElementById('hero');
  if (heroSection) observer.observe(heroSection);
}

/* ==========================================================================
   6. CATEGORY FILTERING FOR PROJECTS
   ========================================================================== */
function initCategoryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.classList.remove('hide');
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.classList.add('hide');
        }
      });
    });
  });
}

/* ==========================================================================
   7. NAVBAR SCROLL-SPY & ACTIVE STATE
   ========================================================================== */
function initNavbarScrollSpy() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 100;

    if (window.scrollY > 35) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

/* ==========================================================================
   8. MOBILE NAVIGATION MENU
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const icon = toggleBtn.querySelector('i');
    if (navMenu.classList.contains('open')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
    } else {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });
  });
}

/* ==========================================================================
   9. EMAIL COPY TO CLIPBOARD WITH TOAST
   ========================================================================== */
function initEmailCopy() {
  const copyButtons = document.querySelectorAll('.copy-email-btn');
  const email = 'ahmedhanan4@gmail.com';

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(email).then(() => {
        showToast('Copied ahmedhanan4@gmail.com to clipboard');
      }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied ahmedhanan4@gmail.com to clipboard');
      });
    });
  });
}

function showToast(message) {
  let toast = document.getElementById('portfolio-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'portfolio-toast';
    toast.className = 'portfolio-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${message}</span>`;
  toast.classList.add('visible');

  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

/* ==========================================================================
   10. SMOOTH SCROLLING ENHANCEMENT
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const navHeight = 68;
        const targetPos = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth',
        });
      }
    });
  });
}

/* ==========================================================================
   11. REPOSITORY DIRECTORY SEARCH & LANGUAGE FILTERING
   ========================================================================== */
function initRepoSearch() {
  const searchInput = document.getElementById('repo-search-input');
  const langBtns = document.querySelectorAll('.repo-lang-btn');
  const cards = document.querySelectorAll('.repo-dir-card');
  const countBadge = document.getElementById('repo-count-badge');

  if (!cards.length) return;

  let currentLang = 'all';
  let searchQuery = '';

  function filterRepos() {
    let visibleCount = 0;
    const query = searchQuery.trim().toLowerCase();

    cards.forEach((card) => {
      const cardLang = card.getAttribute('data-lang') || '';
      const cardSearchText =
        (card.getAttribute('data-search') || '') +
        ' ' +
        (card.querySelector('.repo-dir-name')?.textContent || '') +
        ' ' +
        (card.querySelector('.repo-dir-desc')?.textContent || '');

      const matchesLang = currentLang === 'all' || cardLang === currentLang;
      const matchesSearch = !query || cardSearchText.toLowerCase().includes(query);

      if (matchesLang && matchesSearch) {
        card.classList.remove('hide');
        visibleCount++;
      } else {
        card.classList.add('hide');
      }
    });

    if (countBadge) {
      countBadge.textContent = `Showing ${visibleCount} of ${cards.length} repositories`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterRepos();
    });
  }

  langBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      langBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentLang = btn.getAttribute('data-lang') || 'all';
      filterRepos();
    });
  });
}


window.copyTerminalCmd = function () {
  navigator.clipboard.writeText('curl -sL https://ahmed-hannan.github.io/resume.txt').then(() => {
    showToast('Copied curl command to clipboard');
  }).catch(() => {
    showToast('Copied curl command to clipboard');
  });
};
