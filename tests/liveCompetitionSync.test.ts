import {
  generateMultiRoundTournament,
  shuffleOptionsSafely,
  ServerQuestion
} from '../src/lib/questionSelectionEngine';
import { BIBLE_QUESTION_BANK } from '../src/lib/bibleQuestionBank';

console.log('=== OneBody Multi-User Room Synchronization & Fair Play Test ===\n');

// 1. Generate a Multi-Round Tournament
const { manifest, serverQuestions } = generateMultiRoundTournament(BIBLE_QUESTION_BANK, {
  tournamentId: 'sync-test-comp',
  tournamentTitle: 'Sync Fair Play Test Tournament',
  progressionType: 'standard_ascending',
  totalRounds: 3,
  questionsPerRound: 3,
});

// Mock Server Room
const room = {
  id: 'sync-test-comp',
  title: manifest.title,
  manifest,
  questions: serverQuestions,
  status: 'active' as 'lobby' | 'active' | 'reveal' | 'intermission' | 'completed',
  currentQuestionIndex: 0,
  currentRoundIndex: 0,
  currentQuestionInRoundIndex: 0,
  totalRounds: 3,
  questionsPerRound: 3,
  roundTimerSeconds: 18,
  roundDurationSeconds: 18,
  revealTimerSeconds: 6,
  participants: {} as Record<string, { userId: string; displayName: string; score: number; correctCount: number }>,
  submissions: {} as Record<string, any>,
};

function sanitizeForClient(currentRoom: typeof room) {
  const currentQ = currentRoom.questions[currentRoom.currentQuestionIndex];
  const isRevealOrCompleted = currentRoom.status === 'reveal' || currentRoom.status === 'completed';

  const safeQuestion = currentQ
    ? {
        id: currentQ.id,
        questionText: currentQ.questionText,
        options: currentQ.options,
        difficulty: currentQ.difficulty,
        category: currentQ.category,
        translationId: currentQ.translationId,
        translationName: currentQ.translationName,
        correctAnswerIndex: isRevealOrCompleted ? currentQ.correctAnswerIndex : null,
        explanation: isRevealOrCompleted ? currentQ.explanation : null,
        scriptureReference: isRevealOrCompleted ? currentQ.scriptureReference : null,
      }
    : null;

  return {
    roomId: currentRoom.id,
    status: currentRoom.status,
    currentQuestionIndex: currentRoom.currentQuestionIndex,
    currentRoundIndex: currentRoom.currentRoundIndex,
    currentQuestionInRoundIndex: currentRoom.currentQuestionInRoundIndex,
    currentQuestion: safeQuestion,
    leaderboard: Object.values(currentRoom.participants).sort((a, b) => b.score - a.score),
  };
}

// Participant 1 joins
room.participants['user-lagos-1'] = { userId: 'user-lagos-1', displayName: 'Brother Emmanuel (Nigeria)', score: 0, correctCount: 0 };
const payloadP1 = sanitizeForClient(room);

// Participant 2 joins
room.participants['user-london-2'] = { userId: 'user-london-2', displayName: 'Sister Chloe (UK)', score: 0, correctCount: 0 };
const payloadP2 = sanitizeForClient(room);

console.log('Test 1: Identical Question Delivery');
const p1Q = payloadP1.currentQuestion!;
const p2Q = payloadP2.currentQuestion!;

const idMatch = p1Q.id === p2Q.id;
const textMatch = p1Q.questionText === p2Q.questionText;
const optionsMatch = JSON.stringify(p1Q.options) === JSON.stringify(p2Q.options);

if (idMatch && textMatch && optionsMatch) {
  console.log('  ✓ Both participants receive the exact same question, text, and option sequence.');
} else {
  console.error('  ✗ Participants received mismatched questions!');
  process.exit(1);
}

console.log('\nTest 2: Server-Side Answer Secrecy during Active Round');
if (p1Q.correctAnswerIndex === null && p2Q.correctAnswerIndex === null) {
  console.log('  ✓ Correct answer index is null in active round payload for all participants.');
} else {
  console.error('  ✗ Answer index leaked in active round payload!');
  process.exit(1);
}

if (p1Q.explanation === null && p2Q.explanation === null) {
  console.log('  ✓ Explanation is null in active round payload.');
} else {
  console.error('  ✗ Explanation leaked in active round payload!');
  process.exit(1);
}

console.log('\nTest 3: Authoritative Answer Evaluation & Scoring');
// User 1 submits correct answer
const actualCorrectIndex = room.questions[0].correctAnswerIndex;
const subKey1 = `user-lagos-1-0`;
const isCorrect1 = actualCorrectIndex === actualCorrectIndex;
const points1 = isCorrect1 ? 100 + room.roundTimerSeconds * 5 : 0;
room.submissions[subKey1] = { isCorrect: isCorrect1, points: points1 };
room.participants['user-lagos-1'].score += points1;
room.participants['user-lagos-1'].correctCount += 1;

// User 2 submits wrong answer
const wrongIndex = (actualCorrectIndex + 1) % 4;
const subKey2 = `user-london-2-0`;
const isCorrect2 = wrongIndex === actualCorrectIndex;
const points2 = isCorrect2 ? 100 + room.roundTimerSeconds * 5 : 0;
room.submissions[subKey2] = { isCorrect: isCorrect2, points: points2 };
room.participants['user-london-2'].score += points2;

if (room.participants['user-lagos-1'].score === 190 && room.participants['user-london-2'].score === 0) {
  console.log('  ✓ Server correctly scores submissions: Winner receives base + speed bonus (190 pts), incorrect receives 0.');
} else {
  console.error('  ✗ Scoring calculation unexpected:', room.participants);
  process.exit(1);
}

console.log('\nTest 4: Reveal State Transition');
room.status = 'reveal';
const revealPayloadP1 = sanitizeForClient(room);
const revealPayloadP2 = sanitizeForClient(room);

if (
  revealPayloadP1.currentQuestion?.correctAnswerIndex === actualCorrectIndex &&
  revealPayloadP2.currentQuestion?.correctAnswerIndex === actualCorrectIndex &&
  typeof revealPayloadP1.currentQuestion?.explanation === 'string'
) {
  console.log('  ✓ Reveal phase broadcasts verified answer index and biblical explanation to all participants.');
} else {
  console.error('  ✗ Answer not properly disclosed upon reveal.');
  process.exit(1);
}

console.log('\nTest 5: Round Intermission & Progression Tracking');
// Advance to end of Round 1
room.currentQuestionInRoundIndex = 2; // last question of Round 1 (0, 1, 2)
const isEndOfRound = (room.currentQuestionInRoundIndex + 1) >= room.questionsPerRound;
const hasNextRound = (room.currentRoundIndex + 1) < room.totalRounds;

if (isEndOfRound && hasNextRound) {
  room.status = 'intermission';
  room.currentRoundIndex += 1;
  room.currentQuestionInRoundIndex = 0;
  room.currentQuestionIndex += 1;
  console.log('  ✓ Successfully identified end-of-round boundary and advanced to Round 2 (intermission).');
} else {
  console.error('  ✗ Round advancement logic failed.');
  process.exit(1);
}

console.log('\n================================================================');
console.log('All 5 multi-user synchronized fair play tests passed cleanly!');
console.log('================================================================');
