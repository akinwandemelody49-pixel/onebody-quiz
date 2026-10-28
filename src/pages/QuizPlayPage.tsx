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
  ChevronLeft,
  BookMarked
} from 'lucide-react';
import { SEED_QUIZZES } from '../lib/seedData';
import {
  BIBLE_QUESTION_BANK,
  LEARNING_PATH_LEVELS,
  getQuestionsByDifficulty
} from '../lib/bibleQuestionBank';
import { useAuth } from '../context/AuthContext';
import { Quiz, QuizQuestion, QuizAttempt, QuestionDifficulty } from '../types';

interface QuizPlayPageProps {
  quizId?: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const QuizPlayPage: React.FC<QuizPlayPageProps> = ({ quizId, onNavigate }) => {
  const { profile, updateQuizProgress } = useAuth();

  // Resolve session configuration: Learning Path, Difficulty Practice, or Curated Quiz
  const isLearningPath = quizId?.startsWith('lp-level-');
  const isDifficultyPractice = quizId?.startsWith('diff-');

  let sessionTitle = 'Bible Knowledge Challenge';
  let sessionCategory = 'General Scripture';
  let sessionDifficulty: QuestionDifficulty | string = 'intermediate';
  let sessionQuestions: QuizQuestion[] = [];
  let timePerQuestion = 25;
  let pointsPerQ = 100;
  let requiredPassScore = 70;
  let lpLevelNumber = 1;

  if (isLearningPath) {
    const lvlNum = parseInt(quizId!.replace('lp-level-', ''), 10) || 1;
    lpLevelNumber = lvlNum;
    const lvlDef = LEARNING_PATH_LEVELS.find((l) => l.level === lvlNum) || LEARNING_PATH_LEVELS[0];
    sessionTitle = `Level ${lvlDef.level}: ${lvlDef.title}`;
    sessionCategory = lvlDef.subtitle;
    sessionDifficulty = lvlDef.difficulty;
    requiredPassScore = lvlDef.requiredPassScore;
    timePerQuestion = 25;
    pointsPerQ = 100;

    const bankQuestions = getQuestionsByDifficulty(lvlDef.difficulty);
    sessionQuestions = bankQuestions.slice(0, lvlDef.questionCount).map((bq) => ({
      id: bq.id,
      questionText: bq.questionText,
      options: bq.options,
      correctAnswerIndex: bq.correctAnswerIndex,
      explanation: bq.explanation,
      scriptureReference: bq.scriptureReferences[0] || 'Holy Bible',
      scriptureReferences: bq.scriptureReferences,
      difficulty: bq.difficulty,
      translationId: bq.translationId,
      translationName: bq.translationName,
    }));
  } else if (isDifficultyPractice) {
    const rawDiff = quizId!.replace('diff-', '').toLowerCase() as QuestionDifficulty;
    sessionDifficulty = rawDiff;
    sessionTitle = `${rawDiff.toUpperCase()} Level Practice Session`;
    sessionCategory = 'Scripture Progression';
    timePerQuestion = 25;
    pointsPerQ = 100;

    const bankQuestions = getQuestionsByDifficulty(rawDiff);
    sessionQuestions = bankQuestions.slice(0, 10).map((bq) => ({
      id: bq.id,
      questionText: bq.questionText,
      options: bq.options,
      correctAnswerIndex: bq.correctAnswerIndex,
      explanation: bq.explanation,
      scriptureReference: bq.scriptureReferences[0] || 'Holy Bible',
      scriptureReferences: bq.scriptureReferences,
      difficulty: bq.difficulty,
      translationId: bq.translationId,
      translationName: bq.translationName,
    }));
  } else {
    const targetQuiz = SEED_QUIZZES.find((q) => q.id === quizId) || SEED_QUIZZES[0];
    sessionTitle = targetQuiz.title;
    sessionCategory = targetQuiz.category;
    sessionDifficulty = targetQuiz.difficulty;
    timePerQuestion = targetQuiz.timePerQuestionSeconds || 25;
    pointsPerQ = targetQuiz.pointsPerQuestion || 80;
    sessionQuestions = targetQuiz.questions || [];
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
  }[]>([]);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [startTime] = useState(Date.now());

  const currentQ: QuizQuestion = sessionQuestions[currentIndex] || sessionQuestions[0];

  // Web Audio subtle chime for feedback
  const playSound = (isCorrect: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    setSelectedOption(-1);

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
    if (currentIndex + 1 < sessionQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnsweredCurrent(false);
      setTimeLeft(timePerQuestion);
    } else {
      // Session complete
      const totalTimeSeconds = Math.round((Date.now() - startTime) / 1000);
      const pointsEarned = score * pointsPerQ;
      const percentage = Math.round((score / sessionQuestions.length) * 100);

      // If this was a Learning Path level, persist progress and unlock next level
      if (isLearningPath) {
        const passed = percentage >= requiredPassScore;
        const savedProgressStr = localStorage.getItem('onebody_learning_path_progress');
        const progress = savedProgressStr ? JSON.parse(savedProgressStr) : {};

        progress[lpLevelNumber] = {
          completed: passed,
          score: Math.max(progress[lpLevelNumber]?.score || 0, percentage),
          timestamp: new Date().toISOString(),
        };

        localStorage.setItem('onebody_learning_path_progress', JSON.stringify(progress));
      }

      const attemptRecord: QuizAttempt = {
        id: `att-${Date.now()}`,
        quizId: quizId || 'practice',
        quizTitle: sessionTitle,
        quizCategory: sessionCategory,
        userId: profile?.uid || 'guest',
        userName: profile?.displayName || 'Fellow Believer',
        userCountry: profile?.country,
        score,
        totalQuestions: sessionQuestions.length,
        pointsEarned,
        percentage,
        timeTakenSeconds: totalTimeSeconds,
        answers: userAnswers,
        completedAt: new Date().toISOString(),
      };

      // Save to localStorage for instant history
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

  const progressPercent = ((currentIndex + 1) / sessionQuestions.length) * 100;

  const getDifficultyPillStyle = (diff?: string) => {
    switch (diff?.toLowerCase()) {
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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('quizzes')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit to Quiz Center</span>
        </button>

        <div className="flex items-center gap-2">
          {currentQ.translationId && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {currentQ.translationId}
            </span>
          )}

          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getDifficultyPillStyle(
              currentQ.difficulty || sessionDifficulty
            )}`}
          >
            {currentQ.difficulty || sessionDifficulty}
          </span>

          <span className="text-xs text-amber-400 font-semibold font-mono">
            {score * pointsPerQ} pts
          </span>
        </div>
      </div>

      {/* Progress & Timer Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <h2 className="font-serif font-bold text-white text-sm">{sessionTitle}</h2>
            <p className="text-[11px] text-slate-400">
              Question <span className="text-amber-400 font-bold">{currentIndex + 1}</span> of{' '}
              <span className="font-bold">{sessionQuestions.length}</span>
            </p>
          </div>

          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
              timeLeft <= 5
                ? 'bg-rose-950 text-rose-400 border border-rose-500/50 animate-pulse'
                : 'bg-slate-950 text-slate-300 border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-850">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="space-y-2">
          {currentQ.translationName && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <BookMarked className="w-3.5 h-3.5 text-amber-400" />
              <span>Translation Basis: <strong className="text-slate-300">{currentQ.translationName}</strong></span>
            </p>
          )}

          <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-snug">
            {currentQ.questionText}
          </h3>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctAnswerIndex;

            let buttonStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50 hover:bg-slate-900';

            if (hasAnsweredCurrent) {
              if (isCorrect) {
                buttonStyle = 'bg-emerald-950/60 border-emerald-400 text-emerald-200 font-semibold shadow-lg shadow-emerald-500/10';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-rose-950/60 border-rose-400 text-rose-200 font-semibold';
              } else {
                buttonStyle = 'bg-slate-950/40 border-slate-850 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={hasAnsweredCurrent}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between group ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs border ${
                      hasAnsweredCurrent && isCorrect
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : hasAnsweredCurrent && isSelected && !isCorrect
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>

                {hasAnsweredCurrent && (
                  <div>
                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Post-Answer Biblical Explanation & Reference Reveal */}
        {hasAnsweredCurrent && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Scripture Reference: {currentQ.scriptureReference}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentQ.translationId || 'Multi-Translation'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Next Question / Finish Button */}
        {hasAnsweredCurrent && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <span>
                {currentIndex + 1 < sessionQuestions.length ? 'Next Question' : 'Complete Challenge'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
