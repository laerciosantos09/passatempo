# 🔧 Configurar Git e Deploy

## Passo 1: Inicializar Repositório Local

```bash
cd passatempo-games

# Iniciar git (se ainda não tiver)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit: Passatempo Games Platform"
```

## Passo 2: Criar Repositório no GitHub

1. Ir para https://github.com/new
2. Preencher:
   - **Repository name**: `passatempo-games`
   - **Description**: `Plataforma de Jogos com Rankings - Sudoku, Damas e mais`
   - **Public** ou **Private** (sua escolha)
   - ❌ NÃO marcar "Initialize with README" (já temos)
   - ❌ NÃO marcar ".gitignore" (já temos)
   - ❌ NÃO marcar "License" (já temos)
3. Clique em **Create repository**

## Passo 3: Conectar Repositório Local ao GitHub

```bash
# Substituir USERNAME pelo seu usuário do GitHub
git remote add origin https://github.com/USERNAME/passatempo-games.git

# Renomear branch para main (se ainda for master)
git branch -M main

# Fazer push inicial
git push -u origin main
```

## Passo 4: Configurar Deploy Automático no Azure

### Opção A: Azure DevOps Pipeline (Recomendado)

1. Ir para https://dev.azure.com
2. Criar novo projeto
3. Pipelines → Create Pipeline
4. Selecionar GitHub
5. Autorizar GitHub
6. Selecionar repositório `passatempo-games`
7. Selecionar "Node.js with Express"
8. Azure usará o arquivo `azure-pipelines.yml`
9. Configurar trigger automático

### Opção B: GitHub Actions (Mais simples)

Azure cria automaticamente um workflow GitHub Actions quando você conecta no Deployment Center do App Service.

1. App Service → Deployment Center
2. Source: GitHub
3. Autorizar e selecionar repositório
4. Selecionar branch: `main`
5. Pronto! A partir de agora, todo push faz deploy automático

## Passo 5: Fazer Commit de Mudanças Futuras

### Adicionar um novo jogo
```bash
# Criar arquivo
touch public/game9_seu_jogo.html

# Adicionar ao git
git add public/game9_seu_jogo.html

# Commit
git commit -m "Add: Novo jogo - Seu Jogo

- Implementado game9_seu_jogo.html
- Suporta 200 níveis
- Integrado com ranking"

# Push (dispara deploy automático!)
git push origin main
```

### Fix de bug
```bash
git add .
git commit -m "Fix: Corrigir bug de login no Safari

- Adicionar fallback para localStorage
- Testar em Safari 14+"

git push origin main
```

### Atualizar dependências
```bash
npm update
git add package-lock.json
git commit -m "Chore: Update dependencies

npm update para versões mais recentes"

git push origin main
```

## Passo 6: Monitorar Deploy

### No Azure Portal
1. App Service → Deployment Center
2. Ver histórico de deploys
3. Clicar em um deploy para ver logs

### No GitHub
1. Ir para repositório
2. **Actions** tab
3. Ver workflow rodando
4. Clique no workflow para detalhes

### Verificar se Deploy Funcionou
```bash
# Testar endpoint de health check
curl https://seu-app-name.azurewebsites.net/api/health

# Deve retornar:
# {"status":"OK","timestamp":"2024-01-15T10:30:00.000Z"}
```

## Dicas de Commit

### Bom commit:
```bash
git commit -m "Feature: Adicionar Sudoku com 200 níveis

- Implementar gerador de sudoku
- Verificar solução
- Salvar progresso no banco
- Responsive design mobile"
```

### Não é bom:
```bash
git commit -m "update"  # Muito genérico
git commit -m "fix bug"  # Qual bug?
```

## Branching Strategy (Opcional)

Se quiser trabalhar com múltiplas features:

```bash
# Criar branch para nova feature
git checkout -b feature/novo-jogo

# Fazer commits
git add .
git commit -m "Feature: Novo jogo"

# Quando terminar, fazer PR
# 1. Push para GitHub: git push origin feature/novo-jogo
# 2. GitHub mostra botão "Create Pull Request"
# 3. Descrever mudanças
# 4. Depois de review, fazer merge para main
# 5. Deploy automático acontece!
```

## Rollback (Se algo dar errado)

```bash
# Ver histórico
git log --oneline

# Voltar para commit anterior
git revert <commit-hash>

# Ou fazer reset (cuidado, perde mudanças)
git reset --hard HEAD~1

# Push para Azure redeployar
git push -f origin main
```

## Variáveis de Ambiente Seguras

### NÃO fazer:
```bash
# ❌ Nunca commit .env
# ❌ Nunca commit senhas no código
echo "DATABASE_PASSWORD=senha123" > .env
git add .env  # NÃO FAÇA ISSO!
```

### Fazer:
```bash
# ✅ Commit apenas .env.example
git add .env.example
git commit -m "Add: .env.example template"

# ✅ Configurar variáveis no Azure Portal
# App Service → Configuration → Application settings
```

## Integração com Azure DevOps

Se usar Azure DevOps ao invés de GitHub Actions:

```bash
# Arquivo azure-pipelines.yml já está configurado
# Ele:
# 1. Instala dependências (npm ci)
# 2. Roda migrações (npm run db:migrate)
# 3. Deploy no App Service

# Para ajustar, edite azure-pipelines.yml:
trigger:
  - main  # Deploy apenas na branch main

variables:
  nodeVersion: '18.x'  # Versão do Node

stages:
  - stage: Build  # Estágio de build
  - stage: Deploy  # Estágio de deploy
```

## Problemas Comuns

### "fatal: not a git repository"
```bash
# Estar na pasta certa
cd passatempo-games
git status  # Deve mostrar "On branch main"
```

### "fatal: origin does not appear to be a git repository"
```bash
# Adicionar remote de novo
git remote add origin https://github.com/USERNAME/passatempo-games.git
git push -u origin main
```

### "Your branch is ahead of 'origin/main' by 1 commit"
```bash
# Você fez commit localmente mas não fez push
git push origin main
```

### Deploy falha no Azure
1. Verificar Azure → App Service → Log stream
2. Ver mensagem de erro
3. Comum: variáveis de ambiente não configuradas
4. Solução: Azure Portal → Configuration → Application settings

## Checklist Final

- [ ] Repositório criado no GitHub
- [ ] `git remote add origin` configurado
- [ ] `git push origin main` funcionou
- [ ] App Service conectado ao GitHub
- [ ] Primeira deploy automática completou
- [ ] Acessar URL do Azure funciona
- [ ] Pode fazer commits e ver deploy automático
- [ ] Senhas não estão no git (.env no .gitignore)

## Próximas Features (Exemplos de Commit)

```bash
# Feature branch workflow
git checkout -b feature/leaderboard-global
# ... fazer mudanças ...
git add .
git commit -m "Feature: Add global leaderboard page

- Mostrar top 100 players
- Filtrar por período (semanal/mensal/anual)
- Atualização em tempo real"
git push origin feature/leaderboard-global

# Depois fazer merge para main:
git checkout main
git pull origin main
git merge feature/leaderboard-global
git push origin main
```

---

## 🎯 Resumo Rápido

```bash
# Setup inicial
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/passatempo-games.git
git push -u origin main

# Mudanças futuras
git add .
git commit -m "Descrição clara da mudança"
git push origin main  # Deploy automático no Azure!
```

---

**Pronto! Seu código está pronto para versioning e deploy contínuo! 🚀**
