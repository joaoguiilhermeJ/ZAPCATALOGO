/**
 * ZapCatálogo — JavaScript da aplicação
 *
 * Responsável por:
 *   - Intersection Observer (scroll storytelling)
 *   - Dropzone / Upload via fetch
 *   - Smooth scroll
 *   - Demonstração interativa de modelos (renderização nativa, sem iframe)
 *   - Carrinho de compras funcional no simulador
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════
     DADOS DOS MODELOS — Estruturados localmente
     ═══════════════════════════════════════════════ */

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
        cartBg: '#8e7cc3',
      },
      logo: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h12l-2 12H8L6 6z"/><path d="M4 6h16"/><path d="M12 3v3"/><circle cx="9" cy="16" r="1"/><circle cx="15" cy="16" r="1"/></svg>',
      products: [
        { emoji: '👖', name: 'Calça Jeans Premium', price: 189.90, desc: 'Algodão orgânico · Comfort Fit', tag: 'Novo' },
        { emoji: '👚', name: 'Blusa Silk Blend', price: 129.90, desc: 'Seda ecológica · Gola V', tag: 'Premium' },
        { emoji: '👡', name: 'Sapatilha Comfort', price: 159.90, desc: 'Couro legítimo · Palmilha ortopédica', tag: 'Promoção' },
        { emoji: '👜', name: 'Bolsa Tote Couro', price: 249.90, desc: 'Couro legítimo · Média', tag: 'Essencial' },
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
        cartBg: '#d48c5c',
      },
      logo: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="M5.64 5.64l2.12 2.12"/><path d="M16.24 16.24l2.12 2.12"/><path d="M5.64 18.36l2.12-2.12"/><path d="M16.24 7.76l2.12-2.12"/></svg>',
      products: [
        { emoji: '👟', name: 'Tênis Running Sport', price: 299.90, desc: 'Amortecimento Max · Respirável', tag: 'Mais Vendido' },
        { emoji: '🩴', name: 'Sandália Casual Verão', price: 89.90, desc: 'Borracha reciclada · Antiderrapante', tag: 'Novo' },
        { emoji: '👞', name: 'Sapato Couro Nobre', price: 349.90, desc: 'Couro legítimo · Solado antiderrapante', tag: 'Premium' },
        { emoji: '🎒', name: 'Mochila Esportiva', price: 199.90, desc: 'Impermeável · 30L', tag: 'Oferta' },
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
        cartBg: '#e67e22',
      },
      logo: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
      products: [
        { emoji: '🥬', name: 'Cesta Hortifrúti Orgânica', price: 59.90, desc: '10 itens selecionados · Sem agrotóxicos', tag: 'Orgânico' },
        { emoji: '🥖', name: 'Pão de Fermentação Natural', price: 18.90, desc: 'Assado na hora · 500g', tag: 'Artesanal' },
        { emoji: '☕', name: 'Café Premium Grãos', price: 34.90, desc: 'Grãos especiais · Torra média 250g', tag: 'Premium' },
        { emoji: '🧀', name: 'Queijo Minas Artesanal', price: 42.90, desc: 'Maturado · 300g', tag: 'Gourmet' },
      ],
    },
  };

  /* ═══════════════════════════════════════════════
     ESTADO DO CARRINHO
     ═══════════════════════════════════════════════ */
  var cartState = {
    items: [],           // Array de { name, price }
    total: 0,
    count: 0,
  };

  /* ═══════════════════════════════════════════════
     RENDERIZAÇÃO NATIVA — sem iframe, sem AJAX
     ═══════════════════════════════════════════════ */

  /**
   * Formata preço em reais
   */
  function fmtPrice(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  }

  /**
   * Atualiza a exibição do carrinho.
   * Chamada sempre que um item é adicionado.
   */
  function updateCartUI() {
    var el = document.getElementById('cartSummary');
    if (!el) return;

    if (cartState.count === 0) {
      el.textContent = 'Sacola (0 itens)';
      el.style.color = '';
      return;
    }

    var itemText = cartState.count === 1 ? 'item' : 'itens';
    el.textContent = 'Sacola de compras (' + cartState.count + ' ' + itemText + ') - ' + fmtPrice(cartState.total);
    el.style.color = '#128c7e';
    el.style.fontWeight = '600';
  }

  /**
   * Adiciona um produto ao carrinho
   */
  function addToCart(product) {
    cartState.items.push({ name: product.name, price: product.price });
    cartState.total += product.price;
    cartState.count += 1;
    updateCartUI();
  }

  /**
   * Gera o HTML de um produto com botão "Adicionar" funcional.
   * Usa data attributes para evitar onclick inline.
   */
  function createProductHTML(p, index) {
    return '<div class="mockup-product" data-product-index="' + index + '">' +
      '<div class="mockup-product-emoji" id="prodEmoji-' + index + '">' + p.emoji + '</div>' +
      '<div class="mockup-product-info">' +
        '<div class="mockup-product-name" id="prodName-' + index + '">' + p.name + '</div>' +
        '<div class="mockup-product-price" id="prodPrice-' + index + '">' + fmtPrice(p.price) + '</div>' +
        '<div class="mockup-product-desc" id="prodDesc-' + index + '">' + p.desc + '</div>' +
      '</div>' +
      '<div class="mockup-product-actions">' +
        '<span class="mockup-product-tag" id="prodTag-' + index + '">' + p.tag + '</span>' +
        '<button class="mockup-btn-add" data-add-index="' + index + '" aria-label="Adicionar ' + p.name + ' ao carrinho">' +
          '<i class="fas fa-plus"></i>' +
        '</button>' +
      '</div>' +
    '</div>';
  }

  /**
   * Função principal de renderização.
   *
   * Renderiza todo o catálogo no DOM de forma nativa e síncrona,
   * sem iframe, sem requisição externa, sem dependência de rede.
   */
  function renderCatalog(modeloKey) {
    var data = MODELOS_DATA[modeloKey];
    if (!data) return;

    // Referências DOM (único mockup, sem prefixo Mobile)
    var el = {
      storeHeader:  document.getElementById('mockupStoreHeader'),
      logo:         document.getElementById('mockupLogo'),
      storeName:    document.getElementById('mockupStoreName'),
      storeSub:     document.getElementById('mockupStoreSub'),
      products:     document.getElementById('mockupProducts'),
      status:       document.getElementById('mockupStatus'),
      footer:       document.getElementById('mockupPhoneFooter'),
      phone:        document.getElementById('mockupPhone'),
      cart:         document.getElementById('mockupCart'),
    };

    var c = data.colors;

    // ─── Cabeçalho ───
    if (el.storeHeader) el.storeHeader.style.background = c.headerBg;
    if (el.storeName) { el.storeName.style.color = c.headerText; el.storeName.textContent = data.storeName; }
    if (el.storeSub) { el.storeSub.style.color = c.headerText; el.storeSub.textContent = data.storeSub; }

    // ─── Logo ───
    if (el.logo) {
      el.logo.style.background = c.logoBg;
      el.logo.style.color = c.logoColor;
      el.logo.innerHTML = data.logo;
    }

    // ─── Status bar ───
    if (el.status) el.status.style.color = c.statusColor;

    // ─── Sombra do mockup ───
    if (el.phone) el.phone.style.boxShadow = c.phoneShadow;

    // ─── Carrinho ───
    if (el.cart) {
      el.cart.style.borderBottom = '1px solid ' + c.footerBorder;
    }

    // ─── Produtos ───
    if (el.products) {
      // Gera HTML de todos os produtos de uma vez (evita múltiplos appendChild)
      var html = '';
      for (var i = 0; i < data.products.length; i++) {
        html += createProductHTML(data.products[i], i);
      }
      el.products.innerHTML = html;

      // Aplica cores nos elementos específicos de cada produto
      data.products.forEach(function (p, i) {
        var emoji = document.getElementById('prodEmoji-' + i);
        var name = document.getElementById('prodName-' + i);
        var price = document.getElementById('prodPrice-' + i);
        var desc = document.getElementById('prodDesc-' + i);
        var tag = document.getElementById('prodTag-' + i);

        if (emoji) emoji.style.background = c.productBg;
        if (name) name.style.color = c.productName;
        if (price) price.style.color = c.productPrice;
        if (desc) desc.style.color = c.productDesc;
        if (tag) { tag.style.background = c.tagBg; tag.style.color = c.tagText; }
      });

      // ─── Delegação de eventos: clique nos botões "Adicionar" ───
      // Um único listener no container evita múltiplos event listeners.
      // If anterior removido, então readicionamos.
      var newHandler = function (e) {
        var btn = e.target.closest('.mockup-btn-add');
        if (!btn) return;
        var idx = parseInt(btn.getAttribute('data-add-index'), 10);
        if (isNaN(idx)) return;
        var product = data.products[idx];
        if (!product) return;
        addToCart(product);
      };

      // Remove listener anterior se existir (data antiga)
      if (el.products._clickHandler) {
        el.products.removeEventListener('click', el.products._clickHandler);
      }
      el.products.addEventListener('click', newHandler);
      el.products._clickHandler = newHandler;
    }

    // ─── Footer ───
    if (el.footer) {
      var dots = el.footer.querySelectorAll('.mockup-dot');
      dots.forEach(function (d) { d.style.background = c.footerDots; });
      el.footer.style.borderTopColor = c.footerBorder;
    }
  }

  /* ═══════════════════════════════════════════════
     DOWNLOAD LABELS — texto e href por nicho
     ═══════════════════════════════════════════════ */
  var DOWNLOAD_MAP = {
    aura: {
      href: 'downloads/modelo_aura.xlsx',
      download: 'modelo_aura.xlsx',
      label: 'Baixar Planilha de Moda (Aura)',
      badge: 'Modelo: Aura',
    },
    soleil: {
      href: 'downloads/modelo_soleil.xlsx',
      download: 'modelo_soleil.xlsx',
      label: 'Baixar Planilha de Calçados (Soleil)',
      badge: 'Modelo: Soleil',
    },
    mercadinho: {
      href: 'downloads/modelo_mercadinho.xlsx',
      download: 'modelo_mercadinho.xlsx',
      label: 'Baixar Planilha do Mercadinho',
      badge: 'Modelo: Mercadinho',
    },
  };

  /**
   * Atualiza o link de download dinâmico abaixo do mockup
   * e o indicador visual "Recomendado para este nicho".
   */
  function updateDownloadButton(key) {
    var info = DOWNLOAD_MAP[key];
    if (!info) return;

    // Link de download principal abaixo do mockup
    var dlLink = document.getElementById('mockupDownloadLink');
    if (dlLink) {
      dlLink.href = info.href;
      dlLink.download = info.download;
      dlLink.innerHTML = '<i class="fas fa-download"></i> ' + info.label;
    }

    // Badge/indicador visual no canto do mockup
    var badge = document.getElementById('mockupDownloadBadge');
    if (badge) {
      badge.textContent = info.badge;
    }
  }

  /* ═══════════════════════════════════════════════
     SWITCH DE MODELO (exposto globalmente para onclick)
     ═══════════════════════════════════════════════ */
  window.switchModelo = function (key) {
    // Atualizar abas (único seletor para desktop e mobile)
    document.querySelectorAll('.modelos-tab, .modelos-mobile-tab').forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.modelo === key);
    });

    // Gerenciar visual dos cards de nicho (radio dots + borda ativa)
    var cards = ['aura', 'soleil', 'mercadinho'];
    cards.forEach(function (k) {
      var card = document.getElementById('card-' + k);
      if (!card) return;
      var dot = card.children[0]; // .w-5 (radio outer circle)
      var innerDot = dot && dot.children[0]; // .w-2.5 (radio inner fill)
      if (k === key) {
        card.className = 'modelos-tab active w-full text-left p-6 rounded-3xl border-2 border-whatsapp bg-whatsapp-bg/20 transition-all hover:shadow-md flex items-start gap-4 cursor-pointer group';
        if (dot) { dot.className = 'w-5 h-5 rounded-full border-2 border-whatsapp flex items-center justify-center shrink-0 mt-1 bg-whatsapp transition-colors'; }
        if (innerDot) { innerDot.className = 'w-2.5 h-2.5 rounded-full bg-white'; }
      } else {
        card.className = 'modelos-tab w-full text-left p-6 rounded-3xl border-2 border-slate-200 bg-white transition-all hover:shadow-md flex items-start gap-4 cursor-pointer group';
        if (dot) { dot.className = 'w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0 mt-1 bg-transparent transition-colors'; }
        if (innerDot) { innerDot.className = 'w-2.5 h-2.5 rounded-full bg-transparent'; }
      }
    });

    // Atualizar o botão de download dinâmico
    updateDownloadButton(key);

    // Animação de transição — fade + scale
    var wrap = document.getElementById('mockupContent');
    if (!wrap) return;

    wrap.classList.add('switching');

    setTimeout(function () {
      // Limpa carrinho ao trocar de modelo
      cartState.items = [];
      cartState.total = 0;
      cartState.count = 0;
      updateCartUI();

      renderCatalog(key);
      wrap.classList.remove('switching');
    }, 140);
  };

  /* ═══════════════════════════════════════════════
     INTERSECTION OBSERVER — Scroll Storytelling
     ═══════════════════════════════════════════════ */
  var stepCards = document.querySelectorAll('.step-card');

  if (stepCards.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var card = entry.target;
            var index = Array.from(stepCards).indexOf(card);
            setTimeout(function () { card.classList.add('visible'); }, index * 160);
            observer.unobserve(card);
          }
        });
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.18 }
    );

    stepCards.forEach(function (card) { observer.observe(card); });
  } else {
    stepCards.forEach(function (card) { card.classList.add('visible'); });
  }

  /* ═══════════════════════════════════════════════
     SMOOTH SCROLL para âncoras
     ═══════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ═══════════════════════════════════════════════
     UPLOAD / DROPZONE
     ═══════════════════════════════════════════════ */
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('file-input');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', function () { fileInput.click(); });

    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', function () {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      var file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });

    fileInput.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (file) handleFile(file);
    });
  }

  /* ─── Upload via fetch ─── */
  async function handleFile(file) {
    var formData = new FormData();
    formData.append('file', file);

    var dropEl = document.getElementById('dropzone');
    var loadingEl = document.getElementById('loading');
    var errorEl = document.getElementById('error-message');
    var errorText = document.getElementById('error-text');

    dropEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');

    try {
      var response = await fetch((window.API_URL || '') + '/api/upload', { method: 'POST', body: formData });
      var data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao processar arquivo');

      // Salva dados do upload no sessionStorage para a tela de catálogo
      sessionStorage.setItem('zapcatalogo_upload_data', JSON.stringify({
        filename: data.filename,
        sheets: data.sheets,
        activeSheet: data.activeSheet,
        rowCount: data.rowCount,
        columns: data.columns,
        data: data.data,
      }));

      // Redireciona para pagamento
      window.location.href = '/pagamento.html';
    } catch (err) {
      errorText.textContent = err.message;
      errorEl.classList.remove('hidden');
      loadingEl.classList.add('hidden');
      dropEl.classList.remove('hidden');
    }
  }

  /* ─── Parâmetros da URL ─── */
  var params = new URLSearchParams(window.location.search);
  if (params.get('step') === '2') {
    var uploadSection = document.getElementById('upload');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () {
        var dz = document.getElementById('dropzone');
        if (dz) dz.classList.add('dragover');
        setTimeout(function () {
          var dz2 = document.getElementById('dropzone');
          if (dz2) dz2.classList.remove('dragover');
        }, 800);
      }, 500);
    }
  }

  /* ═══════════════════════════════════════════════
     MOCKUP INTERATIVO (Hero) — bubbles acompanham scroll
     ═══════════════════════════════════════════════ */
  var phoneScreen = document.getElementById('phoneScreen');
  if (phoneScreen && 'IntersectionObserver' in window) {
    var bubbles = phoneScreen.querySelectorAll('.chat-bubble');
    var stepObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var step = parseInt(entry.target.dataset.step);
          if (entry.isIntersecting && !isNaN(step) && bubbles[step]) {
            bubbles[step].style.opacity = '1';
          }
        });
      },
      { threshold: 0.3 }
    );
    stepCards.forEach(function (card) { stepObserver.observe(card); });
  }

  /* ═══════════════════════════════════════════════
     INICIALIZAÇÃO — Carregar AURA no DOMContentLoaded
     ═══════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    renderCatalog('aura');
    updateDownloadButton('aura');
    updateCartUI();
  });

})();
