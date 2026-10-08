/*
 * Discrete 3D line-segment field for the homepage hero.
 * Pure Canvas 2D, no external dependency.
 */
(function () {
  'use strict';

  var header = null;
  var canvas = null;
  var ctx = null;
  var segments = [];
  var width = 0;
  var height = 0;
  var dpr = 1;
  var inView = true;
  var pageHidden = false;
  var reduceMotion = false;
  var rafId = null;
  var lastTime = performance.now();
  var clock = 0;

  var pointerTargetX = 0;
  var pointerTargetY = 0;
  var pointerX = 0;
  var pointerY = 0;

  var rot = { cy: 1, sy: 0, cx: 1, sx: 0 };

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function buildGeometry() {
    segments = [];
    var count = window.innerWidth < 768 ? 70 : 140;

    for (var i = 0; i < count; i += 1) {
      // Random point inside a sphere, so the field feels scattered instead of grid-like.
      var radius = 3.6 * Math.cbrt(Math.random());
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);

      var x = radius * Math.sin(phi) * Math.cos(theta);
      var y = radius * Math.sin(phi) * Math.sin(theta);
      var z = radius * Math.cos(phi);

      // Random 3D orientation for each short segment.
      var vx = Math.random() * 2 - 1;
      var vy = Math.random() * 2 - 1;
      var vz = Math.random() * 2 - 1;
      var vLen = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
      vx = vx / vLen;
      vy = vy / vLen;
      vz = vz / vLen;

      var roll = Math.random();
      var color = roll < 0.16 ? '255, 150, 230' : (roll < 0.56 ? '116, 214, 255' : '150, 160, 255');

      segments.push({
        x: x,
        y: y,
        z: z,
        vx: vx,
        vy: vy,
        vz: vz,
        len: rand(0.34, 1.02),
        phase: Math.random() * Math.PI * 2,
        speed: rand(0.42, 1.12),
        wave: rand(0.035, 0.13),
        color: color
      });
    }
  }

  function project(x, y, z) {
    var x1 = x * rot.cy - z * rot.sy;
    var z1 = x * rot.sy + z * rot.cy;

    var y1 = y * rot.cx - z1 * rot.sx;
    var z2 = y * rot.sx + z1 * rot.cx;

    var perspective = 1 / (1 + z2 * 0.078);
    var scale = Math.min(width, height) * 0.112;

    return {
      x: width / 2 + x1 * scale * perspective,
      y: height / 2 - y1 * scale * perspective,
      z: z2,
      perspective: perspective
    };
  }

  function draw(time) {
    if (ctx === null || width === 0 || height === 0) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    var ry = time * 0.075 + pointerX * 0.52;
    var rx = -0.22 + Math.sin(time * 0.18) * 0.08 + pointerY * 0.36;
    rot.cy = Math.cos(ry);
    rot.sy = Math.sin(ry);
    rot.cx = Math.cos(rx);
    rot.sx = Math.sin(rx);

    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.setLineDash([]);

    for (var i = 0; i < segments.length; i += 1) {
      var s = segments[i];

      // Each segment breathes on its own timeline, so the field stays discrete.
      var pulse = 1 + Math.sin(time * s.speed + s.phase) * 0.34;
      var half = s.len * pulse * 0.5;
      var wobble = Math.sin(time * 0.72 + s.phase) * s.wave;

      var ax = s.x - s.vx * half + wobble;
      var ay = s.y - s.vy * half + Math.cos(time * 0.66 + s.phase) * s.wave;
      var az = s.z - s.vz * half;

      var bx = s.x + s.vx * half + wobble;
      var by = s.y + s.vy * half + Math.cos(time * 0.66 + s.phase) * s.wave;
      var bz = s.z + s.vz * half;

      var a = project(ax, ay, az);
      var b = project(bx, by, bz);
      var near = 1 - Math.max(0, Math.min(1, ((a.z + b.z) / 2 + 5.1) / 10.2));

      if (near < 0.06) continue;

      var alpha = 0.05 + near * near * 0.78;
      var mx = (a.x + b.x) * 0.5;
      var my = (a.y + b.y) * 0.5;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineWidth = 0.8 + near * 2.7;
      ctx.strokeStyle = 'rgba(' + s.color + ', ' + (alpha * 0.18).toFixed(3) + ')';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineWidth = 0.38 + near * 0.95;
      ctx.strokeStyle = 'rgba(' + s.color + ', ' + alpha.toFixed(3) + ')';
      ctx.stroke();

      if (near > 0.28) {
        ctx.beginPath();
        ctx.arc(mx, my, 0.6 + near * 1.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + s.color + ', ' + (near * 0.34).toFixed(3) + ')';
        ctx.fill();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  function resize() {
    if (header === null || canvas === null || ctx === null) return;

    width = header.clientWidth || window.innerWidth;
    height = header.clientHeight || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    if (reduceMotion) draw(0);
  }

  function frame(now) {
    var delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (pageHidden === false && inView) {
      clock += delta;
      pointerX += (pointerTargetX - pointerX) * 0.045;
      pointerY += (pointerTargetY - pointerY) * 0.045;
      draw(clock);
    }

    rafId = window.requestAnimationFrame(frame);
  }

  function onPointerMove(event) {
    if (header === null) return;
    var rect = header.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    pointerTargetX = ((event.clientX - rect.left) / rect.width - 0.5) * 1.15;
    pointerTargetY = ((event.clientY - rect.top) / rect.height - 0.5) * 1.15;
  }

  function onPointerLeave() {
    pointerTargetX = 0;
    pointerTargetY = 0;
  }

  function init() {
    header = document.querySelector('#page-header.full_page');
    if (header === null) return;

    reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    canvas = document.createElement('canvas');
    canvas.className = 'three-lines-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    header.insertBefore(canvas, header.firstChild);

    ctx = canvas.getContext('2d');
    if (ctx === null) return;

    buildGeometry();
    resize();

    if (reduceMotion) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        inView = entries[0] ? entries[0].isIntersecting : true;
      }, { threshold: 0 });
      observer.observe(header);
    }

    document.addEventListener('visibilitychange', function () {
      pageHidden = document.hidden;
    });

    header.addEventListener('pointermove', onPointerMove, { passive: true });
    header.addEventListener('pointerleave', onPointerLeave, { passive: true });

    if ('ResizeObserver' in window) {
      var resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(header);
    } else {
      window.addEventListener('resize', resize, { passive: true });
    }

    lastTime = performance.now();
    rafId = window.requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
