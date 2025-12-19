// public/js/api.js
class APIService {
  constructor() {
    this.baseURL = '/api';
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: this.getHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }

  // Auth
  async registro(username, email, senha, perguntaSecreta, respostaSecreta) {
    return this.request('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        senha,
        perguntaSecreta,
        respostaSecreta
      })
    });
  }

  async login(email, senha) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
  }

  async recuperarSenha(email, respostaSecreta, novaSenha) {
    return this.request('/auth/recuperar-senha', {
      method: 'POST',
      body: JSON.stringify({
        email,
        respostaSecreta,
        novaSenha
      })
    });
  }

  async obterPerguntaSecreta(email) {
    return this.request(`/auth/pergunta-secreta/${email}`, { method: 'GET' });
  }

  // Pontuações
  async salvarPontuacao(nomeJogo, pontos, tentativas = 0) {
    return this.request('/pontuacoes/salvar', {
      method: 'POST',
      body: JSON.stringify({
        nomeJogo,
        pontos,
        tentativas
      })
    });
  }

  async atualizarProgresso(nomeJogo, nivelAtual, melhorTempoNivel = null) {
    return this.request('/pontuacoes/progresso', {
      method: 'POST',
      body: JSON.stringify({
        nomeJogo,
        nivelAtual,
        melhorTempoNivel
      })
    });
  }

  async obterProgresso(nomeJogo) {
    return this.request(`/pontuacoes/progresso/${nomeJogo}`, { method: 'GET' });
  }

  async obterEstatisticas() {
    return this.request('/pontuacoes/estatisticas', { method: 'GET' });
  }

  // Ranking
  async obterRankingMensal(nomeJogo) {
    return this.request(`/ranking/mensal/${nomeJogo}`, { method: 'GET' });
  }

  async obterRankingSemanal(nomeJogo) {
    return this.request(`/ranking/semanal/${nomeJogo}`, { method: 'GET' });
  }

  async obterRankingAnual(nomeJogo) {
    return this.request(`/ranking/anual/${nomeJogo}`, { method: 'GET' });
  }

  async obterRankingGlobal(tipo) {
    return this.request(`/ranking/global/${tipo}`, { method: 'GET' });
  }
}

const api = new APIService();
