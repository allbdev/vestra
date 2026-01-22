# Vestra

Aplicativo de gestão financeira para controlar despesas, orçamentos e investimentos. Suporta workspaces compartilhados, permitindo que múltiplos usuários (como casais ou famílias) gerenciem suas finanças juntos.

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
│   │   ├── auth/
│   │   │   ├── register/    # POST /api/auth/register
│   │   │   ├── confirm/     # POST /api/auth/confirm
│   │   │   ├── login/       # POST /api/auth/login
│   │   │   └── user-info/   # GET /api/auth/user-info
│   │   ├── workspaces/
│   │   │   ├── route.ts     # GET, POST /api/workspaces
│   │   │   └── [id]/
│   │   │       ├── route.ts # GET, PUT, DELETE /api/workspaces/[id]
│   │   │       ├── users/
│   │   │       │   ├── route.ts     # GET, POST /api/workspaces/[id]/users
│   │   │       │   └── [userId]/
│   │   │       │       └── route.ts # DELETE /api/workspaces/[id]/users/[userId]
│   │   │       └── categories/
│   │   │           ├── route.ts     # GET, POST /api/workspaces/[id]/categories
│   │   │           └── [categoryId]/
│   │   │               └── route.ts # GET, PUT, DELETE /api/workspaces/[id]/categories/[categoryId]
│   │   └── categories/      # (Deprecated) Redirecionado para workspaces
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
│   │   └── AuthContext.tsx  # Context de autenticação
│   ├── generated/           # Cliente Prisma gerado
│   ├── dashboard/           # Página de dashboard
│   ├── lib/                 # Utilitários
│   │   ├── db.ts            # Conexão com banco de dados
│   │   ├── email.ts         # Serviço de e-mail
│   │   ├── auth.ts          # Funções de autenticação (session tokens, authenticateRequest)
│   │   └── workspace.ts     # Funções de workspace (checkWorkspaceAccess, getUserWorkspaceIds)
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página inicial (landing page)
├── prisma/
│   ├── migrations/          # Migrations do banco
│   └── schema.prisma        # Schema do Prisma
├── docker-compose.yml       # Configuração Docker
└── .env.example             # Exemplo de variáveis de ambiente
```

## 🗃️ Estrutura do Banco de Dados

### Modelos Principais

#### User (Usuários)
- Armazena informações dos usuários do sistema
- Relacionado com: `Session`, `Workspace`, `WorkspaceUser`, `Category`, `TransactionTemplate`, `Transaction`

#### Workspace (Workspaces)
- Espaços de trabalho que podem ser compartilhados entre usuários
- O proprietário (owner) pode editar/excluir o workspace e adicionar/remover usuários
- Campos principais:
  - `id`: UUID único do workspace
  - `name`: Nome do workspace
  - `ownerId`: ID do usuário proprietário
- Relacionado com: `User` (owner), `WorkspaceUser`, `Category`, `TransactionTemplate`, `Transaction`

#### WorkspaceUser (Usuários do Workspace)
- Vincula usuários aos workspaces que têm acesso
- Campos principais:
  - `workspaceId`: ID do workspace
  - `userId`: ID do usuário
- Relacionado com: `Workspace`, `User`

#### Category (Categorias)
- Categorias de receitas e despesas (no nível do workspace)
- Campos principais:
  - `workspaceId`: ID do workspace (define visibilidade)
  - `ownerId`: ID do usuário que criou (define quem pode editar/excluir)
  - `name`: Nome da categoria
  - `type`: Tipo ('revenue' ou 'expense')
  - `color`: Cor em formato hexadecimal
  - `icon`: Ícone da categoria
- Relacionado com: `Workspace`, `User` (owner), `TransactionTemplate`, `Transaction`

#### TransactionTemplate (Templates de Recorrência)
- Templates para criar transações recorrentes automaticamente
- Campos principais:
  - `workspaceId`: ID do workspace (define visibilidade)
  - `ownerId`: ID do usuário que criou (define quem pode editar/excluir)
  - `description`: Descrição da transação
  - `baseAmount`: Valor base da transação
  - `frequency`: Frequência ('daily', 'weekly', 'monthly', 'yearly')
  - `dayOfPeriod`: Dia do período (ex: dia 05 de cada mês)
  - `startDate`: Data de início
  - `endDate`: Data de término (opcional)
  - `active`: Se o template está ativo
- Relacionado com: `Workspace`, `User` (owner), `Category`, `Transaction`

#### Transaction (Transações)
- Transações financeiras (receitas e despesas)
- Campos principais:
  - `workspaceId`: ID do workspace (define visibilidade)
  - `ownerId`: ID do usuário que criou (define quem pode editar/excluir)
  - `description`: Descrição da transação
  - `amount`: Valor da transação
  - `date`: Data da transação
  - `isPaid`: Se a transação foi paga
  - `paidAt`: Data/hora do pagamento
  - `deletedAt`: Soft delete (exclusão lógica)
- Relacionado com: `Workspace`, `User` (owner), `Category`, `TransactionTemplate`

### Modelo de Permissões

- **Visibilidade**: Todos os usuários em um workspace podem ver todos os dados (categorias, transações, templates)
- **Edição de Workspace**: Apenas o proprietário do workspace pode editá-lo, excluí-lo ou gerenciar usuários
- **Edição de Recursos**: Apenas o criador do recurso (owner) pode editar ou excluir categorias, transações e templates

### Migrations Aplicadas

- `20241207000000_init_users_table` - Tabela inicial de usuários
- `20251207201503_add_confirmation_codes_table` - Tabela de códigos de confirmação
- `20251207221333_add_sessions_table` - Tabela de sessões
- `20260120204715_add_transactions_tables` - Tabelas de transações (categories, transaction_templates, transactions)
- `20260121152357_add_workspaces` - Tabelas de workspaces e atualização das tabelas de transações

## 🔌 API Endpoints

### Autenticação

Todos os endpoints (exceto os de autenticação) requerem um token de sessão no header `Authorization: Bearer <token>` ou no cookie `sessionToken`.

#### POST /api/auth/register
Registra um novo usuário.

#### POST /api/auth/confirm
Confirma o cadastro com código de verificação.

#### POST /api/auth/login
Realiza login e retorna token de sessão.

#### GET /api/auth/user-info
Retorna informações do usuário autenticado.

### Workspaces

#### GET /api/workspaces
Lista todos os workspaces que o usuário tem acesso (como proprietário ou membro).

**Resposta:**
```json
{
  "workspaces": [
    {
      "id": "uuid-do-workspace",
      "name": "Finanças da Família",
      "ownerId": 1,
      "isOwner": true,
      "owner": { "id": 1, "name": "João", "email": "joao@exemplo.com" },
      "users": [...],
      "_count": { "categories": 5, "transactions": 100 }
    }
  ]
}
```

#### POST /api/workspaces
Cria um novo workspace.

**Body:**
```json
{
  "name": "Finanças da Família"
}
```

#### GET /api/workspaces/[id]
Retorna detalhes de um workspace específico.

#### PUT /api/workspaces/[id]
Atualiza um workspace (apenas proprietário).

**Body:**
```json
{
  "name": "Novo Nome do Workspace"
}
```

#### DELETE /api/workspaces/[id]
Exclui um workspace (apenas proprietário, soft delete).

### Usuários do Workspace

#### GET /api/workspaces/[id]/users
Lista todos os usuários de um workspace.

#### POST /api/workspaces/[id]/users
Adiciona um usuário ao workspace por e-mail (apenas proprietário).

**Body:**
```json
{
  "email": "usuario@exemplo.com"
}
```

#### DELETE /api/workspaces/[id]/users/[userId]
Remove um usuário do workspace (proprietário pode remover qualquer um, usuário pode remover a si mesmo).

### Categorias

#### GET /api/workspaces/[id]/categories
Lista todas as categorias do workspace.

**Resposta:**
```json
{
  "categories": [
    {
      "id": 1,
      "workspaceId": "uuid-do-workspace",
      "ownerId": 1,
      "name": "Alimentação",
      "type": "expense",
      "color": "#FF5733",
      "icon": "🍔",
      "isOwner": true,
      "owner": { "id": 1, "name": "João", "email": "joao@exemplo.com" }
    }
  ]
}
```

#### POST /api/workspaces/[id]/categories
Cria uma nova categoria no workspace.

**Body:**
```json
{
  "name": "Alimentação",
  "type": "expense",
  "color": "#FF5733",
  "icon": "🍔"
}
```

#### GET /api/workspaces/[id]/categories/[categoryId]
Retorna uma categoria específica.

#### PUT /api/workspaces/[id]/categories/[categoryId]
Atualiza uma categoria (apenas o criador).

**Body:** (todos os campos são opcionais)
```json
{
  "name": "Alimentação Atualizada",
  "type": "expense",
  "color": "#FF5733",
  "icon": "🍔"
}
```

#### DELETE /api/workspaces/[id]/categories/[categoryId]
Exclui uma categoria (apenas o criador). Não permite exclusão se a categoria estiver sendo usada.

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

### Workspaces

- [x] Estrutura de banco de dados para workspaces
- [x] Tabelas: workspaces, workspace_users
- [x] API de workspaces (CRUD completo)
- [x] Gerenciamento de usuários do workspace
- [x] Modelo de permissões (owner vs member)

### Finanças (em desenvolvimento)

- [x] Estrutura de banco de dados para transações (workspace-level)
- [x] Tabelas: categories, transaction_templates, transactions
- [x] API de categorias (CRUD completo, workspace-scoped)
- [ ] Dashboard
- [ ] Cadastro de transações
- [ ] Templates de recorrência
- [ ] Orçamentos mensais
- [ ] Relatórios
