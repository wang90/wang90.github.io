/*
 * Animated stars and shooting stars for the homepage hero.
 */
(function () {
  'use strict';

  function init() {
    var header = document.querySelector('#page-header.full_page');
    if (header === null) return;
    if (header.querySelector('.home-sky')) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'home-sky';
    canvas.setAttribute('aria-hidden', 'true');
    header.insertBefore(canvas, header.firstChild);

    var ctx = canvas.getContext('2d');
    if (ctx === null) return;

    var width = 0;
    var height = 0;
    var dpr = 1;
    var stars = [];
    var meteors = [];
    var lastTime = performance.now();
    var spawnTimer = 0.8;
    var inView = true;
    var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

    function resize() {
      width = header.clientWidth || window.innerWidth;
      height = header.clientHeight || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createStars();
    }

    function createStars() {
      stars = [];
      var count = Math.round((width * height) / 7200);
      if (count < 70) count = 70;
      if (count > 190) count = 190;

      for (var i = 0; i < count; i += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.82,
          radius: 0.35 + Math.random() * 1.25,
          alpha: 0.35 + Math.random() * 0.55,
          twinkle: 0.16 + Math.random() * 0.36,
          speed: 0.45 + Math.random() * 1.6,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function spawnMeteor() {
      if (meteors.length >= 7) return;

      var angle = 0.58 + Math.random() * 0.22;
      var speed = 150 + Math.random() * 250;
      var direction = Math.random() < 0.5 ? -1 : 1;
      var vx = Math.cos(angle) * speed * direction;
      var vy = Math.sin(angle) * speed;
      var startX = direction < 0 ? width * (0.58 + Math.random() * 0.52) : width * (Math.random() * 0.42);
      var startY = -30 - Math.random() * height * 0.34;

      meteors.push({
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        life: 0,
        maxLife: 1.25 + Math.random() * 1.5,
        length: 1.05 + Math.random() * 1.45
      });
    }

    function drawStars(time) {
      for (var i = 0; i < stars.length; i += 1) {
        var star = stars[i];
        var alpha = star.alpha + Math.sin(time * star.speed + star.phase) * star.twinkle;
        if (alpha < 0.08) alpha = 0.08;
        if (alpha > 1) alpha = 1;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(210, 228, 255, ' + alpha.toFixed(3) + ')';
        ctx.fill();
      }
    }

    function drawMeteor(meteor) {
      var tailX = meteor.x - meteor.vx * meteor.length * 0.34;
      var tailY = meteor.y - meteor.vy * meteor.length * 0.34;
      var fadeIn = Math.min(1, meteor.life * 4);
      var fadeOut = Math.min(1, (meteor.maxLife - meteor.life) * 1.8);
      var alpha = Math.max(0, Math.min(1, fadeIn * fadeOut)) * 0.95;

      if (alpha <= 0) return;

      var gradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
      gradient.addColorStop(0, 'rgba(255, 255, 255, ' + alpha.toFixed(3) + ')');
      gradient.addColorStop(0.22, 'rgba(180, 220, 255, ' + (alpha * 0.62).toFixed(3) + ')');
      gradient.addColorStop(1, 'rgba(120, 180, 255, 0)');

      ctx.shadowColor = 'rgba(160, 210, 255, 0.85)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(tailX, tailY);
      ctx.lineWidth = 1.15;
      ctx.lineCap = 'round';
      ctx.strokeStyle = gradient;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(meteor.x, meteor.y, 1.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha.toFixed(3) + ')';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function update(delta) {
      spawnTimer -= delta;
      if (spawnTimer <= 0) {
        spawnMeteor();
        spawnTimer = 0.8 + Math.random() * 2.2;
      }

      for (var i = meteors.length - 1; i >= 0; i -= 1) {
        var meteor = meteors[i];
        meteor.x += meteor.vx * delta;
        meteor.y += meteor.vy * delta;
        meteor.life += delta;

        if (
          meteor.life > meteor.maxLife ||
          meteor.y > height + 90 ||
          meteor.x < -170 ||
          meteor.x > width + 170
        ) {
          meteors.splice(i, 1);
        }
      }
    }

    function render(time) {
      ctx.clearRect(0, 0, width, height);
      drawStars(time);
      for (var i = 0; i < meteors.length; i += 1) {
        drawMeteor(meteors[i]);
      }
    }

    function frame(now) {
      var delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (inView && reduceMotion === false) {
        update(delta);
        render(now / 1000);
      }

      window.requestAnimationFrame(frame);
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          inView = entries[0].isIntersecting;
        },
        { threshold: 0 }
      );
      observer.observe(header);
    }

    if ('ResizeObserver' in window) {
      var resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(header);
    } else {
      window.addEventListener('resize', resize, { passive: true });
    }

    resize();

    if (reduceMotion === true) {
      render(0);
      return;
    }

    lastTime = performance.now();
    window.requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
