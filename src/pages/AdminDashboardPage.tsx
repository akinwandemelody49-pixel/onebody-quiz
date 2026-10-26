import React, { useState } from 'react';
import {
  Shield,
  BookOpen,
  Trophy,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Eye,
  BarChart3,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEED_QUIZZES, SEED_COMPETITIONS } from '../lib/seedData';
import { Quiz, Competition, ModerationReport, QuizDifficulty } from '../types';
import { QuestionBankManager } from '../components/admin/QuestionBankManager';

interface AdminDashboardPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'question_bank' | 'quizzes' | 'competitions' | 'moderation'>('stats');

  const [quizzesList, setQuizzesList] = useState<Quiz[]>(SEED_QUIZZES);
  const [competitionsList, setCompetitionsList] = useState<Competition[]>(SEED_COMPETITIONS);

  // Moderation queue
  const [reports, setReports] = useState<ModerationReport[]>([
    {
      id: 'rep-1',
      reporterId: 'u-1',
      reporterName: 'Sister Grace Ndidi',
      reportedItemType: 'message',
      reportedItemId: 'msg-spam-1',
      reason: 'Unsolicited promotional links not related to Christian fellowship',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'rep-2',
      reporterId: 'u-2',
      reporterName: 'Brother David',
      reportedItemType: 'user',
      reportedItemId: 'u-troll',
      reason: 'Disrespectful debate in the Bible questions channel',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
  ]);

  // Create Quiz Form Modal state
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizCategory, setNewQuizCategory] = useState('Old Testament');
  const [newQuizDifficulty, setNewQuizDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [newQuizDesc, setNewQuizDesc] = useState('');

  // Create Competition Form Modal state
  const [showCreateCompModal, setShowCreateCompModal] = useState(false);
  const [newCompTitle, setNewCompTitle] = useState('');
  const [newCompDesc, setNewCompDesc] = useState('');
  const [newCompCategory, setNewCompCategory] = useState('New Testament');
  const [newCompDifficulty, setNewCompDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [newCompHours, setNewCompHours] = useState(6);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Lock className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">
          This portal is restricted to authorized administrators and spiritual moderators.
        </p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim()) return;

    const newQuiz: Quiz = {
      id: `quiz-custom-${Date.now()}`,
      title: newQuizTitle.trim(),
      description: newQuizDesc.trim() || 'Biblical quiz designed by fellowship leadership.',
      category: newQuizCategory as any,
      difficulty: newQuizDifficulty,
      timePerQuestionSeconds: 25,
      pointsPerQuestion: 100,
      questionCount: 5,
      isPublished: true,
      createdBy: profile?.uid || 'admin',
      createdByName: profile?.displayName || 'Admin',
      createdAt: new Date().toISOString(),
    };

    setQuizzesList((prev) => [newQuiz, ...prev]);
    setShowCreateQuizModal(false);
    setNewQuizTitle('');
    setNewQuizDesc('');
  };

  const handleCreateCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompTitle.trim()) return;

    const newComp: Competition = {
      id: `comp-custom-${Date.now()}`,
      title: newCompTitle.trim(),
      description: newCompDesc.trim() || 'Worldwide synchronized tournament.',
      category: newCompCategory as any,
      difficulty: newCompDifficulty,
      startTime: new Date(Date.now() + 1000 * 60 * 60 * newCompHours).toISOString(),
      durationMinutes: 20,
      participantLimit: 500,
      status: 'upcoming',
      currentQuestionIndex: 0,
      createdBy: profile?.uid || 'admin',
      createdByName: profile?.displayName || 'Admin',
      participantCount: 1,
      createdAt: new Date().toISOString(),
    };

    setCompetitionsList((prev) => [newComp, ...prev]);
    setShowCreateCompModal(false);
    setNewCompTitle('');
    setNewCompDesc('');
  };

  const handleModerateReport = (reportId: string, action: 'reviewed' | 'dismissed') => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: action } : r))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Platform Administration & Stewardship</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
            OneBody Administrator Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Oversee Scripture content, coordinate live competitions, review reports, and nurture a Christ-honoring community.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 font-semibold">
            Admin: {profile?.email}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'stats'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Platform Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('question_bank')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'question_bank'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Bible Question Bank (105)</span>
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'quizzes'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage Quizzes ({quizzesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('competitions')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'competitions'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Live Tournaments ({competitionsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'moderation'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Moderation Queue ({reports.filter((r) => r.status === 'pending').length})</span>
        </button>
      </div>

      {/* Tab: Platform Metrics */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400">Total Active Believers</p>
              <p className="text-2xl font-bold text-white">1,480</p>
              <p className="text-[10px] text-emerald-400">+12% this week</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400">Nations Represented</p>
              <p className="text-2xl font-bold text-amber-300">124</p>
              <p className="text-[10px] text-slate-400">Across all 6 continents</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400">Quiz Questions Answered</p>
              <p className="text-2xl font-bold text-white">42,850</p>
              <p className="text-[10px] text-emerald-400">84.2% average accuracy</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400">Prayers Lifted Together</p>
              <p className="text-2xl font-bold text-rose-400">3,120</p>
              <p className="text-[10px] text-slate-400">148 answered testimonies</p>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h3 className="font-serif font-bold text-base text-white">
              System Architecture & Health
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-400">Firebase Firestore</p>
                <p className="font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected & Deployed
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-400">Security Rules Version</p>
                <p className="font-bold text-white mt-1">Rule Engine v2 (ABAC Hardened)</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-400">Real-Time WebSocket Sync</p>
                <p className="font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized Room State Active
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Question Bank Management */}
      {activeTab === 'question_bank' && <QuestionBankManager />}

      {/* Tab: Quizzes Management */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Create, edit, and review Bible quizzes across categories.</p>
            <button
              onClick={() => setShowCreateQuizModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Bible Quiz</span>
            </button>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-950/60">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {quizzesList.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 font-semibold text-white">{q.title}</td>
                    <td className="py-3 px-4 text-slate-300">{q.category}</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{q.questionCount} Qs</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                        Published
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate('quiz-play', { id: q.id })}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 hover:bg-slate-800"
                      >
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Competitions Management */}
      {activeTab === 'competitions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Schedule and launch live worldwide tournaments.</p>
            <button
              onClick={() => setShowCreateCompModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Tournament</span>
            </button>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-950/60">
                  <th className="py-3 px-4">Tournament Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Scheduled Start</th>
                  <th className="py-3 px-4">Participants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {competitionsList.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 font-semibold text-white">{comp.title}</td>
                    <td className="py-3 px-4 text-slate-300">{comp.category}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(comp.startTime).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{comp.participantCount} registered</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        {comp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate('live-room', { id: comp.id })}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300"
                      >
                        Enter Room
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Moderation Reports */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">Review reported messages and maintain spiritual integrity.</p>
          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-rose-400 uppercase tracking-wider text-[10px]">
                      Reported {rep.reportedItemType}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">By {rep.reporterName}</span>
                    <span className="text-slate-500">•</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rep.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">Reason: “{rep.reason}”</p>
                  <p className="text-slate-500 text-[11px]">Item ID: {rep.reportedItemId}</p>
                </div>

                {rep.status === 'pending' && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleModerateReport(rep.id, 'dismissed')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleModerateReport(rep.id, 'reviewed')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500"
                    >
                      Take Action & Hide
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="font-serif font-bold text-lg text-white">Create New Bible Quiz</h3>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  placeholder="e.g. The Gospel of John: Signs & Wonders"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newQuizCategory}
                  onChange={(e) => setNewQuizCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="Old Testament">Old Testament</option>
                  <option value="New Testament">New Testament</option>
                  <option value="Life and teachings of Jesus">Life and teachings of Jesus</option>
                  <option value="Parables of Jesus">Parables of Jesus</option>
                  <option value="Bible characters">Bible characters</option>
                  <option value="Books of the Bible">Books of the Bible</option>
                  <option value="Biblical history">Biblical history</option>
                  <option value="Christian living">Christian living</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Difficulty</label>
                <select
                  value={newQuizDifficulty}
                  onChange={(e) => setNewQuizDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newQuizDesc}
                  onChange={(e) => setNewQuizDesc(e.target.value)}
                  placeholder="Brief synopsis of what questions will cover..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateQuizModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300"
                >
                  Publish Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Competition Modal */}
      {showCreateCompModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="font-serif font-bold text-lg text-white">Schedule Live Tournament</h3>
            <form onSubmit={handleCreateCompetition} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tournament Title</label>
                <input
                  type="text"
                  required
                  value={newCompTitle}
                  onChange={(e) => setNewCompTitle(e.target.value)}
                  placeholder="e.g. World Nations Epistle Championship"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newCompCategory}
                  onChange={(e) => setNewCompCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="New Testament">New Testament</option>
                  <option value="Old Testament">Old Testament</option>
                  <option value="Parables of Jesus">Parables of Jesus</option>
                  <option value="Bible characters">Bible characters</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Starts In (Hours from now)</label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={newCompHours}
                  onChange={(e) => setNewCompHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newCompDesc}
                  onChange={(e) => setNewCompDesc(e.target.value)}
                  placeholder="Rules, live sync guidelines, and prizes..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCompModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300"
                >
                  Publish Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
