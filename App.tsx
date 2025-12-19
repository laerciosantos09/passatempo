
import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SudokuGame from './pages/SudokuGame';
import MemoryGame from './pages/MemoryGame';
import SnakeGame from './pages/SnakeGame';
import QuizGame from './pages/QuizGame';
import ReactionGame from './pages/ReactionGame';
import GlobalRanking from './pages/GlobalRanking';
import Navbar from './components/Navbar';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('passatempo_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('passatempo_user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('passatempo_user');
    setCurrentPage('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onSelectGame={(slug) => setCurrentPage(slug)} onGoToRanking={() => setCurrentPage('ranking')} />;
      case 'ranking':
        return <GlobalRanking onBack={() => setCurrentPage('dashboard')} />;
      case 'sudoku':
        return <SudokuGame onBack={() => setCurrentPage('dashboard')} />;
      case 'memory':
        return <MemoryGame onBack={() => setCurrentPage('dashboard')} />;
      case 'snake':
        return <SnakeGame onBack={() => setCurrentPage('dashboard')} />;
      case 'quiz':
        return <QuizGame onBack={() => setCurrentPage('dashboard')} />;
      case 'reaction':
        return <ReactionGame onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <Dashboard onSelectGame={(slug) => setCurrentPage(slug)} onGoToRanking={() => setCurrentPage('ranking')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onHome={() => setCurrentPage('dashboard')} 
        onRanking={() => setCurrentPage('ranking')}
      />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
