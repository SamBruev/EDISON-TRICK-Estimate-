(function () {
  var wrap = document.getElementById('nav-scroll-wrap');
  var nav = document.getElementById('section-nav');
  if (!wrap || !nav) return;

  function updateNavScrollHints() {
    var maxScroll = nav.scrollWidth - nav.clientWidth;
    var canScroll = maxScroll > 6;

    wrap.classList.toggle('can-scroll', canScroll);
    wrap.classList.toggle('can-scroll-left', canScroll && nav.scrollLeft > 6);
    wrap.classList.toggle('can-scroll-right', canScroll && nav.scrollLeft < maxScroll - 6);
  }

  var raf = null;
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      updateNavScrollHints();
    });
  }

  updateNavScrollHints();
  nav.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule);
})();
