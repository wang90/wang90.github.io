/*
 * Three.js comic room for the ACG standalone page.
 */
(async function () {
  'use strict';

  var container = document.querySelector('.acg-room');
  if (container === null || container === undefined) return;

  var THREE;
  try {
    THREE = await import('./vendor/three.module.js');
  } catch (err) {
    container.innerHTML = '<div class="acg-room-loading">3D 漫画小屋加载失败，请查看下方漫画列表。</div>';
    return;
  }

  try {
    init(THREE, container);
  } catch (err) {
    container.innerHTML = '<div class="acg-room-loading">当前浏览器无法显示 3D 漫画小屋，请查看下方漫画列表。</div>';
  }
})();

function init(THREE, container) {
  'use strict';

  var width = container.clientWidth;
  var height = container.clientHeight;
  if (width === 0 || height === 0) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch (err) {
    container.innerHTML = '<div class="acg-room-loading">当前浏览器不支持 WebGL。</div>';
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03040c);
  scene.fog = new THREE.Fog(0x03040c, 7, 20);

  var target = new THREE.Vector3(0, 2.2, -1.4);
  var camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
  var theta = 0.62;
  var phi = 1.18;
  var radius = 9.4;
  var cameraPos = new THREE.Vector3();
  var dragging = false;
  var prevX = 0;
  var prevY = 0;

  function updateCamera(immediate) {
    var sinPhi = Math.sin(phi);
    cameraPos.set(
      target.x + radius * sinPhi * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * sinPhi * Math.cos(theta)
    );
    if (immediate === true) {
      camera.position.copy(cameraPos);
    } else {
      camera.position.lerp(cameraPos, 0.08);
    }
    camera.lookAt(target);
  }

  container.addEventListener('pointerdown', function (event) {
    dragging = true;
    prevX = event.clientX;
    prevY = event.clientY;
    if (container.setPointerCapture) {
      try {
        container.setPointerCapture(event.pointerId);
      } catch (err) {
        /* ignore */
      }
    }
  });

  container.addEventListener('pointermove', function (event) {
    if (dragging === false) return;
    var dx = event.clientX - prevX;
    var dy = event.clientY - prevY;
    prevX = event.clientX;
    prevY = event.clientY;
    theta -= dx * 0.006;
    phi -= dy * 0.004;
    if (phi < 0.72) phi = 0.72;
    if (phi > 1.42) phi = 1.42;
  });

  function endDrag(event) {
    dragging = false;
    if (event && container.releasePointerCapture) {
      try {
        container.releasePointerCapture(event.pointerId);
      } catch (err) {
        /* ignore */
      }
    }
  }

  container.addEventListener('pointerup', endDrag);
  container.addEventListener('pointercancel', endDrag);
  container.addEventListener('pointerleave', function () {
    dragging = false;
  });

  var hemi = new THREE.HemisphereLight(0x2b1f6b, 0x12061f, 0.55);
  scene.add(hemi);

  var dirLight = new THREE.DirectionalLight(0x7ef9ff, 0.72);
  dirLight.position.set(5, 8, 6);
  scene.add(dirLight);

  var fillLight = new THREE.PointLight(0xff3bd4, 1.05, 16);
  fillLight.position.set(-4.5, 3.4, 2.5);
  scene.add(fillLight);

  var room = new THREE.Group();
  scene.add(room);

  var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({ color: 0x05060f, roughness: 0.82, metalness: 0.18 })
  );
  floor.rotation.x = -Math.PI / 2;
  room.add(floor);

  var backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 7),
    new THREE.MeshStandardMaterial({ color: 0x070a18, roughness: 0.98 })
  );
  backWall.position.set(0, 3.5, -5.2);
  room.add(backWall);

  var rug = new THREE.Mesh(
    new THREE.PlaneGeometry(5.4, 3.6),
    new THREE.MeshStandardMaterial({ color: 0x14082a, roughness: 0.86, metalness: 0.08 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.012, 1.1);
  room.add(rug);

  var wood = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.38, metalness: 0.78 });
  var woodDark = new THREE.MeshStandardMaterial({ color: 0x090d18, roughness: 0.42, metalness: 0.82 });
  var shelf = new THREE.Group();
  shelf.position.set(0, 0, -4.25);
  scene.add(shelf);

  var W = 6.0;
  var H = 4.8;
  var D = 0.7;
  var side = 0.18;
  var boardT = 0.18;

  function addBox(parent, w, h, d, x, y, z, material, rotationZ) {
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    if (rotationZ) mesh.rotation.z = rotationZ;
    parent.add(mesh);
    return mesh;
  }

  addBox(shelf, side, H, D, -W / 2 + side / 2, H / 2, 0, wood, 0);
  addBox(shelf, side, H, D, W / 2 - side / 2, H / 2, 0, wood, 0);
  addBox(shelf, W, boardT, D, 0, boardT / 2, 0, wood, 0);
  addBox(shelf, W, boardT, D, 0, H - boardT / 2, 0, wood, 0);
  addBox(
    shelf,
    W - side * 2,
    H - boardT * 2,
    0.08,
    0,
    H / 2,
    -D / 2 + 0.05,
    new THREE.MeshStandardMaterial({ color: 0x1a1f2d, roughness: 0.96 }),
    0
  );

  var shelfY = [1.0, 2.0, 3.0, 4.0];
  for (var i = 0; i < shelfY.length; i += 1) {
    addBox(shelf, W - side * 2, boardT, D, 0, shelfY[i], 0, woodDark, 0);
  }

  var spineColors = [
    0x00e5ff, 0xff3bd4, 0x7b2dff, 0x2de2e6, 0xff2e97, 0x00ffc8, 0x9b5cff,
    0x18d6ff, 0xff6ac8, 0x00b3ff, 0xb16cff, 0xff4d6d
  ];

  function addSpines(y, maxHeight) {
    var start = -W / 2 + side + 0.09;
    var end = W / 2 - side - 0.09;
    var x = start;
    while (x < end) {
      var bw = 0.12 + Math.random() * 0.18;
      if (x + bw > end) break;
      var bh = Math.max(0.34, maxHeight - Math.random() * 0.16);
      var bd = D * 0.66 + Math.random() * 0.08;
      var color = spineColors[Math.floor(Math.random() * spineColors.length)];
      var material = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.38, roughness: 0.42, metalness: 0.18 });
      addBox(
        shelf,
        bw,
        bh,
        bd,
        x + bw / 2,
        y + boardT / 2 + bh / 2,
        -0.02 + Math.random() * 0.04,
        material,
        (Math.random() - 0.5) * 0.1
      );
      x += bw + 0.03 + Math.random() * 0.04;
    }
  }

  addSpines(shelfY[0], 0.76);
  addSpines(shelfY[1], 0.76);
  addSpines(shelfY[3], 0.42);

  function makeCoverTexture(title, color) {
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 384;
    var ctx = canvas.getContext('2d');
    var base = new THREE.Color(color);
    var light = base.clone().offsetHSL(0, 0, 0.16);
    var dark = base.clone().offsetHSL(0, 0, -0.2);
    var gradient = ctx.createLinearGradient(0, 0, 256, 384);
    gradient.addColorStop(0, '#' + light.getHexString());
    gradient.addColorStop(1, '#' + dark.getHexString());
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 384);
    ctx.strokeStyle = 'rgba(255,255,255,0.72)';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 224, 352);
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.font = 'bold 42px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var chars = title.split('');
    var lineHeight = Math.min(50, 262 / chars.length);
    var startY = 192 - (chars.length - 1) * lineHeight / 2;
    for (var n = 0; n < chars.length; n += 1) {
      ctx.fillText(chars[n], 128, startY + n * lineHeight);
    }
    var texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }

  var favorites = [
    { title: '名侦探柯南', color: 0x2f5fcf },
    { title: '鬼灭之刃', color: 0x1f8a70 },
    { title: '新世纪福音战士', color: 0x7b2d8e },
    { title: '灌篮高手', color: 0xc0392b },
    { title: '圣斗士星矢', color: 0xd35400 },
    { title: '古惑仔', color: 0x2c3e50 },
    { title: '宠物小精灵', color: 0xe67e22 }
  ];

  var spacing = 0.76;
  var startX = -((favorites.length - 1) * spacing) / 2;
  var displayShelf = shelfY[2];
  var displayY = displayShelf + boardT / 2;
  for (var f = 0; f < favorites.length; f += 1) {
    var item = favorites[f];
    var coverTexture = makeCoverTexture(item.title, item.color);
    var sideMaterial = new THREE.MeshStandardMaterial({ color: item.color, emissive: item.color, emissiveIntensity: 0.55, roughness: 0.42, metalness: 0.18 });
    var frontMaterial = new THREE.MeshStandardMaterial({ map: coverTexture, emissive: item.color, emissiveMap: coverTexture, emissiveIntensity: 0.34, roughness: 0.38, metalness: 0.16 });
    var pageMaterial = new THREE.MeshStandardMaterial({ color: 0xf4ecd9, roughness: 0.9 });
    var bookWidth = 0.52;
    var bookHeight = 0.72;
    var bookDepth = 0.16;
    var materials = [sideMaterial, sideMaterial, sideMaterial, sideMaterial, frontMaterial, pageMaterial];
    addBox(
      shelf,
      bookWidth,
      bookHeight,
      bookDepth,
      startX + f * spacing,
      displayY + bookHeight / 2,
      D / 2 - bookDepth / 2 - 0.02,
      materials,
      0
    );
  }

  var lamp = new THREE.Group();
  var metal = new THREE.MeshStandardMaterial({ color: 0xb08a5a, roughness: 0.38, metalness: 0.45 });
  var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.6, 12), metal);
  pole.position.y = 0.8;
  lamp.add(pole);
  var base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.06, 16), metal);
  base.position.y = 0.03;
  lamp.add(base);
  var shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.36, 0.48, 24, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xffd9a0,
      emissive: 0xffb347,
      emissiveIntensity: 0.55,
      side: THREE.DoubleSide,
      roughness: 0.6
    })
  );
  shade.position.y = 1.62;
  lamp.add(shade);
  var lampLight = new THREE.PointLight(0xffc77a, 1.8, 7);
  lampLight.position.set(0, 1.4, 0);
  lamp.add(lampLight);
  lamp.position.set(3.35, 0, -2.75);
  scene.add(lamp);

  var dustCount = 220;
  var dustPositions = new Float32Array(dustCount * 3);
  for (var d = 0; d < dustCount; d += 1) {
    dustPositions[d * 3] = (Math.random() - 0.5) * 11;
    dustPositions[d * 3 + 1] = Math.random() * 5 + 0.25;
    dustPositions[d * 3 + 2] = (Math.random() - 0.5) * 9 - 1;
  }
  var dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  var dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      color: 0x7ef9ff,
      size: 0.025,
      transparent: true,
      opacity: 0.72,
      depthWrite: false
    })
  );
  scene.add(dust);

  // Cyberpunk floor grid.
  var grid = new THREE.GridHelper(18, 36, 0x00e5ff, 0x7b2dff);
  grid.position.y = 0.025;
  grid.material.transparent = true;
  grid.material.opacity = 0.38;
  room.add(grid);

  var neonCyan = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x00e5ff,
    emissiveIntensity: 2.2,
    roughness: 0.28,
    metalness: 0.42
  });
  var neonPink = new THREE.MeshStandardMaterial({
    color: 0xff3bd4,
    emissive: 0xff3bd4,
    emissiveIntensity: 2.0,
    roughness: 0.3,
    metalness: 0.42
  });
  var neonPurple = new THREE.MeshStandardMaterial({
    color: 0x7b2dff,
    emissive: 0x7b2dff,
    emissiveIntensity: 1.8,
    roughness: 0.32,
    metalness: 0.4
  });

  addBox(shelf, 0.05, H - 0.26, 0.06, -W / 2 + side + 0.05, H / 2, D / 2 + 0.02, neonCyan, 0);
  addBox(shelf, 0.05, H - 0.26, 0.06, W / 2 - side - 0.05, H / 2, D / 2 + 0.02, neonPink, 0);
  for (var shelfIndex = 0; shelfIndex < shelfY.length; shelfIndex += 1) {
    var shelfNeon = shelfIndex % 2 === 0 ? neonCyan : neonPink;
    addBox(shelf, W - side * 2 - 0.12, 0.035, 0.06, 0, shelfY[shelfIndex] + boardT / 2 + 0.015, D / 2 + 0.02, shelfNeon, 0);
  }

  function makeNeonSign(text, colorA, colorB) {
    var signCanvas = document.createElement("canvas");
    signCanvas.width = 1024;
    signCanvas.height = 256;
    var signCtx = signCanvas.getContext("2d");
    signCtx.clearRect(0, 0, signCanvas.width, signCanvas.height);
    signCtx.textAlign = "center";
    signCtx.textBaseline = "middle";
    signCtx.font = "bold 112px \"PingFang SC\", \"Microsoft YaHei\", sans-serif";
    var hexA = "#" + new THREE.Color(colorA).getHexString();
    var hexB = "#" + new THREE.Color(colorB).getHexString();
    signCtx.shadowColor = hexA;
    signCtx.shadowBlur = 34;
    signCtx.fillStyle = "#ffffff";
    signCtx.fillText(text, 512, 128);
    signCtx.shadowBlur = 0;
    var signGradient = signCtx.createLinearGradient(0, 0, 1024, 0);
    signGradient.addColorStop(0, hexA);
    signGradient.addColorStop(1, hexB);
    signCtx.globalCompositeOperation = "source-atop";
    signCtx.fillStyle = signGradient;
    signCtx.fillRect(0, 0, 1024, 256);
    var signTexture = new THREE.CanvasTexture(signCanvas);
    signTexture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.SpriteMaterial({
      map: signTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }
  var sign = new THREE.Sprite(makeNeonSign("老年孩的天地", 0x00e5ff, 0xff3bd4));
  sign.position.set(0, H + 0.4, -4.25);
  sign.scale.set(4.8, 1.2, 1);
  scene.add(sign);

  var skyline = new THREE.Group();
  for (var city = 0; city < 26; city += 1) {
    var cityHeight = 0.7 + Math.random() * 2.6;
    var cityWidth = 0.22 + Math.random() * 0.3;
    var cityX = -7.2 + city * 0.58;
    var cityMaterial = city % 3 === 0 ? neonPink : (city % 3 === 1 ? neonCyan : neonPurple);
    addBox(skyline, cityWidth, cityHeight, 0.08, cityX, cityHeight / 2 + 0.4, 0, cityMaterial, 0);
  }
  skyline.position.set(0, 0, -5.17);
  room.add(skyline);

  addBox(room, 0.045, 6.2, 0.05, -6.4, 3.1, -5.15, neonCyan, 0);
  addBox(room, 0.045, 6.2, 0.05, 6.4, 3.1, -5.15, neonPink, 0);

  var cyberLightA = new THREE.PointLight(0x00e5ff, 2.0, 12);
  cyberLightA.position.set(-4.5, 3.6, -1.6);
  scene.add(cyberLightA);
  var cyberLightB = new THREE.PointLight(0xff3bd4, 1.7, 12);
  cyberLightB.position.set(4.5, 3.0, 0.8);
  scene.add(cyberLightB);

  var running = true;
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        running = entries[0].isIntersecting;
      },
      { threshold: 0.02 }
    );
    observer.observe(container);
  }

  function resize() {
    var w = container.clientWidth;
    var h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  if ('ResizeObserver' in window) {
    var resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }

  var clock = new THREE.Clock();

  function animate() {
    window.requestAnimationFrame(animate);
    var delta = Math.min(clock.getDelta(), 0.05);
    if (running === false) return;

    if (dragging === false) theta += delta * 0.1;
    dust.rotation.y += delta * 0.012;
    updateCamera();
    renderer.render(scene, camera);
  }

  resize();
  updateCamera(true);
  animate();
}
