import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { AppNotification } from '../types';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-welcome',
      userId: profile?.uid || 'guest',
      title: 'Welcome to OneBody Bible Quiz!',
      message: 'Join Christian brothers and sisters across nations in studying Scripture and competing in live fellowship quizzes.',
      type: 'system',
      link: '/quizzes',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-cup',
      userId: profile?.uid || 'guest',
      title: 'Upcoming Competition: Global Nations Pentecost Cup',
      message: 'The worldwide live quiz starts in 4 hours. Test your knowledge of Acts and the Early Church!',
      type: 'competition',
      link: '/competitions',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

  // Sync real-time notifications if authenticated
  useEffect(() => {
    if (!profile?.uid || !user) return;

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', profile.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AppNotification[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as Omit<AppNotification, 'id'>) });
            });
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setNotifications(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'notifications');
        }
      );

      return () => unsubscribe();
    } catch {
      // Keep state resilient
    }
  }, [profile?.uid, user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    if (user && profile?.uid) {
      try {
        const notifRef = doc(db, 'notifications', id);
        await updateDoc(notifRef, { isRead: true });
      } catch {
        // Optimistic update retained
      }
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    if (user && profile?.uid) {
      try {
        const batch = writeBatch(db);
        notifications.forEach((n) => {
          if (!n.isRead) {
            batch.update(doc(db, 'notifications', n.id), { isRead: true });
          }
        });
        await batch.commit();
      } catch {
        // Optimistic
      }
    }
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
