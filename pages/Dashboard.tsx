
import React from 'react';
import { GameInfo } from '../types';

interface DashboardProps {
  onSelectGame: (slug: string) => void;
  onGoToRanking: () => void;
}

const GAMES: GameInfo[] = [
  { id: '1', name: 'Sudoku', slug: 'sudoku', description: 'Logica e números', icon: '🔢', color: 'bg-blue-500' },
  { id: '2', name: 'Jogo da Memória', slug: 'memory', description: 'Treine sua mente', icon: '🧩', color: 'bg-purple-500' },
  { id: '3', name: 'Cobrinha', slug: 'snake', description: 'Ação clássica', icon: '🐍', color: 'bg-green-500' },
  { id: '4', name: 'Quiz', slug: 'quiz', description: 'Conhecimentos gerais', icon: '💡', color: 'bg-amber-500' },
  { id: '5', name: 'Reação', slug: 'reaction', description: 'Teste sua velocidade', icon: '⚡', color: 'bg-rose-500' },
];

const Dashboard: React.FC<DashboardProps> = ({ onSelectGame, onGoToRanking }) => {
  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <header className="mb-12 text-center relative">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">O que vamos jogar hoje?</h1>
        <p className="text-slate-500 text-lg mb-8">Escolha um passatempo e desafie o ranking global.</p>
        
        <button 
          onClick={onGoToRanking}
          className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-full font-black text-sm hover:bg-indigo-100 transition-colors border border-indigo-200"
        >
          🏆 Ver Rankings Globais
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game.slug)}
            className="group relative bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-left hover:shadow-xl hover:-translate-y-2 transition-all"
          >
            <div className={`w-16 h-16 ${game.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
              {game.icon}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{game.name}</h2>
            <p className="text-slate-500 mb-6">{game.description}</p>
            <div className="flex items-center text-indigo-600 font-bold group-hover:gap-2 transition-all">
              Jogar agora
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-slate-100 text-slate-400 text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-tighter">1000 níveis</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
