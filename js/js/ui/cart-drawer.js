/* =====================================================
   ui/cart-drawer.js — 購物車側拉抽屜
   桌機從右側滑出 / 手機底部全螢幕
   ===================================================== */

(function (global) {
  'use strict';

  let drawerEl = null;
  let fabEl = null;

  function ensure() {
    if (drawerEl) return drawerEl;
    const { store, cart, format } = window.ALU;

    // === 浮動按鈕 (cart FAB) ===
    fabEl = document.createElement('button');
    fabEl.className = 'cart-fab';
    fabEl.setAttribute('aria-label', '購物車');
    fabEl.innerHTML = `
      <i class="ti ti-shopping-cart"></i>
      <span class="cart-fab__badge">0</span>
    `;
    fabEl.addEventListener('click', open);
    document.body.appendChild(fabEl);

    // === 抽屜本體 ===
    drawerEl = document.createElement('aside');
    drawerEl.className = 'cart-drawer';
    drawerEl.innerHTML = `
      <div class="cart-drawer__backdrop"></div>
      <div class="cart-drawer__panel">
        <div class="cart-drawer__header">
          <h3 class="cart-drawer__title">採購清單 <span class="cart-drawer__count">0</span></h3>
          <button class="cart-drawer__close" aria-label="關閉">&times;</button>
        </div>
        <div class="cart-drawer__body"></div>
        <div class="cart-drawer__footer">
          <div class="cart-drawer__total-row">
            <span>小計</span>
            <strong class="cart-drawer__total">NT$0</strong>
          </div>
          <button class="cart-drawer__checkout">
            <i class="ti ti-arrow-right"></i> 前往結帳
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(drawerEl);

    // backdrop 跟 close 都關閉
    drawerEl.querySelector('.cart-drawer__backdrop').addEventListener('click', close);
    drawerEl.querySelector('.cart-drawer__close').addEventListener('click', close);

    // 結帳
    drawerEl.querySelector('.cart-drawer__checkout').addEventListener('click', () => {
      close();
      window.ALU.router.go('b2c/checkout');
    });

    // 委派：刪除按鈕
    drawerEl.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-cart-remove]');
      if (removeBtn) {
        cart.remove(removeBtn.dataset.cartRemove);
      }
    });

    // 監聽 cart 變動 → 自動 render
    store.on('cart', render);
    render(store.get('cart'));

    return drawerEl;
  }

  function render(list) {
    if (!drawerEl) return;
    const { format } = window.ALU;
    const body = drawerEl.querySelector('.cart-drawer__body');
    const countEl = drawerEl.querySelector('.cart-drawer__count');
    const totalEl = drawerEl.querySelector('.cart-drawer__total');
    const checkoutBtn = drawerEl.querySelector('.cart-drawer__checkout');

    countEl.textContent = list.length;
    fabEl.querySelector('.cart-fab__badge').textContent = list.length;
    fabEl.classList.toggle('cart-fab--has-items', list.length > 0);

    if (list.length === 0) {
      body.innerHTML = `
        <div class="cart-drawer__empty">
          <i class="ti ti-shopping-cart-off"></i>
          <p>採購清單還是空的</p>
        </div>
      `;
      totalEl.textContent = 'NT$0';
      checkoutBtn.disabled = true;
      return;
    }

    body.innerHTML = `
      <div class="cart-items">
        ${list.map(item => {
          const lengthText = item.length ? ` · ${item.length} mm` : '';
          return `
            <div class="cart-item">
              <div class="cart-item__info">
                <div class="cart-item__name">${item.productName}</div>
                <div class="cart-item__meta">
                  ${item.series}系列 · ${item.type}${lengthText} · 數量 ${item.qty}
                </div>
              </div>
              <div class="cart-item__right">
                <div class="cart-item__price">${format.money(item.lineTotal)}</div>
                <button class="cart-item__remove" data-cart-remove="${item.id}" aria-label="移除">
                  <i class="ti ti-trash"></i>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ${renderCutPlanSection(list)}
    `;

    totalEl.textContent = format.money(window.ALU.cart.total());
    checkoutBtn.disabled = false;
  }

  // === 切料排版預覽（鋁材有時自動顯示） ===
  function renderCutPlanSection(list) {
    const { cutplan, format, store } = window.ALU;
    const aluItems = list.filter(i => i.type === '鋁材');
    if (aluItems.length === 0) return '';

    const plan = cutplan.planCuts(aluItems);
    if (plan.length === 0) return '';

    // 取 product 表，用 SKU 當 key（為了拿 weightPerM）
    const products = store.get('products') || [];
    const bySKU = {};
    products.forEach(p => { if (p.sku) bySKU[p.sku] = p; });

    const totalKg = cutplan.estimateWeight(plan, bySKU);
    const totalStocks = plan.reduce((sum, g) => sum + g.stockCount, 0);
    const totalKerfMm = plan.reduce((sum, g) => sum + (g.totalKerfMm || 0), 0);

    // 算出全部切割段中最長那段，給物流判斷用
    const maxPieceLengthMm = plan.reduce((max, g) => {
      g.stocks.forEach(s => s.used.forEach(len => { if (len > max) max = len; }));
      return max;
    }, 0);

    const shipping = cutplan.shippingSuggestion(totalKg, maxPieceLengthMm);
    const kerfMm = plan[0]?.kerf || cutplan.DEFAULT_KERF_MM;

    return `
      <div class="cutplan">
        <div class="cutplan__head">
          <i class="ti ti-cpu"></i>
          <span class="cutplan__title">切料排版預覽</span>
          <span class="cutplan__badge">${totalStocks} 支原料 · ${totalKg.toFixed(1)} kg</span>
        </div>
        <div class="cutplan__groups">
          ${plan.map(renderCutPlanGroup).join('')}
        </div>
        <div class="cutplan__meta">
          已含鋸路 ${kerfMm}mm/刀（共 ${(totalKerfMm / 10).toFixed(1)} cm）
          · 最長段 ${maxPieceLengthMm} mm
        </div>
        <div class="cutplan__shipping">
          <i class="ti ${shipping.icon}"></i>
          <div class="cutplan__shipping-text">
            <strong>${shipping.method}</strong>
            <small>${shipping.note}</small>
          </div>
        </div>
      </div>
    `;
  }

  function renderCutPlanGroup(group) {
    const utilPct = Math.round(group.utilization * 100);
    const STOCK = 6000;
    return `
      <div class="cutplan__group">
        <div class="cutplan__group-head">
          <span class="cutplan__group-name">${group.name}</span>
          <span class="cutplan__group-util">${utilPct}% · ${group.stockCount} 支</span>
        </div>
        <div class="cutplan__stocks">
          ${group.stocks.map(stock => `
            <div class="cutplan__stock" title="原料 ${STOCK}mm">
              ${stock.used.map((len, i) => {
                const w = (len / STOCK) * 100;
                const kerfW = (group.kerf / STOCK) * 100;
                return `<div class="cutplan__cut" style="width:${w}%" title="${len}mm">${len}</div>` +
                  (i < stock.used.length - 1 || stock.remaining > 0
                    ? `<div class="cutplan__kerf" style="width:${kerfW}%" title="鋸路 ${group.kerf}mm"></div>`
                    : '');
              }).join('')}
              ${stock.remaining > 0 ? `
                <div class="cutplan__waste" style="width:${(stock.remaining / STOCK) * 100}%" title="餘料 ${stock.remaining}mm">餘 ${stock.remaining}</div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function open() {
    ensure();
    drawerEl.classList.add('cart-drawer--open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!drawerEl) return;
    drawerEl.classList.remove('cart-drawer--open');
    document.body.style.overflow = '';
  }

  function init() {
    ensure();
  }

  global.ALU = global.ALU || {};
  global.ALU.cartDrawer = { open, close, init };

})(window);
