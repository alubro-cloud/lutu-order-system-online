/* =====================================================
   views/orders.js — 訂單查詢
   依電話搜尋客戶訂單
   ===================================================== */

(function (global) {
  'use strict';

  function mount(root) {
    root.innerHTML = `
      <div class="orders view">
        <div class="orders__header">
          <a class="orders__back" href="#/"><i class="ti ti-arrow-left"></i> 返回首頁</a>
          <h2 class="orders__title">訂單查詢</h2>
        </div>

        <div class="orders__search">
          <div class="orders__search-card">
            <div class="orders__search-label">
              <i class="ti ti-search"></i> 輸入您下單時填的電話
            </div>
            <div class="orders__search-row">
              <input type="tel" id="orders-input"
                     placeholder="例：0912-345-678"
                     autocomplete="tel">
              <button id="orders-btn" class="orders__btn">
                <i class="ti ti-search"></i> 查詢
              </button>
            </div>
            <div class="orders__hint">
              <i class="ti ti-info-circle"></i>
              我們會列出與此電話相符的所有訂單
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
      const phone = input.value.trim().replace(/\D/g, '');  // 去除非數字
      if (!phone || phone.length < 6) {
        window.ALU.toast.show('請輸入有效的電話號碼');
        return;
      }

      results.innerHTML = `
        <div class="orders__loading">
          <i class="ti ti-loader"></i> 查詢中…
        </div>
      `;

      try {
        const list = await window.ALU.api.getOrders();
        const matched = list.filter(o => {
          // 支援多種欄位名
          const p = String(
            o.customer?.phone || o['電話'] || o.phone || ''
          ).replace(/\D/g, '');
          return p && p.includes(phone);
        });
        renderResults(matched, results);
      } catch (e) {
        console.error(e);
        results.innerHTML = `
          <div class="orders__empty">
            <i class="ti ti-alert-circle"></i>
            <p>查詢失敗，請稍後再試</p>
          </div>
        `;
      }
    }

    btn.addEventListener('click', search);
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') search();
    });

    // 離線模式提示
    if (window.ALU.api.IS_OFFLINE) {
      results.innerHTML = `
        <div class="orders__empty">
          <i class="ti ti-plug-off"></i>
          <p>目前為離線示範模式，無法查詢真實訂單</p>
          <small>請改用 http server 開啟以連到後台</small>
        </div>
      `;
    }
  }

  function renderResults(orders, container) {
    const { format } = window.ALU;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="orders__empty">
          <i class="ti ti-package-off"></i>
          <p>沒有找到對應的訂單</p>
          <small>請確認電話是否正確</small>
        </div>
      `;
      return;
    }

    // 依日期遞減排序
    orders.sort((a, b) => {
      const da = new Date(a.timestamp || a['下單時間'] || 0);
      const db = new Date(b.timestamp || b['下單時間'] || 0);
      return db - da;
    });

    container.innerHTML = `
      <div class="orders__count">查到 ${orders.length} 筆訂單</div>
      <div class="orders__list">
        ${orders.map(renderOrderCard).join('')}
      </div>
    `;

    // 展開/收合
    container.addEventListener('click', e => {
      const head = e.target.closest('[data-toggle]');
      if (!head) return;
      const card = head.closest('.order-card');
      card.classList.toggle('order-card--expanded');
    });
  }

  function renderOrderCard(o) {
    const { format } = window.ALU;
    const customer = o.customer || o;
    const items = o.items || o['品項'] || [];
    const name = customer.name || customer['姓名'] || '—';
    const phone = customer.phone || customer['電話'] || '—';
    const address = customer.address || customer['地址'] || '';
    const delivery = customer.delivery || customer['配送方式'] || '';
    const total = Number(o.totalEst || o.total || o['總額'] || 0);
    const shipFee = Number(o.shippingFee || o['運費'] || 0);
    const status = o.status || o['狀態'] || '處理中';
    const orderId = o.id || o.orderId || o['訂單編號'] || '';
    const date = formatDate(o.timestamp || o['下單時間']);
    const note = o.note || customer.note || o['備註'] || '';

    const statusCls = getStatusClass(status);

    return `
      <div class="order-card">
        <div class="order-card__head" data-toggle>
          <div class="order-card__head-left">
            <div class="order-card__id">${orderId || '—'}</div>
            <div class="order-card__date">${date}</div>
          </div>
          <div class="order-card__head-right">
            <div class="order-card__total">${format.money(total)}</div>
            <span class="order-status ${statusCls}">${status}</span>
            <i class="ti ti-chevron-down order-card__chevron"></i>
          </div>
        </div>
        <div class="order-card__detail">
          <div class="order-card__row">
            <span class="order-card__label">客戶</span>
            <span>${name} · ${phone}</span>
          </div>
          ${delivery ? `
            <div class="order-card__row">
              <span class="order-card__label">配送</span>
              <span>${delivery}${address ? ` · ${address}` : ''}</span>
            </div>
          ` : ''}
          <div class="order-card__items">
            ${items.length > 0 ? items.map(item => `
              <div class="order-item">
                <div class="order-item__name">${item.productName || item['名稱'] || item.name || '—'}</div>
                <div class="order-item__meta">
                  ${item.length ? `${item.length} mm × ` : ''}${item.qty || item['數量'] || 1}
                </div>
                <div class="order-item__price">${format.money(item.lineTotal || item['小計'] || 0)}</div>
              </div>
            `).join('') : '<div class="order-item__empty">—</div>'}
          </div>
          <div class="order-card__totals">
            ${shipFee > 0 ? `
              <div class="order-card__row order-card__row--sub">
                <span>運費</span><span>${format.money(shipFee)}</span>
              </div>
            ` : ''}
            <div class="order-card__row order-card__row--final">
              <span>總額</span><strong>${format.money(total)}</strong>
            </div>
          </div>
          ${note ? `
            <div class="order-card__note">
              <span class="order-card__label">備註</span>
              <span>${note}</span>
            </div>
          ` : ''}
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

  function getStatusClass(status) {
    const s = String(status).toLowerCase();
    if (s.includes('完成') || s.includes('complete')) return 'order-status--done';
    if (s.includes('出貨') || s.includes('shipped')) return 'order-status--shipped';
    if (s.includes('取消') || s.includes('cancel')) return 'order-status--cancel';
    if (s.includes('確認') || s.includes('confirm')) return 'order-status--confirmed';
    return 'order-status--pending';
  }

  global.ALU = global.ALU || {};
  global.ALU.views = global.ALU.views || {};
  global.ALU.views.mountOrders = mount;

})(window);
