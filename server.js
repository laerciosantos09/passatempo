import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

console.log('🚀 Servidor iniciando...');
console.log('📁 Diretório atual:', __dirname);
console.log('📁 Tentando servir de:', path.join(__dirname, 'dist'));

// Verificar se a pasta dist existe
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ ERRO: Pasta dist não encontrada!');
  console.error('Arquivos disponíveis:', fs.readdirSync(__dirname));
} else {
  console.log('✅ Pasta dist encontrada');
  console.log('Arquivos em dist:', fs.readdirSync(distPath).slice(0, 10));
}

app.use(express.static(path.join(__dirname, 'dist')));

// Usar regex em vez de string para catchall
app.get(/.*/, (req, res) => {
  const filePath = path.join(__dirname, 'dist', 'index.html');
  console.log(`📍 Requisição: ${req.url} → enviando: ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('❌ Erro ao enviar arquivo:', err);
      res.status(500).send('Erro ao carregar a aplicação');
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Servidor rodando na porta ${port}`);
});