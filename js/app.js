/* =====================================================
   app.js — 入口
   ===================================================== */

(function () {
  'use strict';

  const { router, views, toast } = window.ALU;

  // === 圖片載入失敗 → 顯示 photo icon placeholder（不要 broken icon） ===
  window.ALU.imgFail = function (img) {
    const cell = img.parentNode;
    if (!cell) return;
    img.remove();
    const fb = document.createElement('div');
    fb.className = 'product-card__no-image';
    fb.innerHTML = '<i class="ti ti-photo"></i>';
    cell.appendChild(fb);
  };

  // === 註冊所有 view ===
  router
    .register('hub',          views.mountHub)
    .register('b2c',          views.mountB2C)
    .register('b2c/checkout', views.mountB2CCheckout)
    .register('orders',       views.mountOrders)
    .register('b2b',          views.mountB2C)        // 舊連結相容：b2b 直接導去 b2c
    .register('products',     views.mountProducts)
    .register('custom',       views.makePlaceholder('custom'))
    .register('gallery',      views.makePlaceholder('gallery'));

  // === 全域 click handler：[data-copy] 點擊複製文字 + 不擋 mailto: ===
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-copy]');
    if (!trigger) return;
    const text = trigger.dataset.copy;
    if (!text) return;

    const copyText = (txt) => {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(txt);
      }
      return new Promise((resolve, reject) => {
        const ta = document.createElement('textarea');
        ta.value = txt;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); resolve(); }
        catch (err) { reject(err); }
        finally { document.body.removeChild(ta); }
      });
    };
    copyText(text).then(() => toast.show(`已複製：${text}`)).catch(() => {});
  });

  router.start();
})();
