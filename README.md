# Vestra

Aplicativo de gestão financeira pessoal para controlar despesas, orçamentos e investimentos.

## 🚀 Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **Prisma 7** - ORM para banco de dados
- **MySQL 8** - Banco de dados relacional
- **React Hook Form** - Gerenciamento de formulários
- **Yup** - Validação de schemas
- **Resend** - Envio de e-mails transacionais

## 📋 Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- Conta no [Resend](https://resend.com) (para envio de e-mails)

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd finance
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_HOST="localhost"
DATABASE_PORT=3306
DATABASE_USER="root"
DATABASE_PASSWORD="password"
DATABASE_NAME="vestra"

# Email (Resend)
RESEND_API_KEY="re_sua_api_key"
EMAIL_FROM="Vestra <seu-email@seudominio.com>"
```

### 4. Inicie o banco de dados

```bash
docker compose up -d
```

### 5. Execute as migrations

```bash
npm run db:migrate
```

### 6. Gere o cliente Prisma

```bash
npm run db:generate
```

### 7. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o linter |
| `npm run db:generate` | Gera o cliente Prisma |
| `npm run db:migrate` | Executa migrations em desenvolvimento |
| `npm run db:migrate:deploy` | Executa migrations em produção |
| `npm run db:push` | Sincroniza schema com o banco (sem migration) |
| `npm run db:studio` | Abre o Prisma Studio (GUI do banco) |

## 🐳 Docker

### Iniciar o banco de dados

```bash
docker compose up -d
```

### Parar o banco de dados

```bash
docker compose down
```

### Ver logs do MySQL

```bash
docker compose logs -f mysql
```

### Acessar o MySQL via CLI

```bash
docker exec -it vestra_mysql mysql -u root -ppassword vestra
```

## 🗄️ Prisma

### Criar uma nova migration

```bash
npx prisma migrate dev --name nome_da_migration
```

### Visualizar o banco de dados

```bash
npm run db:studio
```

### Resetar o banco de dados

```bash
npx prisma migrate reset
```

### Verificar status das migrations

```bash
npx prisma migrate status
```

## 📁 Estrutura do Projeto

```
├── app/
│   ├── (auth)/              # Rotas de autenticação
│   │   ├── register/        # Página de cadastro
│   │   └── login/           # Página de login
│   ├── api/                 # API Routes
│   │   └── auth/
│   │       ├── register/    # POST /api/auth/register
│   │       ├── confirm/     # POST /api/auth/confirm
│   │       ├── login/       # POST /api/auth/login
│   │       └── user-info/   # GET /api/auth/user-info
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/
│   │   │   ├── Alert.tsx    # Componente de alerta
│   │   │   ├── Button.tsx   # Componente de botão
│   │   │   ├── CodeInput.tsx # Input para código de verificação
│   │   │   ├── Input.tsx    # Componente de input
│   │   │   └── index.ts     # Exportações
│   │   ├── Header.tsx       # Cabeçalho com navegação
│   │   └── BackgroundEffects.tsx # Efeitos de fundo animados
│   ├── contexts/            # React Contexts
│   │   └── AuthContext.tsx # Context de autenticação
│   ├── generated/           # Cliente Prisma gerado
│   ├── dashboard/          # Página de dashboard
│   ├── lib/                 # Utilitários
│   │   ├── db.ts           # Conexão com banco de dados
│   │   ├── email.ts        # Serviço de e-mail
│   │   └── auth.ts         # Funções de autenticação (session tokens)
│   ├── globals.css         # Estilos globais
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página inicial (landing page)
├── prisma/
│   ├── migrations/         # Migrations do banco
│   └── schema.prisma       # Schema do Prisma
├── docker-compose.yml      # Configuração Docker
└── .env.example           # Exemplo de variáveis de ambiente
```

## 🧩 Componentes UI

Componentes reutilizáveis localizados em `app/components/ui/`:

### Button

```tsx
import { Button } from "@/app/components/ui";

<Button variant="primary" size="md" loading={false} fullWidth>
  Enviar
</Button>
```

**Props:** `variant` (primary | secondary | ghost), `size` (sm | md | lg), `loading`, `fullWidth`

### Input

```tsx
import { Input } from "@/app/components/ui";

<Input
  label="E-mail"
  type="email"
  placeholder="joao@exemplo.com"
  hint="Texto de ajuda"
  error="Mensagem de erro"
  required
  {...register("email")}
/>
```

**Props:** `label`, `hint`, `error`, `required`, + todos os props nativos de input

### CodeInput

```tsx
import { CodeInput } from "@/app/components/ui";

<CodeInput
  value={["", "", "", "", "", ""]}
  onChange={setCode}
  length={6}
  disabled={false}
/>
```

### Alert

```tsx
import { Alert } from "@/app/components/ui";

<Alert variant="error">Mensagem de erro</Alert>
```

**Variants:** `error`, `success`, `warning`, `info`

## 🔐 Funcionalidades

### Autenticação

- [x] Cadastro de usuário com confirmação por e-mail
- [x] Código de confirmação com expiração de 5 minutos
- [x] Validação de formulários com React Hook Form + Yup
- [x] Login com autenticação por sessão
- [x] Armazenamento de sessões no banco de dados
- [ ] Recuperação de senha
- [ ] Logout

### Finanças (em desenvolvimento)

- [ ] Dashboard
- [ ] Cadastro de transações
- [ ] Categorias de despesas
- [ ] Orçamentos mensais
- [ ] Relatórios
