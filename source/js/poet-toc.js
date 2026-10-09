/*
 * Scrollspy for the Xin Qiji poetry page.
 */
(function () {
  'use strict';

  function init() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.poet-toc a[href^="#poem-"]')
    );
    if (links.length === 0) return;

    var targets = [];
    var i;
    for (i = 0; i < links.length; i += 1) {
      var target = document.querySelector(links[i].getAttribute('href'));
      if (target) targets.push(target);
    }
    if (targets.length === 0) return;

    var offset = 130;
    var ticking = false;

    function setActive(id) {
      for (var n = 0; n < links.length; n += 1) {
        var active = links[n].getAttribute('href') === '#' + id;
        links[n].classList.toggle('active', active);
      }
    }

    function update() {
      ticking = false;
      var current = targets[0];

      for (var n = 0; n < targets.length; n += 1) {
        if (targets[n].getBoundingClientRect().top <= offset) {
          current = targets[n];
        } else {
          break;
        }
      }

      setActive(current.id);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
