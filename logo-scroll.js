(function () {
  var SCROLL_RAMP = 480;
  var BG_BLUR_RAMP = 720;

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

    var bgT = sy >= BG_BLUR_RAMP ? 1 : sy / BG_BLUR_RAMP;
    document.documentElement.style.setProperty('--app-bg-scroll-blur', ease(bgT).toFixed(4));
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
