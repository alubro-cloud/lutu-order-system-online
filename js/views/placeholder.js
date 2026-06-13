/* =====================================================
   views/placeholder.js — 尚未實作的 view 顯示這個
   ===================================================== */

(function (global) {
  'use strict';

  const ICONS = {
    b2c: 'ti-shopping-bag',
    b2b: 'ti-building-warehouse',
    products: 'ti-tools-kitchen-2',
    custom: 'ti-ruler-measure',
    gallery: 'ti-photo',
  };
  const TAGS = {
    b2c: 'MATERIALS', b2b: 'WHOLESALE', products: 'PRODUCTS',
    custom: 'CUSTOM', gallery: 'GALLERY',
  };
  const TITLES = {
    b2c: '選料', b2b: '批料', products: '自家成品',
    custom: '客製專案', gallery: '品牌藝廊',
  };

  function makePlaceholder(viewId) {
    return function mount(root) {
      const icon = ICONS[viewId] || 'ti-tools';
      const tag = TAGS[viewId] || '';
      const title = TITLES[viewId] || viewId;
      root.innerHTML = `
        <div class="placeholder view">
          <div class="placeholder__icon"><i class="ti ${icon}"></i></div>
          <div class="placeholder__tag">${tag}</div>
          <div class="placeholder__title">${title}</div>
          <div class="placeholder__status">v2 開發中</div>
          <div class="placeholder__desc">
            這個頁面正在重建中。<br>
            目前可以先回首頁看看其他入口。
          </div>
          <a class="placeholder__back" href="#/">
            <i class="ti ti-arrow-left"></i> 返回首頁
          </a>
        </div>
      `;
    };
  }

  global.ALU = global.ALU || {};
  global.ALU.views = global.ALU.views || {};
  global.ALU.views.makePlaceholder = makePlaceholder;

})(window);
