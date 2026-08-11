/* ==========================================================================
   Fee Dev Studio — interações, scroll 3D e intro
   ========================================================================== */
(function () {
  'use strict';

  var MOTION = 1.5;                 // intensidade global do movimento
  var ACCENT = '#C8FF3E';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ease = function (p) { return p * (2 - p); };
  var q = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var byId = function (id) { return document.getElementById(id); };

  var pointer = { x: 0, y: 0 };
  var introEnd = 0;
  var typeTimer, scramTimer, lastPanel = -1, railCur = '';

  /* ---------- acordeões (planos + faq) ----------------------------------- */
  function initAccordions() {
    q('[data-acc]').forEach(function (item) {
      var btn = item.querySelector('[data-acc-btn]');
      var sign = item.querySelector('[data-acc-sign]');
      if (!btn) return;
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var open = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (sign) sign.textContent = open ? '−' : '+';
      });
    });
  }

  /* ---------- intro cinematográfica -------------------------------------- */
  function startIntro() {
    var wrap = byId('intro');
    if (!wrap) { introEnd = performance.now(); return; }
    if (reduce || window.scrollY > 10) { wrap.style.display = 'none'; introEnd = performance.now() - 3000; return; }

    var lines = [
      '$ init feedev_studio',
      '> carregando interface .......... ok',
      '> compilando experiência ........ ok',
      '> conectando whatsapp api ....... ok',
      '✓ deploy pronto. bem-vindo.'
    ];
    var box = byId('intro-lines'), fill = byId('intro-fill');
    var total = lines.join('').length, li = 0, ci = 0, done = 0;

    typeTimer = setInterval(function () {
      if (li >= lines.length) { clearInterval(typeTimer); setTimeout(exitIntro, 380); return; }
      ci += 2; done += 2;
      if (fill) fill.style.width = Math.min(100, (done / total) * 100) + '%';
      var prev = lines.slice(0, li).map(function (l) { return '<div>' + l + '</div>'; }).join('');
      if (box) box.innerHTML = prev + '<div class="is-current">' + lines[li].slice(0, ci) + '<span class="accent">▌</span></div>';
      if (ci >= lines[li].length) { li++; ci = 0; }
    }, 24);

    wrap.addEventListener('pointerdown', exitIntro);
  }

  function exitIntro() {
    if (introEnd) return;
    clearInterval(typeTimer);
    var wrap = byId('intro');
    if (wrap) {
      ['intro-term', 'intro-a', 'intro-b'].forEach(function (id) {
        var el = byId(id); if (el) el.classList.add('is-out');
      });
      wrap.style.pointerEvents = 'none';
      setTimeout(function () { wrap.style.display = 'none'; }, 1000);
    }
    introEnd = performance.now();
  }

  /* ---------- split de texto (letra por letra) --------------------------- */
  function split(el) {
    if (!el) return;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          Array.prototype.forEach.call(child.textContent, function (ch) {
            var s = document.createElement('span');
            s.textContent = ch;
            s.style.display = 'inline-block';
            s.style.whiteSpace = 'pre';
            s.style.willChange = 'transform,opacity';
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR' && !child.hasAttribute('data-nosplit')) {
          walk(child);
        }
      });
    })(el);
  }

  function chars(el) {
    return Array.prototype.slice.call(el.querySelectorAll('span')).filter(function (s) {
      return !s.hasAttribute('data-nosplit') && s.childNodes.length === 1 &&
             s.firstChild.nodeType === 3 && !s.querySelector('span');
    });
  }

  /* ---------- partículas de fundo ---------------------------------------- */
  var canvas, ctx, parts = [];
  function initParticles() {
    canvas = byId('bg-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    for (var i = 0; i < 90; i++) {
      parts.push({
        x: Math.random(), y: Math.random(),
        z: 0.2 + Math.random() * 0.8,
        s: Math.random() * 1.7 + 0.5,
        tw: Math.random() * 6.28
      });
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }
  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
  }
  function drawParticles(t) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (reduce) return;
    var dpr = window.devicePixelRatio, W = canvas.width, H = canvas.height, sy = window.scrollY;
    parts.forEach(function (p) {
      var y = (((p.y - sy * p.z * 0.00012) % 1) + 1) % 1;
      var x = (((p.x + pointer.x * p.z * 0.02) % 1) + 1) % 1;
      ctx.globalAlpha = (0.1 + 0.4 * p.z) * (0.6 + 0.4 * Math.sin(t * 0.001 + p.tw));
      ctx.fillStyle = p.z > 0.78 ? ACCENT : '#F2F2EF';
      ctx.beginPath();
      ctx.arc(x * W, y * H, p.s * p.z * dpr, 0, 6.283);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  /* ---------- embaralhar label do painel ativo --------------------------- */
  function scramble(item) {
    clearInterval(scramTimer);
    if (!item) return;
    var pool = '<>/[]{}#$_=+*', n = 0;
    scramTimer = setInterval(function () {
      n++;
      var settled = Math.floor((n / 14) * item.txt.length);
      item.el.textContent = Array.prototype.map.call(item.txt, function (ch, i) {
        return (i < settled || ch === ' ') ? ch : pool[(Math.random() * pool.length) | 0];
      }).join('');
      if (settled >= item.txt.length) { clearInterval(scramTimer); item.el.textContent = item.txt; }
    }, 34);
  }

  /* ---------- cache de elementos ----------------------------------------- */
  var C = {}, heroChars = [], panelChars = [], scrollChars = [], scramEls = [], heroDone = false;
  var SECTIONS = [
    ['hero', '01 — hero'], ['servicos', '02 — serviços'], ['clientes', '03 — clientes'],
    ['processo', '04 — processo'], ['planos', '05 — planos'], ['sobre', '06 — sobre'], ['faq', '07 — faq']
  ];

  function buildCache() {
    var a = byId('h1a'), b = byId('h1b');
    if (a) split(a); if (b) split(b);
    heroChars = (a ? chars(a) : []).concat(b ? chars(b) : []);

    panelChars = q('[data-split-panel]').map(function (el) {
      split(el);
      return { i: +el.getAttribute('data-split-panel'), chars: chars(el) };
    });
    scrollChars = q('[data-split-scroll]').map(function (el) {
      split(el);
      return { el: el, chars: chars(el) };
    });
    scramEls = q('[data-scram]').map(function (el) { return { el: el, txt: el.textContent }; });

    C = {
      nav: byId('nav'), rail: byId('rail'), railIdx: byId('rail-idx'),
      h1a: a, h1b: b, ast: byId('ast'), cta: byId('hero-cta'), hint: byId('hero-hint'),
      marquee: byId('marquee'), ctaBg: byId('cta-bg'),
      panels: q('[data-panel]'), sdots: q('[data-sdot]'), reveals: q('[data-reveal]')
    };
    C.bignums = C.panels.map(function (p) { return p.querySelector('[data-bignum]'); });
  }

  function progress(id) {
    var el = byId(id); if (!el) return 0;
    var r = el.getBoundingClientRect(), d = r.height - window.innerHeight;
    return d <= 0 ? 0 : clamp(-r.top / d, 0, 1);
  }

  /* ---------- loop principal --------------------------------------------- */
  function tick(t) {
    var vh = window.innerHeight;
    var e = introEnd ? (t - introEnd) / 1000 : -1;
    var f = function (delay) { return e < 0 ? 0 : ease(clamp((e - delay) / 0.55, 0, 1)); };

    if (C.nav) C.nav.style.opacity = f(0.1);
    if (C.rail) C.rail.style.opacity = f(0.3);

    // hero
    var hp = progress('hero');
    if (!heroDone && heroChars.length) {
      heroChars.forEach(function (s, i) {
        var p = ease(clamp((e - 0.1 - i * 0.045) / 0.5, 0, 1));
        s.style.opacity = p;
        s.style.transform = 'translateY(' + ((1 - p) * 0.6) + 'em) rotateX(' + ((1 - p) * -85) + 'deg)';
      });
      if (e > 0.1 + heroChars.length * 0.045 + 0.55) {
        heroDone = true;
        heroChars.forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; });
      }
    }
    if (C.h1a) C.h1a.style.transform = 'translateX(' + (-hp * 55 * MOTION) + 'vw)';
    if (C.h1b) C.h1b.style.transform = 'translateX(' + (hp * 55 * MOTION) + 'vw)';
    if (C.ast) {
      var ap = f(1.3);
      C.ast.style.opacity = ap;
      C.ast.style.transform = 'rotate(' + (window.scrollY * 0.12 * MOTION) + 'deg) scale(' + (0.4 + 0.6 * ap) + ')';
    }
    if (C.cta) {
      var cp = f(1.15);
      C.cta.style.opacity = cp;
      C.cta.style.transform = 'translateY(' + ((1 - cp) * 24) + 'px)';
    }
    if (C.hint) C.hint.style.opacity = Math.min(f(1.9), clamp(1 - hp * 5, 0, 1));

    // faixa rolante
    if (C.marquee) {
      var half = C.marquee.scrollWidth / 2;
      if (half > 0) C.marquee.style.transform = 'translateX(' + (-((window.scrollY * 0.45 * MOTION) % half)) + 'px)';
    }

    // serviços — painéis em cortina
    var sp = progress('servicos');
    C.panels.forEach(function (el, idx) {
      var i = +el.getAttribute('data-panel');
      var tt = sp * 2 - i;
      var enter = clamp(1 + tt, 0, 1);
      var leave = clamp(tt, 0, 1);
      el.style.clipPath = 'inset(' + ((1 - enter) * 100) + '% 0 0 0)';
      el.style.transform = 'translateY(' + (leave * -12 * MOTION) + 'vh)';
      el.style.opacity = 1 - leave * 0.9;
      el.style.zIndex = 10 + i;
      el.style.pointerEvents = Math.abs(tt) < 0.5 ? 'auto' : 'none';
      var bn = C.bignums[idx];
      if (bn) bn.style.transform = 'translateY(' + (((1 - enter) * 30 + leave * -20) * MOTION) + 'vh) rotate(' + (tt * 6 * MOTION) + 'deg)';
    });
    panelChars.forEach(function (item) {
      var tt = sp * 2 - item.i;
      var rev = clamp(1 - Math.abs(tt) * 1.1, 0, 1);
      var n = item.chars.length;
      item.chars.forEach(function (s, j) {
        var p = ease(clamp((rev - (j / n) * 0.55) / 0.45, 0, 1));
        s.style.opacity = p;
        s.style.transform = 'translateY(' + ((1 - p) * 0.45) + 'em)';
      });
    });
    var act = clamp(Math.round(sp * 2), 0, 2);
    if (act !== lastPanel && sp > 0.02 && sp < 0.98) { scramble(scramEls[act]); lastPanel = act; }
    C.sdots.forEach(function (el) {
      el.classList.toggle('is-on', +el.getAttribute('data-sdot') === act);
    });

    // fundo do cta
    if (C.ctaBg) {
      var r = C.ctaBg.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        C.ctaBg.style.transform = 'translateY(-50%) translateX(' + (-(vh - r.top) * 0.12 * MOTION) + 'px)';
      }
    }

    // títulos que se montam no scroll
    scrollChars.forEach(function (item) {
      var top = item.el.getBoundingClientRect().top;
      var v = clamp((vh * 0.9 - top) / (vh * 0.3), 0, 1);
      var n = item.chars.length;
      item.chars.forEach(function (s, j) {
        var p = ease(clamp((v - (j / n) * 0.6) / 0.4, 0, 1));
        s.style.opacity = p;
        s.style.transform = 'translateY(' + ((1 - p) * 0.5) + 'em) rotateX(' + ((1 - p) * -50) + 'deg)';
      });
    });

    // reveals
    C.reveals.forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      var v = clamp((vh * 0.94 - top) / (vh * 0.18), 0, 1);
      el.style.opacity = v;
      el.style.transform = 'translateY(' + ((1 - v) * 34 * MOTION) + 'px)';
    });

    // índice do trilho
    if (C.railIdx) {
      var cur = SECTIONS[0][1];
      SECTIONS.forEach(function (pair) {
        var el = byId(pair[0]);
        if (el && el.getBoundingClientRect().top < vh * 0.5) cur = pair[1];
      });
      if (cur !== railCur) { C.railIdx.textContent = cur; railCur = cur; }
    }

    drawParticles(t);
    requestAnimationFrame(tick);
  }

  /* ---------- boot -------------------------------------------------------- */
  window.addEventListener('pointermove', function (ev) {
    pointer.x = ev.clientX / window.innerWidth - 0.5;
    pointer.y = ev.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  initAccordions();
  buildCache();
  initParticles();
  startIntro();
  requestAnimationFrame(tick);
})();
