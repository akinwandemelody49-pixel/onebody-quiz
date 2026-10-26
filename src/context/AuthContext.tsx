import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile as fbUpdateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  signInAsDemo: (role?: 'member' | 'admin') => Promise<void>;
  sendResetEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateQuizProgress: (pointsEarned: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'akinwandemelody49@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadProfile(currentUser.uid, currentUser.email, currentUser.displayName, currentUser.photoURL);
      } else {
        // Check if there is a local demo session stored
        const storedDemo = localStorage.getItem('onebody_demo_user');
        if (storedDemo) {
          try {
            const demoProfile = JSON.parse(storedDemo) as UserProfile;
            setProfile(demoProfile);
          } catch {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadProfile = async (
    uid: string,
    email: string | null,
    displayName: string | null,
    photoURL: string | null
  ) => {
    try {
      const userRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userRef);

      const isDefaultAdmin = email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        // Ensure admin role if default admin
        if (isDefaultAdmin && data.role !== 'admin') {
          const updated = { ...data, role: 'admin' as const };
          await setDoc(userRef, { role: 'admin' }, { merge: true });
          setProfile(updated);
        } else {
          setProfile(data);
        }
      } else {
        // First time sign-up profile creation
        const newProfile: UserProfile = {
          uid,
          email: email || '',
          displayName: displayName || (email ? email.split('@')[0] : 'Believer in Christ'),
          photoURL: photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
          country: 'United States',
          city: '',
          preferredLanguage: 'English',
          bibleInterests: ['Gospel Teachings', 'Psalms & Proverbs'],
          favoriteVerse: 'Romans 12:5',
          role: isDefaultAdmin ? 'admin' : 'member',
          totalPoints: 0,
          quizzesCompleted: 0,
          currentStreak: 1,
          highestStreak: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isOnline: true,
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.uid, user.email, user.displayName, user.photoURL);
    }
  };

  const signInWithGoogle = async () => {
    try {
      localStorage.removeItem('onebody_demo_user');
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await loadProfile(
          result.user.uid,
          result.user.email,
          result.user.displayName,
          result.user.photoURL
        );
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      localStorage.removeItem('onebody_demo_user');
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await loadProfile(
          result.user.uid,
          result.user.email,
          result.user.displayName,
          result.user.photoURL
        );
      }
    } catch (error) {
      console.error('Email Sign In Error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    try {
      localStorage.removeItem('onebody_demo_user');
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await fbUpdateProfile(result.user, { displayName });
        await loadProfile(result.user.uid, email, displayName, null);
      }
    } catch (error) {
      console.error('Sign Up Error:', error);
      throw error;
    }
  };

  // Provide a quick demo mode for testing across multiple member personas and countries
  const signInAsDemo = async (role: 'member' | 'admin' = 'member') => {
    const demoId = role === 'admin' ? 'demo-admin-paul' : 'demo-member-grace';
    const demoProfile: UserProfile = {
      uid: demoId,
      email: role === 'admin' ? ADMIN_EMAIL : 'grace.fellowship@onebody.org',
      displayName: role === 'admin' ? 'Paul the Contender (Admin)' : 'Sister Grace Ndidi',
      photoURL: role === 'admin' 
        ? '/src/assets/images/avatar_member_david_1793017334243.jpg'
        : '/src/assets/images/avatar_member_grace_1793017333665.jpg',
      country: role === 'admin' ? 'United Kingdom' : 'Nigeria',
      city: role === 'admin' ? 'London' : 'Lagos',
      preferredLanguage: 'English',
      bibleInterests: ['Paul’s Epistles', 'Parables & Miracles', 'Christian Apologetics'],
      favoriteVerse: 'Philippians 4:13',
      role: role,
      totalPoints: role === 'admin' ? 1450 : 380,
      quizzesCompleted: role === 'admin' ? 14 : 4,
      currentStreak: 3,
      highestStreak: 7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOnline: true,
    };
    localStorage.setItem('onebody_demo_user', JSON.stringify(demoProfile));
    setProfile(demoProfile);
  };

  const sendResetEmail = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    localStorage.removeItem('onebody_demo_user');
    await fbSignOut(auth);
    setProfile(null);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = {
      ...profile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, data);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    } else {
      localStorage.setItem('onebody_demo_user', JSON.stringify(updated));
    }
  };

  const updateQuizProgress = async (pointsEarned: number) => {
    if (!profile) return;

    const today = new Date().toISOString().slice(0, 10);
    const lastQuiz = profile.lastQuizDate?.slice(0, 10);

    let newStreak = profile.currentStreak;
    if (!lastQuiz) {
      newStreak = 1;
    } else if (lastQuiz !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (lastQuiz === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const newHighest = Math.max(profile.highestStreak || 1, newStreak);
    const updatedData: Partial<UserProfile> = {
      totalPoints: (profile.totalPoints || 0) + pointsEarned,
      quizzesCompleted: (profile.quizzesCompleted || 0) + 1,
      currentStreak: newStreak,
      highestStreak: newHighest,
      lastQuizDate: new Date().toISOString(),
    };

    await updateUserProfile(updatedData);
  };

  const isAdmin =
    profile?.role === 'admin' ||
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsDemo,
        sendResetEmail,
        signOut,
        updateUserProfile,
        refreshProfile,
        updateQuizProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
