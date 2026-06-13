/* =====================================================
   views/gallery.js — 品牌藝廊 / 關於我們
   設計：editorial 品牌故事（上半滿版照片輪播 + 下半 左標題右內文）
   ※ 社群連結統一放在底欄，這裡不重複
   ===================================================== */

(function (global) {
  'use strict';

  // 首圖輪播：staff_working_01 ~ 07（想換張數改這裡；副檔名若不是 jpg 改 EXT）
  const SLIDE_PREFIX = 'assets/staff_working_';
  const SLIDE_EXT = '.jpg';
  const SLIDE_COUNT = 7;
  const SLIDE_INTERVAL = 4500; // ms

  const SLIDES = Array.from({ length: SLIDE_COUNT }, (_, i) =>
    `${SLIDE_PREFIX}${String(i + 1).padStart(2, '0')}${SLIDE_EXT}`
  );

  let timer = null;

  function mount(root) {
    root.innerHTML = `
      <div class="gallery view">

        <div class="gallery__photo">
          <div class="gallery__slides">
            ${SLIDES.map((src, i) => `
              <img class="gallery__slide${i === 0 ? ' is-active' : ''}"
                   src="${src}" alt="ALUMIBRO 鋁材兄弟"
                   onerror="this.classList.add('gallery__slide--failed')">
            `).join('')}
          </div>
          ${SLIDE_COUNT > 1 ? `
            <div class="gallery__dots">
              ${SLIDES.map((_, i) => `<span class="gallery__dot${i === 0 ? ' is-active' : ''}"></span>`).join('')}
            </div>
          ` : ''}
        </div>

        <div class="gallery__editorial">
          <div class="gallery__inner">
            <div class="gallery__divider"></div>

            <div class="gallery__row">
              <div class="gallery__titlecol">
                <h2 class="gallery__brand-en">ALUMIBRO</h2>
                <div class="gallery__brand-ch">鋁 材 兄 弟</div>
              </div>

              <div class="gallery__textcol">
                <p class="gallery__p gallery__p--lead">
                  我們專注於工業級鋁擠型的應用設計與銷售，致力於提供最直覺、高質感的模組化結構方案。在瞬息萬變的自造者時代，我們深知結構的穩定性與彈性擴充對於每一個專案的成敗至關重要。
                </p>
                <p class="gallery__p gallery__p--sub">
                  從個人創客的 DIY 專案，到企業級的自動化機架，ALUMIBRO 鋁材兄弟都能為您提供專業的材料與技術支援。我們不僅提供精密零件，更期許能成為您將每一個構想化為真實的堅實後盾。
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    startSlideshow(root);
  }

  function startSlideshow(root) {
    if (timer) { clearInterval(timer); timer = null; }
    const slides = root.querySelectorAll('.gallery__slide');
    const dots = root.querySelectorAll('.gallery__dot');
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
  global.ALU.views.mountGallery = mount;

})(window);
