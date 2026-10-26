import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { AccessToken } from 'livekit-server-sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --------------------------------------------------------------------------
// LIVEKIT INTEGRATION: Token Generation & Status
// --------------------------------------------------------------------------
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';
const LIVEKIT_URL = process.env.LIVEKIT_URL || '';

app.get('/api/livekit/status', (_req: Request, res: Response) => {
  const isConfigured = Boolean(LIVEKIT_API_KEY && LIVEKIT_API_SECRET && LIVEKIT_URL);
  res.json({
    configured: isConfigured,
    url: isConfigured ? LIVEKIT_URL : null,
  });
});

app.post('/api/livekit/token', async (req: Request, res: Response) => {
  try {
    const { roomName, participantName, identity, isHost } = req.body;

    if (!roomName || !identity) {
      return res.status(400).json({ error: 'roomName and identity are required' });
    }

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      return res.status(200).json({
        configured: false,
        message:
          'LiveKit voice server credentials (LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL) are not yet configured in environment secrets.',
      });
    }

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name: participantName || identity,
      ttl: '2h',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: Boolean(isHost),
    });

    const token = await at.toJwt();

    return res.json({
      configured: true,
      token,
      url: LIVEKIT_URL,
    });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return res.status(500).json({ error: 'Failed to generate voice room access token' });
  }
});

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// SERVER-AUTHORITATIVE LIVE QUIZ COMPETITION ENGINE & 5-LEVEL QUESTION BANK
// --------------------------------------------------------------------------
import {
  BIBLE_QUESTION_BANK,
  SUPPORTED_TRANSLATIONS,
  LEARNING_PATH_LEVELS,
  generateProgressionCompetitionQuestions,
  getQuestionsByDifficulty
} from './src/lib/bibleQuestionBank.js';
import { BibleQuestion } from './src/types/index.js';

// In-memory runtime store for dynamically added/updated questions
let runtimeQuestionBank: BibleQuestion[] = [...BIBLE_QUESTION_BANK];

export interface ServerQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  scriptureReference: string;
  scriptureReferences?: string[];
  difficulty?: string;
  translationId?: string;
  translationName?: string;
}

export interface CompetitionRoom {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  durationMinutes: number;
  scheduledStartTime: string;
  status: 'upcoming' | 'lobby' | 'active' | 'reveal' | 'completed';
  currentQuestionIndex: number;
  roundTimerSeconds: number;
  roundDurationSeconds: number;
  revealTimerSeconds: number;
  revealDurationSeconds: number;
  questions: ServerQuestion[];
  participants: Record<
    string,
    {
      userId: string;
      displayName: string;
      country: string;
      photoURL?: string;
      score: number;
      correctCount: number;
      lastSubmittedRound?: number;
      lastSubmissionTime?: number;
    }
  >;
  submissions: Record<
    string, // `${userId}-${questionIndex}`
    {
      userId: string;
      questionIndex: number;
      selectedOption: number;
      isCorrect: boolean;
      pointsAwarded: number;
      submittedAt: number;
    }
  >;
  timerInterval?: NodeJS.Timeout | null;
}

// Convert BibleQuestion from bank into ServerQuestion
function toServerQuestion(q: BibleQuestion): ServerQuestion {
  return {
    id: q.id,
    questionText: q.questionText,
    options: q.options,
    correctAnswerIndex: q.correctAnswerIndex,
    explanation: q.explanation,
    scriptureReference: q.scriptureReferences[0] || 'Holy Scriptures',
    scriptureReferences: q.scriptureReferences,
    difficulty: q.difficulty,
    translationId: q.translationId,
    translationName: q.translationName,
  };
}

const SERVER_COMPETITIONS: Record<string, CompetitionRoom> = {
  // 1. Beginner Level Tournament
  'comp-beginner-foundations': {
    id: 'comp-beginner-foundations',
    title: 'Beginner Believers Cup: Biblical Foundations',
    category: 'Old Testament',
    difficulty: 'beginner',
    durationMinutes: 15,
    scheduledStartTime: new Date(Date.now() + 1000 * 60 * 60 * 1).toISOString(),
    status: 'lobby',
    currentQuestionIndex: 0,
    roundTimerSeconds: 15,
    roundDurationSeconds: 15,
    revealTimerSeconds: 6,
    revealDurationSeconds: 6,
    questions: getQuestionsByDifficulty('beginner').slice(0, 5).map(toServerQuestion),
    participants: {},
    submissions: {},
  },
  // 2. Developing Level Tournament
  'comp-developing-disciples': {
    id: 'comp-developing-disciples',
    title: 'Discipleship Journey: Teachings & Covenants',
    category: 'Life and teachings of Jesus',
    difficulty: 'developing',
    durationMinutes: 15,
    scheduledStartTime: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    status: 'lobby',
    currentQuestionIndex: 0,
    roundTimerSeconds: 15,
    roundDurationSeconds: 15,
    revealTimerSeconds: 6,
    revealDurationSeconds: 6,
    questions: getQuestionsByDifficulty('developing').slice(0, 5).map(toServerQuestion),
    participants: {},
    submissions: {},
  },
  // 3. Intermediate Level Tournament
  'comp-global-pentecost': {
    id: 'comp-global-pentecost',
    title: 'Global Nations Pentecost Cup',
    category: 'New Testament',
    difficulty: 'intermediate',
    durationMinutes: 15,
    scheduledStartTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    status: 'lobby',
    currentQuestionIndex: 0,
    roundTimerSeconds: 15,
    roundDurationSeconds: 15,
    revealTimerSeconds: 6,
    revealDurationSeconds: 6,
    questions: getQuestionsByDifficulty('intermediate').slice(0, 5).map(toServerQuestion),
    participants: {},
    submissions: {},
  },
  // 4. Advanced Level Tournament
  'comp-advanced-bereans': {
    id: 'comp-advanced-bereans',
    title: 'Berean Prophecy & Exegesis Cup',
    category: 'Prophecy and Revelation',
    difficulty: 'advanced',
    durationMinutes: 18,
    scheduledStartTime: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    status: 'lobby',
    currentQuestionIndex: 0,
    roundTimerSeconds: 18,
    roundDurationSeconds: 18,
    revealTimerSeconds: 6,
    revealDurationSeconds: 6,
    questions: getQuestionsByDifficulty('advanced').slice(0, 5).map(toServerQuestion),
    participants: {},
    submissions: {},
  },
  // 5. Expert Level Tournament
  'comp-expert-masters': {
    id: 'comp-expert-masters',
    title: 'Theologian’s Quill: Deep Canon & Covenant Grand Prix',
    category: 'Wisdom and Psalms',
    difficulty: 'expert',
    durationMinutes: 20,
    scheduledStartTime: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    status: 'lobby',
    currentQuestionIndex: 0,
    roundTimerSeconds: 20,
    roundDurationSeconds: 20,
    revealTimerSeconds: 7,
    revealDurationSeconds: 7,
    questions: getQuestionsByDifficulty('expert').slice(0, 5).map(toServerQuestion),
    participants: {},
    submissions: {},
  },
  // 6. 5-Level Mixed Progression Tournament (Beginner -> Developing -> Intermediate -> Advanced -> Expert)
  'comp-5level-progression': {
    id: 'comp-5level-progression',
    title: 'OneBody 5-Level Mastery Championship (Beginner to Expert)',
    category: 'Christian living',
    difficulty: 'Mixed',
    durationMinutes: 25,
    scheduledStartTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    status: 'lobby',
    currentQuestionIndex: 0,
    roundTimerSeconds: 18,
    roundDurationSeconds: 18,
    revealTimerSeconds: 6,
    revealDurationSeconds: 6,
    questions: generateProgressionCompetitionQuestions().map(toServerQuestion),
    participants: {},
    submissions: {},
  },
};

// WebSocket Server attached to same HTTP server
const wss = new WebSocketServer({ server });

// Client connections mapped by competition room
const roomClients: Map<string, Set<WebSocket>> = new Map();

function broadcastToRoom(roomId: string, message: object) {
  const clients = roomClients.get(roomId);
  if (!clients) return;
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Strip correct answers before sending active question to clients
function sanitizeRoomForClient(room: CompetitionRoom) {
  const currentQ = room.questions[room.currentQuestionIndex];
  const isRevealOrCompleted = room.status === 'reveal' || room.status === 'completed';

  const safeQuestion = currentQ
    ? {
        id: currentQ.id,
        questionText: currentQ.questionText,
        options: currentQ.options,
        difficulty: currentQ.difficulty,
        translationId: currentQ.translationId,
        translationName: currentQ.translationName,
        // STRICT ANSWER SECRECY: Only reveal correct answer index, explanation, and references after round finishes
        correctAnswerIndex: isRevealOrCompleted ? currentQ.correctAnswerIndex : null,
        explanation: isRevealOrCompleted ? currentQ.explanation : null,
        scriptureReference: isRevealOrCompleted ? currentQ.scriptureReference : null,
        scriptureReferences: isRevealOrCompleted ? (currentQ.scriptureReferences || [currentQ.scriptureReference]) : null,
      }
    : null;

  const sortedLeaderboard = Object.values(room.participants).sort((a, b) => b.score - a.score);

  return {
    id: room.id,
    title: room.title,
    category: room.category,
    difficulty: room.difficulty,
    status: room.status,
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: room.questions.length,
    roundTimerSeconds: room.roundTimerSeconds,
    revealTimerSeconds: room.revealTimerSeconds,
    currentQuestion: safeQuestion,
    leaderboard: sortedLeaderboard,
    participantCount: Object.keys(room.participants).length,
    serverTime: Date.now(),
  };
}

function startAuthoritativeRoundTimer(room: CompetitionRoom) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }

  room.roundTimerSeconds = room.roundDurationSeconds;
  room.status = 'active';

  // Broadcast round start
  broadcastToRoom(room.id, {
    type: 'round_started',
    state: sanitizeRoomForClient(room),
  });

  room.timerInterval = setInterval(() => {
    room.roundTimerSeconds -= 1;

    // Send tick update every second
    broadcastToRoom(room.id, {
      type: 'timer_tick',
      roundTimerSeconds: room.roundTimerSeconds,
      status: room.status,
    });

    if (room.roundTimerSeconds <= 0) {
      if (room.timerInterval) clearInterval(room.timerInterval);
      room.timerInterval = null;
      transitionToReveal(room);
    }
  }, 1000);
}

function transitionToReveal(room: CompetitionRoom) {
  room.status = 'reveal';
  room.revealTimerSeconds = room.revealDurationSeconds;

  broadcastToRoom(room.id, {
    type: 'round_revealed',
    state: sanitizeRoomForClient(room),
  });

  room.timerInterval = setInterval(() => {
    room.revealTimerSeconds -= 1;

    broadcastToRoom(room.id, {
      type: 'reveal_tick',
      revealTimerSeconds: room.revealTimerSeconds,
    });

    if (room.revealTimerSeconds <= 0) {
      if (room.timerInterval) clearInterval(room.timerInterval);
      room.timerInterval = null;

      // Advance question or complete
      if (room.currentQuestionIndex + 1 < room.questions.length) {
        room.currentQuestionIndex += 1;
        startAuthoritativeRoundTimer(room);
      } else {
        // Competition completed
        room.status = 'completed';
        broadcastToRoom(room.id, {
          type: 'competition_completed',
          state: sanitizeRoomForClient(room),
        });
      }
    }
  }, 1000);
}

wss.on('connection', (ws: WebSocket) => {
  let joinedRoomId: string | null = null;
  let currentUserId: string | null = null;

  ws.on('message', (data: string) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'join_room': {
          let { roomId, user } = message;
          if (!roomId || !SERVER_COMPETITIONS[roomId]) {
            roomId = 'comp-global-pentecost';
          }

          joinedRoomId = roomId;
          currentUserId = user?.uid || 'guest-user';

          if (!roomClients.has(roomId)) {
            roomClients.set(roomId, new Set());
          }
          roomClients.get(roomId)!.add(ws);

          const room = SERVER_COMPETITIONS[roomId];

          // Register or update participant in server state
          if (!room.participants[user.uid]) {
            room.participants[user.uid] = {
              userId: user.uid,
              displayName: user.displayName || 'Fellow Believer',
              country: user.country || 'Global',
              photoURL: user.photoURL,
              score: 0,
              correctCount: 0,
            };
          }

          // Send current authoritative state to the joining client
          ws.send(
            JSON.stringify({
              type: 'room_state',
              state: sanitizeRoomForClient(room),
            })
          );

          // Broadcast updated participant list to all in room
          broadcastToRoom(roomId, {
            type: 'participant_joined',
            leaderboard: Object.values(room.participants).sort((a, b) => b.score - a.score),
            participantCount: Object.keys(room.participants).length,
          });
          break;
        }

        case 'submit_answer': {
          const { roomId, userId, questionIndex, selectedOption } = message;
          const room = SERVER_COMPETITIONS[roomId];

          if (!room) return;

          // STRICT SECURITY VALIDATION:
          // 1. Must be currently active round
          if (room.status !== 'active') {
            ws.send(JSON.stringify({ type: 'submission_rejected', reason: 'Round is not accepting answers' }));
            return;
          }

          // 2. Question index must match the server authoritative question index
          if (questionIndex !== room.currentQuestionIndex) {
            ws.send(JSON.stringify({ type: 'submission_rejected', reason: 'Invalid question round' }));
            return;
          }

          // 3. Time must not be expired
          if (room.roundTimerSeconds <= 0) {
            ws.send(JSON.stringify({ type: 'submission_rejected', reason: 'Timer expired' }));
            return;
          }

          // 4. Duplicate submission check
          const subKey = `${userId}-${questionIndex}`;
          if (room.submissions[subKey]) {
            ws.send(JSON.stringify({ type: 'submission_rejected', reason: 'Answer already submitted for this round' }));
            return;
          }

          // 5. Server evaluates correctness securely
          const currentQ = room.questions[questionIndex];
          const isCorrect = selectedOption === currentQ.correctAnswerIndex;
          const speedBonus = Math.max(10, room.roundTimerSeconds * 5);
          const pointsAwarded = isCorrect ? 100 + speedBonus : 0;

          // Record official submission on server
          room.submissions[subKey] = {
            userId,
            questionIndex,
            selectedOption,
            isCorrect,
            pointsAwarded,
            submittedAt: Date.now(),
          };

          const participant = room.participants[userId];
          if (participant) {
            participant.score += pointsAwarded;
            if (isCorrect) participant.correctCount += 1;
            participant.lastSubmittedRound = questionIndex;
            participant.lastSubmissionTime = Date.now();
          }

          // Acknowledge submission to the submitting user
          ws.send(
            JSON.stringify({
              type: 'submission_accepted',
              questionIndex,
              selectedOption,
              pointsAwarded,
            })
          );

          // Broadcast updated real-time score leaderboard
          broadcastToRoom(roomId, {
            type: 'leaderboard_updated',
            leaderboard: Object.values(room.participants).sort((a, b) => b.score - a.score),
          });
          break;
        }

        case 'start_competition':
        case 'admin_start_tournament': {
          let { roomId } = message;
          if (!roomId || !SERVER_COMPETITIONS[roomId]) {
            roomId = 'comp-global-pentecost';
          }
          const room = SERVER_COMPETITIONS[roomId];
          if (!room) return;

          room.currentQuestionIndex = 0;
          startAuthoritativeRoundTimer(room);
          break;
        }

        case 'admin_restart_tournament': {
          const { roomId } = message;
          const room = SERVER_COMPETITIONS[roomId];
          if (!room) return;

          if (room.timerInterval) {
            clearInterval(room.timerInterval);
            room.timerInterval = null;
          }

          room.status = 'lobby';
          room.currentQuestionIndex = 0;
          room.submissions = {};
          for (const key of Object.keys(room.participants)) {
            room.participants[key].score = 0;
            room.participants[key].correctCount = 0;
            delete room.participants[key].lastSubmittedRound;
          }

          broadcastToRoom(room.id, {
            type: 'tournament_reset',
            state: sanitizeRoomForClient(room),
          });
          break;
        }

        case 'fellowship_reaction': {
          const { roomId, emoji, senderName } = message;
          broadcastToRoom(roomId, {
            type: 'fellowship_reaction',
            emoji,
            senderName,
            id: `react-${Date.now()}-${Math.random()}`,
          });
          break;
        }
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  ws.on('close', () => {
    if (joinedRoomId && roomClients.has(joinedRoomId)) {
      roomClients.get(joinedRoomId)!.delete(ws);
    }
  });
});

// REST API endpoint to query scheduled competitions with server canonical time
app.get('/api/competitions', (_req: Request, res: Response) => {
  const list = Object.values(SERVER_COMPETITIONS).map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    difficulty: c.difficulty,
    durationMinutes: c.durationMinutes,
    scheduledStartTime: c.scheduledStartTime,
    status: c.status,
    totalQuestions: c.questions.length,
    participantCount: Object.keys(c.participants).length,
    canonicalServerTime: new Date().toISOString(),
  }));
  res.json({ competitions: list, serverTime: new Date().toISOString() });
});

// --------------------------------------------------------------------------
// QUESTION BANK REST APIS (Multi-Translation & 5-Level Progression)
// --------------------------------------------------------------------------

// 1. Get supported Bible translations
app.get('/api/translations', (_req: Request, res: Response) => {
  res.json({ translations: SUPPORTED_TRANSLATIONS });
});

// 2. Query questions from the Question Bank with server-enforced answer secrecy
app.get('/api/questions/bank', (req: Request, res: Response) => {
  const { difficulty, category, translation, status, search, includeAnswers } = req.query;
  const isAdmin = req.headers['x-admin-role'] === 'admin' || req.query.role === 'admin';

  let results = [...runtimeQuestionBank];

  // Filter by difficulty (5 levels)
  if (difficulty && difficulty !== 'All') {
    results = results.filter((q) => q.difficulty.toLowerCase() === String(difficulty).toLowerCase());
  }

  // Filter by category
  if (category && category !== 'All') {
    results = results.filter((q) => q.category === category);
  }

  // Filter by translation
  if (translation && translation !== 'All') {
    results = results.filter(
      (q) => q.translationId === translation || q.translationId === 'Multi-Translation'
    );
  }

  // Filter by review status (non-admins cannot see retired questions)
  if (status && status !== 'All') {
    results = results.filter((q) => q.reviewStatus === status);
  } else if (!isAdmin) {
    results = results.filter((q) => q.reviewStatus !== 'retired');
  }

  // Search by text or scripture reference
  if (search && typeof search === 'string' && search.trim()) {
    const qTerm = search.toLowerCase().trim();
    results = results.filter(
      (q) =>
        q.questionText.toLowerCase().includes(qTerm) ||
        q.explanation.toLowerCase().includes(qTerm) ||
        q.scriptureReferences.some((ref) => ref.toLowerCase().includes(qTerm))
    );
  }

  // Calculate difficulty counts
  const difficultyCounts = {
    beginner: runtimeQuestionBank.filter((q) => q.difficulty === 'beginner' && q.reviewStatus !== 'retired').length,
    developing: runtimeQuestionBank.filter((q) => q.difficulty === 'developing' && q.reviewStatus !== 'retired').length,
    intermediate: runtimeQuestionBank.filter((q) => q.difficulty === 'intermediate' && q.reviewStatus !== 'retired').length,
    advanced: runtimeQuestionBank.filter((q) => q.difficulty === 'advanced' && q.reviewStatus !== 'retired').length,
    expert: runtimeQuestionBank.filter((q) => q.difficulty === 'expert' && q.reviewStatus !== 'retired').length,
  };

  // ENFORCE SERVER-SIDE ANSWER SECRECY:
  // If not an admin request, hide the correctAnswerIndex!
  const safeQuestions = results.map((q) => {
    if (isAdmin && includeAnswers === 'true') {
      return q;
    }
    return {
      ...q,
      correctAnswerIndex: -1, // Hidden
    };
  });

  res.json({
    questions: safeQuestions,
    totalCount: results.length,
    difficultyCounts,
    translations: SUPPORTED_TRANSLATIONS,
    timestamp: new Date().toISOString(),
  });
});

// 3. Admin: Create a new verified question in the Question Bank
app.post('/api/questions/bank', (req: Request, res: Response) => {
  const isAdmin = req.headers['x-admin-role'] === 'admin' || req.body.isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized: Only authorized administrators can add questions.' });
  }

  const {
    questionText,
    options,
    correctAnswerIndex,
    difficulty,
    category,
    scriptureReferences,
    explanation,
    translationId,
    reviewStatus,
    verificationNotes,
    reviewedBy,
  } = req.body;

  if (!questionText || !options || !Array.isArray(options) || options.length !== 4) {
    return res.status(400).json({ error: 'A question must have text and exactly 4 options.' });
  }

  if (typeof correctAnswerIndex !== 'number' || correctAnswerIndex < 0 || correctAnswerIndex > 3) {
    return res.status(400).json({ error: 'Correct answer index must be between 0 and 3.' });
  }

  const validDifficulties = ['beginner', 'developing', 'intermediate', 'advanced', 'expert'];
  if (!validDifficulties.includes(String(difficulty).toLowerCase())) {
    return res.status(400).json({ error: 'Invalid difficulty. Must be beginner, developing, intermediate, advanced, or expert.' });
  }

  const translationInfo = SUPPORTED_TRANSLATIONS.find((t) => t.id === translationId) || SUPPORTED_TRANSLATIONS[0];

  const newQuestion: BibleQuestion = {
    id: `q-bank-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    questionText: questionText.trim(),
    options: options.map((opt: string) => String(opt).trim()),
    correctAnswerIndex,
    difficulty: difficulty.toLowerCase(),
    category: category || 'Old Testament',
    scriptureReferences: Array.isArray(scriptureReferences) ? scriptureReferences : [String(scriptureReferences || 'Scripture')],
    explanation: explanation ? explanation.trim() : 'Biblical truth verified.',
    translationId: translationInfo.id,
    translationName: translationInfo.name,
    reviewStatus: reviewStatus || 'needs_review',
    verificationNotes: verificationNotes || `Created via Admin Portal. Translation: ${translationInfo.name}`,
    reviewedBy: reviewedBy || 'Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  runtimeQuestionBank.unshift(newQuestion);

  res.status(201).json({ success: true, question: newQuestion });
});

// 4. Admin: Update question, change review status, or retire question
app.put('/api/questions/bank/:id', (req: Request, res: Response) => {
  const isAdmin = req.headers['x-admin-role'] === 'admin' || req.body.isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized: Administrator access required.' });
  }

  const { id } = req.params;
  const index = runtimeQuestionBank.findIndex((q) => q.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Question not found in question bank.' });
  }

  const existing = runtimeQuestionBank[index];
  const updated: BibleQuestion = {
    ...existing,
    ...req.body,
    id: existing.id, // keep immutable id
    updatedAt: new Date().toISOString(),
  };

  runtimeQuestionBank[index] = updated;

  res.json({ success: true, question: updated });
});

// 5. Learning Path: Get levels definition and requirements
app.get('/api/learning-path', (_req: Request, res: Response) => {
  res.json({
    levels: LEARNING_PATH_LEVELS,
    progressionRule: 'Score at least the required percentage to unlock the next spiritual growth milestone.',
  });
});

// 6. Learning Path: Start a learning path round (server provides questions with answer secrecy)
app.post('/api/learning-path/session', (req: Request, res: Response) => {
  const { levelNumber } = req.body;
  const targetLevel = LEARNING_PATH_LEVELS.find((l) => l.level === Number(levelNumber)) || LEARNING_PATH_LEVELS[0];

  const pool = runtimeQuestionBank.filter(
    (q) => q.difficulty === targetLevel.difficulty && q.reviewStatus !== 'retired'
  );

  // Take 10 questions
  const selectedQuestions = pool.slice(0, targetLevel.questionCount);

  // SANITIZE: omit answer key so client cannot inspect payload in devtools
  const safeSessionQuestions = selectedQuestions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    options: q.options,
    difficulty: q.difficulty,
    category: q.category,
    translationId: q.translationId,
    translationName: q.translationName,
  }));

  res.json({
    sessionId: `lp-sess-${Date.now()}`,
    level: targetLevel,
    questions: safeSessionQuestions,
    totalQuestions: safeSessionQuestions.length,
    timePerQuestionSeconds: 25,
  });
});

// 7. Learning Path: Server-Authoritative Verification of Completed Round
app.post('/api/learning-path/verify-round', (req: Request, res: Response) => {
  const { levelNumber, submissions } = req.body;
  const targetLevel = LEARNING_PATH_LEVELS.find((l) => l.level === Number(levelNumber)) || LEARNING_PATH_LEVELS[0];

  if (!submissions || !Array.isArray(submissions)) {
    return res.status(400).json({ error: 'Submissions array is required' });
  }

  let correctCount = 0;
  const results = submissions.map((sub: { questionId: string; selectedOption: number }) => {
    const question = runtimeQuestionBank.find((q) => q.id === sub.questionId);
    if (!question) {
      return {
        questionId: sub.questionId,
        isCorrect: false,
        correctAnswerIndex: -1,
        explanation: 'Question not found.',
        scriptureReferences: [],
      };
    }

    const isCorrect = sub.selectedOption === question.correctAnswerIndex;
    if (isCorrect) correctCount += 1;

    return {
      questionId: question.id,
      questionText: question.questionText,
      selectedOption: sub.selectedOption,
      correctAnswerIndex: question.correctAnswerIndex,
      isCorrect,
      explanation: question.explanation,
      scriptureReferences: question.scriptureReferences,
      translationName: question.translationName,
    };
  });

  const total = submissions.length || 1;
  const percentage = Math.round((correctCount / total) * 100);
  const passed = percentage >= targetLevel.requiredPassScore;
  const pointsEarned = correctCount * 100 + (passed ? 150 : 0);

  res.json({
    levelNumber: targetLevel.level,
    difficulty: targetLevel.difficulty,
    correctCount,
    totalQuestions: total,
    percentage,
    passed,
    pointsEarned,
    requiredPassScore: targetLevel.requiredPassScore,
    feedback: results,
    nextLevelUnlocked: passed && targetLevel.level < 5 ? targetLevel.level + 1 : null,
  });
});

// 8. Admin: Create scheduled competition
app.post('/api/competitions/create', (req: Request, res: Response) => {
  const isAdmin = req.headers['x-admin-role'] === 'admin' || req.body.isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized: Administrator access required.' });
  }

  const { title, category, difficulty, durationMinutes, startHoursFromNow, questionCount } = req.body;

  const count = Number(questionCount) || 5;
  const diff = String(difficulty || 'intermediate').toLowerCase();

  let selected: BibleQuestion[] = [];
  if (diff === 'mixed') {
    selected = generateProgressionCompetitionQuestions().slice(0, count);
  } else {
    selected = runtimeQuestionBank
      .filter((q) => q.difficulty === diff && q.reviewStatus !== 'retired')
      .slice(0, count);
  }

  if (selected.length === 0) {
    selected = runtimeQuestionBank.slice(0, count);
  }

  const newCompId = `comp-${Date.now()}`;
  const newComp: CompetitionRoom = {
    id: newCompId,
    title: title || 'OneBody Scripture Championship',
    category: category || 'General Bible Knowledge',
    difficulty: diff,
    durationMinutes: Number(durationMinutes) || 15,
    scheduledStartTime: new Date(Date.now() + 1000 * 60 * 60 * (Number(startHoursFromNow) || 2)).toISOString(),
    status: 'lobby',
    currentQuestionIndex: 0,
    roundTimerSeconds: 18,
    roundDurationSeconds: 18,
    revealTimerSeconds: 6,
    revealDurationSeconds: 6,
    questions: selected.map(toServerQuestion),
    participants: {},
    submissions: {},
  };

  SERVER_COMPETITIONS[newCompId] = newComp;

  res.status(201).json({ success: true, competition: newComp });
});

// Vite middleware in dev or static files in production
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }
}

setupViteOrStatic().then(() => {
  server.listen(PORT, () => {
    console.log(`OneBody Server running on port ${PORT}`);
  });
});
