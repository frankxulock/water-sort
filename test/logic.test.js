'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../logic.js');

test('同色才能倒，一次倒完顶上连续的同色', () => {
  const tubes = [[1, 0, 0, 0], [0, 0], []];
  const before = JSON.parse(JSON.stringify(tubes));
  assert.equal(L.canPour(tubes, 0, 1), true);
  const poured = L.pour(tubes, 0, 1);
  assert.equal(poured.ok, true);
  assert.equal(poured.count, 2);
  assert.equal(poured.color, 0);
  assert.deepEqual(poured.tubes[0], [1, 0]);
  assert.deepEqual(poured.tubes[1], [0, 0, 0, 0]);
  assert.deepEqual(tubes, before);

  const mismatch = [[0], [1], []];
  assert.equal(L.canPour(mismatch, 0, 1), false);
  assert.equal(L.pour(mismatch, 0, 1).ok, false);
  assert.equal(L.canPour(mismatch, 0, 2), true);
  assert.deepEqual(L.pour(mismatch, 0, 2).tubes, [[], [1], [0]]);
  assert.equal(L.pour(mismatch, 0, 0).ok, false);
  assert.equal(L.canPour([[0, 0, 0, 0], [0]], 1, 0), false);
});

test('空瓶可以倒入，满瓶和异色不行', () => {
  const ontoEmpty = L.pour([[0, 0, 0], [1, 1, 1, 1], []], 0, 2);
  assert.equal(ontoEmpty.ok, true);
  assert.equal(ontoEmpty.count, 3);
  assert.deepEqual(ontoEmpty.tubes[0], []);
  assert.deepEqual(ontoEmpty.tubes[2], [0, 0, 0]);
});

test('完成与过关', () => {
  assert.equal(L.isComplete([0, 0, 0, 0]), true);
  assert.equal(L.isComplete([0, 0, 0]), false);
  assert.equal(L.isComplete([0, 0, 0, 1]), false);
  assert.equal(L.isComplete([]), false);
  assert.equal(L.isWon([[0, 0, 0, 0], [1, 1, 1, 1], []]), true);
  assert.equal(L.isWon([[0, 0, 0], [0], [1, 1, 1, 1], []]), false);
  const almost = [[0, 0, 0, 0], [1, 1, 1], [1], [], []];
  const win = L.pour(almost, 2, 1);
  assert.equal(win.ok, true);
  assert.equal(L.isWon(win.tubes), true);
  assert.equal(L.isWon(almost), false);
});

test('走不通时没有合法倒法', () => {
  const stuck = [[0, 1, 0, 1], [1, 0, 1, 0]];
  assert.equal(L.hasMove(stuck), false);
  assert.equal(L.hint(stuck), null);
});

test('提示给出合法倒法', () => {
  const tubes = [[0, 1], [1, 0], [0, 0], [1, 1], []];
  const hint = L.hint(tubes);
  assert.ok(hint);
  assert.equal(L.canPour(tubes, hint.from, hint.to), true);
});

test('关卡规格', () => {
  assert.equal(L.specForLevel(1).colors, 3);
  assert.equal(L.specForLevel(1).empty, 2);
  assert.equal(L.specForLevel(6).colors, 8);
  assert.equal(L.specForLevel(20).colors, 8);
  assert.equal(L.specForLevel(0).level, 1);
  assert.deepEqual(L.specForLevel(1.9), L.specForLevel(1));
});

test('校验颜色数量', () => {
  assert.equal(L.isValidTubes([[0, 0, 0, 0], [1, 1, 1, 1], []]), true);
  assert.equal(L.isValidTubes([[0, 0, 0], [1, 1, 1, 1]]), false);
  assert.equal(L.isValidTubes([[0, 0, 0, 2]]), false);
  assert.equal(L.isValidTubes([]), false);
});

test('打乱的每一步都能按原路倒回', () => {
  const scrambled = L.scrambleFromSolved(4, 2, 18, 42);
  assert.ok(scrambled.trace.length > 0);
  let cur = scrambled.tubes;
  for (let i = scrambled.trace.length - 1; i >= 0; i--) {
    const move = scrambled.trace[i];
    const res = L.pour(cur, move.to, move.from);
    assert.equal(res.ok, true, 'step ' + i);
    assert.equal(res.count, move.k, 'step ' + i);
    cur = res.tubes;
  }
  assert.equal(L.isWon(cur), true);
});

test('生成的关卡可倒、不过关、同种子稳定', () => {
  for (let level = 1; level <= 8; level++) {
    for (const seed of [1, 7, 99]) {
      const a = L.createLevel(level, seed);
      const b = L.createLevel(level, seed);
      assert.deepEqual(a.tubes, b.tubes);
      assert.equal(a.level, level);
      assert.equal(a.colors, L.specForLevel(level).colors);
      assert.equal(a.tubes.length, a.colors + a.empty);
      assert.equal(L.isValidTubes(a.tubes), true);
      assert.equal(L.isWon(a.tubes), false);
      assert.equal(L.hasMove(a.tubes), true);
    }
  }
});

test('加空瓶多一个空管，原数组不变', () => {
  const tubes = [[0, 1, 0, 1], [1, 0, 1, 0], []];
  const more = L.addTube(tubes);
  assert.equal(more.length, 4);
  assert.deepEqual(more[3], []);
  assert.equal(tubes.length, 3);
  assert.equal(L.isValidTubes(more), true);
});
