
import React, { useState, useEffect } from 'react';
import RankingTable from '../components/RankingTable';
import { getGameRankings, saveScore } from '../services/gameService';

interface MemoryGameProps {
  onBack: () => void;
}

const EMOJIS = ['🚀', '🍕', '🎸', '⚽', '🕹️', '🎨', '🦁', '🌙', '🌊', '🔥', '💎', '🍒', '🎭', '🚲', '🍔', '🍦'];

const MemoryGame: React.FC<MemoryGameProps> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<{ id: number, emoji: string, flipped: boolean, matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [rankings, setRankings] = useState(getGameRankings('memory'));

  const setupLevel = (lvl: number) => {
    // Determina número de pares baseado no nível (começa com 4 pares, aumenta a cada nível)
    const numPairs = Math.min(8 + Math.floor(lvl / 10), 16);
    const selectedEmojis = EMOJIS.slice(0, numPairs);
    const pairEmojis = [...selectedEmojis, ...selectedEmojis];
    
    // Shuffle determinístico
    const seed = lvl * 99;
    const shuffled = pairEmojis
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false, sort: (Math.sin(seed + i) * 10000) % 1 }))
      .sort((a, b) => a.sort - b.sort);

    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    setupLevel(level);
  }, [level]);

  const handleFlip = (idx: number) => {
    if (flippedIndices.length === 2 || cards[idx].flipped || cards[idx].matched || isWon) return;

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setFlippedIndices([]);
        
        if (newCards.every(c => c.matched)) {
          setIsWon(true);
          const user = JSON.parse(localStorage.getItem('passatempo_user') || '{}');
          // Pontuação: quanto menos movimentos, melhor
          const score = Math.max(10, 500 - (moves * 10) + (level * 50));
          saveScore('memory', user.username || 'Anônimo', score, level);
          setRankings(getGameRankings('memory'));
        }
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-slate-400 hover:text-indigo-600 transition-colors font-bold">
            &larr; Voltar
          </button>
          <div className="flex flex-col items-center">
             <h2 className="text-2xl font-black text-slate-800">Memória</h2>
             <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{moves} movimentos</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setLevel(Math.max(1, level - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-indigo-50">&lsaquo;</button>
             <span className="px-3 font-bold text-slate-700 min-w-[80px] text-center">Nível {level}</span>
             <button onClick={() => setLevel(Math.min(1000, level + 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-indigo-50">&rsaquo;</button>
          </div>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4 max-w-[600px] mx-auto">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              onClick={() => handleFlip(idx)}
              className={`
                aspect-square rounded-2xl cursor-pointer transition-all duration-500 perspective-1000 preserve-3d
                ${card.flipped || card.matched ? '[transform:rotateY(180deg)]' : ''}
              `}
            >
              <div className="relative w-full h-full text-center transition-all duration-500 [transform-style:preserve-3d]">
                <div className="absolute w-full h-full bg-slate-800 [backface-visibility:hidden] rounded-2xl border-2 border-slate-700 flex items-center justify-center text-3xl shadow-lg">
                  <span className="text-indigo-500/30">?</span>
                </div>
                <div className="absolute w-full h-full bg-white [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border-2 border-indigo-200 flex items-center justify-center text-4xl shadow-md">
                  {card.emoji}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isWon && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-200 text-center animate-fadeIn">
            <h3 className="text-2xl font-black text-indigo-700 mb-2">Excelente Memória!</h3>
            <p className="text-indigo-600">Você concluiu o nível {level} em {moves} movimentos.</p>
            <button 
              onClick={() => setLevel(level + 1)}
              className="mt-4 bg-indigo-600 text-white px-8 py-2 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-colors"
            >
              Próximo Desafio
            </button>
          </div>
        )}
      </div>

      <RankingTable scores={rankings} />
    </div>
  );
};

export default MemoryGame;
