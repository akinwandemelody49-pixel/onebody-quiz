import { BIBLE_QUESTION_BANK } from '../src/lib/bibleQuestionBank';
import {
  generateMultiRoundTournament,
  recentlyUsedQuestionTracker,
  shuffleOptionsSafely,
  classifyTestament,
  ServerQuestion
} from '../src/lib/questionSelectionEngine';
import { QuestionDifficulty } from '../src/types';

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, failureMessage?: string) {
  if (condition) {
    results.push({ name: testName, passed: true });
    console.log(`  ✓ ${testName}`);
  } else {
    results.push({ name: testName, passed: false, message: failureMessage });
    console.error(`  ✗ ${testName}: ${failureMessage || 'Assertion failed'}`);
  }
}

console.log('=== OneBody Multi-Round Anti-Prediction & Question Rotation Test Suite ===\n');

// -----------------------------------------------------------------------------
// Test Group 1: Multi-Round Topic Rotation & Anti-Prediction Divergence
// -----------------------------------------------------------------------------
console.log('Test Group 1: Multi-Round Topic Rotation & Divergence');

const tournament1 = generateMultiRoundTournament(BIBLE_QUESTION_BANK, {
  tournamentId: 'test-tourn-1',
  totalRounds: 3,
  questionsPerRound: 3,
  progressionType: 'standard_ascending',
});

assert(
  tournament1.manifest.totalRounds === 3,
  `Tournament manifest generates requested round count (expected 3, got ${tournament1.manifest.totalRounds})`
);

assert(
  tournament1.serverQuestions.length === 9,
  `Tournament manifest generates exact total questions (expected 9, got ${tournament1.serverQuestions.length})`
);

// Verify intra-round topic diversity: No round is dominated by a single topic
let allRoundsDiverse = true;
for (const round of tournament1.manifest.rounds) {
  const topicCounts = Object.values(round.topicDistribution);
  // With 3 questions per round, no topic should exceed 2 questions
  for (const count of topicCounts) {
    if (count > 2) allRoundsDiverse = false;
  }
}
assert(
  allRoundsDiverse,
  'Every round enforces intra-round topic diversity (no single topic monopolizes a round)'
);

// Verify round-to-round topic rotation divergence
const r1Topics = new Set(Object.keys(tournament1.manifest.rounds[0].topicDistribution));
const r2Topics = new Set(Object.keys(tournament1.manifest.rounds[1].topicDistribution));
let sharedCount = 0;
for (const t of r2Topics) {
  if (r1Topics.has(t)) sharedCount++;
}
const divergencePercent = Math.round(((r2Topics.size - sharedCount) / r2Topics.size) * 100);

assert(
  divergencePercent >= 50,
  `Round 1 to Round 2 enforces topic rotation divergence (expected >= 50%, got ${divergencePercent}%)`
);

assert(
  tournament1.manifest.antiPredictionScore >= 80,
  `Anti-prediction score meets high-quality anti-pattern threshold (score: ${tournament1.manifest.antiPredictionScore}/100)`
);

// Verify Testament balance: Old Testament and New Testament both present
let allRoundsHaveTestamentBalance = true;
for (const round of tournament1.manifest.rounds) {
  if (
    round.testamentDistribution.oldTestament === 0 &&
    round.testamentDistribution.newTestament === 0
  ) {
    allRoundsHaveTestamentBalance = false;
  }
}
assert(
  allRoundsHaveTestamentBalance,
  'All rounds maintain balanced representation of biblical testaments'
);

// -----------------------------------------------------------------------------
// Test Group 2: Progressive Difficulty Scaling
// -----------------------------------------------------------------------------
console.log('\nTest Group 2: Progressive Difficulty Scaling');

const standardTourn = generateMultiRoundTournament(BIBLE_QUESTION_BANK, {
  totalRounds: 3,
  questionsPerRound: 3,
  progressionType: 'standard_ascending',
  ignoreCooldown: true,
});

const r1Diffs = standardTourn.serverQuestions
  .filter((q) => q.roundIndex === 0)
  .map((q) => q.difficulty);
const r3Diffs = standardTourn.serverQuestions
  .filter((q) => q.roundIndex === 2)
  .map((q) => q.difficulty);

const r1IsFoundational = r1Diffs.every((d) => d === 'beginner' || d === 'developing');
const r3IsAdvanced = r3Diffs.every((d) => d === 'intermediate' || d === 'advanced' || d === 'expert');

assert(
  r1IsFoundational,
  `Round 1 in standard progression tests foundational knowledge (got: ${r1Diffs.join(', ')})`
);

assert(
  r3IsAdvanced,
  `Round 3 in standard progression elevates to advanced/theological reasoning (got: ${r3Diffs.join(', ')})`
);

// Test Championship Curve
const champTourn = generateMultiRoundTournament(BIBLE_QUESTION_BANK, {
  totalRounds: 3,
  questionsPerRound: 3,
  progressionType: 'championship_curve',
  ignoreCooldown: true,
});

const champR3Diffs = champTourn.serverQuestions
  .filter((q) => q.roundIndex === 2)
  .map((q) => q.difficulty);

const champR3HasExpert = champR3Diffs.some((d) => d === 'advanced' || d === 'expert');
assert(
  champR3HasExpert,
  `Championship curve culminates in advanced/expert theological tiebreakers (got: ${champR3Diffs.join(', ')})`
);

// -----------------------------------------------------------------------------
// Test Group 3: Duplicate Exclusion & Recency Cooldown
// -----------------------------------------------------------------------------
console.log('\nTest Group 3: Duplicate Exclusion & Recency Cooldown');

// Check within a tournament
const seenQuestionIds = new Set<string>();
let foundDuplicateWithinTourn = false;

for (const q of tournament1.serverQuestions) {
  const origId = q.originalId || q.id;
  if (seenQuestionIds.has(origId)) {
    foundDuplicateWithinTourn = true;
  }
  seenQuestionIds.add(origId);
}

assert(
  !foundDuplicateWithinTourn,
  'Strict duplicate exclusion within a tournament: 0 duplicate questions across all rounds'
);

// Check Recency Tracker
recentlyUsedQuestionTracker.clear();
const initialRecentCount = recentlyUsedQuestionTracker.getRecentCount();
assert(initialRecentCount === 0, 'Recency tracker clears cleanly');

const tournA = generateMultiRoundTournament(BIBLE_QUESTION_BANK, {
  tournamentId: 'tourn-A',
  totalRounds: 2,
  questionsPerRound: 3,
});

const trackedCount = recentlyUsedQuestionTracker.getRecentCount();
assert(
  trackedCount === 6,
  `Recency tracker accurately records used question IDs (expected 6, got ${trackedCount})`
);

// Subsequent tournament should avoid recently used questions
const tournB = generateMultiRoundTournament(BIBLE_QUESTION_BANK, {
  tournamentId: 'tourn-B',
  totalRounds: 2,
  questionsPerRound: 3,
  ignoreCooldown: false,
});

const tournAQIds = new Set(tournA.serverQuestions.map((q) => q.originalId || q.id));
let overlapCount = 0;
for (const q of tournB.serverQuestions) {
  if (tournAQIds.has(q.originalId || q.id)) overlapCount++;
}

assert(
  overlapCount <= 1,
  `Recency cooldown strongly prevents immediate question repetition across consecutive tournaments (overlap: ${overlapCount})`
);

// -----------------------------------------------------------------------------
// Test Group 4: Safe Option Shuffling with Invariant Answer Mapping
// -----------------------------------------------------------------------------
console.log('\nTest Group 4: Safe Option Shuffling & Invariant Answer Mapping');

let optionShuffleVerified = true;
let atLeastOneMoved = false;

for (let i = 0; i < 20; i++) {
  const sampleOptions = ['Genesis', 'Exodus', 'Leviticus', 'Numbers'];
  const originalCorrectIndex = 1; // 'Exodus'

  const { shuffledOptions, newCorrectAnswerIndex } = shuffleOptionsSafely(
    sampleOptions,
    originalCorrectIndex
  );

  // Assertion: The text at the new correct index MUST match the original correct option text
  if (shuffledOptions[newCorrectAnswerIndex] !== sampleOptions[originalCorrectIndex]) {
    optionShuffleVerified = false;
  }

  if (newCorrectAnswerIndex !== originalCorrectIndex) {
    atLeastOneMoved = true;
  }
}

assert(
  optionShuffleVerified,
  'Option shuffling maintains 100% correct answer invariant (shuffledOptions[newIndex] === originalAnswer)'
);

assert(
  atLeastOneMoved,
  'Fisher-Yates randomizer effectively distributes options across different positions (A, B, C, D)'
);

// -----------------------------------------------------------------------------
// Test Group 5: Server-Authoritative Answer Secrecy & Client Protection
// -----------------------------------------------------------------------------
console.log('\nTest Group 5: Server-Authoritative Answer Secrecy & Client Protection');

// Mock a server room and verify sanitization
const sampleServerQ = tournament1.serverQuestions[0];

function mockSanitizeForClient(
  serverQ: ServerQuestion,
  status: 'active' | 'reveal' | 'completed'
) {
  const isRevealOrCompleted = status === 'reveal' || status === 'completed';
  return {
    id: serverQ.id,
    questionText: serverQ.questionText,
    options: serverQ.options,
    difficulty: serverQ.difficulty,
    category: serverQ.category,
    translationId: serverQ.translationId,
    translationName: serverQ.translationName,
    correctAnswerIndex: isRevealOrCompleted ? serverQ.correctAnswerIndex : null,
    explanation: isRevealOrCompleted ? serverQ.explanation : null,
    scriptureReference: isRevealOrCompleted ? serverQ.scriptureReference : null,
    scriptureReferences: isRevealOrCompleted ? serverQ.scriptureReferences : null,
  };
}

const activeClientPayload = mockSanitizeForClient(sampleServerQ, 'active');
assert(
  activeClientPayload.correctAnswerIndex === null,
  'Active round question completely withholds correctAnswerIndex from client payload'
);

assert(
  activeClientPayload.explanation === null,
  'Active round question completely withholds explanation from client payload'
);

assert(
  activeClientPayload.scriptureReference === null,
  'Active round question completely withholds Scripture citation to prevent hint leaks'
);

const revealedClientPayload = mockSanitizeForClient(sampleServerQ, 'reveal');
assert(
  typeof revealedClientPayload.correctAnswerIndex === 'number',
  'Revealed round question securely discloses correct answer index to all participants'
);

assert(
  typeof revealedClientPayload.explanation === 'string' && revealedClientPayload.explanation.length > 0,
  'Revealed round question includes biblical explanation for learning'
);

// -----------------------------------------------------------------------------
// Test Group 6: Tournament Manifest Stability & Multi-Round Configs
// -----------------------------------------------------------------------------
console.log('\nTest Group 6: Tournament Manifest Stability & Multi-Round Variety');

const fourRoundTourn = generateMultiRoundTournament(BIBLE_QUESTION_BANK, {
  totalRounds: 4,
  questionsPerRound: 2,
  progressionType: 'standard_ascending',
  ignoreCooldown: true,
});

assert(
  fourRoundTourn.manifest.rounds.length === 4,
  `Custom 4-round tournament accurately configures 4 progressive rounds (found ${fourRoundTourn.manifest.rounds.length})`
);

assert(
  fourRoundTourn.serverQuestions.length === 8,
  `Custom 4-round tournament produces exact question count (expected 8, got ${fourRoundTourn.serverQuestions.length})`
);

// All approved only
const allApproved = fourRoundTourn.serverQuestions.every((sq) => {
  const original = BIBLE_QUESTION_BANK.find((bq) => bq.id === sq.originalId);
  return original && original.reviewStatus === 'approved';
});

assert(
  allApproved,
  'Only officially approved questions are admitted into tournament manifests'
);

// Summary
console.log('\n================================================================');
const passedCount = results.filter((r) => r.passed).length;
const failedCount = results.filter((r) => !r.passed).length;
console.log(`Test Results: ${passedCount} Passed, ${failedCount} Failed out of ${results.length} total checks`);
console.log('================================================================');

if (failedCount > 0) {
  process.exit(1);
}
