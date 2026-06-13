/* =====================================================
   lib/format.js — 共用格式化函式
   ===================================================== */

(function (global) {
  'use strict';

  // NT$ 智能格式化：
  //   整數 → 不顯示小數（NT$114）
  //   有小數 → 顯示最多 2 位、去除尾隨 0（NT$1.9、NT$1.95）
  function money(n) {
    if (n == null || isNaN(n)) return 'NT$0';
    const num = Number(n);
    if (Number.isInteger(num)) {
      return 'NT$' + num.toLocaleString('en-US');
    }
    // 浮點：保留 2 位再 trim 尾零
    const fixed = num.toFixed(2).replace(/\.?0+$/, '');
    return 'NT$' + fixed;
  }

  // 從 "2020型 [HR-2020L]" 拆出 {name, sku}
  function parseNameWithSKU(raw) {
    if (!raw) return { name: '', sku: '' };
    const m = String(raw).match(/^(.+?)\s*\[([^\]]+)\]\s*$/);
    if (m) return { name: m[1].trim(), sku: m[2].trim() };
    return { name: String(raw).trim(), sku: '' };
  }

  // 鋁材長度顯示：50 → "50 mm"
  function lengthLabel(mm) {
    if (!mm) return '';
    return `${mm} mm`;
  }

  // 鋁材單行小計：單價(NT/cm) × (mm/10) × qty
  // ➡ Math.round 確保金額為整數，admin 直接收
  // 例：1.9 × 50mm × 3 = 28.5 → 29（四捨五入）
  function aluLineTotal(unitPrice, mm, qty) {
    return Math.round(Number(unitPrice) * (Number(mm) / 10) * Number(qty));
  }

  // 配件單行小計（配件單價本來就是整數）
  function accLineTotal(unitPrice, qty) {
    return Math.round(Number(unitPrice) * Number(qty));
  }

  global.ALU = global.ALU || {};
  global.ALU.format = { money, parseNameWithSKU, lengthLabel, aluLineTotal, accLineTotal };

})(window);
