/* =====================================================
   views/custom.js — 客製專案 / OEM 諮詢
   設計：方案 A 工業藍圖（基準線 + 鋁銀數字 + 標題塊 CTA）
   流程引導（準備什麼 → 怎麼聯繫 → 報價）→ 導去 Gmail
   ===================================================== */

(function (global) {
  'use strict';

  const EMAIL = 'alumibro@herald-alu.com';
  const LINE_URL = 'https://line.me/ti/p/~herald8283';

  const STEPS = [
    {
      num: '01',
      title: '準備資料',
      desc: '備妥您的需求說明與任何可參考的圖面，越完整越能加快規劃。',
      items: [
        { icon: 'ti-file-description', label: '尺寸草圖' },
        { icon: 'ti-file-3d',          label: 'CAD 檔' },
        { icon: 'ti-camera',           label: '現場參考照' },
      ],
    },
    {
      num: '02',
      title: '聯繫諮詢',
      desc: '點下方按鈕，我們已備好信件格式，照欄位填寫並附上檔案寄出即可。',
      items: [],
    },
    {
      num: '03',
      title: '專業報價',
      desc: '工程人員將於 1–2 個工作天內回覆初步規劃與建議報價。',
      items: [],
    },
  ];

  function buildGmailUrl() {
    const subject = '【客製洽詢】公司名稱 / 專案名稱';
    const body =
`您好，ALUMIBRO 鋁材兄弟團隊：

希望洽詢客製化鋁擠型合作，需求概述如下：

【公司 / 單位名稱】

【聯絡人 & 電話】

【需求描述 / 用途】
（如有圖面、CAD 或參考照片，請一併附件）

【預計數量】

【期望交期】

【備註】（預算、特殊規格等，選填）

---
感謝，期待 ALUMIBRO 鋁材兄弟的專業回覆。`;

    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function mount(root) {
    root.innerHTML = `
      <div class="custom custom--blueprint products--muji view">

        <div class="custom__hero">
          <span class="custom__tagline">ALUMIBRO CUSTOM</span>
          <h2 class="custom__title">客製設計 / OEM 諮詢</h2>
          <div class="custom__rule"></div>
          <p class="custom__subtitle">
            鋁擠型結構規劃 · 圖面 · CAD · 量身打造<br>
            從一張草圖到量產，我們協助把您的想法變成穩固的成品。
          </p>
        </div>

        <div class="custom__steps">
          <div class="custom__baseline"></div>
          ${STEPS.map(renderStep).join('')}
        </div>

        <div class="custom__cta">
          <div class="custom__cta-text">
            <div class="custom__cta-label">準備好了嗎？</div>
            <div class="custom__cta-email">
              <i class="ti ti-mail"></i> ${EMAIL}
            </div>
          </div>
          <div class="custom__cta-buttons">
            <a href="${buildGmailUrl()}" target="_blank" rel="noopener" class="custom__btn custom__btn--gmail">
              <i class="ti ti-brand-google"></i> 用 Gmail 發送諮詢
            </a>
            <a href="${LINE_URL}" target="_blank" rel="noopener" class="custom__btn custom__btn--line">
              <i class="ti ti-brand-line"></i> LINE 客服
            </a>
          </div>
        </div>

        <div class="custom__note">
          <i class="ti ti-info-circle"></i>
          沒有 CAD 圖也沒關係 — 手繪草圖、口頭描述或現場照片都可以，我們會協助釐清規格。
        </div>

      </div>
    `;
  }

  function renderStep(s) {
    return `
      <div class="custom-step">
        <div class="custom-step__node"></div>
        <div class="custom-step__num">${s.num}</div>
        <div class="custom-step__body">
          <h3 class="custom-step__title">${s.title}</h3>
          <p class="custom-step__desc">${s.desc}</p>
          ${s.items.length > 0 ? `
            <div class="custom-step__items">
              ${s.items.map(it => `
                <span class="custom-step__chip">
                  <i class="ti ${it.icon}"></i> ${it.label}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  global.ALU = global.ALU || {};
  global.ALU.views = global.ALU.views || {};
  global.ALU.views.mountCustom = mount;

})(window);
