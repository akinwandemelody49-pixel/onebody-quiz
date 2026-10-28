import React, { useState, useEffect } from 'react';
import {
  Trophy,
  BookOpen,
  Users,
  Flame,
  Award,
  ArrowRight,
  Clock,
  Play,
  Heart,
  Globe2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { VerseCard } from '../components/common/VerseCard';
import {
  SEED_QUIZZES,
  SEED_COMPETITIONS,
  COUNTRIES
} from '../lib/seedData';
import { QuizAttempt, CommunityMessage } from '../types';

interface DashboardPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();

  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [activeMembers] = useState([
    {
      name: 'Brother David',
      country: 'United States',
      flag: '🇺🇸',
      points: 1820,
      avatar: '/src/assets/images/avatar_member_david_1793017334243.jpg',
    },
    {
      name: 'Sister Grace Ndidi',
      country: 'Nigeria',
      flag: '🇳🇬',
      points: 1540,
      avatar: '/src/assets/images/avatar_member_grace_1793017333665.jpg',
    },
    {
      name: 'Pastor Thomas',
      country: 'United Kingdom',
      flag: '🇬🇧',
      points: 1410,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=thomas',
    },
    {
      name: 'Sister Eun-ji',
      country: 'South Korea',
      flag: '🇰🇷',
      points: 1280,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=eunji',
    },
    {
      name: 'Brother Gabriel',
      country: 'Brazil',
      flag: '🇧🇷',
      points: 1190,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=gabriel',
    },
  ]);

  const [communitySnippets] = useState<Partial<CommunityMessage>[]>([
    {
      id: 'm-1',
      userName: 'Sister Grace Ndidi',
      userCountry: 'Nigeria',
      content: 'Greetings beloved saints! Studying Romans 8 this morning, so encouraged by verse 38.',
      scriptureRef: 'Romans 8:38-39',
      createdAt: '10 mins ago',
    },
    {
      id: 'm-2',
      userName: 'Brother David',
      userCountry: 'United States',
      content: 'The Parables quiz was so convicting! Looking forward to the Pentecost Cup tournament.',
      scriptureRef: 'Matthew 13:31',
      createdAt: '35 mins ago',
    },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('onebody_quiz_attempts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentAttempts(parsed.slice(0, 3));
      } catch {
        // Safe fallback
      }
    }
  }, []);

  const countryObj = COUNTRIES.find((c) => c.name === profile?.country);
  const nextCompetition = SEED_COMPETITIONS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Welcome & Overview Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-7 space-y-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{countryObj?.flag || '🌍'} {profile?.country || 'Global Fellowship'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-semibold">{profile?.role || 'Member'}</span>
              {unreadCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <button
                    onClick={() => onNavigate('notifications')}
                    className="text-amber-300 hover:underline"
                  >
                    {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
                  </button>
                </>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Grace and Peace, {profile?.displayName || 'Beloved in Christ'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Continue your daily walk in Scripture today. Deepen your understanding of God's Word through thematic quizzes and live fellowship.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('quizzes')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/10 transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Start Quiz</span>
            </button>

            <button
              onClick={() => onNavigate('competitions')}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Tournaments</span>
            </button>
          </div>
        </div>

        {/* Clean Numerical Stat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5 border-t border-slate-800">
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <p className="text-[11px] text-slate-400">Current Quiz Streak</p>
            <p className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{profile?.currentStreak || 1} Days</span>
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <p className="text-[11px] text-slate-400">Quizzes Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums">
              {profile?.quizzesCompleted || 0}
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <p className="text-[11px] text-slate-400">Total Scripture XP</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-300 font-mono tabular-nums">
              {(profile?.totalPoints || 0).toLocaleString()} pts
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <p className="text-[11px] text-slate-400">Regional Ranking</p>
            <p className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums">
              #4 in {countryObj?.name || 'Nation'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Verse of the Day & Live Competition Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <VerseCard />
        </div>

        {/* Live / Upcoming Tournament Card with Real High-Res Trophy Art */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between group">
          <div className="h-40 overflow-hidden relative">
            <img
              src="/src/assets/images/card_pentecost_arena_1793017333590.jpg"
              alt="Pentecost Championship Award"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </div>

          <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="text-amber-400 font-semibold uppercase text-[10px] tracking-wider">
                  Upcoming Tournament
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5" /> Starts in 4h
                </span>
              </div>

              <h3 className="font-serif text-lg font-bold text-white">
                {nextCompetition.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {nextCompetition.description}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400">
                {nextCompetition.participantCount} registered
              </span>

              <button
                onClick={() => onNavigate('live-room', { id: nextCompetition.id })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-sm transition-all"
              >
                Enter Room
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Quizzes: Clean Unboxed Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-white">
              Recommended Scripture Tracks
            </h2>
            <p className="text-xs text-slate-400">
              Thematic biblical studies with chapter and verse citations
            </p>
          </div>
          <button
            onClick={() => onNavigate('quizzes')}
            className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SEED_QUIZZES.slice(0, 3).map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-6 flex flex-col justify-between transition-all group shadow-md"
            >
              <div className="space-y-3">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{quiz.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{quiz.difficulty}</span>
                </div>

                <h3 className="font-serif text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                  {quiz.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {quiz.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono tabular-nums">
                  {quiz.questionCount} Questions · {quiz.pointsPerQuestion * quiz.questionCount} pts
                </span>

                <button
                  onClick={() => onNavigate('quiz-play', { id: quiz.id })}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center gap-1"
                >
                  <span>Play</span>
                  <Play className="w-3 h-3 fill-slate-950" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Recent Quiz Attempts & Fellowship Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attempts */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-white">Recent Quiz Attempts</h3>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs text-amber-400 hover:underline"
            >
              Full History
            </button>
          </div>

          {recentAttempts.length > 0 ? (
            <div className="space-y-2.5">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-white">{attempt.quizTitle}</p>
                    <p className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%) · +{attempt.pointsEarned} pts
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-amber-300 font-mono tabular-nums">
                    {attempt.percentage >= 80 ? 'Mastered' : 'Completed'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
              <BookOpen className="w-7 h-7 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-300 font-medium">No quiz attempts yet today</p>
              <p className="text-[11px] text-slate-500">
                Play your first quiz to earn Scripture points and advance your streak.
              </p>
              <button
                onClick={() => onNavigate('quizzes')}
                className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300"
              >
                Browse Quizzes
              </button>
            </div>
          )}
        </div>

        {/* Global Community Stream */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-white">Fellowship Snippets</h3>
            <button
              onClick={() => onNavigate('community')}
              className="text-xs text-amber-400 hover:underline"
            >
              Open Channels
            </button>
          </div>

          <div className="space-y-2.5">
            {communitySnippets.map((msg) => (
              <div
                key={msg.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-white">
                    {msg.userName} ({msg.userCountry})
                  </span>
                  <span className="text-[10px]">{msg.createdAt}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{msg.content}</p>
                {msg.scriptureRef && (
                  <p className="text-[11px] text-amber-400 font-serif italic">
                    📖 {msg.scriptureRef}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Leaderboard Preview & Active Believers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-white">
                Global Leaderboard Preview
              </h3>
              <p className="text-xs text-slate-400">Honoring faithful learners worldwide</p>
            </div>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Full Rankings
            </button>
          </div>

          <div className="space-y-2">
            {activeMembers.slice(0, 4).map((member, idx) => (
              <div
                key={member.name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-serif font-bold text-amber-400">
                    #{idx + 1}
                  </span>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {member.flag} {member.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-semibold text-amber-300 font-mono tabular-nums">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{member.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Believers in Fellowship */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-white">Active in Fellowship</h3>
            <span className="text-[10px] text-emerald-400 font-medium">Real-Time</span>
          </div>

          <div className="space-y-3">
            {activeMembers.map((member) => (
              <div key={member.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-medium text-slate-200">{member.name}</p>
                    <p className="text-[10px] text-slate-500">{member.flag} {member.country}</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('community')}
                  className="text-[11px] text-slate-400 hover:text-amber-300 hover:underline"
                >
                  Say Shalom
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
