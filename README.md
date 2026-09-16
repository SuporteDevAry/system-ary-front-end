# Ary Oleofar — Frontend

Painel web do sistema de gestão da Ary Oleofar (corretora de grãos): cadastro de clientes e contatos, contratos de grãos, faturamento, notas fiscais, produtos, relatórios, usuários e permissões.

## Stack

- **React 18 + TypeScript**
- **Vite** — build e dev server
- **Material UI (MUI)** — componentes de UI (`@mui/material`, `x-data-grid`, `x-date-pickers`)
- **React Router** — roteamento
- **React Hook Form** — formulários
- **Axios** (+ `axios-retry`) — comunicação com a API
- **Recharts** — gráficos do dashboard
- **jsPDF / html2pdf.js / html2canvas / xlsx** — geração de PDFs e planilhas de relatórios/contratos

## Estrutura

```
src/
├── assets/            # imagens e recursos estáticos
├── components/        # componentes reutilizáveis (CustomInput, CustomTable, Sidebar, Layout, ...)
├── contexts/          # estado global por domínio (Auth, Cliente, Contrato, Billing, Invoice, Nfse, ...)
├── helpers/           # formatação (moeda, data, extenso), DTOs, validadores de documento, integração back-end
├── hooks/             # hooks customizados (debounce, busca em tabela, permissões do usuário)
├── pages/             # telas: Dashboard, Clientes, Contracts, Billing, Products, Reports, Users, Permissions, DevPanel, Login, ...
├── services/          # instância axios e chamadas de API
├── styles/            # temas
└── templates/         # templates de documentos/relatórios
```

## Pré-requisitos

- Node.js 20+
- [Backend da Ary Oleofar](../system-ary-back-end) rodando (local ou remoto)

## Como rodar

```bash
npm install
cp .env.example .env   
npm run dev             # http://localhost:3000
```

