import React, { useState } from 'react';
import {
  Trophy,
  BookOpen,
  Users,
  Heart,
  Globe2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Award
} from 'lucide-react';
import { VerseCard } from '../components/common/VerseCard';
import { SEED_QUIZZES } from '../lib/seedData';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { signInAsDemo } = useAuth();
  const sampleQuiz = SEED_QUIZZES[0];
  const sampleQuestion = sampleQuiz.questions[0];

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section: 2-Column Balanced Split with Real Cinematic Asset */}
      <section className="relative border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 7 Columns: Editorial Presentation */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest">
                <span>Worldwide Christian Fellowship</span>
                <span aria-hidden="true">·</span>
                <span>Ecumenical Biblical Learning</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
                One Body in Christ.{' '}
                <span className="text-amber-400 block sm:inline">One Word.</span>{' '}
                One Global Community.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Connect with Christian believers across 120+ nations to study God’s Word,
                participate in synchronized live tournaments, and cultivate a daily rhythm of Scripture study.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => onNavigate('signup')}
                  className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <span>Join Fellowship Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('quizzes')}
                  className="px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Explore Quizzes</span>
                </button>

                <button
                  onClick={async () => {
                    await signInAsDemo('member');
                    onNavigate('dashboard');
                  }}
                  className="px-4 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Demo Mode</span>
                </button>
              </div>

              {/* Clean Metric Baseline Strip */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-white tabular-nums">120+</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Countries</p>
                </div>
                <div className="border-l border-slate-800 pl-6">
                  <p className="font-serif text-xl sm:text-2xl font-bold text-white tabular-nums">8</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Scripture Tracks</p>
                </div>
                <div className="border-l border-slate-800 pl-6">
                  <p className="font-serif text-xl sm:text-2xl font-bold text-amber-400 tabular-nums">100%</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Biblically Verified</p>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Cinematic Visual Frame */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group bg-slate-900">
                <img
                  src="/src/assets/images/hero_scripture_fellowship_1793017331715.jpg"
                  alt="Holy Bible illuminated with globe on scholarly mahogany library desk"
                  className="w-full h-[360px] sm:h-[440px] object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800/90 text-xs">
                  <p className="font-serif italic text-amber-200">
                    “So in Christ we, though many, form one body, and each member belongs to all the others.”
                  </p>
                  <p className="text-[11px] text-slate-400 text-right mt-1 font-sans">— Romans 12:5</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Verse Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <VerseCard />
      </section>

      {/* Interactive Sample Question Teaser */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span className="text-amber-400 font-semibold tracking-wide uppercase text-[11px]">
              Interactive Sample Question
            </span>
            <span>Category: {sampleQuiz.category}</span>
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-relaxed">
            {sampleQuestion.questionText}
          </h3>

          <div className="space-y-2.5">
            {sampleQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === sampleQuestion.correctAnswerIndex;
              let btnClass = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700';

              if (showAnswer) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold';
                } else if (isSelected) {
                  btnClass = 'bg-rose-950/40 border-rose-500 text-rose-300';
                }
              } else if (isSelected) {
                btnClass = 'bg-amber-950/40 border-amber-400 text-amber-200';
              }

              return (
                <button
                  key={idx}
                  disabled={showAnswer}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${btnClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-900 text-[11px] font-semibold flex items-center justify-center text-slate-400 border border-slate-800">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {showAnswer && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {!showAnswer ? (
            <button
              disabled={selectedOption === null}
              onClick={() => setShowAnswer(true)}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 transition-all"
            >
              Verify Answer
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs text-slate-300 space-y-1.5">
              <p className="font-semibold text-amber-300">Scripture Reference: {sampleQuestion.scriptureReference}</p>
              <p className="leading-relaxed">{sampleQuestion.explanation}</p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onNavigate('quizzes')}
                  className="text-amber-400 hover:underline flex items-center gap-1 font-semibold text-xs"
                >
                  Explore full quiz library <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Tracks with Generated High-Res Visuals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Comprehensive Scripture Learning & Live Arena
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Dignified, scholarly Bible studies crafted with verified chapter and verse citations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Quiz Library */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between group">
            <div className="h-56 overflow-hidden relative">
              <img
                src="/src/assets/images/card_bible_library_1793017332890.jpg"
                alt="Classical Bible study manuscripts and scrolls"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>8 Categories</span>
                <span aria-hidden="true">·</span>
                <span>Beginner to Advanced</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-white">
                Thematic Scripture Catalog
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Dive into the Parables of Christ, Old Testament prophetic covenants, the Book of Acts,
                and Epistles. Every single question includes theological context and verse references.
              </p>
              <div className="pt-3">
                <button
                  onClick={() => onNavigate('quizzes')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center gap-1.5"
                >
                  <span>Browse Quizzes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Live Tournament Arena */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between group">
            <div className="h-56 overflow-hidden relative">
              <img
                src="/src/assets/images/card_pentecost_arena_1793017333590.jpg"
                alt="Pentecost Championship trophy and laurel wreath"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Real-Time Synchronized</span>
                <span aria-hidden="true">·</span>
                <span>Global Leaderboard</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-white">
                Live Worldwide Competitions
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Compete synchronously with brothers and sisters from Nigeria, the United States, United Kingdom,
                Korea, Brazil, and Kenya in time-controlled rounds with instant synchronized podiums.
              </p>
              <div className="pt-3">
                <button
                  onClick={() => onNavigate('competitions')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center gap-1.5"
                >
                  <span>View Tournaments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Six Pillars: Clean Unboxed Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cultivating Unity Across the Nations
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A sanctuary for respectful fellowship, biblical rigor, and sincere prayer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-base font-bold text-white">Live Synchronized Rooms</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synchronized question timers, server-authoritative scoring, and live participant rosters prevent cheating or desynchronization.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <Heart className="w-5 h-5 text-rose-400" />
            <h3 className="font-serif text-base font-bold text-white">Prayer Wall & Testimonies</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submit public or confidential prayer requests, join with one-click intercession counters, and celebrate answered prayers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-serif text-base font-bold text-white">5 Dedicated Fellowship Channels</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time messaging in General Fellowship, Bible Questions, Quiz Announcements, Prayer, and Testimonies.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-base font-bold text-white">Encouraging Daily Streaks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track your daily habit of reading and quizzing with spiritual milestone badges, not vanity metrics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <Globe2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-serif text-base font-bold text-white">Country & Global Rankings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              View how participants in your nation and worldwide are progressing in their understanding of the Scriptures.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h3 className="font-serif text-base font-bold text-white">Christ-Honoring Moderation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Safe community protected by ABAC Firestore rules, message reporting, user muting, and active admin supervision.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 text-center space-y-5 shadow-2xl">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Begin Your Scripture Journey Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Join thousands of brothers and sisters worldwide growing in grace, knowledge, and fellowship.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('signup')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/10 transition-all"
            >
              Create Free Member Account
            </button>
            <button
              onClick={() => onNavigate('quizzes')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-950 border border-slate-800 transition-all"
            >
              Browse Quizzes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
