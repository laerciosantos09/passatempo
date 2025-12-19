
import React, { useState, useEffect } from 'react';
import RankingTable from '../components/RankingTable';
import { getGameRankings, saveScore } from '../services/gameService';

interface SudokuGameProps {
  onBack: () => void;
}

const SudokuGame: React.FC<SudokuGameProps> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState<(number | null)[][]>([]);
  const [initialBoard, setInitialBoard] = useState<boolean[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isGameWon, setIsGameWon] = useState(false);
  const [rankings, setRankings] = useState(getGameRankings('sudoku'));

  // Semente simples para gerar 1000 níveis baseados no número do nível
  const generateLevel = (lvl: number) => {
    // Implementação simplificada de um gerador de sudoku determinístico por nível
    const newBoard: (number | null)[][] = Array(9).fill(null).map(() => Array(9).fill(null));
    const initial: boolean[][] = Array(9).fill(false).map(() => Array(9).fill(false));
    
    // Algoritmo pseudo-aleatório baseado no nível para preencher células
    const seed = lvl * 12345;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const val = ((i * 3 + Math.floor(i / 3) + j + seed) % 9) + 1;
        // Dificuldade: Removemos aleatoriamente com base no nível
        const chance = (seed + i * 9 + j) % 100;
        if (chance > 40) { // Mostra 40% das células
          newBoard[i][j] = val;
          initial[i][j] = true;
        }
      }
    }
    
    setBoard(newBoard);
    setInitialBoard(initial);
    setIsGameWon(false);
  };

  useEffect(() => {
    generateLevel(level);
  }, [level]);

  const handleInput = (num: number) => {
    if (!selectedCell || initialBoard[selectedCell[0]][selectedCell[1]] || isGameWon) return;
    
    const newBoard = board.map(row => [...row]);
    newBoard[selectedCell[0]][selectedCell[1]] = num;
    setBoard(newBoard);

    // Checar vitória (versão simplificada)
    const isComplete = newBoard.every(row => row.every(cell => cell !== null));
    if (isComplete) {
      setIsGameWon(true);
      const user = JSON.parse(localStorage.getItem('passatempo_user') || '{}');
      saveScore('sudoku', user.username || 'Anônimo', level * 100, level);
      setRankings(getGameRankings('sudoku'));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-slate-400 hover:text-indigo-600 transition-colors">
            &larr; Voltar
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-slate-800">Sudoku</h2>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setLevel(Math.max(1, level - 1))}
                className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-indigo-50"
              >
                &lsaquo;
              </button>
              <span className="px-3 font-bold text-slate-700 min-w-[80px] text-center">Nível {level}</span>
              <button 
                onClick={() => setLevel(Math.min(1000, level + 1))}
                className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-indigo-50"
              >
                &rsaquo;
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-9 border-2 border-slate-800 mb-8 max-w-[500px] mx-auto aspect-square">
          {board.map((row, rIdx) => 
            row.map((cell, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                onClick={() => setSelectedCell([rIdx, cIdx])}
                className={`
                  flex items-center justify-center text-xl font-bold cursor-pointer transition-all aspect-square border border-slate-200
                  ${initialBoard[rIdx][cIdx] ? 'bg-slate-50 text-slate-800' : 'bg-white text-indigo-600'}
                  ${selectedCell?.[0] === rIdx && selectedCell?.[1] === cIdx ? 'bg-indigo-100 ring-2 ring-indigo-500 z-10' : ''}
                  ${rIdx % 3 === 0 && rIdx !== 0 ? 'border-t-2 border-t-slate-800' : ''}
                  ${cIdx % 3 === 0 && cIdx !== 0 ? 'border-l-2 border-l-slate-800' : ''}
                `}
              >
                {cell}
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-9 gap-2 max-w-[500px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleInput(num)}
              className="aspect-square bg-slate-800 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-lg"
            >
              {num}
            </button>
          ))}
        </div>

        {isGameWon && (
          <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-200 text-center animate-bounce">
            <h3 className="text-xl font-black text-green-700 mb-2">Parabéns! Nível {level} Concluído!</h3>
            <p className="text-green-600">Sua pontuação foi salva no ranking.</p>
            <button 
              onClick={() => setLevel(level + 1)}
              className="mt-4 bg-green-600 text-white px-8 py-2 rounded-full font-bold shadow-lg hover:bg-green-700 transition-colors"
            >
              Próximo Nível
            </button>
          </div>
        )}
      </div>

      <RankingTable scores={rankings} />
    </div>
  );
};

export default SudokuGame;
