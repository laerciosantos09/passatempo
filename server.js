import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

console.log('🚀 Servidor iniciando...');
console.log('📁 Servindo arquivos de:', path.join(__dirname, 'dist'));

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/*', (req, res) => {
  console.log(`📍 Requisição: ${req.url}`);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Servidor rodando na porta ${port}`);
});