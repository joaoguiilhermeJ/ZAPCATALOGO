/**
 * generate-excels.js
 *
 * Gera 3 planilhas .xlsx de exemplo (Aura, Soleil, Mercadinho)
 * a partir dos dados do front-end, salvando em /public/downloads/.
 *
 * Uso: node generate-excels.js
 */

import XLSX from 'xlsx';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, 'public', 'downloads');

// ─── Dados espelhados do front-end ──────────────────────────────

const LOJAS = [
  {
    slug: 'aura',
    modelo: 'Aura — Moda & Vestuário',
    products: [
      { nome: 'Calça Jeans Premium',      preco: 189.90, descricao: 'Algodão orgânico · Comfort Fit',         tag: 'Novo',       tamanhos: '38,40,42,44',  imagem: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400' },
      { nome: 'Blusa Silk Blend',         preco: 129.90, descricao: 'Seda ecológica · Gola V',                tag: 'Premium',    tamanhos: 'P,M,G,GG',     imagem: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400' },
      { nome: 'Sapatilha Comfort',        preco: 159.90, descricao: 'Couro legítimo · Palmilha ortopédica',    tag: 'Promoção',   tamanhos: '34,35,36,37,38',imagem: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400' },
      { nome: 'Bolsa Tote Couro',         preco: 249.90, descricao: 'Couro legítimo · Média',                 tag: 'Essencial',  tamanhos: 'Único',        imagem: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400' },
      { nome: 'Vestido Floral Verão',     preco: 179.90, descricao: 'Viscose · Estampado',                    tag: 'Novo',       tamanhos: 'P,M,G',        imagem: 'https://images.unsplash.com/photo-1572804013309-59a88b7e2181?w=400' },
      { nome: 'Cinto Couro Legítimo',     preco: 89.90,  descricao: 'Couro · Fivela dourada',                 tag: 'Acessório',  tamanhos: 'Único',        imagem: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
    ],
  },
  {
    slug: 'soleil',
    modelo: 'Soleil — Calçados & Esportes',
    products: [
      { nome: 'Tênis Running Sport',      preco: 299.90, descricao: 'Amortecimento Max · Respirável',         tag: 'Mais Vendido',tamanhos: '38,39,40,41,42',imagem: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
      { nome: 'Sandália Casual Verão',    preco: 89.90,  descricao: 'Borracha reciclada · Antiderrapante',    tag: 'Novo',       tamanhos: '36,37,38,39,40',imagem: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400' },
      { nome: 'Sapato Couro Nobre',       preco: 349.90, descricao: 'Couro legítimo · Solado antiderrapante', tag: 'Premium',    tamanhos: '38,39,40,41,42',imagem: 'https://images.unsplash.com/photo-1614252235316-8c857f0e8b3d?w=400' },
      { nome: 'Mochila Esportiva',        preco: 199.90, descricao: 'Impermeável · 30L',                      tag: 'Oferta',     tamanhos: 'Único',        imagem: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
      { nome: 'Chinelo Slide Confort',    preco: 59.90,  descricao: 'EVA macio · Antiderrapante',             tag: 'Promoção',   tamanhos: '36,37,38,39,40',imagem: 'https://images.unsplash.com/photo-1608236464711-8c377b4e516e?w=400' },
      { nome: 'Camiseta Dry Fit',         preco: 79.90,  descricao: 'Poliamida · Secagem rápida',             tag: 'Esportivo',  tamanhos: 'P,M,G,GG',     imagem: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400' },
    ],
  },
  {
    slug: 'mercadinho',
    modelo: 'Mercadinho da Vila — Alimentos & Bebidas',
    products: [
      { nome: 'Cesta Hortifrúti Orgânica',preco: 59.90,  descricao: '10 itens selecionados · Sem agrotóxicos',tag: 'Orgânico',   tamanhos: 'Único',        imagem: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' },
      { nome: 'Pão de Fermentação Natural',preco: 18.90, descricao: 'Assado na hora · 500g',                  tag: 'Artesanal',  tamanhos: 'Único',        imagem: 'https://images.unsplash.com/photo-1549931319-a5457533880f?w=400' },
      { nome: 'Café Premium Grãos',       preco: 34.90,  descricao: 'Grãos especiais · Torra média 250g',     tag: 'Premium',    tamanhos: '250g,500g',    imagem: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400' },
      { nome: 'Queijo Minas Artesanal',   preco: 42.90,  descricao: 'Maturado · 300g',                        tag: 'Gourmet',    tamanhos: '300g,500g',    imagem: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400' },
      { nome: 'Mel Silvestre Puro',       preco: 29.90,  descricao: 'Colheita direta · 350g',                tag: 'Orgânico',   tamanhos: '350g',         imagem: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400' },
      { nome: 'Vinho Tinto Reserva',      preco: 79.90,  descricao: 'Cabernet Sauvignon · 750ml',             tag: 'Premium',    tamanhos: '750ml',        imagem: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400' },
    ],
  },
];

// ─── Geração ─────────────────────────────────────────────────────

function gerarPlanilha(loja) {
  // Aba 1: Instruções
  const instr = [
    { Informação: 'Instruções de preenchimento',                                                                Detalhe: '' },
    { Informação: '',                                                                                           Detalhe: '' },
    { Informação: 'Modelo',                                                                                     Detalhe: loja.modelo },
    { Informação: '',                                                                                           Detalhe: '' },
    { Informação: '1. Preencha a aba "Produtos" com seus itens.',                                              Detalhe: '' },
    { Informação: '2. A coluna Tamanhos pode conter valores separados por vírgula (ex: P,M,G) ou "Único".',   Detalhe: '' },
    { Informação: '3. A coluna Imagem aceita URLs públicas de imagem.',                                         Detalhe: '' },
    { Informação: '4. Não altere os nomes das colunas.',                                                        Detalhe: '' },
    { Informação: '5. Após preencher, faça upload da planilha no site.',                                        Detalhe: '' },
  ];

  // Aba 2: Produtos
  const produtos = loja.products.map((p) => ({
    Nome:       p.nome,
    Preço:      p.preco,
    Descrição:  p.descricao,
    Tag:        p.tag,
    Tamanhos:   p.tamanhos,
    Imagem:     p.imagem,
  }));

  const wb = XLSX.utils.book_new();

  const wsInstr = XLSX.utils.json_to_sheet(instr);
  wsInstr['!cols'] = [{ wch: 50 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsInstr, 'Instruções');

  const wsProd = XLSX.utils.json_to_sheet(produtos);
  wsProd['!cols'] = [
    { wch: 28 },  // Nome
    { wch: 10 },  // Preço
    { wch: 40 },  // Descrição
    { wch: 16 },  // Tag
    { wch: 20 },  // Tamanhos
    { wch: 50 },  // Imagem
  ];
  XLSX.utils.book_append_sheet(wb, wsProd, 'Produtos');

  return wb;
}

// ─── Execução ────────────────────────────────────────────────────

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

for (const loja of LOJAS) {
  const wb = gerarPlanilha(loja);
  const caminho = join(OUT_DIR, `modelo_${loja.slug}.xlsx`);
  XLSX.writeFile(wb, caminho);
  console.log(`✓ ${caminho}`);
}

console.log('\n✅ 3 planilhas geradas com sucesso na pasta /public/downloads/');
