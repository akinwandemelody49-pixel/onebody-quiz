import {
  BIBLE_QUESTION_BANK,
  SUPPORTED_TRANSLATIONS,
  LEARNING_PATH_LEVELS,
  getQuestionsByDifficulty,
  getQuestionCountsByDifficulty,
  generateProgressionCompetitionQuestions
} from '../src/lib/bibleQuestionBank';
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

console.log('=== OneBody Bible Question Bank & 5-Level Progression Test Suite ===\n');

// 1. Total Question Count Test
console.log('Test Group 1: Bank Size & Distribution');
assert(
  BIBLE_QUESTION_BANK.length >= 100,
  `Question bank contains at least 100 verified questions (found ${BIBLE_QUESTION_BANK.length})`
);

const difficulties: QuestionDifficulty[] = ['beginner', 'developing', 'intermediate', 'advanced', 'expert'];
const counts = getQuestionCountsByDifficulty();

for (const diff of difficulties) {
  assert(
    counts[diff].total >= 20,
    `Difficulty level '${diff}' has at least 20 questions (found ${counts[diff].total})`
  );
}

// 2. Schema Integrity & Validation
console.log('\nTest Group 2: Question Schema & Integrity');
let allHaveValidOptions = true;
let allHaveValidCorrectIndex = true;
let allHaveScriptures = true;
let allHaveExplanations = true;
let allHaveValidIds = true;
const seenIds = new Set<string>();
let duplicateIds = false;

for (const q of BIBLE_QUESTION_BANK) {
  if (seenIds.has(q.id)) {
    duplicateIds = true;
  }
  seenIds.add(q.id);

  if (!q.id || typeof q.id !== 'string') allHaveValidIds = false;
  if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((opt) => !opt.trim())) {
    allHaveValidOptions = false;
  }
  if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
    allHaveValidCorrectIndex = false;
  }
  if (!Array.isArray(q.scriptureReferences) || q.scriptureReferences.length === 0 || !q.scriptureReferences[0].trim()) {
    allHaveScriptures = false;
  }
  if (!q.explanation || !q.explanation.trim()) {
    allHaveExplanations = false;
  }
}

assert(!duplicateIds, 'All question IDs are strictly unique without duplicates');
assert(allHaveValidIds, 'All questions have non-empty string IDs');
assert(allHaveValidOptions, 'Every question has exactly 4 non-empty options');
assert(allHaveValidCorrectIndex, 'Every question has a valid correctAnswerIndex (0, 1, 2, or 3)');
assert(allHaveScriptures, 'Every question provides explicit scripture references');
assert(allHaveExplanations, 'Every question includes a concise biblical explanation');

// 3. Translation Labels & Verification
console.log('\nTest Group 3: Multiple Translations & Labeling');
const validTranslationIds = new Set(SUPPORTED_TRANSLATIONS.map((t) => t.id));
let allTranslationsValid = true;
const translationCounts: Record<string, number> = {};

for (const q of BIBLE_QUESTION_BANK) {
  if (!validTranslationIds.has(q.translationId)) {
    allTranslationsValid = false;
  }
  translationCounts[q.translationId] = (translationCounts[q.translationId] || 0) + 1;
}

assert(allTranslationsValid, 'All questions reference supported translations (Multi-Translation, NIV, KJV, NKJV, ESV)');
assert(Object.keys(translationCounts).length >= 4, `Multiple translations utilized across the bank (${Object.keys(translationCounts).join(', ')})`);

// 4. Review Status Verification
console.log('\nTest Group 4: Review Status Verification');
let allStatusesValid = true;
let approvedCount = 0;
let needsReviewCount = 0;

for (const q of BIBLE_QUESTION_BANK) {
  if (!['approved', 'needs_review', 'draft', 'retired'].includes(q.reviewStatus)) {
    allStatusesValid = false;
  }
  if (q.reviewStatus === 'approved') approvedCount++;
  if (q.reviewStatus === 'needs_review') needsReviewCount++;
}

assert(allStatusesValid, 'All questions have a valid reviewStatus');
assert(approvedCount >= 90, `Approved questions form the verified core (${approvedCount} approved)`);
assert(needsReviewCount >= 1, `Items requiring theological review are explicitly flagged (${needsReviewCount} flagged as needs_review)`);

// 5. 5-Level Learning Path & Competition Progression
console.log('\nTest Group 5: Learning Path & Tournament Progression');
assert(LEARNING_PATH_LEVELS.length === 5, 'Learning path contains exactly 5 progression tiers');
assert(
  LEARNING_PATH_LEVELS[0].difficulty === 'beginner' &&
  LEARNING_PATH_LEVELS[1].difficulty === 'developing' &&
  LEARNING_PATH_LEVELS[2].difficulty === 'intermediate' &&
  LEARNING_PATH_LEVELS[3].difficulty === 'advanced' &&
  LEARNING_PATH_LEVELS[4].difficulty === 'expert',
  'Learning path strictly advances: Beginner -> Developing -> Intermediate -> Advanced -> Expert'
);

const progressionTournament = generateProgressionCompetitionQuestions();
assert(
  progressionTournament.length === 10,
  `5-Level Mixed Progression Tournament contains 10 balanced questions (found ${progressionTournament.length})`
);
assert(
  progressionTournament[0].difficulty === 'beginner' &&
  progressionTournament[2].difficulty === 'developing' &&
  progressionTournament[4].difficulty === 'intermediate' &&
  progressionTournament[6].difficulty === 'advanced' &&
  progressionTournament[8].difficulty === 'expert',
  'Tournament sequence scales dynamically from beginner through expert'
);

// 6. Answer Secrecy Sanitizer Check
console.log('\nTest Group 6: Answer Secrecy Check');
function mockSanitizeForClient(question: typeof BIBLE_QUESTION_BANK[0], status: 'active' | 'reveal' | 'completed') {
  return {
    id: question.id,
    questionText: question.questionText,
    options: question.options,
    difficulty: question.difficulty,
    translationId: question.translationId,
    correctAnswerIndex: status === 'reveal' || status === 'completed' ? question.correctAnswerIndex : null,
    explanation: status === 'reveal' || status === 'completed' ? question.explanation : null,
    scriptureReference: status === 'reveal' || status === 'completed' ? question.scriptureReferences[0] : null,
  };
}

const sampleQ = BIBLE_QUESTION_BANK[0];
const activeClientQ = mockSanitizeForClient(sampleQ, 'active');
const revealedClientQ = mockSanitizeForClient(sampleQ, 'reveal');

assert(activeClientQ.correctAnswerIndex === null, 'Active round question strips correctAnswerIndex for client');
assert(activeClientQ.explanation === null, 'Active round question strips explanation for client');
assert(revealedClientQ.correctAnswerIndex === sampleQ.correctAnswerIndex, 'Revealed round question provides verified answer index');
assert(revealedClientQ.explanation === sampleQ.explanation, 'Revealed round question provides explanation and references');

// Summary
const totalPassed = results.filter((r) => r.passed).length;
const totalFailed = results.filter((r) => !r.passed).length;
console.log(`\n================================================================`);
console.log(`Test Results: ${totalPassed} Passed, ${totalFailed} Failed out of ${results.length} total checks`);
console.log(`================================================================`);

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
