# MapsLink

> Empregabilidade local em um mapa. Uma plataforma que conecta candidatos, estudantes e pequenas e médias empresas por meio de geolocalização, tornando a visualização de oportunidades profissionais mais clara e contextualizada regionalmente.

> ⚠️ **Status: em desenvolvimento.** A migração para React + Vite está em andamento. A estrutura do site ainda não está finalizada e existem correções pendentes de layout, organização de componentes e comportamento de algumas telas. O projeto é funcional para navegação e testes, mas não deve ser considerado uma versão estável.

---

## Sobre o projeto

O MapsLink nasceu como um projeto acadêmico de caráter extensionista, desenvolvido ao longo de aproximadamente seis meses. A proposta central sempre foi construir uma solução simples, intuitiva e acessível para um problema real: a dificuldade de enxergar onde estão as oportunidades de trabalho perto de você, e a baixa visibilidade de empresas de pequeno e médio porte na própria região.

Em vez de mais uma lista de vagas, o MapsLink coloca tudo em um mapa interativo, com filtros dinâmicos e navegação direta. Quem procura emprego entende o contexto geográfico da oportunidade; quem contrata ganha presença local.

O projeto foi construído com foco em impacto social, e não só em entrega técnica. Ele foi validado com usuários reais durante o desenvolvimento, e a evolução do código acompanha esse aprendizado.

## Funcionalidades

- Mapa interativo com as vagas e empresas posicionadas geograficamente
- Filtros dinâmicos para refinar a busca
- Fluxo de candidato: cadastro, login e navegação por oportunidades
- Fluxo de empresa: cadastro, login e divulgação de vagas
- Páginas de planos, contato e institucionais
- Layout responsivo, pensado para desktop e mobile
- SPA com navegação por rotas, sem recarregamento de página

## Stack

| Camada | Tecnologia |
| --- | --- |
| UI | React 19 |
| Build | Vite 7 |
| Rotas | React Router |
| Mapa | React Leaflet |
| Estilo | CSS customizado |
| Estado | Context API |

## Estrutura

```text
mapslink/
|-- index.html
|-- assets/
|   `-- images/
|-- src/
|   |-- components/     # componentes reutilizáveis
|   |-- context/        # estado global (autenticação, dados)
|   |-- data/           # dados e mocks
|   |-- pages/          # páginas mapeadas nas rotas
|   |-- styles/         # CSS por módulo
|   |-- App.jsx         # rotas e layout base
|   `-- main.jsx        # entrada da aplicação
|-- manifest.json
|-- package.json
`-- vite.config.js
```

> A organização acima ainda está sendo ajustada conforme a refatoração avança. Alguns componentes e estilos seguem sendo movidos para o lugar definitivo.

## Rodando localmente

Pré-requisitos: Node.js 18+ e npm.

```bash
git clone https://github.com/SEU-USUARIO/mapslink.git
cd mapslink
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

### Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Ambiente de desenvolvimento com hot reload |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build localmente para conferência |

## Contas de teste

**Candidato**

```
gelado@gmail.com
Senha@123
```

**Empresa**

```
talentos@neuralworks.ai
Empresa@123
```

> Contas de demonstração. Os dados são locais e servem apenas para explorar os fluxos da aplicação.

## Evolução do projeto

A primeira versão do MapsLink foi construída inteiramente com **HTML, CSS e JavaScript puro (Vanilla)**, por escolha deliberada: priorizar clareza, manutenibilidade e domínio dos fundamentos antes de adotar qualquer framework. Nessa fase foram trabalhados organização modular de código, usabilidade, responsividade e controle de versões com Git e GitHub.

A versão atual está em processo de migração para React + Vite. O que já foi feito:

- A estrutura antiga multipágina foi removida da origem
- O app passou a ser uma SPA, com React Router
- O mapa foi refeito com React Leaflet
- Login, cadastro, fluxo de candidato, fluxo de empresa, planos, contato e páginas institucionais viraram componentes React
- O layout começou a ser redesenhado com uma linguagem mais minimalista e moderna
- A paleta principal foi preservada em torno de `#102569` e `#0b1b4a`

### Em aberto

Pontos que ainda precisam de correção ou finalização:

- Ajustes de estrutura e padronização dos componentes
- Correções de layout e responsividade em telas específicas
- Revisão da organização dos arquivos de estilo
- Consistência entre os fluxos de candidato e empresa
- Tratamento de estados de erro e carregamento

## Próximos passos

- Concluir a refatoração e estabilizar a estrutura em React
- Integração com backend e persistência real de dados
- Autenticação com provedor externo
- Busca por raio e geolocalização do usuário
- Painel de métricas para empresas
- Testes automatizados

## Equipe

Projeto desenvolvido em conjunto com:

- João Gabriel Breganon Ferreira
- Gabriel Senatore Costa
- Luigi Lima
- Gabriel Duarte Frias

## Depoimento

Este projeto representou muito mais do que a entrega de uma aplicação web. Ao longo desses seis meses foi possível consolidar conceitos técnicos importantes, mas principalmente amadurecer a visão sobre como a tecnologia pode gerar impacto real fora do ambiente acadêmico. Trabalhar em um projeto com foco social ensinou a importância de pensar no usuário, na comunidade e no contexto onde a solução será aplicada.

Feedbacks, sugestões e trocas de ideias são muito bem-vindos. Abra uma issue ou entre em contato.
