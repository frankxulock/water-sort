/* 倒水排序激励广告。只接 Adsgram 的 Reward：看完才发奖，跳过、失败、没填广告位都不发。
   广告位在 index.html 的 WATER_ADS 里填，加瓶、提示、跳关共用一个 Block ID。 */
(function () {
  'use strict';

  var cfg = window.WATER_ADS || {};
  var blockId = /^\d+$/.test(String(cfg.blockId || '').trim()) ? String(cfg.blockId).trim() : '';
  var controller = null;
  var busy = false;

  function getController() {
    if (controller || !blockId || !window.Adsgram || typeof window.Adsgram.init !== 'function') return controller;
    try {
      controller = window.Adsgram.init({ blockId: blockId, debug: !!cfg.debug, debugBannerType: 'RewardedVideo' });
    } catch (e) {
      controller = null;
    }
    return controller;
  }

  // 放一条激励广告，结果是 { ok, reason }
  function rewarded() {
    if (!blockId) return Promise.resolve({ ok: false, reason: 'unconfigured' });
    if (busy) return Promise.resolve({ ok: false, reason: 'busy' });
    var ad = getController();
    if (!ad || typeof ad.show !== 'function') return Promise.resolve({ ok: false, reason: 'missing' });
    busy = true;
    return ad.show().then(function (result) {
      busy = false;
      return { ok: !!(result && result.done !== false), reason: 'done' };
    }, function (result) {
      busy = false;
      var skipped = result && result.done === false && !result.error;
      return { ok: false, reason: skipped ? 'skip' : 'error' };
    });
  }

  window.WaterAds = {
    rewarded: rewarded,
    configured: function () { return !!blockId; }
  };
})();
