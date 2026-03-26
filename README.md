# MapsLink

MapsLink agora e uma aplicacao React + Vite 100%, com rotas, estado, mapa e fluxos principais implementados em componentes React.

## Stack

- React 19
- Vite 7
- React Router
- React Leaflet
- CSS customizado

## Estrutura

```text
mapslink/
|-- index.html
|-- assets/
|   `-- images/
|-- src/
|   |-- components/
|   |-- context/
|   |-- data/
|   |-- pages/
|   |-- styles/
|   |-- App.jsx
|   `-- main.jsx
|-- manifest.json
|-- package.json
`-- vite.config.js
```

## Rodando localmente

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

## O que mudou

- A estrutura antiga multipagina foi removida da origem.
- O app usa uma SPA real com React Router.
- O layout foi redesenhado com uma linguagem mais minimalista e moderna.
- O mapa foi refeito com React Leaflet.
- Login, cadastro, fluxo de candidato, fluxo de empresa, planos, contato e paginas institucionais vivem em componentes React.
- A paleta principal foi preservada em torno de `#102569` e `#0b1b4a`.

## Contas de teste

Candidato:

- `gelado@gmail.com`
- `Senha@123`

Empresa:

- `talentos@neuralworks.ai`
- `Empresa@123`
