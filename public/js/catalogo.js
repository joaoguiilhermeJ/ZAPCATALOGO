"use strict";

console.log("catalogo.js carregado");

const APP = {
  apiBaseUrl: (() => {
    try {
      const host = window.location.hostname;
      // Em dev usamos caminho relativo para que o dev-server (porta 3000) faça proxy para /api
      if (host === "localhost" || host === "127.0.0.1") return "/api";
      // Redes internas também usam proxy relativo
      if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(host))
        return "/api";

      // Em produção, se houver window.API_URL use-a, senão caminho absoluto relativo
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
    category: "all",
    search: "",
    sortBy: "relevance",
    maxPrice: 10000,
  },
};

function escapeHTML(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Log when DOM is ready (from this script) and attempt to wrap any later
// definitions of `loadCatalog` so we can log immediately before it's called.
// Ponto de entrada único: quando DOM pronto, mostrar loading e carregar catálogo
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded");
  try {
    showLoading();
  } catch (e) {
    /* ignore */
  }
  try {
    // chama a função principal
    loadCatalog();
  } catch (e) {
    console.error("Erro ao iniciar loadCatalog():", e);
  }
});

// === Funções de UI / render / eventos (migradas do inline em catalogo.html)
function renderCatalog() {
  if (!APP.catalog) return;

  const { nome_loja, logo_url, cor_tema, whatsapp } = APP.catalog;

  const themeColor = cor_tema || "#8e7cc3";
  const storeName = nome_loja || "Minha Loja";

  // Header
  const headerLogo = document.getElementById("headerLogo");
  if (headerLogo) headerLogo.style.background = themeColor;
  if (logo_url) {
    const hEmoji = document.getElementById("headerLogoEmoji");
    if (hEmoji) hEmoji.style.display = "none";
    const img = document.getElementById("headerLogoImg");
    if (img) {
      img.src = logo_url;
      img.classList.remove("hidden");
    }
  }

  const hs = document.getElementById("headerStoreName");
  if (hs) hs.textContent = storeName;
  const hStatus = document.getElementById("headerStoreStatus");
  if (hStatus) hStatus.textContent = "✅ Online";

  // Hero
  const heroSection = document.getElementById("heroSection");
  if (heroSection)
    heroSection.style.background = `linear-gradient(135deg, ${themeColor} 0%, ${shadeColor(themeColor, -20)} 100%)`;
  const heroName = document.getElementById("heroStoreName");
  if (heroName) heroName.textContent = storeName;
  if (logo_url) {
    const he = document.getElementById("heroLogoEmoji");
    if (he) he.style.display = "none";
    const img = document.getElementById("heroLogoImg");
    if (img) {
      img.src = logo_url;
      img.classList.remove("hidden");
    }
  } else {
    const heroLogo = document.getElementById("heroLogo");
    if (heroLogo) heroLogo.style.background = `rgba(255,255,255,0.2)`;
  }

  const whatsappNumber = whatsapp?.replace(/\D/g, "") || "";
  if (whatsappNumber) {
    const cta = document.getElementById("heroCTAWhatsApp");
    if (cta) cta.href = `https://wa.me/${whatsappNumber}`;
  }

  renderProducts();
  renderCategoryFilters();

  document.querySelectorAll(".category-filter").forEach((btn) => {
    if (!btn.classList.contains("active")) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".category-filter").forEach((b) => {
          b.classList.remove("active");
          b.style.background = "";
          b.classList.add("bg-slate-100", "text-slate-900");
        });
        this.classList.add("active");
        this.style.background = themeColor;
        this.classList.remove("bg-slate-100", "text-slate-900");
      });
    }
  });

  applyThemeColors(themeColor);
}

function renderProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;
  container.innerHTML = "";

  if (APP.filteredProducts.length === 0) {
    const no = document.getElementById("noResultsState");
    if (no) no.classList.remove("hidden");
    return;
  }
  const no = document.getElementById("noResultsState");
  if (no) no.classList.add("hidden");

  APP.filteredProducts.forEach((product) => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
}

function createProductCard(product) {
  const { id, nome, preco, descricao, categoria } = product;
  const themeColor = APP.catalog?.cor_tema || "#8e7cc3";
  const card = document.createElement("div");
  card.className =
    "bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-smooth fade-in-up";

  const precoNum = parseFloat(preco) || 0;
  const precoFormatado = formatPrice(precoNum);
  const nomeEscapado = escapeHTML(nome || "Produto");
  const descricaoEscapada = escapeHTML(
    descricao?.substring(0, 80) || "Sem descrição",
  );
  const categoriaEscapada = escapeHTML(categoria || "Geral");
  const productId = product.id || Math.random().toString(36).substr(2, 9);

  card.innerHTML = `
    <div class="p-4 sm:p-6 flex flex-col h-full">
      <div class="mb-4 w-full h-32 sm:h-40 rounded-xl flex items-center justify-center text-4xl font-bold transition-smooth hover:scale-105" style="background: rgba(142, 124, 195, 0.1);">
        📦
      </div>

      <div class="flex-1">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 mb-2 line-clamp-2">${nomeEscapado}</h3>
        <p class="text-xs sm:text-sm text-slate-500 mb-3 line-clamp-2">${descricaoEscapada}</p>
        
        <div class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-3" style="background: rgba(${hexToRgb(themeColor)}, 0.1); color: ${themeColor};">
          ${categoriaEscapada}
        </div>
      </div>

      <div class="flex flex-col gap-2 mt-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500">Preço</p>
            <p class="text-lg sm:text-xl font-extrabold" style="color: ${themeColor};">${precoFormatado}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button class="buy-now-btn px-4 py-2 rounded-full text-white font-bold transition-smooth hover:scale-105 active:scale-95 btn-ripple text-sm" style="background: ${themeColor};" data-product-id="${productId}" data-product-name="${nomeEscapado}" data-product-price="${precoNum}">
            <i class="fas fa-whatsapp"></i> Comprar
          </button>
          <button class="add-to-cart-btn px-4 py-2 border-2 rounded-full font-bold transition-smooth hover:bg-slate-50 active:scale-95 btn-ripple text-sm" style="border-color: ${themeColor}; color: ${themeColor};" data-product-id="${productId}" data-product-name="${nomeEscapado}" data-product-price="${precoNum}">
            <i class="fas fa-plus"></i> Sacola
          </button>
        </div>
      </div>
    </div>
  `;

  return card;
}

function renderCategoryFilters() {
  const categories = new Set(["Todos"]);
  APP.allProducts.forEach((p) => {
    if (p.categoria) categories.add(p.categoria);
  });
  const container = document.getElementById("categoryFilters");
  if (!container) return;

  const todosBtn = container.querySelector('[data-category="todos"]');
  if (todosBtn && todosBtn !== container.firstChild) {
    todosBtn.remove();
  }

  const themeColor = APP.catalog?.cor_tema || "#8e7cc3";

  categories.forEach((cat) => {
    if (cat === "Todos") return;
    const btn = document.createElement("button");
    btn.className =
      "category-filter px-4 py-2 rounded-full text-sm font-semibold transition-smooth shrink-0 bg-slate-100 text-slate-900 hover:bg-slate-200";
    btn.textContent = cat;
    btn.dataset.category = cat.toLowerCase();

    btn.addEventListener("click", function () {
      APP.currentFilters.category = this.dataset.category;
      filterProducts();

      document.querySelectorAll(".category-filter").forEach((b) => {
        b.classList.remove("active");
        b.style.background = "";
        b.classList.add("bg-slate-100", "text-slate-900");
      });
      this.classList.add("active");
      this.classList.remove("bg-slate-100", "text-slate-900");
      this.style.background = themeColor;
      this.style.color = "#fff";
    });

    container.appendChild(btn);
  });
}

function filterProducts() {
  let filtered = [...APP.allProducts];

  if (APP.currentFilters.category !== "todos") {
    filtered = filtered.filter(
      (p) => p.categoria?.toLowerCase() === APP.currentFilters.category,
    );
  }

  if (APP.currentFilters.search.trim()) {
    const searchTerm = APP.currentFilters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.nome?.toLowerCase().includes(searchTerm) ||
        p.descricao?.toLowerCase().includes(searchTerm) ||
        p.categoria?.toLowerCase().includes(searchTerm),
    );
  }

  filtered = filtered.filter((p) => {
    const preco = parseFloat(p.preco) || 0;
    return preco <= APP.currentFilters.maxPrice;
  });

  switch (APP.currentFilters.sortBy) {
    case "price-low":
      filtered.sort(
        (a, b) => parseFloat(a.preco || 0) - parseFloat(b.preco || 0),
      );
      break;
    case "price-high":
      filtered.sort(
        (a, b) => parseFloat(b.preco || 0) - parseFloat(a.preco || 0),
      );
      break;
    case "newest":
      filtered.reverse();
      break;
  }

  APP.filteredProducts = filtered;
  renderProducts();
}

function addToCart(productId, productName, productPrice) {
  const existingItem = APP.cart.find((item) => item.productId === productId);
  if (existingItem) existingItem.quantity += 1;
  else
    APP.cart.push({
      productId,
      productName,
      productPrice: parseFloat(productPrice) || 0,
      quantity: 1,
    });
  updateCartUI();
  showToast(`${productName} adicionado ao carrinho!`, "success");
}

function buyNow(productId, productName, productPrice) {
  const message = `Olá! Vi seu catálogo e quero comprar o produto:\n\n*${productName}*\nValor: ${formatPrice(parseFloat(productPrice) || 0)}\n\nEsta disponível?`;
  sendToWhatsApp(message);
}

function removeFromCart(productId) {
  APP.cart = APP.cart.filter((item) => item.productId !== productId);
  updateCartUI();
}

function updateCartQuantity(productId, quantity) {
  const item = APP.cart.find((item) => item.productId === productId);
  if (item) {
    if (quantity <= 0) removeFromCart(productId);
    else {
      item.quantity = quantity;
      updateCartUI();
    }
  }
}

function updateCartUI() {
  const cartCount = APP.cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = APP.cart.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0,
  );

  const badge = document.getElementById("cartBadge");
  const badgeCount = document.getElementById("cartBadgeCount");

  if (badge && badgeCount) {
    if (cartCount > 0) {
      badge.classList.remove("hidden");
      badgeCount.textContent = cartCount;
    } else {
      badge.classList.add("hidden");
    }
  }

  const sub = document.getElementById("cartSubtotal");
  if (sub) sub.textContent = formatPrice(cartTotal);
  const total = document.getElementById("cartTotal");
  if (total) total.textContent = formatPrice(cartTotal);

  const itemsContainer = document.getElementById("cartItemsContainer");
  const emptyMessage = document.getElementById("emptyCartMessage");

  if (!itemsContainer) return;

  if (APP.cart.length === 0) {
    itemsContainer.innerHTML = "";
    if (emptyMessage) emptyMessage.classList.remove("hidden");
  } else {
    if (emptyMessage) emptyMessage.classList.add("hidden");
    itemsContainer.innerHTML = APP.cart
      .map(
        (item) => `
      <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div class="flex-1">
          <p class="font-semibold text-slate-900 text-sm">${escapeHTML(item.productName)}</p>
          <p class="text-xs text-slate-500 mt-1">${formatPrice(item.productPrice)} cada</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="qty-btn px-2 py-1 rounded text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 transition-smooth" data-product-id="${item.productId}" data-action="decrease">
            <i class="fas fa-minus"></i>
          </button>
          <span class="w-8 text-center font-bold text-sm">${item.quantity}</span>
          <button class="qty-btn px-2 py-1 rounded text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 transition-smooth" data-product-id="${item.productId}" data-action="increase">
            <i class="fas fa-plus"></i>
          </button>
          <button class="remove-item px-2 py-1 rounded text-xs font-bold text-red-500 hover:bg-red-50 transition-smooth" data-product-id="${item.productId}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `,
      )
      .join("");

    itemsContainer.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const productId = this.dataset.productId;
        const item = APP.cart.find((i) => i.productId === productId);
        if (item) {
          const newQty =
            this.dataset.action === "increase"
              ? item.quantity + 1
              : item.quantity - 1;
          updateCartQuantity(productId, newQty);
        }
      });
    });

    itemsContainer.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", function () {
        removeFromCart(this.dataset.productId);
      });
    });
  }
}

function generateOrderMessage() {
  if (APP.cart.length === 0) return "";
  let message = `🛍️ *Novo Pedido*\n\n`;
  message += `*Produtos:*\n`;
  APP.cart.forEach((item, index) => {
    message += `${index + 1}. ${item.productName}\n`;
    message += `   Quantidade: ${item.quantity}x\n`;
    message += `   Subtotal: ${formatPrice(item.productPrice * item.quantity)}\n\n`;
  });
  const total = APP.cart.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0,
  );
  message += `*Total: ${formatPrice(total)}*\n\n`;
  message += `Favor confirmar disponibilidade e forma de pagamento.`;
  return message;
}

function sendToWhatsApp(message) {
  const whatsappNumber = APP.catalog?.whatsapp?.replace(/\D/g, "") || "";
  if (!whatsappNumber) {
    showToast("Número do WhatsApp não configurado.", "error");
    return;
  }
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

function sendOrderViaWhatsApp() {
  const message = generateOrderMessage();
  if (!message) {
    showToast(
      "Carrinho vazio. Adicione produtos para fazer um pedido.",
      "error",
    );
    return;
  }
  sendToWhatsApp(message);
  APP.cart = [];
  updateCartUI();
  closeCartDrawer();
  showToast("Pedido enviado! Acompanhe sua conversa no WhatsApp.", "success");
}

function openCartDrawer() {
  const d = document.getElementById("cartDrawer");
  if (d) d.classList.remove("hidden");
  setTimeout(() => {
    const el = document.querySelector("#cartDrawer > div:last-child");
    if (el) el.style.transform = "translateX(0)";
  }, 10);
}

function closeCartDrawer() {
  const drawer = document.querySelector("#cartDrawer > div:last-child");
  if (drawer) drawer.style.transform = "translateX(100%)";
  setTimeout(() => {
    const d = document.getElementById("cartDrawer");
    if (d) d.classList.add("hidden");
  }, 300);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "142, 124, 195";
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

function applyThemeColors(themeColor) {
  const root = document.documentElement;
  root.style.setProperty("--theme-color", themeColor);
}

function showLoading() {
  const ls = document.getElementById("loadingState");
  if (ls) ls.classList.remove("hidden");
  const cs = document.getElementById("contentState");
  if (cs) cs.classList.add("hidden");
  const es = document.getElementById("errorState");
  if (es) es.classList.add("hidden");
}

function showContent() {
  const ls = document.getElementById("loadingState");
  if (ls) ls.classList.add("hidden");
  const cs = document.getElementById("contentState");
  if (cs) cs.classList.remove("hidden");
  const es = document.getElementById("errorState");
  if (es) es.classList.add("hidden");
}

function showError(message) {
  const ls = document.getElementById("loadingState");
  if (ls) ls.classList.add("hidden");
  const cs = document.getElementById("contentState");
  if (cs) cs.classList.add("hidden");
  const es = document.getElementById("errorState");
  if (es) es.classList.remove("hidden");
  showToast(message, "error");
}

function setupEventListeners() {
  const btnCart = document.getElementById("btnCart");
  if (btnCart) btnCart.addEventListener("click", openCartDrawer);
  const closeCart = document.getElementById("closeCartDrawer");
  if (closeCart) closeCart.addEventListener("click", closeCartDrawer);
  const backdrop = document.getElementById("cartBackdrop");
  if (backdrop) backdrop.addEventListener("click", closeCartDrawer);
  const contBtn = document.getElementById("continuShoppingBtn");
  if (contBtn) contBtn.addEventListener("click", closeCartDrawer);
  const confirmBtn = document.getElementById("confirmOrderBtn");
  if (confirmBtn) confirmBtn.addEventListener("click", sendOrderViaWhatsApp);

  const searchInput = document.getElementById("searchInput");
  const searchClear = document.getElementById("searchClear");
  const searchResults = document.getElementById("searchResults");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      APP.currentFilters.search = this.value;
      if (this.value.trim()) {
        if (searchClear) searchClear.classList.remove("hidden");
      } else {
        if (searchClear) searchClear.classList.add("hidden");
      }

      if (this.value.trim().length > 0) {
        const results = APP.allProducts
          .filter((p) =>
            p.nome?.toLowerCase().includes(this.value.toLowerCase()),
          )
          .slice(0, 5);
        if (results.length > 0) {
          if (searchResults) {
            searchResults.innerHTML = results
              .map(
                (p) => `
              <div class="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-smooth" data-product-id="${p.id}">
                <p class="text-sm font-semibold text-slate-900">${escapeHTML(p.nome)}</p>
                <p class="text-xs text-slate-500 mt-1">${formatPrice(parseFloat(p.preco) || 0)}</p>
              </div>
            `,
              )
              .join("");
            searchResults.classList.remove("hidden");

            searchResults.querySelectorAll("div").forEach((result) => {
              result.addEventListener("click", function () {
                const productId = this.dataset.productId;
                const product = APP.allProducts.find((p) => p.id === productId);
                if (product) {
                  addToCart(product.id, product.nome, product.preco);
                  searchInput.value = "";
                  if (searchClear) searchClear.classList.add("hidden");
                  if (searchResults) searchResults.classList.add("hidden");
                }
              });
            });
          }
        } else {
          if (searchResults) searchResults.classList.add("hidden");
        }
      } else {
        if (searchResults) searchResults.classList.add("hidden");
      }

      filterProducts();
    });
  }

  if (searchClear)
    searchClear.addEventListener("click", function () {
      if (searchInput) searchInput.value = "";
      APP.currentFilters.search = "";
      this.classList.add("hidden");
      if (searchResults) searchResults.classList.add("hidden");
      filterProducts();
    });

  const sort = document.getElementById("sortSelect");
  if (sort)
    sort.addEventListener("change", function () {
      APP.currentFilters.sortBy = this.value;
      filterProducts();
    });
  const priceRange = document.getElementById("priceRange");
  if (priceRange)
    priceRange.addEventListener("input", function () {
      const value = parseFloat(this.value);
      APP.currentFilters.maxPrice = value;
      const pv = document.getElementById("priceValue");
      if (pv) pv.textContent = formatPrice(value);
      filterProducts();
    });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".add-to-cart-btn")) {
      const btn = e.target.closest(".add-to-cart-btn");
      addToCart(
        btn.dataset.productId,
        btn.dataset.productName,
        btn.dataset.productPrice,
      );
    }
    if (e.target.closest(".buy-now-btn")) {
      const btn = e.target.closest(".buy-now-btn");
      buyNow(
        btn.dataset.productId,
        btn.dataset.productName,
        btn.dataset.productPrice,
      );
    }
  });

  document.addEventListener("click", function (e) {
    if (
      !e.target.closest("#searchInput") &&
      !e.target.closest("#searchResults")
    ) {
      if (searchResults) searchResults.classList.add("hidden");
    }
  });
}

function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  const isSuccess = type === "success";
  const bgClass = isSuccess
    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
    : "bg-blue-50 border-blue-200 text-blue-800";
  const iconClass = isSuccess
    ? "fa-circle-check text-emerald-500"
    : "fa-info-circle text-blue-500";

  toast.className = `flex items-center gap-3 p-4 rounded-xl border shadow-lg transition-smooth ${bgClass} pointer-events-auto`;
  toast.innerHTML = `
    <i class="fas ${iconClass} text-lg shrink-0"></i>
    <p class="text-sm font-semibold flex-1">${escapeHTML(message)}</p>
    <button class="text-slate-400 hover:text-slate-600 transition-smooth shrink-0">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector("button");
  const dismiss = () => {
    toast.classList.add("opacity-0", "translate-x-96");
    setTimeout(() => toast.remove(), 300);
  };

  closeBtn?.addEventListener("click", dismiss);
  setTimeout(dismiss, 5000);
}

function getCatalogHash() {
  const params = new URLSearchParams(window.location.search);
  const hashParam = params.get("hash") || params.get("slug");

  if (hashParam) return hashParam;

  const pathParts = window.location.pathname.split("/");
  if (pathParts[1] === "c" && pathParts[2]) {
    return pathParts[2];
  }

  return null;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Requisição expirou. Verifique sua conexão.");
    }
    throw err;
  }
}

async function loadCatalog() {
  console.log("loadCatalog: início");
  try {
    const hash = getCatalogHash();
    console.log("Leitura do Slug:", hash);

    if (!hash) {
      console.error("Slug não encontrado na URL ao tentar carregar catálogo");
    }

    if (!hash) {
      showError("Hash do catálogo não encontrado na URL");
      return;
    }

    console.log("Fetch Iniciado:", "GET", `${APP.apiBaseUrl}/loja/${hash}`);
    const response = await fetchWithTimeout(
      `${APP.apiBaseUrl}/loja/${hash}`,
      { method: "GET" },
      15000,
    );
    console.log("Resposta Recebida: status=", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        showError("Catálogo não encontrado");
      } else {
        showError("Erro ao carregar catálogo. Tente novamente.");
      }
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
    console.log(
      "Renderização dos Cards: produtos=",
      APP.filteredProducts.length,
    );
    renderCatalog();
    setupEventListeners();
    showContent();
    console.log("ShowContent: conteúdo exibido");
  } catch (error) {
    console.error("Erro ao carregar catálogo:", error);
    showError(error.message || "Erro ao carregar catálogo");
  }
}
