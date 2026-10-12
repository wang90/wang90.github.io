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
      <p class="conan-kicker">Detective Conan Archive</p>
      <h1>名侦探柯南专题</h1>
      <p class="conan-intro">这里整理了柯南漫画单行本的完整封面墙，以及按年份横向排列的漫画与剧场版时间线。慢慢看，真相只有一个。</p>
      <div class="conan-stats" id="conan-stats"></div>
    </section>
    <section class="conan-panel-switch">
      <div class="conan-panel-tabs">
        <button class="conan-tab active" type="button" data-panel="0">漫画封面墙</button>
        <button class="conan-tab" type="button" data-panel="1">漫画与剧场版时间线</button>
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
      <section id="timeline" class="conan-panel">
        <div class="conan-section-head">
          <h2>漫画与剧场版时间线</h2>
          <p>横向一条线，看每年出了什么</p>
        </div>
        <div class="conan-timeline-line" id="conan-timeline"></div>
      </section>
    </div>
  </main>
  <footer class="conan-footer">真相只有一个。</footer>
  <script src="/js/conan-data.js" defer></script>
  <script src="/js/conan-page.js" defer></script>
</div>
