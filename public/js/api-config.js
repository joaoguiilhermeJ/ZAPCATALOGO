/**
 * api-config.js — Configuração dinâmica da URL da API
 *
 * Define window.API_URL automaticamente baseado no ambiente:
 *   - localhost / 127.0.0.1 → aponta para o backend local
 *   - produção (Vercel)     → aponta para o backend no Render
 *
 * Para sobrescrever manualmente, defina a variável ANTES deste script:
 *   <script>window.API_URL = 'https://meu-backend.onrender.com';</script>
 *
 * Ou via query string:
 *   ?api_url=https://meu-backend.onrender.com
 */

(function () {
  // Já foi definida manualmente? Respeita.
  if (window.API_URL) return;

  // Query string tem prioridade (útil para testes)
  var params = new URLSearchParams(window.location.search);
  var queryApi = params.get('api_url');
  if (queryApi) {
    window.API_URL = queryApi;
    return;
  }

  var hostname = window.location.hostname;

  // Ambiente local → backend em localhost:3001
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    window.API_URL = 'http://localhost:3001';
    return;
  }

  // IP local (rede interna, ex: 192.168.x.x, 10.x.x.x)
  if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(hostname)) {
    window.API_URL = 'http://' + hostname + ':3001';
    return;
  }

  // Produção — seu backend no Render
  window.API_URL = 'https://zapcatalogobackend.onrender.com';
})();