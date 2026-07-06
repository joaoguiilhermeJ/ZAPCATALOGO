// catalogo.refactor.js
// Refactor mobile-first: minimal, well-commented, keeps API + fallback

const APP = {
  apiBase: (() => {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "/api";
    const cfg =
      window.API_BASE_URL ||
      window.API_URL ||
      "https://zapcatalogobackend-kg0c.onrender.com";
    return cfg.replace(/\/$/, "") + "/api";
  })(),
  catalog: null,
  products: [],
  filtered: [],
  cart: [],
};

/* -------------------- Utilities -------------------- */
function el(id) {
  return document.getElementById(id);
}
function fmt(v) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}
function toast(msg, type = "info") {
  const host = el("toastHost");
  const t = document.createElement("div");
  t.className = "toast bg-white";
  t.innerHTML = `<div class="flex items-center gap-3"><div class="text-sm">${msg}</div></div>`;
  host.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/* -------------------- Mock data (fallback) -------------------- */
const MOCK = (() => ({
  catalogo: {
    nome_loja: "Loja Demo",
    cor_tema: "#6C5CE7",
    whatsapp: "551199999999",
    logo_url: "",
  },
  produtos: [
    {
      id: "p1",
      nome: "Vestido Floral",
      preco: 149.9,
      descricao: "Bonito",
      categoria: "Moda",
    },
    {
      id: "p2",
      nome: "Calça Jeans",
      preco: 189.9,
      descricao: "Confortável",
      categoria: "Moda",
    },
    {
      id: "p3",
      nome: "Fone Bluetooth",
      preco: 89.9,
      descricao: "Bluetooth 5.0",
      categoria: "Eletrônicos",
    },
    {
      id: "p4",
      nome: "Capinha Silicone",
      preco: 39.9,
      descricao: "Proteção leve",
      categoria: "Acessórios",
    },
  ],
}))();

/* -------------------- Fetch catalog by slug -------------------- */
async function fetchCatalog(slug) {
  try {
    const res = await fetch(`${APP.apiBase}/loja/${slug}`);
    if (!res.ok) throw new Error("no");
    const data = await res.json();
    if (data && data.success) {
      return { catalogo: data.catalogo, produtos: data.produtos };
    }
    throw new Error("invalid");
  } catch (e) {
    console.warn("API fallback", e);
    return { catalogo: MOCK.catalogo, produtos: MOCK.produtos };
  }
}

/* -------------------- Rendering -------------------- */
function makeCard(p) {
  const wrap = document.createElement("article");
  wrap.className = "card p-3";
  wrap.innerHTML = `
    <div class="product-img mb-2">📦</div>
    <div class="text-sm font-semibold truncate">${p.nome}</div>
    <div class="text-xs text-slate-500">${p.descricao || ""}</div>
    <div class="mt-2 flex items-center justify-between">
      <div class="text-sm font-bold">${fmt(p.preco || 0)}</div>
      <button class="addBtn btn-primary text-sm px-3 py-1 rounded-full">+</button>
    </div>`;
  const btn = wrap.querySelector(".addBtn");
  btn.addEventListener("click", () => {
    addToCart(p);
  });
  return wrap;
}

function renderProducts(list) {
  const cont = el("productsContainer");
  cont.innerHTML = "";
  if (!list.length) {
    el("emptyState").classList.remove("hidden");
    return;
  }
  el("emptyState").classList.add("hidden");
  list.forEach((p) => cont.appendChild(makeCard(p)));
}

/* -------------------- Filters / Search -------------------- */
function buildCategories(products) {
  const s = new Set(["todos"]);
  products.forEach((p) => p.categoria && s.add(p.categoria));
  const container = el("categoryFilters");
  container.innerHTML = "";
  s.forEach((cat) => {
    const b = document.createElement("button");
    b.className = "px-3 py-2 rounded-xl border text-sm bg-white";
    b.textContent = cat;
    b.dataset.cat = cat;
    b.addEventListener("click", () => {
      document
        .querySelectorAll("#categoryFilters button")
        .forEach((x) => x.classList.remove("bg-primary", "text-white"));
      b.classList.add("bg-[color:var(--primary)]", "text-white");
      APP.currentCategory = cat;
      applyFilters();
    });
    container.appendChild(b);
  });
}

function applyFilters() {
  let list = APP.products.slice();
  const cat = APP.currentCategory || "todos";
  if (cat !== "todos") {
    list = list.filter((p) => p.categoria === cat);
  }
  const max = parseFloat(el("priceRange").value) || 10000;
  list = list.filter((p) => (parseFloat(p.preco) || 0) <= max);
  const q = (el("searchInput").value || "").toLowerCase();
  if (q)
    list = list.filter(
      (p) =>
        (p.nome || "").toLowerCase().includes(q) ||
        (p.descricao || "").toLowerCase().includes(q),
    );
  const sort = el("sortSelect").value;
  if (sort === "price-low")
    list.sort((a, b) => (a.preco || 0) - (b.preco || 0));
  if (sort === "price-high")
    list.sort((a, b) => (b.preco || 0) - (a.preco || 0));
  if (sort === "newest") list = list.reverse();
  APP.filtered = list;
  renderProducts(list);
}

/* -------------------- Cart -------------------- */
function addToCart(product) {
  const existing = APP.cart.find((c) => c.id === product.id);
  if (existing) existing.qty++;
  else APP.cart.push({ ...product, qty: 1 });
  updateCartUI();
  toast("Adicionado ao carrinho");
}
function removeFromCart(id) {
  APP.cart = APP.cart.filter((i) => i.id !== id);
  updateCartUI();
}
function updateCartUI() {
  const badge = el("badgeTop");
  const count = APP.cart.reduce((s, i) => s + i.qty, 0);
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("hidden");
  } else badge.classList.add("hidden");
  const items = el("cartItems");
  items.innerHTML = "";
  if (APP.cart.length === 0)
    items.innerHTML = '<div class="text-slate-500">Sua sacola está vazia</div>';
  APP.cart.forEach((it) => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between";
    row.innerHTML = `<div><div class="font-semibold">${it.nome}</div><div class="text-xs text-slate-500">${fmt(it.preco)} × ${it.qty}</div></div><div class="flex items-center gap-2"><button class="px-2 py-1 rounded bg-slate-100">−</button><button class="px-2 py-1 rounded bg-slate-100">+</button></div>`;
    const [dec, inc] = row.querySelectorAll("button");
    dec.addEventListener("click", () => {
      if (it.qty > 1) {
        it.qty--;
      } else removeFromCart(it.id);
      updateCartUI();
    });
    inc.addEventListener("click", () => {
      it.qty++;
      updateCartUI();
    });
    items.appendChild(row);
  });
  const subtotal = APP.cart.reduce(
    (s, i) => s + (parseFloat(i.preco) || 0) * i.qty,
    0,
  );
  el("cartSubtotal").textContent = fmt(subtotal);
}

/* -------------------- Drawer control -------------------- */
function openCart() {
  el("cartDrawerWrapper").classList.remove("hidden");
  setTimeout(() => el("cartDrawer").classList.add("open"), 10);
}
function closeCart() {
  el("cartDrawer").classList.remove("open");
  setTimeout(() => el("cartDrawerWrapper").classList.add("hidden"), 320);
}

/* -------------------- Init & Events -------------------- */
async function init() {
  APP.currentCategory = "todos"; // read slug
  const slug =
    new URLSearchParams(window.location.search).get("slug") ||
    (window.location.pathname.split("/")[1] &&
      window.location.pathname.split("/")[2]) ||
    "demo";
  const data = await fetchCatalog(slug);
  APP.catalog = data.catalogo;
  APP.products = data.produtos || [];
  APP.filtered = APP.products.slice();
  buildCategories(APP.products);
  renderProducts(APP.products);
  updateCartUI();

  // Events
  el("priceRange").addEventListener("input", () => {
    el("priceValue").textContent = fmt(parseFloat(el("priceRange").value) || 0);
    applyFilters();
  });
  el("sortSelect").addEventListener("change", applyFilters);
  el("searchInput").addEventListener("input", () => {
    applyFilters(); // suggestion simplified
    const q = el("searchInput").value.trim();
    const sug = el("suggestions");
    if (!q) {
      sug.classList.add("hidden");
      return;
    }
    const matches = APP.products
      .filter((p) => p.nome.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 5);
    sug.innerHTML = matches
      .map(
        (m) =>
          `<div class="px-3 py-2 hover:bg-slate-50 cursor-pointer">${m.nome}</div>`,
      )
      .join("");
    sug.classList.remove("hidden");
    Array.from(sug.children).forEach((c, i) =>
      c.addEventListener("click", () => {
        el("searchInput").value = matches[i].nome;
        applyFilters();
        sug.classList.add("hidden");
      }),
    );
  });

  el("btnCartTop").addEventListener("click", () => {
    openCart();
  });
  el("closeCart").addEventListener("click", () => closeCart());
  el("checkoutBtn").addEventListener("click", () => {
    const msg = APP.cart
      .map((i) => `${i.nome} x${i.qty} - ${fmt((i.preco || 0) * i.qty)}`)
      .join("\n");
    const phone = (APP.catalog.whatsapp || "").replace(/\D/g, "");
    if (!phone) {
      toast("WhatsApp não configurado");
      return;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent("Pedido:\n" + msg + "\nTotal: " + el("cartSubtotal").textContent)}`;
    window.open(url, "_blank");
  });
}

window.openCart = openCart;
window.closeCart = closeCart;
document.addEventListener("DOMContentLoaded", init);
