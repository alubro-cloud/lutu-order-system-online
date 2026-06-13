/* =====================================================
   api.js — 後台 API 集中層 + 離線 fallback
   ===================================================== */

(function (global) {
  'use strict';

  const API_URL = 'https://script.google.com/macros/s/AKfycbx2mqPe1ilOWDQ45JYDGJ2KaAUZ9dyH0fT-NwIDOdqUNmz1Dn3-tsL70urJT2cYYI5Q/exec';

  // === 離線 fallback：與後台 sheet 同步的 24 項示範資料 ===
  // 當 file:// 開啟或網路失敗時使用，讓開發測試不卡 CORS
  const FALLBACK_PRODUCTS = [
    // 鋁材 20 系列
    { name: '2020型', sku: 'HR-2020L', type: '鋁材', series: '20系列', price: 1.3, unit: 'cm', img2d: '[HR-0001].jpg', img3d: '[HR-0001]3D.jpg' },
    { name: '2040型', sku: 'HR-2040L', type: '鋁材', series: '20系列', price: 2.4, unit: 'cm', img2d: '[HR-0002].jpg', img3d: '[HR-0002]3D.jpg' },
    // 鋁材 30 系列
    { name: '3030輕型', sku: 'HR-3030S', type: '鋁材', series: '30系列', price: 1.9, unit: 'cm', img2d: '[HR-0004].jpg', img3d: '[HR-0004]3D.jpg' },
    { name: '3060輕型', sku: 'HR-3060S', type: '鋁材', series: '30系列', price: 3.3, unit: 'cm', img2d: '[HR-0006].jpg', img3d: '[HR-0006]3D.jpg' },
    { name: '3030重型', sku: 'HR-3030L', type: '鋁材', series: '30系列', price: 2.9, unit: 'cm', img2d: '[HR-0003].jpg', img3d: '[HR-0003]3D.jpg' },
    { name: '3060重型', sku: 'HR-3060L', type: '鋁材', series: '30系列', price: 5.0, unit: 'cm', img2d: '[HR-0005].jpg', img3d: '[HR-0005]3D.jpg' },
    { name: '6060輕型', sku: 'HR-6060S', type: '鋁材', series: '30系列', price: 5.1, unit: 'cm', img2d: '[HR-0008].jpg', img3d: '[HR-0008]3D.jpg' },
    { name: '6060重型', sku: 'HR-6060L', type: '鋁材', series: '30系列', price: 7.5, unit: 'cm', img2d: '[HR-0007].jpg', img3d: '[HR-0007]3D.jpg' },
    // 鋁材 40 系列
    { name: '4040輕型', sku: 'HR-4040S', type: '鋁材', series: '40系列', price: 3.6, unit: 'cm', img2d: '[HR-0010].jpg', img3d: '[HR-0010]3D.jpg' },
    { name: '4080輕型', sku: 'HR-4080S', type: '鋁材', series: '40系列', price: 6.2, unit: 'cm', img2d: '[HR-0012].jpg', img3d: '[HR-0012]3D.jpg' },
    { name: '4040重型', sku: 'HR-4040L', type: '鋁材', series: '40系列', price: 5.2, unit: 'cm', img2d: '[HR-0009].jpg', img3d: '[HR-0009]3D.jpg' },
    { name: '4080重型', sku: 'HR-4080L', type: '鋁材', series: '40系列', price: 9.5, unit: 'cm', img2d: '[HR-0011].jpg', img3d: '[HR-0011]3D.jpg' },
    // 配件 20 系列
    { name: 'M4內六角螺絲/螺母/墊片/墊司 (10枚/包)', sku: 'AC-2-M4-001', type: '配件', series: '20系列', price: 40, unit: '包', img2d: '[M4-IOOO]2D.jpg', img3d: '[M4-IOOO]3D.jpg' },
    { name: '三角連結塊', sku: 'ACC-1-M4-001', type: '配件', series: '20系列', price: 10, unit: '個', img2d: '20三角連結塊2D.jpg', img3d: '[M4-333]3D.jpg' },
    { name: 'M4六角板手', sku: 'ACC-9-M4-001', type: '配件', series: '20系列', price: 10, unit: '支', img2d: '203mm六角板手2D.jpg', img3d: '[M4-6]3D.jpg' },
    // 配件 30 系列
    { name: 'M6內六角螺絲/螺母/墊片/墊司 (10枚/包)', sku: 'ACC-2-M6-001', type: '配件', series: '30系列', price: 60, unit: '包', img2d: '[M6-IOOO]2D.jpg', img3d: '[M6-IOOO]3D.jpg' },
    { name: '三角連結塊', sku: 'ACC-1-M6-001', type: '配件', series: '30系列', price: 15, unit: '個', img2d: '30三角連結塊2D.jpg', img3d: '[M6-333]3D.jpg' },
    { name: '平板連結片', sku: 'ACC-1-M6-002', type: '配件', series: '30系列', price: 20, unit: '個', img2d: '30平板連結片2D.jpg', img3d: '[M6-L]3D.jpg' },
    { name: '靜音輪/腳杯固定器', sku: 'ACC-9-M6-001', type: '配件', series: '30系列', price: 30, unit: '個', img2d: '30靜音輪腳杯固定器2D.jpg', img3d: '[M6-FEET]3D.jpg' },
    { name: 'M6六角板手', sku: 'ACC-9-M6-002', type: '配件', series: '30系列', price: 12, unit: '支', img2d: '305mm六角板手2D.jpg', img3d: '[M6-6]3D.jpg' },
    // 配件 40 系列
    { name: 'M8內六角螺絲/螺母/墊片/墊司 (10枚/包)', sku: 'ACC-2-M8-001', type: '配件', series: '40系列', price: 80, unit: '包', img2d: '[M8-IOOO]2D.jpg', img3d: '[M8-IOOO]3D.jpg' },
    { name: '三角連結塊', sku: 'ACC-1-M8-001', type: '配件', series: '40系列', price: 20, unit: '個', img2d: '40三角連結塊2D.jpg', img3d: '[M8-333]3D.jpg' },
    { name: '靜音輪/腳杯固定器', sku: 'ACC-9-M8-001', type: '配件', series: '40系列', price: 40, unit: '個', img2d: '40靜音輪腳杯固定器2D.jpg', img3d: '[M8-FEET]3D.jpg' },
    { name: 'M8六角板手', sku: 'ACC-9-M8-002', type: '配件', series: '40系列', price: 15, unit: '支', img2d: '406mm六角板手2D.jpg', img3d: '[M8-6]3D.jpg' },
  ];

  // 偵測是否為離線環境（file://）
  const IS_OFFLINE = location.protocol === 'file:';

  // 將 fallback 資料包裝成 sheet API 同樣的欄位名稱
  function getFallbackInventory() {
    return FALLBACK_PRODUCTS.map(p => ({
      '產品主分類': p.type,
      '產品類型': p.series,
      '產品名稱': `${p.name} [${p.sku}]`,
      '單價': p.price,
      '單位': p.unit,
      '內部編號(SKU)': p.sku,
      '圖片名稱(鋁材圖/配件2D圖)': p.img2d,
      '圖片名稱(配件3D圖)': p.img3d,
    }));
  }

  const cache = new Map();
  const CACHE_TTL = 5 * 60 * 1000;

  function isCacheValid(key) {
    const entry = cache.get(key);
    return entry && (Date.now() - entry.timestamp < CACHE_TTL);
  }

  async function getInventory(forceRefresh = false) {
    const key = 'inventory';

    console.info('[ALU.api] === getInventory 開始 ===');
    console.info('[ALU.api] location.protocol:', location.protocol);
    console.info('[ALU.api] location.origin:', location.origin);
    console.info('[ALU.api] API_URL:', API_URL);

    // file:// 直接用 fallback，省去 CORS 失敗等待
    if (IS_OFFLINE) {
      console.info('[ALU.api] → 走離線模式（file://），使用內建示範資料 24 項');
      return getFallbackInventory();
    }

    if (!forceRefresh && isCacheValid(key)) {
      console.info('[ALU.api] → 用快取資料');
      return cache.get(key).data;
    }

    try {
      const fetchUrl = `${API_URL}?action=getProducts&t=${Date.now()}`;
      console.info('[ALU.api] 開始 fetch (getProducts):', fetchUrl);
      const res = await fetch(fetchUrl);
      console.info('[ALU.api] fetch 回應 status:', res.status, 'ok:', res.ok);
      const json = await res.json();
      console.info('[ALU.api] JSON parse 完成，型別:',
        Array.isArray(json) ? 'array' : typeof json,
        'keys:', json && typeof json === 'object' ? Object.keys(json) : '(N/A)'
      );

      // v1 GAS 後台回的格式是 { products: [[header], [row], [row], ...] }（2D array）
      // 第一 row 是 header，跳過。每 row 欄位順序：
      // [0] type, [1] series, [2] name, [3] price,
      // [4] img2d, [5] img3d, [6] unit, [7] status, [8] desc, [9] sku
      let data = [];
      let branch = '(unknown)';
      if (json && Array.isArray(json.products)) {
        branch = 'v1 row-based (json.products)';
        let lastType = '';
        let lastSeries = '';
        data = json.products.slice(1).map(row => {
          if (!row || row.length < 3) return null;
          let type = row[0] || lastType;
          let seriesRaw = row[1] || lastSeries;
          if (row[0]) lastType = row[0];
          if (row[1]) lastSeries = row[1];
          const seriesNum = String(seriesRaw || '').replace('系列', '').trim();
          return {
            type: String(type || '').trim(),
            series: seriesNum ? seriesNum + '系列' : '',
            name: String(row[2] || '').trim(),
            price: Number(row[3]) || 0,
            img2d: row.length > 4 ? String(row[4] || '').trim() : '',
            img3d: row.length > 5 ? String(row[5] || '').trim() : '',
            unit: row.length > 6 ? String(row[6] || '').trim() : '',
            status: row.length > 7 ? String(row[7] || '').trim() : '',
            desc: row.length > 8 ? String(row[8] || '').trim() : '',
            sku: row.length > 9 ? String(row[9] || '').trim() : '',
          };
        }).filter(p => p && p.name && p.status !== '下架');
      } else if (Array.isArray(json)) {
        branch = 'plain array';
        data = json;
      } else if (json && Array.isArray(json.inventory)) {
        branch = 'json.inventory';
        data = json.inventory;
      } else if (json && Array.isArray(json.data)) {
        branch = 'json.data';
        data = json.data;
      }
      console.info('[ALU.api] 走了 branch:', branch);

      if (data.length === 0) {
        console.warn('[ALU.api] ⚠ 後台回傳空清單或解析失敗，改用 fallback');
        return getFallbackInventory();
      }

      console.info('[ALU.api] ✓ 從後台載入', data.length, '個商品');
      // 用 JSON.stringify 強制把第一筆內容轉成字串（保證看得到）
      try {
        console.info('[ALU.api] data[0] JSON:', JSON.stringify(data[0]).slice(0, 400));
      } catch (e) {
        console.info('[ALU.api] data[0] (無法 stringify):', data[0]);
      }
      // 印出 GAS 回的 raw json 整個（限 500 字避免太長）
      try {
        console.info('[ALU.api] raw json 預覽:', JSON.stringify(json).slice(0, 500));
      } catch (e) { /* ignore */ }

      cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (e) {
      console.warn('[ALU.api] ✗ getInventory 失敗，錯誤:', e.message, e);
      console.warn('[ALU.api] → 改用 fallback（內建 24 項）');
      return cache.get(key)?.data || getFallbackInventory();
    }
  }

  async function submitOrder(payload) {
    // 不擋 file://：POST + no-cors 可繞過 CORS preflight，能送到 GAS
    // 因為 no-cors 拿不到回應，只能信任「沒丟錯就是送出」
    return fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
  }

  async function getOrders() {
    if (IS_OFFLINE) return [];
    try {
      const res = await fetch(`${API_URL}?action=getOrders&t=${Date.now()}`);
      const json = await res.json();
      return Array.isArray(json) ? json : (json.orders || json.data || []);
    } catch (e) {
      console.warn('[api] getOrders failed:', e);
      return [];
    }
  }

  global.ALU = global.ALU || {};
  global.ALU.api = { getInventory, submitOrder, getOrders, IS_OFFLINE, FALLBACK_PRODUCTS };

})(window);
