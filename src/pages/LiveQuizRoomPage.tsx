import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Users,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ChevronLeft,
  Flame,
  Shield,
  Wifi,
  WifiOff,
  Radio,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { SEED_COMPETITIONS } from '../lib/seedData';

interface LiveQuizRoomPageProps {
  competitionId?: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

interface ServerParticipant {
  userId: string;
  displayName: string;
  country: string;
  photoURL?: string;
  score: number;
  correctCount: number;
}

interface ServerQuestionClient {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number | null;
  explanation: string | null;
  scriptureReference: string | null;
}

export const LiveQuizRoomPage: React.FC<LiveQuizRoomPageProps> = ({ competitionId, onNavigate }) => {
  const { profile, isAdmin, updateQuizProgress } = useAuth();
  const roomId = competitionId || 'comp-global-pentecost';
  const comp = SEED_COMPETITIONS.find((c) => c.id === roomId) || SEED_COMPETITIONS[0];

  // WebSocket and server-synchronized states
  const [wsConnected, setWsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Authoritative room state received from server
  const [roomStatus, setRoomStatus] = useState<'lobby' | 'active' | 'reveal' | 'completed'>('lobby');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState<ServerQuestionClient | null>(null);
  const [roundTimerSeconds, setRoundTimerSeconds] = useState(15);
  const [revealTimerSeconds, setRevealTimerSeconds] = useState(6);
  const [leaderboard, setLeaderboard] = useState<ServerParticipant[]>([]);
  const [participantCount, setParticipantCount] = useState(1);

  // Client local interaction state for current round
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Live floating reactions broadcasted by WebSocket
  const [liveReactions, setLiveReactions] = useState<{ id: string; emoji: string; from: string }[]>([]);

  // Establish real WebSocket connection to server
  useEffect(() => {
    let isMounted = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setWsConnected(true);
          setConnectionError(null);

          // Join the authoritative competition room
          const joinPayload = {
            type: 'join_room',
            roomId,
            user: {
              uid: profile?.uid || `guest-${Date.now()}`,
              displayName: profile?.displayName || 'Fellow Believer',
              country: profile?.country || 'Global',
              photoURL: profile?.photoURL,
            },
          };
          ws.send(JSON.stringify(joinPayload));
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);

            switch (data.type) {
              case 'room_state': {
                const { state } = data;
                setRoomStatus(state.status);
                setCurrentQuestionIndex(state.currentQuestionIndex);
                setTotalQuestions(state.totalQuestions);
                setCurrentQuestion(state.currentQuestion);
                setRoundTimerSeconds(state.roundTimerSeconds);
                setRevealTimerSeconds(state.revealTimerSeconds);
                setLeaderboard(state.leaderboard || []);
                setParticipantCount(state.participantCount || 1);
                break;
              }

              case 'participant_joined': {
                setLeaderboard(data.leaderboard || []);
                setParticipantCount(data.participantCount || 1);
                break;
              }

              case 'round_started': {
                const { state } = data;
                setRoomStatus('active');
                setCurrentQuestionIndex(state.currentQuestionIndex);
                setCurrentQuestion(state.currentQuestion);
                setRoundTimerSeconds(state.roundTimerSeconds);
                setSelectedOption(null);
                setHasSubmitted(false);
                setSubmissionFeedback(null);
                break;
              }

              case 'timer_tick': {
                setRoundTimerSeconds(data.roundTimerSeconds);
                break;
              }

              case 'submission_accepted': {
                setHasSubmitted(true);
                setSubmissionFeedback('Registered on Server');
                break;
              }

              case 'submission_rejected': {
                setSubmissionFeedback(data.reason || 'Submission rejected');
                break;
              }

              case 'round_revealed': {
                const { state } = data;
                setRoomStatus('reveal');
                setCurrentQuestion(state.currentQuestion);
                setRevealTimerSeconds(state.revealTimerSeconds);
                if (state.leaderboard) setLeaderboard(state.leaderboard);
                break;
              }

              case 'reveal_tick': {
                setRevealTimerSeconds(data.revealTimerSeconds);
                break;
              }

              case 'leaderboard_updated': {
                setLeaderboard(data.leaderboard || []);
                break;
              }

              case 'competition_completed': {
                const { state } = data;
                setRoomStatus('completed');
                if (state.leaderboard) setLeaderboard(state.leaderboard);

                confetti({
                  particleCount: 120,
                  spread: 80,
                  origin: { y: 0.6 },
                });

                // Award points to authenticated user
                const me = state.leaderboard.find((p: ServerParticipant) => p.userId === profile?.uid);
                if (me && me.score > 0) {
                  updateQuizProgress(me.score);
                }
                break;
              }

              case 'tournament_reset': {
                const { state } = data;
                setRoomStatus('lobby');
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setHasSubmitted(false);
                setSubmissionFeedback(null);
                if (state.leaderboard) setLeaderboard(state.leaderboard);
                break;
              }

              case 'fellowship_reaction': {
                setLiveReactions((prev) => [
                  ...prev.slice(-6),
                  { id: data.id, emoji: data.emoji, from: data.senderName },
                ]);
                break;
              }

              default:
                break;
            }
          } catch (err) {
            console.error('WebSocket payload parsing error:', err);
          }
        };

        ws.onerror = (e) => {
          if (!isMounted) return;
          console.warn('WebSocket connection error:', e);
          setConnectionError('Reconnecting to server...');
          setWsConnected(false);
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setWsConnected(false);
          setConnectionError('Connection closed. Reconnecting...');
          reconnectTimerRef.current = setTimeout(() => {
            if (isMounted) connectWebSocket();
          }, 2500);
        };
      } catch (err) {
        if (!isMounted) return;
        setConnectionError('Failed to establish WebSocket connection');
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId, profile?.uid]);

  // Send answer submission to the server
  const handleSelectOption = (index: number) => {
    if (hasSubmitted || roomStatus !== 'active' || roundTimerSeconds <= 0) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    setSelectedOption(index);
    setHasSubmitted(true);
    setSubmissionFeedback('Securing submission...');

    wsRef.current.send(
      JSON.stringify({
        type: 'submit_answer',
        roomId,
        userId: profile?.uid || 'guest-user',
        questionIndex: currentQuestionIndex,
        selectedOption: index,
      })
    );
  };

  // Start tournament via server-authoritative command
  const handleStartTournament = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: 'start_competition',
        roomId,
      })
    );
  };

  // Reset tournament (for replay / admin reset)
  const handleResetTournament = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: 'admin_restart_tournament',
        roomId,
      })
    );
  };

  // Send emoji reaction across WebSocket to all participants
  const handleSendReaction = (emoji: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: 'fellowship_reaction',
        roomId,
        emoji,
        senderName: profile?.displayName?.split(' ')[0] || 'Believer',
      })
    );
  };

  const isRevealing = roomStatus === 'reveal';
  const isCompleted = roomStatus === 'completed';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header & Sync Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('competitions')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Leave Room</span>
          </button>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-white">{comp.title}</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
              {comp.category}
            </span>
          </div>
        </div>

        {/* Server Authoritative Live Status Indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              wsConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300 animate-pulse'
            }`}
          >
            {wsConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{wsConnected ? 'Server Authoritative Sync' : connectionError || 'Connecting...'}</span>
          </div>

          {isAdmin && (
            <button
              onClick={handleResetTournament}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-purple-300 bg-purple-950/60 border border-purple-500/30 hover:bg-purple-900/40"
              title="Reset competition state on server"
            >
              Reset Room
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Game Stage + Live Synchronized Scoreboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Competition Stage */}
        <div className="lg:col-span-2 space-y-6">
          {/* LOBBY VIEW */}
          {roomStatus === 'lobby' && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Live Competition Arena
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
                  Believers are currently gathering in the room. When started, everyone will receive
                  the exact same questions synchronized by the central server timer.
                </p>
              </div>

              {/* Lobby participants preview */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-md mx-auto">
                <p className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{participantCount} Participant{participantCount > 1 ? 's' : ''} in Room</span>
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {leaderboard.map((p) => (
                    <span
                      key={p.userId}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      {p.displayName} ({p.country})
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  disabled={!wsConnected}
                  onClick={handleStartTournament}
                  className="px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20 transition-all hover:scale-105 flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Launch Live Round</span>
                </button>
                <p className="text-[11px] text-slate-500 mt-2">
                  Server-side countdown will coordinate all participants simultaneously.
                </p>
              </div>
            </div>
          )}

          {/* ACTIVE & REVEAL ROUND VIEW */}
          {(roomStatus === 'active' || roomStatus === 'reveal') && currentQuestion && (
            <div className="space-y-4">
              {/* Synchronized Timer & Question Progress */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Question Progress
                  </span>
                  <p className="text-xs font-bold text-white">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </p>
                </div>

                {/* Authoritative Server Countdown */}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs font-bold border transition-all ${
                    isRevealing
                      ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                      : roundTimerSeconds <= 5
                      ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-slate-950 border-amber-500/40 text-amber-300'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>
                    {isRevealing
                      ? `Next question in ${revealTimerSeconds}s`
                      : `${roundTimerSeconds}s round timer`}
                  </span>
                </div>
              </div>

              {/* Question Card */}
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative">
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">
                    Round {currentQuestionIndex + 1}
                  </span>
                  <h3 className="font-serif text-lg sm:text-2xl font-bold text-white leading-relaxed">
                    {currentQuestion.questionText}
                  </h3>
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isRevealedCorrect =
                      isRevealing && currentQuestion.correctAnswerIndex === idx;

                    let btnClass =
                      'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-amber-500/40';

                    if (isRevealing) {
                      if (isRevealedCorrect) {
                        btnClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                      } else if (isSelected) {
                        btnClass = 'bg-rose-950/60 border-rose-500 text-rose-300';
                      } else {
                        btnClass = 'bg-slate-950/30 border-slate-850 opacity-40';
                      }
                    } else if (isSelected) {
                      btnClass = 'bg-amber-950/50 border-amber-400 text-amber-200';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={hasSubmitted || isRevealing || roundTimerSeconds <= 0}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-4 rounded-2xl border text-sm sm:text-base transition-all flex items-center justify-between ${btnClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-slate-800/80 text-xs font-semibold flex items-center justify-center text-slate-300 border border-slate-700">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isRevealing && isRevealedCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        )}
                        {isRevealing && isSelected && !isRevealedCorrect && (
                          <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Submission State Banner */}
                {hasSubmitted && !isRevealing && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{submissionFeedback || 'Answer submitted'}</span>
                    </span>
                    <span className="text-slate-400">Waiting for round timer reveal</span>
                  </div>
                )}

                {/* Server Reveal Explanation Card */}
                {isRevealing && currentQuestion.explanation && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5 text-xs animate-in fade-in">
                    <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Scripture: {currentQuestion.scriptureReference}</span>
                    </p>
                    <p className="text-slate-300 leading-relaxed">{currentQuestion.explanation}</p>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Server advancing round automatically...
                    </p>
                  </div>
                )}
              </div>

              {/* Live Fellowship Emojis */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Send Fellowship Amen to Room:
                </span>
                <div className="flex items-center gap-2">
                  {['🙏', '✝️', '🕊️', '📖', '🔥', '❤️'].map((em) => (
                    <button
                      key={em}
                      onClick={() => handleSendReaction(em)}
                      className="p-1.5 rounded-lg text-lg hover:scale-125 transition-transform bg-slate-950 border border-slate-800"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PODIUM VIEW */}
          {isCompleted && (
            <div className="rounded-3xl bg-slate-900 border border-amber-500/30 p-8 sm:p-12 text-center space-y-8 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-amber-500/20">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h2 className="font-serif text-3xl font-bold text-white">
                  Tournament Completed!
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2">
                  “I have fought the good fight, I have finished the race, I have kept the faith.” — 2 Timothy 4:7
                </p>
              </div>

              {/* Podium Display (Top 3) */}
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-4 items-end">
                {/* 2nd Place */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="text-lg">🥈</span>
                  <p className="font-semibold text-xs text-white truncate">
                    {leaderboard[1]?.displayName || 'Participant'}
                  </p>
                  <p className="text-[11px] text-amber-300 font-bold">
                    {leaderboard[1]?.score || 0} pts
                  </p>
                  <span className="inline-block text-[10px] text-slate-500">2nd Place</span>
                </div>

                {/* 1st Place */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/20 to-slate-950 border border-amber-500/50 text-center space-y-1 shadow-lg">
                  <span className="text-2xl">👑</span>
                  <p className="font-bold text-sm text-amber-200 truncate">
                    {leaderboard[0]?.displayName || 'Champion'}
                  </p>
                  <p className="text-xs text-amber-300 font-extrabold">
                    {leaderboard[0]?.score || 0} pts
                  </p>
                  <span className="inline-block text-[11px] font-semibold text-amber-400">
                    Champion
                  </span>
                </div>

                {/* 3rd Place */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="text-lg">🥉</span>
                  <p className="font-semibold text-xs text-white truncate">
                    {leaderboard[2]?.displayName || 'Participant'}
                  </p>
                  <p className="text-[11px] text-amber-300 font-bold">
                    {leaderboard[2]?.score || 0} pts
                  </p>
                  <span className="inline-block text-[10px] text-slate-500">3rd Place</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleResetTournament}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Tournament</span>
                </button>
                <button
                  onClick={() => onNavigate('competitions')}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20"
                >
                  Return to Arena
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Authoritative Synchronized Leaderboard & Reactions */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Live Leaderboard</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                Live Server
              </span>
            </div>

            <div className="space-y-2.5">
              {leaderboard.map((p, idx) => {
                const isCurrentUser = p.userId === (profile?.uid || 'guest-user');
                return (
                  <div
                    key={p.userId}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                      isCurrentUser
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 text-center font-bold text-amber-400">#{idx + 1}</span>
                      <div className="truncate">
                        <p className="font-semibold text-white truncate">
                          {p.displayName} {isCurrentUser && '(You)'}
                        </p>
                        <p className="text-[10px] text-slate-400">{p.country}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-amber-300 font-mono">{p.score} pts</span>
                      <p className="text-[10px] text-slate-500">{p.correctCount} correct</p>
                    </div>
                  </div>
                );
              })}

              {leaderboard.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  Waiting for participants to join...
                </div>
              )}
            </div>
          </div>

          {/* Live Reactions Ticker */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Broadcasted Fellowship Reactions
            </span>
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {liveReactions.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-xs animate-in fade-in"
                >
                  <span>{r.emoji}</span>
                  <span className="text-[10px] text-slate-400">{r.from}</span>
                </span>
              ))}
              {liveReactions.length === 0 && (
                <span className="text-[11px] text-slate-500 italic">No reactions sent yet...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
