/*
 * Render the Detective Conan cover wall and horizontal timeline.
 */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function text(tag, className, value) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (value) el.textContent = value;
    return el;
  }

  function init() {
    var data = window.CONAN_DATA;
    var wall = document.querySelector('#conan-wall');
    var timeline = document.querySelector('#conan-timeline');
    var stats = document.querySelector('#conan-stats');

    if (data === null || data === undefined || wall === null || timeline === null) return;

    var volumes = data.volumes || [];
    var movies = data.movies || [];

    if (stats) {
      stats.appendChild(text('span', 'conan-stat', '漫画 ' + volumes.length + ' 卷'));
      stats.appendChild(text('span', 'conan-stat', '剧场版 ' + movies.length + ' 部'));
      if (volumes.length > 0) {
        stats.appendChild(text('span', 'conan-stat', '从 ' + volumes[0].year + ' 年开始'));
      }
    }

    renderWall(wall, volumes);
    renderTimeline(timeline, volumes, movies);
    initPanelCarousel();
  }

  function renderWall(wall, volumes) {
    var fragment = document.createDocumentFragment();

    volumes.forEach(function (volume) {
      var figure = document.createElement('figure');
      figure.className = 'conan-cover';

      if (volume.cover) {
        var img = document.createElement('img');
        img.src = volume.cover;
        img.alt = '漫画第 ' + volume.n + ' 卷完整封面';
        img.loading = 'lazy';
        img.addEventListener('error', function () {
          figure.innerHTML = '';
          figure.appendChild(text('div', 'conan-cover-placeholder', '第 ' + volume.n + ' 卷'));
        });
        figure.appendChild(img);
      } else {
        figure.appendChild(text('div', 'conan-cover-placeholder', '第 ' + volume.n + ' 卷'));
      }

      fragment.appendChild(figure);
    });

    wall.appendChild(fragment);
  }

  function renderTimeline(timeline, volumes, movies) {
    var byYear = {};

    function addEvent(year, date, type, title) {
      if (year === '' || year === null || year === undefined || year === 0) return;
      if (byYear[year] === undefined) byYear[year] = [];
      byYear[year].push({ date: date, type: type, title: title });
    }

    volumes.forEach(function (volume) {
      addEvent(volume.year, volume.date, 'manga', '漫画 第 ' + volume.n + ' 卷');
    });

    movies.forEach(function (movie) {
      addEvent(movie.year, movie.date, 'movie', '剧场版 第 ' + movie.n + ' 部：' + movie.zh);
    });

    var years = Object.keys(byYear).map(Number).sort(function (a, b) {
      return a - b;
    });

    var fragment = document.createDocumentFragment();

    years.forEach(function (year) {
      var node = document.createElement('div');
      node.className = 'conan-year-node';

      node.appendChild(text('div', 'conan-year-label', year + ' 年'));

      var dot = document.createElement('span');
      dot.className = 'conan-year-dot';
      node.appendChild(dot);

      var icons = document.createElement('div');
      icons.className = 'conan-year-icons';

      byYear[year].sort(function (a, b) {
        if (a.date === b.date) return 0;
        return a.date < b.date ? -1 : 1;
      });

      byYear[year].forEach(function (event) {
        var icon = document.createElement('span');
        icon.className = 'conan-icon ' + event.type;
        icon.title = event.title;

        var glyph = document.createElement('i');
        glyph.className = event.type === 'movie' ? 'fas fa-film' : 'fas fa-book';
        icon.appendChild(glyph);
        icons.appendChild(icon);
      });

      node.appendChild(icons);
      fragment.appendChild(node);
    });

    timeline.appendChild(fragment);
  }

  function initPanelCarousel() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.conan-panel'));
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.conan-tab'));
    var prev = document.querySelector('.conan-arrow.prev');
    var next = document.querySelector('.conan-arrow.next');
    var carousel = document.querySelector('#conan-panel-carousel');
    var current = 0;
    var timer = null;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (panels.length === 0) return;

    function show(index) {
      current = index;
      panels.forEach(function (panel, i) {
        panel.classList.toggle('active', i === index);
      });
      tabs.forEach(function (tab, i) {
        tab.classList.toggle('active', i === index);
      });
    }

    function step(direction) {
      var total = panels.length;
      show((current + direction + total) % total);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        show(parseInt(tab.getAttribute('data-panel'), 10));
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        step(-1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        step(1);
      });
    }

    function startAuto() {
      if (reduceMotion === true) return;
      if (timer) return;
      timer = window.setInterval(function () {
        step(1);
      }, 7000);
    }

    function stopAuto() {
      if (timer === null) return;
      window.clearInterval(timer);
      timer = null;
    }

    if (carousel) {
      carousel.addEventListener('pointerenter', stopAuto);
      carousel.addEventListener('pointerleave', startAuto);
      carousel.addEventListener('touchstart', stopAuto, { passive: true });
      carousel.addEventListener('touchend', startAuto, { passive: true });
    }

    startAuto();
  }

  ready(init);
})();
