/* =====================================================
   views/products.js — 自家成品
   資料驅動：featured product 全頁詳情 + 其他底部 grid
   未來新增產品：在 PRODUCTS 陣列加物件即可
   ===================================================== */

(function (global) {
  'use strict';

  // === 智能圖片探測 ===
  // 不寫死副檔名：依序試 jpg/png/webp，抓得到才回傳，全部抓不到回 null
  const IMG_EXTS = ['jpg', 'jpeg', 'png', 'webp'];
  function resolveOne(base) {
    return new Promise(resolve => {
      if (!base) { resolve(null); return; }
      if (/\.(jpe?g|png|webp|gif|avif)$/i.test(base)) {
        const im = new Image();
        im.onload = () => resolve(base);
        im.onerror = () => resolve(null);
        im.src = base;
        return;
      }
      let i = 0;
      const next = () => {
        if (i >= IMG_EXTS.length) { resolve(null); return; }
        const url = `${base}.${IMG_EXTS[i++]}`;
        const im = new Image();
        im.onload = () => resolve(url);
        im.onerror = next;
        im.src = url;
      };
      next();
    });
  }
  // 連號探測：prefix + 1..max，缺號自動跳過、數量自適應
  async function resolveSeries(prefix, max = 10) {
    if (!prefix) return [];
    const bases = Array.from({ length: max }, (_, i) => `${prefix}${i + 1}`);
    const urls = await Promise.all(bases.map(resolveOne));
    return urls.filter(Boolean);
  }
  // 明確清單探測（去副檔名亦可）
  async function resolveList(bases) {
    const urls = await Promise.all((bases || []).map(resolveOne));
    return urls.filter(Boolean);
  }

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
      gallery: 'assets/shop',
      assembly: [
        {
          step: '01', title: '下半櫃體', img: 'assets/car1',
          desc: '底座搭配 4 顆重型腳輪，結合 7mm 合板側板，以 M8 螺絲 + 三角連結塊組成穩固底盤，可推可鎖。'
        },
        {
          step: '02', title: '上半櫃體', img: 'assets/car2',
          desc: '疊上 18mm 合板桌面，延續三角連結塊模組化結構，零件全可拆解，工作檯面可外推延伸。'
        },
        {
          step: '03', title: '傘架立起', img: 'assets/car3',
          desc: '從櫃頂立起鋁擠型折疊傘架，採用 180° 連接件 (M6 軸心、M8 兩端固定)，關節可旋轉，單手即可撐起。'
        },
        {
          step: '04', title: '完成擺攤', img: 'assets/car4',
          desc: '撐開雨棚帆布與側翼桌板，雙翼各 80 cm 對稱遮陽。整套收摺後連 Sienta 都能載走。'
        },
      ],
      specs: [
        { group: '櫃體', items: [
          { label: '櫃體尺寸', value: '100 × 70 × 100 cm' },
          { label: '桌板 / 底板', value: '18mm 合板 ×2' },
          { label: '側板',     value: '7mm 合板' },
          { label: '側翼桌板', value: '70 × 43 cm · 18mm 合板', gift: true },
        ]},
        { group: '機構', items: [
          { label: '鋁擠型結構', value: '4040 + 三角連結塊 (M8)' },
          { label: '折疊關節',   value: '180° 連接件 (M6/M8)' },
          { label: '拆解方式',   value: '全模組化 可拆+可折' },
        ]},
        { group: '雨棚', items: [
          { label: '雨棚翼展', value: '雙翼各 80 cm 對稱' },
          { label: '帆布規格', value: '250 × 100 cm' },
        ]},
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
      status: 'available',
      name: '鋁製手機架',
      nameEn: 'PHONE STAND',
      subtitle: 'DIY 組裝套件',
      description: '2020 鋁擠型 DIY 套件・零件與工具全附。<br>跟著 5 步驟鎖一鎖，桌上型手機架輕鬆完成。',
      gallery: 'assets/phone-kit',
      assembly: [
        {
          step: '01', title: '組裝橫向底座', img: 'assets/phone-s1',
          desc: '取 2020 鋁材組成橫向底座，兩端壓上端蓋，以 M4 螺絲＋螺母先輕鎖固定。'
        },
        {
          step: '02', title: '組裝直向底座', img: 'assets/phone-s2',
          desc: '立起直向鋁材，用三角連結塊與底座接合；組裝時先固定螺絲、暫不鎖死，方便後續微調。'
        },
        {
          step: '03', title: '組裝支撐', img: 'assets/phone-s3',
          desc: '加上支撐臂，以三角連結塊撐出手機架的傾斜角度。'
        },
        {
          step: '04', title: '組裝上橫樑', img: 'assets/phone-s4',
          desc: '裝上最上方橫樑（承放手機的那一段），確認方向與位置。'
        },
        {
          step: '05', title: '組裝完成', img: 'assets/phone-s5',
          desc: '完成後再微調角度，並確認所有螺絲都鎖緊，即可使用。'
        },
      ],
      specs: [
        { group: '整包內含', wide: true, items: [
          { label: '2020 鋁材（60mm）', value: '× 4' },
          { label: '三角連結塊',       value: '× 5' },
          { label: '端蓋',             value: '× 5' },
          { label: 'M4 螺絲',          value: '× 12' },
          { label: 'M4 螺母',          value: '× 12' },
          { label: 'M4 墊片',          value: '× 10' },
        ]},
        { group: '附贈工具', items: [
          { label: 'M4 六角板手', value: '× 1', gift: true },
        ]},
      ],
      pricing: {
        original: 250,
        current: 200,
        note: '特價・整包零件與工具全附<br>自取・含稅・配送請洽 LINE',
      },
      lineUrl: 'https://line.me/ti/p/~herald8283',
    },
  ];

  let currentId = null;

  // === Mount ===
  function mount(root) {
    const def = PRODUCTS.find(p => p.featured) || PRODUCTS[0];
    renderPage(root, def.id);
  }

  async function renderPage(root, selectedId) {
    currentId = selectedId;
    const selected = PRODUCTS.find(p => p.id === selectedId) || PRODUCTS[0];
    const others = PRODUCTS.filter(p => p.id !== selected.id);

    // 智能解析：輪播圖（連號探測）＋ 組裝圖（去副檔名探測）
    const [heroList, assemblyResolved] = await Promise.all([
      selected.gallery ? resolveSeries(selected.gallery) : resolveList(selected.hero || []),
      Promise.all((selected.assembly || []).map(async a => ({ ...a, img: await resolveOne(a.img) }))),
    ]);

    // 切換太快時，丟棄過期的結果
    if (currentId !== selectedId) return;

    const view = { ...selected, hero: heroList, assembly: assemblyResolved };

    root.innerHTML = `
      <div class="products products--muji view">
        ${renderFeatured(view, others)}
      </div>
    `;

    bindEvents(root, view);
    mountTopbarSwitch(root, selectedId);
  }

  // === 產品切換：填進頂欄 #topbar-nav（多個可販售產品時才出現）===
  function mountTopbarSwitch(root, selectedId) {
    const nav = document.getElementById('topbar-nav');
    if (!nav) return;
    const sellable = PRODUCTS.filter(p => p.status === 'available');
    if (sellable.length < 2) { nav.innerHTML = ''; return; }
    nav.innerHTML = `
      <div class="topbar-switch">
        ${sellable.map(p => `
          <button class="topbar-switch__btn${p.id === selectedId ? ' is-active' : ''}" data-switch="${p.id}">${p.name}</button>
        `).join('')}
      </div>
    `;
    nav.querySelectorAll('[data-switch]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.switch;
        if (id !== currentId) {
          renderPage(root, id);
          root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // === 主秀：攤車詳情頁（無印風 B1）===
  function renderFeatured(p, others) {
    // 下方「其他自家成品」只列「準備中」的（可販售的已在上方切換，不重複）
    const upcoming = (others || []).filter(o => o.status !== 'available');
    return `
      <div class="products__main">
        <div class="products__left">
          <div class="products__hero">
            ${renderHero(p.hero, p.name)}
          </div>
        </div>

        <div class="products__right">
          <div class="products__header-row">
            <div class="products__header">
              <div class="products__tagline">ALUMIBRO PRODUCTS</div>
              <h2 class="products__name">${p.name}</h2>
              <div class="products__subname">${p.nameEn}${p.subtitle ? ` · ${p.subtitle}` : ''}</div>
              <div class="products__description">${p.description || ''}</div>
            </div>

            <div class="products__assembly">
              <div class="products__assembly-label">ASSEMBLY · 點縮圖看細節</div>
              <div class="assembly-grid assembly-grid--${(p.assembly || []).length}">
                ${(p.assembly || []).map(renderAssemblyCard).join('')}
              </div>
            </div>
          </div>

          ${renderSpecs(p.specs)}

          ${renderPricing(p)}
        </div>
      </div>

      ${upcoming.length > 0 ? renderOthers(upcoming) : ''}
    `;
  }

  function renderAssemblyCard(a) {
    return `
      <div class="assembly-card" role="button" tabindex="0">
        <div class="assembly-img-wrap">
          <span class="assembly-step-badge">${a.step}</span>
          ${a.img
            ? `<img src="${a.img}" alt="${a.title}" loading="lazy"
                   onerror="window.ALU.imgFail(this)" class="assembly-img">`
            : `<div class="assembly-img assembly-img--empty"><i class="ti ti-photo"></i></div>`}
        </div>
        <div class="assembly-title">${a.title}</div>
      </div>
    `;
  }

  function renderSpecs(specs) {
    if (!specs || specs.length === 0) return '';
    // 支援分組結構：[{ group, items: [{label, value, gift}] }]
    const isGrouped = specs[0] && Array.isArray(specs[0].items);
    if (!isGrouped) {
      // 舊式扁平陣列 fallback
      return `
        <div class="products__specs">
          <div class="products__specs-title">SPECS</div>
          <div class="spec-group__list">
            ${specs.map(renderSpecRow).join('')}
          </div>
        </div>
      `;
    }
    return `
      <div class="products__specs">
        <div class="products__specs-title">SPECS</div>
        <div class="products__specs-groups">
          ${specs.map(g => `
            <div class="spec-group${g.wide ? ' spec-group--wide' : ''}">
              <div class="spec-group__label">${g.group}</div>
              <div class="spec-group__list">
                ${g.items.map(renderSpecRow).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderSpecRow(s) {
    return `
      <div class="spec-row">
        <span class="spec-label">${s.label}${s.gift ? ' <span class="spec-gift-tag">贈</span>' : ''}</span>
        <span class="spec-value">${s.value}</span>
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

  // === 其他產品（雜誌感細列，一行一產品） ===
  function renderOthers(products) {
    return `
      <div class="products__others">
        <div class="products__others-title">其他自家成品 · MORE</div>
        ${products.map(renderOtherRow).join('')}
      </div>
    `;
  }

  function renderOtherRow(p) {
    const cover = (p.hero && p.hero[0]) || '';
    const statusLabel =
      p.status === 'preview'     ? '預覽中' :
      p.status === 'coming-soon' ? '即將上架' : '';
    return `
      <div class="other-row" data-product-id="${p.id}" role="button" tabindex="0">
        <div class="other-row__thumb">
          ${cover
            ? `<img src="${cover}" alt="${p.name}" loading="lazy" onerror="window.ALU.imgFail(this)">`
            : `<i class="ti ti-photo"></i>`
          }
        </div>
        <div class="other-row__body">
          <div class="other-row__name">
            ${p.name}
            ${statusLabel ? `<span class="other-row__status">${statusLabel}</span>` : ''}
          </div>
          <div class="other-row__subname">${p.nameEn}${p.subtitle ? ` · ${p.subtitle}` : ''}</div>
        </div>
        <i class="ti ti-chevron-right other-row__arrow"></i>
      </div>
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

    // 點 assembly 圖卡 → 開 gallery lightbox（含 ‹ › 切換、ESC 關閉）
    root.querySelectorAll('.assembly-card').forEach((card, idx) => {
      card.addEventListener('click', () => openAssemblyLightbox(featured, idx));
    });

    // 其他產品列：可販售 → 切換顯示；準備中 → toast
    root.querySelectorAll('.other-row').forEach(rowEl => {
      rowEl.addEventListener('click', () => {
        const id = rowEl.dataset.productId;
        const p = PRODUCTS.find(x => x.id === id);
        if (!p) return;
        if (p.status === 'available') {
          renderPage(root, id);
          root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.ALU.toast.show(`${p.name} 還在準備中，敬請期待！或先 LINE 諮詢`);
        }
      });
    });
  }

  // === Assembly Gallery Lightbox（4 步驟切換瀏覽） ===
  function openAssemblyLightbox(featured, initialIdx) {
    const items = featured.assembly || [];
    if (items.length === 0) return;
    let idx = initialIdx || 0;

    const overlay = document.createElement('div');
    overlay.className = 'assembly-lightbox';
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    function close() {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    }
    function go(delta) {
      idx = (idx + delta + items.length) % items.length;
      render();
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    }
    document.addEventListener('keydown', onKey);

    function render() {
      const item = items[idx];
      overlay.innerHTML = `
        <button class="assembly-lightbox__close" aria-label="關閉"><i class="ti ti-x"></i></button>
        <div class="assembly-lightbox__progress">${item.step} / ${String(items.length).padStart(2, '0')}</div>
        <button class="assembly-lightbox__nav assembly-lightbox__nav--prev" aria-label="上一步"><i class="ti ti-chevron-left"></i></button>
        <div class="assembly-lightbox__content">
          <div class="assembly-lightbox__img-wrap">
            <img src="${item.img}" alt="${item.title}" class="assembly-lightbox__img"
                 onerror="window.ALU.imgFail(this)">
          </div>
          <div class="assembly-lightbox__caption">
            <div class="assembly-lightbox__step">STEP ${item.step}</div>
            <div class="assembly-lightbox__title">${item.title}</div>
            <div class="assembly-lightbox__desc">${item.desc}</div>
          </div>
        </div>
        <button class="assembly-lightbox__nav assembly-lightbox__nav--next" aria-label="下一步"><i class="ti ti-chevron-right"></i></button>
      `;
      overlay.querySelector('.assembly-lightbox__close').addEventListener('click', close);
      overlay.querySelector('.assembly-lightbox__nav--prev').addEventListener('click', () => go(-1));
      overlay.querySelector('.assembly-lightbox__nav--next').addEventListener('click', () => go(1));
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    }
    render();
  }

  global.ALU = global.ALU || {};
  global.ALU.views = global.ALU.views || {};
  global.ALU.views.mountProducts = mount;

})(window);
