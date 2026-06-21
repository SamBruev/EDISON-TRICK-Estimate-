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

  function update() {
    var bassLive = document.getElementById('variantBassLive').checked;
    var drumsLive = document.getElementById('variantDrumsLive').checked;
    var state = calcState(bassLive, drumsLive);

    if (drumsLive) {
      setText('rowDrumsTitle', 'Барабаны (вживую)');
      setText('rowDrumsMeta', TRACKS + ' × 3 ч · 5 000 ₽/ч + редакция 5 000 ₽');
      setText('dateDrumsLabel', 'Барабаны (вживую)');
      setText('dateDrumsValue', '3 × 3 ч · по согласованию');
    } else {
      setText('rowDrumsTitle', 'Барабаны (MIDI)');
      setText('rowDrumsMeta', '1 пакет · 30 000');
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
      setText('rowBassMeta', '1 пакет · 15 000');
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
  }

  document.getElementById('variantBassLive').addEventListener('change', update);
  document.getElementById('variantDrumsLive').addEventListener('change', update);
})();
