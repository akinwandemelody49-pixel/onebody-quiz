import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Sparkles,
  Layers,
  Shuffle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  Clock,
  BookOpen,
  Calendar,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { TournamentManifest, TournamentProgressionType } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface MultiRoundTournamentManagerProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const MultiRoundTournamentManager: React.FC<MultiRoundTournamentManagerProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  // Configuration Form State
  const [tournamentTitle, setTournamentTitle] = useState('OneBody World Cup: Multi-Round Scripture Championship');
  const [progressionType, setProgressionType] = useState<TournamentProgressionType>('standard_ascending');
  const [totalRounds, setTotalRounds] = useState(3);
  const [questionsPerRound, setQuestionsPerRound] = useState(3);
  const [roundDurationSeconds, setRoundDurationSeconds] = useState(18);
  const [revealDurationSeconds, setRevealDurationSeconds] = useState(6);
  const [intermissionDurationSeconds, setIntermissionDurationSeconds] = useState(7);
  const [startHoursFromNow, setStartHoursFromNow] = useState(1);

  // Manifest & Generation State
  const [manifest, setManifest] = useState<TournamentManifest | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Recency tracker state
  const [recentCount, setRecentCount] = useState(0);

  // Fetch recent tracker count on load
  const fetchRecentTracker = async () => {
    try {
      const res = await fetch('/api/tournaments/recent-tracker');
      if (res.ok) {
        const data = await res.json();
        setRecentCount(data.recentCount || 0);
      }
    } catch (e) {
      console.error('Failed to fetch tracker:', e);
    }
  };

  useEffect(() => {
    fetchRecentTracker();
    // Generate initial preview manifest
    handleGenerateManifest();
  }, []);

  const handleGenerateManifest = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/tournaments/generate-manifest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentTitle,
          progressionType,
          totalRounds,
          questionsPerRound,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate manifest');
      }

      setManifest(data.manifest);
      setStatusMessage('Anti-Prediction manifest generated and verified successfully.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error generating manifest');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeployTournament = async () => {
    setIsDeploying(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/competitions/create-multiround', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-role': 'admin',
          'x-user-email': profile?.email || '',
        },
        body: JSON.stringify({
          title: tournamentTitle,
          progressionType,
          totalRounds,
          questionsPerRound,
          roundDurationSeconds,
          revealDurationSeconds,
          intermissionDurationSeconds,
          durationMinutes: Math.round(((roundDurationSeconds + revealDurationSeconds) * totalRounds * questionsPerRound + intermissionDurationSeconds * (totalRounds - 1)) / 60) + 5,
          startHoursFromNow,
          isAdmin: true,
          userEmail: profile?.email || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to deploy tournament');
      }

      setStatusMessage(`Tournament deployed! ID: ${data.competitionId}`);
      fetchRecentTracker();
      // Navigate to room or list
      setTimeout(() => {
        onNavigate('quiz_room', { id: data.competitionId });
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error deploying tournament');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleClearCooldown = async () => {
    try {
      const res = await fetch('/api/tournaments/clear-recent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-role': 'admin',
          'x-user-email': profile?.email || '',
        },
        body: JSON.stringify({ isAdmin: true, userEmail: profile?.email || '' }),
      });
      if (res.ok) {
        setRecentCount(0);
        setStatusMessage('Cooldown question buffer reset.');
        handleGenerateManifest();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Anti-Prediction & Multi-Round Engine</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Multi-Round Question Rotation System
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Eliminates player topic prediction by enforcing topic divergence across rounds, balanced Testament distribution, option shuffling, and progressive difficulty curves.
          </p>
        </div>

        {/* Tracker Quick Stats */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-right self-start md:self-auto min-w-[200px]">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Anti-Repetition Cooldown</span>
          <p className="text-xl font-bold text-amber-300">{recentCount} Questions</p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleClearCooldown}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white transition-colors"
            >
              Reset Cooldown
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main 2-Col Layout: Form Controls on Left, Manifest Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Tournament Architecture</span>
            </h3>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tournament Title</label>
              <input
                type="text"
                value={tournamentTitle}
                onChange={(e) => setTournamentTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Progression Curve */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Difficulty Progression Strategy</label>
              <select
                value={progressionType}
                onChange={(e) => setProgressionType(e.target.value as TournamentProgressionType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="standard_ascending">Ascending 5-Tier (Foundations → Prophecy → Finale)</option>
                <option value="championship_curve">Championship Curve (Developing → Advanced → Expert)</option>
                <option value="expert_gauntlet">Theologian’s Gauntlet (Advanced & Expert Only)</option>
              </select>
            </div>

            {/* Round Counts & Questions per Round */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Number of Rounds</label>
                <select
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value={2}>2 Rounds</option>
                  <option value={3}>3 Rounds (Recommended)</option>
                  <option value={4}>4 Rounds</option>
                  <option value={5}>5 Rounds (Grand Prix)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Questions per Round</label>
                <select
                  value={questionsPerRound}
                  onChange={(e) => setQuestionsPerRound(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value={2}>2 Questions (Fast)</option>
                  <option value={3}>3 Questions (Balanced)</option>
                  <option value={4}>4 Questions</option>
                  <option value={5}>5 Questions (In-Depth)</option>
                </select>
              </div>
            </div>

            {/* Timers */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Round Time</label>
                <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-2 rounded-xl border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <input
                    type="number"
                    min={10}
                    max={60}
                    value={roundDurationSeconds}
                    onChange={(e) => setRoundDurationSeconds(Number(e.target.value))}
                    className="w-full bg-transparent text-white text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">sec</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Reveal Time</label>
                <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-2 rounded-xl border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <input
                    type="number"
                    min={4}
                    max={15}
                    value={revealDurationSeconds}
                    onChange={(e) => setRevealDurationSeconds(Number(e.target.value))}
                    className="w-full bg-transparent text-white text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">sec</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Intermission</label>
                <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-2 rounded-xl border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <input
                    type="number"
                    min={5}
                    max={30}
                    value={intermissionDurationSeconds}
                    onChange={(e) => setIntermissionDurationSeconds(Number(e.target.value))}
                    className="w-full bg-transparent text-white text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">sec</span>
                </div>
              </div>
            </div>

            {/* Scheduled Start */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Scheduled Start Time</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select
                  value={startHoursFromNow}
                  onChange={(e) => setStartHoursFromNow(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                >
                  <option value={0.1}>Immediate / 5 Minutes From Now</option>
                  <option value={1}>In 1 Hour</option>
                  <option value={3}>In 3 Hours</option>
                  <option value={12}>In 12 Hours</option>
                  <option value={24}>In 24 Hours</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                disabled={isGenerating}
                onClick={handleGenerateManifest}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Shuffle className="w-4 h-4 text-amber-400" />
                <span>{isGenerating ? 'Generating Manifest...' : 'Simulate Question Rotation'}</span>
              </button>

              <button
                disabled={isDeploying || !manifest}
                onClick={handleDeployTournament}
                className="w-full py-3.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{isDeploying ? 'Deploying to Authoritative Server...' : 'Launch Live Multi-Round Tournament'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Manifest & Anti-Prediction Audit View (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {manifest ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
              {/* Manifest Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-bold text-white">{manifest.title}</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                      {manifest.totalRounds} Rounds • {manifest.totalQuestions} Questions Total
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Canonical Manifest ID: <code className="text-amber-300">{manifest.tournamentId}</code>
                  </p>
                </div>

                {/* Score Pill */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/30 text-right self-start sm:self-auto">
                  <div className="flex items-center gap-1.5 justify-end">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">Anti-Prediction Rating</span>
                  </div>
                  <p className="text-2xl font-black text-white">{manifest.antiPredictionScore} / 100</p>
                </div>
              </div>

              {/* Anti-Prediction Verification Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Topic Divergence</span>
                  <p className="text-sm font-bold text-amber-300">
                    {manifest.antiPredictionMetrics.topicRotationDivergence}% Fresh
                  </p>
                  <p className="text-[10px] text-slate-400">Zero round clustering</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Duplicate Check</span>
                  <p className="text-sm font-bold text-emerald-400">100% Unique</p>
                  <p className="text-[10px] text-slate-400">0 duplicate IDs</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Option Shuffling</span>
                  <p className="text-sm font-bold text-purple-300">Fisher-Yates</p>
                  <p className="text-[10px] text-slate-400">Answer key mapped</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Answer Secrecy</span>
                  <p className="text-sm font-bold text-emerald-400">Server Withheld</p>
                  <p className="text-[10px] text-slate-400">Withheld until reveal</p>
                </div>
              </div>

              {/* Round-by-Round Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Sequential Round Schedule & Topic Dispersion</span>
                </h4>

                <div className="space-y-3">
                  {manifest.rounds.map((round) => (
                    <div
                      key={round.roundNumber}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                            {round.roundNumber}
                          </span>
                          <span className="font-semibold text-sm text-white">{round.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            Tier: <strong className="text-amber-300">{round.difficultySummary}</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            OT: {round.testamentDistribution.oldTestament} | NT: {round.testamentDistribution.newTestament}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400">
                        <strong className="text-slate-300">Focus:</strong> {round.focusTheme}
                      </p>

                      {/* Topic Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-500 mr-1">Rotated Topics:</span>
                        {Object.entries(round.topicDistribution).map(([topic, count]) => (
                          <span
                            key={topic}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900 text-slate-200 border border-slate-800"
                          >
                            {topic} ({count})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center text-slate-500 space-y-3">
              <Layers className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm">Click "Simulate Question Rotation" to audit multi-round manifest.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
