/* =====================================================
   ui/lightbox.js — 圖片彈出（含 2D/3D 切換）
   ===================================================== */

(function (global) {
  'use strict';

  let overlayEl = null;

  function ensure() {
    if (overlayEl) return overlayEl;
    overlayEl = document.createElement('div');
    overlayEl.className = 'lightbox';
    overlayEl.innerHTML = `
      <button class="lightbox__close" aria-label="關閉">&times;</button>
      <div class="lightbox__content">
        <img class="lightbox__img" alt="" />
        <div class="lightbox__caption"></div>
        <div class="lightbox__switch">
          <button data-mode="2d" class="lightbox__switch-btn lightbox__switch-btn--active">2D 圖</button>
          <button data-mode="3d" class="lightbox__switch-btn">3D 圖</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlayEl);

    // 點背景關閉
    overlayEl.addEventListener('click', (e) => {
      if (e.target === overlayEl || e.target.closest('.lightbox__close')) close();
    });
    // 切換 2D/3D
    overlayEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.lightbox__switch-btn');
      if (!btn) return;
      const mode = btn.dataset.mode;
      const imgEl = overlayEl.querySelector('.lightbox__img');
      const data = overlayEl.dataset;
      imgEl.src = mode === '3d' ? data.img3d : data.img2d;
      overlayEl.querySelectorAll('.lightbox__switch-btn').forEach(b =>
        b.classList.toggle('lightbox__switch-btn--active', b.dataset.mode === mode)
      );
    });
    // ESC 關閉
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlayEl.classList.contains('lightbox--visible')) close();
    });
    return overlayEl;
  }

  function open({ img2d, img3d, caption }) {
    const el = ensure();
    const imgEl = el.querySelector('.lightbox__img');
    const captionEl = el.querySelector('.lightbox__caption');
    const switchEl = el.querySelector('.lightbox__switch');

    el.dataset.img2d = img2d || '';
    el.dataset.img3d = img3d || '';
    imgEl.src = img2d || img3d || '';
    captionEl.textContent = caption || '';

    // 沒 3D 就隱藏切換按鈕
    switchEl.style.display = img3d ? 'flex' : 'none';
    el.querySelectorAll('.lightbox__switch-btn').forEach(b =>
      b.classList.toggle('lightbox__switch-btn--active', b.dataset.mode === '2d')
    );

    el.classList.add('lightbox--visible');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!overlayEl) return;
    overlayEl.classList.remove('lightbox--visible');
    document.body.style.overflow = '';
  }

  global.ALU = global.ALU || {};
  global.ALU.lightbox = { open, close };

})(window);
