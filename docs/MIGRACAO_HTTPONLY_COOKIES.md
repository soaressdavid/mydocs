# Guia de Migração: localStorage → HttpOnly Cookies

## 🎯 Objetivo

Migrar autenticação de localStorage (inseguro) para HttpOnly Cookies (seguro).

---

## ⏱️ Tempo Estimado

- **Backend**: 30 minutos
- **Frontend**: 20 minutos
- **Testes**: 15 minutos
- **Total**: ~1 hora

---

## 📋 Pré-requisitos

- [ ] Backend rodando
- [ ] Frontend rodando
- [ ] Postman instalado
- [ ] Conhecimento básico de cookies

---

## 🔧 Passo a Passo

### BACKEND (30 min)

#### 1. Instalar cookie-parser (2 min)

```bash
cd backend
npm install cookie-parser
```

#### 2. Configurar app.js (5 min)

```javascript
import cookieParser from 'cookie-parser';

// ANTES das rotas
app.use(cookieParser());

// Atualizar CORS
app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true // ← ADICIONAR
}));
```

#### 3. Atualizar user.controller.js (10 min)

**Login:**
```javascript
async login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const { user, token } = await userService.login(email, senha);
    
    // ← ADICIONAR: Retornar token em cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
    });
    
    // MODIFICAR: Retornar apenas user (sem token)
    return res.json({
      success: true,
      data: { user } // ← Remover token daqui
    });
  } catch (error) {
    next(error);
  }
}
```

**Logout (novo endpoint):**
```javascript
async logout(req, res, next) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    return res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
}
```

#### 4. Atualizar auth.js middleware (8 min)

```javascript
const authMiddleware = (req, res, next) => {
  try {
    // ANTES: const authHeader = req.headers.authorization;
    // DEPOIS: Ler do cookie
    const token = req.cookies.token;

    if (!token) {
      throw new AppError('Token não fornecido', 401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new AppError('Token inválido', 401);
      }

      req.user = decoded;
      return next();
    });
  } catch (error) {
    next(error);
  }
};
```

#### 5. Adicionar rota de logout (5 min)

**user.routes.js:**
```javascript
// Rotas públicas
router.post('/login', validate(loginSchema), (req, res, next) => userController.login(req, res, next));
router.post('/logout', (req, res, next) => userController.logout(req, res, next)); // ← ADICIONAR
```

---

### FRONTEND (20 min)

#### 1. Atualizar config.js (2 min)

```javascript
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  // TOKEN_KEY: 'token', ← REMOVER
  USER_KEY: 'user',
  TOAST_DURATION: 3000,
};
```

#### 2. Atualizar auth.js (10 min)

```javascript
const auth = {
  async login(email, senha) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ← ADICIONAR
      body: JSON.stringify({ email, senha })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    
    // MODIFICAR: Salvar apenas user (não o token)
    this.setUser(data.data.user);
    
    return data;
  },

  async logout() {
    try {
      // ← ADICIONAR: Chamar endpoint de logout
      await fetch(`${CONFIG.API_BASE_URL}/users/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      this.removeUser();
      window.location.href = '/pages/login.html';
    }
  },

  // REMOVER: getToken(), setToken(), removeToken()
  
  getUser() {
    try {
      // MODIFICAR: sessionStorage ao invés de localStorage
      return JSON.parse(sessionStorage.getItem(CONFIG.USER_KEY) || 'null');
    } catch {
      return null;
    }
  },

  setUser(user) {
    // MODIFICAR: sessionStorage ao invés de localStorage
    sessionStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
  },

  removeUser() {
    // MODIFICAR: sessionStorage ao invés de localStorage
    sessionStorage.removeItem(CONFIG.USER_KEY);
  }
};
```

#### 3. Atualizar api.js (8 min)

```javascript
class API {
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    
    const config = {
      ...options,
      credentials: 'include', // ← ADICIONAR
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
        // REMOVER: Authorization header
      }
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }

  // Todos os métodos já funcionam (cookie automático)
  async getUsers() {
    return this.request('/users');
  }

  async getProfile() {
    return this.request('/users/profile');
  }
  
  // ... outros métodos
}
```

---

### TESTES (15 min)

#### 1. Testar no Postman (5 min)

**Login:**
```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "admin@eniac.edu.br",
  "senha": "admin123"
}
```

**Verificar:**
- [ ] Status 200
- [ ] Response tem apenas `user` (sem `token`)
- [ ] Headers tem `Set-Cookie: token=...; HttpOnly`

**Perfil:**
```http
GET http://localhost:3000/api/users/profile
```

**Verificar:**
- [ ] Status 200
- [ ] Cookie enviado automaticamente
- [ ] Retorna dados do usuário

**Logout:**
```http
POST http://localhost:3000/api/users/logout
```

**Verificar:**
- [ ] Status 200
- [ ] Cookie é limpo

#### 2. Testar no Navegador (10 min)

**Login:**
1. Abrir `http://localhost:5500/pages/login.html`
2. Login: `admin@eniac.edu.br` / `admin123`
3. Verificar redirecionamento para dashboard

**Verificar Cookie:**
1. Abrir DevTools (F12)
2. Application → Cookies → `http://localhost:5500`
3. Ver cookie `token` com flag `HttpOnly`

**Tentar Acessar Cookie:**
```javascript
// No console
document.cookie; // Não deve mostrar o token
```

**Requisições:**
1. Navegar pelas páginas
2. Verificar que tudo funciona
3. Cookie é enviado automaticamente

**Logout:**
1. Clicar em "Sair"
2. Verificar redirecionamento para login
3. Verificar que cookie foi limpo (DevTools)

---

## ✅ Checklist Final

### Backend
- [ ] `cookie-parser` instalado
- [ ] `app.use(cookieParser())` configurado
- [ ] CORS com `credentials: true`
- [ ] Login retorna cookie (não token no body)
- [ ] Endpoint de logout criado
- [ ] Middleware lê token do cookie
- [ ] Testado no Postman

### Frontend
- [ ] `TOKEN_KEY` removido do config
- [ ] `credentials: 'include'` em todas as requisições
- [ ] `auth.js` não salva token manualmente
- [ ] `sessionStorage` para dados do usuário
- [ ] Logout chama endpoint do backend
- [ ] Testado no navegador

### Testes
- [ ] Login funciona
- [ ] Cookie é salvo com flag HttpOnly
- [ ] JavaScript não acessa o token
- [ ] Requisições autenticadas funcionam
- [ ] Logout limpa o cookie
- [ ] Navegação entre páginas funciona

---

## 🐛 Troubleshooting

### Cookie não é salvo

**Problema:** Cookie não aparece no DevTools

**Soluções:**
1. Verificar `credentials: 'include'` no fetch
2. Verificar `credentials: true` no CORS
3. Verificar se domínios são compatíveis (localhost:5500 → localhost:3000)
4. Limpar cookies antigos (DevTools → Application → Clear storage)

### CORS error

**Problema:** `Access-Control-Allow-Origin` error

**Soluções:**
1. Verificar `credentials: true` no CORS
2. Verificar `origin` correto no CORS
3. Reiniciar backend após mudanças

### Token não é enviado

**Problema:** Backend retorna "Token não fornecido"

**Soluções:**
1. Verificar `credentials: 'include'` no fetch
2. Verificar se cookie existe (DevTools)
3. Verificar se middleware lê `req.cookies.token`

---

## 📚 Referências

- [Documentação Completa](SEGURANCA_AUTENTICACAO.md)
- [Setup Completo](SETUP_COMPLETO.md)
- [Backend - Estagiário 1](backend/ESTAGIARIO_1_USERS.md)
- [Frontend - Estagiário 1](frontend/ESTAGIARIO_1_INFRAESTRUTURA.md)

---

## 🎉 Conclusão

Após seguir este guia:
- ✅ Autenticação mais segura (HttpOnly Cookies)
- ✅ Protegido contra XSS
- ✅ Código mais limpo (cookie automático)
- ✅ Padrão profissional

**Migração concluída! 🚀**
