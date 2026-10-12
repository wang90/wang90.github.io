---
title: 柯南专题
date: 2026-10-12 12:00:00
type: conan
---
<div class="conan-shell">
  <header class="conan-nav">
    <a class="conan-back" href="/">返回博客</a>
    <div class="conan-brand">CONAN FILES</div>
    <div class="conan-nav-note">MANGA &amp; MOVIES</div>
  </header>
  <main class="conan-main">
    <section class="conan-hero">
      <h1>名探偵コナン</h1>
      <p class="conan-subtitle">真実はいつもひとつ</p>
      <div class="conan-stats" id="conan-stats"></div>
    </section>
    <section class="conan-panel-switch">
      <div class="conan-panel-tabs">
        <button class="conan-tab active" type="button" data-panel="0">漫画封面墙</button>
        <button class="conan-tab" type="button" data-panel="1">剧场版</button>
      </div>
      <div class="conan-panel-arrows">
        <button class="conan-arrow prev" type="button">‹</button>
        <button class="conan-arrow next" type="button">›</button>
      </div>
    </section>
    <div class="conan-panel-carousel" id="conan-panel-carousel">
      <section id="cover-wall" class="conan-panel active">
        <div class="conan-wall" id="conan-wall"></div>
      </section>
      <section id="movies" class="conan-panel">
        <div class="conan-movie-grid" id="conan-movies"></div>
      </section>
    </div>
  </main>
  <footer class="conan-footer">真相只有一个。</footer>
  <script src="/js/conan-data.js" defer></script>
  <script src="/js/conan-page.js" defer></script>
</div>
