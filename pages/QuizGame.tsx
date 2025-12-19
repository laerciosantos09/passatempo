
import React, { useState, useEffect } from 'react';
import RankingTable from '../components/RankingTable';
import { getGameRankings, saveScore } from '../services/gameService';
import { QuizQuestion } from '../types';

const INITIAL_QUIZ: QuizQuestion[] = [
  { question: "Qual é a capital do Brasil?", options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], correctAnswer: 2 },
  { question: "Quantos planetas existem no sistema solar?", options: ["7", "8", "9", "10"], correctAnswer: 1 },
  { question: "Quem pintou a Mona Lisa?", options: ["Picasso", "Van Gogh", "Da Vinci", "Dalí"], correctAnswer: 2 },
  { question: "Qual o maior oceano do mundo?", options: ["Atlântico", "Índico", "Pacífico", "Ártico"], correctAnswer: 2 },
  { question: "Quantos segundos tem um minuto?", options: ["30", "50", "60", "100"], correctAnswer: 2 },
];

const QuizGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [currentQ, setCurrentQ] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>(INITIAL_QUIZ);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [rankings, setRankings] = useState(getGameRankings('quiz'));

  const startQuiz = (lvl: number) => {
    // Para simular 1000 níveis, rotacionamos ou "embaralhamos" baseado na semente
    setQuestions([...INITIAL_QUIZ].sort(() => Math.random() - 0.5));
    setCurrentQ(0);
    setScore(0);
    setIsFinished(false);
  };

  useEffect(() => {
    startQuiz(level);
  }, [level]);

  const handleAnswer = (idx: number) => {
    if (idx === questions[currentQ].correctAnswer) {
      setScore(s => s + (level * 20));
    }
    
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      setIsFinished(true);
      const user = JSON.parse(localStorage.getItem('passatempo_user') || '{}');
      saveScore('quiz', user.username || 'Anônimo', score + (level * 20), level);
      setRankings(getGameRankings('quiz'));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-10">
          <button onClick={onBack} className="text-slate-400 hover:text-amber-600 font-bold">&larr; Voltar</button>
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800">Quiz SP</h2>
            <div className="bg-amber-100 px-3 py-1 rounded-full text-amber-700 text-xs font-bold uppercase mt-1">Nível {level}</div>
          </div>
          <div className="text-amber-600 font-black text-xl">{score} pts</div>
        </div>

        {!isFinished ? (
          <div className="animate-fadeIn">
            <div className="mb-8">
               <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Pergunta {currentQ + 1} de {questions.length}</span>
               <h3 className="text-3xl font-bold text-slate-800 mt-2">{questions[currentQ].question}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {questions[currentQ].options.map((opt, i) => (
                 <button
                   key={i}
                   onClick={() => handleAnswer(i)}
                   className="p-6 text-left border-2 border-slate-100 rounded-2xl hover:border-amber-400 hover:bg-amber-50 font-bold text-slate-700 transition-all group"
                 >
                   <span className="inline-block w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-amber-400 group-hover:text-white text-center leading-8 mr-4 transition-colors">
                     {String.fromCharCode(65 + i)}
                   </span>
                   {opt}
                 </button>
               ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 animate-bounce">
             <div className="text-6xl mb-6">🏆</div>
             <h3 className="text-4xl font-black text-slate-900 mb-2">Quiz Finalizado!</h3>
             <p className="text-slate-500 text-xl mb-8">Você marcou {score} pontos.</p>
             <button 
                onClick={() => setLevel(level + 1)}
                className="bg-amber-500 text-white px-12 py-4 rounded-full font-black text-lg shadow-xl shadow-amber-200 hover:bg-amber-600 transition-colors"
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

export default QuizGame;
