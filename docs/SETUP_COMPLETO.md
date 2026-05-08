# Guia de Setup Completo - Sistema de Avaliação de Desempenho

Este guia te ensina a configurar e rodar o projeto completo do zero.

---

## 📋 Pré-requisitos

Antes de começar, instale:

- **Node.js** (v18 ou superior) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 ou superior) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **Editor de código** (VS Code recomendado)

---

## 🚀 Parte 1: Setup do Backend (30 min)

### 1.1 Criar estrutura do projeto

```bash
mkdir backend
cd backend
npm init -y
```

### 1.2 Instalar dependências

```bash
npm install express prisma @prisma/client bcryptjs jsonwebtoken joi dotenv cors helmet cookie-parser
npm install -D nodemon
```

**Dependências principais:**
- `express` - Framework web
- `prisma` + `@prisma/client` - ORM para banco de dados
- `bcryptjs` - Criptografia de senhas
- `jsonwebtoken` - Autenticação JWT
- `joi` - Validação de dados
- `dotenv` - Variáveis de ambiente
- `cors` - Permitir requisições cross-origin
- `helmet` - Segurança HTTP
- **`cookie-parser`** - Ler cookies HTTP (para HttpOnly cookies)

### 1.3 Configurar package.json

Edite o `package.json` e adicione:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "node prisma/seed.js"
  }
}
```

### 1.4 Criar estrutura de pastas

```bash
mkdir -p src/config
mkdir -p src/middlewares
mkdir -p src/modules/users
mkdir -p src/modules/evaluations
mkdir -p src/modules/competencies
mkdir -p src/utils
mkdir -p prisma
```

### 1.5 Criar .env

Crie o arquivo `.env` na raiz do backend:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="seu_secret_super_seguro_aqui_min_32_caracteres"
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

**⚠️ IMPORTANTE:** 
- Troque `user`, `password` e `dbname` pelos dados do seu PostgreSQL
- Use um JWT_SECRET forte (mínimo 32 caracteres)

### 1.6 Criar .gitignore

```
node_modules/
.env
dist/
*.log
```

---

## 🗄️ Parte 2: Configurar Banco de Dados (20 min)

### 2.1 Inicializar Prisma

```bash
npx prisma init
```

### 2.2 Configurar schema.prisma

O arquivo já foi criado em `prisma/schema.prisma`. Substitua o conteúdo por:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserType {
  admin
  gestor
  colaborador
}

model User {
  id           String   @id @default(uuid())
  ra           String   @unique
  nome         String
  email        String   @unique
  senha        String
  tipo         UserType
  foto         String?
  cargo        String?
  departamento String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  avaliacoesFeitas    Evaluation[] @relation("AvaliadorRelation")
  avaliacoesRecebidas Evaluation[] @relation("AvaliadoRelation")
  nineBoxAvaliacoes   NineBox[]

  @@index([ra])
  @@index([email])
  @@map("users")
}

enum TipoAvaliacao {
  gestor_para_colaborador
  colaborador_para_gestor
  avaliacao_360
}

model Evaluation {
  id            String        @id @default(uuid())
  tipoAvaliacao TipoAvaliacao
  avaliadorId   String
  avaliadoId    String
  criterios     Json
  media         Float?
  comentario    String?
  anonima       Boolean       @default(true)
  data          DateTime      @default(now())
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  avaliador User @relation("AvaliadorRelation", fields: [avaliadorId], references: [id], onDelete: Cascade)
  avaliado  User @relation("AvaliadoRelation", fields: [avaliadoId], references: [id], onDelete: Cascade)

  @@index([avaliadoId])
  @@index([avaliadorId])
  @@index([data])
  @@map("evaluations")
}

model NineBox {
  id          String   @id @default(uuid())
  pessoaId    String
  performance Int
  potential   Int
  categoria   String
  comentario  String?
  data        DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  pessoa User @relation(fields: [pessoaId], references: [id], onDelete: Cascade)

  @@index([pessoaId])
  @@map("nine_box")
}

model Competency {
  id             String   @id @default(uuid())
  nome           String   @unique
  descricao      String
  tipo           String
  competenciaDe  String
  criterios      String[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([nome])
  @@map("competencies")
}
```

### 2.3 Rodar migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 2.4 Criar seed (dados de teste)

Crie o arquivo `prisma/seed.js`:

```javascript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Limpando banco...');
  await prisma.evaluation.deleteMany();
  await prisma.nineBox.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.user.deleteMany();

  console.log('👤 Criando usuários...');

  const admin = await prisma.user.create({
    data: {
      ra: '1234567',
      nome: 'Admin Sistema',
      email: 'admin@eniac.edu.br',
      senha: await bcrypt.hash('admin123', 10),
      tipo: 'admin',
      cargo: 'Administrador',
      departamento: 'TI'
    }
  });

  const gestor = await prisma.user.create({
    data: {
      ra: '2021001',
      nome: 'João Silva',
      email: 'joao@eniac.edu.br',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'gestor',
      cargo: 'Gerente de TI',
      departamento: 'TI'
    }
  });

  const colaborador = await prisma.user.create({
    data: {
      ra: '2022001',
      nome: 'Ana Costa',
      email: 'ana@eniac.edu.br',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'colaborador',
      cargo: 'Desenvolvedora',
      departamento: 'TI'
    }
  });

  console.log('⭐ Criando avaliações...');

  await prisma.evaluation.create({
    data: {
      tipoAvaliacao: 'gestor_para_colaborador',
      avaliadorId: gestor.id,
      avaliadoId: colaborador.id,
      criterios: {
        pontualidade: 5,
        qualidade: 5,
        proatividade: 4,
        comunicacao: 5
      },
      media: 4.75,
      comentario: 'Colaboradora muito dedicada.',
      anonima: true
    }
  });

  await prisma.evaluation.create({
    data: {
      tipoAvaliacao: 'colaborador_para_gestor',
      avaliadorId: colaborador.id,
      avaliadoId: gestor.id,
      criterios: {
        lideranca: 5,
        comunicacao: 4,
        suporte: 5,
        organizacao: 4
      },
      media: 4.5,
      comentario: 'Gestor muito acessível.',
      anonima: true
    }
  });

  console.log('✅ Seed concluído!');
  console.log('\n📧 Credenciais de teste:');
  console.log('Admin: admin@eniac.edu.br / admin123');
  console.log('Gestor: joao@eniac.edu.br / senha123');
  console.log('Colaborador: ana@eniac.edu.br / senha123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 2.5 Rodar seed

```bash
npm run prisma:seed
```

---

## ⚙️ Parte 3: Implementar Backend

Agora siga os guias dos estagiários na ordem:

1. **[ESTAGIARIO_1_USERS.md](backend/ESTAGIARIO_1_USERS.md)** - Módulo de Usuários (1h30)
2. **[ESTAGIARIO_2_EVALUATIONS.md](backend/ESTAGIARIO_2_EVALUATIONS.md)** - Avaliações e Nine Box (1h30)
3. **[ESTAGIARIO_3_COMPETENCIES.md](backend/ESTAGIARIO_3_COMPETENCIES.md)** - Competências (1h)

Cada guia tem instruções detalhadas passo a passo.

---

## 🎨 Parte 4: Setup do Frontend (15 min)

### 4.1 Estrutura de pastas

```
frontend/
├── css/
│   ├── style.css
│   ├── components.css
│   └── pages.css
├── js/
│   ├── config.js
│   ├── api.js
│   ├── auth.js
│   ├── utils.js
│   ├── components/
│   │   ├── loading.js
│   │   └── toast.js
│   └── pages/
│       ├── login.js
│       ├── cadastrar.js
│       └── consultar.js
├── pages/
│   ├── login.html
│   ├── cadastrar.html
│   └── consultar.html
└── index.html
```

### 4.2 Implementar Frontend

Siga os guias dos estagiários:

1. **[ESTAGIARIO_1_INFRAESTRUTURA.md](frontend/ESTAGIARIO_1_INFRAESTRUTURA.md)** - Infraestrutura e Auth (1h30)
2. **[ESTAGIARIO_2_INTEGRACAO.md](frontend/ESTAGIARIO_2_INTEGRACAO.md)** - Integração com API (2h)

---

## 🔐 Autenticação Profissional

Este projeto usa **HttpOnly Cookies** para autenticação segura:

### Por que HttpOnly Cookies?

| Método | Segurança XSS | Segurança CSRF | Profissional |
|--------|---------------|----------------|--------------|
| localStorage | ❌ Vulnerável | ✅ Protegido | ⚠️ Básico |
| sessionStorage | ❌ Vulnerável | ✅ Protegido | ⚠️ Médio |
| **HttpOnly Cookie** | ✅ **Protegido** | ✅ **Protegido** | ✅ **Recomendado** |

### Como funciona?

**Backend:**
```javascript
// Login - Retorna token em HttpOnly Cookie
res.cookie('token', token, {
  httpOnly: true,      // Não acessível via JavaScript
  secure: true,        // Apenas HTTPS em produção
  sameSite: 'strict',  // Proteção CSRF
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
});
```

**Frontend:**
```javascript
// Login - Cookie é salvo automaticamente
await fetch('/api/users/login', {
  method: 'POST',
  credentials: 'include', // IMPORTANTE!
  body: JSON.stringify({ email, senha })
});

// Requisições autenticadas - Cookie enviado automaticamente
await fetch('/api/users/profile', {
  credentials: 'include' // IMPORTANTE!
});
```

### Durante desenvolvimento com MOCK

Enquanto o backend não estiver pronto, use `sessionStorage` temporariamente:

```javascript
// Temporário (apenas para mock)
sessionStorage.setItem('user', JSON.stringify(user));
```

Quando o backend estiver pronto, migre para HttpOnly Cookies.

---

## 🧪 Parte 5: Testar o Sistema (15 min)

### 5.1 Rodar backend

```bash
cd backend
npm run dev
```

Deve aparecer:
```
Servidor rodando na porta 3000
Health check: http://localhost:3000/health
```

### 5.2 Testar no Postman

**1. Login:**
```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "admin@eniac.edu.br",
  "senha": "admin123"
}
```

**2. Ver perfil:**
```http
GET http://localhost:3000/api/users/profile
```

O cookie é enviado automaticamente!

### 5.3 Rodar frontend

Use o **Live Server** do VS Code:
1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

Ou use qualquer servidor HTTP:
```bash
cd frontend
npx serve
```

### 5.4 Testar no navegador

1. Abra `http://localhost:5500/pages/login.html`
2. Login: `admin@eniac.edu.br` / `admin123`
3. Deve redirecionar para dashboard
4. Abra DevTools → Application → Cookies
5. Veja o cookie `token` com flag `HttpOnly`

---

## 📚 Documentação Adicional

- **[COMECE_AQUI.md](COMECE_AQUI.md)** - Visão geral do projeto
- **[BACKEND.md](BACKEND.md)** - Documentação completa do backend
- **[FRONTEND.md](FRONTEND.md)** - Documentação completa do frontend
- **[FAQ.md](backend/FAQ.md)** - Perguntas frequentes

---

## 🐛 Problemas Comuns

### Backend não inicia

**Erro:** `Error: Cannot find module`
- **Solução:** Rode `npm install`

**Erro:** `Can't reach database server`
- **Solução:** Verifique se PostgreSQL está rodando
- **Solução:** Verifique DATABASE_URL no .env

### Frontend não conecta

**Erro:** `CORS error`
- **Solução:** Verifique se backend tem `credentials: true` no CORS
- **Solução:** Verifique se frontend usa `credentials: 'include'`

**Erro:** `Token não fornecido`
- **Solução:** Verifique se está usando `credentials: 'include'` no fetch
- **Solução:** Verifique se backend tem `cookie-parser` configurado

### Cookie não é salvo

- **Solução:** Use `credentials: 'include'` no fetch
- **Solução:** Backend deve ter `credentials: true` no CORS
- **Solução:** Em desenvolvimento, use HTTP (não HTTPS)

---

## ✅ Checklist Final

### Backend
- [ ] PostgreSQL instalado e rodando
- [ ] Dependências instaladas (`npm install`)
- [ ] `.env` configurado corretamente
- [ ] Migration rodada (`npx prisma migrate dev`)
- [ ] Seed rodado (`npm run prisma:seed`)
- [ ] Servidor rodando (`npm run dev`)
- [ ] Health check funcionando (`http://localhost:3000/health`)
- [ ] Login funcionando no Postman

### Frontend
- [ ] Live Server instalado
- [ ] `config.js` com URL correta do backend
- [ ] `auth.js` usando `credentials: 'include'`
- [ ] Login funcionando no navegador
- [ ] Cookie HttpOnly visível no DevTools

---

## 🚀 Próximos Passos

Agora que o setup está completo:

1. Implemente os módulos seguindo os guias dos estagiários
2. Teste cada endpoint no Postman
3. Integre frontend com backend
4. Adicione mais funcionalidades conforme necessário

---

## 💡 Dicas Importantes

1. **Sempre teste** cada endpoint depois de criar
2. **Use Prisma Studio** para ver os dados: `npm run prisma:studio`
3. **Leia os erros** com atenção - eles dizem o que está errado
4. **Commit frequente** - a cada feature que funcionar
5. **Segurança primeiro** - Use HttpOnly Cookies em produção
6. **Durante desenvolvimento** - sessionStorage é OK para mock

---

Qualquer dúvida, consulte os guias específicos ou a documentação completa! 🎉
