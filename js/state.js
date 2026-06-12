/* =====================================================
   state.js — 全域狀態管理
   ===================================================== */

(function (global) {
  'use strict';

  const listeners = new Map();
  const state = {
    view: 'hub',
    cart: [],
    products: [],
  };

  const store = {
    get(key) { return state[key]; },
    set(key, value) { state[key] = value; this.emit(key); },
    update(key, updater) { state[key] = updater(state[key]); this.emit(key); },
    on(key, cb) {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(cb);
      return () => listeners.get(key)?.delete(cb);
    },
    emit(key) {
      listeners.get(key)?.forEach(cb => cb(state[key]));
    },
  };

  const cart = {
    add(item) {
      // id 用 string，避免 number 跟 dataset string 比對失敗
      const id = 'i_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      store.update('cart', list => [...list, { ...item, id }]);
    },
    remove(id) {
      const target = String(id);
      store.update('cart', list => list.filter(i => String(i.id) !== target));
    },
    clear() { store.set('cart', []); },
    count() { return state.cart.length; },
    // 用 lineTotal（卡片加入時已算好）加總，不要用 price*qty 因鋁材有 mm 換算
    total() {
      return state.cart.reduce((sum, i) => sum + (Number(i.lineTotal) || 0), 0);
    },
  };

  global.ALU = global.ALU || {};
  global.ALU.store = store;
  global.ALU.cart = cart;
  global.ALU._state = state;

})(window);
