
import React, { useState, useEffect } from 'react';
import RankingTable from '../components/RankingTable';
import { getGameRankings } from '../services/gameService';
import { GameInfo } from '../types';

interface GlobalRankingProps {
  onBack: () => void;
}

const GAMES: GameInfo[] = [
  { id: '1', name: 'Sudoku', slug: 'sudoku', description: '', icon: '🔢', color: 'bg-blue-500' },
  { id: '2', name: 'Jogo da Memória', slug: 'memory', description: '', icon: '🧩', color: 'bg-purple-500' },
  { id: '3', name: 'Cobrinha', slug: 'snake', description: '', icon: '🐍', color: 'bg-green-500' },
  { id: '4', name: 'Quiz', slug: 'quiz', description: '', icon: '💡', color: 'bg-amber-500' },
  { id: '5', name: 'Reação', slug: 'reaction', description: '', icon: '⚡', color: 'bg-rose-500' },
];

const GlobalRanking: React.FC<GlobalRankingProps> = ({ onBack }) => {
  const [selectedGameSlug, setSelectedGameSlug] = useState<string>(GAMES[0].slug);
  const [rankings, setRankings] = useState(getGameRankings(GAMES[0].slug));

  useEffect(() => {
    setRankings(getGameRankings(selectedGameSlug));
  }, [selectedGameSlug]);

  const currentGame = GAMES.find(g => g.slug === selectedGameSlug);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-indigo-600 transition-all border border-slate-100"
          >
            &larr;
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Ranking Global</h1>
            <p className="text-slate-500 text-sm font-medium">Os melhores de cada categoria</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navegação por Jogos */}
        <div className="lg:col-span-1 space-y-2 overflow-x-auto md:overflow-visible flex flex-row md:flex-col pb-4 md:pb-0 gap-2 md:gap-0">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGameSlug(game.slug)}
              className={`
                flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all w-full text-left whitespace-nowrap
                ${selectedGameSlug === game.slug 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'}
              `}
            >
              <span className={`w-8 h-8 rounded-lg ${game.color} flex items-center justify-center text-sm shadow-sm`}>
                {game.icon}
              </span>
              <span className="hidden sm:inline">{game.name}</span>
            </button>
          ))}
        </div>

        {/* Tabela de Ranking */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
            <div className="p-6 pb-2">
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-12 h-12 rounded-xl ${currentGame?.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {currentGame?.icon}
                </span>
                <h2 className="text-2xl font-black text-slate-800">
                  Líderes de <span className="text-indigo-600">{currentGame?.name}</span>
                </h2>
              </div>
            </div>
            
            <RankingTable scores={rankings} />
          </div>
          
          <div className="mt-8 bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
             <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2">Quer aparecer aqui?</h3>
                <p className="text-indigo-100 mb-6 max-w-md">Pratique todos os dias e suba nos rankings de nível para garantir seu lugar no mural de líderes.</p>
                <button 
                  onClick={onBack}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black hover:bg-indigo-50 transition-colors"
                >
                  Voltar e Jogar
                </button>
             </div>
             <div className="absolute -right-10 -bottom-10 text-[12rem] opacity-10 font-black pointer-events-none">
                🏆
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalRanking;
