// routes/auth.js
import express from 'express';
import bcryptjs from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { gerarToken } from '../middleware/auth.js';
import pool from '../database.js';

const router = express.Router();

// REGISTRO
router.post('/registro', [
  body('username').isLength({ min: 3, max: 50 }).withMessage('Username deve ter entre 3 e 50 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('perguntaSecreta').notEmpty().withMessage('Pergunta secreta é obrigatória'),
  body('respostaSecreta').notEmpty().withMessage('Resposta secreta é obrigatória')
], async (req, res) => {
  try {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    const { username, email, senha, perguntaSecreta, respostaSecreta } = req.body;

    // Verificar se email ou username já existem
    const usuarioExistente = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ 
        erro: 'Email ou username já cadastrado' 
      });
    }

    // Hash da senha e resposta secreta
    const senhaHash = await bcryptjs.hash(senha, 10);
    const respostaHash = await bcryptjs.hash(respostaSecreta.toLowerCase(), 10);

    // Inserir usuário
    const resultado = await pool.query(
      `INSERT INTO usuarios (username, email, senha_hash, pergunta_secreta, resposta_secreta_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email`,
      [username, email, senhaHash, perguntaSecreta, respostaHash]
    );

    const usuario = resultado.rows[0];
    const token = gerarToken(usuario.id, usuario.username);

    res.status(201).json({
      mensagem: 'Usuário registrado com sucesso',
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email
      },
      token
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
});

// LOGIN
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
  try {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    const { email, senha } = req.body;

    // Buscar usuário
    const resultado = await pool.query(
      'SELECT id, username, email, senha_hash FROM usuarios WHERE email = $1 AND ativo = true',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    const usuario = resultado.rows[0];

    // Verificar senha
    const senhaValida = await bcryptjs.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    // Atualizar último login
    await pool.query(
      'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = $1',
      [usuario.id]
    );

    const token = gerarToken(usuario.id, usuario.username);

    res.json({
      mensagem: 'Login realizado com sucesso',
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email
      },
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// RECUPERAÇÃO DE SENHA
router.post('/recuperar-senha', [
  body('email').isEmail().withMessage('Email inválido'),
  body('respostaSecreta').notEmpty().withMessage('Resposta secreta é obrigatória'),
  body('novaSenha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
], async (req, res) => {
  try {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    const { email, respostaSecreta, novaSenha } = req.body;

    // Buscar usuário
    const resultado = await pool.query(
      `SELECT id, resposta_secreta_hash, pergunta_secreta 
       FROM usuarios WHERE email = $1 AND ativo = true`,
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = resultado.rows[0];

    // Verificar resposta secreta
    const respostaValida = await bcryptjs.compare(
      respostaSecreta.toLowerCase(), 
      usuario.resposta_secreta_hash
    );

    if (!respostaValida) {
      return res.status(401).json({ erro: 'Resposta secreta incorreta' });
    }

    // Hash da nova senha
    const novaSenhaHash = await bcryptjs.hash(novaSenha, 10);

    // Atualizar senha
    await pool.query(
      'UPDATE usuarios SET senha_hash = $1 WHERE id = $2',
      [novaSenhaHash, usuario.id]
    );

    res.json({
      mensagem: 'Senha atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    res.status(500).json({ erro: 'Erro ao recuperar senha' });
  }
});

// OBTER PERGUNTA SECRETA
router.get('/pergunta-secreta/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const resultado = await pool.query(
      'SELECT pergunta_secreta FROM usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json({
      perguntaSecreta: resultado.rows[0].pergunta_secreta
    });

  } catch (error) {
    console.error('Erro ao buscar pergunta secreta:', error);
    res.status(500).json({ erro: 'Erro ao buscar pergunta secreta' });
  }
});

export default router;
