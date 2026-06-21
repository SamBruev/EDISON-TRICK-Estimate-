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

  var links = nav.querySelectorAll('a[href^="#"]');
  var sections = [];
  links.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var section = document.getElementById(id);
    if (section) sections.push({ link: link, section: section });
  });

  if (!sections.length || !('IntersectionObserver' in window)) return;

  var activeLink = null;

  function setActive(link) {
    if (activeLink === link) return;
    if (activeLink) activeLink.classList.remove('is-active');
    activeLink = link;
    if (activeLink) {
      activeLink.classList.add('is-active');
      if (wrap.classList.contains('can-scroll')) {
        var linkLeft = activeLink.offsetLeft;
        var linkRight = linkLeft + activeLink.offsetWidth;
        var viewLeft = nav.scrollLeft;
        var viewRight = viewLeft + nav.clientWidth;
        if (linkLeft < viewLeft + 12) {
          nav.scrollLeft = Math.max(0, linkLeft - 22);
        } else if (linkRight > viewRight - 12) {
          nav.scrollLeft = linkRight - nav.clientWidth + 22;
        }
        schedule();
      }
    }
  }

  var observer = new IntersectionObserver(
    function (entries) {
      var visible = entries
        .filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      if (!visible.length) return;
      var match = sections.find(function (s) { return s.section === visible[0].target; });
      if (match) setActive(match.link);
    },
    {
      root: null,
      rootMargin: '-42% 0px -42% 0px',
      threshold: [0, 0.15, 0.35, 0.55]
    }
  );

  sections.forEach(function (s) { observer.observe(s.section); });
})();
