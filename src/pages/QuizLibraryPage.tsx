import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Play,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { SEED_QUIZZES } from '../lib/seedData';
import { QuizCategory, QuizDifficulty } from '../types';
import { useAuth } from '../context/AuthContext';

interface QuizLibraryPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const CATEGORIES: (QuizCategory | 'All')[] = [
  'All',
  'Old Testament',
  'New Testament',
  'Life and teachings of Jesus',
  'Parables of Jesus',
  'Bible characters',
  'Books of the Bible',
  'Biblical history',
  'Christian living',
];

const DIFFICULTIES: (QuizDifficulty | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const QuizLibraryPage: React.FC<QuizLibraryPageProps> = ({ onNavigate }) => {
  const { isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine seeded quizzes and any admin-created quizzes
  const allQuizzes = SEED_QUIZZES;

  const filteredQuizzes = allQuizzes.filter((quiz) => {
    const matchesCategory = selectedCategory === 'All' || quiz.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || quiz.difficulty === selectedDifficulty;
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Scripture Learning Center</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
            Bible Quiz Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Test and deepen your knowledge of God's Word across both Testaments, the life of Jesus, and Christian walk.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/40 border border-purple-500/30 hover:bg-purple-900/40 transition-all flex items-center gap-1.5 self-start md:self-auto"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Manage & Add Quizzes</span>
          </button>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, apostle, parable, or title..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Difficulty:</span>
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Pill Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Cards Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const totalPoints = quiz.pointsPerQuestion * quiz.questionCount;
            return (
              <div
                key={quiz.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-6 sm:p-7 flex flex-col justify-between transition-all group shadow-xl"
              >
                <div className="space-y-3">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{quiz.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-400">{quiz.difficulty}</span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-200 transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {quiz.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
                    <span>{quiz.questionCount} Questions</span>
                    <span aria-hidden="true">·</span>
                    <span>{quiz.timePerQuestionSeconds}s per Q</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-300 font-bold">{totalPoints} pts</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('quiz-play', { id: quiz.id })}
                      className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Start Quiz</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-white">No Quizzes Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or category filter to discover other Scripture studies.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedDifficulty('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
