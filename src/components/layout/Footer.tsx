import React from 'react';
import { BookOpen, Heart, Globe, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-serif font-bold text-white text-base">
                1B
              </div>
              <span className="font-serif font-bold text-white text-lg tracking-tight">
                OneBody Bible Quiz
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              “One Body in Christ. One Word. One Global Community.”
              Connecting believers across all continents to grow in Scripture and fellowship together.
            </p>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-amber-500/15">
              <p className="text-[11px] font-serif italic text-amber-200/90 leading-snug">
                “So in Christ we, though many, form one body, and each member belongs to all the others.”
              </p>
              <p className="text-[10px] text-amber-400/80 font-medium text-right mt-1">
                — Romans 12:5
              </p>
            </div>
          </div>

          {/* Scripture Learning */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Scripture Quizzes
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('quizzes')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Old Testament Studies
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('quizzes')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Gospels & Jesus’ Parables
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('quizzes')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Paul’s Epistles & Acts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('quizzes')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Bible Characters & History
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('competitions')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Live Worldwide Competitions
                </button>
              </li>
            </ul>
          </div>

          {/* Fellowship & Community */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Fellowship & Grace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('community')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Global Fellowship Channel
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('prayer')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Prayer Wall & Requests
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('prayer')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Answered Testimonies
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('leaderboard')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Global & Country Leaderboards
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Faith Guidelines */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Community & Faith
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('guidelines')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Community Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Privacy Policy & Data Security
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faith')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Statement of Faith & Unity
                </button>
              </li>
              <li>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-500">
                  <Globe className="w-3.5 h-3.5 text-amber-500/70" />
                  <span>Serving believers worldwide</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} OneBody Bible Quiz. Dedicated to the glory of God and the unity of His Church.</p>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => onNavigate('privacy')} className="hover:text-slate-400">
              Privacy
            </button>
            <button onClick={() => onNavigate('guidelines')} className="hover:text-slate-400">
              Guidelines
            </button>
            <button onClick={() => onNavigate('quizzes')} className="hover:text-amber-400">
              Bible Quizzes
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
