import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Users,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  Shield,
  AlertCircle,
  CheckCircle2,
  Info,
  Key,
  ExternalLink,
  RefreshCw,
  User,
  Heart,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { Room, RoomEvent, Track, RemoteParticipant, RemoteTrack } from 'livekit-client';
import { useAuth } from '../context/AuthContext';

interface VoiceRoomsPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

interface VoiceRoomDef {
  id: string;
  name: string;
  description: string;
  category: 'fellowship' | 'study' | 'prayer' | 'quiz_debrief';
  icon: string;
  maxParticipants: number;
}

interface MicNotice {
  title: string;
  message: string;
  isPermissionDenied: boolean;
}

function parseMicrophoneError(err: unknown): MicNotice {
  const name = err instanceof Error ? err.name : '';
  const msg = err instanceof Error ? err.message : String(err);

  if (
    name === 'NotAllowedError' ||
    name === 'PermissionDeniedError' ||
    msg.toLowerCase().includes('permission denied') ||
    msg.toLowerCase().includes('permission dismissed') ||
    msg.toLowerCase().includes('not allowed')
  ) {
    return {
      title: 'Microphone Permission Denied',
      message:
        'Your browser has blocked microphone access for this site. Click the permissions or camera/microphone icon in your browser address bar to allow access, then click "Unmute Mic".',
      isPermissionDenied: true,
    };
  }

  if (
    name === 'NotFoundError' ||
    name === 'DevicesNotFoundError' ||
    msg.toLowerCase().includes('device not found') ||
    msg.toLowerCase().includes('requested device not found')
  ) {
    return {
      title: 'No Microphone Detected',
      message: 'No audio input hardware was found on your device. You are connected in listen-only mode.',
      isPermissionDenied: false,
    };
  }

  if (
    name === 'NotReadableError' ||
    name === 'TrackStartError' ||
    msg.toLowerCase().includes('in use') ||
    msg.toLowerCase().includes('hardware error')
  ) {
    return {
      title: 'Microphone In Use',
      message: 'Your microphone is currently in use by another app or system process. Free up the microphone and try unmuting.',
      isPermissionDenied: false,
    };
  }

  return {
    title: 'Microphone Access Issue',
    message: msg || 'Could not initialize microphone. You can still listen to the fellowship.',
    isPermissionDenied: false,
  };
}

const PRESET_VOICE_ROOMS: VoiceRoomDef[] = [
  {
    id: 'room-general-fellowship',
    name: 'General Fellowship Hall',
    description: 'Open Christian voice fellowship with brothers and sisters worldwide.',
    category: 'fellowship',
    icon: '🌍',
    maxParticipants: 50,
  },
  {
    id: 'room-group-prayer',
    name: 'Global Intercessory Prayer',
    description: 'Gather in agreement to lift up personal, church, and international prayer requests.',
    category: 'prayer',
    icon: '🙏',
    maxParticipants: 30,
  },
  {
    id: 'room-bible-study',
    name: 'Scripture Discussion & Exegesis',
    description: 'Discuss today’s Bible reading, Greek & Hebrew insights, and practical discipleship.',
    category: 'study',
    icon: '📖',
    maxParticipants: 25,
  },
  {
    id: 'room-post-quiz',
    name: 'Post-Competition Debrief',
    description: 'Discuss tournament questions, biblical references, and fellowship after live quizzes.',
    category: 'quiz_debrief',
    icon: '🏆',
    maxParticipants: 40,
  },
];

export const VoiceRoomsPage: React.FC<VoiceRoomsPageProps> = ({ onNavigate }) => {
  const { profile, isAdmin } = useAuth();

  const [serviceStatus, setServiceStatus] = useState<{ configured: boolean; url: string | null } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Active room state
  const [activeRoomDef, setActiveRoomDef] = useState<VoiceRoomDef | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [micNotice, setMicNotice] = useState<MicNotice | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeakingLocally, setIsSpeakingLocally] = useState(false);

  // Active participants list
  const [participants, setParticipants] = useState<{
    identity: string;
    name: string;
    isSpeaking: boolean;
    isMuted: boolean;
    isLocal: boolean;
  }[]>([]);

  // Local microphone volume meter for testing
  const [micVolumeLevel, setMicVolumeLevel] = useState(0);
  const [micTestActive, setMicTestActive] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const attachedAudioElements = useRef<HTMLMediaElement[]>([]);

  // Check server-side LiveKit configuration
  const checkLiveKitStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/livekit/status');
      const data = await res.json();
      setServiceStatus(data);
    } catch {
      setServiceStatus({ configured: false, url: null });
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkLiveKitStatus();

    return () => {
      leaveRoom();
      stopMicTest();
    };
  }, []);

  // Update deafened volume on attached remote audio elements
  useEffect(() => {
    attachedAudioElements.current.forEach((el) => {
      el.volume = isDeafened ? 0 : 1;
    });
  }, [isDeafened]);

  // Real local mic level test (runs even before LiveKit credentials are added)
  const startMicTest = async () => {
    try {
      setConnectionError(null);
      setMicNotice(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setConnectionError('Audio recording is not supported in this browser environment.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      setMicTestActive(true);

      const checkVolume = () => {
        if (!localStreamRef.current) return;
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        setMicVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
        setIsSpeakingLocally(avg > 15);
        requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (err: unknown) {
      console.warn('Local mic test failed:', err);
      const parsed = parseMicrophoneError(err);
      setConnectionError(`${parsed.title}: ${parsed.message}`);
      setMicTestActive(false);
    }
  };

  const stopMicTest = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicTestActive(false);
    setMicVolumeLevel(0);
    setIsSpeakingLocally(false);
  };

  // Join LiveKit voice room
  const handleJoinRoom = async (roomDef: VoiceRoomDef) => {
    if (!profile) {
      onNavigate('login');
      return;
    }

    setConnectionError(null);
    setMicNotice(null);
    setIsConnecting(true);
    stopMicTest();

    try {
      // 1. Request short-lived access token from our trusted server
      const tokenRes = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: roomDef.id,
          participantName: profile.displayName,
          identity: profile.uid,
          isHost: isAdmin,
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenData.configured) {
        setServiceStatus({ configured: false, url: null });
        setActiveRoomDef(roomDef);
        setIsConnecting(false);
        return;
      }

      // 2. Connect via livekit-client
      const lkRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      roomRef.current = lkRoom;

      // Register live room event listeners
      lkRoom.on(RoomEvent.Connected, () => {
        setIsConnecting(false);
        setActiveRoomDef(roomDef);
        updateParticipantsList(lkRoom);
      });

      lkRoom.on(RoomEvent.ParticipantConnected, () => updateParticipantsList(lkRoom));
      lkRoom.on(RoomEvent.ParticipantDisconnected, () => updateParticipantsList(lkRoom));
      lkRoom.on(RoomEvent.ActiveSpeakersChanged, () => updateParticipantsList(lkRoom));
      lkRoom.on(RoomEvent.TrackMuted, () => updateParticipantsList(lkRoom));
      lkRoom.on(RoomEvent.TrackUnmuted, () => updateParticipantsList(lkRoom));

      // Play remote participants' audio
      lkRoom.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          const el = track.attach();
          el.volume = isDeafened ? 0 : 1;
          attachedAudioElements.current.push(el);
        }
      });

      lkRoom.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          track.detach().forEach((el) => {
            attachedAudioElements.current = attachedAudioElements.current.filter((item) => item !== el);
          });
        }
      });

      lkRoom.on(RoomEvent.Disconnected, () => {
        setActiveRoomDef(null);
        setParticipants([]);
        setMicNotice(null);
      });

      // Connect to the LiveKit Cloud room
      await lkRoom.connect(tokenData.url, tokenData.token);
      setActiveRoomDef(roomDef);
      setIsConnecting(false);

      // 3. User initiated join: attempt to enable microphone
      try {
        await lkRoom.localParticipant.setMicrophoneEnabled(true);
        const micActive = lkRoom.localParticipant.isMicrophoneEnabled;
        setIsMuted(!micActive);
        setMicNotice(null);
      } catch (micErr: unknown) {
        console.warn('Microphone activation notice on room join:', micErr);
        const parsed = parseMicrophoneError(micErr);
        setMicNotice(parsed);
        setIsMuted(true);
      }

      updateParticipantsList(lkRoom);
    } catch (err: unknown) {
      console.error('Failed to connect to LiveKit voice room:', err);
      setConnectionError(
        err instanceof Error ? err.message : 'Could not establish audio connection to voice server.'
      );
      setIsConnecting(false);
      setActiveRoomDef(null);
    }
  };

  const updateParticipantsList = (room: Room) => {
    const list: {
      identity: string;
      name: string;
      isSpeaking: boolean;
      isMuted: boolean;
      isLocal: boolean;
    }[] = [];

    // Local participant
    list.push({
      identity: room.localParticipant.identity,
      name: room.localParticipant.name || 'You',
      isSpeaking: room.localParticipant.isSpeaking,
      isMuted: !room.localParticipant.isMicrophoneEnabled,
      isLocal: true,
    });

    // Remote participants
    room.remoteParticipants.forEach((rp: RemoteParticipant) => {
      const isAudioMuted = !rp.getTrackPublication(Track.Source.Microphone)?.isMuted === false;
      list.push({
        identity: rp.identity,
        name: rp.name || 'Brother/Sister in Christ',
        isSpeaking: rp.isSpeaking,
        isMuted: isAudioMuted,
        isLocal: false,
      });
    });

    setParticipants(list);
  };

  const toggleMute = async () => {
    if (!roomRef.current) return;
    try {
      if (isMuted) {
        // Explicit user action to enable microphone
        await roomRef.current.localParticipant.setMicrophoneEnabled(true);
        const active = roomRef.current.localParticipant.isMicrophoneEnabled;
        setIsMuted(!active);
        if (active) {
          setMicNotice(null);
        }
      } else {
        // Mute
        await roomRef.current.localParticipant.setMicrophoneEnabled(false);
        setIsMuted(true);
      }
      updateParticipantsList(roomRef.current);
    } catch (err: unknown) {
      console.warn('toggleMute error:', err);
      const parsed = parseMicrophoneError(err);
      setMicNotice(parsed);
      setIsMuted(true);
      if (roomRef.current) {
        updateParticipantsList(roomRef.current);
      }
    }
  };

  const leaveRoom = () => {
    if (roomRef.current) {
      attachedAudioElements.current.forEach((el) => {
        el.pause();
        el.remove();
      });
      attachedAudioElements.current = [];
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    setActiveRoomDef(null);
    setParticipants([]);
    setIsMuted(false);
    setMicNotice(null);
    setConnectionError(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5" />
            <span>Real-Time Voice Fellowship</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Live Christian Voice Rooms
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Gather in real-time audio rooms to pray together, study Scripture aloud, and encourage one another across continents.
          </p>
        </div>

        {/* LiveKit Service Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                serviceStatus?.configured ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300 font-mono text-[11px]">
              {serviceStatus?.configured ? 'LiveKit Cloud Connected' : 'LiveKit Setup Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {connectionError && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Voice Connection Notice</p>
            <p>{connectionError}</p>
          </div>
        </div>
      )}

      {/* Active Voice Call Stage if Connected */}
      {activeRoomDef && serviceStatus?.configured && (
        <div className="rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeRoomDef.icon}</span>
              <div>
                <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <span>{activeRoomDef.name}</span>
                  <span className="text-xs text-emerald-400 font-sans font-normal uppercase tracking-wider">
                    ● Connected Live
                  </span>
                </h2>
                <p className="text-xs text-slate-400">{activeRoomDef.description}</p>
              </div>
            </div>

            <button
              onClick={leaveRoom}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all flex items-center gap-1.5 shadow-md"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Leave Room</span>
            </button>
          </div>

          {/* Microphone Permission / Status Notice */}
          {micNotice && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-300">{micNotice.title}</p>
                  <p className="text-amber-200/90 text-[11px] leading-relaxed">{micNotice.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={toggleMute}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Unmute Mic</span>
                </button>
                <button
                  onClick={() => setMicNotice(null)}
                  className="px-2.5 py-1.5 rounded-xl text-xs text-amber-300 hover:text-white transition-all"
                  title="Dismiss notice and stay in listener mode"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Connected Participants Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {participants.map((p) => (
              <div
                key={p.identity}
                className={`p-4 rounded-2xl border transition-all text-center space-y-3 relative ${
                  p.isSpeaking
                    ? 'bg-emerald-950/40 border-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="relative w-14 h-14 mx-auto">
                  <div
                    className={`w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-white text-lg border ${
                      p.isSpeaking ? 'border-emerald-400 ring-2 ring-emerald-400/40' : 'border-slate-700'
                    }`}
                  >
                    {p.name.charAt(0)}
                  </div>
                  {p.isMuted && (
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-rose-600 text-white">
                      <MicOff className="w-3 h-3" />
                    </span>
                  )}
                  {p.isSpeaking && (
                    <span className="absolute -top-1 -right-1 p-1 rounded-full bg-emerald-400 text-slate-950 animate-bounce">
                      <Volume2 className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-xs text-white truncate">
                    {p.name} {p.isLocal && '(You)'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {p.isSpeaking ? 'Speaking...' : p.isMuted ? 'Muted' : 'Listening'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* In-Call Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isMuted
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
              </button>

              <button
                onClick={() => setIsDeafened(!isDeafened)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  isDeafened
                    ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span>
                {participants.length} of {activeRoomDef.maxParticipants} Members
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Setup Guide Panel if LiveKit credentials are not yet configured */}
      {!serviceStatus?.configured && !loadingStatus && (
        <div className="rounded-3xl bg-slate-900 border border-amber-500/30 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <Key className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                LiveKit Voice Server Configuration Required
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                OneBody uses **LiveKit Cloud** for browser-based, low-latency worldwide voice rooms.
                To enable live group audio, add your LiveKit credentials in the AI Studio Secrets panel.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-3 text-xs text-slate-300 font-mono">
            <p className="text-slate-400 font-sans text-xs font-semibold">
              Required Environment Variables in Secrets:
            </p>
            <div className="space-y-1">
              <p><span className="text-amber-400 font-bold">LIVEKIT_URL</span>="wss://your-project.livekit.cloud"</p>
              <p><span className="text-amber-400 font-bold">LIVEKIT_API_KEY</span>="API..."</p>
              <p><span className="text-amber-400 font-bold">LIVEKIT_API_SECRET</span>="sec_..."</p>
            </div>
            <p className="font-sans text-[11px] text-slate-400 pt-1">
              You can get free developer credentials instantly at{' '}
              <a
                href="https://cloud.livekit.io"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 underline inline-flex items-center gap-0.5"
              >
                cloud.livekit.io <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Real Local Hardware Microphone Testing Tool */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Browser Microphone Hardware Test</span>
              </div>
              <button
                onClick={micTestActive ? stopMicTest : startMicTest}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  micTestActive
                    ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {micTestActive ? 'Stop Mic Test' : 'Test My Microphone'}
              </button>
            </div>

            {micTestActive && (
              <div className="space-y-2 pt-1 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Input Signal Level:</span>
                  <span className={isSpeakingLocally ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {isSpeakingLocally ? '● Voice Detected' : 'Listening...'} ({micVolumeLevel}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-100 rounded-full"
                    style={{ width: `${micVolumeLevel}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Available Voice Rooms Catalog */}
      <div className="space-y-3.5">
        <h2 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-400" />
          <span>Active Fellowship Voice Rooms</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {PRESET_VOICE_ROOMS.map((room) => {
            const isCurrentlyActiveInThis = activeRoomDef?.id === room.id;

            return (
              <div
                key={room.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 p-5 flex flex-col justify-between transition-all space-y-3.5 shadow-md"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-xl">{room.icon}</span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Users className="w-3.5 h-3.5" /> Max {room.maxParticipants} Members
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-white">{room.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{room.description}</p>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Open Room</span>
                  </span>

                  <button
                    disabled={isConnecting}
                    onClick={() => handleJoinRoom(room)}
                    className="px-4 py-2 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isCurrentlyActiveInThis ? 'In Call' : 'Enter Voice Room'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
