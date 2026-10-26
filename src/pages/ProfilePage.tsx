import React, { useState, useEffect } from 'react';
import {
  User,
  Flame,
  Award,
  BookOpen,
  Globe2,
  Calendar,
  Settings,
  Heart,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ACHIEVEMENTS, COUNTRIES } from '../lib/seedData';
import { QuizAttempt } from '../types';

interface ProfilePageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [history, setHistory] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('onebody_quiz_attempts');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        // Fallback
      }
    }
  }, []);

  const countryObj = COUNTRIES.find((c) => c.name === profile?.country);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={
                profile?.photoURL ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.uid || 'user'}`
              }
              alt={profile?.displayName || 'User'}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl bg-slate-950"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  {profile?.displayName || 'Fellow Believer'}
                </h1>
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {profile?.role || 'Member'}
                </span>
              </div>
              <p className="text-xs text-slate-400">{profile?.email}</p>
              <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                <span>{countryObj?.flag || '🌍'} {profile?.country || 'International'}</span>
                {profile?.city && <span>• {profile.city}</span>}
                <span>• {profile?.preferredLanguage || 'English'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('settings')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Favorite Scripture Banner */}
        {profile?.favoriteVerse && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-950/70 border border-amber-500/20 flex items-center gap-3">
            <Heart className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Favorite Scripture:</p>
              <p className="text-sm font-serif italic text-amber-200">
                “{profile.favoriteVerse}”
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-xs text-slate-400">Total Points</p>
            <p className="text-xl font-bold text-amber-300 font-mono">
              {(profile?.totalPoints || 0).toLocaleString()} pts
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-xs text-slate-400">Current Streak</p>
            <p className="text-xl font-bold text-white flex items-center gap-1">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>{profile?.currentStreak || 1} Days</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-xs text-slate-400">Highest Streak</p>
            <p className="text-xl font-bold text-white">
              {profile?.highestStreak || 1} Days
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-xs text-slate-400">Quizzes Taken</p>
            <p className="text-xl font-bold text-white">
              {profile?.quizzesCompleted || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Achievements & Study Interests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements Showcase (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Milestone Badges & Honors</span>
            </h2>
            <span className="text-xs text-slate-400">
              {ACHIEVEMENTS.filter((a) => (profile?.totalPoints || 0) >= a.requiredCount).length} of {ACHIEVEMENTS.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked =
                ach.type === 'points'
                  ? (profile?.totalPoints || 0) >= ach.requiredCount
                  : (profile?.quizzesCompleted || 0) >= ach.requiredCount;

              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    isUnlocked
                      ? 'bg-slate-950/80 border-amber-500/30'
                      : 'bg-slate-950/30 border-slate-800/60 opacity-50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ach.badgeColor} flex items-center justify-center text-slate-950 font-bold flex-shrink-0 shadow-md`}
                  >
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-white truncate flex items-center gap-1.5">
                      <span>{ach.title}</span>
                      {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {ach.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bible Study Interests (1 col) */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Study Interests</span>
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {profile?.bibleInterests?.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-medium"
              >
                {interest}
              </span>
            ))}
            {(!profile?.bibleInterests || profile.bibleInterests.length === 0) && (
              <span className="text-xs text-slate-500">No interests configured yet.</span>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-xs text-slate-400">
              Personalized quiz recommendations are curated around your selected topics.
            </p>
            <button
              onClick={() => onNavigate('settings')}
              className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Update Topics in Settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Attempt History */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Quiz Attempt History</span>
          </h2>
          <span className="text-xs text-slate-400">{history.length} attempts recorded</span>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Quiz Title</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">XP Earned</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {history.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-850/40">
                    <td className="py-3 px-4 font-semibold text-white">{att.quizTitle}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {att.score} / {att.totalQuestions}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          att.percentage >= 80
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-amber-300 font-bold">+{att.pointsEarned} pts</td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(att.completedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-300 font-medium">No quiz attempts recorded yet</p>
            <p className="text-[11px] text-slate-500">
              Start your first quiz today in the Bible Quiz Library!
            </p>
            <button
              onClick={() => onNavigate('quizzes')}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300"
            >
              Browse Quizzes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
