/* =====================================================
   lib/validation.js — 輸入驗證
   ===================================================== */

(function (global) {
  'use strict';

  const ALU_MIN_MM = 50;
  const ALU_MAX_MM = 6000;

  function validateAluLength(mm) {
    const n = Number(mm);
    if (!mm || isNaN(n)) return { ok: false, msg: '請輸入長度' };
    if (n < ALU_MIN_MM) return { ok: false, msg: `長度最少 ${ALU_MIN_MM} mm` };
    if (n > ALU_MAX_MM) return { ok: false, msg: `長度最多 ${ALU_MAX_MM} mm` };
    return { ok: true, value: Math.round(n) };
  }

  function validateQty(qty) {
    const n = parseInt(qty, 10);
    if (!n || n < 1) return { ok: false, msg: '數量需 ≥ 1' };
    return { ok: true, value: n };
  }

  global.ALU = global.ALU || {};
  global.ALU.validate = {
    aluLength: validateAluLength,
    qty: validateQty,
    MIN_MM: ALU_MIN_MM,
    MAX_MM: ALU_MAX_MM,
  };

})(window);
