
import React, { useState, useEffect } from 'react';
import RankingTable from '../components/RankingTable';
import { getGameRankings, saveScore } from '../services/gameService';

const ReactionGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [rankings, setRankings] = useState(getGameRankings('reaction'));

  const startTest = () => {
    setGameState('waiting');
    const delay = 2000 + Math.random() * 3000;
    setTimeout(() => {
      setGameState('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const handlePointerDown = () => {
    if (gameState === 'waiting') {
      setGameState('idle');
      alert("Cedo demais! Espere o sinal.");
      return;
    }
    if (gameState === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setGameState('result');
      
      const user = JSON.parse(localStorage.getItem('passatempo_user') || '{}');
      // Score inversamente proporcional ao tempo (melhor = menor tempo)
      const score = Math.max(0, 1000 - time + (level * 10));
      saveScore('reaction', user.username || 'Anônimo', Math.round(score), level);
      setRankings(getGameRankings('reaction'));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8">
           <button onClick={onBack} className="text-slate-400 hover:text-rose-600 font-bold">&larr; Voltar</button>
           <h2 className="text-2xl font-black text-slate-800">Teste de Reação</h2>
           <div className="text-slate-400 font-bold">Nível {level}</div>
        </div>

        <div 
          onPointerDown={handlePointerDown}
          className={`
            w-full aspect-video rounded-3xl flex flex-col items-center justify-center cursor-pointer select-none transition-colors duration-200
            ${gameState === 'idle' ? 'bg-slate-100 hover:bg-slate-200' : ''}
            ${gameState === 'waiting' ? 'bg-rose-500' : ''}
            ${gameState === 'ready' ? 'bg-green-500 animate-pulse' : ''}
            ${gameState === 'result' ? 'bg-indigo-600' : ''}
          `}
        >
          {gameState === 'idle' && (
            <div className="text-center" onClick={startTest}>
              <div className="text-6xl mb-4">⚡</div>
              <p className="text-slate-600 text-xl font-bold">Clique para começar</p>
              <p className="text-slate-400 text-sm mt-2">Clique quando a tela ficar VERDE</p>
            </div>
          )}
          {gameState === 'waiting' && (
             <p className="text-white text-3xl font-black uppercase tracking-widest">Espere o Verde...</p>
          )}
          {gameState === 'ready' && (
             <p className="text-white text-5xl font-black uppercase tracking-tighter">CLIQUE AGORA!</p>
          )}
          {gameState === 'result' && (
             <div className="text-center text-white">
                <p className="text-2xl font-bold mb-2">Seu tempo:</p>
                <p className="text-7xl font-black tracking-tighter mb-8">{reactionTime} ms</p>
                <button 
                  onClick={startTest} 
                  className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                >
                  Tentar Novamente
                </button>
             </div>
          )}
        </div>
      </div>
      <RankingTable scores={rankings} />
    </div>
  );
};

export default ReactionGame;
