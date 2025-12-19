
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    secretWord: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login/registro (em produção usaria um endpoint Node.js)
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: formData.username || formData.email.split('@')[0],
      email: formData.email
    };
    onLogin(mockUser);
  };

  if (isRecovering) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Recuperar Senha</h2>
          <p className="text-slate-500 mb-8">Insira sua palavra secreta definida no cadastro.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Palavra Secreta</label>
              <input 
                type="text" required
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ex: Nome do primeiro pet"
              />
            </div>
            <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              Redefinir
            </button>
          </form>
          <button onClick={() => setIsRecovering(false)} className="w-full mt-6 text-slate-400 font-bold hover:text-slate-600">Voltar para o Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main flex flex-col md:flex-row items-center justify-center p-4 gap-12">
      <div className="max-w-md text-white">
        <div className="mb-8">
          <span className="bg-indigo-600 px-3 py-1 rounded text-2xl font-black">P</span>
          <h1 className="text-6xl font-black tracking-tighter mt-4">Passatempo<span className="text-indigo-400">SP</span></h1>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed mb-8">Sua dose diária de desafios mentais. Sudoku, Quiz, Cobrinha e muito mais em um só lugar.</p>
        <div className="flex gap-4">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur">
            <span className="text-3xl">🎯</span>
            <p className="text-xs font-bold uppercase mt-2 text-slate-400">Ranking Global</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur">
            <span className="text-3xl">🌟</span>
            <p className="text-xs font-bold uppercase mt-2 text-slate-400">+1000 Níveis</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 animate-fadeIn">
        <h2 className="text-3xl font-black text-slate-800 mb-2">{isRegistering ? 'Criar Conta' : 'Bem-vindo de volta'}</h2>
        <p className="text-slate-500 mb-8">{isRegistering ? 'Cadastre-se para competir nos rankings.' : 'Faça login com sua conta.'}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nome de Usuário</label>
              <input 
                type="text" required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ex: joaosilva"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">E-mail</label>
            <input 
              type="email" required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Senha</label>
            <input 
              type="password" required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          {isRegistering && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Palavra Secreta (Recuperação)</label>
              <input 
                type="text" required
                value={formData.secretWord}
                onChange={(e) => setFormData({...formData, secretWord: e.target.value})}
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ex: Nome da sua escola"
              />
            </div>
          )}

          {!isRegistering && (
            <div className="text-right">
              <button type="button" onClick={() => setIsRecovering(true)} className="text-xs font-bold text-indigo-600 hover:underline">Esqueci minha senha</button>
            </div>
          )}

          <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
            {isRegistering ? 'Cadastrar' : 'Entrar na Plataforma'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-8">
          <p className="text-slate-500">
            {isRegistering ? 'Já tem uma conta?' : 'Não tem conta ainda?'}
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-2 text-indigo-600 font-bold hover:underline"
            >
              {isRegistering ? 'Faça login' : 'Crie uma agora'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
