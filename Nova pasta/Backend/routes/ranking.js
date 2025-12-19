// routes/ranking.js
import express from 'express';
import { verificarToken } from '../middleware/auth.js';
import pool from '../database.js';

const router = express.Router();

// RANKING MENSAL
router.get('/mensal/:nomeJogo', verificarToken, async (req, res) => {
  try {
    const { nomeJogo } = req.params;
    const mes = new Date().getMonth() + 1;
    const ano = new Date().getFullYear();

    const resultado = await pool.query(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY pontos_totais DESC) as posicao,
        usuario_id,
        username,
        pontos_totais,
        mes,
        ano
       FROM ranking_mensal 
       WHERE nome_jogo = $1 AND mes = $2 AND ano = $3
       ORDER BY pontos_totais DESC
       LIMIT 100`,
      [nomeJogo, mes, ano]
    );

    res.json({
      tipo: 'mensal',
      mes,
      ano,
      ranking: resultado.rows.map((row, index) => ({
        posicao: index + 1,
        usuarioId: row.usuario_id,
        username: row.username,
        pontos: row.pontos_totais,
        medal: index < 3 ? ['🥇', '🥈', '🥉'][index] : null
      }))
    });

  } catch (error) {
    console.error('Erro ao obter ranking mensal:', error);
    res.status(500).json({ erro: 'Erro ao obter ranking' });
  }
});

// RANKING SEMANAL
router.get('/semanal/:nomeJogo', verificarToken, async (req, res) => {
  try {
    const { nomeJogo } = req.params;
    const semana = Math.ceil(new Date().getDate() / 7);
    const ano = new Date().getFullYear();

    const resultado = await pool.query(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY pontos_totais DESC) as posicao,
        usuario_id,
        username,
        pontos_totais,
        semana,
        ano
       FROM ranking_semanal 
       WHERE nome_jogo = $1 AND semana = $2 AND ano = $3
       ORDER BY pontos_totais DESC
       LIMIT 100`,
      [nomeJogo, semana, ano]
    );

    res.json({
      tipo: 'semanal',
      semana,
      ano,
      ranking: resultado.rows.map((row, index) => ({
        posicao: index + 1,
        usuarioId: row.usuario_id,
        username: row.username,
        pontos: row.pontos_totais,
        medal: index < 3 ? ['🥇', '🥈', '🥉'][index] : null
      }))
    });

  } catch (error) {
    console.error('Erro ao obter ranking semanal:', error);
    res.status(500).json({ erro: 'Erro ao obter ranking' });
  }
});

// RANKING ANUAL
router.get('/anual/:nomeJogo', verificarToken, async (req, res) => {
  try {
    const { nomeJogo } = req.params;
    const ano = new Date().getFullYear();

    const resultado = await pool.query(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY pontos_totais DESC) as posicao,
        usuario_id,
        username,
        pontos_totais,
        ano
       FROM ranking_anual 
       WHERE nome_jogo = $1 AND ano = $2
       ORDER BY pontos_totais DESC
       LIMIT 100`,
      [nomeJogo, ano]
    );

    res.json({
      tipo: 'anual',
      ano,
      ranking: resultado.rows.map((row, index) => ({
        posicao: index + 1,
        usuarioId: row.usuario_id,
        username: row.username,
        pontos: row.pontos_totais,
        medal: index < 3 ? ['🥇', '🥈', '🥉'][index] : null
      }))
    });

  } catch (error) {
    console.error('Erro ao obter ranking anual:', error);
    res.status(500).json({ erro: 'Erro ao obter ranking' });
  }
});

// RANKING GLOBAL (todos os jogos)
router.get('/global/:tipo', verificarToken, async (req, res) => {
  try {
    const { tipo } = req.params; // 'semanal', 'mensal' ou 'anual'
    
    let tabela, filtro;
    const ano = new Date().getFullYear();

    if (tipo === 'semanal') {
      tabela = 'ranking_semanal';
      const semana = Math.ceil(new Date().getDate() / 7);
      filtro = `semana = ${semana} AND ano = ${ano}`;
    } else if (tipo === 'mensal') {
      tabela = 'ranking_mensal';
      const mes = new Date().getMonth() + 1;
      filtro = `mes = ${mes} AND ano = ${ano}`;
    } else {
      tabela = 'ranking_anual';
      filtro = `ano = ${ano}`;
    }

    const resultado = await pool.query(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY SUM(pontos_totais) DESC) as posicao,
        usuario_id,
        username,
        SUM(pontos_totais) as pontos_totais
       FROM ${tabela} 
       WHERE ${filtro}
       GROUP BY usuario_id, username
       ORDER BY pontos_totais DESC
       LIMIT 100`
    );

    res.json({
      tipo,
      ano,
      ranking: resultado.rows.map((row, index) => ({
        posicao: index + 1,
        usuarioId: row.usuario_id,
        username: row.username,
        pontos: row.pontos_totais,
        medal: index < 3 ? ['🥇', '🥈', '🥉'][index] : null
      }))
    });

  } catch (error) {
    console.error('Erro ao obter ranking global:', error);
    res.status(500).json({ erro: 'Erro ao obter ranking' });
  }
});

export default router;
