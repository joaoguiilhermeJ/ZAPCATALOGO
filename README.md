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
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node 18+">
  <img src="https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white" alt="Express 4">
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
│   ├── css/
│   │   └── style.css        # Estilos customizados
│   ├── js/
│   │   └── app.js           # Intersection Observer, Dropzone, Upload
│   └── image/
│       ├── logo.png         # Logo principal
│       └── ZAPCATALOGO.png  # Fallback da logo
│
├── src/                     # Backend (API REST em Node.js)
│   ├── index.js             # Servidor Express — ponto de entrada
│   ├── config/
│   │   └── index.js         # Configurações (porta, CORS, upload)
│   ├── routes/
│   │   ├── index.js         # Agregador de rotas
│   │   └── uploadRoutes.js  # Rotas /api/upload e /api/template
│   ├── controllers/
│   │   └── uploadController.js  # Handlers das requisições
│   ├── services/
│   │   └── spreadsheetService.js  # Lógica de processamento Excel
│   └── middleware/
│       ├── upload.js        # Configuração Multer
│       └── errorHandler.js  # Tratamento global de erros
│
├── uploads/                 # Arquivos temporários (gitignorado)
├── .env                     # Variáveis de ambiente (gitignorado)
└── .gitignore
```

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

### Tecnologias
- **Node.js 18+** com ES Modules (`"type": "module"`)
- **Express 4.x** — servidor HTTP e roteamento
- **Multer** — upload de arquivos
- **xlsx (SheetJS)** — leitura e geração de planilhas Excel
- **dotenv** — variáveis de ambiente

### API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/upload` | Upload de planilha .xlsx/.xls |
| `GET` | `/api/template` | Download da planilha modelo |
| `GET` | `/api/health` | Health check do servidor |

### Exemplo de requisição (upload)

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@planilha.xlsx"
```

**Resposta:**
```json
{
  "success": true,
  "filename": "planilha.xlsx",
  "sheets": ["Produtos", "Instruções"],
  "activeSheet": "Produtos",
  "rowCount": 3,
  "columns": ["Nome do Produto", "Preço", "Descrição", "Categoria", "Código", "Estoque"],
  "data": [
    { "Nome do Produto": "Camiseta Polo azul", "Preço": "R$ 89,90", "Descrição": "...", "Categoria": "Camisetas", "Código": "CAM-001", "Estoque": "25" }
  ]
}
```

### Planilha Modelo
O template gerado contém:
- Aba **Produtos** — 3 linhas de exemplo com as colunas: Nome, Preço, Descrição, Categoria, Código, Estoque
- Aba **Instruções** — guia rápido de preenchimento

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
