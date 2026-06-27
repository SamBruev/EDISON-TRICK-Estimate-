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

  var tracking = false;
  var refreshing = false;
  var startX = 0;
  var startY = 0;
  var progress = 0;
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

    tracking = true;
    startX = clientX;
    startY = clientY;
    overlay.classList.remove('is-snapping', 'is-committing');
    root.classList.remove('edge-refresh-commit');
    overlay.classList.add('is-active');
    root.classList.add('edge-refresh-active');
  }

  function onMove(clientX, clientY, preventDefault) {
    if (!tracking || refreshing) return;

    var dx = startX - clientX;
    var dy = Math.abs(clientY - startY);

    if (dx < 6 && dy > 14) {
      tracking = false;
      reset(true);
      return;
    }

    if (dy > dx * 1.15 && dx < 24) {
      tracking = false;
      reset(true);
      return;
    }

    if (dx <= 0) {
      setProgress(0);
      return;
    }

    if (preventDefault) preventDefault();
    scheduleProgress(Math.min(dx, MAX_PULL) / THRESHOLD);
  }

  function onEnd() {
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
