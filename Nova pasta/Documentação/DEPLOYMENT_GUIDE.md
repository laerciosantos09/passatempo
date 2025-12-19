# 🚀 Guia de Deploy no Azure App Services com PostgreSQL

## Pré-requisitos
- Conta Azure ativa
- Git instalado
- Azure CLI instalado (`az` command)
- Node.js 18+ instalado localmente

---

## PASSO 1: Preparar Repositório Git

### 1.1 Inicializar repositório (se ainda não tiver)
```bash
cd passatempo-games
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Enviar para GitHub (ou Azure Repos)

Se usando GitHub:
```bash
# Criar novo repositório no GitHub (vazio, sem README)
git remote add origin https://github.com/seu-usuario/passatempo-games.git
git branch -M main
git push -u origin main
```

---

## PASSO 2: Criar Banco de Dados PostgreSQL no Azure

### 2.1 No Azure Portal
1. Ir para Azure Home
2. Clique em **"Create a resource"**
3. Procurar por **"Azure Database for PostgreSQL"**
4. Selecionar **"Single server"** (mais simples) ou **"Flexible server"** (mais moderno)

### 2.2 Configurar PostgreSQL
**Básico:**
- Resource Group: criar novo (ex: `passatempo-rg`)
- Server name: `passatempo-db` (será `passatempo-db.postgres.database.azure.com`)
- Location: seu país/região
- Admin username: `dbadmin`
- Password: **SENHA FORTE** (anote!)
- Version: PostgreSQL 13 ou superior

**Networking:**
- Permitir acesso de Azure services: **SIM**
- Adicionar seu IP atual: `Add 0.0.0.0 - 255.255.255.255` (para simplicidade)

**Clique em "Review + Create" e "Create"**

### 2.3 Conectar ao banco PostgreSQL

Após criar (esperar ~5 min):

```bash
# Instalar psql se não tiver
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt install postgresql-client

# Conectar
psql -h passatempo-db.postgres.database.azure.com -U dbadmin@passatempo-db -d postgres

# No prompt de senha, digitar a senha que definiu

# Criar banco de dados
CREATE DATABASE passatempo_db;
\q
```

---

## PASSO 3: Criar App Service no Azure

### 3.1 No Azure Portal
1. **Create a resource** → procurar **"App Service"**
2. Configurar:
   - **Resource Group**: selecionar a mesma (`passatempo-rg`)
   - **Name**: `passatempo-app` (será `passatempo-app.azurewebsites.net`)
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: mesma do banco de dados
   - **App Service Plan**: criar novo (B1 é suficiente para teste)

3. Clique em **"Review + Create"** → **"Create"**

### 3.2 Aguardar deployment (2-3 minutos)

---

## PASSO 4: Configurar Variáveis de Ambiente

### 4.1 No Azure Portal
1. Ir para seu App Service (`passatempo-app`)
2. Menu esquerdo: **Settings** → **Configuration**
3. Clique em **"New application setting"** para cada variável:

| Name | Value |
|------|-------|
| `DATABASE_HOST` | `passatempo-db.postgres.database.azure.com` |
| `DATABASE_PORT` | `5432` |
| `DATABASE_NAME` | `passatempo_db` |
| `DATABASE_USER` | `dbadmin@passatempo-db` |
| `DATABASE_PASSWORD` | `sua_senha_muito_segura` |
| `JWT_SECRET` | `gere-uma-chave-aleatoria-segura-aqui` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://passatempo-app.azurewebsites.net` |
| `PORT` | `8080` |

**Dica para gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. **Salve** (Save)

---

## PASSO 5: Executar Migrações no Banco

### 5.1 Conectar ao banco e executar script

```bash
# Local, com variáveis de ambiente
export DATABASE_HOST=passatempo-db.postgres.database.azure.com
export DATABASE_PORT=5432
export DATABASE_NAME=passatempo_db
export DATABASE_USER=dbadmin@passatempo-db
export DATABASE_PASSWORD=sua_senha

# Executar migrações
npm install
npm run db:migrate
```

Você verá output como:
```
✓ Tabela usuarios criada
✓ Tabela pontuacoes criada
✓ Tabela progresso_usuario criada
✓ Tabela ranking_semanal criada
✓ Tabela ranking_mensal criada
✓ Tabela ranking_anual criada
✓ Função recalcular_rankings criada
✅ Migração concluída com sucesso!
```

---

## PASSO 6: Configurar CI/CD (GitHub Actions)

### 6.1 Conectar App Service ao GitHub

1. No Azure Portal, ir para seu App Service
2. Menu esquerdo: **Deployment** → **Deployment Center**
3. **Source**: GitHub
4. **Authorize** (faz login no GitHub)
5. Selecionar:
   - Organization: seu usuário
   - Repository: `passatempo-games`
   - Branch: `main`
6. **Save**

O Azure cria automaticamente um workflow GitHub Actions!

### 6.2 Verificar workflow

Na pasta `.github/workflows/`, você verá um arquivo criado pelo Azure.

Você pode deixar como está ou usar o arquivo `azure-pipelines.yml` fornecido.

---

## PASSO 7: Fazer Deploy

### 7.1 Push para GitHub

```bash
git add .
git commit -m "Deploy inicial para Azure"
git push origin main
```

### 7.2 Monitorar deployment

1. No Azure Portal, ir para seu App Service
2. **Deployment** → **Deployment Center**
3. Ver histórico de deploys

Ou no GitHub:
1. Ir para seu repositório
2. **Actions** → ver workflow rodando

---

## PASSO 8: Testar a Aplicação

### 8.1 Acessar no navegador

```
https://passatempo-app.azurewebsites.net
```

### 8.2 Teste rápido

1. Ir para `/login.html`
2. Clicar em **"Registro"**
3. Preencher dados:
   - Username: `testeuser`
   - Email: `teste@example.com`
   - Senha: `senha123`
   - Pergunta: `Qual seu jogo favorito?`
   - Resposta: `sudoku`
4. Clique em **Registrar**
5. Deve redirecionar para `/index.html` com lista de jogos

### 8.3 Ver logs

No Azure Portal:
1. App Service → **Monitoring** → **Log stream**
2. Fazer ações na aplicação
3. Ver logs em tempo real

---

## PASSO 9: Otimizações Adicionais (Opcional)

### 9.1 Adicionar Custom Domain
1. App Service → **Custom domains**
2. Adicionar seu domínio (ex: `jogos.seu-dominio.com`)
3. Seguir instruções de DNS

### 9.2 Configurar HTTPS automático
1. App Service → **TLS/SSL settings**
2. App Service Managed Certificate
3. Azure gerencia automaticamente

### 9.3 Backup automático do banco
1. PostgreSQL Server → **Backups**
2. Configurar retenção de backups

---

## TROUBLESHOOTING

### Erro: "Database connection failed"
```bash
# Verificar se migrações foram rodadas
npm run db:migrate

# Verificar credenciais
psql -h seu-host -U seu-usuario -d passatempo_db
```

### Erro: "Port already in use"
- Azure já define a porta (8080), não configurar `PORT=3000`

### Erro: "CORS blocked"
- Verificar `CORS_ORIGIN` nas variáveis de ambiente
- Deve ser exatamente o URL do app service

### Erro no Deploy (GitHub Actions)
1. Ir para repositório → **Actions**
2. Clicar no workflow que falhou
3. Ver logs de erro
4. Comum: variáveis de ambiente não configuradas

---

## Continuação: Gerenciamento

### Monitore Regularmente
- **App Service** → Insights
- **PostgreSQL** → Monitoring

### Update Dependências
```bash
npm update
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Escalabilidade
Se crescer de usuários:
1. App Service Plan → mudar para tier maior (S1, S2, etc)
2. PostgreSQL → upgrade para servidor mais poderoso

---

## 📞 Dúvidas Frequentes

**P: Quanto custa?**
A: Azure oferece crédito free trial. Produção: ~$30-50/mês (app service + banco)

**P: Posso usar banco local?**
A: Sim, mas Azure PostgreSQL é recomendado para produção

**P: Como faço backup do banco?**
A: PostgreSQL no Azure faz automaticamente (7 dias de retenção por padrão)

**P: Posso usar um domínio customizado?**
A: Sim, configurar em App Service → Custom domains

---

Parabéns! 🎉 Sua aplicação está rodando no Azure!
