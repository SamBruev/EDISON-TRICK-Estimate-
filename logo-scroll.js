(function () {
  var SCROLL_RAMP = 480;

  function ease(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  function readScrollY() {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    return y < 0 ? 0 : y;
  }

  function updateTopLogoReveal() {
    var sy = readScrollY();
    var t = sy >= SCROLL_RAMP ? 1 : sy / SCROLL_RAMP;
    var reveal = 1 - ease(t);
    document.documentElement.style.setProperty('--top-logo-reveal', reveal.toFixed(5));
  }

  var raf = null;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      updateTopLogoReveal();
    });
  }

  updateTopLogoReveal();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
})();
