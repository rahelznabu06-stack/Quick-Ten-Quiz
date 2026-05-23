/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Trophy, ChevronRight, RotateCcw, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Question, QuizState } from './types';

export default function App() {
  const [state, setState] = useState<QuizState>('idle');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setState('loading');
    setError(null);
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) throw new Error('Failed to generate quiz');
      
      const data = await response.json();
      setQuestions(data);
      setCurrentIndex(0);
      setScore(0);
      setState('quiz');
    } catch (err: any) {
      setError(err.message);
      setState('idle');
    }
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    setShowExplanation(true);
    if (option === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setState('results');
    }
  };

  const resetQuiz = () => {
    setState('idle');
    setTopic('');
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0514] text-white font-sans selection:bg-purple-500/30 overflow-hidden relative">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12 min-h-screen flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center"
            >
              <div className="flex justify-center">
                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <Brain className="w-12 h-12 text-purple-400" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                  QuizMaster AI
                </h1>
                <p className="text-white/60 text-lg max-w-md mx-auto">
                  Powered by Gemini, I can generate a 10-question quiz on any topic you can imagine.
                </p>
              </div>

              <form onSubmit={startQuiz} className="relative group">
                <input
                  type="text"
                  id="topic-input"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a topic (e.g. Space Exploration, 90s Pop Culture)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pr-16 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all text-lg placeholder:text-white/20"
                />
                <button
                  type="submit"
                  disabled={!topic.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-purple-600 text-white disabled:opacity-50 disabled:grayscale hover:bg-purple-500 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </form>

              {error && (
                <div className="flex items-center justify-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
            </motion.div>
          )}

          {state === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6"
            >
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-medium">Crafting your quiz...</h2>
                <p className="text-white/40 text-sm italic">Gemini is researching {topic}</p>
              </div>
            </motion.div>
          )}

          {state === 'quiz' && (
            <motion.div
              key={`q-${currentIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-white/40 uppercase tracking-widest">
                  <span>Question {currentIndex + 1} of {questions.length}</span>
                  <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-medium leading-tight">
                  {questions[currentIndex].question}
                </h2>

                <div className="grid gap-3">
                  {questions[currentIndex].options.map((option, i) => {
                    const isCorrect = option === questions[currentIndex].correctAnswer;
                    const isSelected = selectedOption === option;
                    
                    return (
                      <motion.button
                        key={i}
                        id={`option-${i}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        disabled={!!selectedOption}
                        onClick={() => handleOptionSelect(option)}
                        className={`text-left p-5 rounded-2xl border transition-all relative overflow-hidden group
                          ${!selectedOption ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50' : 
                            isCorrect ? 'bg-green-500/10 border-green-500/50 text-green-300' :
                            isSelected ? 'bg-red-500/10 border-red-500/50 text-red-300' :
                            'bg-white/5 border-white/10 opacity-50'}
                        `}
                      >
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-lg">{option}</span>
                          {selectedOption && isCorrect && <Sparkles className="w-5 h-5 text-green-400" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4"
                >
                  <p className="text-white/60 leading-relaxed italic">
                    {questions[currentIndex].explanation}
                  </p>
                  <button
                    onClick={nextQuestion}
                    className="w-full py-4 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {currentIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {state === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12"
            >
              <div className="space-y-4">
                <div className="inline-flex p-6 rounded-full bg-purple-500/20 border border-purple-500/30">
                  <Trophy className="w-16 h-16 text-yellow-400" />
                </div>
                <h1 className="text-4xl font-bold italic tracking-tight">Quiz Complete!</h1>
              </div>

              <div className="py-8 space-y-2">
                <span className="text-8xl font-black font-mono tracking-tighter text-white">
                  {score}/{questions.length}
                </span>
                <p className="text-white/40 uppercase tracking-widest text-sm">Final Score</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={resetQuiz}
                  className="flex-1 py-4 px-6 rounded-2xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  New Topic
                </button>
                <button
                  onClick={() => startQuiz()}
                  className="flex-1 py-4 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  Retake Quiz
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-6 left-0 right-0 text-center pointer-events-none opacity-20">
        <p className="text-[10px] tracking-[0.2em] uppercase font-mono">
          Gemini-Powered Intelligence &bull; Full-Stack React App
        </p>
      </footer>
    </div>
  );
}
