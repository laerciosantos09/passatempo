// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import pontuacoesRoutes from './routes/pontuacoes.js';
import rankingRoutes from './routes/ranking.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Middleware de parsing
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/pontuacoes', pontuacoesRoutes);
app.use('/api/ranking', rankingRoutes);

// Rota padrão do frontend
app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: '.' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🎮 Servidor iniciado em porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Acesse em http://localhost:${PORT}`);
});
