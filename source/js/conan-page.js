/*
 * Render the Detective Conan cover wall and timeline.
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
  }

  function renderWall(wall, volumes) {
    var fragment = document.createDocumentFragment();

    volumes.forEach(function (volume) {
      var figure = document.createElement('figure');
      figure.className = 'conan-cover';

      if (volume.cover) {
        var img = document.createElement('img');
        img.src = volume.cover;
        img.alt = '漫画第 ' + volume.n + ' 卷封面';
        img.loading = 'lazy';
        img.addEventListener('error', function () {
          figure.innerHTML = '';
          figure.appendChild(text('div', 'conan-cover-placeholder', '第 ' + volume.n + ' 卷'));
          figure.appendChild(text('figcaption', '', '第 ' + volume.n + ' 卷'));
        });
        figure.appendChild(img);
      } else {
        figure.appendChild(text('div', 'conan-cover-placeholder', '第 ' + volume.n + ' 卷'));
      }

      figure.appendChild(text('figcaption', '', '第 ' + volume.n + ' 卷'));
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
      var yearBox = document.createElement('div');
      yearBox.className = 'conan-year';

      var heading = document.createElement('h3');
      heading.textContent = year + ' 年';
      yearBox.appendChild(heading);

      var eventsBox = document.createElement('div');
      eventsBox.className = 'conan-events';

      byYear[year].sort(function (a, b) {
        if (a.date === b.date) return 0;
        return a.date < b.date ? -1 : 1;
      });

      byYear[year].forEach(function (event) {
        var item = document.createElement('div');
        item.className = 'conan-event ' + event.type;

        var dateText = event.date ? event.date.slice(5) : '待定';
        var dateEl = text('div', 'conan-event-date', dateText);
        var titleEl = document.createElement('div');
        titleEl.className = 'conan-event-title';
        titleEl.appendChild(text('span', 'conan-event-tag', event.type === 'movie' ? '剧场版' : '漫画'));
        titleEl.appendChild(document.createTextNode(event.title));

        item.appendChild(dateEl);
        item.appendChild(titleEl);
        eventsBox.appendChild(item);
      });

      yearBox.appendChild(eventsBox);
      fragment.appendChild(yearBox);
    });

    timeline.appendChild(fragment);
  }

  ready(init);
})();
