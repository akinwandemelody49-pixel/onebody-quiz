import React, { useState, useEffect } from 'react';
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  BookOpen,
  Volume2,
  RotateCcw,
  Sparkles,
  Award,
  ChevronLeft
} from 'lucide-react';
import { SEED_QUIZZES } from '../lib/seedData';
import { useAuth } from '../context/AuthContext';
import { Quiz, QuizQuestion, QuizAttempt } from '../types';

interface QuizPlayPageProps {
  quizId?: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const QuizPlayPage: React.FC<QuizPlayPageProps> = ({ quizId, onNavigate }) => {
  const { profile, updateQuizProgress } = useAuth();

  // Find target quiz or fallback to first
  const currentQuiz = SEED_QUIZZES.find((q) => q.id === quizId) || SEED_QUIZZES[0];
  const questions = currentQuiz.questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
  }[]>([]);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(currentQuiz.timePerQuestionSeconds);
  const [startTime] = useState(Date.now());

  const currentQ: QuizQuestion = questions[currentIndex];

  // Web Audio subtle chime for feedback
  const playSound = (isCorrect: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isCorrect) {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(329.63, audioCtx.currentTime); // E4
        osc.frequency.setValueAtTime(261.63, audioCtx.currentTime + 0.1); // C4
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // Audio optional
    }
  };

  // Timer countdown
  useEffect(() => {
    if (hasAnsweredCurrent) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, hasAnsweredCurrent]);

  const handleTimeout = () => {
    if (hasAnsweredCurrent) return;
    setHasAnsweredCurrent(true);
    setSelectedOption(-1); // No answer submitted in time

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedOption: -1,
        isCorrect: false,
      },
    ]);
  };

  const handleSelectOption = (index: number) => {
    if (hasAnsweredCurrent) return;

    setSelectedOption(index);
    setHasAnsweredCurrent(true);

    const isCorrect = index === currentQ.correctAnswerIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    playSound(isCorrect);

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedOption: index,
        isCorrect,
      },
    ]);
  };

  const handleNext = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnsweredCurrent(false);
      setTimeLeft(currentQuiz.timePerQuestionSeconds);
    } else {
      // Quiz complete: save attempt and navigate to results
      const totalTimeSeconds = Math.round((Date.now() - startTime) / 1000);
      const pointsEarned = score * currentQuiz.pointsPerQuestion;
      const percentage = Math.round((score / questions.length) * 100);

      const attemptRecord: QuizAttempt = {
        id: `att-${Date.now()}`,
        quizId: currentQuiz.id,
        quizTitle: currentQuiz.title,
        quizCategory: currentQuiz.category,
        userId: profile?.uid || 'guest',
        userName: profile?.displayName || 'Fellow Believer',
        userCountry: profile?.country,
        score,
        totalQuestions: questions.length,
        pointsEarned,
        percentage,
        timeTakenSeconds: totalTimeSeconds,
        answers: userAnswers,
        completedAt: new Date().toISOString(),
      };

      // Save to localStorage for instant persistence
      const saved = localStorage.getItem('onebody_quiz_attempts');
      const allAttempts = saved ? JSON.parse(saved) : [];
      localStorage.setItem('onebody_quiz_attempts', JSON.stringify([attemptRecord, ...allAttempts]));

      // Update user points and streak in profile
      await updateQuizProgress(pointsEarned);

      // Route to results
      onNavigate('quiz-results', {
        attempt: JSON.stringify(attemptRecord),
      });
    }
  };

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Quiz Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('quizzes')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit to Library</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {currentQuiz.category}
          </span>
          <span className="text-xs text-amber-400 font-semibold">
            {score * currentQuiz.pointsPerQuestion} pts
          </span>
        </div>
      </div>

      {/* Progress & Timer Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">
            Question <span className="text-amber-400 font-bold">{currentIndex + 1}</span> of{' '}
            {questions.length}
          </span>

          <div
            className={`flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full border transition-all ${
              timeLeft <= 5
                ? 'bg-rose-950/50 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-amber-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">
            Biblical Question
          </span>
          <h2 className="font-serif text-lg sm:text-2xl font-bold text-white leading-relaxed">
            {currentQ.questionText}
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctAnswerIndex;

            let btnStyle =
              'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-amber-500/40 hover:bg-slate-800/50';

            if (hasAnsweredCurrent) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-semibold shadow-lg shadow-emerald-950/20';
              } else if (isSelected) {
                btnStyle = 'bg-rose-950/50 border-rose-500 text-rose-300 font-semibold';
              } else {
                btnStyle = 'bg-slate-950/40 border-slate-850 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={hasAnsweredCurrent}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-2xl border text-sm sm:text-base transition-all flex items-center justify-between ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-800/80 text-xs font-semibold flex items-center justify-center text-slate-300 border border-slate-700">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>

                {hasAnsweredCurrent && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
                {hasAnsweredCurrent && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation & Scripture Reference Reveal */}
        {hasAnsweredCurrent && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs sm:text-sm space-y-2 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between text-amber-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Scripture Reference: {currentQ.scriptureReference}</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                Biblically Verified
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">{currentQ.explanation}</p>

            <div className="pt-3 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Quiz Results'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
