/*
 * Homepage: move directly between the hero screen and the next content screen.
 */
(function () {
  'use strict';

  function init() {
    var header = document.querySelector('#page-header.full_page');
    var content = document.querySelector('#content-inner');
    if (header === null || content === null) return;

    var transitioning = false;

    function contentTop() {
      return content.getBoundingClientRect().top + window.scrollY;
    }

    function animateTo(top) {
      transitioning = true;

      var supportsSmooth = 'scrollBehavior' in document.documentElement.style;
      if (supportsSmooth) {
        window.scrollTo({ top: top, behavior: 'smooth' });
      } else {
        window.scrollTo(0, top);
      }

      window.setTimeout(function () {
        transitioning = false;
      }, 760);
    }

    window.addEventListener('wheel', function (event) {
      if (transitioning) {
        event.preventDefault();
        return;
      }

      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      var y = window.scrollY;
      var headerHeight = header.offsetHeight;
      var nextTop = contentTop();

      // From the hero screen: go directly to the content screen.
      if (event.deltaY > 0 && y < headerHeight * 0.45) {
        event.preventDefault();
        animateTo(nextTop);
        return;
      }

      // From the top of the content screen: go directly back to the hero screen.
      if (event.deltaY < 0 && Math.abs(y - nextTop) < 18) {
        event.preventDefault();
        animateTo(0);
      }
    }, { passive: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
