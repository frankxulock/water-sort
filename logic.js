/* 倒水排序：纯规则。管子底在数组前面，顶在最后。 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WaterSortLogic = api;
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var CAPACITY = 4;

  function cloneTubes(tubes) {
    return tubes.map(function (tube) { return tube.slice(); });
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function topRun(tube) {
    if (!tube.length) return { color: null, count: 0 };
    var color = tube[tube.length - 1];
    var count = 0;
    for (var i = tube.length - 1; i >= 0 && tube[i] === color; i--) count++;
    return { color: color, count: count };
  }

  function inRange(tubes, index) {
    return index === (index | 0) && index >= 0 && index < tubes.length;
  }

  function canPour(tubes, from, to) {
    if (!inRange(tubes, from) || !inRange(tubes, to) || from === to) return false;
    var src = tubes[from];
    var dst = tubes[to];
    if (!src.length || dst.length >= CAPACITY) return false;
    if (!dst.length) return true;
    return dst[dst.length - 1] === src[src.length - 1];
  }

  function pour(tubes, from, to) {
    if (!canPour(tubes, from, to)) return { ok: false };
    var next = cloneTubes(tubes);
    var src = next[from];
    var dst = next[to];
    var run = topRun(src);
    var count = Math.min(run.count, CAPACITY - dst.length);
    for (var i = 0; i < count; i++) dst.push(src.pop());
    return { ok: true, tubes: next, color: run.color, count: count, from: from, to: to };
  }

  function isComplete(tube) {
    if (tube.length !== CAPACITY) return false;
    for (var i = 1; i < tube.length; i++) if (tube[i] !== tube[0]) return false;
    return true;
  }

  function isWon(tubes) {
    for (var i = 0; i < tubes.length; i++) {
      if (!tubes[i].length) continue;
      if (!isComplete(tubes[i])) return false;
    }
    return tubes.length > 0;
  }

  function legalMoves(tubes) {
    var out = [];
    for (var i = 0; i < tubes.length; i++) {
      for (var j = 0; j < tubes.length; j++) {
        if (canPour(tubes, i, j)) out.push({ from: i, to: j });
      }
    }
    return out;
  }

  function hasMove(tubes) {
    return legalMoves(tubes).length > 0;
  }

  function hint(tubes) {
    var moves = legalMoves(tubes);
    var best = null;
    var bestScore = -1e9;
    for (var i = 0; i < moves.length; i++) {
      var m = moves[i];
      var src = tubes[m.from];
      if (isComplete(src)) continue;
      var dst = tubes[m.to];
      var run = topRun(src);
      var count = Math.min(run.count, CAPACITY - dst.length);
      var score = 0;
      if (dst.length && dst[dst.length - 1] === run.color) score += 5;
      if (src.length === count) score += 4;
      if (!dst.length) score += 1;
      var next = pour(tubes, m.from, m.to).tubes;
      if (isComplete(next[m.to])) score += 6;
      if (score > bestScore) {
        bestScore = score;
        best = m;
      }
    }
    return best;
  }

  function isValidTubes(tubes) {
    if (!Array.isArray(tubes) || tubes.length < 2 || tubes.length > 16) return false;
    var counts = {};
    var max = -1;
    for (var i = 0; i < tubes.length; i++) {
      var tube = tubes[i];
      if (!Array.isArray(tube) || tube.length > CAPACITY) return false;
      for (var k = 0; k < tube.length; k++) {
        var c = tube[k];
        if (c !== (c | 0) || c < 0 || c > 15) return false;
        if (c > max) max = c;
        counts[c] = (counts[c] || 0) + 1;
      }
    }
    if (max < 0) return false;
    for (var color = 0; color <= max; color++) {
      if (counts[color] !== CAPACITY) return false;
    }
    return true;
  }

  // 多一个空瓶，原数组不变
  function addTube(tubes) {
    var out = cloneTubes(tubes);
    out.push([]);
    return out;
  }

  function specForLevel(level) {
    level = Math.max(1, level | 0);
    var colors = Math.min(8, 2 + level);
    var steps = 4 + level * 4;
    if (level > 8) steps = Math.min(40, 24 + (level - 8) * 2);
    return { level: level, colors: colors, empty: 2, steps: steps };
  }

  function solved(colors, emptyCount) {
    var tubes = [];
    for (var c = 0; c < colors; c++) {
      var tube = [];
      for (var k = 0; k < CAPACITY; k++) tube.push(c);
      tubes.push(tube);
    }
    for (var e = 0; e < emptyCount; e++) tubes.push([]);
    return tubes;
  }

  function shuffleTubes(tubes, rng) {
    var list = tubes.slice();
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  function mixScore(tubes) {
    var score = 0;
    for (var i = 0; i < tubes.length; i++) {
      var seen = {};
      var kinds = 0;
      for (var k = 0; k < tubes[i].length; k++) {
        if (!seen[tubes[i][k]]) {
          seen[tubes[i][k]] = 1;
          kinds++;
        }
      }
      if (kinds > 1) score += kinds;
    }
    return score;
  }

  // 只做「合法倒水」的逆操作，所以局面一定还能倒回去。
  function reverseMoves(tubes) {
    var out = [];
    for (var a = 0; a < tubes.length; a++) {
      var src = tubes[a];
      var run = topRun(src);
      if (!run.count) continue;
      var mono = src.length === run.count;
      var maxK = mono ? run.count : run.count - 1;
      if (maxK < 1) continue;
      for (var b = 0; b < tubes.length; b++) {
        if (a === b) continue;
        var dst = tubes[b];
        var space = CAPACITY - dst.length;
        if (space < 1) continue;
        var dstTop = dst.length ? dst[dst.length - 1] : null;
        if (dstTop !== null && dstTop === run.color) continue;
        var kMax = Math.min(maxK, space);
        for (var k = 1; k <= kMax; k++) out.push({ from: a, to: b, k: k });
      }
    }
    return out;
  }

  function applyReverse(tubes, move) {
    var next = cloneTubes(tubes);
    var src = next[move.from];
    var dst = next[move.to];
    for (var i = 0; i < move.k; i++) dst.push(src.pop());
    return next;
  }

  function pickMove(tubes, moves, rng) {
    var weights = [];
    var sum = 0;
    for (var i = 0; i < moves.length; i++) {
      var m = moves[i];
      var src = tubes[m.from];
      var empty = tubes[m.to].length === 0;
      var w;
      if (!empty) w = m.k === 1 ? 12 : 7;
      else if (m.k === 1) w = 4;
      else if (m.k === src.length) w = 0.45;
      else w = 2;
      weights.push(w);
      sum += w;
    }
    var r = rng() * sum;
    var acc = 0;
    for (var n = 0; n < moves.length; n++) {
      acc += weights[n];
      if (r <= acc) return moves[n];
    }
    return moves[moves.length - 1];
  }

  function scramble(tubes, steps, rng) {
    var cur = cloneTubes(tubes);
    var trace = [];
    var last = null;
    for (var s = 0; s < steps; s++) {
      var moves = reverseMoves(cur).filter(function (m) {
        return !last || m.from !== last.to || m.to !== last.from || m.k !== last.k;
      });
      if (!moves.length) moves = reverseMoves(cur);
      if (!moves.length) break;
      var move = pickMove(cur, moves, rng);
      cur = applyReverse(cur, move);
      last = move;
      trace.push(move);
    }
    return { tubes: cur, trace: trace };
  }

  function fallback(spec, rng) {
    var tubes = solved(spec.colors, spec.empty);
    var emptyA = spec.colors;
    var emptyB = spec.colors + 1;
    tubes = applyReverse(tubes, { from: 0, to: emptyA, k: 1 });
    tubes = applyReverse(tubes, { from: 1, to: emptyB, k: 1 });
    tubes = applyReverse(tubes, { from: 0, to: 1, k: 1 });
    return shuffleTubes(tubes, rng);
  }

  function scrambleFromSolved(colors, emptyCount, steps, seed) {
    return scramble(solved(colors, emptyCount), steps, mulberry32(seed));
  }

  function createLevel(level, seed) {
    var spec = specForLevel(level);
    var rng = mulberry32(seed);
    var best = null;
    var bestScore = -1;
    for (var attempt = 0; attempt < 10; attempt++) {
      var steps = Math.max(4, spec.steps - attempt * 2);
      var cur = shuffleTubes(scramble(solved(spec.colors, spec.empty), steps, rng).tubes, rng);
      if (isWon(cur)) continue;
      var score = mixScore(cur);
      if (score > bestScore) {
        best = cur;
        bestScore = score;
      }
      if (score > 0) break;
    }
    if (!best || isWon(best) || !hasMove(best)) best = fallback(spec, rng);
    return {
      level: spec.level,
      colors: spec.colors,
      empty: spec.empty,
      seed: seed >>> 0,
      tubes: best
    };
  }

  return {
    CAPACITY: CAPACITY,
    cloneTubes: cloneTubes,
    mulberry32: mulberry32,
    topRun: topRun,
    canPour: canPour,
    pour: pour,
    isComplete: isComplete,
    isWon: isWon,
    legalMoves: legalMoves,
    hasMove: hasMove,
    hint: hint,
    isValidTubes: isValidTubes,
    specForLevel: specForLevel,
    scrambleFromSolved: scrambleFromSolved,
    createLevel: createLevel,
    addTube: addTube
  };
});
