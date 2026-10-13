/*
 * Inject homepage hero actions and latest-articles heading.
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

  function addHeroActions() {
    var info = document.querySelector('#page-header.full_page #site-info');
    if (info === null) return;
    if (document.querySelector('.home-hero-actions') !== null) return;

    var wrap = document.createElement('div');
    wrap.className = 'home-hero-actions';

    var start = document.createElement('a');
    start.className = 'home-hero-btn primary';
    start.href = '#recent-posts';
    start.textContent = '开始阅读 →';
    start.addEventListener('click', function (event) {
      var target = document.querySelector('#recent-posts');
      if (target === null) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    var about = document.createElement('a');
    about.className = 'home-hero-btn ghost';
    about.href = '/about/';
    about.textContent = '关于我';

    wrap.appendChild(start);
    wrap.appendChild(about);

    var subtitle = info.querySelector('#site-subtitle');
    if (subtitle !== null && subtitle.parentNode !== null) {
      subtitle.parentNode.insertBefore(wrap, subtitle.nextSibling);
    } else {
      info.appendChild(wrap);
    }
  }

  function addLatestHead() {
    var recent = document.querySelector('#recent-posts');
    if (recent === null) return;
    if (document.querySelector('.home-latest-head') !== null) return;

    var head = document.createElement('div');
    head.className = 'home-latest-head';
    head.innerHTML = '<div><h2><i class="fas fa-star"></i>最新文章</h2><p>记录思考 · 分享生活 · 共同成长</p></div><a href="/archives/">查看更多 →</a>';
    recent.insertBefore(head, recent.firstChild);
  }

  function init() {
    var header = document.querySelector('#page-header.full_page');
    if (header === null) return;

    document.documentElement.classList.add('home-redesign');
    addHeroActions();
    addLatestHead();
  }

  ready(init);
})();
