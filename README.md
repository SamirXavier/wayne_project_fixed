# 🧾 Documentação — Wayne Project (Segurança — Backend FastAPI + Frontend React)

## 🚀 Como executar o aplicativo

Este repositório contém um sistema full‑stack dividido em **backend (FastAPI)** e **frontend (React + Vite)**. Abaixo você encontra instruções para executar cada parte localmente.

### 🔹 Pré-requisitos

* Python 3.11+ (recomendado)
* Node.js 18+ e npm
* (Opcional) Ambiente virtual para Python: `python -m venv .venv`

---

### 🟢 Backend (API) — execução local

1. Entre na pasta do backend:

```bash
cd backend
```

2. Crie e ative um ambiente virtual (opcional, recomendado):

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
```

3. Instale as dependências:

```bash
pip install -r requirements.txt
```

> Se o arquivo `requirements.txt` estiver codificado em UTF‑16 e ocorrer erro, basta abrir com um editor e salvá‑lo em UTF‑8.

4. Inicialize o banco de dados (se necessário):

```bash
# Opcional — caso queira popular dados iniciais
python -m app.initial_data
```

5. Rode a API com Uvicorn **(comando correto)**:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

A API ficará disponível em `http://localhost:8000`.

---

### 🟢 Frontend (React + Vite)

1. Entre na pasta do frontend:

```bash
cd frontend
```

2. Instale as dependências:

```bash
npm install
```

3. Rode o ambiente de desenvolvimento:

```bash
npm run dev
```

O frontend padrão usa Vite e estará disponível em `http://localhost:3000`.

> O frontend espera que a API esteja rodando em `http://localhost:8000` por padrão — veja `frontend/src/services/api.js`.

---

## 🏢 Informações Gerais

**Nome do Projeto:** Wayne Project — Security Management

**Backend:** FastAPI (Python)

**Frontend:** React + Vite

**Banco de Dados:** SQLite (arquivo local gerenciado pela aplicação)

**Arquitetura:** Aplicação organizada em camadas; backend em módulos (autenticação, CRUD, modelos, schemas) e frontend em páginas/serviços.

**Objetivo:** Gerenciar usuários, recursos, áreas restritas, registros de acesso e dashboards de segurança.

---

## 🧱 Estrutura do Projeto (visão geral)

```
/wayne_project_fixed
│
├─ backend/
│  ├─ app/
│  │  ├─ __init__.py
│  │  ├─ main.py            # Aplicação FastAPI e endpoints
│  │  ├─ auth.py            # Autenticação, dependências e segurança
│  │  ├─ crud.py            # Operações de leitura/escrita ao DB
│  │  ├─ models.py          # Modelos SQLAlchemy
│  │  ├─ schemas.py         # Pydantic schemas
│  │  ├─ database.py        # Engine, sessão e inicialização do DB
│  │  └─ initial_data.py    # Inserção de dados iniciais (opcional)
│  └─ requirements.txt
│
├─ frontend/
│  ├─ package.json
│  └─ src/
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ pages/             # Páginas: Login, Dashboard, Users, Resources, etc.
│     └─ services/api.js    # Cliente HTTP para a API (usa VITE_API_BASE)
│
└─ README.md
```

---

## 🧩 Backend — Documentação Técnica (módulos e responsabilidades)

### 📌 `app/main.py`

Arquivo principal que instancia a aplicação FastAPI, configura CORS e registra os endpoints.

**Pontos chave encontrados:**

* `FastAPI(title="Wayne Industries Security API")`
* Middleware CORS liberado para `http://localhost:3000` e `http://127.0.0.1:3000` (frontend Vite)
* Endpoints principais (amostra):

  * `POST /auth/token` — token de autenticação (via OAuth2 Password Flow)
  * `POST /users/` — criar usuário
  * `GET /users/` — listar usuários (requer role `security_admin`)
  * `GET /users/me` — info do usuário atual
  * `CRUD /resources` — gerenciamento de recursos
  * `GET /dashboard/stats` — estatísticas para o painel

> O `main.py` declara dependências de segurança que utilizam funções em `auth.py`.

### 🛡️ `app/auth.py`

Responsável por:

* Gerenciar autenticação (token JWT), verificação de senha, criação de tokens de acesso
* Dependências para obter o usuário atual e checar permissões (ex: `require_role('manager')`)
* Fornece acesso ao DB via dependência `get_db` (session)

### 🗄️ `app/database.py`

* Configura `SQLAlchemy` engine, `SessionLocal` e meta `Base`.
* Garante criação de tabelas (se necessário) e centraliza a conexão com o SQLite.

### 📚 `app/models.py` e `app/schemas.py`

* `models.py` define as tabelas (Users, Resources, Areas, AccessLogs, Vendas? etc.) usando SQLAlchemy.
* `schemas.py` define os Pydantic models usados em request/response.

### 🔁 `app/crud.py`

* Implementa funções de negócio para operações de CRUD: criação de usuário, consulta de recursos, registro de logs de acesso, listagem de vendas/recursos, etc.
* Também contém funções utilitárias como `get_dashboard_stats()` que agregam dados para o frontend.

### ♻️ `app/initial_data.py`

* Script para popular o banco com usuários, recursos e áreas iniciais — útil para desenvolvimento.

---

## 🧩 Frontend — Documentação Técnica (principais arquivos)

### 📁 `frontend/src/services/api.js`

* Contém função auxiliar `apiRequest(endpoint, options)` que adiciona o header `Authorization: Bearer <token>` (lido do `localStorage`) e faz requests à API.
* Usa `import.meta.env.VITE_API_BASE` (fallback `http://localhost:8000`) — você pode definir `VITE_API_BASE` no `.env` do frontend.
* Exporta funções específicas utilizadas nas páginas: `login`, `getUsers`, `getResources`, `getDashboardStats`, etc.

### 🧭 Páginas (`frontend/src/pages`)

* `Login.jsx` — formulário de autenticação e armazenamento do token
* `Dashboard.jsx` — gráficos e estatísticas (usa `apexcharts`)
* `Users.jsx` — CRUD de usuários (apenas para administradores)
* `Resources.jsx` — gerenciamento de recursos e áreas restritas
* `AccessLogs.jsx` — visualização de logs de acesso
* `RestrictedAreas.jsx` — gerenciamento de áreas e permissões

### 🔐 ProtectedRoute.jsx

* Componente que protege rotas privadas, redirecionando para login caso não haja token válido.

---

## 🧾 Endpoints Principais (resumo)

> Lista dos endpoints mais relevantes encontrados no backend (resumo; ver `app/main.py` para a lista completa):

* `POST /auth/token` — autenticação (retorna `access_token`)
* `POST /users/` — criar usuário
* `GET /users/` — listar usuários (role `security_admin`)
* `GET /users/me` — informações do usuário autenticado
* `GET /resources/` — listar recursos
* `POST /resources/` — criar recurso (role `manager`)
* `PUT /resources/{id}` — atualizar recurso (role `manager`)
* `DELETE /resources/{id}` — remover recurso (role `manager`)
* `GET /dashboard/stats` — estatísticas do painel
* `GET /accesslogs/` — listar logs de acesso
* `POST /accesslogs/` — registrar entrada/saída (dependendo da implementação)

> Observação: a aplicação usa dependências declaradas em `auth.py` para checar permissões por role.

---

## ⚙️ Dependências (principais)

### Backend (resumido do `requirements.txt`)

* fastapi==0.121.0
* uvicorn (geralmente instalado como `uvicorn` ou via `requirements`)
* sqlalchemy
* pydantic
* passlib / bcrypt (para hashing)
* python-jose / jose (para JWT)
* httpx / requests (client)

> Instale todas com `pip install -r backend/requirements.txt`.

### Frontend

* react
* react-dom
* react-router-dom
* apexcharts + react-apexcharts (gráficos)
* vite, tailwindcss (tooling e estilo)

> Instale com `npm install` dentro de `frontend/`.

---

## 🧮 Fluxo de Funcionamento (resumo)

1. Usuário acessa o frontend e faz login (`/login`).
2. Frontend envia credenciais para `POST /auth/token` e recebe `access_token`.
3. Token é guardado em `localStorage` e usado em `Authorization: Bearer ...` para chamadas subsequentes.
4. Usuário acessa o dashboard, listas de usuários, recursos e logs conforme permissões.
5. Todas as operações no backend passam por validações (ex.: verificação de estoque, checagem de role, existência de registros).

---

## 🧠 Regras de Negócio (detectadas)

* Controle de acesso por roles (ex.: `security_admin`, `manager`, `operator`)
* Rotas protegidas que exigem token JWT e checagem de `is_active` e roles
* Recursos e logs relacionados a áreas restritas e registro de acessos
* Dashboard que agrega métricas de uso/acessos

---

## 🎨 Interface do Usuário

* Design minimalista com rotas protegidas e páginas claras para cada funcionalidade.
* Gráficos em `Dashboard.jsx` usando `apexcharts`.
* Feedback visual (alerts/snackbars) exibidos após operações críticas.

---

## 🧾 Arquivos úteis para manutenção

* `backend/app/main.py` — pontos de entrada e endpoints
* `backend/app/auth.py` — lógica de autenticação e dependências
* `backend/app/crud.py` — regras de acesso a dados
* `backend/app/models.py` / `schemas.py` — definição do modelo de dados
* `frontend/src/services/api.js` — ponto central das chamadas HTTP
* `frontend/src/pages/*` — UIs principais

---

## 🔐 Possíveis Extensões Futuras

* Autenticação com OAuth2 externo / SSO
* Controle de permissões mais granuladas (roles + policies)
* Relatórios e exportação (CSV / PDF)
* Implementar testes automatizados (unit / integration)
* Deploy em ambiente containerizado (Docker) e CI/CD
* Monitoramento e logging centralizado (Sentry, Prometheus)

---

## 🧩 Conclusão

Este README serve como guia rápido para rodar e entender a aplicação full‑stack Wayne Project. Ele inclui as instruções essenciais para levantar o backend (FastAPI) e o frontend (React), além de uma documentação técnica integrada cobrindo arquitetura, módulos, endpoints e regras de negócio.


