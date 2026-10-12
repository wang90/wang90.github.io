/*
 * Render the Detective Conan cover wall and movie cards.
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
    var moviesBox = document.querySelector('#conan-movies');
    var stats = document.querySelector('#conan-stats');

    if (data === null || data === undefined || wall === null || moviesBox === null) return;

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
    renderMovies(moviesBox, movies);
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

  function renderMovies(container, movies) {
    var fragment = document.createDocumentFragment();

    movies.forEach(function (movie) {
      var card = document.createElement('article');
      card.className = 'conan-movie-card';

      var cover = document.createElement('div');
      cover.className = 'conan-movie-cover';
      if (movie.cover) {
        var img = document.createElement('img');
        img.src = movie.cover;
        img.alt = '剧场版第 ' + movie.n + ' 部 ' + movie.zh + ' 封面';
        img.loading = 'lazy';
        cover.appendChild(img);
      } else {
        cover.className = 'conan-movie-cover conan-movie-cover-placeholder';
        cover.textContent = '第 ' + movie.n + ' 部';
      }

      var info = document.createElement('div');
      info.className = 'conan-movie-info';

      var order = text('span', 'conan-movie-order', '剧场版 第 ' + movie.n + ' 部');
      var title = text('h3', 'conan-movie-title', movie.zh);
      var jp = text('p', 'conan-movie-jp', movie.jp || movie.title);
      var date = text('p', 'conan-movie-date', movie.date || '待定');

      info.appendChild(order);
      info.appendChild(title);
      info.appendChild(jp);
      info.appendChild(date);

      card.appendChild(cover);
      card.appendChild(info);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
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
