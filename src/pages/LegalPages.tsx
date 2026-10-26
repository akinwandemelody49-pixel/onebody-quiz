import React, { useState } from 'react';
import { ShieldCheck, Heart, BookOpen, Globe2, ArrowLeft } from 'lucide-react';

interface LegalPagesProps {
  initialTab?: 'guidelines' | 'privacy' | 'faith';
  onNavigate: (view: string) => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ initialTab = 'guidelines', onNavigate }) => {
  const [tab, setTab] = useState<'guidelines' | 'privacy' | 'faith'>(initialTab);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Fellowship</span>
      </button>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setTab('guidelines')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tab === 'guidelines'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Community Guidelines
        </button>

        <button
          onClick={() => setTab('privacy')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tab === 'privacy'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Privacy Policy
        </button>

        <button
          onClick={() => setTab('faith')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tab === 'faith'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Statement of Faith & Unity
        </button>
      </div>

      {/* Community Guidelines */}
      {tab === 'guidelines' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 space-y-6 shadow-xl leading-relaxed text-slate-300 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-white">Community Guidelines</h1>
              <p className="text-xs text-slate-400">Guiding our fellowship in mutual honor and Christlikeness</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <h3 className="font-bold text-white text-base">1. Reverence for the Word of God</h3>
              <p className="text-xs text-slate-300 mt-1">
                The Holy Scriptures are divinely inspired and profitable for teaching, rebuking, correcting, and training in righteousness (2 Timothy 3:16). All discussions, answers, and debates should treat Scripture with holiness and reverence.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">2. Love, Grace, and Edification</h3>
              <p className="text-xs text-slate-300 mt-1">
                “Let no corrupt communication proceed out of your mouth, but that which is good to the use of edifying, that it may minister grace unto the hearers.” (Ephesians 4:29). Hostility, personal insults, denominational disparagement, or coarse language have no place on OneBody.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">3. Honest & Honorable Competition</h3>
              <p className="text-xs text-slate-300 mt-1">
                In quiz games and synchronized tournaments, members must answer honestly without browser modifications, automation, or script injections. Our goal is spiritual growth and joy, not self-exaltation.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">4. Sanctity of the Prayer Wall</h3>
              <p className="text-xs text-slate-300 mt-1">
                Prayer requests are sacred. Believers share burdens, illnesses, and vulnerable situations in trust. Treat every prayer item with compassion, intercession, and privacy.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">5. Protection from Spam & Commercial Solicitation</h3>
              <p className="text-xs text-slate-300 mt-1">
                Posting marketing links, unauthorized financial appeals, crypto schemes, or unverified charity solicitations is strictly prohibited and subject to immediate suspension.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy */}
      {tab === 'privacy' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 space-y-6 shadow-xl leading-relaxed text-slate-300 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-white">Privacy Policy & Member Protection</h1>
              <p className="text-xs text-slate-400">How we protect your spiritual journey and data</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <h3 className="font-bold text-white text-base">1. Information We Collect</h3>
              <p className="text-xs text-slate-300 mt-1">
                We store account credentials through Firebase Authentication, your chosen spiritual handle/display name, country, city (optional), preferred Bible translation, and quiz attempt scores.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">2. Isolation of Private Information</h3>
              <p className="text-xs text-slate-300 mt-1">
                Your email address and private prayer requests are never exposed through public database queries. Only public community messages and approved leaderboard metrics are displayed.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">3. Firebase Cloud Firestore Security</h3>
              <p className="text-xs text-slate-300 mt-1">
                Database operations are governed by mathematically verified Firestore Security Rules. User roles, permissions, and score calculations are validated server-side.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">4. No Sale of User Data</h3>
              <p className="text-xs text-slate-300 mt-1">
                OneBody never sells, rents, or licenses member information to third-party advertisers or data brokers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statement of Faith */}
      {tab === 'faith' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 space-y-6 shadow-xl leading-relaxed text-slate-300 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-white">Statement of Faith & Unity</h1>
              <p className="text-xs text-slate-400">“One Lord, one faith, one baptism” — Ephesians 4:5</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <h3 className="font-bold text-white text-base">1. The Holy Trinity</h3>
              <p className="text-xs text-slate-300 mt-1">
                We confess one eternal God in three persons: Father, Son, and Holy Spirit; Creator of heaven and earth.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">2. Jesus Christ Our Lord</h3>
              <p className="text-xs text-slate-300 mt-1">
                We believe in the deity of Jesus Christ, His virgin birth, His sinless life, His miracles, His atoning death on the cross, His bodily resurrection, His ascension to the right hand of the Father, and His personal return in power and glory.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">3. Salvation by Grace Through Faith</h3>
              <p className="text-xs text-slate-300 mt-1">
                Salvation is the free gift of God offered to humanity by grace through faith in Jesus Christ, whose precious blood was shed on the cross for the forgiveness of sins (Ephesians 2:8-9).
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">4. The Global Body of Christ</h3>
              <p className="text-xs text-slate-300 mt-1">
                All believers across all languages, tribes, nations, and denominations who confess Christ are members of His one spiritual body. OneBody exists to manifest this divine oneness across geographical borders.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
