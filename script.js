/**
 * Ahmed Hannan — Personal Portfolio Interactive Scripts
 * Red, Black & White Aesthetic
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
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
   1. HERO CANVAS PARTICLE CONSTELLATION ANIMATION
   ========================================================================== */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.parentElement.offsetWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight);

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 12000), 75);
  const maxDistance = 140;

  const mouse = {
    x: null,
    y: null,
    radius: 120,
  };

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  });

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY <= rect.bottom) {
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    } else {
      mouse.x = null;
      mouse.y = null;
    }
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1;
      // 80% white/dim gray, 20% crimson red
      this.isRed = Math.random() < 0.25;
      this.color = this.isRed ? '#ff2a55' : 'rgba(255, 255, 255, 0.75)';
      this.glow = this.isRed ? 8 : 0;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interactivity: gentle repulsion
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 2;
          this.y -= Math.sin(angle) * force * 2;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      if (this.glow > 0) {
        ctx.shadowColor = '#ff2a55';
        ctx.shadowBlur = this.glow;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const opacity = (1 - dist / maxDistance) * 0.28;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          if (particles[i].isRed || particles[j].isRed) {
            ctx.strokeStyle = `rgba(255, 42, 85, ${opacity * 1.5})`;
          } else {
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
          }
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
          ctx.stroke();
        }
      }
    }

    // Update and draw particles
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. HERO SUBTITLE TYPEWRITER
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
  const typeSpeed = 70;
  const deleteSpeed = 35;
  const pauseEnd = 1600;

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
   3. HERO STATS COUNTER ANIMATION
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
   4. CATEGORY FILTERING FOR PROJECTS
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
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 40);
        } else {
          card.classList.add('hide');
        }
      });
    });
  });
}

/* ==========================================================================
   5. NAVBAR SCROLL-SPY & ACTIVE STATE
   ========================================================================== */
function initNavbarScrollSpy() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 100;

    // Toggle navbar background density
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Highlight active link
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
   6. MOBILE NAVIGATION MENU
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
   7. EMAIL COPY TO CLIPBOARD WITH TOAST
   ========================================================================== */
function initEmailCopy() {
  const copyButtons = document.querySelectorAll('.copy-email-btn');
  const email = 'ahmedhanan4@gmail.com';

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(email).then(() => {
        showToast('Copied ahmedhanan4@gmail.com to clipboard!');
      }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied ahmedhanan4@gmail.com to clipboard!');
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
  }, 3200);
}

/* ==========================================================================
   8. SMOOTH SCROLLING ENHANCEMENT
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const navHeight = 72;
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
   9. REPOSITORY DIRECTORY SEARCH & LANGUAGE FILTERING
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
      const cardSearchText = (card.getAttribute('data-search') || '') + ' ' + (card.querySelector('.repo-dir-name')?.textContent || '') + ' ' + (card.querySelector('.repo-dir-desc')?.textContent || '');

      const matchesLang = (currentLang === 'all') || (cardLang === currentLang);
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
