/* =====================================================
   views/hub.js — 首頁 Hub（C 版）
   無頂欄 · 橫幅輪播 hero（LOGO 疊圖）
   下半：左品牌介紹 / 右選單（主力「選料」放大 + 三小卡）· 不捲動
   ===================================================== */

(function (global) {
  'use strict';

  // hero 橫幅輪播：staff_working_01 ~ 07
  const SLIDE_PREFIX = 'assets/staff_working_';
  const SLIDE_EXT = '.jpg';
  const SLIDE_COUNT = 7;
  const SLIDE_INTERVAL = 4500;
  const SLIDES = Array.from({ length: SLIDE_COUNT }, (_, i) =>
    `${SLIDE_PREFIX}${String(i + 1).padStart(2, '0')}${SLIDE_EXT}`
  );

  const IG_URL = 'https://www.instagram.com/alumibro?igsh=MXhoY3lldHhlZHh3dw==';
  const LINE_URL = 'https://line.me/ti/p/~herald8283';

  const ICON = {
    materials: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="8" width="32" height="3" rx="0.5"/><rect x="4" y="14" width="26" height="3" rx="0.5"/>
      <rect x="4" y="20" width="22" height="3" rx="0.5"/><rect x="4" y="26" width="18" height="3" rx="0.5"/>
      <path d="M30 32 L38 36 L38 44 L30 40 Z"/><path d="M30 32 L36 30 L44 34 L38 36"/><path d="M44 34 L44 42 L38 44"/></svg>`,
    products: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="14" width="36" height="4"/><line x1="9" y1="18" x2="6" y2="36"/><line x1="39" y1="18" x2="42" y2="36"/>
      <rect x="6" y="22" width="36" height="14"/><line x1="6" y1="28" x2="42" y2="28"/>
      <circle cx="12" cy="40" r="3"/><circle cx="36" cy="40" r="3"/>
      <line x1="18" y1="10" x2="18" y2="14"/><line x1="30" y1="10" x2="30" y2="14"/></svg>`,
    track: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="10" width="32" height="32" rx="2"/><line x1="14" y1="18" x2="34" y2="18"/>
      <line x1="14" y1="24" x2="34" y2="24"/><line x1="14" y1="30" x2="26" y2="30"/>
      <circle cx="36" cy="36" r="6" fill="none"/><line x1="40" y1="40" x2="44" y2="44"/></svg>`,
    custom: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="8" width="18" height="24" rx="1"/><line x1="7" y1="14" x2="19" y2="14"/><line x1="7" y1="18" x2="19" y2="18"/>
      <line x1="7" y1="24" x2="15" y2="24"/><line x1="7" y1="28" x2="17" y2="28"/>
      <path d="M24 22 L30 18 L30 12"/><polygon points="34,18 42,22 42,32 34,36 26,32 26,22"/>
      <line x1="34" y1="18" x2="34" y2="36"/><line x1="26" y1="22" x2="34" y2="18"/><line x1="42" y1="22" x2="34" y2="18"/></svg>`,
  };

  // 主力：選料裁切（同一入口，B2C 小量 + B2B 大量裁切）
  const FEATURED = {
    id: 'b2c', tag: 'CUTTING', title: '選料裁切',
    desc: 'B2B 大量・個人小量皆可・精準裁切',
    icon: ICON.materials,
  };

  // 其餘三項（自家成品 NEW 次之，訂單查詢 / 客製專案 一般）
  const MENUS = [
    { id: 'products', tag: 'PRODUCTS', title: '自家成品', desc: '首發：市集攤車', isNew: true, icon: ICON.products },
    { id: 'orders',   tag: 'TRACK',    title: '訂單查詢', desc: '輸入電話查歷史訂單',          icon: ICON.track },
    { id: 'custom',   tag: 'CUSTOM',   title: '客製專案', desc: '圖面 · CAD · 量身規劃',        icon: ICON.custom },
  ];

  let timer = null;

  function renderFeature(s) {
    return `
      <a class="hub-feature" href="#/${s.id}">
        <div class="hub-feature__icon">${s.icon}</div>
        <div class="hub-feature__body">
          <div class="hub-feature__tag">${s.tag}</div>
          <div class="hub-feature__title">${s.title}</div>
          <div class="hub-feature__desc">${s.desc}</div>
        </div>
        <div class="hub-feature__arrow"><i class="ti ti-arrow-right"></i></div>
      </a>
    `;
  }

  function renderMenu(s) {
    return `
      <a class="hub-menu" href="#/${s.id}">
        <div class="hub-menu__icon">${s.icon}</div>
        <div class="hub-menu__body">
          <div class="hub-menu__tag">${s.tag}</div>
          <div class="hub-menu__title">${s.title}${s.isNew ? '<span class="hub-menu__new">NEW</span>' : ''}</div>
          <div class="hub-menu__desc">${s.desc}</div>
        </div>
        <div class="hub-menu__arrow"><i class="ti ti-arrow-right"></i></div>
      </a>
    `;
  }

  function mountHub(root) {
    root.innerHTML = `
      <div class="hub hub--c view">

        <div class="hub__hero">
          <div class="hub__slides">
            ${SLIDES.map((src, i) => `
              <img class="hub__slide${i === 0 ? ' is-active' : ''}" src="${src}" alt=""
                   onerror="this.classList.add('hub__slide--failed')">
            `).join('')}
          </div>
          <div class="hub__hero-scrim"></div>

          <div class="hub__hero-actions">
            <a href="${IG_URL}" target="_blank" rel="noopener" class="hub__hero-ig" aria-label="Instagram">
              <i class="ti ti-brand-instagram"></i>
            </a>
            <a href="${LINE_URL}" target="_blank" rel="noopener" class="hub__hero-line">
              <i class="ti ti-brand-line"></i><span>LINE 諮詢</span>
            </a>
          </div>

          <div class="hub__hero-center">
            <img src="assets/logo-white.png" alt="鋁材兄弟 · PREMIUM ALUMINUM SOLUTIONS" class="hub__logo-img">
            <div class="hub__tagline">速 度 · 精 準 · 專 業 · 信 任</div>
            <div class="hub__hero-rule"></div>
            <p class="hub__hero-intro">工業級鋁擠型・精準裁切</p>
          </div>

          <div class="hub__dots">
            ${SLIDES.map((_, i) => `<span class="hub__dot${i === 0 ? ' is-active' : ''}"></span>`).join('')}
          </div>
        </div>

        <div class="hub__low">
          <div class="hub__about">
            <div class="hub__about-label">ABOUT US · 關於我們</div>
            <h2 class="hub__about-en">ALUMIBRO</h2>
            <div class="hub__about-ch">鋁 材 兄 弟</div>
            <p class="hub__about-p">
              專注於工業級鋁擠型的精準裁切與應用設計，從個人小量到企業大量供料，彈性配合，成為您把構想化為真實的堅實後盾。
            </p>
          </div>

          <div class="hub__menus">
            ${renderFeature(FEATURED)}
            <div class="hub__row3">
              ${MENUS.map(renderMenu).join('')}
            </div>
          </div>
        </div>

      </div>
    `;

    startSlideshow(root);
  }

  function startSlideshow(root) {
    if (timer) { clearInterval(timer); timer = null; }
    const slides = root.querySelectorAll('.hub__slide');
    const dots = root.querySelectorAll('.hub__dot');
    if (slides.length <= 1) return;
    let i = 0;
    timer = setInterval(() => {
      slides[i].classList.remove('is-active');
      if (dots[i]) dots[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
      if (dots[i]) dots[i].classList.add('is-active');
    }, SLIDE_INTERVAL);
  }

  global.ALU = global.ALU || {};
  global.ALU.views = global.ALU.views || {};
  global.ALU.views.mountHub = mountHub;

})(window);
