import React, { useState } from 'react';
import {
  Trophy,
  BookOpen,
  Users,
  Heart,
  Globe2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Award,
  BarChart3,
  Play,
  X
} from 'lucide-react';
import { VerseCard } from '../components/common/VerseCard';
import { SEED_QUIZZES } from '../lib/seedData';

interface LandingPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const sampleQuiz = SEED_QUIZZES[0];
  const sampleQuestion = sampleQuiz.questions[0];

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <div className="space-y-10 sm:space-y-14 pb-14">
      {/* Hero Section with Newly Supplied Background Visual & Directional Scrim */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-[#071326] min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] flex items-center">
        {/* Background Visual Asset: Believers, Radiant Cross on Mountain & Open Bible loaded from actual project asset */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none select-none"
          aria-hidden="true"
        >
          <img
            src="/assets/aistudio/image_3660ef28.png"
            alt="OneBody Believers with Cross and Open Bible"
            className="absolute h-[160%] sm:h-[165%] lg:h-[170%] w-auto max-w-none right-[-70px] sm:right-[-30px] lg:right-0 top-0 object-cover object-right"
          />
        </div>

        {/* Refined Directional Scrim: Solid opaque navy on the left to guarantee high contrast for text and prevent underlying image text bleed-through, smoothly opening on the right to reveal the believers, radiant cross, and open Bible in full clarity */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#071326] via-[#071326]/85 to-[#071326]/40 lg:from-[#071326] lg:via-[#071326]/75 lg:to-transparent"
          aria-hidden="true"
        />

        {/* Subtle bottom edge blend into next section */}
        <div
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#071326] via-[#071326]/40 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Kicker, Headline, Tagline, Action Buttons & Metrics */}
            <div className="lg:col-span-7 space-y-5 lg:space-y-6">
              {/* Mission Kicker from Reference Design */}
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-slate-300">
                <span>Test Your Knowledge</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Grow in Faith</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Make an Impact</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] text-balance">
                OneBody{' '}
                <span className="text-amber-400 block sm:inline">Bible Quiz</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-xl leading-relaxed font-sans">
                More than just a quiz — it’s a journey to knowing God’s Word, growing in faith,
                and becoming part of one body in Christ.
              </p>

              {/* Action Buttons with Reference Styling */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 max-w-md sm:max-w-none">
                <button
                  onClick={() => onNavigate('quizzes')}
                  className="px-7 py-3 rounded-full font-bold text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Start the Quiz</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setShowVideoModal(true)}
                  className="px-6 py-3 rounded-full font-semibold text-xs sm:text-sm text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-600/80 backdrop-blur-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Play className="w-2.5 h-2.5 text-slate-950 fill-slate-950 ml-0.5" />
                  </span>
                  <span>Watch Video</span>
                </button>
              </div>

              {/* Clean Metric Baseline Strip */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg">
                <div>
                  <p className="font-serif text-lg sm:text-2xl font-bold text-white tabular-nums">120+</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Countries United</p>
                </div>
                <div className="border-l border-slate-800/80 pl-3 sm:pl-6">
                  <p className="font-serif text-lg sm:text-2xl font-bold text-white tabular-nums">105+</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Verified Questions</p>
                </div>
                <div className="border-l border-slate-800/80 pl-3 sm:pl-6">
                  <p className="font-serif text-lg sm:text-2xl font-bold text-amber-400 tabular-nums">100%</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Biblically Grounded</p>
                </div>
              </div>
            </div>

            {/* Right Column: Kept completely open and clean so the team, glowing cross, and open Bible remain unobstructed */}
            <div className="lg:col-span-5 hidden lg:block" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* 4 Feature Items Section: Crisp white banner matching the reference design */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white text-slate-900 shadow-2xl p-6 sm:p-8 lg:p-10 border border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
            {/* Feature 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-slate-950 flex items-center justify-center shrink-0 shadow-sm border border-amber-200/60">
                <BookOpen className="w-5 h-5 text-slate-950" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-slate-950">
                  Bible-Based Questions
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  Test your knowledge with carefully crafted questions from God’s Word.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-slate-950 flex items-center justify-center shrink-0 shadow-sm border border-amber-200/60">
                <BarChart3 className="w-5 h-5 text-slate-950" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-slate-950">
                  Track Your Progress
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  See your growth, earn achievements, and stay motivated.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-slate-950 flex items-center justify-center shrink-0 shadow-sm border border-amber-200/60">
                <Users className="w-5 h-5 text-slate-950" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-slate-950">
                  Join a Community
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  Be part of a global family that loves God's Word and each other.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-slate-950 flex items-center justify-center shrink-0 shadow-sm border border-amber-200/60">
                <Heart className="w-5 h-5 text-slate-950" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-slate-950">
                  Make an Impact
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  Support the mission through prayer, giving, and fellowship.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matthew 18:20 Scripture Section matching Reference Design */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-2">
        <div className="py-6 px-6 sm:px-10 rounded-2xl bg-[#071326] border border-slate-800 space-y-2.5 shadow-xl">
          <p className="font-serif italic text-base sm:text-xl md:text-2xl text-slate-100 leading-relaxed text-balance">
            “For where two or three gather in my name, there am I with them.”
          </p>
          <div className="flex items-center justify-center gap-4 pt-1">
            <div className="h-px w-12 sm:w-20 bg-amber-400/60" />
            <p className="font-mono text-xs sm:text-sm font-bold text-amber-400 tracking-widest uppercase">
              Matthew 18:20
            </p>
            <div className="h-px w-12 sm:w-20 bg-amber-400/60" />
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Comprehensive Scripture Learning & Live Arena
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Dignified, scholarly Bible studies crafted with verified chapter and verse citations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Quiz Library */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between group">
            <div className="h-48 sm:h-52 overflow-hidden relative">
              <img
                src="/src/assets/images/card_bible_library_1793017332890.jpg"
                alt="Classical Bible study manuscripts and scrolls"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>

            <div className="p-5 sm:p-7 space-y-3">
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
              <div className="pt-2">
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
            <div className="h-48 sm:h-52 overflow-hidden relative">
              <img
                src="/src/assets/images/card_pentecost_arena_1793017333590.jpg"
                alt="Pentecost Championship trophy and laurel wreath"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>

            <div className="p-5 sm:p-7 space-y-3">
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
              <div className="pt-2">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cultivating Unity Across the Nations
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A sanctuary for respectful fellowship, biblical rigor, and sincere prayer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-base font-bold text-white">Live Synchronized Rooms</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synchronized question timers, server-authoritative scoring, and live participant rosters prevent cheating or desynchronization.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
            <Heart className="w-5 h-5 text-rose-400" />
            <h3 className="font-serif text-base font-bold text-white">Prayer Wall & Testimonies</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submit public or confidential prayer requests, join with one-click intercession counters, and celebrate answered prayers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-serif text-base font-bold text-white">5 Dedicated Fellowship Channels</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time messaging in General Fellowship, Bible Questions, Quiz Announcements, Prayer, and Testimonies.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-base font-bold text-white">Encouraging Daily Streaks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track your daily habit of reading and quizzing with spiritual milestone badges, not vanity metrics.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
            <Globe2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-serif text-base font-bold text-white">Country & Global Rankings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              View how participants in your nation and worldwide are progressing in their understanding of the Scriptures.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
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
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 text-center space-y-4 shadow-2xl">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Begin Your Scripture Journey Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Join thousands of brothers and sisters worldwide growing in grace, knowledge, and fellowship.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('signup')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/10 transition-all"
            >
              Create Free Member Account
            </button>
            <button
              onClick={() => onNavigate('quizzes')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-950 border border-slate-800 transition-all"
            >
              Browse Quizzes
            </button>
          </div>
        </div>
      </section>

      {/* Video Overview Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <BookOpen className="w-4 h-4" />
                <span>OneBody Bible Quiz · Ministry Overview</span>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                One Body in Christ. One Word. One Community.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                OneBody is an international Bible quiz platform uniting believers across 120+ nations to study God’s Word deeply, test their knowledge with 105+ verified Scripture questions, compete in live synchronized tournaments, and uphold one another on the prayer wall.
              </p>
            </div>

            {/* Video Preview Card with Play Preview */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center group">
              <img
                src="/assets/aistudio/image_3660ef28.png"
                alt="OneBody Fellowship Overview"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="relative z-10 text-center space-y-2 p-4">
                <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                  <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                </div>
                <p className="text-xs font-semibold text-white">Interactive Platform Tour & Demonstration</p>
                <p className="text-[11px] text-slate-300">Start exploring quizzes or join live synchronized competitions</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowVideoModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  onNavigate('quizzes');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Explore Quizzes Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
