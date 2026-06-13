/* =====================================================
   views/b2c.js — B2C 選料 主畫面
   ===================================================== */

(function (global) {
  'use strict';

  // === 模組狀態（卡片內部填寫狀態，view 切換時清空）===
  const cardState = new Map();
  let currentMainTab = '鋁材';
  let currentSeries = '20系列';

  // 從 API 拿到的商品 normalize 成統一結構
  function normalizeProduct(raw) {
    const { format, api } = window.ALU;
    const nameRaw = raw.name || raw['品項名稱'] || raw['產品名稱'] || '';
    if (!nameRaw) return null;
    const { name, sku: parsedSku } = format.parseNameWithSKU(nameRaw);
    const sku = raw.sku || raw['內部編號(SKU)'] || raw['內部編號'] || parsedSku || '';

    // GAS 後台只回庫存欄位（category, series, name, stock）→ 用 FALLBACK 補價格/圖
    const catalog = (api.FALLBACK_PRODUCTS || []).find(f => f.sku === sku) || {};

    return {
      name,
      sku,
      // 後台用 category，v2 內部用 type
      type:    raw.type   || raw.category || raw['主分類'] || raw['產品主分類'] || catalog.type   || '',
      series:  raw.series || raw['產品類型'] || catalog.series || '',
      price:   Number(raw.price || raw['單價']) || catalog.price || 0,
      unit:    raw.unit || raw['單位'] || catalog.unit || '',
      // 後台 image 單欄 fallback；img2d/img3d 從 catalog 補
      img2d:   raw.img2d || raw.image || raw['圖片名稱(鋁材圖/配件2D圖)'] || raw['圖2D'] || catalog.img2d || '',
      img3d:   raw.img3d || raw['圖片名稱(配件3D圖)'] || raw['圖3D'] || catalog.img3d || '',
      stock:   Number(raw.stock) || 0,
    };
  }

  async function mount(root) {
    const { api, store, cartDrawer } = window.ALU;

    // 每次進入 B2C 都 reset tab 為預設（避免從別頁回來時 tab UI 跟內容不一致）
    currentMainTab = '鋁材';
    currentSeries = '20系列';

    root.innerHTML = renderShell();

    // 確保購物車元件已建立
    if (cartDrawer && cartDrawer.init) cartDrawer.init();

    // 載入商品（有 cache）— 用 try/catch 避免 fetch 失敗讓整個 view 死掉
    try {
      let products = store.get('products');
      if (!products || products.length === 0) {
        const grid = root.querySelector('#b2c-grid');
        if (grid) grid.innerHTML = `<div class="b2c__empty">載入商品中…</div>`;
        const list = await api.getInventory();
        console.info('[b2c] 收到 list 長度:', list?.length);
        console.info('[b2c] list 第一筆:', list?.[0]);
        products = (list || []).map(normalizeProduct).filter(Boolean);
        console.info('[b2c] normalize 後得到', products.length, '個商品');
        console.info('[b2c] normalize 後第一筆:', products[0]);
        store.set('products', products);
      }
    } catch (e) {
      console.error('[b2c] 載入商品失敗:', e);
      store.set('products', []);
    }

    bindNavTabs(root);
    renderProducts(root);
  }

  function renderShell() {
    const offlineHint = window.ALU.api.IS_OFFLINE
      ? `<span class="b2c__offline-hint" title="商品列表為內建示範資料（file:// 開啟）。但送單仍會嘗試到後台。要看真實庫存/訂單列表請用 http server 開啟">
          <i class="ti ti-plug-off"></i> 示範資料
        </span>`
      : '';

    const tabCls = (active, mini) => `b2c__tab${mini ? ' b2c__tab--mini' : ''}${active ? ' b2c__tab--active' : ''}`;

    return `
      <div class="b2c view">
        <div class="b2c__nav">
          <a class="b2c__back" href="#/"><i class="ti ti-arrow-left"></i> 返回首頁</a>
          <div class="b2c__tabs b2c__main-tabs">
            <button data-tab="鋁材" class="${tabCls(currentMainTab === '鋁材', false)}">鋁材</button>
            <button data-tab="配件" class="${tabCls(currentMainTab === '配件', false)}">配件</button>
          </div>
          <div class="b2c__tabs b2c__series-tabs">
            <button data-series="20系列" class="${tabCls(currentSeries === '20系列', true)}">20 系列</button>
            <button data-series="30系列" class="${tabCls(currentSeries === '30系列', true)}">30 系列</button>
            <button data-series="40系列" class="${tabCls(currentSeries === '40系列', true)}">40 系列</button>
          </div>
          ${offlineHint}
        </div>
        <div class="b2c__grid" id="b2c-grid"></div>
      </div>
    `;
  }

  function bindNavTabs(root) {
    const mainTabs = root.querySelector('.b2c__main-tabs');
    const seriesTabs = root.querySelector('.b2c__series-tabs');
    if (!mainTabs || !seriesTabs) {
      console.warn('[b2c] tabs 元素不存在，跳過綁定');
      return;
    }
    mainTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      currentMainTab = btn.dataset.tab;
      setActive(root, '.b2c__main-tabs', btn);
      renderProducts(root);
    });
    seriesTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-series]');
      if (!btn) return;
      currentSeries = btn.dataset.series;
      setActive(root, '.b2c__series-tabs', btn);
      renderProducts(root);
    });
  }

  function setActive(root, parentSel, activeBtn) {
    root.querySelectorAll(`${parentSel} .b2c__tab`).forEach(b =>
      b.classList.toggle('b2c__tab--active', b === activeBtn)
    );
  }

  function renderProducts(root) {
    const { store } = window.ALU;
    const grid = root.querySelector('#b2c-grid');
    const all = store.get('products') || [];
    const filtered = all.filter(p => p.type === currentMainTab && p.series === currentSeries);

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="b2c__empty">此分類目前沒有商品</div>`;
      return;
    }
    grid.innerHTML = filtered.map(renderCard).join('');
    bindCardEvents(grid);
  }

  // 從鋁材名稱解析尺寸：'2020型' → '20 × 20 mm', '4080輕型' → '40 × 80 mm'
  function getAluDim(name) {
    const m = String(name).match(/^(\d{2})(\d{2})/);
    if (!m) return null;
    return `${parseInt(m[1])} × ${parseInt(m[2])} mm`;
  }

  function renderCard(p) {
    const { format } = window.ALU;
    const isAlu = p.type === '鋁材';
    const state = getCardState(p);
    const priceUnit = isAlu ? '/ 10mm' : `/ ${p.unit || '個'}`;
    const dim = isAlu ? getAluDim(p.name) : null;

    const img2dSrc = p.img2d ? `assets/${p.img2d}` : '';
    const img3dSrc = p.img3d ? `assets/${p.img3d}` : '';

    const cellInner = (src, alt) =>
      src
        ? `<img src="${src}" alt="${alt}" loading="lazy" onerror="window.ALU.imgFail(this)">`
        : `<div class="product-card__no-image"><i class="ti ti-photo"></i></div>`;

    return `
      <article class="product-card" data-name="${p.name}">
        <div class="product-card__media" data-img2d="${img2dSrc}" data-img3d="${img3dSrc}">
          <div class="product-card__media-cell">
            ${dim ? `<span class="product-card__dim-badge">${dim}</span>` : ''}
            ${cellInner(img2dSrc, `${p.name} 2D`)}
            <span class="product-card__view-mode">2D</span>
          </div>
          <div class="product-card__media-cell">
            ${cellInner(img3dSrc, `${p.name} 3D`)}
            <span class="product-card__view-mode">3D</span>
          </div>
        </div>
        <div class="product-card__body">
          <div class="product-card__head">
            <div class="product-card__name-wrap">
              <h3 class="product-card__name">${p.name}</h3>
              ${p.sku ? `<div class="product-card__sku">${p.sku}</div>` : ''}
            </div>
            <div class="product-card__price">
              ${format.money(p.price)}<span class="product-card__price-unit">${priceUnit}</span>
            </div>
          </div>
          <div class="product-card__purchase">
            ${isAlu ? renderAluRows(state, p) : renderAccBar(state)}
          </div>
        </div>
      </article>
    `;
  }

  function renderAluRows(state, p) {
    const { format } = window.ALU;
    const isMulti = state.lengths.length > 1;
    const rows = state.lengths.map((row, idx) => `
      <div class="alu-row" data-row="${idx}">
        <div class="alu-row__input-wrap">
          <input type="number" data-len value="${row.len || ''}"
                 min="50" max="6000" step="1" placeholder="長度">
          <span class="alu-row__unit">mm</span>
        </div>
        <input type="number" class="alu-row__qty" data-qty
               value="${row.qty || 1}" min="1" step="1" aria-label="數量">
        ${idx === 0
          ? `<button class="alu-row__add" data-add type="button">
              <i class="ti ti-plus"></i> 加入
            </button>`
          : `<button class="alu-row__remove" data-row-remove="${idx}"
                     type="button" aria-label="移除這組">
              <i class="ti ti-x"></i>
            </button>`
        }
      </div>
    `).join('');

    const subtotal = computeSubtotal(p, state);
    return `
      <div class="alu-rows">${rows}</div>
      <button class="alu-add-row" data-add-row type="button">
        <i class="ti ti-plus"></i> 新增長度組
      </button>
      ${isMulti
        ? `<div class="alu-total">
             <span>共 ${state.lengths.length} 組</span>
             <span>小計 <strong>${format.money(subtotal)}</strong></span>
           </div>`
        : ''
      }
    `;
  }

  function renderAccBar(state) {
    return `
      <div class="acc-bar">
        <div class="acc-stepper">
          <button data-step="-1" type="button" aria-label="減少"><i class="ti ti-minus"></i></button>
          <input type="number" data-qty value="${state.qty || 1}" min="1" step="1">
          <button data-step="1" type="button" aria-label="增加"><i class="ti ti-plus"></i></button>
        </div>
        <button class="acc-add" data-add type="button">
          <i class="ti ti-plus"></i> 加入
        </button>
      </div>
    `;
  }

  function getCardState(p) {
    const isAlu = p.type === '鋁材';
    if (!cardState.has(p.name)) {
      cardState.set(p.name, isAlu ? { lengths: [{ len: '', qty: 1 }] } : { qty: 1 });
    }
    return cardState.get(p.name);
  }

  function resetCardState(p) {
    cardState.set(p.name, p.type === '鋁材'
      ? { lengths: [{ len: '', qty: 1 }] }
      : { qty: 1 }
    );
  }

  function computeSubtotal(p, state) {
    const { format } = window.ALU;
    if (p.type === '鋁材') {
      return state.lengths.reduce((sum, r) =>
        sum + format.aluLineTotal(p.price, Number(r.len) || 0, Number(r.qty) || 0), 0);
    }
    return format.accLineTotal(p.price, Number(state.qty) || 0);
  }

  function bindCardEvents(grid) {
    grid.addEventListener('input', handleCardInput);
    grid.addEventListener('click', handleCardClick);
    // 圖片載入失敗 → 替換成 fallback icon（error 事件不 bubble，要用 capture）
    grid.addEventListener('error', (e) => {
      const img = e.target;
      if (img.tagName !== 'IMG') return;
      if (!img.matches('[data-fallback]')) return;
      const placeholder = document.createElement('div');
      placeholder.className = 'product-card__no-image';
      placeholder.innerHTML = '<i class="ti ti-photo"></i>';
      img.replaceWith(placeholder);
    }, true);
  }

  function handleCardInput(e) {
    const card = e.target.closest('.product-card');
    if (!card) return;
    const p = findProduct(card.dataset.name);
    if (!p) return;
    const state = getCardState(p);

    if (e.target.matches('[data-len]')) {
      const row = e.target.closest('.alu-row');
      state.lengths[Number(row.dataset.row)].len = e.target.value;
    } else if (e.target.matches('[data-qty]')) {
      if (p.type === '鋁材') {
        const row = e.target.closest('.alu-row');
        state.lengths[Number(row.dataset.row)].qty = e.target.value;
      } else {
        state.qty = e.target.value;
      }
    }
    updateCardSubtotal(card, p, state);
  }

  function handleCardClick(e) {
    const card = e.target.closest('.product-card');
    if (!card) return;
    const p = findProduct(card.dataset.name);
    if (!p) return;
    const state = getCardState(p);

    // 點圖開 Lightbox（任一格都可）
    const cell = e.target.closest('.product-card__media-cell');
    if (cell) {
      const media = card.querySelector('.product-card__media');
      if (media.dataset.img2d || media.dataset.img3d) {
        window.ALU.lightbox.open({
          img2d: media.dataset.img2d,
          img3d: media.dataset.img3d,
          caption: `${p.name}${p.sku ? ` · ${p.sku}` : ''}`,
        });
      }
      return;
    }

    if (e.target.closest('[data-add-row]')) {
      state.lengths.push({ len: '', qty: 1 });
      reRenderCard(card, p);
      return;
    }
    const rmRow = e.target.closest('[data-row-remove]');
    if (rmRow) {
      state.lengths.splice(Number(rmRow.dataset.rowRemove), 1);
      reRenderCard(card, p);
      return;
    }
    const stepBtn = e.target.closest('[data-step]');
    if (stepBtn) {
      state.qty = Math.max(1, (Number(state.qty) || 1) + Number(stepBtn.dataset.step));
      reRenderCard(card, p);
      return;
    }
    if (e.target.closest('[data-add]')) {
      addToCart(p, state, card);
    }
  }

  function findProduct(name) {
    return (window.ALU.store.get('products') || []).find(p => p.name === name);
  }

  function updateCardSubtotal(card, p, state) {
    // 只有鋁材的多列模式（alu-total 存在）才需要更新總計顯示
    const totalEl = card.querySelector('.alu-total strong');
    if (totalEl) {
      totalEl.textContent = window.ALU.format.money(computeSubtotal(p, state));
    }
  }

  function reRenderCard(card, p) {
    const state = getCardState(p);
    card.querySelector('.product-card__purchase').innerHTML =
      p.type === '鋁材' ? renderAluRows(state, p) : renderAccBar(state);
  }

  function addToCart(p, state, card) {
    const { cart, format, validate, toast } = window.ALU;

    if (p.type === '鋁材') {
      // 驗證所有長度組
      for (let i = 0; i < state.lengths.length; i++) {
        const row = state.lengths[i];
        const vLen = validate.aluLength(row.len);
        if (!vLen.ok) {
          toast.show(`第 ${i + 1} 組：${vLen.msg}`, 3500);
          return;
        }
        const vQty = validate.qty(row.qty);
        if (!vQty.ok) {
          toast.show(`第 ${i + 1} 組：${vQty.msg}`, 3500);
          return;
        }
      }
      // 全加入
      let totalRoots = 0;
      state.lengths.forEach(row => {
        const len = Number(row.len);
        const qty = Number(row.qty);
        cart.add({
          productName: p.name, sku: p.sku, type: p.type,
          series: p.series.replace('系列', ''),
          unit: p.unit, unitPrice: p.price,
          length: len, qty,
          lineTotal: format.aluLineTotal(p.price, len, qty),
        });
        totalRoots += qty;
      });
      toast.show(`✓ 已加入 ${state.lengths.length} 組（共 ${totalRoots} 根）`);
    } else {
      const vQty = validate.qty(state.qty);
      if (!vQty.ok) { toast.show(vQty.msg, 3500); return; }
      const qty = Number(state.qty);
      cart.add({
        productName: p.name, sku: p.sku, type: p.type,
        series: p.series.replace('系列', ''),
        unit: p.unit, unitPrice: p.price, qty,
        lineTotal: format.accLineTotal(p.price, qty),
      });
      toast.show(`✓ 已加入 ${qty} ${p.unit || '個'}`);
    }

    // Reset card state
    resetCardState(p);
    reRenderCard(card, p);
  }

  global.ALU = global.ALU || {};
  global.ALU.views = global.ALU.views || {};
  global.ALU.views.mountB2C = mount;

})(window);
