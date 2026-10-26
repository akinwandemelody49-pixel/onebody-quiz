import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { AuthPages } from './pages/AuthPages';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { QuizLibraryPage } from './pages/QuizLibraryPage';
import { QuizPlayPage } from './pages/QuizPlayPage';
import { LiveQuizRoomPage } from './pages/LiveQuizRoomPage';
import { QuizResultsPage } from './pages/QuizResultsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { CommunityPage } from './pages/CommunityPage';
import { PrayerFellowshipPage } from './pages/PrayerFellowshipPage';
import { LiveCompetitionPage } from './pages/LiveCompetitionPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { VoiceRoomsPage } from './pages/VoiceRoomsPage';
import { LegalPages } from './pages/LegalPages';
import { NotFoundPage } from './pages/NotFoundPage';
import { Lock, ArrowRight } from 'lucide-react';

function AppContent() {
  const { profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParams, setViewParams] = useState<Record<string, string>>({});

  // Sync initial view based on auth state
  useEffect(() => {
    if (!loading) {
      if (profile && currentView === 'landing') {
        setCurrentView('dashboard');
      }
    }
  }, [loading, profile]);

  const handleNavigate = (view: string, params: Record<string, string> = {}) => {
    setViewParams(params);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Protected route gatekeeper
  const protectedViews = ['dashboard', 'onboarding', 'community', 'prayer', 'voice-rooms', 'profile', 'notifications', 'settings', 'admin'];
  const requiresAuth = protectedViews.includes(currentView) && !profile && !loading;

  const renderView = () => {
    if (loading) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center animate-spin">
            <span className="font-serif font-bold text-lg">1B</span>
          </div>
          <p className="text-xs text-slate-400">Loading OneBody Fellowship...</p>
        </div>
      );
    }

    if (requiresAuth) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-bold text-white">Fellowship Sign-In Required</h2>
              <p className="text-xs text-slate-400">
                Please sign in to access personalized quizzes, global fellowship chat, and community prayer.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => handleNavigate('login')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleNavigate('signup')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800 transition-all"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return <AuthPages mode="login" onNavigate={handleNavigate} />;
      case 'signup':
        return <AuthPages mode="signup" onNavigate={handleNavigate} />;
      case 'forgot-password':
        return <AuthPages mode="forgot-password" onNavigate={handleNavigate} />;
      case 'onboarding':
        return <OnboardingPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'quizzes':
        return <QuizLibraryPage onNavigate={handleNavigate} />;
      case 'quiz-play':
        return <QuizPlayPage quizId={viewParams.id} onNavigate={handleNavigate} />;
      case 'quiz-results':
        return <QuizResultsPage attemptData={viewParams.attempt} onNavigate={handleNavigate} />;
      case 'competitions':
        return <LiveCompetitionPage onNavigate={handleNavigate} />;
      case 'live-room':
        return <LiveQuizRoomPage competitionId={viewParams.id} onNavigate={handleNavigate} />;
      case 'leaderboard':
        return <LeaderboardPage onNavigate={handleNavigate} />;
      case 'voice-rooms':
        return <VoiceRoomsPage onNavigate={handleNavigate} />;
      case 'community':
        return <CommunityPage onNavigate={handleNavigate} />;
      case 'prayer':
        return <PrayerFellowshipPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminDashboardPage onNavigate={handleNavigate} />;
      case 'guidelines':
        return <LegalPages initialTab="guidelines" onNavigate={handleNavigate} />;
      case 'privacy':
        return <LegalPages initialTab="privacy" onNavigate={handleNavigate} />;
      case 'faith':
        return <LegalPages initialTab="faith" onNavigate={handleNavigate} />;
      case 'not-found':
        return <NotFoundPage onNavigate={handleNavigate} />;
      default:
        return <NotFoundPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />
      <main className="flex-1">
        {renderView()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
