import React, { useState, useEffect } from 'react';
import {
  Heart,
  Plus,
  Sparkles,
  CheckCircle2,
  Lock,
  Globe2,
  Share2,
  MessageCircle,
  BookOpen,
  Filter,
  Radio
} from 'lucide-react';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { PrayerRequest } from '../types';

interface PrayerFellowshipPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const PrayerFellowshipPage: React.FC<PrayerFellowshipPageProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'answered' | 'my-prayers'>('all');
  const [showModal, setShowModal] = useState(false);

  // New prayer request form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Healing & Health');
  const [isPublic, setIsPublic] = useState(true);

  // Mock authentic prayer requests from believers around the world
  const [requests, setRequests] = useState<PrayerRequest[]>([
    {
      id: 'pr-1',
      userId: 'u-1',
      userName: 'Sister Ruth Adenike',
      userCountry: 'Nigeria',
      title: 'Praying for open doors for Bible mission in rural schools',
      description: 'Our fellowship is preparing to visit 4 remote schools with Bibles and learning materials. Praying for receptive hearts and safe travel.',
      category: 'Missions & Outreach',
      isPublic: true,
      isAnswered: false,
      prayerCount: 28,
      prayingUserIds: ['u-2', 'u-3'],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'pr-2',
      userId: 'u-2',
      userName: 'Brother Caleb Miller',
      userCountry: 'United States',
      title: 'Healing for my father recovering from bypass surgery',
      description: 'Please stand with our family in prayer for peaceful healing and full recovery of strength.',
      category: 'Healing & Health',
      isPublic: true,
      isAnswered: true,
      answeredTestimony: 'Praise the Lord! The surgeon gave a wonderful report yesterday. Healing ahead of schedule!',
      prayerCount: 45,
      prayingUserIds: ['u-1', 'u-4'],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'pr-3',
      userId: 'u-3',
      userName: 'Sister Min-ji',
      userCountry: 'South Korea',
      title: 'Wisdom for university entrance examinations and spiritual discernment',
      description: 'Seeking God’s peace in the midst of intense exams, that I may glorify Him in all study and decisions.',
      category: 'Wisdom & Guidance',
      isPublic: true,
      isAnswered: false,
      prayerCount: 19,
      prayingUserIds: ['u-1'],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ]);

  // Synchronize prayer requests from Cloud Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'prayerRequests'), orderBy('createdAt', 'desc'), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const remoteList: PrayerRequest[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteList.push({
              id: docSnap.id,
              userId: data.userId || 'anon',
              userName: data.userName || 'Believer',
              userCountry: data.userCountry || 'Global',
              userAvatar: data.userAvatar || undefined,
              title: data.title || '',
              description: data.description || '',
              category: data.category || 'General Prayer',
              isPublic: data.isPublic !== false,
              isAnswered: Boolean(data.isAnswered),
              answeredTestimony: data.answeredTestimony || undefined,
              prayerCount: data.prayerCount || 0,
              prayingUserIds: data.prayingUserIds || [],
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });

          setRequests((prev) => {
            const remoteIds = new Set(remoteList.map((r) => r.id));
            const preservedSeeds = prev.filter((r) => !remoteIds.has(r.id) && r.id.startsWith('pr-'));
            return [...remoteList, ...preservedSeeds];
          });
        }
      }, (err) => {
        console.warn('Firestore prayer onSnapshot notice:', err.message);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore prayer subscription notice:', err);
    }
  }, []);

  const handlePrayTogether = async (id: string) => {
    if (!profile) {
      onNavigate('login');
      return;
    }

    let updatedPrayerCount = 1;
    let updatedPrayingIds: string[] = [];

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const alreadyPrayed = r.prayingUserIds?.includes(profile.uid);
        updatedPrayingIds = alreadyPrayed
          ? (r.prayingUserIds || []).filter((uid) => uid !== profile.uid)
          : [...(r.prayingUserIds || []), profile.uid];
        updatedPrayerCount = Math.max(0, alreadyPrayed ? r.prayerCount - 1 : r.prayerCount + 1);

        return {
          ...r,
          prayerCount: updatedPrayerCount,
          prayingUserIds: updatedPrayingIds,
        };
      })
    );

    // If it's a Firestore document (non-seed)
    if (!id.startsWith('pr-')) {
      try {
        await updateDoc(doc(db, 'prayerRequests', id), {
          prayerCount: updatedPrayerCount,
          prayingUserIds: updatedPrayingIds,
        });
      } catch (err) {
        console.warn('Firestore prayer update notice:', err);
      }
    }
  };

  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    if (!profile) {
      onNavigate('login');
      return;
    }

    const prayerData = {
      userId: profile.uid,
      userName: profile.displayName,
      userCountry: profile.country || 'Global',
      userAvatar: profile.photoURL || '',
      title: title.trim(),
      description: description.trim(),
      category,
      isPublic,
      isAnswered: false,
      prayerCount: 1,
      prayingUserIds: [profile.uid],
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    };

    const optimistic: PrayerRequest = {
      id: `local-${Date.now()}`,
      ...prayerData,
    };

    setRequests((prev) => [optimistic, ...prev]);
    setShowModal(false);
    setTitle('');
    setDescription('');

    try {
      await addDoc(collection(db, 'prayerRequests'), prayerData);
    } catch (err) {
      console.warn('Prayer saved locally, Firestore persistence notice:', err);
    }
  };

  const handleMarkAnswered = async (id: string, testimonyText: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              isAnswered: true,
              answeredTestimony: testimonyText,
            }
          : r
      )
    );

    if (!id.startsWith('pr-')) {
      try {
        await updateDoc(doc(db, 'prayerRequests', id), {
          isAnswered: true,
          answeredTestimony: testimonyText,
        });
      } catch (err) {
        console.warn('Firestore prayer marked answered notice:', err);
      }
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'answered') return r.isAnswered;
    if (activeTab === 'my-prayers') return r.userId === profile?.uid;
    return r.isPublic || r.userId === profile?.uid;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-2">
            <Heart className="w-3.5 h-3.5" />
            <span>Community Intercession & Praise</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
            Prayer Wall & Testimonies
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            “Pray one for another, that ye may be healed. The effectual fervent prayer of a righteous man availeth much.” — James 5:16
          </p>
        </div>

        <button
          onClick={() => {
            if (!profile) {
              onNavigate('login');
            } else {
              setShowModal(true);
            }
          }}
          className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Prayer Request</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('answered')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'answered'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Answered Testimonies ({requests.filter((r) => r.isAnswered).length})
        </button>
        {profile && (
          <button
            onClick={() => setActiveTab('my-prayers')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'my-prayers'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Prayer Items
          </button>
        )}
      </div>

      {/* Prayer Requests Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRequests.map((req) => {
          const hasPrayed = profile ? req.prayingUserIds?.includes(profile.uid) : false;
          const isOwner = profile?.uid === req.userId;

          return (
            <div
              key={req.id}
              className={`rounded-3xl bg-slate-900 border p-6 flex flex-col justify-between transition-all space-y-4 shadow-xl ${
                req.isAnswered
                  ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-900'
                  : 'border-slate-800 hover:border-amber-500/30'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                    {req.category}
                  </span>

                  <div className="flex items-center gap-2">
                    {req.isPublic ? (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Globe2 className="w-3 h-3 text-slate-500" />
                        <span>Public</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Private</span>
                      </span>
                    )}

                    {req.isAnswered && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Answered!</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-white leading-snug">
                  {req.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {req.description}
                </p>

                {/* Answered Testimony Banner if present */}
                {req.isAnswered && req.answeredTestimony && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1 text-xs">
                    <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Testimony of Praise:</span>
                    </p>
                    <p className="text-emerald-100/90 leading-relaxed italic">
                      “{req.answeredTestimony}”
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer: Author & Pray Action */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400 border border-slate-700 text-xs">
                    {req.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{req.userName}</p>
                    <p className="text-[10px] text-slate-500">{req.userCountry || 'Worldwide'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner && !req.isAnswered && (
                    <button
                      onClick={() => {
                        const note = prompt('Share a brief testimony of how God answered this prayer:');
                        if (note) handleMarkAnswered(req.id, note);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/40"
                    >
                      Mark Answered
                    </button>
                  )}

                  <button
                    onClick={() => handlePrayTogether(req.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      hasPrayed
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasPrayed ? 'fill-rose-400 text-rose-400' : 'text-slate-400'}`} />
                    <span>{req.prayerCount} Praying</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Prayer Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                <span>Submit Prayer Request</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreatePrayer} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prayer Focus / Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Healing for sister Maria in hospital"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="Healing & Health">Healing & Health</option>
                  <option value="Missions & Outreach">Missions & Outreach</option>
                  <option value="Family & Children">Family & Children</option>
                  <option value="Wisdom & Guidance">Wisdom & Guidance</option>
                  <option value="Financial & Provision">Financial & Provision</option>
                  <option value="Spiritual Renewal">Spiritual Renewal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description & Scripture
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share details for brothers and sisters to lift in prayer..."
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Privacy Setting */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Public to Community Wall</p>
                  <p className="text-[11px] text-slate-400">
                    {isPublic
                      ? 'Visible to brothers and sisters worldwide to join in prayer.'
                      : 'Private (only visible in your personal prayer list and to pastors/moderators).'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    isPublic ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isPublic ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20"
                >
                  Share Prayer Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
