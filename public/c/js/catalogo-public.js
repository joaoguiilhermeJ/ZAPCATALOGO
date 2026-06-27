/**
 * CatalogoPublic — JS da pagina publica do catalogo (/c/:slug)
 * Carrega dados da API e renderiza o catalogo
 */
(function () {
  'use strict';

  /* ─── Utilitarios ─── */
  function fmtPrice(value) {
    if (value === undefined || value === null) return '';
    var num = parseFloat(String(value).replace(/[^0-9,.]/g, '').replace(',', '.'));
    if (isNaN(num)) return String(value);
    return 'R$ ' + num.toFixed(2).replace('.', ',');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function debounce(fn, ms) {
    var timer;
    return function () {
      var ctx = this, args = arguments;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  function parsePrice(value) {
    var num = parseFloat(String(value).replace(/[^0-9,.]/g, '').replace(',', '.'));
    return isNaN(num) ? null : num;
  }

  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 2), 16) * 17 || parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(2, 3), 16) * 17 || parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(3, 4), 16) * 17 || parseInt(hex.slice(5, 7), 16);
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /* ─── Extrair slug da URL ─── */
  function getSlugFromURL() {
    // Prioridade 1: query string ?slug=...
    var params = new URLSearchParams(window.location.search);
    var slugParam = params.get('slug');
    if (slugParam) return slugParam;

    // Prioridade 2: pathname /c/{slug}
    var path = window.location.pathname;
    var parts = path.split('/c/');
    if (parts.length > 1) {
      return parts[1].replace(/\/$/, '');
    }
    return null;
  }

  /* ─── Estado ─── */
  var state = {
    catalogo: null,
    produtos: [],
    filtered: [],
    cart: [],
    search: '',
    filterCat: '',
    filterPrice: '',
  };
  var corTema = '#128C7E';
  var API_URL = window.API_URL;

  /* ─── DOM refs ─── */
  var $ = function (id) { return document.getElementById(id); };

  var els = {
    loadingState: $('loadingState'),
    errorState: $('errorState'),
    catalogContent: $('catalogContent'),
    storeLogo: $('storeLogo'),
    storeLogoPlaceholder: $('storeLogoPlaceholder'),
    storeName: $('storeName'),
    storeWhatsApp: $('storeWhatsApp'),
    productsGrid: $('productsGrid'),
    searchInput: $('searchInput'),
    filterCategoria: $('filterCategoria'),
    filterPreco: $('filterPreco'),
    resultsCount: $('resultsCount'),
    noResults: $('noResults'),
    btnShare: $('btnShare'),
    // Cart
    cartOverlay: $('cartOverlay'),
    cartSidebar: $('cartSidebar'),
    cartItems: $('cartItems'),
    cartEmpty: $('cartEmpty'),
    cartFooter: $('cartFooter'),
    cartTotal: $('cartTotal'),
    btnWhatsAppCart: $('btnWhatsAppCart'),
    btnOpenCart: $('btnOpenCart'),
    btnCloseCart: $('btnCloseCart'),
    cartBadgeHeader: $('cartBadgeHeader'),
    cartFab: $('cartFab'),
    cartFabBadge: $('cartFabBadge'),
  };

  /* ─── Fetch catalogo ─── */
  function fetchCatalogo(slug) {
    return fetch(API_URL + '/api/catalogos/' + encodeURIComponent(slug))
      .then(function (r) {
        if (!r.ok) throw new Error('Catalogo nao encontrado');
        return r.json();
      });
  }

  /* ─── Render ─── */
  function renderStore(catalogo) {
    if (catalogo.logo_url) {
      els.storeLogo.src = catalogo.logo_url;
      els.storeLogo.style.display = 'block';
      els.storeLogoPlaceholder.style.display = 'none';
    } else {
      els.storeLogo.style.display = 'none';
      els.storeLogoPlaceholder.style.display = 'flex';
    }

    els.storeName.textContent = catalogo.nome_loja;

    if (catalogo.whatsapp) {
      els.storeWhatsApp.href = 'https://wa.me/55' + catalogo.whatsapp.replace(/\D/g, '');
      els.storeWhatsApp.classList.remove('hidden');
    }

    if (catalogo.cor_tema) {
      corTema = catalogo.cor_tema;
      applyTheme(corTema);
    }
  }

  function applyTheme(cor) {
    var style = document.createElement('style');
    style.textContent =
      '.preview-btn-whatsapp { background: ' + cor + '; }' +
      '.preview-btn-whatsapp:hover { background: #075E54; }' +
      '.preview-cart-fab { background: linear-gradient(135deg, ' + cor + ', #075E54); }';
    document.head.appendChild(style);
  }

  function populateCategories() {
    var cats = {};
    state.produtos.forEach(function (p) {
      if (p.categoria) cats[p.categoria] = true;
    });
    var keys = Object.keys(cats).sort();
    els.filterCategoria.innerHTML = '<option value="">Todas as categorias</option>';
    keys.forEach(function (c) {
      els.filterCategoria.innerHTML += '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>';
    });
  }

  function applyFilters() {
    var busca = state.search.toLowerCase().trim();
    var cat = state.filterCat;
    var priceRange = state.filterPrice;

    state.filtered = state.produtos.filter(function (p) {
      if (busca) {
        var inNome = p.nome.toLowerCase().indexOf(busca) !== -1;
        var inCodigo = (p.codigo || '').toLowerCase().indexOf(busca) !== -1;
        var inDesc = (p.descricao || '').toLowerCase().indexOf(busca) !== -1;
        var inCategoria = (p.categoria || '').toLowerCase().indexOf(busca) !== -1;
        if (!inNome && !inCodigo && !inDesc && !inCategoria) return false;
      }

      if (cat && p.categoria !== cat) return false;

      if (priceRange) {
        var priceNum = parsePrice(p.preco);
        if (priceNum === null) return false;
        var parts = priceRange.split('-');
        if (parts.length === 2) {
          var min = parseFloat(parts[0]);
          var max = parseFloat(parts[1]);
          if (priceNum < min || priceNum > max) return false;
        } else if (parts.length === 1 && parts[0] === '200') {
          if (priceNum <= 200) return false;
        }
      }

      return true;
    });

    renderProducts();
    updateResultsCount();
  }

  function renderProducts() {
    if (state.filtered.length === 0) {
      els.productsGrid.innerHTML = '';
      els.noResults.classList.remove('hidden');
      return;
    }
    els.noResults.classList.add('hidden');

    var html = '';
    state.filtered.forEach(function (p) {
      var inCart = state.cart.some(function (c) { return c.id === p.id; });
      var priceNum = parsePrice(p.preco);

      html += '<div class="preview-product-card">';

      // Foto
      html += '<div class="preview-product-img-wrap">';
      if (p.imagem_url) {
        html += '<img src="' + escapeHtml(p.imagem_url) + '" alt="' + escapeHtml(p.nome) + '" class="preview-product-img" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><div class="preview-product-img-placeholder" style="display:none;"><i class="fas fa-box"></i></div>';
      } else {
        html += '<div class="preview-product-img-placeholder"><i class="fas fa-box"></i></div>';
      }
      html += '</div>';

      // Body
      html += '<div class="preview-product-body">';
      html += '<div class="preview-product-name">' + escapeHtml(p.nome) + '</div>';
      if (priceNum !== null) {
        html += '<div class="preview-product-price" style="color:' + corTema + ';">' + fmtPrice(p.preco) + '</div>';
      }
      if (p.descricao) {
        html += '<div class="preview-product-desc">' + escapeHtml(p.descricao) + '</div>';
      }
      if (p.categoria) {
        html += '<span class="preview-product-badge" style="background:' + hexToRgba(corTema, 0.10) + ';color:' + corTema + ';">' + escapeHtml(p.categoria) + '</span>';
      }
      if (p.codigo) {
        html += '<div class="preview-product-code">Cod: ' + escapeHtml(p.codigo) + '</div>';
      }

      // Botao adicionar
      html += '<div class="preview-product-footer">';
      html += '<button class="preview-btn-cart' + (inCart ? ' added' : '') + '" data-prod-id="' + p.id + '">';
      html += inCart ? '<i class="fas fa-check"></i> Adicionado' : '<i class="fas fa-plus"></i> Adicionar';
      html += '</button>';
      html += '</div>';

      html += '</div></div>';
    });

    els.productsGrid.innerHTML = html;
  }

  function updateResultsCount() {
    var total = state.produtos.length;
    var shown = state.filtered.length;
    if (shown === total) {
      els.resultsCount.textContent = total + ' produto' + (total !== 1 ? 's' : '');
    } else {
      els.resultsCount.textContent = shown + ' de ' + total + ' produto' + (total !== 1 ? 's' : '');
    }
  }

  /* ─── Carrinho ─── */
  function addToCart(prodId) {
    var existing = state.cart.filter(function (c) { return c.id === prodId; });
    if (existing.length) return;

    var prod = null;
    for (var i = 0; i < state.produtos.length; i++) {
      if (state.produtos[i].id === prodId) { prod = state.produtos[i]; break; }
    }
    if (!prod) return;

    state.cart.push({ id: prodId, nome: prod.nome, preco: prod.preco, qtd: 1 });
    updateCartUI();
    renderProducts();
  }

  function removeFromCart(prodId) {
    state.cart = state.cart.filter(function (c) { return c.id !== prodId; });
    updateCartUI();
    renderProducts();
  }

  function updateQty(prodId, delta) {
    for (var i = 0; i < state.cart.length; i++) {
      if (state.cart[i].id === prodId) {
        state.cart[i].qtd = Math.max(1, state.cart[i].qtd + delta);
        break;
      }
    }
    updateCartUI();
  }

  function updateCartUI() {
    var count = 0;
    var total = 0;

    state.cart.forEach(function (item) {
      count += item.qtd;
      var priceNum = parsePrice(item.preco);
      if (priceNum !== null) total += priceNum * item.qtd;
    });

    if (count > 0) {
      els.cartBadgeHeader.textContent = count;
      els.cartBadgeHeader.classList.add('visible');
      els.cartFab.classList.add('has-items');
      els.cartFabBadge.textContent = count;
    } else {
      els.cartBadgeHeader.classList.remove('visible');
      els.cartFab.classList.remove('has-items');
    }

    els.cartTotal.textContent = fmtPrice(total);

    if (count === 0) {
      els.cartEmpty.classList.remove('hidden');
      els.cartFooter.classList.add('hidden');
      return;
    }

    els.cartEmpty.classList.add('hidden');
    els.cartFooter.classList.remove('hidden');

    var html = '';
    state.cart.forEach(function (item) {
      var priceNum = parsePrice(item.preco);
      var itemTotal = priceNum !== null ? priceNum * item.qtd : 0;

      html += '<div class="preview-cart-item">';
      html += '<div class="preview-cart-item-img" style="display:flex;align-items:center;justify-content:center;font-size:0.85rem;color:#94a3b8;"><i class="fas fa-box"></i></div>';
      html += '<div class="preview-cart-item-info">';
      html += '<div class="preview-cart-item-name">' + escapeHtml(item.nome) + '</div>';
      html += '<div class="preview-cart-item-price">' + fmtPrice(item.preco) + '</div>';
      html += '<div class="preview-cart-item-qty">';
      html += '<button class="preview-cart-qty-btn" data-prod-id="' + item.id + '" data-qty-delta="-1"><i class="fas fa-minus"></i></button>';
      html += '<span class="preview-cart-qty-value">' + item.qtd + '</span>';
      html += '<button class="preview-cart-qty-btn" data-prod-id="' + item.id + '" data-qty-delta="1"><i class="fas fa-plus"></i></button>';
      html += '</div>';
      html += '</div>';
      html += '<div class="flex flex-col items-end justify-between">';
      html += '<button class="preview-cart-item-remove" data-prod-id="' + item.id + '" aria-label="Remover"><i class="fas fa-times"></i></button>';
      html += '<div class="preview-cart-item-total">' + fmtPrice(itemTotal) + '</div>';
      html += '</div>';
      html += '</div>';
    });

    els.cartItems.innerHTML = html;
  }

  function sendWhatsApp() {
    if (!state.cart.length) return;
    var lines = [];
    lines.push('*Pedido - ' + state.catalogo.nome_loja + '*');
    lines.push('');
    var total = 0;
    state.cart.forEach(function (item) {
      var priceNum = parsePrice(item.preco);
      var itemTotal = priceNum !== null ? priceNum * item.qtd : 0;
      total += itemTotal;
      lines.push(item.qtd + 'x ' + item.nome + ' - ' + fmtPrice(itemTotal));
    });
    lines.push('');
    lines.push('*Total: ' + fmtPrice(total) + '*');
    var msg = encodeURIComponent(lines.join('\n'));
    var numero = (state.catalogo.whatsapp || '').replace(/\D/g, '');
    var url = numero ? 'https://wa.me/55' + numero + '?text=' + msg : 'https://wa.me/?text=' + msg;
    window.open(url, '_blank');
  }

  /* ─── Init ─── */
  function init() {
    var slug = getSlugFromURL();
    if (!slug) {
      els.loadingState.classList.add('hidden');
      els.errorState.classList.remove('hidden');
      els.errorState.querySelector('.error-text').textContent = 'URL invalida';
      return;
    }

    fetchCatalogo(slug)
      .then(function (data) {
        if (!data.success) throw new Error('Catalogo nao encontrado');
        state.catalogo = data.catalogo;
        state.produtos = data.produtos || [];
        state.filtered = state.produtos.slice();

        els.loadingState.classList.add('hidden');
        els.catalogContent.classList.remove('hidden');

        renderStore(state.catalogo);
        populateCategories();
        renderProducts();
        updateResultsCount();

        // Share button
        var shareUrl = window.location.href;
        els.btnShare.href = 'https://wa.me/?text=' + encodeURIComponent('Confira o catalogo ' + state.catalogo.nome_loja + ': ' + shareUrl);
      })
      .catch(function (err) {
        els.loadingState.classList.add('hidden');
        els.errorState.classList.remove('hidden');
        els.errorState.querySelector('.error-text').textContent = err.message || 'Erro ao carregar catalogo';
      });
  }

  /* ─── Eventos ─── */
  els.searchInput.addEventListener('input', debounce(function () {
    state.search = this.value;
    applyFilters();
  }, 200));

  els.filterCategoria.addEventListener('change', function () {
    state.filterCat = this.value;
    applyFilters();
  });

  els.filterPreco.addEventListener('change', function () {
    state.filterPrice = this.value;
    applyFilters();
  });

  els.productsGrid.addEventListener('click', function (e) {
    var btn = e.target.closest('.preview-btn-cart');
    if (!btn) return;
    var id = btn.getAttribute('data-prod-id');
    if (id) addToCart(id);
  });

  els.cartItems.addEventListener('click', function (e) {
    var btn;
    btn = e.target.closest('.preview-cart-qty-btn');
    if (btn) {
      var id = btn.getAttribute('data-prod-id');
      var delta = parseInt(btn.getAttribute('data-qty-delta'), 10);
      if (id && !isNaN(delta)) updateQty(id, delta);
      return;
    }
    btn = e.target.closest('.preview-cart-item-remove');
    if (btn) {
      var rid = btn.getAttribute('data-prod-id');
      if (rid) removeFromCart(rid);
    }
  });

  function openCart() {
    els.cartOverlay.classList.add('open');
    els.cartSidebar.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    els.cartOverlay.classList.remove('open');
    els.cartSidebar.classList.remove('open');
    document.body.style.overflow = '';
  }

  els.btnOpenCart.addEventListener('click', function () { updateCartUI(); openCart(); });
  els.cartFab.addEventListener('click', function () { updateCartUI(); openCart(); });
  els.btnCloseCart.addEventListener('click', closeCart);
  els.cartOverlay.addEventListener('click', closeCart);
  els.btnWhatsAppCart.addEventListener('click', sendWhatsApp);

  // Iniciar
  init();

})();
