# ⚡ Setup Rápido - Desenvolvimento Local

## Para Desenvolvedores

### 1️⃣ Clonar e Instalar
```bash
git clone seu-repositorio-url
cd passatempo-games
npm install
```

### 2️⃣ Configurar Banco PostgreSQL Local

**Windows/macOS/Linux:**
```bash
# Instalar PostgreSQL se não tiver
# Windows: https://www.postgresql.org/download/
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql postgresql-contrib

# Iniciar serviço PostgreSQL
# Windows: Services → postgresql → Start
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Conectar como admin
psql -U postgres

# Criar banco
CREATE DATABASE passatempo_db;
CREATE USER passatempo WITH PASSWORD 'senha123';
ALTER ROLE passatempo CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE passatempo_db TO passatempo;
\q
```

### 3️⃣ Configurar .env
```bash
cp .env.example .env
```

Editar `.env`:
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=passatempo_db
DATABASE_USER=passatempo
DATABASE_PASSWORD=senha123
JWT_SECRET=sua-chave-secreta-local-qualquer-uma
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4️⃣ Migrar Banco
```bash
npm run db:migrate
```

Output esperado:
```
✓ Tabela usuarios criada
✓ Tabela pontuacoes criada
... (demais tabelas)
✅ Migração concluída com sucesso!
```

### 5️⃣ Iniciar Servidor
```bash
npm start
```

Você verá:
```
🎮 Servidor iniciado em porta 3000
Ambiente: development
Acesse em http://localhost:3000
```

### 6️⃣ Testar
1. Abrir `http://localhost:3000`
2. Ir para `/login.html`
3. Registrar novo usuário
4. Jogar!

---

## 🔧 Desenvolvimento

### Estrutura de Pastas
```
├── server.js              # Servidor principal (Express)
├── database.js            # Config PostgreSQL
├── middleware/auth.js     # Autenticação JWT
├── routes/
│   ├── auth.js           # Login/Registro
│   ├── pontuacoes.js     # Salvar scores
│   └── ranking.js        # Buscar rankings
├── scripts/migrate.js     # Criar tabelas
├── public/
│   ├── index.html        # Home
│   ├── login.html        # Auth
│   ├── game*.html        # Jogos
│   └── js/api.js         # Cliente API
└── package.json
```

### Adicionar Novo Jogo

1. **Criar arquivo** `public/game9_seu_jogo.html`
2. **Adicionar link** no `public/index.html` na grid de jogos
3. **Usar API**:
```javascript
// Salvar pontuação
await api.salvarPontuacao('Nome do Jogo', 100, 5);

// Atualizar progresso (para jogos com níveis)
await api.atualizarProgresso('Nome do Jogo', 5);
```

### Adicionar Novo Endpoint

1. **Criar arquivo** em `routes/seu-arquivo.js`
2. **Importar** em `server.js`
```javascript
import seuRoute from './routes/seu-arquivo.js';
app.use('/api/seu-endpoint', seuRoute);
```
3. **Usar middleware** de auth se necessário:
```javascript
router.get('/dados', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  // ...
});
```

---

## 📊 Inspecionar Banco de Dados

### Via Terminal
```bash
psql -U passatempo -d passatempo_db

# Listar tabelas
\dt

# Ver estrutura da tabela
\d usuarios

# Ver dados
SELECT * FROM usuarios LIMIT 5;

# Sair
\q
```

### Via GUI (Recomendado)
Use pgAdmin:
```bash
# Instalar pgAdmin
pip install pgadmin4

# Ou baixar de https://www.pgadmin.org/download/
```

---

## 🐛 Debugging

### Ver Logs do Servidor
```bash
npm start
# Logs aparecem no terminal onde rodou npm start
```

### Ver Requisições HTTP
No navegador:
1. F12 → Network tab
2. Fazer ações no jogo
3. Ver requisições e respostas

### Testar API Manualmente
```bash
# Registrar
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teste",
    "email": "teste@test.com",
    "senha": "senha123",
    "perguntaSecreta": "Sua cor favorita?",
    "respostaSecreta": "azul"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@test.com",
    "senha": "senha123"
  }'

# Copiar o token da resposta e usar em próximas requisições
curl -X GET http://localhost:3000/api/pontuacoes/estatisticas \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📦 Build para Produção

### Verificar tudo está funcionando
```bash
npm test  # Se tiver testes
npm start # Testar localmente
```

### Deploy (Git Push)
```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

Azure build automaticamente!

---

## 🚀 Performance

### Checklist antes de Deploy
- [ ] Testar todos os 8 jogos localmente
- [ ] Verificar se migrações rodaram sem erro
- [ ] Testar login/registro
- [ ] Verificar rankings
- [ ] Testar com celular (responsive design)
- [ ] Verificar console do navegador (F12)

### Otimizações
```javascript
// ✅ Use async/await ao invés de callbacks
// ✅ Sempre validar entrada com express-validator
// ✅ Usar índices no PostgreSQL (já feito)
// ✅ Cache em localStorage para dados não-críticos
```

---

## 📚 Recursos Úteis

- [Node.js Docs](https://nodejs.org/docs/)
- [Express Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT Intro](https://jwt.io/introduction)
- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)

---

## ❓ Problemas Comuns

**Erro: "ECONNREFUSED" ao conectar banco**
```bash
# PostgreSQL não está rodando
# Windows: Services → postgresql → Start
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

**Erro: "database passatempo_db does not exist"**
```bash
psql -U postgres
CREATE DATABASE passatempo_db;
\q
npm run db:migrate
```

**Porta 3000 já em uso**
```bash
# Mudar em .env
PORT=3001

# Ou matar processo na porta
# Windows: netstat -ano | findstr :3000 / taskkill /PID xxx
# Linux/macOS: lsof -i :3000 / kill -9 PID
```

---

## 💡 Dicas

- Use `npm install --save-dev nodemon` para auto-reload em desenvolvimento
- Adicione logs úteis com `console.log()`
- Teste endpoints com Postman ou Insomnia
- Commit frequentemente com mensagens claras
- Documente mudanças importantes

---

**Happy Coding! 🎮**
