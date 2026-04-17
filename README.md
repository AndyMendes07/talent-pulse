# Dashboard R&S Estratégico

Dashboard interativo de Recrutamento & Seleção construído em **React + Vite + TypeScript + Tailwind + Recharts**.
Apresenta uma visão executiva (C-Level) com KPIs, evolução mensal, performance por recrutador, funil de etapas, fontes de aprovação e backlog de vagas.

---

## 🚀 Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

---

## 🧭 Como visualizar cada informação do Dashboard

O dashboard é dividido em seções verticais. Todos os blocos respondem aos **filtros globais** (período + status/recrutador/tipo/setor) no topo da tela.

### 1. Cabeçalho
Mostra o título, a data de atualização da base e o **total de vagas analisadas** na planilha original (independente de filtros).

### 2. Filtros
- **Período**: filtro por intervalo de datas com atalhos rápidos por **Ano** e **Mês**. Quando um período é selecionado, aparece um *badge* indicando o **período anterior equivalente** usado na comparação dos KPIs.
- **Filtros gerais**: Status, Tipo de Vaga, Recrutador e Setor. Combinam com o período.

> 💡 A "vaga no período" é definida pela **data de abertura** dela.

### 3. Indicadores Estratégicos (com comparativo)
Quatro cards no topo, cada um mostrando o **valor atual**, a **variação %** e uma seta (↑ ↓ —) versus o período anterior equivalente:
- **Volume de Vagas** — total de vagas abertas no período.
- **Tempo Médio de Fechamento** — média de **dias corridos** das vagas fechadas (menor é melhor).
- **Taxa de Fechamento** — % das vagas do período que foram fechadas.
- **Backlog Atual** — vagas com status `Aberta` **agora** (ignora período, respeita filtros).

### 4. Evolução Mensal de Vagas
Gráfico de barras agrupadas mês a mês:
- 🟧 **Abertas** — vagas com data de abertura no mês.
- 🟦 **Fechadas** — vagas fechadas no mês.
- 🟩 **Total no mês** — soma de aberturas no mês.

### 5. Visão C-Level
Seis KPIs operacionais: Total de Vagas, Fechadas, Abertas, Canceladas, **SLA Médio (dias úteis)** e **% no Prazo** (vagas fechadas sem atraso).

### 6. Distribuição por Tipo e Setor
- **Por Tipo de Vaga**: barras com totais de Estratégica / Tática / Operacional.
- **Por Setor**: ranking dos setores com mais demanda.

### 7. Funil — Etapas Atuais 🆕 *interativo*
Barras horizontais com a quantidade de vagas em cada etapa (Triagem, Entrevista RH, Entrevista Gestor, Contratado, Pausada, Cancelada).

> **Clique numa barra** para abrir um modal listando o **nome de cada vaga** naquela etapa. As vagas **não são agrupadas** — se houver duas vagas com o mesmo cargo, ambas aparecem.

### 8. Performance por Recrutador
Tabela com volume, fechadas, abertas, **taxa de conversão**, **SLA médio** e **atraso médio** por recrutador. Ideal para decisão de redistribuição de carga.

### 9. Fontes de Aprovação
- **Pizza**: canais que mais geraram **contratações** (`status = Fechada`).
- **Barras**: volume bruto de candidatos por canal (LinkedIn, Indeed, Catho, Sólides, Indicação, Site, PAT, Outros).

### 10. Backlog / Aging
Tabela de **vagas em aberto** ordenadas pelos **dias corridos** desde a abertura. Vagas com mais tempo aberto ficam no topo — ajuda a priorizar ação.

### 11. Insights Automáticos
Bloco de bullets com leituras rápidas (gargalos, recrutador com maior atraso, canal mais produtivo, etc.) gerado a partir dos dados filtrados.

---

## 📁 Estrutura

```
src/
├─ data/vagas.json              # base processada da planilha
├─ lib/recruitment.ts           # tipos, helpers (avg, sum, datas Excel)
├─ components/dashboard/
│  ├─ KpiCard.tsx               # card de KPI com comparativo
│  ├─ ChartCard.tsx             # wrapper visual de gráficos
│  ├─ FiltersBar.tsx            # filtros categóricos
│  └─ PeriodFilter.tsx          # filtro de período (ano/mês/intervalo)
└─ pages/Index.tsx              # composição do dashboard
```

---

## 🎨 Design

Tokens semânticos definidos em `src/index.css` e `tailwind.config.ts` (cores em HSL). Componentes shadcn/ui customizados.
