# 🎮 Passatempo - Plataforma de Jogos

Plataforma de jogos com ranking mensal, semanal e anual, autenticação com PostgreSQL e deploy em Azure App Services.

## 📋 Características

- ✅ Autenticação com email, senha criptografada e pergunta secreta
- ✅ 8 Jogos diferentes (Adivinha Número, Quiz, Memória, Reação Rápida, Palavras Cruzadas, Sudoku, Damas)
- ✅ Sudoku e Damas com 200 níveis cada
- ✅ Rankings: Semanal, Mensal e Anual
- ✅ Progresso do usuário persistido
- ✅ Backend Node.js/Express
- ✅ PostgreSQL com tabelas otimizadas
- ✅ Autenticação JWT
- ✅ CI/CD configurado para Azure
- ✅ Responsive design

## 🛠️ Requisitos

- Node.js 18.x ou superior
- PostgreSQL 12.x ou superior
- Git
- Conta Azure (para deploy)

## 📦 Instalação Local

### 1. Clonar o repositório
```bash
git clone seu-repositorio-url
cd passatempo-games
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copiar `.env.example` para `.env` e preencher:

```bash
cp .env.example .env
```

Editar `.env` com seus dados:
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=passatempo_db
DATABASE_USER=seu_usuario
DATABASE_PASSWORD=sua_senha
JWT_SECRET=sua_chave_secreta_muito_segura
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4. Criar banco de dados PostgreSQL

```bash
# No PostgreSQL
CREATE DATABASE passatempo_db;
```

### 5. Executar migrações

```bash
npm run db:migrate
```

### 6. Iniciar o servidor

```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 🚀 Deploy no Azure

### 1. Criar recurso PostgreSQL no Azure

No Azure Portal:
- Crear recurso "Azure Database for PostgreSQL"
- Configurar servidor (anote o host, usuário e senha)
- Configurar regras de firewall para aceitar sua máquina

### 2. Criar App Service no Azure

```bash
# Usando Azure CLI
az appservice plan create --name seu-plan --resource-group seu-grupo --sku B1 --is-linux
az webapp create --resource-group seu-grupo --plan seu-plan --name seu-app-name --runtime "NODE|18"
```

### 3. Configurar variáveis de ambiente no App Service

Azure Portal → Seu App Service → Settings → Configuration → Application settings:

```
DATABASE_HOST: seu-servidor.postgres.database.azure.com
DATABASE_PORT: 5432
DATABASE_NAME: passatempo_db
DATABASE_USER: seu_usuario
DATABASE_PASSWORD: sua_senha_segura
JWT_SECRET: sua_chave_secreta_muito_segura
NODE_ENV: production
CORS_ORIGIN: https://seu-app-name.azurewebsites.net
```

### 4. Conectar repositório Git para CI/CD

Azure Portal → Seu App Service → Deployment Center:
- Selecionar GitHub (ou Azure Repos)
- Autorizar e selecionar repositório
- Selecionar branch `main`
- O arquivo `azure-pipelines.yml` será usado automaticamente

### 5. Fazer deploy

```bash
git add .
git commit -m "Deploy para Azure"
git push origin main
```

O Azure build automaticamente e faz deploy!

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

```
usuarios
├── id (UUID, PK)
├── username (VARCHAR, UNIQUE)
├── email (VARCHAR, UNIQUE)
├── senha_hash (VARCHAR)
├── pergunta_secreta (VARCHAR)
├── resposta_secreta_hash (VARCHAR)
├── data_criacao (TIMESTAMP)
├── ativo (BOOLEAN)
└── ultimo_login (TIMESTAMP)

pontuacoes
├── id (UUID, PK)
├── usuario_id (UUID, FK)
├── nome_jogo (VARCHAR)
├── pontos (INTEGER)
├── tentativas (INTEGER)
├── data_criacao (TIMESTAMP)
├── semana (INTEGER)
├── mes (INTEGER)
├── ano (INTEGER)
└── [índices para performance]

ranking_semanal / ranking_mensal / ranking_anual
├── id (UUID, PK)
├── usuario_id (UUID, FK)
├── username (VARCHAR)
├── nome_jogo (VARCHAR)
├── pontos_totais (INTEGER)
├── posicao (INTEGER)
├── [semana|mes|ano] (INTEGER)
└── data_calculo (TIMESTAMP)

progresso_usuario
├── id (UUID, PK)
├── usuario_id (UUID, FK)
├── nome_jogo (VARCHAR)
├── nivel_atual (INTEGER)
├── melhor_tempo_por_nivel (JSONB)
└── data_atualizacao (TIMESTAMP)
```

## 🎮 API Endpoints

### Autenticação
- `POST /api/auth/registro` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/recuperar-senha` - Recuperar senha
- `GET /api/auth/pergunta-secreta/:email` - Obter pergunta secreta

### Pontuações
- `POST /api/pontuacoes/salvar` - Salvar pontuação
- `POST /api/pontuacoes/progresso` - Atualizar progresso
- `GET /api/pontuacoes/progresso/:nomeJogo` - Obter progresso
- `GET /api/pontuacoes/estatisticas` - Obter estatísticas do usuário

### Rankings
- `GET /api/ranking/mensal/:nomeJogo` - Ranking mensal por jogo
- `GET /api/ranking/semanal/:nomeJogo` - Ranking semanal por jogo
- `GET /api/ranking/anual/:nomeJogo` - Ranking anual por jogo
- `GET /api/ranking/global/:tipo` - Ranking global (todos os jogos)

## 🎯 Jogos

### 1. Adivinha o Número
- Adivinhe o número entre 1-100
- Pontuação reduz com número de tentativas

### 2. Quiz de Geral
- Perguntas de conhecimento geral
- Múltiplas escolhas

### 3. Jogo da Memória
- Encontre pares de cartas
- Aumento de dificuldade

### 4. Reação Rápida
- 200 níveis de dificuldade progressiva
- Measure your reaction time

### 5. Palavras Cruzadas
- Complete as palavras cruzadas
- Desafios progressivos

### 6. Sudoku ⭐
- **200 níveis progressivos**
- Fácil (níveis 1-67)
- Normal (níveis 68-133)
- Difícil (níveis 134-200)

### 7. Damas ⭐
- **200 níveis contra IA**
- Aumenta dificuldade da IA progressivamente
- Desfazer movimentos
- Promoção a rei

## 🔐 Segurança

- Senhas criptografadas com bcryptjs (10 rounds)
- JWT para autenticação
- CORS configurado
- Helmet.js para headers de segurança
- Validação de entrada com express-validator
- SSL/TLS em produção (Azure gerencia)

## 📈 Performance

- Índices otimizados no PostgreSQL
- Queries parametrizadas (proteção contra SQL injection)
- Conexão com pool para melhor performance
- Função PL/pgSQL para recalcular rankings atomicamente

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
```bash
# Verificar variáveis de ambiente
echo $DATABASE_HOST
echo $DATABASE_USER

# Testar conexão
psql -h seu-host -U seu-usuario -d passatempo_db
```

### Erro no Deploy Azure
- Verificar se as variáveis de ambiente estão configuradas
- Verificar logs: Azure Portal → App Service → Log stream
- Executar migrações manualmente se necessário

### Problema com CORS
- Atualizar `CORS_ORIGIN` em `.env`
- Verificar se o frontend está na origem correta

## 📝 Estrutura de Arquivos

```
passatempo-games/
├── server.js                 # Servidor principal
├── database.js               # Conexão PostgreSQL
├── package.json
├── .env.example
├── azure-pipelines.yml       # CI/CD
├── middleware/
│   └── auth.js              # JWT middleware
├── routes/
│   ├── auth.js              # Autenticação
│   ├── pontuacoes.js        # Pontuações e progresso
│   └── ranking.js           # Rankings
├── scripts/
│   └── migrate.js           # Migração do BD
└── public/                  # Frontend
    ├── index.html           # Página inicial
    ├── login.html           # Login/Registro
    ├── game1_guess_number.html
    ├── game2_quiz.html
    ├── game3_memory.html
    ├── game4_reaction.html
    ├── game5_crosswords.html
    ├── game7_sudoku.html    # ⭐ Novo
    ├── game8_damas.html     # ⭐ Novo
    └── js/
        └── api.js           # Cliente API
```

## 🤝 Contribuindo

1. Fazer fork do projeto
2. Criar branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 👨‍💻 Autor

Desenvolvido como plataforma de jogos com ranking.

## 📞 Suporte

Para problemas ou dúvidas, abrir uma issue no repositório ou entrar em contato via email.

---

**Status:** ✅ Pronto para produção com Azure App Services e PostgreSQL
