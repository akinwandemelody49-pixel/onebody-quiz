import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  BookOpen,
  Check,
  ArrowRight,
  MapPin,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES, BIBLE_INTERESTS_LIST } from '../lib/seedData';

interface OnboardingPageProps {
  onNavigate: (view: string) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onNavigate }) => {
  const { profile, updateUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [country, setCountry] = useState(profile?.country || 'United States');
  const [city, setCity] = useState(profile?.city || '');
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferredLanguage || 'English');
  const [favoriteVerse, setFavoriteVerse] = useState(profile?.favoriteVerse || 'Romans 12:5');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile?.bibleInterests?.length ? profile.bibleInterests : ['Gospel Teachings', 'Psalms & Proverbs']
  );
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        country,
        city: city.trim(),
        preferredLanguage,
        favoriteVerse: favoriteVerse.trim(),
        bibleInterests: selectedInterests,
      });
      onNavigate('dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Onboarding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to OneBody</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Set Up Your Fellowship Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Help brothers and sisters identify your home nation, favorite Scripture, and areas of study.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Display Name or Spiritual Handle
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              placeholder="e.g. Brother Samuel"
            />
          </div>

          {/* Country & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Your Country</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>City / Region (Optional)</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Austin, Texas or Lagos"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Preferred Language & Favorite Scripture */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Bible Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="Portuguese">Portuguese (Português)</option>
                <option value="Swahili">Swahili (Kiswahili)</option>
                <option value="Korean">Korean (한국어)</option>
                <option value="Tagalog">Tagalog</option>
                <option value="German">German (Deutsch)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Favorite Scripture Verse</span>
              </label>
              <input
                type="text"
                value={favoriteVerse}
                onChange={(e) => setFavoriteVerse(e.target.value)}
                placeholder="e.g. Romans 12:5 or John 3:16"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Bible Study Interests */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Bible Study Interests (Choose any)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BIBLE_INTERESTS_LIST.map((topic) => {
                const isChecked = selectedInterests.includes(topic);
                return (
                  <button
                    type="button"
                    key={topic}
                    onClick={() => toggleInterest(topic)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all flex items-center justify-between ${
                      isChecked
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{topic}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Saving Profile...' : 'Complete & Enter Fellowship'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
