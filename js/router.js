/* =====================================================
   router.js — Hash-based 路由（支援子路由）
   ===================================================== */

(function (global) {
  'use strict';

  const routes = new Map();
  const ROOT_ID = 'view-root';

  const router = {
    register(name, mountFn) {
      routes.set(name, mountFn);
      return this;
    },
    start() {
      window.addEventListener('hashchange', () => this.resolve());
      this.resolve();
    },
    resolve() {
      let hash = window.location.hash.slice(2) || 'hub';
      // 先試完整路徑，再逐層往上找（支援 #/b2c/checkout 這種）
      while (hash) {
        if (routes.has(hash)) {
          this.mount(hash);
          return;
        }
        const idx = hash.lastIndexOf('/');
        if (idx < 0) break;
        hash = hash.slice(0, idx);
      }
      this.mount('hub');
    },
    mount(name) {
      const mountFn = routes.get(name) || routes.get('hub');
      const root = document.getElementById(ROOT_ID);
      if (!root) return;
      root.innerHTML = '';
      root.dataset.view = name;
      // body[data-view] 用於 CSS 條件樣式（譬如 cart FAB 只在 b2c/b2b 顯示）
      const baseView = name.split('/')[0];
      document.body.dataset.view = baseView;
      this.updateBrand(baseView);
      mountFn(root);
      window.scrollTo(0, 0);
    },
    // 頂欄 brand：hub 顯示「鋁材兄弟 ALUMIBRO」、子頁顯示「← 返回首頁」
    updateBrand(baseView) {
      const brand = document.querySelector('.app-topbar__brand');
      if (!brand) return;
      if (baseView === 'hub') {
        brand.classList.remove('app-topbar__brand--back');
        brand.innerHTML = `
          <span class="app-topbar__brand-text">鋁材兄弟</span>
          <span class="app-topbar__brand-sub">ALUMIBRO</span>
        `;
      } else {
        brand.classList.add('app-topbar__brand--back');
        brand.innerHTML = `
          <i class="ti ti-arrow-left"></i>
          <span class="app-topbar__brand-back-text">返回首頁</span>
        `;
      }
    },
    go(name) {
      window.location.hash = `#/${name}`;
    },
  };

  global.ALU = global.ALU || {};
  global.ALU.router = router;

})(window);
