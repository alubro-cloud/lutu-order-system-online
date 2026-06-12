/* =====================================================
   lib/cutplan.js — 鋁材切料排版 + 重量 + 物流計算
   核心演算法：First Fit Decreasing (FFD) bin packing
   ===================================================== */

(function (global) {
  'use strict';

  const STOCK_LENGTH_MM = 6000;     // 鋁材原料一支 6000mm
  const DEFAULT_KERF_MM = 5;        // 鋸路損耗（鋸片厚度）每切一段扣 5mm

  // 各 SKU 的單位重量（kg/m）— 從 v1 經驗值
  // 後台 sheet 若有「每米重量」欄位會 override 這個
  const DEFAULT_WEIGHT_KG_PER_M = {
    'HR-2020L': 0.46,
    'HR-2040L': 0.95,
    'HR-3030S': 1.00,  // 30 輕
    'HR-3030L': 1.40,  // 30 重
    'HR-3060S': 1.60,
    'HR-3060L': 2.20,
    'HR-6060S': 2.50,
    'HR-6060L': 3.60,
    'HR-4040S': 1.30,
    'HR-4040L': 2.00,
    'HR-4080S': 2.30,
    'HR-4080L': 3.50,
  };

  /**
   * 計算切料排版（含鋸路）
   * @param {Array} items - cart items 過濾出鋁材的，每項 { sku, productName, length, qty }
   * @param {Object} options - { stockLength, kerf }
   * @returns {Array} 每組 SKU 一筆：{ sku, name, stocks, stockCount, utilization, totalLengthMm, totalKerfMm }
   */
  function planCuts(items, options) {
    const opts = options || {};
    const STOCK = opts.stockLength || STOCK_LENGTH_MM;
    const KERF = (opts.kerf !== undefined && opts.kerf !== null) ? Number(opts.kerf) : DEFAULT_KERF_MM;

    // 按 SKU 分組，展開成「每根」一條（qty 拆成個別 pieces）
    const grouped = new Map();
    items.forEach(item => {
      if (!item.length || !item.qty || !item.sku) return;
      const key = item.sku;
      if (!grouped.has(key)) {
        grouped.set(key, { sku: item.sku, name: item.productName, pieces: [] });
      }
      for (let i = 0; i < Number(item.qty); i++) {
        grouped.get(key).pieces.push(Number(item.length));
      }
    });

    // FFD: 對每組依長度遞減排序，依序找第一支放得下的原料
    // 每段切割消耗 piece + kerf（保守算法，跟 v1 後台一致）
    const result = [];
    grouped.forEach(group => {
      group.pieces.sort((a, b) => b - a);
      const stocks = []; // [{ used: [length, length, ...], remaining: number }]

      group.pieces.forEach(piece => {
        if (piece > STOCK) {
          // 超過一支原料的長度（理論不該發生，因為 max 6000mm）
          stocks.push({ used: [piece], remaining: 0, oversized: true });
          return;
        }
        // 段長 + 鋸路才是這段「實際消耗」的原料
        const cost = piece + KERF;
        const idx = stocks.findIndex(s => s.remaining >= cost);
        if (idx >= 0) {
          stocks[idx].used.push(piece);
          stocks[idx].remaining -= cost;
        } else {
          stocks.push({ used: [piece], remaining: STOCK - cost });
        }
      });

      const totalUsed = stocks.reduce(
        (sum, s) => sum + s.used.reduce((a, b) => a + b, 0), 0);
      const totalKerf = stocks.reduce((sum, s) => sum + s.used.length * KERF, 0);
      const totalStock = stocks.length * STOCK;
      // 利用率：實際成品長度 / 原料總長（不包含鋸路的部分算「廢」）
      const utilization = totalStock > 0 ? totalUsed / totalStock : 0;

      result.push({
        sku: group.sku,
        name: group.name,
        stocks,
        stockCount: stocks.length,
        utilization,
        totalLengthMm: totalUsed,
        totalKerfMm: totalKerf,
        totalPieces: group.pieces.length,
        kerf: KERF,
      });
    });

    return result;
  }

  /**
   * 估算鋁材總重（kg），不含配件
   * @param {Array} cutPlan - planCuts() 的回傳
   * @param {Object} productsBySKU - { sku: product } 用來取 weightPerM
   */
  function estimateWeight(cutPlan, productsBySKU) {
    return cutPlan.reduce((sum, group) => {
      const product = productsBySKU[group.sku];
      const w = (product && Number(product.weightPerM))
        || DEFAULT_WEIGHT_KG_PER_M[group.sku]
        || 1.0;
      return sum + (group.totalLengthMm / 1000) * w;
    }, 0);
  }

  /**
   * 物流建議
   * 鋁材物流關鍵在「最長段長度」（決定車斗能否裝下）跟「總重」
   * 對齊 v1 admin 後台判斷規則（admin.js line 2216）：
   *   maxLen > 250cm (2500mm) 或 totalWeight > 50kg → 大貨車
   * @param {number} totalKg
   * @param {number} maxPieceLengthMm - 切料後最長那段的 mm
   * @returns {Object} { method, icon, note }
   */
  function shippingSuggestion(totalKg, maxPieceLengthMm) {
    const longPiece = Number(maxPieceLengthMm) > 2500;
    const heavy = Number(totalKg) > 50;
    if (longPiece || heavy) {
      return {
        method: '大貨車配送',
        icon: 'ti-truck-loading',
        note: longPiece
          ? '長段 > 2.5m，需大貨車運送'
          : '總重 > 50kg，需大貨車運送'
      };
    }
    return {
      method: '小貨車配送',
      icon: 'ti-truck-delivery',
      note: '或可選擇公司自取省運費'
    };
  }

  global.ALU = global.ALU || {};
  global.ALU.cutplan = {
    planCuts,
    estimateWeight,
    shippingSuggestion,
    STOCK_LENGTH_MM,
    DEFAULT_KERF_MM,
    DEFAULT_WEIGHT_KG_PER_M,
  };

})(window);
