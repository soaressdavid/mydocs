# Índice da Documentação

## 🚀 Comece aqui

**PRIMEIRO PASSO**: Leia [`SETUP_COMPLETO.md`](SETUP_COMPLETO.md) para configurar o ambiente

### Backend
1. Leia [`BACKEND.md`](BACKEND.md) - Guia completo
2. Veja seu módulo abaixo

### Frontend
1. Leia [`FRONTEND.md`](FRONTEND.md) - Guia completo
2. Veja sua tarefa abaixo

---

## 📖 Documentação Principal

### Guias Essenciais
- [`COMECE_AQUI.md`](COMECE_AQUI.md) - **Ponto de entrada** (leia primeiro!)
- [`SETUP_COMPLETO.md`](SETUP_COMPLETO.md) - **Setup do ambiente** (backend + frontend)
- [`SEGURANCA_AUTENTICACAO.md`](SEGURANCA_AUTENTICACAO.md) - **Autenticação profissional** (HttpOnly Cookies)
- [`ATUALIZACOES.md`](ATUALIZACOES.md) - Registro de mudanças

---

## Backend

### Docs gerais
- [`BACKEND.md`](BACKEND.md) - Guia completo
- [`backend/FAQ.md`](backend/FAQ.md) - Perguntas frequentes
- [`backend/SCHEMA.prisma`](backend/SCHEMA.prisma) - Schema do banco
- [`backend/DIAGRAMAS.md`](backend/DIAGRAMAS.md) - Diagramas

### Por estagiário
- [`backend/ESTAGIARIO_1_USERS.md`](backend/ESTAGIARIO_1_USERS.md) - Usuários (autenticação, RA)
- [`backend/ESTAGIARIO_2_EVALUATIONS.md`](backend/ESTAGIARIO_2_EVALUATIONS.md) - Avaliações (Nine Box)
- [`backend/ESTAGIARIO_3_COMPETENCIES.md`](backend/ESTAGIARIO_3_COMPETENCIES.md) - Competências (relatórios)

---

## Frontend

### Docs gerais
- [`FRONTEND.md`](FRONTEND.md) - Guia completo
- [`frontend/FAQ.md`](frontend/FAQ.md) - Perguntas frequentes

### Por estagiário
- [`frontend/ESTAGIARIO_1_INFRAESTRUTURA.md`](frontend/ESTAGIARIO_1_INFRAESTRUTURA.md) - Infraestrutura (API, auth)
- [`frontend/ESTAGIARIO_2_INTEGRACAO.md`](frontend/ESTAGIARIO_2_INTEGRACAO.md) - Integração (CRUD, validações)

---

## Estrutura completa

```
docs/
├── INDICE.md                   # Este arquivo
├── COMECE_AQUI.md              # Ponto de entrada
├── SETUP_COMPLETO.md           # Setup do ambiente ⭐ NOVO
├── SEGURANCA_AUTENTICACAO.md   # Autenticação profissional ⭐ NOVO
├── BACKEND.md                  # Guia backend
├── FRONTEND.md                 # Guia frontend
├── ATUALIZACOES.md             # Registro de mudanças
│
├── backend/
│   ├── ESTAGIARIO_1_USERS.md
│   ├── ESTAGIARIO_2_EVALUATIONS.md
│   ├── ESTAGIARIO_3_COMPETENCIES.md
│   ├── SCHEMA.prisma
│   ├── DIAGRAMAS.md
│   └── FAQ.md
│
└── frontend/
    ├── ESTAGIARIO_1_INFRAESTRUTURA.md
    ├── ESTAGIARIO_2_INTEGRACAO.md
    └── FAQ.md
```

---

## Fluxo de trabalho

### Setup Inicial (TODOS)
1. Ler [`SETUP_COMPLETO.md`](SETUP_COMPLETO.md)
2. Instalar dependências (Node.js, PostgreSQL, etc)
3. Configurar backend e banco de dados
4. Configurar frontend
5. Entender autenticação com HttpOnly Cookies

### Backend
1. Ler [`BACKEND.md`](BACKEND.md)
2. Ler [`SEGURANCA_AUTENTICACAO.md`](SEGURANCA_AUTENTICACAO.md) (autenticação)
3. Ler doc do seu módulo
4. Implementar (Controller → Service → Repository)
5. Testar no Postman
6. Fazer PR

### Frontend
1. Ler [`FRONTEND.md`](FRONTEND.md)
2. Ler [`SEGURANCA_AUTENTICACAO.md`](SEGURANCA_AUTENTICACAO.md) (autenticação)
3. Ler doc da sua tarefa
4. Implementar módulos
5. Testar no navegador
6. Fazer PR

---

## 🔐 Segurança

**IMPORTANTE**: Este projeto usa **HttpOnly Cookies** para autenticação:
- ✅ Protegido contra XSS (Cross-Site Scripting)
- ✅ Protegido contra CSRF (Cross-Site Request Forgery)
- ✅ Padrão profissional usado por grandes empresas

Leia [`SEGURANCA_AUTENTICACAO.md`](SEGURANCA_AUTENTICACAO.md) para entender como funciona.

---

## Ajuda

- **Setup**: Ver [`SETUP_COMPLETO.md`](SETUP_COMPLETO.md)
- **Segurança**: Ver [`SEGURANCA_AUTENTICACAO.md`](SEGURANCA_AUTENTICACAO.md)
- **Backend**: Ver [`backend/FAQ.md`](backend/FAQ.md)
- **Frontend**: Ver [`frontend/FAQ.md`](frontend/FAQ.md)
- **Dúvidas**: Perguntar no daily
