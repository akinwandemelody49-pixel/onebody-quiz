import React, { useState } from 'react';
import { Volume2, Copy, Check, Share2, Sparkles, BookOpen } from 'lucide-react';
import { DAILY_VERSES } from '../../lib/seedData';

export const VerseCard: React.FC = () => {
  // Rotate verse based on day of year
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const verseIndex = dayOfYear % DAILY_VERSES.length;
  const currentVerse = DAILY_VERSES[verseIndex];

  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${currentVerse.text}" — ${currentVerse.verse} (${currentVerse.version})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${currentVerse.text}. From ${currentVerse.verse}`);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'OneBody Verse of the Day',
        text: `"${currentVerse.text}" — ${currentVerse.verse} (${currentVerse.version})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-amber-500/25 p-6 shadow-xl shadow-amber-950/20">
      {/* Decorative background watermark */}
      <div className="absolute -right-6 -bottom-8 select-none pointer-events-none opacity-5">
        <BookOpen className="w-48 h-48 text-amber-300" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-300">
            Verse of the Day
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {currentVerse.theme}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleSpeak}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              isPlayingAudio
                ? 'bg-amber-500 text-slate-950 font-medium'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
            title="Read Scripture aloud"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">
              {isPlayingAudio ? 'Speaking...' : 'Listen'}
            </span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
            title="Copy verse"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
            title="Share verse"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <blockquote className="my-3 text-slate-100 text-base sm:text-lg font-serif italic leading-relaxed">
        “{currentVerse.text}”
      </blockquote>

      <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
        <span className="font-semibold text-amber-300 font-sans tracking-wide">
          {currentVerse.verse}
        </span>
        <span className="text-slate-500">{currentVerse.version} Translation</span>
      </div>
    </div>
  );
};
