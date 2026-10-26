import React, { useState } from 'react';
import {
  BookOpen,
  Trophy,
  Users,
  Heart,
  Flame,
  Bell,
  Menu,
  X,
  Shield,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { COUNTRIES } from '../../lib/seedData';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { profile, signOut, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const countryObj = COUNTRIES.find((c) => c.name === profile?.country);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', authRequired: true },
    { id: 'quizzes', label: 'Quiz Library' },
    { id: 'competitions', label: 'Live Arena' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'voice-rooms', label: 'Voice Rooms', authRequired: true },
    { id: 'community', label: 'Fellowship', authRequired: true },
    { id: 'prayer', label: 'Prayer Wall', authRequired: true },
  ];

  const handleNav = (view: string) => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    onNavigate(view);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strict 3-Zone Top Bar Contract */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div
            onClick={() => handleNav(profile ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-serif font-bold text-slate-950 text-sm shadow-md">
              1B
            </div>
            <span className="font-serif font-bold text-lg text-white group-hover:text-amber-200 transition-colors tracking-tight whitespace-nowrap">
              OneBody <span className="text-amber-400 font-normal">Bible Quiz</span>
            </span>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {navLinks.map((item) => {
              if (item.authRequired && !profile) return null;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`hover:text-white transition-colors whitespace-nowrap shrink-0 relative py-1 ${
                    isActive ? 'text-amber-300 font-bold' : ''
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}

            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className={`hover:text-purple-300 transition-colors whitespace-nowrap shrink-0 text-purple-400 font-bold relative py-1 ${
                  currentView === 'admin' ? 'text-purple-200' : ''
                }`}
              >
                Admin
                {currentView === 'admin' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-full" />
                )}
              </button>
            )}
          </nav>

          {/* Zone 3: Single primary action / User profile */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {profile ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNav('notifications')}
                  className="relative p-2 text-slate-400 hover:text-white transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full" />
                  )}
                </button>

                <div className="text-right leading-none hidden lg:block">
                  <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {profile.displayName.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-amber-400 font-mono tabular-nums mt-0.5">
                    {profile.totalPoints || 0} pts
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center rounded-full border border-slate-700 hover:border-amber-400/60 transition-all p-0.5 focus:outline-none"
                  >
                    <img
                      src={
                        profile.photoURL ||
                        '/src/assets/images/avatar_member_david_1793017334243.jpg'
                      }
                      alt={profile.displayName}
                      className="w-8 h-8 rounded-full object-cover bg-slate-800"
                    />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 text-xs z-50 animate-in fade-in">
                      <div className="px-4 py-3 border-b border-slate-800">
                        <p className="font-semibold text-white truncate">{profile.displayName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{profile.email}</p>
                        <p className="text-[10px] text-amber-400 mt-1">
                          {countryObj ? countryObj.flag : '🌍'} {profile.country || 'Global'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleNav('profile')}
                        className="w-full text-left px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        My Profile & Records
                      </button>

                      <button
                        onClick={() => handleNav('settings')}
                        className="w-full text-left px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        Account Settings
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleNav('admin')}
                          className="w-full text-left px-4 py-2.5 text-purple-300 hover:text-purple-200 hover:bg-purple-950/40 flex items-center gap-2"
                        >
                          <Shield className="w-3.5 h-3.5 text-purple-400" />
                          Admin Console
                        </button>
                      )}

                      <div className="border-t border-slate-800 my-1" />

                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await signOut();
                          onNavigate('landing');
                        }}
                        className="w-full text-left px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNav('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('signup')}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all whitespace-nowrap"
                >
                  Join Fellowship
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {profile && (
              <button
                onClick={() => handleNav('notifications')}
                className="relative p-2 text-slate-400 hover:text-white"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full" />
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 py-4 space-y-2">
          {profile && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 mb-3">
              <img
                src={profile.photoURL || '/src/assets/images/avatar_member_david_1793017334243.jpg'}
                alt={profile.displayName}
                className="w-9 h-9 rounded-full object-cover border border-slate-700"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-xs truncate">{profile.displayName}</p>
                <p className="text-[11px] text-amber-400 font-mono tabular-nums">{profile.totalPoints || 0} pts · {profile.country}</p>
              </div>
            </div>
          )}

          {navLinks.map((item) => {
            if (item.authRequired && !profile) return null;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? 'text-amber-300 bg-slate-900' : 'text-slate-300 hover:bg-slate-900/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold text-purple-300 bg-purple-950/30"
            >
              Admin Console
            </button>
          )}

          {profile ? (
            <div className="pt-3 border-t border-slate-800 space-y-1">
              <button
                onClick={() => handleNav('profile')}
                className="w-full text-left px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                My Profile & Records
              </button>
              <button
                onClick={() => handleNav('settings')}
                className="w-full text-left px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Account Settings
              </button>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await signOut();
                  onNavigate('landing');
                }}
                className="w-full text-left px-3.5 py-2 rounded-lg text-xs text-rose-400"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => handleNav('login')}
                className="w-full py-2.5 text-center text-xs font-semibold text-slate-200 bg-slate-900 rounded-lg border border-slate-800"
              >
                Log In
              </button>
              <button
                onClick={() => handleNav('signup')}
                className="w-full py-2.5 text-center text-xs font-bold text-slate-950 bg-amber-400 rounded-lg"
              >
                Join OneBody Fellowship
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
