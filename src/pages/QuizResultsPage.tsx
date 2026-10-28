import React, { useEffect, useState } from 'react';
import {
  Trophy,
  RotateCcw,
  BookOpen,
  Share2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizAttempt } from '../types';
import { SEED_QUIZZES } from '../lib/seedData';

interface QuizResultsPageProps {
  attemptData?: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const QuizResultsPage: React.FC<QuizResultsPageProps> = ({ attemptData, onNavigate }) => {
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (attemptData) {
      try {
        const parsed = JSON.parse(attemptData);
        setAttempt(parsed);

        // Confetti for great scores
        if (parsed.percentage >= 60) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#FBBF24', '#3B82F6', '#10B981'],
          });
        }
      } catch {
        // Fallback
      }
    } else {
      // Load latest attempt from storage
      const saved = localStorage.getItem('onebody_quiz_attempts');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (list.length > 0) {
            setAttempt(list[0]);
          }
        } catch {
          // Fallback
        }
      }
    }
  }, [attemptData]);

  if (!attempt) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="font-serif text-xl font-bold text-white">No Recent Quiz Attempt Found</h2>
        <p className="text-xs text-slate-400">Head over to the library to start a new Bible quiz.</p>
        <button
          onClick={() => onNavigate('quizzes')}
          className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300"
        >
          Browse Quizzes
        </button>
      </div>
    );
  }

  const quiz = SEED_QUIZZES.find((q) => q.id === attempt.quizId);

  const handleShare = () => {
    const text = `I just scored ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%) on "${attempt.quizTitle}" on OneBody Bible Quiz!`;
    if (navigator.share) {
      navigator.share({
        title: 'OneBody Bible Quiz Score',
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Summary Score Card */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-6 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quiz Completed</span>
        </div>

        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {attempt.quizTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Category: {attempt.quizCategory}</p>
        </div>

        {/* Circular score gauge */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-800"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="currentColor"
              strokeWidth="10"
              className={attempt.percentage >= 80 ? 'text-amber-400' : 'text-blue-400'}
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 * (1 - attempt.percentage / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-3xl font-bold text-white">{attempt.percentage}%</span>
            <span className="text-[11px] text-slate-400 font-medium">Accuracy</span>
          </div>
        </div>

        {/* Performance metrics */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-[10px] text-slate-400">Correct Answers</p>
            <p className="text-sm font-bold text-white">
              {attempt.score} / {attempt.totalQuestions}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-[10px] text-slate-400">XP Points</p>
            <p className="text-sm font-bold text-amber-300">+{attempt.pointsEarned} pts</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-[10px] text-slate-400">Time Taken</p>
            <p className="text-sm font-bold text-slate-200">{attempt.timeTakenSeconds}s</p>
          </div>
        </div>

        {/* Biblical Encouragement quote */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/20 max-w-lg mx-auto">
          <p className="text-xs font-serif italic text-amber-200/90 leading-relaxed">
            “Thy word is a lamp unto my feet, and a light unto my path.”
          </p>
          <p className="text-[10px] text-amber-400 font-semibold text-right mt-1">— Psalm 119:105</p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('quiz-play', { id: attempt.quizId })}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>

          <button
            onClick={handleShare}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Copied to Clipboard!' : 'Share Result'}</span>
          </button>

          <button
            onClick={() => onNavigate('quizzes')}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Next Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Answer Review Section */}
      {quiz && quiz.questions && (
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Scripture & Answer Review</span>
          </h2>

          <div className="space-y-4">
            {quiz.questions.map((q, idx) => {
              const userAns = attempt.answers?.[idx];
              const isCorrect = userAns ? userAns.isCorrect : false;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    isCorrect
                      ? 'bg-slate-900/60 border-slate-800'
                      : 'bg-rose-950/15 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400">
                        Question {idx + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-white">{q.questionText}</h4>
                    </div>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30 flex-shrink-0">
                        <XCircle className="w-3.5 h-3.5" />
                        Missed
                      </span>
                    )}
                  </div>

                  <div className="text-xs space-y-1 text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <p>
                      <span className="text-emerald-400 font-semibold">Correct Answer:</span>{' '}
                      {q.options[q.correctAnswerIndex]}
                    </p>
                    <p className="text-amber-300 font-semibold pt-1">
                      📖 {q.scriptureReference}
                    </p>
                    <p className="text-slate-400 leading-relaxed pt-0.5">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
