// Reveal on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Nav scrolled state + scroll progress
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
    const sh = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (window.scrollY / sh * 100) + '%';
  }, { passive: true });

  // Cursor glow follow
  const glow = document.getElementById('cursorGlow');
  let mx = window.innerWidth/2, my = window.innerHeight/2;
  let cx = mx, cy = my;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function tick() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    glow.style.transform = `translate(${cx - 200}px, ${cy - 200}px)`;
    requestAnimationFrame(tick);
  }
  tick();

  // 3D scene parallax on mouse move
  const scene = document.getElementById('scene');
  if (scene) {
    const heroSection = document.querySelector('.hero');
    heroSection.addEventListener('mousemove', e => {
      const r = heroSection.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      scene.style.animation = 'none';
      scene.style.transform = `rotateY(${-8 + px * 10}deg) rotateX(${4 - py * 8}deg)`;
    });
    heroSection.addEventListener('mouseleave', () => {
      scene.style.animation = '';
      scene.style.transform = '';
    });
  }

  // About badge 3D tilt
  const badge = document.getElementById('aboutBadge');
  if (badge) {
    badge.addEventListener('mousemove', e => {
      const r = badge.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      badge.style.transform = `rotateY(${px * 14}deg) rotateX(${-py * 14}deg) translateZ(0)`;
    });
    badge.addEventListener('mouseleave', () => { badge.style.transform = ''; });
  }

  // Project cards mouse spotlight
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
