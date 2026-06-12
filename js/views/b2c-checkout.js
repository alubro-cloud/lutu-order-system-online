/* =====================================================
   views/b2c-checkout.js — 結帳表單
   payload 結構對齊 v1 admin 後台，零改動接收
   ===================================================== */

(function (global) {
  'use strict';

  function mount(root) {
    const { store } = window.ALU;
    const list = store.get('cart') || [];

    if (list.length === 0) {
      root.innerHTML = `
        <div class="checkout view checkout--empty">
          <div class="placeholder__icon"><i class="ti ti-shopping-cart-off"></i></div>
          <div class="placeholder__title">採購清單還是空的</div>
          <div class="placeholder__desc">先選一些商品再來結帳</div>
          <a class="placeholder__back" href="#/b2c"><i class="ti ti-arrow-left"></i> 回商品列表</a>
        </div>
      `;
      return;
    }
    root.innerHTML = renderForm(list);
    bindEvents(root);
  }

  function renderForm(list) {
    const { format, cart, api } = window.ALU;
    const subtotal = cart.total();
    const offlineBanner = api.IS_OFFLINE ? `
      <div class="checkout__offline-banner">
        <i class="ti ti-plug-off"></i>
        <div>
          <strong>file:// 開啟模式</strong>
          <small>
            商品列表為內建示範資料；
            <span style="color: rgb(120, 200, 160);">送單會嘗試到後台</span>，
            可正常測試（請填真實資料或註明「測試」）
          </small>
        </div>
      </div>
    ` : '';
    return `
      <div class="checkout view">
        <div class="checkout__header">
          <a class="checkout__back" href="#/b2c"><i class="ti ti-arrow-left"></i> 繼續挑選</a>
          <h2 class="checkout__title">結帳</h2>
        </div>

        ${offlineBanner}

        <div class="checkout__layout">
          <form class="checkout__form" id="checkout-form">
            <fieldset class="form-section">
              <legend>聯絡資訊</legend>
              <div class="form-row">
                <label>姓名 <span class="required">*</span></label>
                <input type="text" name="name" required autocomplete="name">
              </div>
              <div class="form-row">
                <label>聯絡電話 <span class="required">*</span></label>
                <input type="tel" name="phone" required placeholder="0912-345-678" autocomplete="tel">
              </div>
              <div class="form-row">
                <label>Email <span class="required">*</span></label>
                <input type="email" name="email" required placeholder="收報價單與訂單通知" autocomplete="email">
              </div>
            </fieldset>

            <fieldset class="form-section">
              <legend>配送方式 <span class="required">*</span></legend>
              <div class="form-options form-options--cards">
                <label class="form-option-card">
                  <input type="radio" name="delivery" value="小貨車配送" checked>
                  <i class="ti ti-truck-delivery"></i>
                  <div>
                    <strong>小貨車配送</strong>
                    <small>段長 ≤ 2.5m · 待報價</small>
                  </div>
                </label>
                <label class="form-option-card">
                  <input type="radio" name="delivery" value="大貨車配送">
                  <i class="ti ti-truck-loading"></i>
                  <div>
                    <strong>大貨車配送</strong>
                    <small>段長 > 2.5m 或量大 · 待報價</small>
                  </div>
                </label>
                <label class="form-option-card">
                  <input type="radio" name="delivery" value="公司自取">
                  <i class="ti ti-building-warehouse"></i>
                  <div>
                    <strong>公司自取</strong>
                    <small>免運 · 台中大里</small>
                  </div>
                </label>
              </div>
              <div class="form-row form-row--address">
                <label>配送地址 <span class="required">*</span></label>
                <input type="text" name="address" placeholder="完整地址（含郵遞區號）">
              </div>
            </fieldset>

            <fieldset class="form-section">
              <legend>企業資訊（選填）</legend>
              <div class="form-row">
                <label>公司 / 單位名稱</label>
                <input type="text" name="company" placeholder="例：某某科技 / 台大機械系">
              </div>
              <div class="form-row">
                <label>統一編號</label>
                <input type="text" name="taxId" pattern="[0-9]{8}" maxlength="8" placeholder="8 碼數字（供開立發票）">
              </div>
            </fieldset>

            <fieldset class="form-section">
              <legend>備註（選填）</legend>
              <textarea name="note" rows="3" placeholder="特殊需求、希望到貨日期等"></textarea>
            </fieldset>

            <button type="submit" class="checkout__submit">
              <i class="ti ti-send"></i> 送出訂單
            </button>
          </form>

          <aside class="checkout__summary">
            <h3>訂單明細（${list.length} 項）</h3>
            <div class="checkout__items">
              ${list.map(renderItem).join('')}
            </div>
            <div class="checkout__totals">
              <div class="checkout__total-row">
                <span>商品小計</span>
                <strong>${format.money(subtotal)}</strong>
              </div>
              <div class="checkout__total-row">
                <span>運費</span>
                <strong id="ship-fee">待報價</strong>
              </div>
              <div class="checkout__total-row checkout__total-row--final">
                <span>預估金額</span>
                <strong id="total-final">${format.money(subtotal)}</strong>
              </div>
              <div class="checkout__shipping-note" id="ship-note">
                <i class="ti ti-info-circle"></i>
                配送單實際運費由我們評估後寄報價單給您確認
              </div>
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  function renderItem(item) {
    const { format } = window.ALU;
    const lenText = item.length ? ` · ${item.length} mm` : '';
    return `
      <div class="checkout__item">
        <div>
          <div class="checkout__item-name">${item.productName}</div>
          <div class="checkout__item-meta">${item.series}系列${lenText} × ${item.qty}</div>
        </div>
        <strong>${format.money(item.lineTotal)}</strong>
      </div>
    `;
  }

  function bindEvents(root) {
    const { cart, format, api, router, toast, store } = window.ALU;
    const form = root.querySelector('#checkout-form');

    // 配送方式變更 → 切換地址顯示 + 運費文字
    function applyDeliveryState() {
      const val = form.querySelector('input[name="delivery"]:checked').value;
      const isSelf = val === '公司自取';
      const addrRow = form.querySelector('.form-row--address');
      const addrInput = addrRow.querySelector('input');
      addrRow.style.display = isSelf ? 'none' : '';
      addrInput.required = !isSelf;
      const shipFeeEl = root.querySelector('#ship-fee');
      const noteEl = root.querySelector('#ship-note');
      if (isSelf) {
        shipFeeEl.textContent = '免運';
        noteEl.style.display = 'none';
      } else {
        shipFeeEl.textContent = '待報價';
        noteEl.style.display = '';
      }
    }
    form.addEventListener('change', (e) => {
      if (e.target.name === 'delivery') applyDeliveryState();
    });
    applyDeliveryState();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const delivery = fd.get('delivery');
      const isSelf = delivery === '公司自取';
      const company = (fd.get('company') || '').trim();
      const taxId = (fd.get('taxId') || '').trim();
      const userNote = (fd.get('note') || '').trim();
      const rawAddress = (fd.get('address') || '').trim();

      // 統編格式驗證（如有填）
      if (taxId && !/^\d{8}$/.test(taxId)) {
        toast.show('統一編號必須是 8 碼數字');
        return;
      }

      // === 對齊 v1 admin 邏輯 ===
      // 1. address 加前綴：v1 admin 用這個 parse 配送流程
      const addrPrefix = isSelf ? '[自取] ' : '[公司配送] ';
      const finalAddress = isSelf
        ? '[自取] 台中大里廠房（公司自取）'
        : addrPrefix + rawAddress;

      // 2. items 欄位對齊 v1 cart 結構：
      //    - name 含 [SKU] 後綴（admin parse 用）
      //    - len 用「cm」(mm÷10)（v1 GAS 後端認 len，admin 看 L=XXcm）
      //    - 不送 lineTotal（讓 GAS 自己算，避免 NaN 寫入）
      const items = (store.get('cart') || []).map(item => {
        const baseName = String(item.productName || '').replace(/\s*\[[^\]]+\]\s*$/, '');
        const finalName = item.sku ? `${baseName} [${item.sku}]` : baseName;
        return {
          id: item.id,
          name: finalName,
          series: item.series,
          type: item.type,
          sku: item.sku || '',
          len: item.length ? Number(item.length) / 10 : 0,   // mm → cm
          qty: Number(item.qty) || 1,
          price: Number(item.price) || 0,
          unit: item.unit || (item.type === '鋁材' ? 'cm' : '個'),
        };
      });

      // 3. note 標籤式組裝
      //    admin 用 template literal 注入（line 2934），等同 innerHTML
      //    所以用 <br> 而非 \n 才會生效（v1 admin code 自己也用 <br>）
      const BR = '<br>';
      const noteParts = [];
      const corpLines = [];
      if (company) corpLines.push(`【公司】${company}`);
      if (taxId)   corpLines.push(`【統編】${taxId}`);
      if (corpLines.length) noteParts.push(corpLines.join(BR));
      if (userNote) {
        const safeUserNote = userNote.replace(/\n/g, BR);
        noteParts.push(`【客戶留言】${BR}${safeUserNote}`);
      }
      const finalNote = noteParts.join(BR + BR);

      // 4. 運費 = 0（admin 報價後再填）
      const subtotal = cart.total();
      const shipFee = 0;

      const payload = {
        customer: {
          name: fd.get('name').trim(),
          phone: fd.get('phone').trim(),
          email: fd.get('email').trim(),
          address: finalAddress,
          delivery: delivery,
          company: company,
          note: finalNote,
        },
        items: items,
        totalEst: subtotal + shipFee,
        shippingFee: shipFee,
        timestamp: new Date().toISOString(),
        source: 'v2-b2c',
      };

      const submitBtn = form.querySelector('.checkout__submit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="ti ti-loader"></i> 送出中…';

      try {
        await api.submitOrder(payload);
        cart.clear();
        toast.show('✓ 訂單已送出！我們會在 1 個工作天內聯絡您', 5000);
        setTimeout(() => router.go('hub'), 2000);
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ti ti-send"></i> 送出訂單';
        toast.show('送出失敗，請稍後再試或直接 LINE 聯絡', 4000);
        console.error(err);
      }
    });
  }

  global.ALU = global.ALU || {};
  global.ALU.views = global.ALU.views || {};
  global.ALU.views.mountB2CCheckout = mount;

})(window);
