import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Award,
  Globe2,
  Calendar,
  Filter,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ACHIEVEMENTS, COUNTRIES } from '../lib/seedData';

interface LeaderboardPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

interface LeaderboardUser {
  rank: number;
  uid: string;
  displayName: string;
  country: string;
  flag: string;
  avatar: string;
  totalPoints: number;
  streak: number;
  quizzesCompleted: number;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'monthly' | 'country'>('global');
  const [selectedCountry, setSelectedCountry] = useState(profile?.country || 'All');

  // Realistic global community leaderboard seed
  const mockMembers: LeaderboardUser[] = [
    {
      rank: 1,
      uid: 'u-1',
      displayName: 'Brother Emmanuel',
      country: 'Nigeria',
      flag: '🇳🇬',
      avatar: '/src/assets/images/avatar_member_david_1793017334243.jpg',
      totalPoints: 3420,
      streak: 18,
      quizzesCompleted: 35,
    },
    {
      rank: 2,
      uid: 'u-2',
      displayName: 'Sister Sarah Jenkins',
      country: 'United States',
      flag: '🇺🇸',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sarah',
      totalPoints: 3180,
      streak: 14,
      quizzesCompleted: 31,
    },
    {
      rank: 3,
      uid: 'u-3',
      displayName: 'Pastor Thomas Wright',
      country: 'United Kingdom',
      flag: '🇬🇧',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=thomas',
      totalPoints: 2950,
      streak: 11,
      quizzesCompleted: 28,
    },
    {
      rank: 4,
      uid: 'u-4',
      displayName: 'Sister Grace Ndidi',
      country: 'Nigeria',
      flag: '🇳🇬',
      avatar: '/src/assets/images/avatar_member_grace_1793017333665.jpg',
      totalPoints: 2640,
      streak: 9,
      quizzesCompleted: 24,
    },
    {
      rank: 5,
      uid: 'u-5',
      displayName: 'Brother Gabriel Santos',
      country: 'Brazil',
      flag: '🇧🇷',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=gabriel',
      totalPoints: 2420,
      streak: 8,
      quizzesCompleted: 22,
    },
    {
      rank: 6,
      uid: 'u-6',
      displayName: 'Sister Eun-ji Park',
      country: 'South Korea',
      flag: '🇰🇷',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=eunji',
      totalPoints: 2190,
      streak: 7,
      quizzesCompleted: 19,
    },
    {
      rank: 7,
      uid: 'u-7',
      displayName: 'Brother David Ochieng',
      country: 'Kenya',
      flag: '🇰🇪',
      avatar: '/src/assets/images/avatar_member_david_1793017334243.jpg',
      totalPoints: 1950,
      streak: 6,
      quizzesCompleted: 17,
    },
  ];

  // If user is logged in, position them in rankings
  const userScore = profile?.totalPoints || 450;
  const userRank = 8;

  const displayList = mockMembers.filter((m) => {
    if (activeTab === 'country' && selectedCountry !== 'All') {
      return m.country === selectedCountry;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Honoring Diligent Study of Scripture</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
            Global Fellowship Leaderboards
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Celebrating Christian brothers and sisters growing in God's Word worldwide.
            “Let us run with perseverance the race marked out for us.” — Hebrews 12:1
          </p>
        </div>

        {/* User rank callout banner */}
        {profile && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center font-serif text-sm">
              #{userRank}
            </div>
            <div>
              <p className="text-xs font-bold text-white">Your Global Standing</p>
              <p className="text-[11px] text-amber-300">{profile.totalPoints || 0} pts • {profile.currentStreak || 1} Day Streak</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'global'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            All-Time Global
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'weekly'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'monthly'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setActiveTab('country')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'country'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            By Country
          </button>
        </div>

        {activeTab === 'country' && (
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="All">All Nations</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Leaderboard Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-4 px-6 text-center w-16">Rank</th>
                <th className="py-4 px-4">Member</th>
                <th className="py-4 px-4">Nation</th>
                <th className="py-4 px-4 text-center">Daily Streak</th>
                <th className="py-4 px-4 text-center">Quizzes</th>
                <th className="py-4 px-6 text-right">Scripture XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {displayList.map((m) => {
                const isTop3 = m.rank <= 3;
                return (
                  <tr
                    key={m.uid}
                    className={`hover:bg-slate-850/50 transition-colors ${
                      isTop3 ? 'bg-amber-500/[0.02]' : ''
                    }`}
                  >
                    <td className="py-4 px-6 text-center font-serif font-bold">
                      {m.rank === 1 && <span className="text-xl">🥇</span>}
                      {m.rank === 2 && <span className="text-xl">🥈</span>}
                      {m.rank === 3 && <span className="text-xl">🥉</span>}
                      {m.rank > 3 && <span className="text-slate-400">#{m.rank}</span>}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatar}
                          alt={m.displayName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-white">{m.displayName}</p>
                          <p className="text-[11px] text-slate-500">Faithful Disciple</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span className="text-base">{m.flag}</span>
                        <span>{m.country}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-amber-300 font-semibold text-xs">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>{m.streak}d</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center text-slate-400 font-medium">
                      {m.quizzesCompleted}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span className="font-bold text-amber-300 font-mono text-sm sm:text-base">
                        {m.totalPoints.toLocaleString()} pts
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Current user pinned row if logged in */}
              {profile && (
                <tr className="bg-amber-500/10 border-t-2 border-amber-500/40">
                  <td className="py-4 px-6 text-center font-serif font-bold text-amber-300">
                    #{userRank}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          profile.photoURL ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.uid}`
                        }
                        alt={profile.displayName}
                        className="w-9 h-9 rounded-full object-cover border border-amber-400"
                      />
                      <div>
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <span>{profile.displayName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold uppercase">
                            You
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-400">{profile.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-300">
                    {profile.country || 'Global'}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950 text-amber-300 font-semibold text-xs">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>{profile.currentStreak || 1}d</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-300 font-medium">
                    {profile.quizzesCompleted || 0}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-amber-300 font-mono text-sm sm:text-base">
                    {(profile.totalPoints || 0).toLocaleString()} pts
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Achievement Badges Showcase */}
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Spiritual Milestone Badges</span>
          </h2>
          <p className="text-xs text-slate-400">
            Earned through continuous Scripture study, prayer fellowship, and tournament participation.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ACHIEVEMENTS.map((ach) => (
            <div
              key={ach.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2 hover:border-amber-500/30 transition-all shadow-md"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ach.badgeColor} text-slate-950 flex items-center justify-center mx-auto shadow-md font-bold`}
              >
                <Award className="w-6 h-6" />
              </div>
              <p className="font-serif font-bold text-xs text-white">{ach.title}</p>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                {ach.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
