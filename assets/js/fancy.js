// =============================================================================
// Fancy Effects: Particle System, Typing Animation, Scroll Reveal
// =============================================================================

// ---------------------------------------------------------------------------
// Particle System
// ---------------------------------------------------------------------------
(function () {
  var canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var particles = [];
  var isMobile = window.innerWidth < 768;
  var particleCount = isMobile ? 25 : 50;
  var maxDist = 140;
  var mouse = { x: null, y: null };

  function getParticleColor() {
    var style = getComputedStyle(document.documentElement);
    return style.getPropertyValue('--fancy-particle-color').trim() || '0, 210, 255';
  }

  var particleRGB = getParticleColor();

  function isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  var dotOpacity = isDarkTheme() ? 0.6 : 0.35;
  var lineOpacityMul = isDarkTheme() ? 0.3 : 0.15;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      r: Math.random() * 2 + 1,
    };
  }

  function init() {
    resize();
    particles = [];
    for (var i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Mouse grab effect
      if (mouse.x !== null) {
        var dx = mouse.x - p.x;
        var dy = mouse.y - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x += dx * 0.02;
          p.y += dy * 0.02;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + particleRGB + ',' + dotOpacity + ')';
      ctx.fill();

      // Draw connections
      for (var j = i + 1; j < particles.length; j++) {
        var p2 = particles[j];
        var ddx = p.x - p2.x;
        var ddy = p.y - p2.y;
        var d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < maxDist) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(' + particleRGB + ',' + (1 - d / maxDist) * lineOpacityMul + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', function () {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resize);

  // Re-read particle color and opacity on theme toggle
  var observer = new MutationObserver(function () {
    particleRGB = getParticleColor();
    dotOpacity = isDarkTheme() ? 0.6 : 0.35;
    lineOpacityMul = isDarkTheme() ? 0.3 : 0.15;
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  init();
  draw();
})();

// ---------------------------------------------------------------------------
// Typing Animation
// ---------------------------------------------------------------------------
(function () {
  var el = document.getElementById('typing-text');
  if (!el) return;

  var words = [
    'Machine Learning',
    'Data Science',
    'Software Engineering',
    'Biomedical Engineering',
    'Compliance',
  ];
  var wordIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var typeSpeed = 120;
  var deleteSpeed = 60;
  var pauseTime = 2000;

  function tick() {
    var current = words[wordIndex];

    if (isDeleting) {
      charIndex--;
      el.textContent = current.substring(0, charIndex);
    } else {
      charIndex++;
      el.textContent = current.substring(0, charIndex);
    }

    var delay = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIndex === current.length) {
      delay = pauseTime;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 400;
    }

    setTimeout(tick, delay);
  }

  tick();
})();

// ---------------------------------------------------------------------------
// Scroll Reveal
// ---------------------------------------------------------------------------
(function () {
  var targets = document.querySelectorAll('.scroll-reveal');
  if (!targets.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  targets.forEach(function (t) {
    observer.observe(t);
  });
})();
