/**
 * ZapCatálogo — JavaScript da aplicação
 * Responsável por: Intersection Observer, Dropzone, Upload via fetch, Smooth Scroll
 */

(function () {
  'use strict';

  /* ─── INTERSECTION OBSERVER — Scroll Storytelling ─── */
  const stepCards = document.querySelectorAll('.step-card');

  if (stepCards.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target;
            const index = Array.from(stepCards).indexOf(card);
            setTimeout(() => card.classList.add('visible'), index * 160);
            observer.unobserve(card);
          }
        });
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.18 }
    );

    stepCards.forEach((card) => observer.observe(card));
  } else {
    stepCards.forEach((card) => card.classList.add('visible'));
  }

  /* ─── SMOOTH SCROLL para âncoras ─── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ─── UPLOAD / DROPZONE ─── */
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleFile(file);
    });
  }

  /* ─── UPLOAD VIA FETCH PARA O BACKEND ─── */
  async function handleFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const dropEl = document.getElementById('dropzone');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    dropEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');

    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao processar arquivo');
      window.location.href = '/?step=2';
    } catch (err) {
      errorText.textContent = err.message;
      errorEl.classList.remove('hidden');
      loadingEl.classList.add('hidden');
      dropEl.classList.remove('hidden');
    }
  }

  /* ─── PARÂMETROS DA URL ─── */
  const params = new URLSearchParams(window.location.search);
  if (params.get('step') === '2') {
    const uploadSection = document.getElementById('upload');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const dz = document.getElementById('dropzone');
        if (dz) dz.classList.add('dragover');
        setTimeout(() => document.getElementById('dropzone')?.classList.remove('dragover'), 800);
      }, 500);
    }
  }

  /* ─── MOCKUP INTERATIVO: bubbles acompanham scroll ─── */
  const phoneScreen = document.getElementById('phoneScreen');
  if (phoneScreen && 'IntersectionObserver' in window) {
    const bubbles = phoneScreen.querySelectorAll('.chat-bubble');
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const step = parseInt(entry.target.dataset.step);
          if (entry.isIntersecting && !isNaN(step) && bubbles[step]) {
            bubbles[step].style.opacity = '1';
          }
        });
      },
      { threshold: 0.3 }
    );
    stepCards.forEach((card) => stepObserver.observe(card));
  }
})();

  /* ═══════════════════════════════════════════════
     DEMONSTRAÇÃO DE MODELOS — DADOS E SWITCH
     ═══════════════════════════════════════════════ */

  // Dados dos 3 modelos
  var MODELOS_DATA = {
    aura: {
      name: 'AURA',
      storeName: 'AURA Estilo Essencial',
      storeSub: 'Moda Feminina',
      colors: {
        headerBg: '#f5f0fa',
        headerText: '#4a3580',
        logoBg: '#8e7cc3',
        logoColor: '#fff',
        productBg: '#faf8ff',
        productName: '#3d2a6b',
        productPrice: '#8e7cc3',
        productDesc: '#8a7fa0',
        tagBg: '#e8defa',
        tagText: '#6b5bae',
        footerDots: '#d4c5f0',
        footerBorder: 'rgba(142,124,195,0.15)',
        statusColor: '#6b5bae',
        phoneShadow: '0 24px 64px rgba(142,124,195,0.22)',
        bgGradient: '#f5f0fa',
      },
      logo: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h12l-2 12H8L6 6z"/><path d="M4 6h16"/><path d="M12 3v3"/><circle cx="9" cy="16" r="1"/><circle cx="15" cy="16" r="1"/></svg>',
      products: [
        { emoji: '👖', name: 'Calça Jeans Premium', price: 'R$ 189,90', desc: 'Algodão orgânico · Comfort Fit', tag: 'Novo' },
        { emoji: '👚', name: 'Blusa Silk Blend', price: 'R$ 129,90', desc: 'Seda ecológica · Gola V', tag: 'Premium' },
        { emoji: '👡', name: 'Sapatilha Comfort', price: 'R$ 159,90', desc: 'Couro legítimo · Palmilha ortopédica', tag: 'Promoção' },
        { emoji: '👜', name: 'Bolsa Tote Couro', price: 'R$ 249,90', desc: 'Couro legítimo · Média', tag: 'Essencial' },
      ],
    },
    soleil: {
      name: 'SOLEIL',
      storeName: 'SOLEIL Passo Leve',
      storeSub: 'Calçados & Esportes',
      colors: {
        headerBg: '#faf3ed',
        headerText: '#8b5e3c',
        logoBg: '#d48c5c',
        logoColor: '#fff',
        productBg: '#fefaf5',
        productName: '#6b4423',
        productPrice: '#d48c5c',
        productDesc: '#a08a78',
        tagBg: '#fde8d0',
        tagText: '#b87040',
        footerDots: '#e8cdb5',
        footerBorder: 'rgba(212,140,92,0.15)',
        statusColor: '#8b5e3c',
        phoneShadow: '0 24px 64px rgba(212,140,92,0.22)',
        bgGradient: '#faf3ed',
      },
      logo: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="M5.64 5.64l2.12 2.12"/><path d="M16.24 16.24l2.12 2.12"/><path d="M5.64 18.36l2.12-2.12"/><path d="M16.24 7.76l2.12-2.12"/></svg>',
      products: [
        { emoji: '👟', name: 'Tênis Running Sport', price: 'R$ 299,90', desc: 'Amortecimento Max · Respirável', tag: 'Mais Vendido' },
        { emoji: '🩴', name: 'Sandália Casual Verão', price: 'R$ 89,90', desc: 'Borracha reciclada · Antiderrapante', tag: 'Novo' },
        { emoji: '👞', name: 'Sapato Couro Nobre', price: 'R$ 349,90', desc: 'Couro legítimo · Solado antiderrapante', tag: 'Premium' },
        { emoji: '🎒', name: 'Mochila Esportiva', price: 'R$ 199,90', desc: 'Impermeável · 30L', tag: 'Oferta' },
      ],
    },
    mercadinho: {
      name: 'MERCADINHO DA VILA',
      storeName: 'Mercadinho da Vila',
      storeSub: 'Alimentos & Bebidas',
      colors: {
        headerBg: '#f0f7ec',
        headerText: '#2d6b40',
        logoBg: '#4caf50',
        logoColor: '#fff',
        productBg: '#f7fcf5',
        productName: '#1b5e20',
        productPrice: '#e67e22',
        productDesc: '#688f6e',
        tagBg: '#fff3e0',
        tagText: '#e67e22',
        footerDots: '#b8d9b0',
        footerBorder: 'rgba(76,175,80,0.15)',
        statusColor: '#2d6b40',
        phoneShadow: '0 24px 64px rgba(76,175,80,0.22)',
        bgGradient: '#f0f7ec',
      },
      logo: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
      products: [
        { emoji: '🥬', name: 'Cesta Hortifrúti Orgânica', price: 'R$ 59,90', desc: '10 itens selecionados · Sem agrotóxicos', tag: 'Orgânico' },
        { emoji: '🥖', name: 'Pão de Fermentação Natural', price: 'R$ 18,90', desc: 'Assado na hora · 500g', tag: 'Artesanal' },
        { emoji: '☕', name: 'Café Premium Grãos', price: 'R$ 34,90', desc: 'Grãos especiais · Torra média 250g', tag: 'Premium' },
        { emoji: '🧀', name: 'Queijo Minas Artesanal', price: 'R$ 42,90', desc: 'Maturado · 300g', tag: 'Gourmet' },
      ],
    },
  };

  // Aplica os dados de um modelo ao mockup
  function applyModelo(modeloKey, prefix) {
    var data = MODELOS_DATA[modeloKey];
    if (!data) return;

    var getId = function (id) { return document.getElementById(prefix + id); };

    var storeHeader = getId('mockupStoreHeader');
    var logo = getId('mockupLogo');
    var storeName = getId('mockupStoreName');
    var storeSub = getId('mockupStoreSub');
    var products = getId('mockupProducts');
    var status = getId('mockupStatus');
    var footer = getId('mockupPhoneFooter');
    var phone = prefix === 'M' ? document.getElementById('mockupPhoneMobile') : document.getElementById('mockupPhone');

    // Cores
    var c = data.colors;
    if (storeHeader) storeHeader.style.background = c.headerBg;
    if (storeName) storeName.style.color = c.headerText;
    if (storeSub) storeSub.style.color = c.headerText;
    if (logo) {
      logo.style.background = c.logoBg;
      logo.style.color = c.logoColor;
      logo.innerHTML = data.logo;
    }
    if (status) status.style.color = c.statusColor;
    if (phone) phone.style.boxShadow = c.phoneShadow;

    // Nome da loja
    if (storeName) storeName.textContent = data.storeName;
    if (storeSub) storeSub.textContent = data.storeSub;

    // Produtos
    if (products) {
      products.innerHTML = '';
      data.products.forEach(function (p) {
        var el = document.createElement('div');
        el.className = 'mockup-product';
        el.innerHTML =
          '<div class="mockup-product-emoji" style="background:' + c.productBg + '">' + p.emoji + '</div>' +
          '<div class="mockup-product-info">' +
            '<div class="mockup-product-name" style="color:' + c.productName + '">' + p.name + '</div>' +
            '<div class="mockup-product-price" style="color:' + c.productPrice + '">' + p.price + '</div>' +
            '<div class="mockup-product-desc" style="color:' + c.productDesc + '">' + p.desc + '</div>' +
          '</div>' +
          '<span class="mockup-product-tag" style="background:' + c.tagBg + ';color:' + c.tagText + '">' + p.tag + '</span>';
        products.appendChild(el);
      });
    }

    // Footer dots
    if (footer) {
      var dots = footer.querySelectorAll('.mockup-dot');
      if (dots.length) {
        dots.forEach(function (d) { d.style.background = c.footerDots; });
      }
      footer.style.borderTopColor = c.footerBorder;
    }
  }

  // Função global chamada pelo onclick
  window.switchModelo = function (key) {
    // Atualizar abas desktop
    document.querySelectorAll('.modelos-tab').forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.modelo === key);
    });
    // Atualizar abas mobile
    document.querySelectorAll('.modelos-mobile-tab').forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.modelo === key);
    });

    // Animação de transição — fade + scale
    var transition = function (prefix) {
      var wrap = document.getElementById('mockupContent' + prefix);
      if (!wrap) return;
      wrap.classList.add('switching');
      setTimeout(function () {
        applyModelo(key, prefix);
        wrap.classList.remove('switching');
      }, 140);
    };

    transition('');
    transition('Mobile');
  };

  // Inicializar com AURA
  document.addEventListener('DOMContentLoaded', function () {
    applyModelo('aura', '');
    applyModelo('aura', 'Mobile');
  });
