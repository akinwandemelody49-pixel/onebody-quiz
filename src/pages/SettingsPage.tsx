import React, { useState } from 'react';
import {
  Settings,
  User,
  Globe2,
  Bell,
  ShieldCheck,
  Check,
  Save,
  Lock,
  Heart,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES, BIBLE_INTERESTS_LIST } from '../lib/seedData';

interface SettingsPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { profile, updateUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [country, setCountry] = useState(profile?.country || 'United States');
  const [city, setCity] = useState(profile?.city || '');
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferredLanguage || 'English');
  const [favoriteVerse, setFavoriteVerse] = useState(profile?.favoriteVerse || 'Romans 12:5');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile?.bibleInterests || ['Gospel Teachings']
  );

  // Notification preferences
  const [tournamentAlerts, setTournamentAlerts] = useState(true);
  const [dailyVerseAlerts, setDailyVerseAlerts] = useState(true);
  const [prayerWallAlerts, setPrayerWallAlerts] = useState(true);

  // Privacy preferences
  const [showCountryPublicly, setShowCountryPublicly] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleInterest = (topic: string) => {
    setSelectedInterests((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        country,
        city: city.trim(),
        preferredLanguage,
        favoriteVerse: favoriteVerse.trim(),
        bibleInterests: selectedInterests,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Account Preferences</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
          Settings & Profile Customization
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal profile, notification preferences, and privacy controls.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Card */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-white">Member Profile Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Display Name or Handle
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Account Email (Read-only)
              </label>
              <input
                type="text"
                disabled
                value={profile?.email || 'N/A'}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-slate-500 text-xs sm:text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Home Nation
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Austin or Lagos"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Bible Translation / Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="English">English (NIV / ESV / KJV)</option>
                <option value="Spanish">Spanish (Reina-Valera)</option>
                <option value="French">French (Louis Segond)</option>
                <option value="Portuguese">Portuguese (Almeida)</option>
                <option value="Swahili">Swahili (Union Version)</option>
                <option value="Korean">Korean (개역개정)</option>
                <option value="Tagalog">Tagalog (Ang Biblia)</option>
                <option value="German">German (Lutherbibel)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Favorite Scripture Verse
              </label>
              <input
                type="text"
                value={favoriteVerse}
                onChange={(e) => setFavoriteVerse(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Bible Study Interests (Curates quiz suggestions)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BIBLE_INTERESTS_LIST.map((topic) => {
                const isSelected = selectedInterests.includes(topic);
                return (
                  <button
                    type="button"
                    key={topic}
                    onClick={() => toggleInterest(topic)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{topic}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notifications & Privacy Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notifications */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <h2 className="font-serif text-base font-bold text-white">Notifications</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-semibold text-white">Live Tournament Reminders</p>
                  <p className="text-[11px] text-slate-400">Get notified 1 hour before scheduled competitions</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTournamentAlerts(!tournamentAlerts)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    tournamentAlerts ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${tournamentAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-semibold text-white">Verse of the Day Digest</p>
                  <p className="text-[11px] text-slate-400">Daily morning Scripture notification</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDailyVerseAlerts(!dailyVerseAlerts)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    dailyVerseAlerts ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${dailyVerseAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-semibold text-white">Prayer Partner Updates</p>
                  <p className="text-[11px] text-slate-400">Alerts when someone prays for your request</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrayerWallAlerts(!prayerWallAlerts)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    prayerWallAlerts ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${prayerWallAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Controls */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-base font-bold text-white">Privacy Controls</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-semibold text-white">Display Country on Leaderboard</p>
                  <p className="text-[11px] text-slate-400">Shows your flag on global scoreboards</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCountryPublicly(!showCountryPublicly)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    showCountryPublicly ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${showCountryPublicly ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-semibold text-white">Show Online Fellowship Status</p>
                  <p className="text-[11px] text-slate-400">Indicates green status indicator when in chat</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOnlineStatus(!showOnlineStatus)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    showOnlineStatus ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${showOnlineStatus ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Check className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
