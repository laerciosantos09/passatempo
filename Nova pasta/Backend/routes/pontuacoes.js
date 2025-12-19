// routes/pontuacoes.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import { verificarToken } from '../middleware/auth.js';
import pool from '../database.js';

const router = express.Router();

// SALVAR PONTUAÇÃO
router.post('/salvar', verificarToken, [
  body('nomeJogo').notEmpty().withMessage('Nome do jogo é obrigatório'),
  body('pontos').isInt({ min: 0 }).withMessage('Pontos deve ser um número'),
  body('tentativas').optional().isInt({ min: 0 }).withMessage('Tentativas deve ser um número')
], async (req, res) => {
  try {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    const { nomeJogo, pontos, tentativas } = req.body;
    const usuarioId = req.usuario.id;

    // Inserir pontuação
    const resultado = await pool.query(
      `INSERT INTO pontuacoes 
       (usuario_id, nome_jogo, pontos, tentativas, semana, mes, ano)
       VALUES ($1, $2, $3, $4, EXTRACT(WEEK FROM CURRENT_DATE)::INTEGER, 
               EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)
       RETURNING id, pontos, data_criacao`,
      [usuarioId, nomeJogo, pontos, tentativas || 0]
    );

    // Recalcular rankings após salvar pontuação
    await pool.query('SELECT recalcular_rankings()');

    res.status(201).json({
      mensagem: 'Pontuação salva com sucesso',
      pontuacao: resultado.rows[0]
    });

  } catch (error) {
    console.error('Erro ao salvar pontuação:', error);
    res.status(500).json({ erro: 'Erro ao salvar pontuação' });
  }
});

// ATUALIZAR PROGRESSO DO USUÁRIO
router.post('/progresso', verificarToken, [
  body('nomeJogo').notEmpty(),
  body('nivelAtual').isInt({ min: 1 }).withMessage('Nível deve ser um número')
], async (req, res) => {
  try {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    const { nomeJogo, nivelAtual, melhorTempoNivel } = req.body;
    const usuarioId = req.usuario.id;

    // Verificar se já tem progresso
    const progresso = await pool.query(
      'SELECT id, melhor_tempo_por_nivel FROM progresso_usuario WHERE usuario_id = $1 AND nome_jogo = $2',
      [usuarioId, nomeJogo]
    );

    let temposAtualizados = melhorTempoNivel ? { [nivelAtual]: melhorTempoNivel } : {};

    if (progresso.rows.length > 0) {
      // Atualizar progresso existente
      const temposAntigos = progresso.rows[0].melhor_tempo_por_nivel || {};
      temposAtualizados = { ...temposAntigos, ...temposAtualizados };

      await pool.query(
        `UPDATE progresso_usuario 
         SET nivel_atual = $1, melhor_tempo_por_nivel = $2, data_atualizacao = CURRENT_TIMESTAMP
         WHERE usuario_id = $3 AND nome_jogo = $4`,
        [nivelAtual, JSON.stringify(temposAtualizados), usuarioId, nomeJogo]
      );
    } else {
      // Criar novo progresso
      await pool.query(
        `INSERT INTO progresso_usuario (usuario_id, nome_jogo, nivel_atual, melhor_tempo_por_nivel)
         VALUES ($1, $2, $3, $4)`,
        [usuarioId, nomeJogo, nivelAtual, JSON.stringify(temposAtualizados)]
      );
    }

    res.json({
      mensagem: 'Progresso atualizado com sucesso',
      nivelAtual,
      tempos: temposAtualizados
    });

  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    res.status(500).json({ erro: 'Erro ao atualizar progresso' });
  }
});

// OBTER PROGRESSO DO USUÁRIO
router.get('/progresso/:nomeJogo', verificarToken, async (req, res) => {
  try {
    const { nomeJogo } = req.params;
    const usuarioId = req.usuario.id;

    const resultado = await pool.query(
      'SELECT * FROM progresso_usuario WHERE usuario_id = $1 AND nome_jogo = $2',
      [usuarioId, nomeJogo]
    );

    if (resultado.rows.length === 0) {
      return res.json({
        nivelAtual: 1,
        melhorTempo: null,
        tempos: {}
      });
    }

    const progresso = resultado.rows[0];
    res.json({
      nivelAtual: progresso.nivel_atual,
      tempos: progresso.melhor_tempo_por_nivel || {}
    });

  } catch (error) {
    console.error('Erro ao obter progresso:', error);
    res.status(500).json({ erro: 'Erro ao obter progresso' });
  }
});

// OBTER ESTATÍSTICAS DO USUÁRIO
router.get('/estatisticas', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const resultado = await pool.query(
      `SELECT 
        nome_jogo,
        COUNT(*) as total_partidas,
        SUM(pontos) as pontos_totais,
        AVG(pontos) as media_pontos,
        MAX(pontos) as melhor_pontos,
        MIN(pontos) as pior_pontos
       FROM pontuacoes 
       WHERE usuario_id = $1 
       GROUP BY nome_jogo
       ORDER BY pontos_totais DESC`,
      [usuarioId]
    );

    res.json({
      estatisticas: resultado.rows
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ erro: 'Erro ao obter estatísticas' });
  }
});

export default router;
