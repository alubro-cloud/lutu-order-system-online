/* =====================================================
   ui/toast.js — 簡單的提示訊息（複製成功、操作完成等）
   ===================================================== */

(function (global) {
  'use strict';

  let toastEl = null;
  let timer = null;

  function ensureToast() {
    if (toastEl) return toastEl;
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
    return toastEl;
  }

  function show(message, duration = 2500) {
    const el = ensureToast();
    el.textContent = message;
    // 強制 reflow 才能讓 transition 動起來
    void el.offsetWidth;
    el.classList.add('toast--visible');
    clearTimeout(timer);
    timer = setTimeout(() => {
      el.classList.remove('toast--visible');
    }, duration);
  }

  global.ALU = global.ALU || {};
  global.ALU.toast = { show };

})(window);
