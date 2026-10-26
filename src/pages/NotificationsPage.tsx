import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Trophy,
  BookOpen,
  MessageSquare,
  Heart,
  Sparkles,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

interface NotificationsPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'competition':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'quiz':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'community':
        return <MessageSquare className="w-4 h-4 text-rose-400" />;
      case 'prayer':
        return <Heart className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Fellowship Alerts</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Stay informed about tournaments, prayer replies, and community milestones.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              markAsRead(item.id);
              if (item.link) {
                if (item.link.includes('competitions')) onNavigate('competitions');
                else if (item.link.includes('quizzes')) onNavigate('quizzes');
                else if (item.link.includes('community')) onNavigate('community');
                else if (item.link.includes('prayer')) onNavigate('prayer');
              }
            }}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              !item.isRead
                ? 'bg-slate-900 border-amber-500/40 shadow-md'
                : 'bg-slate-950/60 border-slate-850 hover:bg-slate-900/60'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700">
              {getIcon(item.type)}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <h4
                  className={`text-xs sm:text-sm font-bold truncate ${
                    !item.isRead ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {item.title}
                </h4>
                <span className="text-[10px] text-slate-500 flex-shrink-0">
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">{item.message}</p>

              {item.link && (
                <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline">
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>

            {!item.isRead && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0 mt-2" />
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
            <Bell className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-serif font-bold text-base text-white">No Notifications</h3>
            <p className="text-xs text-slate-400">
              You are completely caught up on all tournament alerts and fellowship replies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
