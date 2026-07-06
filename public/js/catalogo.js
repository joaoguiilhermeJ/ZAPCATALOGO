"use strict";

console.log("catalogo.js carregado");

// ===== CONFIGURAÇÕES =====
const APP = {
  // URL da API (ajuste conforme seu backend)
  apiBaseUrl: (() => {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return '/api';
    // Em produção, use a URL do backend
    return window.API_URL || 'https://seu-backend.com/api';
  })(),

  catalog: null,
  allProducts: [],
  filteredProducts: [],
  cart: [],
  currentFilters: {
    category: 'todos',
    search: '',
    sortBy: 'relevance',
    maxPrice: 10000,
  },
  themeColor: '#6C5CE7',
};

// ===== UTILITÁRIOS =====
function escapeHTML(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '108, 92, 231';
}

function shadeColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

// ===== TOAST =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const isSuccess = type === 'success';
  const bgClass = isSuccess
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : 'bg-blue-50 border-blue-200 text-blue-800';
  const iconClass = isSuccess
    ? 'fa-circle-check text-emerald-500'
    : 'fa-info-circle text-blue-500';

  const toast = document.createElement('div');
  toast.className = `flex items-center gap-3 p-4 rounded-xl border shadow-lg transition-all ${bgClass}`;
  toast.innerHTML = `
    <i class="fas ${iconClass} text-lg shrink-0"></i>
    <p class="text-sm font-semibold flex-1">${escapeHTML(message)}</p>
    <button class="text-slate-400 hover:text-slate-600 shrink-0"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(toast);

  const closeBtn = toast.querySelector('button');
  const dismiss = () => {
    toast.classList.add('opacity-0', 'translate-x-96');
    setTimeout(() => toast.remove(), 300);
  };
  closeBtn?.addEventListener('click', dismiss);
  setTimeout(dismiss, 5000);
}

// ===== LOADING / ERROR =====
function showLoading() {
  document.getElementById('loadingState')?.classList.remove('hidden');
  document.getElementById('contentState')?.classList.add('hidden');
  document.getElementById('errorState')?.classList.add('hidden');
}

function showContent() {
  document.getElementById('loadingState')?.classList.add('hidden');
  document.getElementById('contentState')?.classList.remove('hidden');
  document.getElementById('errorState')?.classList.add('hidden');
}

function showError(message) {
  document.getElementById('loadingState')?.classList.add('hidden');
  document.getElementById('contentState')?.classList.add('hidden');
  document.getElementById('errorState')?.classList.remove('hidden');
  showToast(message, 'error');
}

// ===== CARRINHO =====
function updateCartUI() {
  const cartCount = APP.cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = APP.cart.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);

  // Badge flutuante
  const badge = document.getElementById('cartBadge');
  const badgeCount = document.getElementById('cartBadgeCount');
  if (badge) {
    if (cartCount > 0) {
      badge.classList.remove('hidden');
      badge.textContent = cartCount;
    } else {
      badge.classList.add('hidden');
    }
  }
  if (badgeCount) badgeCount.textContent = cartCount;

  // Subtotal no drawer
  const subtotalEl = document.getElementById('cartSubtotal');
  if (subtotalEl) subtotalEl.textContent = formatPrice(cartTotal);

  // Lista de itens
  const container = document.getElementById('cartItemsContainer');
  const emptyMsg = document.getElementById('emptyCartMessage');
  if (!container) return;

  if (APP.cart.length === 0) {
    container.innerHTML = '';
    if (emptyMsg) emptyMsg.classList.remove('hidden');
    return;
  }
  if (emptyMsg) emptyMsg.classList.add('hidden');

  container.innerHTML = APP.cart
    .map(
      (item) => `
    <div class="cart-item">
      <div>
        <div class="item-name">${escapeHTML(item.productName)}</div>
        <div class="item-price">${formatPrice(item.productPrice)}</div>
      </div>
      <div class="flex items-center gap-2">
        <button class="qty-btn" data-product-id="${item.productId}" data-action="decrease">−</button>
        <span class="w-6 text-center font-bold text-sm">${item.quantity}</span>
        <button class="qty-btn" data-product-id="${item.productId}" data-action="increase">+</button>
        <button class="remove-btn" data-product-id="${item.productId}"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `
    )
    .join('');

  // Eventos dos botões
  container.querySelectorAll('.qty-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      const id = this.dataset.productId;
      const item = APP.cart.find((i) => i.productId === id);
      if (!item) return;
      const newQty =
        this.dataset.action === 'increase' ? item.quantity + 1 : item.quantity - 1;
      updateCartQuantity(id, newQty);
    });
  });

  container.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      removeFromCart(this.dataset.productId);
    });
  });
}

function addToCart(productId, productName, productPrice) {
  const existing = APP.cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    APP.cart.push({
      productId,
      productName,
      productPrice: parseFloat(productPrice) || 0,
      quantity: 1,
    });
  }
  updateCartUI();
  showToast(`${productName} adicionado à sacola!`, 'success');
}

function removeFromCart(productId) {
  APP.cart = APP.cart.filter((item) => item.productId !== productId);
  updateCartUI();
}

function updateCartQuantity(productId, quantity) {
  const item = APP.cart.find((i) => i.productId === productId);
  if (!item) return;
  if (quantity <= 0) {
    removeFromCart(productId);
  } else {
    item.quantity = quantity;
    updateCartUI();
  }
}

function clearCart() {
  APP.cart = [];
  updateCartUI();
}

// ===== WHATSAPP =====
function generateOrderMessage() {
  if (APP.cart.length === 0) return '';
  let msg = '🛍️ *Novo Pedido*\n\n';
  msg += '*Produtos:*\n';
  APP.cart.forEach((item, i) => {
    msg += `${i + 1}. ${item.productName} — ${item.quantity}x — ${formatPrice(item.productPrice * item.quantity)}\n`;
  });
  const total = APP.cart.reduce((sum, i) => sum + i.productPrice * i.quantity, 0);
  msg += `\n*Total: ${formatPrice(total)}*`;
  return msg;
}

function sendToWhatsApp(message) {
  const whatsapp = APP.catalog?.whatsapp?.replace(/\D/g, '') || '';
  if (!whatsapp) {
    showToast('Número do WhatsApp não configurado.', 'error');
    return;
  }
  const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

function sendOrder() {
  const msg = generateOrderMessage();
  if (!msg) {
    showToast('Sacola vazia. Adicione produtos primeiro.', 'error');
    return;
  }
  sendToWhatsApp(msg);
  clearCart();
  closeCartDrawer();
  showToast('Pedido enviado! Acompanhe no WhatsApp.', 'success');
}

// ===== DRAWER =====
function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;
  drawer.classList.remove('hidden');
  // Pequeno delay para a animação
  requestAnimationFrame(() => {
    const panel = drawer.querySelector('.drawer-panel');
    if (panel) panel.classList.add('open');
  });
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;
  const panel = drawer.querySelector('.drawer-panel');
  if (panel) panel.classList.remove('open');
  setTimeout(() => {
    drawer.classList.add('hidden');
  }, 350);
}

// ===== RENDER =====
function renderCatalog() {
  if (!APP.catalog) return;
  const { nome_loja, logo_url, cor_tema, whatsapp } = APP.catalog;
  const themeColor = cor_tema || '#6C5CE7';
  APP.themeColor = themeColor;

  // Hero
  document.getElementById('heroStoreName').textContent = nome_loja || 'Minha Loja';
  if (logo_url) {
    document.getElementById('heroLogoEmoji').style.display = 'none';
    const img = document.getElementById('heroLogoImg');
    img.src = logo_url;
    img.classList.remove('hidden');
  }
  if (whatsapp) {
    document.getElementById('heroCTAWhatsApp').href = `https://wa.me/${whatsapp.replace(/\D/g, '')}`;
  }

  // Aplicar cor tema
  const hero = document.getElementById('heroSection');
  hero.style.background = `linear-gradient(135deg, ${themeColor}, ${shadeColor(themeColor, -20)})`;

  // Renderizar produtos e categorias
  renderProducts();
  renderCategoryFilters();
}

function renderProducts() {
  const container = document.getElementById('productsContainer');
  if (!container) return;
  container.innerHTML = '';

  if (APP.filteredProducts.length === 0) {
    document.getElementById('noResultsState')?.classList.remove('hidden');
    return;
  }
  document.getElementById('noResultsState')?.classList.add('hidden');

  APP.filteredProducts.forEach((product) => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
}

function createProductCard(product) {
  const { id, nome, preco, descricao, categoria } = product;
  const theme = APP.themeColor;
  const card = document.createElement('div');
  card.className = 'product-card';

  const priceNum = parseFloat(preco) || 0;
  const productId = id || Math.random().toString(36).substr(2, 9);

  card.innerHTML = `
    <div class="product-image">📦</div>
    <div class="p-3 space-y-2 flex flex-col flex-1">
      <h3 class="product-title">${escapeHTML(nome || 'Produto')}</h3>
      ${descricao ? `<p class="text-xs text-slate-500 line-clamp-2">${escapeHTML(descricao)}</p>` : ''}
      <span class="inline-block text-xs font-semibold px-2 py-0.5 rounded-full" style="background:${theme}20; color:${theme}">${escapeHTML(categoria || 'Geral')}</span>
      <div class="flex items-center justify-between pt-1">
        <span class="product-price">${formatPrice(priceNum)}</span>
        <button class="btn-cart w-10 h-10 rounded-full flex items-center justify-center text-white" style="background:${theme}" data-product-id="${productId}" data-product-name="${escapeHTML(nome)}" data-product-price="${priceNum}">
          <i class="fas fa-plus"></i>
        </button>
      </div>
      <button class="btn-buy" data-product-id="${productId}" data-product-name="${escapeHTML(nome)}" data-product-price="${priceNum}">
        <i class="fab fa-whatsapp"></i> Comprar
      </button>
    </div>
  `;

  // Eventos via delegação (já tratados globalmente), mas pode adicionar diretamente
  return card;
}

function renderCategoryFilters() {
  const categories = new Set(['todos']);
  APP.allProducts.forEach((p) => {
    if (p.categoria) categories.add(p.categoria.toLowerCase());
  });

  const container = document.getElementById('categoryFilters');
  if (!container) return;

  // Limpa (mantém apenas o "Todos" que já existe)
  container.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'category-filter active';
  allBtn.dataset.category = 'todos';
  allBtn.textContent = 'Todos';
  container.appendChild(allBtn);

  categories.forEach((cat) => {
    if (cat === 'todos') return;
    const btn = document.createElement('button');
    btn.className = 'category-filter';
    btn.dataset.category = cat;
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    container.appendChild(btn);
  });

  // Event listeners
  container.querySelectorAll('.category-filter').forEach((btn) => {
    btn.addEventListener('click', function () {
      container.querySelectorAll('.category-filter').forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
      APP.currentFilters.category = this.dataset.category;
      filterProducts();
    });
  });
}

// ===== FILTROS =====
function filterProducts() {
  let filtered = [...APP.allProducts];

  const { category, search, sortBy, maxPrice } = APP.currentFilters;

  if (category !== 'todos') {
    filtered = filtered.filter((p) => p.categoria?.toLowerCase() === category);
  }

  if (search.trim()) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.nome?.toLowerCase().includes(term) ||
        p.descricao?.toLowerCase().includes(term) ||
        p.categoria?.toLowerCase().includes(term)
    );
  }

  filtered = filtered.filter((p) => (parseFloat(p.preco) || 0) <= maxPrice);

  switch (sortBy) {
    case 'price-low':
      filtered.sort((a, b) => (parseFloat(a.preco) || 0) - (parseFloat(b.preco) || 0));
      break;
    case 'price-high':
      filtered.sort((a, b) => (parseFloat(b.preco) || 0) - (parseFloat(a.preco) || 0));
      break;
    case 'newest':
      filtered.reverse();
      break;
    default: // relevância (mantém ordem original)
      break;
  }

  APP.filteredProducts = filtered;
  renderProducts();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Carrinho
  document.getElementById('btnCart')?.addEventListener('click', openCartDrawer);
  document.getElementById('closeCartDrawer')?.addEventListener('click', closeCartDrawer);
  document.getElementById('cartBackdrop')?.addEventListener('click', closeCartDrawer);
  document.getElementById('continuShoppingBtn')?.addEventListener('click', closeCartDrawer);
  document.getElementById('confirmOrderBtn')?.addEventListener('click', sendOrder);

  // Busca
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const searchResults = document.getElementById('searchResults');

  searchInput?.addEventListener('input', function () {
    const val = this.value;
    APP.currentFilters.search = val;
    if (val.trim()) {
      searchClear?.classList.remove('hidden');
      // Sugestões rápidas (opcional)
      const suggestions = APP.allProducts
        .filter((p) => p.nome?.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 5);
      if (suggestions.length > 0) {
        searchResults.innerHTML = suggestions
          .map(
            (p) => `
          <div class="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0" data-product-id="${p.id}">
            <p class="text-sm font-semibold">${escapeHTML(p.nome)}</p>
            <p class="text-xs text-slate-500">${formatPrice(parseFloat(p.preco) || 0)}</p>
          </div>
        `
          )
          .join('');
        searchResults.classList.remove('hidden');
        searchResults.querySelectorAll('div').forEach((el) => {
          el.addEventListener('click', function () {
            const id = this.dataset.productId;
            const product = APP.allProducts.find((p) => p.id === id);
            if (product) {
              addToCart(product.id, product.nome, product.preco);
              searchInput.value = '';
              searchClear?.classList.add('hidden');
              searchResults.classList.add('hidden');
            }
          });
        });
      } else {
        searchResults.classList.add('hidden');
      }
    } else {
      searchClear?.classList.add('hidden');
      searchResults.classList.add('hidden');
    }
    filterProducts();
  });

  searchClear?.addEventListener('click', function () {
    searchInput.value = '';
    APP.currentFilters.search = '';
    this.classList.add('hidden');
    searchResults?.classList.add('hidden');
    filterProducts();
  });

  // Ordenação
  document.getElementById('sortSelect')?.addEventListener('change', function () {
    APP.currentFilters.sortBy = this.value;
    filterProducts();
  });

  // Preço
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
  priceRange?.addEventListener('input', function () {
    const val = parseFloat(this.value);
    APP.currentFilters.maxPrice = val;
    priceValue.textContent = formatPrice(val);
    filterProducts();
  });

  // Delegação de eventos para botões de produto (adicionar/comprar)
  document.addEventListener('click', function (e) {
    const target = e.target.closest('.btn-cart');
    if (target) {
      e.preventDefault();
      const id = target.dataset.productId;
      const name = target.dataset.productName;
      const price = target.dataset.productPrice;
      addToCart(id, name, price);
      return;
    }
    const buyBtn = e.target.closest('.btn-buy');
    if (buyBtn) {
      e.preventDefault();
      const id = buyBtn.dataset.productId;
      const name = buyBtn.dataset.productName;
      const price = buyBtn.dataset.productPrice;
      // Adiciona ao carrinho e já envia? Melhor enviar direto como compra rápida
      const msg = `Olá! Quero comprar o produto:\n\n*${name}*\nValor: ${formatPrice(parseFloat(price) || 0)}\n\nEstá disponível?`;
      sendToWhatsApp(msg);
    }
  });

  // Fechar resultados ao clicar fora
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#searchInput') && !e.target.closest('#searchResults')) {
      searchResults?.classList.add('hidden');
    }
  });
}

// ===== API =====
function getCatalogHash() {
  const params = new URLSearchParams(window.location.search);
  const hash = params.get('hash') || params.get('slug');
  if (hash) return hash;
  const path = window.location.pathname.split('/');
  if (path[1] === 'c' && path[2]) return path[2];
  return null;
}

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function loadCatalog() {
  showLoading();
  const hash = getCatalogHash();

  // DADOS DE EXEMPLO (fallback caso não haja backend)
  const mockData = {
    catalogo: {
      nome_loja: 'Loja Exemplo',
      logo_url: '',
      cor_tema: '#6C5CE7',
      whatsapp: '5511999999999',
    },
    produtos: [
      { id: '1', nome: 'Troca de Bateria iPhone', descricao: 'Bateria nova com calibração', preco: 249.90, categoria: 'Reparo' },
      { id: '2', nome: 'Troca de Câmera Traseira', descricao: 'Troca do módulo traseiro', preco: 399.90, categoria: 'Reparo' },
      { id: '3', nome: 'Troca de Câmera Frontal', descricao: 'Reparo da câmera de selfie', preco: 279.90, categoria: 'Reparo' },
      { id: '4', nome: 'Troca de Conector de Carga', descricao: 'Limpeza e troca da peça', preco: 199.90, categoria: 'Reparo' },
      { id: '5', nome: 'Reparo de Face ID', descricao: 'Diagnóstico e recuperação do sistema', preco: 349.90, categoria: 'Reparo' },
      { id: '6', nome: 'Troca de Alto-falante', descricao: 'Substituição do alto-falante inferior', preco: 189.90, categoria: 'Reparo' },
      { id: '7', nome: 'Carregador Turbo 20W', descricao: 'Carregador rápido USB-C', preco: 89.90, categoria: 'Acessório' },
      { id: '8', nome: 'Capa de Silicone iPhone', descricao: 'Capa anti-impacto', preco: 49.90, categoria: 'Acessório' },
    ],
  };

  try {
    if (!hash) {
      // Se não tiver hash, usa mock
      APP.catalog = mockData.catalogo;
      APP.allProducts = mockData.produtos;
      APP.filteredProducts = [...APP.allProducts];
      renderCatalog();
      setupEventListeners();
      showContent();
      return;
    }

    // Tenta buscar da API
    const url = `${APP.apiBaseUrl}/loja/${hash}`;
    const response = await fetchWithTimeout(url, {}, 15000);
    if (!response.ok) {
      if (response.status === 404) throw new Error('Catálogo não encontrado');
      throw new Error('Erro ao carregar catálogo');
    }
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Erro desconhecido');

    APP.catalog = data.catalogo;
    APP.allProducts = data.produtos || [];
    APP.filteredProducts = [...APP.allProducts];
    renderCatalog();
    setupEventListeners();
    showContent();
  } catch (error) {
    console.warn('Falha na API, usando dados mock:', error.message);
    // Fallback para mock
    APP.catalog = mockData.catalogo;
    APP.allProducts = mockData.produtos;
    APP.filteredProducts = [...APP.allProducts];
    renderCatalog();
    setupEventListeners();
    showContent();
    showToast('Usando dados de exemplo (offline)', 'info');
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', loadCatalog);