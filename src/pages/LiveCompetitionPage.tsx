import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Play,
  CheckCircle2,
  AlertCircle,
  Plus,
  Shield,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { SEED_COMPETITIONS, COUNTRIES } from '../lib/seedData';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Competition } from '../types';

interface LiveCompetitionPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const LiveCompetitionPage: React.FC<LiveCompetitionPageProps> = ({ onNavigate }) => {
  const { profile, isAdmin } = useAuth();
  const { addNotification } = useNotifications();

  const [competitions, setCompetitions] = useState<Competition[]>(SEED_COMPETITIONS);
  const [registeredIds, setRegisteredIds] = useState<string[]>(['comp-global-pentecost']);
  const [tab, setTab] = useState<'upcoming' | 'completed'>('upcoming');

  const handleRegisterToggle = (comp: Competition) => {
    if (!profile) {
      onNavigate('login');
      return;
    }

    if (registeredIds.includes(comp.id)) {
      setRegisteredIds((prev) => prev.filter((id) => id !== comp.id));
      setCompetitions((prev) =>
        prev.map((c) => (c.id === comp.id ? { ...c, participantCount: Math.max(0, c.participantCount - 1) } : c))
      );
    } else {
      setRegisteredIds((prev) => [...prev, comp.id]);
      setCompetitions((prev) =>
        prev.map((c) => (c.id === comp.id ? { ...c, participantCount: c.participantCount + 1 } : c))
      );

      addNotification({
        userId: profile.uid,
        title: `Registered: ${comp.title}`,
        message: `You are officially registered for the live competition starting at ${new Date(comp.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        type: 'competition',
        link: `/competition/${comp.id}/room`,
      });
    }
  };

  const upcomingList = competitions.filter((c) => c.status !== 'completed');
  const completedList = competitions.filter((c) => c.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Global Championship Arena</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
            Live Worldwide Competitions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Synchronized Bible competitions where believers across continents compete together in real time.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/40 border border-purple-500/30 hover:bg-purple-900/40 transition-all flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Live Tournament</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tab === 'upcoming'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Upcoming & Live Tournaments ({upcomingList.length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tab === 'completed'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Past Competitions ({completedList.length})
        </button>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(tab === 'upcoming' ? upcomingList : completedList).map((comp) => {
          const isRegistered = registeredIds.includes(comp.id);
          const startDate = new Date(comp.startTime);

          return (
            <div
              key={comp.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 overflow-hidden flex flex-col justify-between transition-all shadow-xl group"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src="/src/assets/images/card_pentecost_arena_1793017333590.jpg"
                  alt={comp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-amber-300 font-semibold text-[11px] border border-slate-850">
                    {comp.category}
                  </span>
                  {comp.status === 'live' && (
                    <span className="px-2.5 py-1 rounded-md bg-rose-950/80 backdrop-blur-md text-rose-300 font-bold text-[10px] uppercase border border-rose-500/40">
                      Live Now
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{comp.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span>{comp.durationMinutes} Minutes</span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-white leading-snug">
                    {comp.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                {/* Competition Details Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-850 text-center">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3" /> Start Date
                    </p>
                    <p className="text-xs font-semibold text-white">
                      {startDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="space-y-0.5 border-x border-slate-800">
                    <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> Time
                    </p>
                    <p className="text-xs font-semibold text-amber-300">
                      {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" /> Participants
                    </p>
                    <p className="text-xs font-semibold text-white">
                      {comp.participantCount} / {comp.participantLimit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => handleRegisterToggle(comp)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    isRegistered
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isRegistered ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Registered (Click to Leave)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Register for Free</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('live-room', { id: comp.id })}
                  className="w-full sm:flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Enter Synchronized Room</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {tab === 'completed' && completedList.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-serif text-base font-bold text-white">No Past Tournaments Yet</h3>
          <p className="text-xs text-slate-400">
            Past live tournament results and podium finishes will appear here.
          </p>
        </div>
      )}
    </div>
  );
};
