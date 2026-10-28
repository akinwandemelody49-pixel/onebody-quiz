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
  CheckCircle2,
  Lock,
  ArrowRight,
  BookMarked,
  Layers,
  GraduationCap
} from 'lucide-react';
import { SEED_QUIZZES } from '../lib/seedData';
import { LEARNING_PATH_LEVELS, SUPPORTED_TRANSLATIONS, getQuestionCountsByDifficulty } from '../lib/bibleQuestionBank';
import { QuizCategory, QuizDifficulty, QuestionDifficulty } from '../types';
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
  'Wisdom and Psalms',
  'Prophecy and Revelation',
];

const DIFFICULTIES = ['All', 'Beginner', 'Developing', 'Intermediate', 'Advanced', 'Expert'];
const TRANSLATIONS = ['All', 'Multi-Translation', 'NIV', 'KJV', 'NKJV', 'ESV'];

export const QuizLibraryPage: React.FC<QuizLibraryPageProps> = ({ onNavigate }) => {
  const { isAdmin } = useAuth();
  const [activeViewMode, setActiveViewMode] = useState<'learning_path' | 'curated' | 'difficulty_practice'>('learning_path');
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTranslation, setSelectedTranslation] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Check saved learning path progress from localStorage
  const savedProgressStr = localStorage.getItem('onebody_learning_path_progress');
  const savedProgress: Record<number, { completed: boolean; score: number }> = savedProgressStr
    ? JSON.parse(savedProgressStr)
    : {};

  const bankCounts = getQuestionCountsByDifficulty();

  // Combine seeded quizzes and any admin-created quizzes
  const allQuizzes = SEED_QUIZZES;

  const filteredQuizzes = allQuizzes.filter((quiz) => {
    const matchesCategory = selectedCategory === 'All' || quiz.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'All' ||
      quiz.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchesTranslation =
      selectedTranslation === 'All' ||
      !quiz.translationId ||
      quiz.translationId === selectedTranslation ||
      quiz.translationId === 'Multi-Translation';
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesTranslation && matchesSearch;
  });

  const getDifficultyPillStyle = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'developing':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'intermediate':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'advanced':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'expert':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Scripture Learning Center · 5 Difficulty Levels</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Bible Quiz & Scripture Progression
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Grow from foundational narratives to deep scriptural exegesis across verified translations (Multi-Translation, NIV, KJV, NKJV, ESV).
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/40 border border-purple-500/30 hover:bg-purple-900/40 transition-all flex items-center gap-1.5 self-start md:self-auto"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Question Bank & Admin</span>
          </button>
        )}
      </div>

      {/* Navigation View Modes */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2.5">
        <button
          onClick={() => setActiveViewMode('learning_path')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeViewMode === 'learning_path'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>5-Level Learning Path</span>
        </button>

        <button
          onClick={() => setActiveViewMode('difficulty_practice')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeViewMode === 'difficulty_practice'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Practice by Level (105 Questions)</span>
        </button>

        <button
          onClick={() => setActiveViewMode('curated')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeViewMode === 'curated'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Thematic Scripture Quizzes</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* VIEW 1: 5-LEVEL LEARNING PATH */}
      {/* --------------------------------------------------------------------- */}
      {activeViewMode === 'learning_path' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Spiritual Mastery Progression</span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              A Step-by-Step Biblical Growth Path
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Advance through five progressive tiers designed to nurture believers from basic Scripture recall to deep covenantal comprehension. Each level presents 10 verified questions with biblical explanations upon completion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {LEARNING_PATH_LEVELS.map((lvl, index) => {
              // Level 1 is always unlocked. Next levels unlock if previous level is passed.
              const prevLvlCompleted = index === 0 || savedProgress[index]?.completed;
              const isCompleted = savedProgress[lvl.level]?.completed;
              const bestScore = savedProgress[lvl.level]?.score;

              return (
                <div
                  key={lvl.level}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all space-y-3 ${
                    isCompleted
                      ? 'bg-slate-900/95 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                      : prevLvlCompleted
                      ? 'bg-slate-900 border-amber-500/40 shadow-md'
                      : 'bg-slate-950/60 border-slate-850 opacity-60'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-amber-400 font-bold">LEVEL {lvl.level}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getDifficultyPillStyle(
                          lvl.difficulty
                        )}`}
                      >
                        {lvl.difficulty}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-base font-bold text-white">{lvl.title}</h3>
                      <p className="text-[11px] text-amber-300 font-medium mt-0.5">{lvl.subtitle}</p>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                        {lvl.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Pass: {lvl.requiredPassScore}%</span>
                      <span>{lvl.questionCount} Questions</span>
                    </div>

                    {isCompleted && (
                      <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed ({bestScore}%)</span>
                      </div>
                    )}

                    <button
                      disabled={!prevLvlCompleted}
                      onClick={() => onNavigate('quiz-play', { id: `lp-level-${lvl.level}` })}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                        prevLvlCompleted
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/10'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {prevLvlCompleted ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>{isCompleted ? 'Retry Level' : 'Start Level'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* VIEW 2: PRACTICE BY DIFFICULTY LEVEL */}
      {/* --------------------------------------------------------------------- */}
      {activeViewMode === 'difficulty_practice' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
            <div>
              <p className="font-semibold text-white text-sm">
                Practice Bank: 105 Curated Scripture Questions
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Targeted practice across any of the 5 difficulty levels. Instant feedback with verse citations.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span>Multiple Translations: KJV · NKJV · NIV · ESV</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Level 1: Beginner */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 flex flex-col justify-between space-y-3.5 shadow-md">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Level 1 · Beginner
                  </span>
                  <span className="font-mono text-slate-400 text-xs">{bankCounts.beginner.total} Questions</span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-white">Familiar Stories & Facts</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Noah's ark, Abraham, David and Goliath, the birth and resurrection of Jesus Christ, creation, and foundational disciples.
                </p>
              </div>
              <button
                onClick={() => onNavigate('quiz-play', { id: 'diff-beginner' })}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Practice Beginner Questions</span>
              </button>
            </div>

            {/* Level 2: Developing */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-sky-500/30 flex flex-col justify-between space-y-3.5 shadow-md">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    Level 2 · Developing
                  </span>
                  <span className="font-mono text-slate-400 text-xs">{bankCounts.developing.total} Questions</span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-white">Events, Covenants & Teachings</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The Ten Commandments, Sermon on the Mount, Fruit of the Spirit, Saul's conversion on the Damascus road, and Pentecost.
                </p>
              </div>
              <button
                onClick={() => onNavigate('quiz-play', { id: 'diff-developing' })}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-sky-400 hover:bg-sky-300 transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Practice Developing Questions</span>
              </button>
            </div>

            {/* Level 3: Intermediate */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 flex flex-col justify-between space-y-3.5 shadow-md">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Level 3 · Intermediate
                  </span>
                  <span className="font-mono text-slate-400 text-xs">{bankCounts.intermediate.total} Questions</span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-white">Parables & Apostolic Ministry</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Understanding the parables of Jesus, the Jerusalem Council, Paul's epistles on justification, and deep Old Testament themes.
                </p>
              </div>
              <button
                onClick={() => onNavigate('quiz-play', { id: 'diff-intermediate' })}
                className="w-full py-2.5 rounded-xl font-bold text-slate-950 text-xs bg-amber-400 hover:bg-amber-300 transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Practice Intermediate Questions</span>
              </button>
            </div>

            {/* Level 4: Advanced */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/30 flex flex-col justify-between space-y-3.5 shadow-md">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    Level 4 · Advanced
                  </span>
                  <span className="font-mono text-slate-400 text-xs">{bankCounts.advanced.total} Questions</span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-white">Historical Context & Shadows</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Melchizedek, Persian edicts under Cyrus, sanctuary furniture in Hebrews 9, subtle chronology, and prophetic typology.
                </p>
              </div>
              <button
                onClick={() => onNavigate('quiz-play', { id: 'diff-advanced' })}
                className="w-full py-2.5 rounded-xl font-bold text-white text-xs bg-purple-600 hover:bg-purple-500 transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Practice Advanced Questions</span>
              </button>
            </div>

            {/* Level 5: Expert */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500/30 flex flex-col justify-between space-y-3.5 shadow-md md:col-span-2 lg:col-span-1">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    Level 5 · Expert
                  </span>
                  <span className="font-mono text-slate-400 text-xs">{bankCounts.expert.total} Questions</span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-white">In-Depth Exegesis & Canon</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Linguistic nuances (e.g. ego eimi, prototokos, agapao vs phileo), intricate covenantal harmonization, and complex hermeneutics.
                </p>
              </div>
              <button
                onClick={() => onNavigate('quiz-play', { id: 'diff-expert' })}
                className="w-full py-2.5 rounded-xl font-bold text-white text-xs bg-rose-600 hover:bg-rose-500 transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Practice Expert Questions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* VIEW 3: THEMATIC SCRIPTURE QUIZZES */}
      {/* --------------------------------------------------------------------- */}
      {activeViewMode === 'curated' && (
        <div className="space-y-6 animate-in fade-in">
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

              {/* Translation Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">Translation:</span>
                <select
                  value={selectedTranslation}
                  onChange={(e) => setSelectedTranslation(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                >
                  {TRANSLATIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredQuizzes.map((quiz) => {
                const totalPoints = quiz.pointsPerQuestion * quiz.questionCount;
                return (
                  <div
                    key={quiz.id}
                    className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-5 flex flex-col justify-between transition-all group shadow-md"
                  >
                    <div className="space-y-2.5">
                      <div className="text-xs text-slate-500 flex items-center justify-between">
                        <span>{quiz.category}</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getDifficultyPillStyle(
                            quiz.difficulty
                          )}`}
                        >
                          {quiz.difficulty}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-amber-200 transition-colors">
                          {quiz.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {quiz.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-3">
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
                          className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-sm transition-all flex items-center justify-center gap-1.5"
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
                  setSelectedTranslation('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
