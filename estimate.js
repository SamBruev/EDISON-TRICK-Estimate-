(function () {
  var TRACKS = 3;
  var HOURS_PER_TRACK = 3;
  var RATE_DEFAULT = 3000;
  var RATE_DRUMS_LIVE = 5000;
  var DRUMS_EDIT = 5000;
  var DISCOUNT = 0.2;

  var BASE = {
    drumsMidi: 30000,
    bassMidi: 15000,
    other: 250000,
    total: 295000
  };

  var prevTotal = null;
  var prevBassLive = false;
  var prevDrumsLive = false;

  var bassToggle = document.getElementById('variantBassToggle');
  var drumsToggle = document.getElementById('variantDrumsToggle');

  function formatRub(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  }

  function bassLivePrice() {
    return TRACKS * HOURS_PER_TRACK * RATE_DEFAULT;
  }

  function drumsLivePrice() {
    return TRACKS * (HOURS_PER_TRACK * RATE_DRUMS_LIVE + DRUMS_EDIT);
  }

  function calcState(bassLive, drumsLive) {
    var drums = drumsLive ? drumsLivePrice() : BASE.drumsMidi;
    var bass = bassLive ? bassLivePrice() : BASE.bassMidi;
    var total = BASE.other + drums + bass;
    var discountAmount = Math.round(total * DISCOUNT);
    var finalPrice = total - discountAmount;

    return {
      drums: drums,
      bass: bass,
      total: total,
      discountAmount: discountAmount,
      finalPrice: finalPrice,
      steps: [
        Math.round(finalPrice * 0.5),
        Math.round(finalPrice * 0.2),
        Math.round(finalPrice * 0.3)
      ]
    };
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function parseRub(text) {
    return parseInt(String(text || '').replace(/\s/g, '').replace(/[^\d]/g, ''), 10) || 0;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  var priceAnimations = new WeakMap();

  function animateRub(el, toValue, options) {
    if (!el) return;
    options = options || {};
    var duration = options.duration || 980;
    var direction = options.direction;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = formatRub(toValue);
      return;
    }

    var existing = priceAnimations.get(el);
    var fromValue = existing ? existing.current : parseRub(el.textContent);
    if (fromValue === toValue) {
      el.textContent = formatRub(toValue);
      return;
    }

    if (existing) cancelAnimationFrame(existing.rafId);

    if (direction) playBump(el, direction);

    var startTime = null;
    function frame(ts) {
      if (!startTime) startTime = ts;
      var t = Math.min(1, (ts - startTime) / duration);
      var current = Math.round(fromValue + (toValue - fromValue) * easeOutCubic(t));
      el.textContent = formatRub(current);

      if (t < 1) {
        priceAnimations.set(el, { rafId: requestAnimationFrame(frame), current: current });
      } else {
        el.textContent = formatRub(toValue);
        priceAnimations.delete(el);
      }
    }

    priceAnimations.set(el, { rafId: requestAnimationFrame(frame), current: fromValue });
  }

  function animateDiscountLine(el, toValue, options) {
    if (!el) return;
    options = options || {};
    var prefix = 'Скидка 20% · экономия ';
    var duration = options.duration || 980;
    var direction = options.direction;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = prefix + formatRub(toValue);
      return;
    }

    var fromValue = parseRub(el.textContent);
    if (fromValue === toValue) {
      el.textContent = prefix + formatRub(toValue);
      return;
    }

    if (direction) playBump(el, direction);

    var startTime = null;
    function frame(ts) {
      if (!startTime) startTime = ts;
      var t = Math.min(1, (ts - startTime) / duration);
      var current = Math.round(fromValue + (toValue - fromValue) * easeOutCubic(t));
      el.textContent = prefix + formatRub(current);
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + formatRub(toValue);
    }
    requestAnimationFrame(frame);
  }

  function setPrice(el, value, anim) {
    if (!el) return;
    if (anim && anim.run) {
      animateRub(el, value, { direction: anim.direction });
    } else {
      el.textContent = formatRub(value);
    }
  }

  function playBump(el, direction) {
    if (!el || !direction) return;
    var cls = direction === 'up' ? 'price-bump-up' : 'price-bump-down';
    el.classList.remove('price-bump-up', 'price-bump-down');
    void el.offsetWidth;
    el.classList.add(cls);
    el.addEventListener('animationend', function onEnd() {
      el.classList.remove(cls);
      el.removeEventListener('animationend', onEnd);
    });
  }

  function flashRow(rowId) {
    var row = document.getElementById(rowId);
    if (!row) return;
    row.classList.remove('row-live-flash');
    void row.offsetWidth;
    row.classList.add('row-live-flash');
    row.addEventListener('animationend', function onEnd() {
      row.classList.remove('row-live-flash');
      row.removeEventListener('animationend', onEnd);
    });
  }

  function update(fromUser) {
    var bassLive = document.getElementById('variantBassLive').checked;
    var drumsLive = document.getElementById('variantDrumsLive').checked;
    var state = calcState(bassLive, drumsLive);
    var prevState = prevTotal !== null ? calcState(prevBassLive, prevDrumsLive) : null;
    var shouldAnimate = fromUser && prevState !== null;
    var totalDir = shouldAnimate && state.total !== prevState.total
      ? (state.total > prevState.total ? 'up' : 'down')
      : null;
    var totalAnim = totalDir ? { run: true, direction: totalDir } : null;
    var drumsDir = shouldAnimate && state.drums !== prevState.drums
      ? (state.drums > prevState.drums ? 'up' : 'down')
      : null;
    var bassDir = shouldAnimate && state.bass !== prevState.bass
      ? (state.bass > prevState.bass ? 'up' : 'down')
      : null;

    if (bassToggle) bassToggle.classList.toggle('is-live', bassLive);
    if (drumsToggle) drumsToggle.classList.toggle('is-live', drumsLive);

    var rowDrums = document.getElementById('rowDrums');
    var rowBass = document.getElementById('rowBass');
    if (rowDrums) rowDrums.classList.toggle('is-live', drumsLive);
    if (rowBass) rowBass.classList.toggle('is-live', bassLive);

    var dateDrumsLabel = document.getElementById('dateDrumsLabel');
    var dateBassLabel = document.getElementById('dateBassLabel');
    if (dateDrumsLabel && dateDrumsLabel.closest('.date-chip')) {
      dateDrumsLabel.closest('.date-chip').classList.toggle('is-live', drumsLive);
    }
    if (dateBassLabel && dateBassLabel.closest('.date-chip')) {
      dateBassLabel.closest('.date-chip').classList.toggle('is-live', bassLive);
    }

    if (drumsLive) {
      setText('rowDrumsTitle', 'Барабаны (вживую)');
      setText('rowDrumsMeta', TRACKS + ' × 3 ч · 5 000 ₽/ч + редакция 5 000 ₽');
      setText('dateDrumsLabel', 'Барабаны (вживую)');
      setText('dateDrumsValue', '3 × 3 ч · даты согласуем вместе');
    } else {
      setText('rowDrumsTitle', 'Барабаны (MIDI)');
      setText('rowDrumsMeta', '3 трека · MIDI-пакет · 30 000 ₽');
      setText('dateDrumsLabel', 'Барабаны (MIDI)');
      setText('dateDrumsValue', '29, 30 июня');
    }

    if (bassLive) {
      setText('rowBassTitle', 'Бас (вживую)');
      setText('rowBassMeta', TRACKS + ' × 3 ч · 3 000 ₽/ч');
      setText('dateBassLabel', 'Бас (вживую)');
      setText('dateBassValue', '3 × 3 ч · даты согласуем вместе');
    } else {
      setText('rowBassTitle', 'Бас (MIDI)');
      setText('rowBassMeta', '3 трека · MIDI-пакет · 15 000 ₽');
      setText('dateBassLabel', 'Бас (MIDI)');
      setText('dateBassValue', '1 июля');
    }

    setPrice(document.getElementById('rowDrumsPrice'), state.drums, drumsDir ? { run: true, direction: drumsDir } : null);
    setPrice(document.getElementById('rowBassPrice'), state.bass, bassDir ? { run: true, direction: bassDir } : null);
    setPrice(document.getElementById('summaryTotal'), state.total, totalAnim);
    setPrice(document.getElementById('heroTotal'), state.total, totalAnim);
    setPrice(document.getElementById('paymentFull'), state.total, totalAnim);

    var paymentDiscountEl = document.getElementById('paymentDiscount');
    if (paymentDiscountEl) {
      if (totalAnim) {
        animateDiscountLine(paymentDiscountEl, state.discountAmount, { direction: totalDir });
      } else {
        paymentDiscountEl.textContent = 'Скидка 20% · экономия ' + formatRub(state.discountAmount);
      }
    }

    setPrice(document.getElementById('paymentFinal'), state.finalPrice, totalAnim);
    setPrice(document.getElementById('paymentStep1'), state.steps[0], totalAnim);
    setPrice(document.getElementById('paymentStep2'), state.steps[1], totalAnim);
    setPrice(document.getElementById('paymentStep3'), state.steps[2], totalAnim);
    setPrice(document.getElementById('paymentAlertFull'), state.total, totalAnim);
    setPrice(document.getElementById('footerAmount'), state.finalPrice, totalAnim);

    var heroDiscountEl = document.getElementById('heroDiscount');
    if (heroDiscountEl) {
      var heroStrong = heroDiscountEl.querySelector('strong');
      if (heroStrong) {
        setPrice(heroStrong, state.finalPrice, totalAnim);
      } else {
        heroDiscountEl.innerHTML = 'Итого со скидкой 20%: <strong>' + formatRub(state.finalPrice) + '</strong>';
      }
    }

    if (shouldAnimate) {
      if (bassLive && !prevBassLive) {
        flashRow('rowBass');
        playBump(bassToggle && bassToggle.querySelector('.variant-diff'), 'up');
      } else if (!bassLive && prevBassLive) {
        playBump(bassToggle && bassToggle.querySelector('.variant-diff'), 'down');
      }

      if (drumsLive && !prevDrumsLive) {
        flashRow('rowDrums');
        playBump(drumsToggle && drumsToggle.querySelector('.variant-diff'), 'up');
      } else if (!drumsLive && prevDrumsLive) {
        playBump(drumsToggle && drumsToggle.querySelector('.variant-diff'), 'down');
      }
    }

    prevTotal = state.total;
    prevBassLive = bassLive;
    prevDrumsLive = drumsLive;
  }

  function pressToggle(el) {
    if (!el) return;
    el.classList.remove('is-pressing');
    void el.offsetWidth;
    el.classList.add('is-pressing');
    el.addEventListener('animationend', function onEnd() {
      el.classList.remove('is-pressing');
      el.removeEventListener('animationend', onEnd);
    });
  }

  document.getElementById('variantBassLive').addEventListener('change', function () {
    pressToggle(bassToggle);
    update(true);
  });
  document.getElementById('variantDrumsLive').addEventListener('change', function () {
    pressToggle(drumsToggle);
    update(true);
  });

  update(false);
})();
