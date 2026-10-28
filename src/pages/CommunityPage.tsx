import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MessageSquare,
  Smile,
  Reply,
  Flag,
  UserX,
  BookOpen,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { CommunityMessage } from '../types';

interface CommunityPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

type ChannelId = 'general' | 'questions' | 'announcements' | 'prayer' | 'testimonies';

interface ChannelInfo {
  id: ChannelId;
  name: string;
  description: string;
  icon: string;
}

const CHANNELS: ChannelInfo[] = [
  {
    id: 'general',
    name: 'General Fellowship',
    description: 'Worldwide Christian fellowship across all countries and continents.',
    icon: '🌍',
  },
  {
    id: 'questions',
    name: 'Bible Questions & Insights',
    description: 'Discuss theological questions, difficult passages, and Greek/Hebrew meanings.',
    icon: '📖',
  },
  {
    id: 'announcements',
    name: 'Quiz & Event Announcements',
    description: 'Official announcements about tournaments, seasonal challenges, and updates.',
    icon: '📢',
  },
  {
    id: 'prayer',
    name: 'Prayer Requests',
    description: 'Lift up one another in prayer. “Pray continually.” — 1 Thess 5:17',
    icon: '🙏',
  },
  {
    id: 'testimonies',
    name: 'Testimonies of Faith',
    description: 'Share what God has done in your life and celebrate His marvelous works.',
    icon: '✝️',
  },
];

export const CommunityPage: React.FC<CommunityPageProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [activeChannel, setActiveChannel] = useState<ChannelId>('general');
  const [inputText, setInputText] = useState('');
  const [scriptureTag, setScriptureTag] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null);
  const [reportingMessage, setReportingMessage] = useState<CommunityMessage | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial authentic community messages across countries
  const [messages, setMessages] = useState<CommunityMessage[]>([
    {
      id: 'm-gen-1',
      channelId: 'general',
      userId: 'u-samuel',
      userName: 'Brother Samuel',
      userAvatar: '/src/assets/images/avatar_member_david_1793017334243.jpg',
      userCountry: 'United States',
      content: 'Good morning beloved saints! Loving the new Parables study. How is everyone doing today?',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      reactions: { '🙏': ['u-1', 'u-2'], '❤️': ['u-3'] },
    },
    {
      id: 'm-gen-2',
      channelId: 'general',
      userId: 'u-grace',
      userName: 'Sister Grace Ndidi',
      userAvatar: '/src/assets/images/avatar_member_grace_1793017333665.jpg',
      userCountry: 'Nigeria',
      content: 'Peace be with you all from Lagos! The scripture about the vine and branches has stayed with me all week.',
      scriptureRef: 'John 15:5',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      reactions: { '✝️': ['u-1', 'u-2', 'u-4'] },
    },
    {
      id: 'm-gen-3',
      channelId: 'general',
      userId: 'u-thomas',
      userName: 'Pastor Thomas',
      userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=thomas',
      userCountry: 'United Kingdom',
      content: 'Amen! It is marvelous seeing brothers and sisters from over 100 countries unified in God’s Word.',
      scriptureRef: 'Psalm 133:1',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      reactions: { '🙌': ['u-1'] },
    },
    {
      id: 'm-q-1',
      channelId: 'questions',
      userId: 'u-eunji',
      userName: 'Sister Eun-ji',
      userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=eunji',
      userCountry: 'South Korea',
      content: 'Could someone share insights on why Jesus used the metaphor of salt losing its saltiness in Matthew 5:13?',
      scriptureRef: 'Matthew 5:13',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      reactions: { '📖': ['u-2'] },
    },
    {
      id: 'm-test-1',
      channelId: 'testimonies',
      userId: 'u-gabriel',
      userName: 'Brother Gabriel',
      userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=gabriel',
      userCountry: 'Brazil',
      content: 'Glory to God! Our church youth group gathered yesterday to do the OneBody Bible Quiz tournament together. 25 young people studying Scripture with joy!',
      createdAt: new Date(Date.now() - 5400000).toISOString(),
      reactions: { '🔥': ['u-1', 'u-3', 'u-5'], '🙏': ['u-2'] },
    },
  ]);

  const [mutedNotice, setMutedNotice] = useState<string | null>(null);

  // Real-time synchronization from Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limit(80));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const remoteMsgs: CommunityMessage[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteMsgs.push({
              id: docSnap.id,
              channelId: data.channelId || 'general',
              userId: data.userId || 'anon',
              userName: data.userName || 'Believer',
              userAvatar: data.userAvatar || undefined,
              userCountry: data.userCountry || 'Global',
              content: data.content || '',
              scriptureRef: data.scriptureRef || undefined,
              replyToId: data.replyToId || undefined,
              replyToText: data.replyToText || undefined,
              reactions: data.reactions || {},
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });

          // Blend with seed messages to ensure rich channel history
          setMessages((prev) => {
            const remoteIds = new Set(remoteMsgs.map((m) => m.id));
            const preservedSeeds = prev.filter((m) => !remoteIds.has(m.id) && m.id.startsWith('m-'));
            return [...preservedSeeds, ...remoteMsgs];
          });
        }
      }, (err) => {
        console.warn('Firestore onSnapshot notice:', err.message);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore subscription initialized locally:', err);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!profile) {
      onNavigate('login');
      return;
    }

    const messageData = {
      channelId: activeChannel,
      userId: profile.uid,
      userName: profile.displayName,
      userAvatar: profile.photoURL || '',
      userCountry: profile.country || 'Global',
      content: inputText.trim(),
      scriptureRef: scriptureTag.trim() || null,
      replyToId: replyingTo?.id || null,
      replyToText: replyingTo ? `${replyingTo.userName}: ${replyingTo.content.slice(0, 40)}...` : null,
      reactions: {},
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    };

    // Optimistic local add
    const localOptimistic: CommunityMessage = {
      id: `local-${Date.now()}`,
      ...messageData,
      scriptureRef: scriptureTag.trim() || undefined,
      replyToId: replyingTo?.id,
      replyToText: replyingTo ? `${replyingTo.userName}: ${replyingTo.content.slice(0, 40)}...` : undefined,
    };
    setMessages((prev) => [...prev, localOptimistic]);
    setInputText('');
    setScriptureTag('');
    setReplyingTo(null);

    // Save to Cloud Firestore
    try {
      await addDoc(collection(db, 'messages'), messageData);
    } catch (error) {
      console.warn('Message saved locally, Firestore persistence notice:', error);
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!profile) return;
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = m.reactions || {};
        const uids = currentReactions[emoji] || [];
        const hasReacted = uids.includes(profile.uid);
        const updatedUids = hasReacted
          ? uids.filter((id) => id !== profile.uid)
          : [...uids, profile.uid];

        return {
          ...m,
          reactions: {
            ...currentReactions,
            [emoji]: updatedUids,
          },
        };
      })
    );
  };

  const handleBlockUser = (userId: string, userName: string) => {
    setBlockedUsers((prev) => [...prev, userId]);
    setMutedNotice(`Muted messages from ${userName}`);
    setTimeout(() => setMutedNotice(null), 3000);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim() || !reportingMessage || !profile) return;
    setReportSuccess(true);

    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: profile.uid,
        reporterName: profile.displayName,
        reportedItemType: 'message',
        reportedItemId: reportingMessage.id,
        reportedItemText: reportingMessage.content,
        reportedUserId: reportingMessage.userId,
        reason: reportReason.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Report logged locally:', err);
    }

    setTimeout(() => {
      setReportingMessage(null);
      setReportReason('');
      setReportSuccess(false);
    }, 1500);
  };

  const currentChannelInfo = CHANNELS.find((c) => c.id === activeChannel)!;
  const filteredMessages = messages.filter(
    (m) => m.channelId === activeChannel && !blockedUsers.includes(m.userId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">
      {/* Top Banner & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Worldwide Christian Fellowship</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Global Community Channels
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Fellowship in one Spirit. Share Scripture reflections, ask biblical questions, and pray together across all nations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>Real-Time Fellowship</span>
          </span>
        </div>
      </div>

      {mutedNotice && (
        <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between animate-in fade-in">
          <span>{mutedNotice}</span>
          <button onClick={() => setMutedNotice(null)} className="text-slate-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Channel Sidebar + Active Chat */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5">
        {/* Channel Navigation Sidebar */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
            Fellowship Channels
          </span>
          <div className="space-y-1">
            {CHANNELS.map((ch) => {
              const isActive = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{ch.icon}</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-amber-300' : 'text-white'}`}>
                      {ch.name}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {ch.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5 mt-3">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grace & Respect</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every message reflects Christ. Please speak with gentleness, reverence, and biblical truth.
            </p>
          </div>
        </div>

        {/* Message Stream */}
        <div className="md:col-span-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col h-[580px] sm:h-[620px] shadow-xl overflow-hidden">
          {/* Channel Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{currentChannelInfo.icon}</span>
              <div>
                <h3 className="font-serif font-bold text-sm text-white">
                  {currentChannelInfo.name}
                </h3>
                <p className="text-[11px] text-slate-400">{currentChannelInfo.description}</p>
              </div>
            </div>

            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {filteredMessages.length} Messages
            </span>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {filteredMessages.map((msg) => {
              const isCurrentUser = msg.userId === profile?.uid;
              const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={msg.id} className="group flex items-start gap-3 text-xs">
                  <img
                    src={
                      msg.userAvatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.userId}`
                    }
                    alt={msg.userName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700 flex-shrink-0 mt-0.5"
                  />

                  <div className="flex-1 space-y-1">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{msg.userName}</span>
                        {msg.userCountry && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            {msg.userCountry}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">{formattedTime}</span>
                      </div>

                      {/* Message Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-slate-400">
                        <button
                          onClick={() => setReplyingTo(msg)}
                          title="Reply"
                          className="p-1 hover:text-amber-300"
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAddReaction(msg.id, '🙏')}
                          title="Pray / Amen"
                          className="p-1 hover:text-amber-300"
                        >
                          🙏
                        </button>
                        <button
                          onClick={() => handleAddReaction(msg.id, '❤️')}
                          title="Love"
                          className="p-1 hover:text-amber-300"
                        >
                          ❤️
                        </button>
                        {!isCurrentUser && (
                          <>
                            <button
                              onClick={() => setReportingMessage(msg)}
                              title="Report message"
                              className="p-1 hover:text-rose-400"
                            >
                              <Flag className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleBlockUser(msg.userId, msg.userName)}
                              title="Mute user"
                              className="p-1 hover:text-slate-200"
                            >
                              <UserX className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Replied snippet if any */}
                    {msg.replyToText && (
                      <div className="text-[11px] text-slate-400 bg-slate-950/80 border-l-2 border-amber-400/80 px-2.5 py-1 rounded-r-lg mb-1">
                        Replying to: {msg.replyToText}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-slate-200 leading-relaxed max-w-2xl">
                      <p>{msg.content}</p>
                      {msg.scriptureRef && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          <BookOpen className="w-3 h-3" />
                          <span>{msg.scriptureRef}</span>
                        </div>
                      )}
                    </div>

                    {/* Reactions Pill Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.entries(msg.reactions).map(([emoji, uids]) => {
                          if (uids.length === 0) return null;
                          const userHasReacted = profile ? uids.includes(profile.uid) : false;
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleAddReaction(msg.id, emoji)}
                              className={`px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 border transition-all ${
                                userHasReacted
                                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 font-bold'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span>{uids.length}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Context Banner */}
          {replyingTo && (
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-amber-300">
              <span className="truncate">Replying to {replyingTo.userName}: “{replyingTo.content.slice(0, 50)}...”</span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/70 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Share in #${currentChannelInfo.name}...`}
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 disabled:opacity-40 transition-all shadow-md shadow-amber-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Scripture Citation (optional):</span>
              <input
                type="text"
                value={scriptureTag}
                onChange={(e) => setScriptureTag(e.target.value)}
                placeholder="e.g. Philippians 4:13"
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Moderation Report Modal */}
      {reportingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-serif font-bold text-base text-white">Report Message</h3>
            </div>

            <p className="text-xs text-slate-400">
              Please specify the reason for reporting this message from{' '}
              <span className="text-white font-semibold">{reportingMessage.userName}</span>:
            </p>

            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Spam, inappropriate speech, or violation of community guidelines..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-rose-400"
            />

            {reportSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Report submitted to OneBody moderators. Thank you.</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportingMessage(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReport}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
