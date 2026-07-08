<div align="center">
  <img src="public/image/logo.png" alt="ZapCatálogo" width="200" onerror="this.style.display='none'">
  <h1 align="center">📱 ZapCatálogo</h1>
  <p align="center">
    Transforme seu estoque em catálogo de vendas no WhatsApp em <strong>1 minuto</strong>.
    <br>
    Baixe a planilha modelo, preencha com seus produtos e gere um catálogo profissional.
  </p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
</p>

---

## 🚀 Sobre o Projeto

O **ZapCatálogo** é uma aplicação web full-stack que permite a criação rápida de catálogos de produtos para WhatsApp. O usuário baixa uma planilha modelo (.xlsx), preenche com seus produtos e faz upload para gerar o catálogo automaticamente.

### Fluxo do Usuário

```
📥 Baixar planilha → ✏️ Preencher produtos → 📤 Upload → 📲 Catálogo pronto!
```

## 🧱 Arquitetura

```
zapcatalogo/
├── public/                  # Frontend (cliente puro)
│   ├── index.html           # HTML semântico + Tailwind classes
│   ├── cadastro.html        # Página de cadastro/onboarding
│   ├── pagamento.html       # Paywall Mercado Pago
│   ├── catalogo.html        # Catálogo de produtos (pós-pagamento)
│   ├── css/
│   │   └── style.css        # Estilos customizados
│   ├── js/
│   │   └── app.js           # Intersection Observer, Dropzone, Upload
│   └── image/
│       ├── logo.png         # Logo principal
│       └── logo.png         # Fallback da logo
│
├── modelos/                 # Planilhas modelo .xlsx
└── package.json             # Frontend-only (serve para dev)
```

> **Backend**: O código da API está em [ZAPCATALOGOBACKEND](https://github.com/joaoguiilhermeJ/ZAPCATALOGOBACKEND)

## 🖥️ Frontend

### Tecnologias
- **HTML5** semântico e acessível
- **Tailwind CSS 3** via CDN — utilitário para layout responsivo
- **CSS customizado** — animações, mockup, step cards, dropzone
- **JavaScript Vanilla** — Intersection Observer API, drag & drop, fetch

### Layout Responsivo

| Dispositivo | Hero | Passos | Features |
|-------------|------|--------|----------|
| **Desktop** (≥1024px) | Grid 2 colunas: texto + mockup celular | 2 colunas (cards + visão geral) | 4 colunas |
| **Tablet** (≥768px) | 1 coluna com mockup | 1 coluna vertical | 4 colunas |
| **Mobile** (<768px) | 1 coluna, sem mockup | 1 coluna vertical | 2 colunas |

### Scroll Storytelling
Os 3 cards de "Como funciona" surgem com **fade-in + slide-up** conforme o usuário rola a página, utilizando a **Intersection Observer API**. Cada card tem um delay progressivo (160ms entre eles).

## ⚙️ Backend

O backend está em um repositório separado: [ZAPCATALOGOBACKEND](https://github.com/joaoguiilhermeJ/ZAPCATALOGOBACKEND)

### Tecnologias
- **Node.js** com **Express**
- **Neon PostgreSQL** — banco de dados
- **Mercado Pago** — Checkout Pro (paywall R$15)
- **Multer + SheetJS** — upload e leitura de planilhas

### API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/upload` | Upload de planilha .xlsx/.xls |
| `GET` | `/api/template` | Download da planilha modelo |
| `POST` | `/api/payment/create` | Criar preferência de pagamento MP |
| `GET` | `/api/payment/status/:ref` | Consultar status do pagamento |
| `POST` | `/api/payment/webhook` | Webhook IPN do Mercado Pago |
| `GET` | `/api/health` | Health check do servidor |

> **URL da API em produção:** `https://zapcatalogobackend.onrender.com` (definir quando fizer deploy)
> Para rodar localmente, troque `API_URL` no `<head>` de cada página HTML.

## 🎨 Identidade Visual

- **Cores primárias:** `#128C7E` (verde escuro) / `#25D366` (verde claro) — paleta oficial do WhatsApp
- **Background:** `#f0f2f5` (cinza claro)
- **Tipografia:** Sistema nativo (SF Pro, Segoe UI, Roboto)
- **Ícones:** Font Awesome 6

## 🚦 Como Executar

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/zapcatalogo.git
cd zapcatalogo

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env se necessário (PORT, CORS_ORIGIN, MAX_FILE_SIZE)

# 4. Inicie o servidor
npm start          # produção
npm run dev        # desenvolvimento (com --watch)

# 5. Acesse
# → http://localhost:3000
```

## 📁 Estrutura de Diretórios (visão geral)

```
public/              # Estático servido pelo Express
├── index.html       # Página principal
├── css/style.css    # Estilos customizados
├── js/app.js        # JavaScript da aplicação
└── image/           # Imagens e assets

src/                 # Código do servidor
├── index.js         # Entry point (Express + static + fallback SPA)
├── config/          # Configurações centralizadas
├── routes/          # Definição de rotas
├── controllers/     # Lógica dos endpoints
├── services/        # Regras de negócio (processamento Excel)
└── middleware/      # Multer, error handler
```

## 📄 Licença

Distribuído sob licença MIT. Veja `LICENSE` para mais informações.

---

<p align="center">
  Feito com ❤️ para vendedores e empreendedores do WhatsApp.
</p>
