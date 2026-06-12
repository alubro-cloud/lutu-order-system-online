/* =====================================================
   views/hub.js — 首頁 Hub
   ===================================================== */

(function (global) {
  'use strict';

  const SERVICES = [
    {
      id: 'b2c', tag: 'MATERIALS', title: '選料',
      desc: '個人 DIY · 少量精選',
      icon: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="8" width="32" height="3" rx="0.5"/>
        <rect x="4" y="14" width="26" height="3" rx="0.5"/>
        <rect x="4" y="20" width="22" height="3" rx="0.5"/>
        <rect x="4" y="26" width="18" height="3" rx="0.5"/>
        <path d="M30 32 L38 36 L38 44 L30 40 Z"/>
        <path d="M30 32 L36 30 L44 34 L38 36"/>
        <path d="M44 34 L44 42 L38 44"/>
      </svg>`,
    },
    {
      id: 'orders', tag: 'TRACK', title: '訂單查詢',
      desc: '輸入電話查歷史訂單',
      icon: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="8" y="10" width="32" height="32" rx="2"/>
        <line x1="14" y1="18" x2="34" y2="18"/>
        <line x1="14" y1="24" x2="34" y2="24"/>
        <line x1="14" y1="30" x2="26" y2="30"/>
        <circle cx="36" cy="36" r="6" fill="none"/>
        <line x1="40" y1="40" x2="44" y2="44"/>
      </svg>`,
    },
    {
      id: 'products', tag: 'PRODUCTS', title: '自家成品',
      desc: '首發：市集攤車',
      isNew: true, isFeatured: true,
      icon: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="6" y="14" width="36" height="4"/>
        <line x1="9" y1="18" x2="6" y2="36"/>
        <line x1="39" y1="18" x2="42" y2="36"/>
        <rect x="6" y="22" width="36" height="14"/>
        <line x1="6" y1="28" x2="42" y2="28"/>
        <circle cx="12" cy="40" r="3"/>
        <circle cx="36" cy="40" r="3"/>
        <line x1="18" y1="10" x2="18" y2="14"/>
        <line x1="30" y1="10" x2="30" y2="14"/>
      </svg>`,
    },
    {
      id: 'custom', tag: 'CUSTOM', title: '客製專案',
      desc: '圖面 · CAD · 量身規劃',
      icon: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="8" width="18" height="24" rx="1"/>
        <line x1="7" y1="14" x2="19" y2="14"/>
        <line x1="7" y1="18" x2="19" y2="18"/>
        <line x1="7" y1="24" x2="15" y2="24"/>
        <line x1="7" y1="28" x2="17" y2="28"/>
        <path d="M24 22 L30 18 L30 12"/>
        <polygon points="34,18 42,22 42,32 34,36 26,32 26,22"/>
        <line x1="34" y1="18" x2="34" y2="36"/>
        <line x1="26" y1="22" x2="34" y2="18"/>
        <line x1="42" y1="22" x2="34" y2="18"/>
      </svg>`,
    },
    {
      id: 'gallery', tag: 'GALLERY', title: '品牌藝廊',
      desc: '作品案例 · 品牌故事',
      icon: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="4" width="18" height="22" rx="1"/>
        <rect x="26" y="4" width="18" height="14" rx="1"/>
        <rect x="4" y="30" width="14" height="14" rx="1"/>
        <rect x="22" y="22" width="22" height="22" rx="1"/>
      </svg>`,
    },
  ];

  function renderCard(s) {
    const featuredCls = s.isFeatured ? ' service-card--featured' : '';
    return `
      <a class="service-card${featuredCls}" href="#/${s.id}">
        ${s.isNew ? '<span class="service-card__new">NEW</span>' : ''}
        <div class="service-card__icon">${s.icon}</div>
        <div class="service-card__content">
          <div class="service-card__tag">${s.tag}</div>
          <div class="service-card__title">${s.title}</div>
          <div class="service-card__desc">${s.desc}</div>
        </div>
        <div class="service-card__arrow"><i class="ti ti-arrow-right"></i></div>
      </a>
    `;
  }

  function mountHub(root) {
    root.innerHTML = `
      <div class="hub view">
        <div class="hub__hero">
          <div class="hub__eyebrow">EST. TAICHUNG · TAIWAN</div>
          <div class="hub__logo-text">
            <div class="hub__logo-ch">鋁材兄弟</div>
            <div class="hub__logo-en">PREMIUM ALUMINUM SOLUTIONS</div>
          </div>
          <div class="hub__tagline">速度 · 精準 · 專業 · 信任</div>
        </div>
        <div class="hub__divider">
          <span class="hub__divider-line"></span>
          <span class="hub__divider-dot"></span>
          <span class="hub__divider-line"></span>
        </div>
        <div class="hub__services">
          ${SERVICES.map(renderCard).join('')}
        </div>
      </div>
    `;
  }

  global.ALU = global.ALU || {};
  global.ALU.views = global.ALU.views || {};
  global.ALU.views.mountHub = mountHub;

})(window);
