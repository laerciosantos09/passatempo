
import React, { useState, useEffect, useCallback, useRef } from 'react';
import RankingTable from '../components/RankingTable';
import { getGameRankings, saveScore } from '../services/gameService';

const GRID_SIZE = 20;

const SnakeGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [snake, setSnake] = useState<{x: number, y: number}[]>([{x: 10, y: 10}]);
  const [food, setFood] = useState({x: 5, y: 5});
  const [dir, setDir] = useState({x: 0, y: -1});
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [rankings, setRankings] = useState(getGameRankings('snake'));
  const gameLoopRef = useRef<number>();

  const resetGame = useCallback(() => {
    setSnake([{x: 10, y: 10}]);
    setFood({x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE)});
    setDir({x: 0, y: -1});
    setIsGameOver(false);
    setScore(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp': if (dir.y !== 1) setDir({x: 0, y: -1}); break;
        case 'ArrowDown': if (dir.y !== -1) setDir({x: 0, y: 1}); break;
        case 'ArrowLeft': if (dir.x !== 1) setDir({x: -1, y: 0}); break;
        case 'ArrowRight': if (dir.x !== -1) setDir({x: 1, y: 0}); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dir]);

  useEffect(() => {
    if (isGameOver) return;

    const speed = Math.max(50, 200 - (level * 10));
    const interval = setInterval(() => {
      setSnake(prev => {
        const head = {...prev[0]};
        head.x += dir.x;
        head.y += dir.y;

        // Bateu na parede
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsGameOver(true);
          return prev;
        }

        // Bateu em si mesma
        if (prev.some(segment => segment.x === head.x && segment.y === head.y)) {
          setIsGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + (level * 10));
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
          });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [dir, food, isGameOver, level]);

  useEffect(() => {
    if (isGameOver) {
      const user = JSON.parse(localStorage.getItem('passatempo_user') || '{}');
      saveScore('snake', user.username || 'Anônimo', score, level);
      setRankings(getGameRankings('snake'));
    }
  }, [isGameOver, score, level]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-slate-400 hover:text-green-600 font-bold transition-colors">&larr; Voltar</button>
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800">Cobrinha</h2>
            <p className="text-green-600 font-bold">{score} Pontos</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setLevel(Math.max(1, level - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm">&lsaquo;</button>
             <span className="px-3 font-bold text-slate-700 min-w-[80px] text-center">Nível {level}</span>
             <button onClick={() => setLevel(Math.min(100, level + 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm">&rsaquo;</button>
          </div>
        </div>

        <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800" style={{ width: 400, height: 400 }}>
          {Array.from({ length: GRID_SIZE }).map((_, r) => (
             Array.from({ length: GRID_SIZE }).map((_, c) => {
               const isSnake = snake.some(s => s.x === c && s.y === r);
               const isHead = snake[0].x === c && snake[0].y === r;
               const isFood = food.x === c && food.y === r;
               return (
                 <div
                   key={`${r}-${c}`}
                   className="absolute rounded-sm"
                   style={{
                     left: c * (400 / GRID_SIZE),
                     top: r * (400 / GRID_SIZE),
                     width: 400 / GRID_SIZE - 1,
                     height: 400 / GRID_SIZE - 1,
                     backgroundColor: isHead ? '#22c55e' : isSnake ? '#15803d' : isFood ? '#ef4444' : 'transparent',
                     zIndex: isSnake || isFood ? 1 : 0
                   }}
                 />
               );
             })
          ))}
          {isGameOver && (
            <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white p-8">
               <h3 className="text-4xl font-black text-red-500 mb-2">GAME OVER</h3>
               <p className="text-xl mb-6">{score} pontos no nível {level}</p>
               <button onClick={resetGame} className="bg-green-600 px-8 py-3 rounded-full font-bold shadow-xl hover:scale-110 transition-transform">Tentar Novamente</button>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex gap-4 text-slate-400 text-sm italic">
           Use as setas do teclado para guiar
        </div>
      </div>
      <RankingTable scores={rankings} />
    </div>
  );
};

export default SnakeGame;
