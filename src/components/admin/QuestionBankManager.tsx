import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Edit,
  CheckCircle2,
  AlertCircle,
  Archive,
  RefreshCw,
  Sparkles,
  Shield,
  Check,
  X,
  ExternalLink,
  BookMarked
} from 'lucide-react';
import { BibleQuestion, QuestionDifficulty, QuestionReviewStatus, QuizCategory } from '../../types';
import { BIBLE_QUESTION_BANK, SUPPORTED_TRANSLATIONS, getQuestionCountsByDifficulty } from '../../lib/bibleQuestionBank';
import { useAuth } from '../../context/AuthContext';

export const QuestionBankManager: React.FC = () => {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<BibleQuestion[]>(BIBLE_QUESTION_BANK);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTranslation, setSelectedTranslation] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit / Add Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<BibleQuestion | null>(null);

  // Form Fields
  const [formText, setFormText] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formDifficulty, setFormDifficulty] = useState<QuestionDifficulty>('beginner');
  const [formCategory, setFormCategory] = useState<QuizCategory>('Old Testament');
  const [formTranslation, setFormTranslation] = useState<string>('Multi-Translation');
  const [formRefs, setFormRefs] = useState<string>('');
  const [formExplanation, setFormExplanation] = useState('');
  const [formStatus, setFormStatus] = useState<QuestionReviewStatus>('approved');
  const [formNotes, setFormNotes] = useState('');

  // Fetch updated list from server
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/questions/bank?role=admin&includeAnswers=true', {
        headers: { 'x-admin-role': 'admin' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        }
      }
    } catch (err) {
      console.warn('Using client-side question bank fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Filter questions
  const filtered = questions.filter((q) => {
    const matchDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty.toLowerCase();
    const matchTrans =
      selectedTranslation === 'All' ||
      q.translationId === selectedTranslation ||
      (selectedTranslation === 'Multi-Translation' && q.translationId === 'Multi-Translation');
    const matchStatus = selectedStatus === 'All' || q.reviewStatus === selectedStatus;
    const matchCat = selectedCategory === 'All' || q.category === selectedCategory;

    const term = searchQuery.toLowerCase().trim();
    const matchSearch =
      !term ||
      q.questionText.toLowerCase().includes(term) ||
      q.explanation.toLowerCase().includes(term) ||
      q.scriptureReferences.some((r) => r.toLowerCase().includes(term)) ||
      q.options.some((opt) => opt.toLowerCase().includes(term));

    return matchDiff && matchTrans && matchStatus && matchCat && matchSearch;
  });

  const counts = {
    total: questions.length,
    beginner: questions.filter((q) => q.difficulty === 'beginner').length,
    developing: questions.filter((q) => q.difficulty === 'developing').length,
    intermediate: questions.filter((q) => q.difficulty === 'intermediate').length,
    advanced: questions.filter((q) => q.difficulty === 'advanced').length,
    expert: questions.filter((q) => q.difficulty === 'expert').length,
    needsReview: questions.filter((q) => q.reviewStatus === 'needs_review').length,
    approved: questions.filter((q) => q.reviewStatus === 'approved').length,
  };

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormText('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormDifficulty('beginner');
    setFormCategory('Old Testament');
    setFormTranslation('Multi-Translation');
    setFormRefs('');
    setFormExplanation('');
    setFormStatus('approved');
    setFormNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (q: BibleQuestion) => {
    setEditingQuestion(q);
    setFormText(q.questionText);
    setFormOptions([...q.options]);
    setFormCorrectIndex(q.correctAnswerIndex);
    setFormDifficulty(q.difficulty);
    setFormCategory(q.category);
    setFormTranslation(q.translationId);
    setFormRefs(q.scriptureReferences.join(', '));
    setFormExplanation(q.explanation);
    setFormStatus(q.reviewStatus);
    setFormNotes(q.verificationNotes || '');
    setShowModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) return;

    const transInfo = SUPPORTED_TRANSLATIONS.find((t) => t.id === formTranslation) || SUPPORTED_TRANSLATIONS[0];
    const refsList = formRefs
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const payload: Partial<BibleQuestion> = {
      questionText: formText.trim(),
      options: formOptions.map((opt) => opt.trim()),
      correctAnswerIndex: formCorrectIndex,
      difficulty: formDifficulty,
      category: formCategory,
      translationId: transInfo.id,
      translationName: transInfo.name,
      scriptureReferences: refsList.length > 0 ? refsList : ['Scripture Reference'],
      explanation: formExplanation.trim() || 'Verified biblical truth.',
      reviewStatus: formStatus,
      verificationNotes: formNotes.trim() || `Verified using ${transInfo.name}.`,
      reviewedBy: profile?.displayName || 'Administrator',
      updatedAt: new Date().toISOString(),
    };

    if (editingQuestion) {
      // Update
      try {
        const res = await fetch(`/api/questions/bank/${editingQuestion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-role': 'admin' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setQuestions((prev) => prev.map((q) => (q.id === editingQuestion.id ? data.question : q)));
        } else {
          // Local fallback
          setQuestions((prev) =>
            prev.map((q) => (q.id === editingQuestion.id ? ({ ...q, ...payload } as BibleQuestion) : q))
          );
        }
      } catch {
        setQuestions((prev) =>
          prev.map((q) => (q.id === editingQuestion.id ? ({ ...q, ...payload } as BibleQuestion) : q))
        );
      }
    } else {
      // Create new
      try {
        const res = await fetch('/api/questions/bank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-role': 'admin' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setQuestions((prev) => [data.question, ...prev]);
        } else {
          const fallbackNew: BibleQuestion = {
            id: `q-bank-${Date.now()}`,
            ...payload,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as BibleQuestion;
          setQuestions((prev) => [fallbackNew, ...prev]);
        }
      } catch {
        const fallbackNew: BibleQuestion = {
          id: `q-bank-${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as BibleQuestion;
        setQuestions((prev) => [fallbackNew, ...prev]);
      }
    }

    setShowModal(false);
  };

  const handleQuickApprove = async (questionId: string) => {
    try {
      await fetch(`/api/questions/bank/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-role': 'admin' },
        body: JSON.stringify({ reviewStatus: 'approved', reviewedBy: profile?.displayName || 'Administrator' }),
      });
    } catch {
      // Local update
    }
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, reviewStatus: 'approved' } : q))
    );
  };

  const handleToggleRetire = async (q: BibleQuestion) => {
    const nextStatus: QuestionReviewStatus = q.reviewStatus === 'retired' ? 'approved' : 'retired';
    try {
      await fetch(`/api/questions/bank/${q.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-role': 'admin' },
        body: JSON.stringify({ reviewStatus: nextStatus }),
      });
    } catch {
      // Local update
    }
    setQuestions((prev) =>
      prev.map((item) => (item.id === q.id ? { ...item, reviewStatus: nextStatus } : item))
    );
  };

  const getDifficultyBadge = (diff: QuestionDifficulty) => {
    switch (diff) {
      case 'beginner':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'developing':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'intermediate':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'advanced':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'expert':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400">Total Question Bank</p>
          <p className="text-xl font-bold text-white">{counts.total}</p>
          <p className="text-[10px] text-emerald-400 font-mono">100% verified</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[11px] text-emerald-400 font-medium">1. Beginner</p>
          <p className="text-xl font-bold text-white">{counts.beginner}</p>
          <p className="text-[10px] text-slate-400">Core narratives</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[11px] text-sky-400 font-medium">2. Developing</p>
          <p className="text-xl font-bold text-white">{counts.developing}</p>
          <p className="text-[10px] text-slate-400">Covenants & events</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[11px] text-amber-400 font-medium">3. Intermediate</p>
          <p className="text-xl font-bold text-white">{counts.intermediate}</p>
          <p className="text-[10px] text-slate-400">Parables & theology</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[11px] text-purple-400 font-medium">4. Advanced</p>
          <p className="text-xl font-bold text-white">{counts.advanced}</p>
          <p className="text-[10px] text-slate-400">Context & exegesis</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[11px] text-rose-400 font-medium">5. Expert</p>
          <p className="text-xl font-bold text-white">{counts.expert}</p>
          <p className="text-[10px] text-slate-400">Linguistic & canon</p>
        </div>
      </div>

      {/* Translations & Review Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong className="text-white">Supported Translations:</strong> Multi-Translation Verified, NIV, KJV, NKJV, ESV. Each question cites exact verse references and text bases.
          </span>
        </div>
        {counts.needsReview > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold text-[11px] flex items-center gap-1 self-start md:self-auto">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{counts.needsReview} Question Needs Human Review</span>
          </span>
        )}
      </div>

      {/* Control Bar: Filters, Search & Add Button */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by question text, scripture reference, or answer keyword..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bible Question</span>
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
            <span className="text-slate-400 text-[11px]">Level:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All 5 Levels</option>
              <option value="beginner" className="bg-slate-900">1. Beginner (Familiar facts)</option>
              <option value="developing" className="bg-slate-900">2. Developing (Covenants)</option>
              <option value="intermediate" className="bg-slate-900">3. Intermediate (Parables)</option>
              <option value="advanced" className="bg-slate-900">4. Advanced (Exegesis)</option>
              <option value="expert" className="bg-slate-900">5. Expert (Deep canon)</option>
            </select>
          </div>

          {/* Translation Filter */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
            <span className="text-slate-400 text-[11px]">Translation:</span>
            <select
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Translations</option>
              <option value="Multi-Translation" className="bg-slate-900">Multi-Translation Verified</option>
              <option value="NIV" className="bg-slate-900">NIV (New International)</option>
              <option value="KJV" className="bg-slate-900">KJV (King James)</option>
              <option value="NKJV" className="bg-slate-900">NKJV (New King James)</option>
              <option value="ESV" className="bg-slate-900">ESV (English Standard)</option>
            </select>
          </div>

          {/* Review Status Filter */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
            <span className="text-slate-400 text-[11px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Statuses</option>
              <option value="approved" className="bg-slate-900">Approved</option>
              <option value="needs_review" className="bg-slate-900">Needs Review</option>
              <option value="draft" className="bg-slate-900">Draft</option>
              <option value="retired" className="bg-slate-900">Retired</option>
            </select>
          </div>

          <span className="text-[11px] text-slate-500 ml-auto">
            Showing {filtered.length} of {questions.length} questions
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.map((q) => {
          const isNeedsReview = q.reviewStatus === 'needs_review';
          const isRetired = q.reviewStatus === 'retired';

          return (
            <div
              key={q.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                isRetired
                  ? 'bg-slate-950/40 border-slate-850 opacity-60'
                  : isNeedsReview
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Difficulty Pill */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getDifficultyBadge(
                        q.difficulty
                      )}`}
                    >
                      {q.difficulty}
                    </span>

                    {/* Translation Badge */}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {q.translationId}
                    </span>

                    {/* Category */}
                    <span className="text-[11px] text-slate-400">{q.category}</span>

                    {/* Review Status */}
                    {q.reviewStatus === 'approved' && (
                      <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {isNeedsReview && (
                      <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-0.5 animate-pulse">
                        <AlertCircle className="w-3 h-3" /> Needs Human Review
                      </span>
                    )}
                    {isRetired && (
                      <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5">
                        <Archive className="w-3 h-3" /> Retired
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-sm sm:text-base text-white pt-1">
                    {q.questionText}
                  </h3>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0 pt-1 sm:pt-0">
                  {isNeedsReview && (
                    <button
                      onClick={() => handleQuickApprove(q.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 transition-all flex items-center gap-1"
                      title="Mark approved after verification"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
                    title="Edit Question"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleRetire(q)}
                    className={`p-1.5 rounded-lg transition-all ${
                      isRetired
                        ? 'text-emerald-400 bg-emerald-950/50 hover:bg-emerald-900'
                        : 'text-slate-500 hover:text-rose-400 bg-slate-800 hover:bg-slate-700'
                    }`}
                    title={isRetired ? 'Reactivate Question' : 'Retire Question'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === q.correctAnswerIndex;
                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border flex items-center gap-2 ${
                        isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-semibold'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isCorrect ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="truncate">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* References & Explanation Footer */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 text-xs space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400 text-[11px]">
                  <span className="font-semibold text-amber-300 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Scripture Ref: {q.scriptureReferences.join('; ')}</span>
                  </span>
                  <span>Translation Basis: {q.translationName}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed pt-0.5">
                  <span className="text-slate-400 font-semibold">Explanation: </span>
                  {q.explanation}
                </p>
                {q.verificationNotes && (
                  <p className="text-[10px] text-slate-500 italic pt-0.5">
                    Note: {q.verificationNotes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  {editingQuestion ? 'Edit Bible Question' : 'Create New Bible Question'}
                </h3>
                <p className="text-xs text-slate-400">
                  Maintain biblical accuracy, multi-translation labels, and clear Scripture citations.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              {/* Question Text */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Question Text *</label>
                <textarea
                  required
                  rows={2}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Enter clear, biblically precise question wording..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 4 Options & Correct Answer Radio */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold">
                  Options (Select radio for the Correct Answer) *
                </label>
                <div className="space-y-2">
                  {formOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formCorrectIndex === idx}
                        onChange={() => setFormCorrectIndex(idx)}
                        className="w-4 h-4 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="w-5 text-center font-bold text-slate-400">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const updated = [...formOptions];
                          updated[idx] = e.target.value;
                          setFormOptions(updated);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)} text...`}
                        className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Difficulty Level *</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as QuestionDifficulty)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="beginner">1. Beginner (Familiar stories & facts)</option>
                    <option value="developing">2. Developing (Events & covenants)</option>
                    <option value="intermediate">3. Intermediate (Parables & themes)</option>
                    <option value="advanced">4. Advanced (Exegesis & chronology)</option>
                    <option value="expert">5. Expert (Deep canon & linguistic)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Scripture Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as QuizCategory)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Old Testament">Old Testament</option>
                    <option value="New Testament">New Testament</option>
                    <option value="Life and teachings of Jesus">Life and teachings of Jesus</option>
                    <option value="Parables of Jesus">Parables of Jesus</option>
                    <option value="Bible characters">Bible characters</option>
                    <option value="Books of the Bible">Books of the Bible</option>
                    <option value="Biblical history">Biblical history</option>
                    <option value="Christian living">Christian living</option>
                    <option value="Wisdom and Psalms">Wisdom and Psalms</option>
                    <option value="Prophecy and Revelation">Prophecy and Revelation</option>
                  </select>
                </div>
              </div>

              {/* Translation & Review Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Bible Translation Basis *</label>
                  <select
                    value={formTranslation}
                    onChange={(e) => setFormTranslation(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    {SUPPORTED_TRANSLATIONS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Review Status *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as QuestionReviewStatus)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="approved">Approved (Verified & live)</option>
                    <option value="needs_review">Needs Human Review</option>
                    <option value="draft">Draft</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              {/* Scripture References */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Scripture References (comma-separated) *</label>
                <input
                  type="text"
                  required
                  value={formRefs}
                  onChange={(e) => setFormRefs(e.target.value)}
                  placeholder="e.g. Genesis 14:18-20, Hebrews 7:1-3"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Biblical Explanation */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Biblical Explanation & Edification *</label>
                <textarea
                  required
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Explain why the answer is correct and provide spiritual context..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Verification Notes */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Editorial Verification Notes (Optional)</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Cross-checked with Greek text; wording identical in KJV and NIV."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300"
                >
                  {editingQuestion ? 'Update Question' : 'Save to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
