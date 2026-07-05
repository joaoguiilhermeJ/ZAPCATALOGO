"use strict";

const APP = {
  apiBaseUrl: (() => {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:3001/api";
    }
    return "/api";
  })(),

  catalog: null,
  cart: [],
  filteredProducts: [],
  allProducts: [],
  currentFilters: {
    category: "all",
    search: "",
    sortBy: "relevance",
    "use strict";

    const APP = {
      apiBaseUrl: (() => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return 'http://localhost:3001/api';
        }
        return '/api';
      })(),
  
      catalog: null,
      cart: [],
      filteredProducts: [],
      allProducts: [],
      currentFilters: {
        category: 'all',
        search: '',
        sortBy: 'relevance',
        maxPrice: 10000
      }
    };

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
        maximumFractionDigits: 2
      }).format(value);
    }

    function showToast(message, type = 'info') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      const isSuccess = type === 'success';
      const bgClass = isSuccess 
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
        : 'bg-blue-50 border-blue-200 text-blue-800';
      const iconClass = isSuccess ? 'fa-circle-check text-emerald-500' : 'fa-info-circle text-blue-500';

      toast.className = `flex items-center gap-3 p-4 rounded-xl border shadow-lg transition-smooth ${bgClass} pointer-events-auto`;
      toast.innerHTML = `
        <i class="fas ${iconClass} text-lg shrink-0"></i>
        <p class="text-sm font-semibold flex-1">${escapeHTML(message)}</p>
        <button class="text-slate-400 hover:text-slate-600 transition-smooth shrink-0">
          <i class="fas fa-times"></i>
        </button>
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

    function getCatalogHash() {
      const params = new URLSearchParams(window.location.search);
      const hashParam = params.get('hash') || params.get('slug');
  
      if (hashParam) return hashParam;

      const pathParts = window.location.pathname.split('/');
      if (pathParts[1] === 'c' && pathParts[2]) {
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
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        clearTimeout(timeoutId);
        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error('Requisição expirou. Verifique sua conexão.');
        }
        throw err;
      }
    }

    async function loadCatalog() {
      try {
        const hash = getCatalogHash();
    
        if (!hash) {
          showError('Hash do catálogo não encontrado na URL');
          return;
        }

        console.log("URL:", window.location.pathname);
        console.log("Hash:", hash);

        const response = await fetchWithTimeout(
          `${APP.apiBaseUrl}/loja/${hash}`,
          { method: 'GET' }
        );

        if (!response.ok) {
          if (response.status === 404) {
            showError('Catálogo não encontrado');
          } else {
            showError('Erro ao carregar catálogo. Tente novamente.');
          }
          return;
        }

        const data = await response.json();
    
        if (!data.success) {
          showError(data.error || 'Erro ao carregar catálogo');
          return;
        }

        APP.catalog = data.catalogo;
        APP.allProducts = data.produtos || [];
        APP.filteredProducts = [...APP.allProducts];

        renderCatalog();
        setupEventListeners();
        showContent();

      } catch (error) {
        console.error('Erro ao carregar catálogo:', error);
        showError(error.message || 'Erro ao carregar catálogo');
      }
    }
