/* =====================================================
   views/orders.js — 訂單查詢
   對齊 v1 後台 ?action=queryOrder&phone=xxx
   回傳每筆：{ timestamp, status, summary, details, delivery, total }
   ===================================================== */

(function (global) {
  'use strict';

  // v1 後台 status → 顯示文字 + class
  const STATUS_MAP = {
    unquoted:   { text: '待報價 / 處理中', cls: 'order-status--pending' },
    quoted:     { text: '已報價（請收信）', cls: 'order-status--confirmed' },
    paid:       { text: '已付款 / 確認',    cls: 'order-status--confirmed' },
    shipping:   { text: '待出貨',          cls: 'order-status--shipped' },
    dispatched: { text: '已出貨',          cls: 'order-status--shipped' },
    completed:  { text: '已完成',          cls: 'order-status--done' },
    cancelled:  { text: '已取消',          cls: 'order-status--cancel' },
  };

  function mount(root) {
    root.innerHTML = `
      <div class="orders view">
        <div class="orders__header">
          <h2 class="orders__title">訂單查詢</h2>
          <p class="orders__subtitle">輸入下單時填寫的電話，查詢最近的訂單與處理進度</p>
        </div>

        <div class="orders__search">
          <div class="orders__search-card">
            <div class="orders__search-label">
              <i class="ti ti-search"></i> 輸入您下單時填的電話
            </div>
            <div class="orders__search-row">
              <input type="tel" id="orders-input"
                     placeholder="例：0912345678"
                     autocomplete="tel">
              <button id="orders-btn" class="orders__btn">
                <i class="ti ti-search"></i> 查詢
              </button>
            </div>
            <div class="orders__hint">
              <i class="ti ti-info-circle"></i>
              僅顯示最近 5 筆訂單
            </div>
          </div>
        </div>

        <div class="orders__results" id="orders-results"></div>
      </div>
    `;

    const input = root.querySelector('#orders-input');
    const btn = root.querySelector('#orders-btn');
    const results = root.querySelector('#orders-results');

    async function search() {
      const phone = input.value.trim();
      if (!phone || phone.replace(/\D/g, '').length < 6) {
        window.ALU.toast.show('請輸入有效的電話號碼');
        return;
      }

      results.innerHTML = `
        <div class="orders__loading">
          <i class="ti ti-loader"></i> 查詢中…
        </div>
      `;

      const resp = await window.ALU.api.queryOrder(phone);

      if (resp.status !== 'success') {
        results.innerHTML = `
          <div class="orders__empty">
            <i class="ti ti-alert-circle"></i>
            <p>${resp.message || '查詢失敗，請稍後再試'}</p>
          </div>
        `;
        return;
      }
      renderResults(resp.orders, results);
    }

    btn.addEventListener('click', search);
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') search();
    });

    if (window.ALU.api.IS_OFFLINE) {
      results.innerHTML = `
        <div class="orders__offline-note">
          <i class="ti ti-plug-off"></i>
          目前為 file:// 離線示範模式，查詢會回傳一筆示範訂單。
          上線後（GitHub Pages）會連到真實後台。
        </div>
      `;
    }
  }

  function renderResults(orders, container) {
    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="orders__empty">
          <i class="ti ti-package-off"></i>
          <p>查無資料</p>
          <small>請確認電話是否與下單時相同（僅顯示最近 5 筆）</small>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="orders__count">查到 ${orders.length} 筆訂單</div>
      <div class="orders__list">
        ${orders.map(renderOrderCard).join('')}
      </div>
    `;

    container.querySelectorAll('[data-toggle]').forEach(head => {
      head.addEventListener('click', () => {
        head.closest('.order-card').classList.toggle('order-card--expanded');
      });
    });
  }

  function renderOrderCard(o) {
    const { format } = window.ALU;
    const st = STATUS_MAP[o.status] || { text: o.status || '處理中', cls: 'order-status--pending' };
    const date = formatDate(o.timestamp);
    const total = Number(o.total) || 0;
    const summary = o.summary || '—';
    const details = o.details || '';
    const delivery = o.delivery || '';

    // details 用 \n 分行 → 轉成 list
    const detailLines = String(details).split(/\n|<br\s*\/?>/i).map(s => s.trim()).filter(Boolean);

    return `
      <div class="order-card">
        <div class="order-card__head" data-toggle>
          <div class="order-card__head-left">
            <div class="order-card__date">${date}</div>
            <div class="order-card__summary">${summary}</div>
          </div>
          <div class="order-card__head-right">
            <div class="order-card__total">${format.money(total)}</div>
            <span class="order-status ${st.cls}">${st.text}</span>
            <i class="ti ti-chevron-down order-card__chevron"></i>
          </div>
        </div>
        <div class="order-card__detail">
          ${delivery ? `
            <div class="order-card__row">
              <span class="order-card__label">配送方式</span>
              <span>${delivery}</span>
            </div>
          ` : ''}
          <div class="order-card__items-label">訂購明細</div>
          <div class="order-card__items">
            ${detailLines.length > 0
              ? detailLines.map(line => `<div class="order-detail-line">${line}</div>`).join('')
              : '<div class="order-item__empty">無明細資料</div>'}
          </div>
          <div class="order-card__row order-card__row--final">
            <span>訂單總額</span><strong>${format.money(total)}</strong>
          </div>
        </div>
      </div>
    `;
  }

  function formatDate(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    if (isNaN(d)) return String(ts).slice(0, 16);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}/${m}/${day} ${hh}:${mm}`;
  }

  global.ALU = global.ALU || {};
  global.ALU.views = global.ALU.views || {};
  global.ALU.views.mountOrders = mount;

})(window);
