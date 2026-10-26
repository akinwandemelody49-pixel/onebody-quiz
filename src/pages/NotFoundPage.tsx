import React from 'react';
import { Compass, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (view: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div>
          <span className="text-4xl sm:text-5xl font-serif font-extrabold text-amber-400">
            404
          </span>
          <h1 className="font-serif text-2xl font-bold text-white mt-2">
            Page Not Found in the Fold
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            The page you are looking for does not exist or has been moved to another pasture.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20 text-xs italic font-serif text-amber-200">
          “He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.”
          <p className="text-[10px] text-amber-400 font-sans font-semibold text-right mt-1">
            — Psalm 23:3
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 transition-all"
          >
            Return to Dashboard
          </button>
          <button
            onClick={() => onNavigate('quizzes')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 transition-all"
          >
            Browse Bible Quizzes
          </button>
        </div>
      </div>
    </div>
  );
};
