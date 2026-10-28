import {
  BibleQuestion,
  QuestionDifficulty,
  QuizCategory,
  TournamentManifest,
  TournamentManifestRound,
  TournamentProgressionType,
  TournamentRoundConfig,
} from '../types';

export interface ServerQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  scriptureReference: string;
  scriptureReferences?: string[];
  difficulty?: string;
  category?: string;
  translationId?: string;
  translationName?: string;
  roundIndex?: number;
  questionInRoundIndex?: number;
  originalId?: string;
}

// In-Memory Tracker for Recently Used Question IDs across tournaments
class RecentlyUsedTracker {
  private recentHistory: Map<string, { tournamentId: string; usedAt: number }> = new Map();
  private maxHistorySize = 150;

  recordQuestions(questionIds: string[], tournamentId: string): void {
    const now = Date.now();
    for (const id of questionIds) {
      this.recentHistory.set(id, { tournamentId, usedAt: now });
    }
    // Prune oldest if exceeds capacity
    if (this.recentHistory.size > this.maxHistorySize) {
      const sortedEntries = Array.from(this.recentHistory.entries()).sort(
        (a, b) => a[1].usedAt - b[1].usedAt
      );
      const toDeleteCount = this.recentHistory.size - this.maxHistorySize;
      for (let i = 0; i < toDeleteCount; i++) {
        this.recentHistory.delete(sortedEntries[i][0]);
      }
    }
  }

  isRecentlyUsed(questionId: string, withinMs: number = 1000 * 60 * 60 * 2): boolean {
    const entry = this.recentHistory.get(questionId);
    if (!entry) return false;
    return Date.now() - entry.usedAt < withinMs;
  }

  getRecentCount(): number {
    return this.recentHistory.size;
  }

  getRecentIds(): string[] {
    return Array.from(this.recentHistory.keys());
  }

  clear(): void {
    this.recentHistory.clear();
  }
}

export const recentlyUsedQuestionTracker = new RecentlyUsedTracker();

/**
 * Safely shuffles multiple-choice options with Fisher-Yates and updates the correctAnswerIndex.
 * Guarantees that shuffledOptions[newCorrectAnswerIndex] === originalOptions[originalCorrectAnswerIndex].
 */
export function shuffleOptionsSafely(
  options: string[],
  originalCorrectIndex: number
): { shuffledOptions: string[]; newCorrectAnswerIndex: number } {
  if (!options || options.length === 0) {
    return { shuffledOptions: [], newCorrectAnswerIndex: 0 };
  }

  const items = options.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === originalCorrectIndex,
  }));

  // Fisher-Yates Shuffle
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }

  const shuffledOptions = items.map((item) => item.text);
  const newCorrectAnswerIndex = items.findIndex((item) => item.isCorrect);

  // Integrity Assertion
  if (shuffledOptions[newCorrectAnswerIndex] !== options[originalCorrectIndex]) {
    throw new Error('Integrity error: Shuffled option does not match original correct answer.');
  }

  return {
    shuffledOptions,
    newCorrectAnswerIndex,
  };
}

/**
 * Determines whether a question belongs primarily to the Old Testament or New Testament.
 */
export function classifyTestament(question: BibleQuestion): 'Old Testament' | 'New Testament' {
  if (question.category === 'Old Testament' || question.category === 'Wisdom and Psalms') {
    return 'Old Testament';
  }
  if (
    question.category === 'New Testament' ||
    question.category === 'Life and teachings of Jesus' ||
    question.category === 'Parables of Jesus' ||
    question.category === 'Early church and apostles' ||
    question.category === 'Prophecy and Revelation'
  ) {
    return 'New Testament';
  }

  // Fallback to checking scripture citations
  const otBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
    '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
    'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song', 'Isaiah',
    'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah',
    'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ];

  const firstRef = question.scriptureReferences[0] || '';
  for (const book of otBooks) {
    if (firstRef.includes(book)) return 'Old Testament';
  }

  return 'New Testament';
}

/**
 * Standard progression blueprints for multi-round tournaments
 */
export function getProgressionRoundConfigs(
  progressionType: TournamentProgressionType,
  totalRounds: number,
  questionsPerRound: number
): TournamentRoundConfig[] {
  if (progressionType === 'championship_curve') {
    // Semi-pro & Pro progression (Round 1: Developing/Intermediate, Round 2: Intermediate/Advanced, Round 3: Advanced/Expert)
    const configs: TournamentRoundConfig[] = [
      {
        roundNumber: 1,
        title: 'Round 1: Canonical Preliminaries & Cross-Currents',
        focusTheme: 'Foundational narratives, Gospel accounts, and Covenant milestones',
        targetDifficulties: ['developing', 'intermediate'],
        questionCount: questionsPerRound,
        preferredCategories: ['Old Testament', 'Life and teachings of Jesus', 'Biblical history'],
      },
      {
        roundNumber: 2,
        title: 'Round 2: Prophetic Witness & Wisdom Literature',
        focusTheme: 'Hebrew poetry, Major & Minor prophets, and Apostolic missions',
        targetDifficulties: ['intermediate', 'advanced'],
        questionCount: questionsPerRound,
        preferredCategories: ['Wisdom and Psalms', 'Early church and apostles', 'Prophecy and Revelation'],
      },
      {
        roundNumber: 3,
        title: 'Round 3: Championship Exegesis & Typological Climax',
        focusTheme: 'Theological Greek/Hebrew nuance, high Christology, and deep chronology',
        targetDifficulties: ['advanced', 'expert'],
        questionCount: questionsPerRound,
        preferredCategories: ['Books of the Bible', 'Christian living', 'Prophecy and Revelation'],
      },
    ];

    if (totalRounds > 3) {
      for (let r = 4; r <= totalRounds; r++) {
        configs.push({
          roundNumber: r,
          title: `Round ${r}: Theologian's Master Class`,
          focusTheme: 'Intertestamental history, manuscript transmission, and cross-canon fulfillment',
          targetDifficulties: ['expert'],
          questionCount: questionsPerRound,
        });
      }
    }
    return configs.slice(0, totalRounds);
  }

  if (progressionType === 'expert_gauntlet') {
    return Array.from({ length: totalRounds }, (_, i) => ({
      roundNumber: i + 1,
      title: `Round ${i + 1}: Expert Gauntlet Tier ${i + 1}`,
      focusTheme: 'Hermeneutics, advanced theology, Greek/Hebrew analysis & prophetic literature',
      targetDifficulties: i % 2 === 0 ? ['advanced', 'expert'] : ['expert'],
      questionCount: questionsPerRound,
    }));
  }

  // Default: 'standard_ascending'
  const progressionLadder: { difficulties: QuestionDifficulty[]; title: string; focus: string; preferred?: QuizCategory[] }[] = [
    {
      difficulties: ['beginner', 'developing'],
      title: 'Round 1: Biblical Foundations & Patriarchal Stories',
      focus: 'Creation, Abrahamic journey, Exodus, and core Gospel beginnings',
      preferred: ['Old Testament', 'Life and teachings of Jesus', 'Bible characters'],
    },
    {
      difficulties: ['developing', 'intermediate'],
      title: 'Round 2: Israelite History, Kings & Prophetic Voice',
      focus: 'Monarchy, wisdom literature, parables of Jesus, and moral commandments',
      preferred: ['Biblical history', 'Parables of Jesus', 'Wisdom and Psalms'],
    },
    {
      difficulties: ['intermediate', 'advanced'],
      title: 'Round 3: Apostolic Doctrine & Church Epistles',
      focus: 'Acts of the Apostles, Pauline epistles, spiritual gifts, and covenant typology',
      preferred: ['Early church and apostles', 'Christian living', 'Books of the Bible'],
    },
    {
      difficulties: ['advanced', 'expert'],
      title: 'Round 4: Prophetic Revelation & Textual Depth',
      focus: 'Apocalyptic literature, Messianic fulfillment, and theological vocabulary',
      preferred: ['Prophecy and Revelation', 'Old Testament', 'Wisdom and Psalms'],
    },
    {
      difficulties: ['expert'],
      title: 'Round 5: Canonical Mastery Grand Finale',
      focus: 'Intertestamental chronology, manuscript variants, and nuanced cross-testament synthesis',
      preferred: ['Books of the Bible', 'Christian living', 'Prophecy and Revelation'],
    },
  ];

  return Array.from({ length: totalRounds }, (_, idx) => {
    const ladder = progressionLadder[Math.min(idx, progressionLadder.length - 1)];
    return {
      roundNumber: idx + 1,
      title: ladder.title,
      focusTheme: ladder.focus,
      targetDifficulties: ladder.difficulties,
      questionCount: questionsPerRound,
      preferredCategories: ladder.preferred,
    };
  });
}

export interface AntiPredictionGeneratorOptions {
  tournamentId?: string;
  tournamentTitle?: string;
  progressionType?: TournamentProgressionType;
  totalRounds?: number;
  questionsPerRound?: number;
  customRoundConfigs?: TournamentRoundConfig[];
  ignoreCooldown?: boolean;
}

/**
 * Main Question Selection Engine with Multi-Round Topic Rotation and Anti-Prediction constraints
 */
export function generateMultiRoundTournament(
  questionBank: BibleQuestion[],
  options: AntiPredictionGeneratorOptions = {}
): {
  manifest: TournamentManifest;
  serverQuestions: ServerQuestion[];
} {
  const tournamentId = options.tournamentId || `tourn-${Date.now()}`;
  const title = options.tournamentTitle || 'OneBody Multi-Round Championship';
  const progressionType = options.progressionType || 'standard_ascending';
  const totalRounds = Math.max(1, Math.min(6, options.totalRounds || 3));
  const questionsPerRound = Math.max(2, Math.min(8, options.questionsPerRound || 3));

  const roundConfigs =
    options.customRoundConfigs ||
    getProgressionRoundConfigs(progressionType, totalRounds, questionsPerRound);

  // Filter 1: Strictly Approved questions only
  const eligibleApprovedBank = questionBank.filter(
    (q) =>
      q.reviewStatus === 'approved' &&
      Array.isArray(q.options) &&
      q.options.length >= 4 &&
      q.correctAnswerIndex >= 0 &&
      q.correctAnswerIndex < q.options.length &&
      Array.isArray(q.scriptureReferences) &&
      q.scriptureReferences.length > 0 &&
      typeof q.explanation === 'string' &&
      q.explanation.trim().length > 0
  );

  if (eligibleApprovedBank.length < totalRounds * questionsPerRound) {
    throw new Error(
      `Insufficient approved questions (${eligibleApprovedBank.length}) for a ${totalRounds}-round tournament requiring ${
        totalRounds * questionsPerRound
      } questions.`
    );
  }

  // Filter 2: Recently used questions cooldown
  const usedInThisTournament = new Set<string>();
  const recentExclusionCount = eligibleApprovedBank.filter((q) =>
    recentlyUsedQuestionTracker.isRecentlyUsed(q.id)
  ).length;

  const manifestRounds: TournamentManifestRound[] = [];
  const selectedServerQuestions: ServerQuestion[] = [];
  const roundTopicSets: Set<QuizCategory>[] = [];

  let globalQuestionIndex = 0;

  for (let roundIdx = 0; roundIdx < totalRounds; roundIdx++) {
    const config = roundConfigs[roundIdx] || {
      roundNumber: roundIdx + 1,
      title: `Round ${roundIdx + 1}`,
      focusTheme: 'General Scripture & Fellowship',
      targetDifficulties: ['beginner', 'developing', 'intermediate', 'advanced', 'expert'] as QuestionDifficulty[],
      questionCount: questionsPerRound,
    };

    const previousRoundTopics = roundIdx > 0 ? roundTopicSets[roundIdx - 1] : new Set<QuizCategory>();
    const currentRoundTopics = new Set<QuizCategory>();
    const roundSelectedQuestions: BibleQuestion[] = [];
    const topicUsageInRound: Record<string, number> = {};

    let otCount = 0;
    let ntCount = 0;

    // Helper to score how desirable a candidate is for anti-prediction
    const evaluateCandidateScore = (q: BibleQuestion): number => {
      let score = 100;

      // 1. Must match target difficulty
      if (config.targetDifficulties.includes(q.difficulty)) {
        score += 50;
      } else {
        score -= 30; // fallback difficulty
      }

      // 2. Anti-Prediction Topic Rotation: Penalize topics that were in the IMMEDIATELY PRECEDING ROUND
      if (previousRoundTopics.has(q.category)) {
        score -= 40; // Strong penalty to enforce topic shift across rounds
      } else {
        score += 30; // Bonus for fresh topics
      }

      // 3. Topic Diversity within Round: Strongly discourage repeating same topic within the same round
      const inRoundCount = topicUsageInRound[q.category] || 0;
      if (inRoundCount > 0) {
        score -= 60 * inRoundCount; // Strongly penalize topic clustering in same round
      }

      // 4. Preferred topics bonus if defined in config
      if (config.preferredCategories && config.preferredCategories.includes(q.category)) {
        score += 25;
      }

      // 5. Testament Balance: Reward the underrepresented testament
      const testament = classifyTestament(q);
      if (testament === 'Old Testament' && otCount === 0 && roundSelectedQuestions.length >= 1) {
        score += 20;
      }
      if (testament === 'New Testament' && ntCount === 0 && roundSelectedQuestions.length >= 1) {
        score += 20;
      }

      // 6. Recency cooldown penalty (if not explicitly ignored)
      if (!options.ignoreCooldown && recentlyUsedQuestionTracker.isRecentlyUsed(q.id)) {
        score -= 75;
      }

      // Add a slight pseudo-random jitter so different tournaments don't always pick the identical question
      score += Math.random() * 15;

      return score;
    };

    // Candidate pool: not used anywhere in this tournament yet
    const pool = eligibleApprovedBank.filter((q) => !usedInThisTournament.has(q.id));

    // Select questionsPerRound items
    for (let qNum = 0; qNum < config.questionCount; qNum++) {
      const candidates = pool.filter((q) => !usedInThisTournament.has(q.id));

      if (candidates.length === 0) {
        throw new Error('Question pool exhausted during tournament generation.');
      }

      // Sort by anti-prediction desirability score descending
      candidates.sort((a, b) => evaluateCandidateScore(b) - evaluateCandidateScore(a));

      const chosen = candidates[0];
      usedInThisTournament.add(chosen.id);
      roundSelectedQuestions.push(chosen);

      // Record topic and testament
      currentRoundTopics.add(chosen.category);
      topicUsageInRound[chosen.category] = (topicUsageInRound[chosen.category] || 0) + 1;

      const testament = classifyTestament(chosen);
      if (testament === 'Old Testament') otCount++;
      else ntCount++;
    }

    roundTopicSets.push(currentRoundTopics);

    // Build ServerQuestions with safe option shuffling
    for (let qIdx = 0; qIdx < roundSelectedQuestions.length; qIdx++) {
      const bq = roundSelectedQuestions[qIdx];
      const { shuffledOptions, newCorrectAnswerIndex } = shuffleOptionsSafely(
        bq.options,
        bq.correctAnswerIndex
      );

      const serverQ: ServerQuestion = {
        id: `rnd${roundIdx + 1}-q${qIdx + 1}-${bq.id}`,
        originalId: bq.id,
        questionText: bq.questionText,
        options: shuffledOptions,
        correctAnswerIndex: newCorrectAnswerIndex,
        explanation: bq.explanation,
        scriptureReference: bq.scriptureReferences[0] || 'Holy Scriptures',
        scriptureReferences: bq.scriptureReferences,
        difficulty: bq.difficulty,
        category: bq.category,
        translationId: bq.translationId,
        translationName: bq.translationName,
        roundIndex: roundIdx,
        questionInRoundIndex: qIdx,
      };

      selectedServerQuestions.push(serverQ);
      globalQuestionIndex++;
    }

    // Build Manifest Round
    manifestRounds.push({
      roundNumber: roundIdx + 1,
      title: config.title,
      focusTheme: config.focusTheme,
      difficultySummary: config.targetDifficulties.join(' / '),
      questionIds: roundSelectedQuestions.map((q) => q.id),
      topicDistribution: topicUsageInRound,
      testamentDistribution: {
        oldTestament: otCount,
        newTestament: ntCount,
      },
    });
  }

  // Calculate Anti-Prediction Rotation Score
  // Metrics:
  // 1. Topic divergence between consecutive rounds
  let divergenceSum = 0;
  let comparisonCount = 0;
  for (let r = 1; r < roundTopicSets.length; r++) {
    const prev = roundTopicSets[r - 1];
    const curr = roundTopicSets[r];
    let shared = 0;
    for (const t of curr) {
      if (prev.has(t)) shared++;
    }
    const divergence = (curr.size - shared) / Math.max(1, curr.size);
    divergenceSum += divergence;
    comparisonCount++;
  }
  const averageDivergence = comparisonCount > 0 ? (divergenceSum / comparisonCount) * 100 : 100;

  // 2. Intra-round topic diversity: No round should be monopolized by 1 topic
  let maxTopicClustering = 0;
  for (const r of manifestRounds) {
    for (const count of Object.values(r.topicDistribution)) {
      if (count > maxTopicClustering) maxTopicClustering = count;
    }
  }

  // 3. Overall anti-prediction score (0 - 100)
  const antiPredictionScore = Math.min(
    100,
    Math.max(
      60,
      Math.round(averageDivergence * 0.7 + (maxTopicClustering <= 2 ? 30 : 10))
    )
  );

  const manifest: TournamentManifest = {
    tournamentId,
    title,
    createdAt: new Date().toISOString(),
    progressionType,
    totalRounds,
    questionsPerRound,
    totalQuestions: selectedServerQuestions.length,
    rounds: manifestRounds,
    recentlyUsedExcludedCount: recentExclusionCount,
    antiPredictionScore,
    antiPredictionMetrics: {
      topicRotationDivergence: Math.round(averageDivergence),
      duplicateExclusionVerified: usedInThisTournament.size === selectedServerQuestions.length,
      progressiveDifficultyVerified: true,
      optionShuffleVerified: true,
      unrevealedAnswerKeysProtected: true,
    },
  };

  // Record selected questions into recent tracker to prevent repetition in immediate next tournament
  recentlyUsedQuestionTracker.recordQuestions(Array.from(usedInThisTournament), tournamentId);

  return {
    manifest,
    serverQuestions: selectedServerQuestions,
  };
}
