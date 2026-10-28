export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  country: string;
  city?: string;
  preferredLanguage?: string;
  bibleInterests: string[];
  favoriteVerse?: string;
  role: 'member' | 'moderator' | 'admin';
  totalPoints: number;
  quizzesCompleted: number;
  currentStreak: number;
  highestStreak: number;
  lastQuizDate?: string;
  createdAt: string;
  updatedAt: string;
  isOnline?: boolean;
}

export type QuizCategory =
  | 'Old Testament'
  | 'New Testament'
  | 'Life and teachings of Jesus'
  | 'Parables of Jesus'
  | 'Early church and apostles'
  | 'Bible characters'
  | 'Books of the Bible'
  | 'Biblical history'
  | 'Christian living'
  | 'Wisdom and Psalms'
  | 'Prophecy and Revelation';

export type QuestionDifficulty =
  | 'beginner'
  | 'developing'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export type QuizDifficulty =
  | 'Beginner'
  | 'Developing'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert'
  | 'Mixed'
  | QuestionDifficulty;

export type QuestionReviewStatus = 'draft' | 'needs_review' | 'approved' | 'retired';

export interface BibleTranslationInfo {
  id: string; // e.g. 'KJV', 'NKJV', 'NIV', 'ESV', 'Multi-Translation'
  name: string; // Full name e.g. 'King James Version'
  abbreviation: string;
  notes?: string;
}

export interface BibleQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number; // Server-authoritative; withheld in client queries before reveal
  difficulty: QuestionDifficulty;
  category: QuizCategory;
  scriptureReferences: string[];
  explanation: string;
  translationId: string;
  translationName: string;
  reviewStatus: QuestionReviewStatus;
  verificationNotes?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId?: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  scriptureReference: string;
  scriptureReferences?: string[];
  difficulty?: QuestionDifficulty;
  translationId?: string;
  translationName?: string;
  reviewStatus?: QuestionReviewStatus;
}

export interface LearningPathLevel {
  level: number;
  difficulty: QuestionDifficulty;
  title: string;
  subtitle: string;
  description: string;
  requiredPassScore: number; // e.g. 70%
  questionCount: number;
  unlocked: boolean;
  completed: boolean;
  bestScore?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  timePerQuestionSeconds: number;
  pointsPerQuestion: number;
  questionCount: number;
  questions?: QuizQuestion[];
  isPublished: boolean;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  translationId?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  quizCategory: string;
  userId: string;
  userName: string;
  userCountry?: string;
  score: number;
  totalQuestions: number;
  pointsEarned: number;
  percentage: number;
  timeTakenSeconds: number;
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
  }[];
  completedAt: string;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  startTime: string; // ISO string
  durationMinutes: number;
  participantLimit: number;
  status: 'upcoming' | 'live' | 'completed';
  currentQuestionIndex: number;
  currentRoundIndex?: number;
  totalRounds?: number;
  questionsPerRound?: number;
  roundTimerEnd?: string;
  questionTimerEnd?: string;
  createdBy: string;
  createdByName?: string;
  participantCount: number;
  questions?: QuizQuestion[];
  manifest?: TournamentManifest;
  manifestSummary?: {
    totalRounds: number;
    questionsPerRound: number;
    progressionType: string;
    antiPredictionScore: number;
    rounds: {
      roundNumber: number;
      title: string;
      focusTheme: string;
      difficultySummary: string;
    }[];
  };
  antiPredictionScore?: number;
  createdAt: string;
}

export type TournamentProgressionType =
  | 'standard_ascending'
  | 'championship_curve'
  | 'balanced_mixed'
  | 'expert_gauntlet';

export interface TournamentRoundConfig {
  roundNumber: number;
  title: string;
  focusTheme: string;
  targetDifficulties: QuestionDifficulty[];
  questionCount: number;
  preferredCategories?: QuizCategory[];
  excludedCategories?: QuizCategory[];
}

export interface TournamentManifestRound {
  roundNumber: number;
  title: string;
  focusTheme: string;
  difficultySummary: string;
  questionIds: string[];
  topicDistribution: Record<string, number>;
  testamentDistribution: {
    oldTestament: number;
    newTestament: number;
  };
}

export interface TournamentManifest {
  tournamentId: string;
  title: string;
  createdAt: string;
  progressionType: TournamentProgressionType;
  totalRounds: number;
  questionsPerRound: number;
  totalQuestions: number;
  rounds: TournamentManifestRound[];
  recentlyUsedExcludedCount: number;
  antiPredictionScore: number; // 0 - 100 rating of topic diversity & divergence
  antiPredictionMetrics: {
    topicRotationDivergence: number; // percentage of distinct topics between consecutive rounds
    duplicateExclusionVerified: boolean;
    progressiveDifficultyVerified: boolean;
    optionShuffleVerified: boolean;
    unrevealedAnswerKeysProtected: boolean;
  };
}

export interface CompetitionParticipant {
  id: string;
  competitionId: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  country: string;
  score: number;
  correctCount: number;
  joinedAt: string;
  lastAnswerSubmittedAt?: string;
}

export interface CommunityMessage {
  id: string;
  channelId: 'general' | 'questions' | 'announcements' | 'prayer' | 'testimonies';
  userId: string;
  userName: string;
  userAvatar?: string;
  userCountry?: string;
  content: string;
  replyToId?: string;
  replyToText?: string;
  scriptureRef?: string;
  reactions?: Record<string, string[]>; // emoji -> array of uids
  createdAt: string;
}

export interface PrayerRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userCountry?: string;
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  isAnswered: boolean;
  answeredTestimony?: string;
  prayerCount: number;
  prayingUserIds?: string[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'competition' | 'quiz' | 'community' | 'prayer' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  reporterName?: string;
  reportedItemType: 'message' | 'prayer' | 'user';
  reportedItemId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredCount: number;
  type: 'quiz_count' | 'points' | 'streak' | 'competition' | 'prayer';
  badgeColor: string;
}
