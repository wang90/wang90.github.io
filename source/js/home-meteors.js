/*
 * Lightweight animated shooting stars for the homepage hero.
 */
(function () {
  'use strict';

  function init() {
    var header = document.querySelector('#page-header.full_page');
    if (header === null) return;
    if (header.querySelector('.home-meteors')) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'home-meteors';
    canvas.setAttribute('aria-hidden', 'true');
    header.insertBefore(canvas, header.firstChild);

    var ctx = canvas.getContext('2d');
    if (ctx === null) return;

    var width = 0;
    var height = 0;
    var dpr = 1;
    var meteors = [];
    var lastTime = performance.now();
    var spawnTimer = 0.4;
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
    }

    function spawnMeteor() {
      if (meteors.length >= 12) return;

      var angle = 0.58 + Math.random() * 0.22;
      var speed = 150 + Math.random() * 260;
      var direction = Math.random() < 0.5 ? -1 : 1;
      var vx = Math.cos(angle) * speed * direction;
      var vy = Math.sin(angle) * speed;
      var startX = direction < 0 ? width * (0.55 + Math.random() * 0.55) : width * (Math.random() * 0.45);
      var startY = -30 - Math.random() * height * 0.36;

      meteors.push({
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        life: 0,
        maxLife: 1.25 + Math.random() * 1.55,
        length: 1.1 + Math.random() * 1.5
      });
    }

    function removeMeteor(index) {
      meteors.splice(index, 1);
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
        spawnTimer = 0.6 + Math.random() * 1.9;
      }

      for (var i = meteors.length - 1; i >= 0; i -= 1) {
        var meteor = meteors[i];
        meteor.x += meteor.vx * delta;
        meteor.y += meteor.vy * delta;
        meteor.life += delta;

        if (
          meteor.life > meteor.maxLife ||
          meteor.y > height + 80 ||
          meteor.x < -160 ||
          meteor.x > width + 160
        ) {
          removeMeteor(i);
        }
      }
    }

    function render() {
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < meteors.length; i += 1) {
        drawMeteor(meteors[i]);
      }
    }

    function frame(now) {
      var delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (inView && reduceMotion === false) {
        update(delta);
        render();
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
    lastTime = performance.now();
    window.requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
