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
      document.body.dataset.view = name.split('/')[0];
      mountFn(root);
      window.scrollTo(0, 0);
    },
    go(name) {
      window.location.hash = `#/${name}`;
    },
  };

  global.ALU = global.ALU || {};
  global.ALU.router = router;

})(window);
