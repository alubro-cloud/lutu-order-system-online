/* =====================================================
   views/products.js — 自家成品
   資料驅動：featured product 全頁詳情 + 其他底部 grid
   未來新增產品：在 PRODUCTS 陣列加物件即可
   ===================================================== */

(function (global) {
  'use strict';

  // === 產品資料（未來加產品在這裡擴展） ===
  const PRODUCTS = [
    {
      id: 'market-cart',
      featured: true,
      status: 'available',
      name: '市集攤車',
      nameEn: 'MARKET CART',
      subtitle: '模組化擺攤工作站',
      description: '鋁擠型框架 + 樺木板。<br>三段式拆解，連 Sienta 都能載走。',
      hero: [
        'assets/shop1.png',
        'assets/shop2.png',
        'assets/shop3.png',
        'assets/shop4.png',
        'assets/shop5.png',
      ],
      assembly: [
        {
          step: '01', title: '下半櫃體', img: 'assets/car1.png',
          desc: '底座搭配 4 顆重型腳輪，結合 7mm 合板貼皮側板，以 M8 螺絲 + 三角連結塊組成穩固底盤，可推可鎖。'
        },
        {
          step: '02', title: '上半櫃體', img: 'assets/car2.png',
          desc: '疊上 18mm 合板貼皮桌面，延續三角連結塊模組化結構，零件全可拆解，工作檯面可外推延伸。'
        },
        {
          step: '03', title: '傘架立起', img: 'assets/car3.png',
          desc: '從櫃頂立起鋁擠型折疊傘架，採用 180° 連接件 (M6 軸心、M8 兩端固定)，關節可旋轉，單手即可撐起。'
        },
        {
          step: '04', title: '完成擺攤', img: 'assets/car4.png',
          desc: '撐開雨棚帆布與側翼桌板，雙翼各 80 cm 對稱遮陽。整套收摺後連 Sienta 都能載走。'
        },
      ],
      specs: [
        { label: '櫃體尺寸',   value: '100 × 70 × 100 cm' },
        { label: '桌板',       value: '18mm 合板 + 貼皮' },
        { label: '側板',       value: '7mm 合板 + 貼皮' },
        { label: '側翼桌板',   value: '70 × 43 cm · 18mm 合板貼皮', gift: true },
        { label: '鋁擠型結構', value: '4040 + 三角連結塊 (M8)' },
        { label: '折疊關節',   value: '180° 連接件 (M6/M8)' },
        { label: '雨棚翼展',   value: '雙翼各 80 cm 對稱' },
        { label: '帆布規格',   value: '250 × 100 cm' },
        { label: '拆解方式',   value: '全模組化 可拆+可折' },
      ],
      pricing: {
        original: 38800,
        current: 28800,
        note: '首發優惠價・自取・含稅<br>配送請洽 LINE',
      },
      lineUrl: 'https://line.me/ti/p/~herald8283',
    },
    {
      id: 'phone-stand',
      featured: false,
      status: 'preview',  // 圖還沒定案
      name: '手機架',
      nameEn: 'PHONE STAND',
      subtitle: '桌上多角度收納',
      description: '鋁擠型 + 配件組合的輕量桌上型手機架。',
      hero: [
        'assets/phone1.png',
        'assets/phone2.png',
        'assets/phone3.png',
      ],
      // 未來補：assembly[], specs[], pricing{}
    },
  ];

  // === Mount ===
  function mount(root) {
    const featured = PRODUCTS.find(p => p.featured) || PRODUCTS[0];
    const others = PRODUCTS.filter(p => p.id !== featured.id);

    root.innerHTML = `
      <div class="products view">
        <div class="products__topbar">
          <div class="products__topbar-left">
            <a class="products__back" href="#/"><i class="ti ti-arrow-left"></i> 返回</a>
            <span class="products__divider">|</span>
            <span class="products__breadcrumb">自家成品 / PRODUCTS</span>
          </div>
          <div class="products__topbar-right">ALUMIBRO</div>
        </div>

        ${renderFeatured(featured)}

        ${others.length > 0 ? renderOthers(others) : ''}
      </div>
    `;

    bindEvents(root, featured);
  }

  // === 主秀：攤車詳情頁 ===
  function renderFeatured(p) {
    return `
      <div class="products__main">
        <div class="products__left">
          <div class="products__section-title">ASSEMBLY · 組裝步驟</div>
          <div class="assembly-grid">
            ${(p.assembly || []).map(renderAssemblyCard).join('')}
          </div>
        </div>

        <div class="products__right">
          <div class="products__info-row">
            <div class="products__text-col">
              <div class="products__info-header">
                <div class="products__tagline">ALUMIBRO PRODUCTS</div>
                <h2 class="products__name">${p.name}</h2>
                <div class="products__subname">${p.nameEn}${p.subtitle ? ` · ${p.subtitle}` : ''}</div>
              </div>
              <div class="products__description">${p.description || ''}</div>
              ${renderSpecs(p.specs)}
            </div>

            <div class="products__hero-col">
              ${renderHero(p.hero, p.name)}
            </div>
          </div>

          ${renderPricing(p)}
        </div>
      </div>
    `;
  }

  function renderAssemblyCard(a) {
    return `
      <div class="assembly-card">
        <div class="assembly-img-wrap">
          <span class="assembly-step-badge">${a.step}</span>
          <img src="${a.img}" alt="${a.title}" loading="lazy"
               onerror="window.ALU.imgFail(this)" class="assembly-img">
        </div>
        <div class="assembly-text">
          <div class="assembly-title">${a.title}</div>
          <div class="assembly-desc">${a.desc}</div>
        </div>
      </div>
    `;
  }

  function renderSpecs(specs) {
    if (!specs || specs.length === 0) return '';
    return `
      <div class="products__specs">
        <div class="products__specs-title">SPECS</div>
        <div class="products__specs-grid">
          ${specs.map(s => `
            <div class="spec-item${s.gift ? ' spec-item--gift' : ''}">
              <div class="spec-label">
                ${s.label}${s.gift ? ' <span class="spec-gift-tag">贈</span>' : ''}
              </div>
              <div class="spec-value">${s.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderHero(images, alt) {
    const list = (images || []).filter(Boolean);
    if (list.length === 0) {
      return `
        <div class="products__hero-wrap products__hero-wrap--empty">
          <i class="ti ti-photo"></i>
        </div>
      `;
    }
    return `
      <div class="products__hero-wrap">
        <img src="${list[0]}" alt="${alt}"
             id="products-hero-img" data-index="0"
             onerror="window.ALU.imgFail(this)"
             class="products__hero-img">
      </div>
      ${list.length > 1 ? `
        <div class="products__hero-nav">
          <button class="products__hero-btn" data-hero-step="-1" aria-label="上一張"><i class="ti ti-chevron-left"></i></button>
          <div class="products__hero-counter"><span id="products-hero-idx">1</span> / ${list.length}</div>
          <button class="products__hero-btn" data-hero-step="1" aria-label="下一張"><i class="ti ti-chevron-right"></i></button>
        </div>
      ` : ''}
    `;
  }

  function renderPricing(p) {
    if (!p.pricing) return '';
    const { format } = window.ALU;
    return `
      <div class="products__price-cta">
        <div class="products__price-block">
          ${p.pricing.original ? `<div class="products__price-original">${format.money(p.pricing.original)}</div>` : ''}
          <div class="products__price-amount">${format.money(p.pricing.current)}</div>
          ${p.pricing.note ? `<div class="products__price-note">${p.pricing.note}</div>` : ''}
        </div>
        <a href="${p.lineUrl || '#'}" target="_blank" rel="noopener" class="products__cta-line">
          <i class="ti ti-message-circle"></i> LINE 詢問下單
        </a>
      </div>
    `;
  }

  // === 其他產品 grid ===
  function renderOthers(products) {
    return `
      <div class="products__others">
        <div class="products__others-title">其他自家成品</div>
        <div class="products__others-grid">
          ${products.map(renderOtherCard).join('')}
        </div>
      </div>
    `;
  }

  function renderOtherCard(p) {
    const cover = (p.hero && p.hero[0]) || '';
    const statusLabel =
      p.status === 'preview'    ? '預覽中' :
      p.status === 'coming-soon' ? '即將上架' :
      '';
    return `
      <article class="other-card" data-product-id="${p.id}">
        <div class="other-card__media">
          ${cover
            ? `<img src="${cover}" alt="${p.name}" loading="lazy" onerror="window.ALU.imgFail(this)">`
            : `<div class="product-card__no-image"><i class="ti ti-photo"></i></div>`
          }
          ${statusLabel ? `<span class="other-card__status">${statusLabel}</span>` : ''}
        </div>
        <div class="other-card__body">
          <div class="other-card__name">${p.name}</div>
          <div class="other-card__subname">${p.nameEn}${p.subtitle ? ` · ${p.subtitle}` : ''}</div>
          ${p.description ? `<div class="other-card__desc">${p.description}</div>` : ''}
        </div>
      </article>
    `;
  }

  // === 事件 ===
  function bindEvents(root, featured) {
    const { lightbox } = window.ALU;

    // 大圖切換
    const heroBtns = root.querySelectorAll('[data-hero-step]');
    heroBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const step = Number(btn.dataset.heroStep);
        const img = root.querySelector('#products-hero-img');
        const idxEl = root.querySelector('#products-hero-idx');
        if (!img || !idxEl) return;
        const list = featured.hero || [];
        let idx = Number(img.dataset.index) || 0;
        idx = (idx + step + list.length) % list.length;
        img.src = list[idx];
        img.dataset.index = idx;
        idxEl.textContent = idx + 1;
      });
    });

    // 點 hero 大圖 → 開 lightbox
    const heroImg = root.querySelector('#products-hero-img');
    if (heroImg && lightbox) {
      heroImg.style.cursor = 'zoom-in';
      heroImg.addEventListener('click', () => {
        lightbox.open({ img2d: heroImg.src, caption: featured.name });
      });
    }

    // 點 assembly 圖 → 開 lightbox
    root.querySelectorAll('.assembly-img-wrap').forEach((wrap, idx) => {
      const item = (featured.assembly || [])[idx];
      if (!item || !lightbox) return;
      wrap.style.cursor = 'zoom-in';
      wrap.addEventListener('click', () => {
        lightbox.open({
          img2d: item.img,
          caption: `${item.step} · ${item.title}`,
        });
      });
    });

    // 其他產品卡片：目前只 toast 提示，未來支援切換 featured
    root.querySelectorAll('.other-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.productId;
        const p = PRODUCTS.find(x => x.id === id);
        if (!p) return;
        if (p.status === 'preview' || p.status === 'coming-soon') {
          window.ALU.toast.show(`${p.name} 還在準備中，敬請期待！或先 LINE 諮詢`);
        }
      });
    });
  }

  global.ALU = global.ALU || {};
  global.ALU.views = global.ALU.views || {};
  global.ALU.views.mountProducts = mount;

})(window);
