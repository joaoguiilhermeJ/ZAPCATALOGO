"use strict";

console.log("catalogo.js carregado");

// ============================================================
// APP STATE
// ============================================================
const APP = {
  apiBaseUrl: (() => {
    try {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") return "/api";
      if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(host))
        return "/api";
      if (window.API_URL) return window.API_URL.replace(/\/$/, "") + "/api";
      return "/api";
    } catch (e) {
      return "/api";
    }
  })(),
  catalog: null,
  cart: [],
  filteredProducts: [],
  allProducts: [],
  currentFilters: {
    category: "todos",
    search: "",
    sortBy: "relevance",
    maxPrice: 10000,
  },
};

// ============================================================
// UTILITIES
// ============================================================
function escapeHTML(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "108, 92, 231";
}

function shadeColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
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

// ============================================================
// TOAST
// ============================================================
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  const isSuccess = type === "success";
  const iconClass = isSuccess ? "fa-circle-check text-emerald-500" : "fa-info-circle text-blue-500";
  toast.innerHTML = `
    <i class="fas ${iconClass} text-lg"></i>
    <span class="text-sm font-semibold flex-1">${escapeHTML(message)}</span>
    <button class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(toast);

  const closeBtn = toast.querySelector("button");
  const dismiss = () => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  };
  closeBtn?.addEventListener("click", dismiss);
  setTimeout(dismiss, 5000);
}

// ============================================================
// LOADING / ERROR / CONTENT
// ============================================================
function showLoading() {
  document.getElementById("loadingState")?.classList.remove("hidden");
  document.getElementById("contentState")?.classList.add("hidden");
  document.getElementById("errorState")?.classList.add("hidden");
}

function showContent() {
  document.getElementById("loadingState")?.classList.add("hidden");
  document.getElementById("contentState")?.classList.remove("hidden");
  document.getElementById("errorState")?.classList.add("hidden");
}

function showError(message) {
  document.getElementById("loadingState")?.classList.add("hidden");
  document.getElementById("contentState")?.classList.add("hidden");
  document.getElementById("errorState")?.classList.remove("hidden");
  showToast(message, "error");
}

// ============================================================
// CART FUNCTIONS
// ============================================================
function addToCart(productId, productName, productPrice) {
  const existing = APP.cart.find(item => item.productId === productId);
  if (existing) existing.quantity += 1;
  else APP.cart.push({ productId, productName, productPrice: parseFloat(productPrice) || 0, quantity: 1 });
  updateCartUI();
  showToast(`${productName} adicionado à sacola!`, "success");
}

function removeFromCart(productId) {
  APP.cart = APP.cart.filter(item => item.productId !== productId);
  updateCartUI();
}

function updateCartQuantity(productId, quantity) {
  const item = APP.cart.find(i => i.productId === productId);
  if (item) {
    if (quantity <= 0) removeFromCart(productId);
    else { item.quantity = quantity; updateCartUI(); }
  }
}

function updateCartUI() {
  const totalItems = APP.cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = APP.cart.reduce((sum, i) => sum + i.productPrice * i.quantity, 0);

  const badge = document.getElementById("cartBadgeCount");
  if (badge) badge.textContent = totalItems;

  const subtotal = document.getElementById("cartSubtotal");
  if (subtotal) subtotal.textContent = formatPrice(totalPrice);

  const container = document.getElementById("cartItemsContainer");
  const empty = document.getElementById("emptyCartMessage");
  if (!container) return;

  if (APP.cart.length === 0) {
    container.innerHTML = "";
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");

  container.innerHTML = APP.cart.map(item => `
    <div class="cart-item">
      <div class="item-info">
        <div class="name">${escapeHTML(item.productName)}</div>
        <div class="price">${formatPrice(item.productPrice)}</div>
      </div>
      <div class="item-actions">
        <button class="qty-btn" data-product-id="${item.productId}" data-action="decrease">−</button>
        <span class="qty">${item.quantity}</span>
        <button class="qty-btn" data-product-id="${item.productId}" data-action="increase">+</button>
        <button class="remove" data-product-id="${item.productId}"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');

  // Event listeners para os botões do carrinho
  container.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const id = this.dataset.productId;
      const item = APP.cart.find(i => i.productId === id);
      if (!item) return;
      const newQty = this.dataset.action === "increase" ? item.quantity + 1 : item.quantity - 1;
      updateCartQuantity(id, newQty);
    });
  });
  container.querySelectorAll(".remove").forEach(btn => {
    btn.addEventListener("click", function() {
      removeFromCart(this.dataset.productId);
    });
  });
}

function generateOrderMessage() {
  if (APP.cart.length === 0) return "";
  let msg = "🛍️ *Novo Pedido*\n\n";
  APP.cart.forEach((item, i) => {
    msg += `${i+1}. ${item.productName}\n`;
    msg += `   Quantidade: ${item.quantity}x\n`;
    msg += `   Subtotal: ${formatPrice(item.productPrice * item.quantity)}\n\n`;
  });
  const total = APP.cart.reduce((sum, i) => sum + i.productPrice * i.quantity, 0);
  msg += `*Total: ${formatPrice(total)}*\n\n`;
  msg += "Favor confirmar disponibilidade e forma de pagamento.";
  return msg;
}

function sendToWhatsApp(message) {
  const number = APP.catalog?.whatsapp?.replace(/\D/g, "") || "";
  if (!number) {
    showToast("Número do WhatsApp não configurado.", "error");
    return;
  }
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function sendOrderViaWhatsApp() {
  const msg = generateOrderMessage();
  if (!msg) {
    showToast("Sacola vazia. Adicione produtos.", "error");
    return;
  }
  sendToWhatsApp(msg);
  APP.cart = [];
  updateCartUI();
  closeCartDrawer();
  showToast("Pedido enviado! Acompanhe no WhatsApp.", "success");
}

// ============================================================
// DRAWER CONTROLS
// ============================================================
function openCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const panel = drawer?.querySelector(".drawer-panel");
  if (!drawer || !panel) return;
  drawer.classList.remove("hidden");
  setTimeout(() => panel.classList.add("open"), 10);
}

function closeCartDrawer() {
  const panel = document.querySelector("#cartDrawer .drawer-panel");
  if (panel) panel.classList.remove("open");
  setTimeout(() => {
    const drawer = document.getElementById("cartDrawer");
    if (drawer) drawer.classList.add("hidden");
  }, 300);
}

// ============================================================
// PRODUCT RENDERING
// ============================================================
function createProductCard(product) {
  const { id, nome, preco, descricao, categoria } = product;
  const themeColor = APP.catalog?.cor_tema || "#6C5CE7";
  const card = document.createElement("div");
  card.className = "product-card";

  const priceNum = parseFloat(preco) || 0;
  const priceFormatted = formatPrice(priceNum);
  const nameEsc = escapeHTML(nome || "Produto");
  const descEsc = escapeHTML(descricao?.substring(0, 60) || "");
  const catEsc = escapeHTML(categoria || "Geral");
  const productId = id || Math.random().toString(36).substr(2, 9);

  card.innerHTML = `
    <div class="product-image">📦</div>
    <div class="product-body">
      <h3 class="product-title">${nameEsc}</h3>
      ${descEsc ? `<p class="product-description">${descEsc}</p>` : ''}
      <span class="product-category">${catEsc}</span>
      <div class="product-footer">
        <span class="product-price">${priceFormatted}</span>
        <button class="btn-add-cart" data-product-id="${productId}" data-product-name="${nameEsc}" data-product-price="${priceNum}">
          <i class="fas fa-plus"></i>
        </button>
      </div>
      <button class="btn-buy" data-product-id="${productId}" data-product-name="${nameEsc}" data-product-price="${priceNum}">
        <i class="fab fa-whatsapp"></i> Comprar
      </button>
    </div>
  `;

  // Event listeners inline (via delegação global, mas também podemos adicionar diretamente)
  return card;
}

function renderProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;
  container.innerHTML = "";

  if (APP.filteredProducts.length === 0) {
    document.getElementById("noResultsState")?.classList.remove("hidden");
    return;
  }
  document.getElementById("noResultsState")?.classList.add("hidden");

  APP.filteredProducts.forEach(product => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
}

function renderCategoryFilters() {
  const categories = new Set(["Todos"]);
  APP.allProducts.forEach(p => {
    if (p.categoria) categories.add(p.categoria);
  });
  const container = document.getElementById("categoryFilters");
  if (!container) return;

  // Remove os existentes (exceto o "Todos" que será mantido)
  const todosBtn = container.querySelector('[data-category="todos"]');
  container.innerHTML = '';
  if (todosBtn) {
    todosBtn.className = "category-filter active";
    todosBtn.textContent = "Todos";
    todosBtn.dataset.category = "todos";
    container.appendChild(todosBtn);
  } else {
    const btn = document.createElement("button");
    btn.className = "category-filter active";
    btn.textContent = "Todos";
    btn.dataset.category = "todos";
    container.appendChild(btn);
  }

  const themeColor = APP.catalog?.cor_tema || "#6C5CE7";

  categories.forEach(cat => {
    if (cat === "Todos") return;
    const btn = document.createElement("button");
    btn.className = "category-filter";
    btn.textContent = cat;
    btn.dataset.category = cat.toLowerCase();
    container.appendChild(btn);
  });

  // Adicionar evento de clique a todos
  container.querySelectorAll(".category-filter").forEach(btn => {
    btn.addEventListener("click", function() {
      APP.currentFilters.category = this.dataset.category;
      filterProducts();

      container.querySelectorAll(".category-filter").forEach(b => {
        b.classList.remove("active");
        b.style.background = "";
        b.style.color = "";
      });
      this.classList.add("active");
      if (this.dataset.category !== "todos") {
        this.style.background = themeColor;
        this.style.color = "#fff";
      } else {
        this.style.background = "";
        this.style.color = "";
      }
    });
  });
}

// ============================================================
// FILTER & SORT
// ============================================================
function filterProducts() {
  let filtered = [...APP.allProducts];

  if (APP.currentFilters.category !== "todos") {
    filtered = filtered.filter(p => p.categoria?.toLowerCase() === APP.currentFilters.category);
  }

  if (APP.currentFilters.search.trim()) {
    const term = APP.currentFilters.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.nome?.toLowerCase().includes(term) ||
      p.descricao?.toLowerCase().includes(term) ||
      p.categoria?.toLowerCase().includes(term)
    );
  }

  filtered = filtered.filter(p => (parseFloat(p.preco) || 0) <= APP.currentFilters.maxPrice);

  switch (APP.currentFilters.sortBy) {
    case "price-low":
      filtered.sort((a, b) => parseFloat(a.preco || 0) - parseFloat(b.preco || 0));
      break;
    case "price-high":
      filtered.sort((a, b) => parseFloat(b.preco || 0) - parseFloat(a.preco || 0));
      break;
    case "newest":
      filtered.reverse();
      break;
    default:
      // relevância: mantém a ordem original
      break;
  }

  APP.filteredProducts = filtered;
  renderProducts();
}

// ============================================================
// RENDER CATALOG
// ============================================================
function renderCatalog() {
  if (!APP.catalog) return;
  const { nome_loja, logo_url, cor_tema, whatsapp } = APP.catalog;
  const themeColor = cor_tema || "#6C5CE7";
  const storeName = nome_loja || "Minha Loja";

  // Hero
  const heroSection = document.getElementById("heroSection");
  if (heroSection) {
    heroSection.style.background = `linear-gradient(135deg, ${themeColor} 0%, ${shadeColor(themeColor, -20)} 100%)`;
  }
  const heroName = document.getElementById("heroStoreName");
  if (heroName) heroName.textContent = storeName;

  // Logo
  if (logo_url) {
    const emoji = document.getElementById("heroLogoEmoji");
    if (emoji) emoji.style.display = "none";
    const img = document.getElementById("heroLogoImg");
    if (img) {
      img.src = logo_url;
      img.classList.remove("hidden");
    }
  }

  // WhatsApp
  const number = whatsapp?.replace(/\D/g, "") || "";
  const cta = document.getElementById("heroCTAWhatsApp");
  if (cta && number) cta.href = `https://wa.me/${number}`;

  // Render
  renderProducts();
  renderCategoryFilters();

  // Aplicar cor primária como variável CSS
  document.documentElement.style.setProperty("--primary", themeColor);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function setupEventListeners() {
  // Carrinho
  const btnCart = document.getElementById("btnCart");
  if (btnCart) btnCart.addEventListener("click", openCartDrawer);
  document.getElementById("closeCartDrawer")?.addEventListener("click", closeCartDrawer);
  document.getElementById("cartBackdrop")?.addEventListener("click", closeCartDrawer);
  document.getElementById("continuShoppingBtn")?.addEventListener("click", closeCartDrawer);
  document.getElementById("confirmOrderBtn")?.addEventListener("click", sendOrderViaWhatsApp);

  // Busca
  const searchInput = document.getElementById("searchInput");
  const searchClear = document.getElementById("searchClear");
  const searchResults = document.getElementById("searchResults");

  if (searchInput) {
    searchInput.addEventListener("input", function() {
      const val = this.value;
      APP.currentFilters.search = val;
      searchClear?.classList.toggle("hidden", !val.trim());

      // Resultados rápidos
      if (val.trim().length > 0) {
        const results = APP.allProducts.filter(p =>
          p.nome?.toLowerCase().includes(val.toLowerCase())
        ).slice(0, 5);
        if (results.length > 0 && searchResults) {
          searchResults.innerHTML = results.map(p => `
            <div class="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0" data-product-id="${p.id}">
              <p class="text-sm font-semibold text-slate-900">${escapeHTML(p.nome)}</p>
              <p class="text-xs text-slate-500">${formatPrice(parseFloat(p.preco) || 0)}</p>
            </div>
          `).join('');
          searchResults.classList.remove("hidden");

          searchResults.querySelectorAll("div").forEach(el => {
            el.addEventListener("click", function() {
              const pid = this.dataset.productId;
              const product = APP.allProducts.find(p => p.id === pid);
              if (product) {
                addToCart(product.id, product.nome, product.preco);
                searchInput.value = "";
                searchClear?.classList.add("hidden");
                searchResults.classList.add("hidden");
                APP.currentFilters.search = "";
                filterProducts();
              }
            });
          });
        } else {
          searchResults?.classList.add("hidden");
        }
      } else {
        searchResults?.classList.add("hidden");
      }

      filterProducts();
    });
  }

  if (searchClear) {
    searchClear.addEventListener("click", function() {
      if (searchInput) {
        searchInput.value = "";
        APP.currentFilters.search = "";
        searchResults?.classList.add("hidden");
        this.classList.add("hidden");
        filterProducts();
      }
    });
  }

  // Ordenação
  document.getElementById("sortSelect")?.addEventListener("change", function() {
    APP.currentFilters.sortBy = this.value;
    filterProducts();
  });

  // Preço
  const priceRange = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");
  if (priceRange) {
    priceRange.addEventListener("input", function() {
      const val = parseFloat(this.value);
      APP.currentFilters.maxPrice = val;
      if (priceValue) priceValue.textContent = formatPrice(val);
      filterProducts();
    });
  }

  // Cliques em botões dos cards (delegação)
  document.addEventListener("click", function(e) {
    const target = e.target.closest(".btn-add-cart");
    if (target) {
      e.preventDefault();
      addToCart(target.dataset.productId, target.dataset.productName, target.dataset.productPrice);
      return;
    }
    const buyBtn = e.target.closest(".btn-buy");
    if (buyBtn) {
      e.preventDefault();
      const msg = `Olá! Vi seu catálogo e quero comprar o produto:\n\n*${buyBtn.dataset.productName}*\nValor: ${formatPrice(parseFloat(buyBtn.dataset.productPrice) || 0)}\n\nEstá disponível?`;
      sendToWhatsApp(msg);
    }
  });

  // Fechar resultados ao clicar fora
  document.addEventListener("click", function(e) {
    if (!e.target.closest("#searchInput") && !e.target.closest("#searchResults")) {
      searchResults?.classList.add("hidden");
    }
  });
}

// ============================================================
// FETCH CATALOG
// ============================================================
function getCatalogHash() {
  const params = new URLSearchParams(window.location.search);
  const hash = params.get("hash") || params.get("slug");
  if (hash) return hash;
  const parts = window.location.pathname.split("/");
  if (parts[1] === "c" && parts[2]) return parts[2];
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
    if (err.name === "AbortError") throw new Error("Requisição expirou. Verifique sua conexão.");
    throw err;
  }
}

async function loadCatalog() {
  console.log("loadCatalog iniciado");
  try {
    const hash = getCatalogHash();
    if (!hash) {
      showError("Hash do catálogo não encontrado na URL");
      return;
    }

    const response = await fetchWithTimeout(`${APP.apiBaseUrl}/loja/${hash}`, {}, 15000);
    if (!response.ok) {
      if (response.status === 404) showError("Catálogo não encontrado");
      else showError("Erro ao carregar catálogo. Tente novamente.");
      return;
    }

    const data = await response.json();
    if (!data.success) {
      showError(data.error || "Erro ao carregar catálogo");
      return;
    }

    APP.catalog = data.catalogo;
    APP.allProducts = data.produtos || [];
    APP.filteredProducts = [...APP.allProducts];

    renderCatalog();
    setupEventListeners();
    showContent();
  } catch (error) {
    console.error(error);
    showError(error.message || "Erro ao carregar catálogo");
  }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOMContentLoaded");
  showLoading();
  loadCatalog();
});