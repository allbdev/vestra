# Vestra

Aplicativo de gestão financeira pessoal para controlar despesas, orçamentos e investimentos.

## 🚀 Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **Prisma 7** - ORM para banco de dados
- **MySQL 8** - Banco de dados relacional
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
│   │   └── register/        # Página de cadastro
│   ├── api/                 # API Routes
│   │   └── auth/
│   │       ├── register/    # POST /api/auth/register
│   │       └── confirm/     # POST /api/auth/confirm
│   ├── generated/           # Cliente Prisma gerado
│   ├── lib/                 # Utilitários
│   │   ├── db.ts           # Conexão com banco de dados
│   │   └── email.ts        # Serviço de e-mail
│   ├── globals.css         # Estilos globais
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página inicial
├── prisma/
│   ├── migrations/         # Migrations do banco
│   └── schema.prisma       # Schema do Prisma
├── docker-compose.yml      # Configuração Docker
└── .env.example           # Exemplo de variáveis de ambiente
```

## 🔐 Funcionalidades

### Autenticação

- [x] Cadastro de usuário com confirmação por e-mail
- [x] Código de confirmação com expiração de 5 minutos
- [ ] Login
- [ ] Recuperação de senha
- [ ] Logout

### Finanças (em desenvolvimento)

- [ ] Dashboard
- [ ] Cadastro de transações
- [ ] Categorias de despesas
- [ ] Orçamentos mensais
- [ ] Relatórios
