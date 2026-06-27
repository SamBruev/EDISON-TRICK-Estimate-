(function () {
  var EDGE = 34;
  var THRESHOLD = 92;
  var MAX_PULL = 128;

  var root = document.documentElement;
  var overlay = document.getElementById('edgeRefresh');
  if (!overlay) return;

  var ringFill = overlay.querySelector('.edge-refresh-ring-fill');
  var labelEl = overlay.querySelector('.edge-refresh-label');
  var ringLen = 113;

  if (ringFill) {
    var r = ringFill.getAttribute('r');
    if (r) ringLen = 2 * Math.PI * Number(r);
    ringFill.style.strokeDasharray = String(ringLen);
  }

  var tracking = false;   // a touch/pointer near the right edge is being observed
  var armed = false;      // gesture confirmed as a deliberate horizontal edge-pull
  var locked = false;     // gesture classified as a scroll -> ignore until release
  var refreshing = false;
  var startX = 0;
  var startY = 0;
  var progress = 0;
  // Below this travel we can't reliably tell a pull from a scroll yet.
  var DECIDE = 10;
  // A pull must be clearly more horizontal-left than vertical.
  var H_DOMINANCE = 1.6;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isBlockedTarget(el) {
    return el && el.closest(
      '#nav-scroll-wrap, nav, .cal-grid, .cal-month-tabs, input, textarea, select, label.variant-toggle'
    );
  }

  var pendingProgress = null;
  var progressRaf = null;

  function flushProgress() {
    progressRaf = null;
    if (pendingProgress !== null) {
      var v = pendingProgress;
      pendingProgress = null;
      setProgress(v);
    }
  }

  function scheduleProgress(value) {
    pendingProgress = value;
    if (progressRaf) return;
    progressRaf = requestAnimationFrame(flushProgress);
  }

  function setProgress(value) {
    progress = Math.max(0, Math.min(1, value));
    root.style.setProperty('--edge-refresh-progress', progress.toFixed(3));

    if (ringFill) {
      ringFill.style.strokeDashoffset = String(ringLen * (1 - progress));
    }

    if (labelEl) {
      labelEl.textContent = progress >= 1 ? 'Отпустите' : 'Обновить';
    }

    overlay.classList.toggle('is-ready', progress >= 1);
    overlay.classList.toggle('is-active', progress > 0.03 || tracking);
    root.classList.toggle('edge-refresh-active', progress > 0.03 || tracking);
  }

  function reset(snap) {
    tracking = false;

    if (!snap) {
      setProgress(0);
      overlay.classList.remove('is-active', 'is-ready', 'is-snapping');
      root.classList.remove('edge-refresh-active');
      return;
    }

    overlay.classList.add('is-snapping');
    setProgress(0);

    window.setTimeout(function () {
      overlay.classList.remove('is-snapping', 'is-active', 'is-ready');
      root.classList.remove('edge-refresh-active');
    }, 360);
  }

  function commit() {
    if (refreshing) return;
    refreshing = true;
    tracking = false;
    setProgress(1);
    overlay.classList.add('is-committing');
    root.classList.add('edge-refresh-commit');

    window.setTimeout(function () {
      window.location.reload();
    }, reducedMotion ? 80 : 620);
  }

  function onStart(clientX, clientY, target) {
    if (refreshing) return;
    if (isBlockedTarget(target)) return;
    if (window.innerWidth - clientX > EDGE) return;

    // Observe the gesture, but show nothing and grab no scroll until it is
    // confirmed as a deliberate horizontal pull (see onMove). This is what
    // prevents an ordinary vertical scroll started near the right edge from
    // ever triggering a reload.
    tracking = true;
    armed = false;
    locked = false;
    startX = clientX;
    startY = clientY;
    overlay.classList.remove('is-snapping', 'is-committing');
    root.classList.remove('edge-refresh-commit');
  }

  function onMove(clientX, clientY, preventDefault) {
    if (!tracking || locked || refreshing) return;

    var dx = startX - clientX;          // leftward pull is positive
    var dy = Math.abs(clientY - startY);

    // One-time direction decision. Until the gesture moves far enough we
    // make no judgement; once it does, it is permanently either a pull or a
    // scroll for the rest of this finger-down (no mid-gesture re-arming).
    if (!armed) {
      if (Math.max(Math.abs(dx), dy) < DECIDE) return;

      if (dx > 0 && dx > dy * H_DOMINANCE) {
        armed = true;
        overlay.classList.add('is-active');
        root.classList.add('edge-refresh-active');
      } else {
        locked = true;                  // it's a scroll — bail for good
        tracking = false;
        reset(false);
        return;
      }
    }

    if (dx <= 0) {
      setProgress(0);
      return;
    }

    // Only now do we swallow the gesture from the page scroller.
    if (preventDefault) preventDefault();
    scheduleProgress(Math.min(dx, MAX_PULL) / THRESHOLD);
  }

  function onEnd() {
    armed = false;
    locked = false;
    if (!tracking || refreshing) return;
    tracking = false;

    if (progress >= 1) {
      commit();
      return;
    }

    reset(true);
  }

  document.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    onStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!tracking) return;
    onMove(e.touches[0].clientX, e.touches[0].clientY, function () {
      e.preventDefault();
    });
  }, { passive: false });

  document.addEventListener('touchend', onEnd, { passive: true });
  document.addEventListener('touchcancel', onEnd, { passive: true });

  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch') return;
    if (e.button !== 0) return;
    onStart(e.clientX, e.clientY, e.target);
  });

  document.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    if (!tracking) return;
    onMove(e.clientX, e.clientY, function () {
      e.preventDefault();
    });
  });

  document.addEventListener('pointerup', function (e) {
    if (e.pointerType === 'touch') return;
    onEnd();
  });

  document.addEventListener('pointercancel', function (e) {
    if (e.pointerType === 'touch') return;
    onEnd();
  });
})();
