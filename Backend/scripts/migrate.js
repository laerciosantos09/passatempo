// scripts/migrate.js
import pool from '../database.js';

const createTables = async () => {
  try {
    console.log('Iniciando migração do banco de dados...');

    // 1. Tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        pergunta_secreta VARCHAR(200) NOT NULL,
        resposta_secreta_hash VARCHAR(255) NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ativo BOOLEAN DEFAULT true,
        ultimo_login TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
      CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
    `);

    console.log('✓ Tabela usuarios criada');

    // 2. Tabela de pontuações
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pontuacoes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nome_jogo VARCHAR(100) NOT NULL,
        pontos INTEGER NOT NULL,
        tentativas INTEGER DEFAULT 0,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ano_semana INTEGER,
        ano_mes INTEGER,
        ano INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
        semana INTEGER DEFAULT EXTRACT(WEEK FROM CURRENT_DATE),
        mes INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)
      );

      CREATE INDEX IF NOT EXISTS idx_pontuacoes_usuario ON pontuacoes(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_pontuacoes_jogo ON pontuacoes(nome_jogo);
      CREATE INDEX IF NOT EXISTS idx_pontuacoes_data ON pontuacoes(data_criacao);
      CREATE INDEX IF NOT EXISTS idx_pontuacoes_ranking_mensal ON pontuacoes(mes, ano);
      CREATE INDEX IF NOT EXISTS idx_pontuacoes_ranking_anual ON pontuacoes(ano);
      CREATE INDEX IF NOT EXISTS idx_pontuacoes_ranking_semanal ON pontuacoes(semana, ano);
    `);

    console.log('✓ Tabela pontuacoes criada');

    // 3. Tabela de progresso do usuário (para os 200 níveis de cada jogo)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS progresso_usuario (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nome_jogo VARCHAR(100) NOT NULL,
        nivel_atual INTEGER DEFAULT 1,
        melhor_tempo_por_nivel JSONB DEFAULT '{}',
        data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, nome_jogo)
      );

      CREATE INDEX IF NOT EXISTS idx_progresso_usuario ON progresso_usuario(usuario_id);
    `);

    console.log('✓ Tabela progresso_usuario criada');

    // 4. Tabela de ranking semanal (recalculada toda semana)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ranking_semanal (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        username VARCHAR(50) NOT NULL,
        nome_jogo VARCHAR(100) NOT NULL,
        pontos_totais INTEGER NOT NULL,
        posicao INTEGER,
        semana INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        data_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, nome_jogo, semana, ano)
      );

      CREATE INDEX IF NOT EXISTS idx_ranking_semanal_jogo ON ranking_semanal(nome_jogo, semana, ano);
      CREATE INDEX IF NOT EXISTS idx_ranking_semanal_usuario ON ranking_semanal(usuario_id);
    `);

    console.log('✓ Tabela ranking_semanal criada');

    // 5. Tabela de ranking mensal (recalculada todo mês)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ranking_mensal (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        username VARCHAR(50) NOT NULL,
        nome_jogo VARCHAR(100) NOT NULL,
        pontos_totais INTEGER NOT NULL,
        posicao INTEGER,
        mes INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        data_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, nome_jogo, mes, ano)
      );

      CREATE INDEX IF NOT EXISTS idx_ranking_mensal_jogo ON ranking_mensal(nome_jogo, mes, ano);
      CREATE INDEX IF NOT EXISTS idx_ranking_mensal_usuario ON ranking_mensal(usuario_id);
    `);

    console.log('✓ Tabela ranking_mensal criada');

    // 6. Tabela de ranking anual (zerada todo ano)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ranking_anual (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        username VARCHAR(50) NOT NULL,
        nome_jogo VARCHAR(100) NOT NULL,
        pontos_totais INTEGER NOT NULL,
        posicao INTEGER,
        ano INTEGER NOT NULL,
        data_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, nome_jogo, ano)
      );

      CREATE INDEX IF NOT EXISTS idx_ranking_anual_jogo ON ranking_anual(nome_jogo, ano);
      CREATE INDEX IF NOT EXISTS idx_ranking_anual_usuario ON ranking_anual(usuario_id);
    `);

    console.log('✓ Tabela ranking_anual criada');

    // 7. Criar função para recalcular rankings automaticamente
    await pool.query(`
      CREATE OR REPLACE FUNCTION recalcular_rankings()
      RETURNS void AS $$
      DECLARE
        v_semana INTEGER;
        v_mes INTEGER;
        v_ano INTEGER;
      BEGIN
        v_semana := EXTRACT(WEEK FROM CURRENT_DATE)::INTEGER;
        v_mes := EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;
        v_ano := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

        -- Ranking Semanal
        DELETE FROM ranking_semanal WHERE semana = v_semana AND ano = v_ano;
        
        INSERT INTO ranking_semanal (usuario_id, username, nome_jogo, pontos_totais, semana, ano)
        SELECT 
          p.usuario_id,
          u.username,
          p.nome_jogo,
          SUM(p.pontos),
          v_semana,
          v_ano
        FROM pontuacoes p
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.semana = v_semana AND p.ano = v_ano
        GROUP BY p.usuario_id, u.username, p.nome_jogo
        ON CONFLICT (usuario_id, nome_jogo, semana, ano) DO UPDATE
        SET pontos_totais = EXCLUDED.pontos_totais;

        -- Ranking Mensal
        DELETE FROM ranking_mensal WHERE mes = v_mes AND ano = v_ano;
        
        INSERT INTO ranking_mensal (usuario_id, username, nome_jogo, pontos_totais, mes, ano)
        SELECT 
          p.usuario_id,
          u.username,
          p.nome_jogo,
          SUM(p.pontos),
          v_mes,
          v_ano
        FROM pontuacoes p
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.mes = v_mes AND p.ano = v_ano
        GROUP BY p.usuario_id, u.username, p.nome_jogo
        ON CONFLICT (usuario_id, nome_jogo, mes, ano) DO UPDATE
        SET pontos_totais = EXCLUDED.pontos_totais;

        -- Ranking Anual
        DELETE FROM ranking_anual WHERE ano = v_ano;
        
        INSERT INTO ranking_anual (usuario_id, username, nome_jogo, pontos_totais, ano)
        SELECT 
          p.usuario_id,
          u.username,
          p.nome_jogo,
          SUM(p.pontos),
          v_ano
        FROM pontuacoes p
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.ano = v_ano
        GROUP BY p.usuario_id, u.username, p.nome_jogo
        ON CONFLICT (usuario_id, nome_jogo, ano) DO UPDATE
        SET pontos_totais = EXCLUDED.pontos_totais;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✓ Função recalcular_rankings criada');

    console.log('\n✅ Migração concluída com sucesso!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
};

createTables();
