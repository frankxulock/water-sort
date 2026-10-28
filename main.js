/* 倒水排序界面 */
(function () {
  'use strict';

  var L = window.WaterSortLogic;
  if (!L) return;

  var COLORS = [
    { name: '红', hex: '#ff4d6e', deep: '#c41048', lite: '#ffd0dc' },
    { name: '橙', hex: '#ff8a24', deep: '#d85a00', lite: '#ffe0b8' },
    { name: '黄', hex: '#f6c431', deep: '#d09a00', lite: '#fff3c4' },
    { name: '绿', hex: '#3dce74', deep: '#128a44', lite: '#d9ffe8' },
    { name: '青', hex: '#2ad4c8', deep: '#0c8f86', lite: '#d7fff8' },
    { name: '蓝', hex: '#4c8dff', deep: '#2458d4', lite: '#dce8ff' },
    { name: '紫', hex: '#b06bff', deep: '#722ee0', lite: '#eddfff' },
    { name: '粉', hex: '#ff6bb5', deep: '#d42e7c', lite: '#ffd6ea' }
  ];

  var STORAGE = 'water-sort-puzzle-v1';
  var MAX_EXTRA = 1;
  var FREE_HINTS = 1;
  var TIP = '点一瓶拿起，再点另一瓶倒入。同色才能叠，空瓶也可以。';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var rack = document.getElementById('rack');
  var stage = document.getElementById('stage');
  var stream = document.getElementById('stream');
  var streamGlow = document.getElementById('stream-glow');
  var streamBody = document.getElementById('stream-body');
  var streamSheen = document.getElementById('stream-sheen');
  var streamDrop = document.getElementById('stream-drop');
  var levelEl = document.getElementById('level');
  var movesEl = document.getElementById('moves');
  var undoBtn = document.getElementById('undo');
  var restartBtn = document.getElementById('restart');
  var hintBtn = document.getElementById('hint');
  var addVialBtn = document.getElementById('add-vial');
  var skipBtn = document.getElementById('skip');
  var tipEl = document.querySelector('.tip');
  var Ads = window.WaterAds;
  var overlay = document.getElementById('overlay');
  var ovMark = document.getElementById('ov-mark');
  var ovTitle = document.getElementById('ov-title');
  var ovText = document.getElementById('ov-text');
  var ovPrimary = document.getElementById('ov-primary');
  var ovSecondary = document.getElementById('ov-secondary');
  var statusEl = document.getElementById('status');

  var state = null;
  var tubeEls = [];
  var selected = -1;
  var busy = false;
  var anim = 0;
  var animToken = 0;
  var resizeTimer = 0;
  var primaryFn = null;
  var secondaryFn = null;
  var shownMoves = -1;
  var adBusy = false;
  var tipTimer = 0;

  function randSeed() {
    return (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
  }

  function say(text) { statusEl.textContent = text; }

  function notice(text) {
    say(text);
    tipEl.textContent = text;
    clearTimeout(tipTimer);
    tipTimer = setTimeout(function () { tipEl.textContent = TIP; }, 2600);
  }

  function adsOn() { return !!(Ads && Ads.configured()); }

  function canAddVial() { return adsOn() && state.extra < MAX_EXTRA; }

  function hintNeedsAd() { return adsOn() && state.hints >= FREE_HINTS; }

  function watchAd(onReward) {
    if (adBusy || busy || !adsOn()) return;
    adBusy = true;
    updateHud();
    Ads.rewarded().then(function (result) {
      adBusy = false;
      if (result && result.ok) onReward();
      else if (result && result.reason === 'skip') notice('没看完，这次没有奖励。');
      else notice('广告没播成，这次没有奖励。');
      updateHud();
    });
  }

  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function colorOf(index) {
    return COLORS[index] || COLORS[0];
  }

  function aria(index, tube) {
    if (!tube.length) return '第' + (index + 1) + '瓶，空';
    var names = tube.map(function (c) { return colorOf(c).name; });
    var done = L.isComplete(tube) ? '，已完成' : '';
    return '第' + (index + 1) + '瓶，从底到顶 ' + names.join('、') + done;
  }

  function layersFrom(tube, delta, color) {
    var items = tube.map(function (c) { return { color: c, h: 1 }; });
    if (delta < -0.0001) {
      var left = -delta;
      while (left > 0.0001 && items.length) {
        var top = items[items.length - 1];
        var cut = Math.min(top.h, left);
        top.h -= cut;
        left -= cut;
        if (top.h <= 0.001) items.pop();
      }
    } else if (delta > 0.0001) {
      var leftAdd = delta;
      while (leftAdd > 0.0001) {
        var topAdd = items.length ? items[items.length - 1] : null;
        if (topAdd && topAdd.color === color && topAdd.h < 1) {
          var room = 1 - topAdd.h;
          var add = Math.min(room, leftAdd);
          topAdd.h += add;
          leftAdd -= add;
        } else {
          var h = Math.min(1, leftAdd);
          items.push({ color: color, h: h });
          leftAdd -= h;
        }
      }
    }
    var out = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].h <= 0.001) continue;
      if (out.length && out[out.length - 1].color === items[i].color) out[out.length - 1].h += items[i].h;
      else out.push({ color: items[i].color, h: items[i].h });
    }
    return out;
  }

  function unitFor(el) {
    var glass = el.querySelector('.glass');
    var h = glass.clientHeight;
    if (h < 20) {
      var tubeH = parseFloat(getComputedStyle(rack).getPropertyValue('--tube-h')) || 180;
      h = tubeH - 28;
    }
    return Math.max(8, (h * 0.72) / L.CAPACITY);
  }

  function paintTube(index, tube, delta, color) {
    var el = tubeEls[index];
    if (!el) return;
    var juice = el.querySelector('.juice');
    var unit = unitFor(el);
    var layers = layersFrom(tube, delta, color);
    while (juice.children.length > layers.length) juice.removeChild(juice.lastChild);
    for (var i = 0; i < layers.length; i++) {
      var node = juice.children[i];
      if (!node) {
        node = document.createElement('div');
        node.className = 'layer';
        juice.appendChild(node);
      }
      var col = colorOf(layers[i].color);
      node.style.height = (layers[i].h * unit) + 'px';
      node.style.setProperty('--lite', col.lite);
      node.style.background = 'linear-gradient(90deg,' + col.deep + ' 0%,' + col.hex + ' 18%,' + col.hex + ' 78%,' + col.deep + ' 100%)';
    }
    el.setAttribute('aria-label', aria(index, delta ? tube : (state.tubes[index] || tube)));
  }

  function layout() {
    var n = state.tubes.length;
    var w = stage.clientWidth || 320;
    var h = stage.clientHeight || 360;
    var cols = n <= 5 ? n : Math.ceil(n / 2);
    if (w >= 700 && n > 6) cols = Math.min(n, 6);
    var rows = Math.ceil(n / cols);
    var gapX = w < 360 ? 8 : 12;
    var gapY = 18;
    var padT = 26;
    var tubeW = Math.floor((w - gapX * (cols - 1)) / cols);
    tubeW = Math.max(48, Math.min(tubeW, 84));
    var tubeH = Math.floor((h - padT - gapY * (rows - 1)) / rows);
    var maxH = Math.min(250, tubeW * 3.35);
    tubeH = Math.max(120, Math.min(tubeH, maxH));
    var need = rows * tubeH + (rows - 1) * gapY + padT;
    if (need > h && h > 80) {
      tubeH = Math.max(96, Math.floor((h - padT - gapY * (rows - 1)) / rows));
    }
    rack.style.setProperty('--tube-w', tubeW + 'px');
    rack.style.setProperty('--tube-h', tubeH + 'px');
    rack.style.setProperty('--gap-x', gapX + 'px');
    rack.style.setProperty('--gap-y', gapY + 'px');
  }

  function makeTube(index) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tube';
    btn.dataset.i = String(index);
    btn.innerHTML = '<div class="bottle"><span class="lip"></span>'
      + '<svg class="shell shell-back" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M38,8 C38,8,36,11.5,36,15 L36,21 C36,27,24,32,17,37 C11,42,10,48,10,54 L10,83 C10,93,27,98.2,50,98.2 C73,98.2,90,93,90,83 L90,54 C90,48,89,42,83,37 C76,32,64,27,64,21 L64,15 C64,11.5,62,8,62,8 Z"/></svg>'
      + '<div class="glass"><div class="juice"></div></div>'
      + '<svg class="shell shell-front" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="shell-body" d="M38,8 C38,8,36,11.5,36,15 L36,21 C36,27,24,32,17,37 C11,42,10,48,10,54 L10,83 C10,93,27,98.2,50,98.2 C73,98.2,90,93,90,83 L90,54 C90,48,89,42,83,37 C76,32,64,27,64,21 L64,15 C64,11.5,62,8,62,8 Z"/><ellipse class="shell-rim" cx="50" cy="7" rx="15.2" ry="4.1"/><ellipse class="shell-hole" cx="50" cy="7" rx="10.4" ry="2.3"/><path class="shell-shine" d="M20,46 C17.5,60,17.5,74,20,88"/></svg>'
      + '</div><div class="cork"></div>';
    btn.addEventListener('click', function () { onTube(index); });
    return btn;
  }

  function renderBoard() {
    layout();
    rack.innerHTML = '';
    tubeEls = [];
    for (var i = 0; i < state.tubes.length; i++) {
      var el = makeTube(i);
      tubeEls.push(el);
      rack.appendChild(el);
    }
    for (var j = 0; j < state.tubes.length; j++) paintTube(j, state.tubes[j], 0, null);
    refreshDone(false);
    paintSelection();
  }

  function refreshDone(animate) {
    for (var i = 0; i < state.tubes.length; i++) {
      var done = L.isComplete(state.tubes[i]);
      var el = tubeEls[i];
      var was = el.classList.contains('done');
      el.classList.toggle('done', done);
      if (animate && done && !was) {
        el.classList.remove('just-done');
        void el.offsetWidth;
        el.classList.add('just-done');
      }
    }
  }

  function paintSelection() {
    for (var i = 0; i < tubeEls.length; i++) {
      var el = tubeEls[i];
      var can = selected >= 0 && L.canPour(state.tubes, selected, i);
      el.classList.toggle('selected', i === selected);
      el.classList.toggle('can', can);
      el.classList.toggle('dim', selected >= 0 && i !== selected && !can);
      el.setAttribute('aria-pressed', i === selected ? 'true' : 'false');
    }
  }

  function updateHud() {
    levelEl.textContent = '第 ' + state.level + ' 关';
    if (shownMoves !== state.moves) {
      movesEl.textContent = String(state.moves);
      if (shownMoves >= 0) {
        movesEl.classList.remove('pop');
        void movesEl.offsetWidth;
        movesEl.classList.add('pop');
      }
      shownMoves = state.moves;
    }
    undoBtn.disabled = !state.history.length;
    hintBtn.disabled = busy || adBusy;
    hintBtn.textContent = hintNeedsAd() ? '广告提示' : '提示';
    addVialBtn.classList.toggle('hidden', !adsOn());
    addVialBtn.disabled = busy || adBusy || !canAddVial();
    skipBtn.classList.toggle('hidden', !adsOn());
    skipBtn.disabled = busy || adBusy;
  }

  function hideStream() { stream.style.opacity = '0'; }

  function invalidateAnim() {
    animToken++;
    if (anim) cancelAnimationFrame(anim);
    anim = 0;
    hideStream();
  }

  function clearPourPose() {
    for (var i = 0; i < tubeEls.length; i++) {
      tubeEls[i].classList.remove('pour-src');
      tubeEls[i].classList.remove('pour-dst');
      tubeEls[i].style.removeProperty('--tilt');
      tubeEls[i].style.removeProperty('transform');
      tubeEls[i].style.removeProperty('transition');
      var bottleEl = tubeEls[i].querySelector('.bottle');
      if (bottleEl) bottleEl.style.removeProperty('transition');
      var juiceEl = tubeEls[i].querySelector('.juice');
      if (juiceEl) juiceEl.style.removeProperty('transition');
    }
  }

  function drawStream(from, to, color, opacity) {
    var stageRect = stage.getBoundingClientRect();
    stream.setAttribute('viewBox', '0 0 ' + stageRect.width + ' ' + stageRect.height);
    stream.style.opacity = String(Math.max(0, opacity));
    var lip = tubeEls[from].querySelector('.lip').getBoundingClientRect();
    var mouth = tubeEls[to].querySelector('.lip').getBoundingClientRect();
    var x1 = lip.left + lip.width / 2 - stageRect.left;
    var y1 = lip.top + lip.height / 2 - stageRect.top;
    var x2 = mouth.left + mouth.width / 2 - stageRect.left;
    var glass = tubeEls[to].querySelector('.glass').getBoundingClientRect();
    var topLayer = tubeEls[to].querySelector('.juice').lastElementChild;
    var surface = topLayer ? topLayer.getBoundingClientRect().top : glass.bottom - 14;
    var y2 = surface - stageRect.top;
    y2 = Math.max(y1 + 36, Math.min(y2, glass.bottom - stageRect.top - 8));
    var d;
    if (Math.abs(x2 - x1) < 10) {
      d = 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' L ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    } else {
      d = 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1)
        + ' Q ' + x2.toFixed(1) + ' ' + y1.toFixed(1)
        + ', ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    }
    var col = colorOf(color);
    var sw = Math.max(5, Math.min(7, tubeEls[from].querySelector('.glass').clientWidth * 0.14));
    streamGlow.setAttribute('d', d);
    streamBody.setAttribute('d', d);
    streamSheen.setAttribute('d', d);
    streamGlow.setAttribute('stroke', col.hex);
    streamGlow.setAttribute('stroke-width', String(sw + 2));
    streamBody.setAttribute('stroke', col.hex);
    streamBody.setAttribute('stroke-width', String(sw));
    streamSheen.setAttribute('stroke-width', String(Math.max(3, sw * 0.28)));
    streamDrop.setAttribute('cx', String(x2));
    streamDrop.setAttribute('cy', String(y2));
    streamDrop.setAttribute('r', String(sw * 0.34));
    streamDrop.setAttribute('fill', col.hex);
  }

  function finishPour(from, to, token) {
    if (token !== animToken) return;
    hideStream();
    clearPourPose();
    paintTube(from, state.tubes[from], 0, null);
    paintTube(to, state.tubes[to], 0, null);
    refreshDone(true);
    busy = false;
    updateHud();
    save();
    if (L.isWon(state.tubes)) showWin();
    else if (!L.hasMove(state.tubes)) showStuck();
  }

  function beginPour(from, to, res) {
    animToken++;
    if (anim) cancelAnimationFrame(anim);
    var token = animToken;
    var before = L.cloneTubes(state.tubes);
    state.history.push(before);
    if (state.history.length > 40) state.history.shift();
    state.tubes = res.tubes;
    state.moves++;
    selected = -1;
    busy = true;
    var srcEl = tubeEls[from];
    var dstEl = tubeEls[to];
    srcEl.classList.add('pour-src');
    dstEl.classList.add('pour-dst');
    paintSelection();
    updateHud();
    save();
    say('把' + colorOf(res.color).name + '色倒进第' + (to + 1) + '瓶');

    if (reduceMotion) {
      paintTube(from, state.tubes[from], 0, null);
      paintTube(to, state.tubes[to], 0, null);
      finishPour(from, to, token);
      return;
    }

    var stageRect = stage.getBoundingClientRect();
    var dstBox = tubeEls[to].getBoundingClientRect();
    var srcBox = srcEl.getBoundingClientRect();
    var srcCenter = srcBox.left + srcBox.width / 2;
    var gap = (dstBox.left + dstBox.width / 2) - srcCenter;
    var dir = gap >= 0 ? 1 : -1;
    var bottleEl = srcEl.querySelector('.bottle');
    var bottleH = bottleEl.clientHeight || 180;
    var arm = bottleH * 0.88;
    var halfW = (bottleEl.clientWidth || 48) / 2;
    var armBot = Math.max(8, bottleH - arm);
    var srcLip = srcEl.querySelector('.lip').getBoundingClientRect().top;
    var dstLip = dstEl.querySelector('.lip').getBoundingClientRect().top;
    var hover = 20;
    var pad = 6;
    function cornerX(th, x, y) {
      return Math.cos(th) * x - Math.sin(th) * y;
    }
    var angle = 22;
    var txTip = 0;
    var tyTip = 0;
    for (var a = 48; a >= 22; a -= 2) {
      var th = dir * a * Math.PI / 180;
      var xs = [
        cornerX(th, halfW, -arm),
        cornerX(th, -halfW, -arm),
        cornerX(th, halfW, armBot),
        cornerX(th, -halfW, armBot)
      ];
      var swingTry = arm * Math.sin(Math.abs(th));
      var txTry = gap - dir * swingTry;
      var origin = srcCenter + txTry;
      var minX = origin + Math.min.apply(null, xs);
      var maxX = origin + Math.max.apply(null, xs);
      txTip = txTry;
      tyTip = dstLip - srcLip - hover - arm * (1 - Math.cos(Math.abs(th)));
      angle = a;
      if (minX >= stageRect.left + pad && maxX <= stageRect.right - pad) break;
    }
    var side = dir * Math.min(28, Math.abs(gap) * 0.35);
    var tubeHalf = srcBox.width / 2;
    var txGo = gap - side;
    var minTx = stageRect.left + pad + tubeHalf - srcCenter;
    var maxTx = stageRect.right - pad - tubeHalf - srcCenter;
    txGo = Math.max(minTx, Math.min(maxTx, txGo));
    var tyGo = Math.max(-520, Math.min(8, dstLip - srcLip - hover));
    txTip = Math.max(-240, Math.min(240, txTip));
    tyTip = Math.max(-520, Math.min(8, tyTip));
    var goMs = Math.round(Math.min(440, 200 + Math.hypot(txGo, tyGo) * 0.42));
    var tiltMs = 240;
    var juiceEl = srcEl.querySelector('.juice');
    srcEl.style.setProperty('--tilt', '0deg');
    srcEl.style.transition = 'transform ' + goMs + 'ms cubic-bezier(.22, .85, .28, 1)';
    srcEl.style.transform = 'translate(' + txGo.toFixed(1) + 'px, ' + tyGo.toFixed(1) + 'px)';
    if (bottleEl) bottleEl.style.transition = 'transform ' + tiltMs + 'ms ease-in-out';
    if (juiceEl) juiceEl.style.transition = 'transform ' + tiltMs + 'ms ease-in-out';

    var flowMs = 340 + res.count * 180;
    var tipAt = goMs + 40;

    setTimeout(function () {
      if (token !== animToken) return;
      srcEl.style.transition = 'transform ' + tiltMs + 'ms ease-in-out';
      srcEl.style.transform = 'translate(' + txTip.toFixed(1) + 'px, ' + tyTip.toFixed(1) + 'px)';
      srcEl.style.setProperty('--tilt', (dir * angle).toFixed(1) + 'deg');
    }, tipAt);

    var t0 = 0;
    var flowStart = tipAt + tiltMs + 30;

    function frame(now) {
      if (token !== animToken) return;
      if (!t0) t0 = now;
      var elapsed = now - t0;
      if (elapsed < flowStart) {
        anim = requestAnimationFrame(frame);
        return;
      }
      var p = Math.min(1, (elapsed - flowStart) / flowMs);
      var amount = ease(p) * res.count;
      paintTube(from, before[from], -amount, res.color);
      paintTube(to, before[to], amount, res.color);
      if (p < 1) {
        drawStream(from, to, res.color, Math.min(1, p * 4));
        anim = requestAnimationFrame(frame);
        return;
      }
      hideStream();
      srcEl.style.transition = 'transform ' + tiltMs + 'ms ease-in-out';
      srcEl.style.transform = 'translate(' + txGo.toFixed(1) + 'px, ' + tyGo.toFixed(1) + 'px)';
      srcEl.style.setProperty('--tilt', '0deg');
      setTimeout(function () {
        if (token !== animToken) return;
        srcEl.style.transition = 'transform ' + goMs + 'ms cubic-bezier(.4, 0, .7, .2)';
        srcEl.style.removeProperty('transform');
        setTimeout(function () {
          finishPour(from, to, token);
        }, goMs + 30);
      }, tiltMs);
    }
    anim = requestAnimationFrame(frame);
  }

  function shake(index) {
    var el = tubeEls[index];
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    setTimeout(function () { el.classList.remove('shake'); }, 380);
  }

  function onTube(index) {
    if (busy || !overlay.classList.contains('hidden')) return;
    var tube = state.tubes[index];
    if (selected < 0) {
      if (!tube.length || L.isComplete(tube)) {
        if (tube.length) shake(index);
        return;
      }
      selected = index;
      paintSelection();
      say('拿起第' + (index + 1) + '瓶');
      return;
    }
    if (selected === index) {
      selected = -1;
      paintSelection();
      say('放下了');
      return;
    }
    var res = L.pour(state.tubes, selected, index);
    if (!res.ok) {
      if (tube.length && !L.isComplete(tube)) {
        selected = index;
        paintSelection();
        say('改拿第' + (index + 1) + '瓶');
      } else {
        shake(index);
        say('倒不进去');
      }
      return;
    }
    beginPour(selected, index, res);
  }

  function undo() {
    if (!state.history.length) return;
    invalidateAnim();
    clearPourPose();
    busy = false;
    hideOverlay();
    state.tubes = state.history.pop();
    state.moves = Math.max(0, state.moves - 1);
    selected = -1;
    renderBoard();
    updateHud();
    save();
    say('已撤销');
  }

  function applyLevel(level, keepSeedTubes) {
    invalidateAnim();
    clearPourPose();
    busy = false;
    hideOverlay();
    state = {
      level: level.level,
      seed: level.seed,
      colors: level.colors,
      tubes: keepSeedTubes || level.tubes,
      moves: 0,
      history: [],
      extra: 0,
      hints: 0
    };
    selected = -1;
    shownMoves = -1;
    renderBoard();
    updateHud();
    save();
    say('第' + state.level + '关');
  }

  function restart() {
    var extra = state.extra;
    var hints = state.hints;
    var tubes = L.createLevel(state.level, state.seed).tubes;
    for (var i = 0; i < extra; i++) tubes = L.addTube(tubes);
    applyLevel({ level: state.level, seed: state.seed, colors: state.colors }, tubes);
    state.extra = extra;
    state.hints = hints;
    updateHud();
    save();
  }

  function addVial() {
    if (!canAddVial()) return;
    watchAd(function () {
      invalidateAnim();
      clearPourPose();
      busy = false;
      hideOverlay();
      state.tubes = L.addTube(state.tubes);
      state.history = state.history.map(L.addTube);
      state.extra++;
      selected = -1;
      renderBoard();
      updateHud();
      save();
      notice('多了一个空瓶，这一关都有效。');
    });
  }

  function skipLevel() {
    watchAd(function () {
      nextLevel();
      notice('跳过了，进入第 ' + state.level + ' 关。');
    });
  }

  function nextLevel() {
    applyLevel(L.createLevel(state.level + 1, randSeed()));
  }

  function showHint() {
    if (busy || adBusy || !overlay.classList.contains('hidden')) return;
    if (!L.hint(state.tubes)) {
      say('现在没有能倒的瓶子');
      return;
    }
    if (hintNeedsAd()) watchAd(giveHint);
    else giveHint();
  }

  function giveHint() {
    var move = L.hint(state.tubes);
    if (!move) {
      say('现在没有能倒的瓶子');
      return;
    }
    selected = move.from;
    paintSelection();
    var dest = tubeEls[move.to];
    dest.classList.remove('hint');
    void dest.offsetWidth;
    dest.classList.add('hint');
    setTimeout(function () { dest.classList.remove('hint'); }, 1200);
    say('试试把第' + (move.from + 1) + '瓶倒进第' + (move.to + 1) + '瓶');
    state.hints++;
    updateHud();
    save();
  }

  function hideOverlay() {
    overlay.classList.add('hidden');
    var bits = overlay.querySelector('.confetti');
    if (bits) bits.remove();
  }

  function burst() {
    var box = document.createElement('div');
    box.className = 'confetti';
    for (var i = 0; i < 32; i++) {
      var bit = document.createElement('i');
      bit.style.left = Math.random() * 100 + '%';
      bit.style.background = colorOf(i % COLORS.length).hex;
      bit.style.animationDelay = (Math.random() * 0.35) + 's';
      bit.style.animationDuration = (0.9 + Math.random() * 0.8) + 's';
      bit.style.transform = 'rotate(' + Math.floor(Math.random() * 80) + 'deg)';
      box.appendChild(bit);
    }
    overlay.appendChild(box);
  }

  function showOverlay(kind, title, text, primaryLabel, onPrimary, secondaryLabel, onSecondary) {
    ovMark.textContent = kind === 'win' ? '✓' : '!';
    ovMark.classList.toggle('warn', kind !== 'win');
    ovTitle.textContent = title;
    ovText.textContent = text;
    ovPrimary.textContent = primaryLabel;
    primaryFn = onPrimary;
    if (secondaryLabel) {
      ovSecondary.textContent = secondaryLabel;
      ovSecondary.classList.remove('hidden');
      secondaryFn = onSecondary;
    } else {
      ovSecondary.classList.add('hidden');
      secondaryFn = null;
    }
    overlay.classList.remove('hidden');
    if (kind === 'win' && !reduceMotion) burst();
  }

  function showWin() {
    say('过关了');
    showOverlay('win', '过关了', '第 ' + state.level + ' 关完成，用了 ' + state.moves + ' 步。', '下一关', nextLevel, '再玩本关', restart);
  }

  function showStuck() {
    say('这一步走不通');
    if (canAddVial()) {
      showOverlay('stuck', '倒不开了', '看一段广告多一个空瓶，或者撤销几步。', '看广告加空瓶', addVial,
        state.history.length ? '撤销' : '重开', state.history.length ? undo : restart);
    } else if (!state.history.length) showOverlay('stuck', '倒不开了', '这一关需要重开。', '重开', restart);
    else showOverlay('stuck', '倒不开了', '撤销几步，或者重开这一关。', '撤销', undo, '重开', restart);
  }

  function cleanHistory(history, tubeCount) {
    if (!Array.isArray(history)) return [];
    var out = [];
    for (var i = 0; i < history.length; i++) {
      if (L.isValidTubes(history[i]) && history[i].length === tubeCount) out.push(L.cloneTubes(history[i]));
    }
    return out.slice(-40);
  }

  function save() {
    try {
      localStorage.setItem(STORAGE, JSON.stringify({
        v: 1,
        level: state.level,
        seed: state.seed,
        moves: state.moves,
        tubes: state.tubes,
        history: state.history.slice(-40),
        extra: state.extra,
        hints: state.hints
      }));
    } catch (err) { /* 隐私模式忽略 */ }
  }

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE) || 'null');
      if (!data || data.v !== 1) return null;
      var spec = L.specForLevel(data.level);
      var extra = Math.min(MAX_EXTRA, (data.extra >>> 0) || 0);
      if (!L.isValidTubes(data.tubes) || data.tubes.length !== spec.colors + spec.empty + extra) return null;
      var max = -1;
      data.tubes.forEach(function (tube) {
        tube.forEach(function (c) { if (c > max) max = c; });
      });
      if (max + 1 !== spec.colors) return null;
      return {
        level: spec.level,
        seed: data.seed >>> 0,
        colors: spec.colors,
        tubes: L.cloneTubes(data.tubes),
        moves: data.moves >>> 0,
        history: cleanHistory(data.history, data.tubes.length),
        extra: extra,
        hints: (data.hints >>> 0) || 0
      };
    } catch (err) {
      return null;
    }
  }

  function setupTelegram() {
    var tg = window.Telegram && window.Telegram.WebApp;
    if (!tg || !tg.initData) return;
    try {
      tg.ready();
      tg.expand();
      if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
      tg.setHeaderColor('#161a3a');
      tg.setBackgroundColor('#161a3a');
    } catch (e) {}
  }

  function boot() {
    setupTelegram();
    var saved = load();
    if (!saved) {
      applyLevel(L.createLevel(1, randSeed()));
      return;
    }
    state = saved;
    selected = -1;
    shownMoves = -1;
    renderBoard();
    updateHud();
    if (L.isWon(state.tubes)) showWin();
    else if (!L.hasMove(state.tubes)) showStuck();
  }

  undoBtn.addEventListener('click', undo);
  restartBtn.addEventListener('click', restart);
  hintBtn.addEventListener('click', showHint);
  addVialBtn.addEventListener('click', addVial);
  skipBtn.addEventListener('click', skipLevel);
  ovPrimary.addEventListener('click', function () { if (primaryFn) primaryFn(); });
  ovSecondary.addEventListener('click', function () { if (secondaryFn) secondaryFn(); });
  stage.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      selected = -1;
      paintSelection();
    } else if (e.key === 'u' || e.key === 'U' || e.key === 'z' || e.key === 'Z') {
      undo();
    } else if (e.key === 'h' || e.key === 'H') {
      showHint();
    }
  });
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!state) return;
      layout();
      if (!busy) {
        for (var i = 0; i < state.tubes.length; i++) paintTube(i, state.tubes[i], 0, null);
      }
    }, 80);
  });

  window.__water = {
    get: function () {
      return {
        level: state.level,
        moves: state.moves,
        busy: busy,
        selected: selected,
        tubes: L.cloneTubes(state.tubes),
        won: L.isWon(state.tubes)
      };
    },
    load: function (tubes) {
      invalidateAnim();
      clearPourPose();
      busy = false;
      hideOverlay();
      state.tubes = L.cloneTubes(tubes);
      state.history = [];
      state.moves = 0;
      selected = -1;
      shownMoves = -1;
      renderBoard();
      updateHud();
    },
    tap: function (index) { onTube(index); }
  };

  boot();
})();
