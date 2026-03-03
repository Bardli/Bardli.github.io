// =============================================================================
// Fancy Effects: Particle System, Typing Animation, Scroll Reveal & More
// =============================================================================

var prefersReducedMotion =
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Particle System
// ---------------------------------------------------------------------------
(function () {
  var canvas = document.getElementById('particle-canvas');
  if (!canvas || prefersReducedMotion) return;

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

  // Pause particle animation when hero is off-screen
  var isCanvasVisible = true;
  var canvasVisObserver = new IntersectionObserver(
    function (entries) {
      isCanvasVisible = entries[0].isIntersecting;
      if (isCanvasVisible) requestAnimationFrame(draw);
    },
    { threshold: 0 }
  );
  canvasVisObserver.observe(canvas);

  function draw() {
    if (!isCanvasVisible) return;
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
    'Medical AI',
    'Computer Vision',
    'NLP & Agentic Systems',
    'Code Running in Space',
    '3D Medical Imaging',
  ];
  var wordIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var typeSpeed = 120;
  var deleteSpeed = 60;
  var pauseTime = 2000;

  function tick() {
    if (!document.body.contains(el)) return;
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

// ---------------------------------------------------------------------------
// Counter Animation
// ---------------------------------------------------------------------------
(function () {
  var counters = document.querySelectorAll('.stat-number[data-count]');
  if (!counters.length) return;

  var duration = 2000;

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      // Ease-out cubic: 1 - (1 - t)^3
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(function (el) {
    observer.observe(el);
  });
})();

// ---------------------------------------------------------------------------
// Staggered Reveal
// ---------------------------------------------------------------------------
(function () {
  var items = document.querySelectorAll('.stagger-reveal');
  if (!items.length) return;

  items.forEach(function (el, index) {
    if (!el.getAttribute('data-delay')) {
      el.setAttribute('data-delay', index * 150);
    }
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute('data-delay'), 10) || 0;
          setTimeout(function () {
            entry.target.classList.add('revealed');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  items.forEach(function (el) {
    observer.observe(el);
  });
})();

// ---------------------------------------------------------------------------
// Decrypted Text (Hero Name) — scramble → reveal on load
// ---------------------------------------------------------------------------
(function () {
  var el = document.getElementById('hero-name');
  if (!el) return;

  if (prefersReducedMotion) {
    el.classList.add('glitch-hover');
    return;
  }

  var originalText = el.textContent.trim().replace(/\s+/g, ' ');
  if (!originalText) return;

  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
  var tickSpeed = 50;
  var revealed = 0;

  function scramble(text, revealCount) {
    return text
      .split('')
      .map(function (c, i) {
        if (c === ' ') return ' ';
        if (i < revealCount) return text[i];
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');
  }

  el.textContent = scramble(originalText, 0);

  var interval = setInterval(function () {
    revealed += 1;
    el.textContent = scramble(originalText, revealed);
    if (revealed >= originalText.length) {
      el.textContent = originalText;
      el.classList.add('glitch-hover');
      clearInterval(interval);
    }
  }, tickSpeed);
})();

// ---------------------------------------------------------------------------
// Split Text (Section Headings) — character-by-character reveal
// ---------------------------------------------------------------------------
(function () {
  var headings = document.querySelectorAll('.fancy-section-heading');
  if (!headings.length) return;

  headings.forEach(function (heading) {
    // Skip headings that contain links (News, Blog, Publications)
    if (heading.querySelector('a')) return;

    var text = heading.textContent.trim();
    heading.textContent = '';
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.className = 'split-char';
      span.style.transitionDelay = i * 40 + 'ms';
      span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
      heading.appendChild(span);
    }
    heading.classList.add('split-heading');
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.classList.add('split-revealed');
          }, 200);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll('.split-heading').forEach(function (h) {
    observer.observe(h);
  });
})();

// ---------------------------------------------------------------------------
// Spotlight Card — radial gradient follows cursor on cards
// ---------------------------------------------------------------------------
(function () {
  var cards = document.querySelectorAll('.spotlight-card');
  if (!cards.length) return;

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', e.clientX - rect.left + 'px');
      card.style.setProperty('--mouse-y', e.clientY - rect.top + 'px');
    });
  });
})();

// ---------------------------------------------------------------------------
// 3D Tilt Card — perspective transform follows cursor
// ---------------------------------------------------------------------------
(function () {
  var cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      if (window.innerWidth < 768) return;
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = ((y - centerY) / centerY) * -8;
      var rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform =
        'perspective(800px) rotateX(' +
        rotateX +
        'deg) rotateY(' +
        rotateY +
        'deg) scale3d(1.03, 1.03, 1.03)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform =
        'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });
})();

// ---------------------------------------------------------------------------
// Click Spark — spark particles burst from every click
// ---------------------------------------------------------------------------
(function () {
  var canvas = document.getElementById('click-spark-canvas');
  if (!canvas || prefersReducedMotion) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var sparks = [];
  var duration = 500;
  var sparkSize = 12;
  var sparkRadius = 30;
  var sparkCount = 8;

  function getSparkColor() {
    var style = getComputedStyle(document.documentElement);
    return style.getPropertyValue('--fancy-accent').trim() || '#6366f1';
  }

  var sparkColor = getSparkColor();

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  // Update color on theme toggle
  var themeObserver = new MutationObserver(function () {
    sparkColor = getSparkColor();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  var animating = false;

  document.addEventListener('click', function (e) {
    var now = performance.now();
    for (var i = 0; i < sparkCount; i++) {
      sparks.push({
        x: e.clientX,
        y: e.clientY,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now,
      });
    }
    if (!animating) {
      animating = true;
      requestAnimationFrame(draw);
    }
  });

  function draw(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sparks = sparks.filter(function (spark) {
      var elapsed = timestamp - spark.startTime;
      if (elapsed >= duration) return false;

      var progress = elapsed / duration;
      var eased = progress * (2 - progress); // ease-out quad
      var distance = eased * sparkRadius;
      var lineLength = sparkSize * (1 - eased);

      var x1 = spark.x + distance * Math.cos(spark.angle);
      var y1 = spark.y + distance * Math.sin(spark.angle);
      var x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
      var y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

      ctx.strokeStyle = sparkColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 1 - progress;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      return true;
    });

    if (sparks.length > 0) {
      requestAnimationFrame(draw);
    } else {
      animating = false;
    }
  }
})();

// ---------------------------------------------------------------------------
// Magnetic Hover — social links pull toward cursor
// ---------------------------------------------------------------------------
(function () {
  // Add magnetic class to social/contact links
  var socialLinks = document.querySelectorAll('.contact-icons a');
  socialLinks.forEach(function (link) {
    link.classList.add('magnetic');
  });

  var magnets = document.querySelectorAll('.magnetic');
  if (!magnets.length) return;

  magnets.forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      if (window.innerWidth < 768) return;
      var rect = el.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = 'translate(' + x * 0.35 + 'px, ' + y * 0.35 + 'px)';
    });

    el.addEventListener('mouseleave', function () {
      el.style.transform = 'translate(0, 0)';
    });
  });
})();
