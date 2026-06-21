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
    other: 280000,
    total: 325000
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

  function bumpTotals(direction) {
    [
      'heroTotal',
      'summaryTotal',
      'paymentFinal',
      'footerAmount',
      'paymentFull'
    ].forEach(function (id) {
      playBump(document.getElementById(id), direction);
    });
    playBump(document.querySelector('#heroDiscount strong'), direction);
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

    if (bassToggle) bassToggle.classList.toggle('is-live', bassLive);
    if (drumsToggle) drumsToggle.classList.toggle('is-live', drumsLive);

    if (drumsLive) {
      setText('rowDrumsTitle', 'Барабаны (вживую)');
      setText('rowDrumsMeta', TRACKS + ' × 3 ч · 5 000 ₽/ч + редакция 5 000 ₽');
      setText('dateDrumsLabel', 'Барабаны (вживую)');
      setText('dateDrumsValue', '3 × 3 ч · по согласованию');
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
      setText('dateBassValue', '3 × 3 ч · по согласованию');
    } else {
      setText('rowBassTitle', 'Бас (MIDI)');
      setText('rowBassMeta', '3 трека · MIDI-пакет · 15 000 ₽');
      setText('dateBassLabel', 'Бас (MIDI)');
      setText('dateBassValue', '1 июля');
    }

    setText('rowDrumsPrice', formatRub(state.drums));
    setText('rowBassPrice', formatRub(state.bass));
    setText('summaryTotal', formatRub(state.total));
    setText('heroTotal', formatRub(state.total));
    setText('paymentFull', formatRub(state.total));
    setText('paymentDiscount', 'Скидка 20% · − ' + formatRub(state.discountAmount));
    setText('paymentFinal', formatRub(state.finalPrice));
    setText('paymentStep1', formatRub(state.steps[0]));
    setText('paymentStep2', formatRub(state.steps[1]));
    setText('paymentStep3', formatRub(state.steps[2]));
    setText('paymentAlertFull', formatRub(state.total));
    setText('footerAmount', formatRub(state.finalPrice));
    var heroDiscountEl = document.getElementById('heroDiscount');
    if (heroDiscountEl) {
      heroDiscountEl.innerHTML = 'Со скидкой 20%: <strong>' + formatRub(state.finalPrice) + '</strong>';
    }

    if (fromUser && prevTotal !== null) {
      if (state.total > prevTotal) {
        bumpTotals('up');
        playBump(document.getElementById('paymentStep1'), 'up');
        playBump(document.getElementById('paymentStep2'), 'up');
        playBump(document.getElementById('paymentStep3'), 'up');
      } else if (state.total < prevTotal) {
        bumpTotals('down');
        playBump(document.getElementById('paymentStep1'), 'down');
        playBump(document.getElementById('paymentStep2'), 'down');
        playBump(document.getElementById('paymentStep3'), 'down');
      }

      if (bassLive && !prevBassLive) {
        flashRow('rowBass');
        playBump(document.getElementById('rowBassPrice'), 'up');
        playBump(bassToggle && bassToggle.querySelector('.variant-diff'), 'up');
      } else if (!bassLive && prevBassLive) {
        playBump(document.getElementById('rowBassPrice'), 'down');
        playBump(bassToggle && bassToggle.querySelector('.variant-diff'), 'down');
      }

      if (drumsLive && !prevDrumsLive) {
        flashRow('rowDrums');
        playBump(document.getElementById('rowDrumsPrice'), 'up');
        playBump(drumsToggle && drumsToggle.querySelector('.variant-diff'), 'up');
      } else if (!drumsLive && prevDrumsLive) {
        playBump(document.getElementById('rowDrumsPrice'), 'down');
        playBump(drumsToggle && drumsToggle.querySelector('.variant-diff'), 'down');
      }
    }

    prevTotal = state.total;
    prevBassLive = bassLive;
    prevDrumsLive = drumsLive;
  }

  document.getElementById('variantBassLive').addEventListener('change', function () {
    update(true);
  });
  document.getElementById('variantDrumsLive').addEventListener('change', function () {
    update(true);
  });

  update(false);
})();
