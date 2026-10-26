import { Quiz, QuizQuestion, Competition, Achievement } from '../types';

export const SEED_QUIZZES: (Quiz & { questions: QuizQuestion[] })[] = [
  {
    id: 'quiz-parables-1',
    title: 'The Parables of the Kingdom',
    description: 'Explore the profound parables Jesus shared about the Kingdom of God, grace, and redemption.',
    category: 'Parables of Jesus',
    difficulty: 'Intermediate',
    timePerQuestionSeconds: 25,
    pointsPerQuestion: 100,
    questionCount: 5,
    isPublished: true,
    createdBy: 'system-seed',
    createdByName: 'OneBody Editorial',
    createdAt: '2026-01-15T00:00:00.000Z',
    questions: [
      {
        id: 'q-par-1',
        quizId: 'quiz-parables-1',
        questionText: 'In the Parable of the Prodigal Son, what did the father put on his younger son when he returned home?',
        options: [
          'A sackcloth and ashes to symbolize repentance',
          'The best robe, a ring on his hand, and sandals on his feet',
          'A golden crown and a new staff',
          'A traveler’s cloak and water for his journey'
        ],
        correctAnswerIndex: 1,
        explanation: 'The father celebrated his son’s return with unconditional love, restoring his sonship with the best robe, a signet ring, and sandals.',
        scriptureReference: 'Luke 15:22'
      },
      {
        id: 'q-par-2',
        quizId: 'quiz-parables-1',
        questionText: 'In the Parable of the Good Samaritan, who passed by the injured traveler before the Samaritan helped him?',
        options: [
          'A Pharisee and a Sadducee',
          'A Roman centurion and a tax collector',
          'A priest and a Levite',
          'A fisherman and a carpenter'
        ],
        correctAnswerIndex: 2,
        explanation: 'Both a priest and a Levite saw the beaten man and crossed over to the other side of the road.',
        scriptureReference: 'Luke 10:31-32'
      },
      {
        id: 'q-par-3',
        quizId: 'quiz-parables-1',
        questionText: 'According to Jesus, what tiny seed represents the growth and expansion of the Kingdom of Heaven?',
        options: [
          'Wheat kernel',
          'Mustard seed',
          'Pomegranate seed',
          'Olive pip'
        ],
        correctAnswerIndex: 1,
        explanation: 'Jesus said the kingdom is like a mustard seed, which though tiny, grows into a great tree where birds can nest.',
        scriptureReference: 'Matthew 13:31-32'
      },
      {
        id: 'q-par-4',
        quizId: 'quiz-parables-1',
        questionText: 'In the Parable of the Sower, what does the seed that fell among thorns represent?',
        options: [
          'Those who hear the word, but the worries of this life and deceitfulness of wealth choke it',
          'Those whose hearts are hard and Satan immediately steals the word',
          'Those who receive it with joy but fall away under persecution',
          'Those who cultivate good fruit thirty, sixty, and a hundredfold'
        ],
        correctAnswerIndex: 0,
        explanation: 'The thorns choke the spiritual seed through the worries of the world, deceitfulness of riches, and desires for other things.',
        scriptureReference: 'Mark 4:18-19'
      },
      {
        id: 'q-par-5',
        quizId: 'quiz-parables-1',
        questionText: 'In the Parable of the Ten Virgins, what did the five foolish virgins fail to bring with their lamps?',
        options: [
          'Extra wicks',
          'Flint and steel',
          'Extra oil in jars',
          'Wedding garments'
        ],
        correctAnswerIndex: 2,
        explanation: 'The foolish virgins took their lamps but took no extra oil with them, so their lamps went out while waiting for the bridegroom.',
        scriptureReference: 'Matthew 25:3-4'
      }
    ]
  },
  {
    id: 'quiz-jesus-life-1',
    title: 'The Life & Ministry of Jesus',
    description: 'Test your understanding of the Gospels: from Bethlehem to the cross and the glorious resurrection.',
    category: 'Life and teachings of Jesus',
    difficulty: 'Beginner',
    timePerQuestionSeconds: 20,
    pointsPerQuestion: 80,
    questionCount: 5,
    isPublished: true,
    createdBy: 'system-seed',
    createdByName: 'OneBody Editorial',
    createdAt: '2026-01-20T00:00:00.000Z',
    questions: [
      {
        id: 'q-jes-1',
        quizId: 'quiz-jesus-life-1',
        questionText: 'Where did Jesus perform His first recorded public miracle, turning water into wine?',
        options: [
          'Capernaum',
          'Cana in Galilee',
          'Bethany',
          'Nazareth'
        ],
        correctAnswerIndex: 1,
        explanation: 'Jesus attended a wedding at Cana in Galilee where He transformed six stone water jars of water into choice wine.',
        scriptureReference: 'John 2:1-11'
      },
      {
        id: 'q-jes-2',
        quizId: 'quiz-jesus-life-1',
        questionText: 'Who was the disciple that walked on water toward Jesus before beginning to sink due to wind and doubt?',
        options: [
          'John',
          'Andrew',
          'Peter',
          'James'
        ],
        correctAnswerIndex: 2,
        explanation: 'Peter got down out of the boat and walked on water toward Jesus, but when he saw the wind, he was afraid and cried out, "Lord, save me!"',
        scriptureReference: 'Matthew 14:28-31'
      },
      {
        id: 'q-jes-3',
        quizId: 'quiz-jesus-life-1',
        questionText: 'How many days and nights did Jesus fast in the wilderness while being tempted by the devil?',
        options: [
          '7 days',
          '12 days',
          '40 days',
          '70 days'
        ],
        correctAnswerIndex: 2,
        explanation: 'After fasting forty days and forty nights, Jesus was hungry, and the tempter came to Him in the desert.',
        scriptureReference: 'Matthew 4:1-2'
      },
      {
        id: 'q-jes-4',
        quizId: 'quiz-jesus-life-1',
        questionText: 'What did Jesus say is the greatest commandment in the Law?',
        options: [
          'Remember the Sabbath day by keeping it holy',
          'Love the Lord your God with all your heart, soul, and mind',
          'Give tithes of all you possess to the temple',
          'Do not bear false witness against your neighbor'
        ],
        correctAnswerIndex: 1,
        explanation: 'Jesus answered: "Love the Lord your God with all your heart and with all your soul and with all your mind. This is the first and greatest commandment."',
        scriptureReference: 'Matthew 22:37-38'
      },
      {
        id: 'q-jes-5',
        quizId: 'quiz-jesus-life-1',
        questionText: 'Who was the Roman governor that washed his hands during the trial of Jesus, declaring himself innocent of His blood?',
        options: [
          'Caesar Augustus',
          'Pontius Pilate',
          'King Herod Agrippa',
          'Felix'
        ],
        correctAnswerIndex: 1,
        explanation: 'When Pilate saw that he was getting nowhere, he took water and washed his hands in front of the crowd.',
        scriptureReference: 'Matthew 27:24'
      }
    ]
  },
  {
    id: 'quiz-old-testament-1',
    title: 'Pillars of the Old Testament',
    description: 'From Genesis through the Prophets: the covenant promises, liberation, and wisdom of ancient Israel.',
    category: 'Old Testament',
    difficulty: 'Intermediate',
    timePerQuestionSeconds: 30,
    pointsPerQuestion: 100,
    questionCount: 5,
    isPublished: true,
    createdBy: 'system-seed',
    createdByName: 'OneBody Editorial',
    createdAt: '2026-02-01T00:00:00.000Z',
    questions: [
      {
        id: 'q-ot-1',
        quizId: 'quiz-old-testament-1',
        questionText: 'What covenant sign did God give to Noah after the Great Flood, promising never to destroy all life by water again?',
        options: [
          'A golden altar',
          'A rainbow in the clouds',
          'Circumcision',
          'A pillar of fire'
        ],
        correctAnswerIndex: 1,
        explanation: 'God set His rainbow in the clouds as the sign of the everlasting covenant between God and all life on earth.',
        scriptureReference: 'Genesis 9:12-16'
      },
      {
        id: 'q-ot-2',
        quizId: 'quiz-old-testament-1',
        questionText: 'Through what miraculous object did God first speak to Moses in the desert of Midian near Mount Horeb?',
        options: [
          'A quiet whisper in the cave',
          'A burning bush that was not consumed',
          'Two tablets inscribed in stone',
          'An angel with a drawn sword'
        ],
        correctAnswerIndex: 1,
        explanation: 'The angel of the Lord appeared to Moses in flames of fire from within a bush that burned without being consumed.',
        scriptureReference: 'Exodus 3:2'
      },
      {
        id: 'q-ot-3',
        quizId: 'quiz-old-testament-1',
        questionText: 'Which prophet challenged the 450 prophets of Baal to a contest on Mount Carmel?',
        options: [
          'Elisha',
          'Elijah',
          'Jeremiah',
          'Isaiah'
        ],
        correctAnswerIndex: 1,
        explanation: 'Elijah commanded the prophets of Baal to call upon their god, and then called upon the Lord, who answered by fire.',
        scriptureReference: '1 Kings 18:20-39'
      },
      {
        id: 'q-ot-4',
        quizId: 'quiz-old-testament-1',
        questionText: 'Who was thrown into a den of lions for praying to the God of Israel contrary to King Darius’s royal decree?',
        options: [
          'Daniel',
          'Shadrach',
          'Nehemiah',
          'Mordecai'
        ],
        correctAnswerIndex: 0,
        explanation: 'Daniel remained faithful in prayer three times a day, and God sent His angel to shut the lions’ mouths.',
        scriptureReference: 'Daniel 6:10-22'
      },
      {
        id: 'q-ot-5',
        quizId: 'quiz-old-testament-1',
        questionText: 'Which queen famously declared, "If I perish, I perish," when risking her life to intercede for her people before the Persian king?',
        options: [
          'Ruth',
          'Hannah',
          'Esther',
          'Deborah'
        ],
        correctAnswerIndex: 2,
        explanation: 'Queen Esther courageously approached King Xerxes uninvited after three days of fasting to rescue the Jewish people.',
        scriptureReference: 'Esther 4:16'
      }
    ]
  },
  {
    id: 'quiz-characters-1',
    title: 'Heroes of Faith & Character',
    description: 'Explore the lives, trials, and triumphs of key figures across biblical history.',
    category: 'Bible characters',
    difficulty: 'Advanced',
    timePerQuestionSeconds: 30,
    pointsPerQuestion: 120,
    questionCount: 5,
    isPublished: true,
    createdBy: 'system-seed',
    createdByName: 'OneBody Editorial',
    createdAt: '2026-02-10T00:00:00.000Z',
    questions: [
      {
        id: 'q-char-1',
        quizId: 'quiz-characters-1',
        questionText: 'Which young shepherd defeated the Philistine champion Goliath using only a sling and five smooth stones in the name of the Lord?',
        options: [
          'Jonathan',
          'David',
          'Saul',
          'Gideon'
        ],
        correctAnswerIndex: 1,
        explanation: 'David said: "You come against me with sword and spear and javelin, but I come against you in the name of the Lord Almighty."',
        scriptureReference: '1 Samuel 17:45'
      },
      {
        id: 'q-char-2',
        quizId: 'quiz-characters-1',
        questionText: 'What was the original Hebrew name of the Apostle Paul prior to his Damascus encounter?',
        options: [
          'Silas',
          'Saul of Tarsus',
          'Barnabas',
          'Stephen'
        ],
        correctAnswerIndex: 1,
        explanation: 'Saul of Tarsus was a zealous Pharisee until his transformational encounter with the resurrected Christ on the road to Damascus.',
        scriptureReference: 'Acts 9:1-6'
      },
      {
        id: 'q-char-3',
        quizId: 'quiz-characters-1',
        questionText: 'Which Moabitess demonstrated steadfast covenant loyalty to her mother-in-law Naomi, saying "Where you go I will go"?',
        options: [
          'Orpah',
          'Ruth',
          'Rahab',
          'Leah'
        ],
        correctAnswerIndex: 1,
        explanation: 'Ruth clung to Naomi and confessed: "Your people will be my people and your God my God."',
        scriptureReference: 'Ruth 1:16'
      },
      {
        id: 'q-char-4',
        quizId: 'quiz-characters-1',
        questionText: 'Who was the priest and king of Salem who blessed Abraham and received a tenth from him?',
        options: [
          'Melchizedek',
          'Aaron',
          'Jethro',
          'Phinehas'
        ],
        correctAnswerIndex: 0,
        explanation: 'Melchizedek king of Salem brought out bread and wine and blessed Abram, prefiguring Christ’s eternal priesthood.',
        scriptureReference: 'Genesis 14:18-20, Hebrews 7:1-3'
      },
      {
        id: 'q-char-5',
        quizId: 'quiz-characters-1',
        questionText: 'Which judge delivered Israel with an army trimmed down by God from 32,000 men to just 300?',
        options: [
          'Samson',
          'Jephthah',
          'Gideon',
          'Barak'
        ],
        correctAnswerIndex: 2,
        explanation: 'The Lord told Gideon to keep only the 300 men who lapped water with their hands, so Israel could not boast in its own strength.',
        scriptureReference: 'Judges 7:2-7'
      }
    ]
  },
  {
    id: 'quiz-new-testament-1',
    title: 'Epistles & The Early Church',
    description: 'The expansion of the Gospel through the Book of Acts and apostolic teachings.',
    category: 'New Testament',
    difficulty: 'Intermediate',
    timePerQuestionSeconds: 25,
    pointsPerQuestion: 100,
    questionCount: 4,
    isPublished: true,
    createdBy: 'system-seed',
    createdByName: 'OneBody Editorial',
    createdAt: '2026-02-15T00:00:00.000Z',
    questions: [
      {
        id: 'q-nt-1',
        quizId: 'quiz-new-testament-1',
        questionText: 'On which feast day was the Holy Spirit poured out with the sound of a violent rushing wind and tongues of fire?',
        options: [
          'Passover',
          'Day of Atonement',
          'Pentecost',
          'Feast of Tabernacles'
        ],
        correctAnswerIndex: 2,
        explanation: 'On the day of Pentecost, believers were filled with the Holy Spirit and began speaking in other tongues as the Spirit enabled them.',
        scriptureReference: 'Acts 2:1-4'
      },
      {
        id: 'q-nt-2',
        quizId: 'quiz-new-testament-1',
        questionText: 'According to Galatians 5:22-23, which of these is part of the Fruit of the Spirit?',
        options: [
          'Riches, prominence, and influence',
          'Love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness, self-control',
          'Pride of knowledge and mystery',
          'Fasting, silence, and isolation'
        ],
        correctAnswerIndex: 1,
        explanation: 'Paul lists the ninefold fruit of the Holy Spirit against which there is no law.',
        scriptureReference: 'Galatians 5:22-23'
      },
      {
        id: 'q-nt-3',
        quizId: 'quiz-new-testament-1',
        questionText: 'Who was the first Christian martyr, who prayed for his persecutors as he was being stoned?',
        options: [
          'Philip',
          'Stephen',
          'Barnabas',
          'James the brother of John'
        ],
        correctAnswerIndex: 1,
        explanation: 'Stephen, full of faith and power, cried out: "Lord, do not hold this sin against them," before he fell asleep in Christ.',
        scriptureReference: 'Acts 7:59-60'
      },
      {
        id: 'q-nt-4',
        quizId: 'quiz-new-testament-1',
        questionText: 'In 1 Corinthians 13, Paul states that three virtues remain, but the greatest of these is:',
        options: [
          'Hope',
          'Faith',
          'Love',
          'Wisdom'
        ],
        correctAnswerIndex: 2,
        explanation: '"And now these three remain: faith, hope and love. But the greatest of these is love."',
        scriptureReference: '1 Corinthians 13:13'
      }
    ]
  },
  {
    id: 'quiz-christian-living-1',
    title: 'Christian Living & Discipleship',
    description: 'Walking worthy of our calling: grace, love, prayer, integrity, and fellowship.',
    category: 'Christian living',
    difficulty: 'Beginner',
    timePerQuestionSeconds: 20,
    pointsPerQuestion: 75,
    questionCount: 4,
    isPublished: true,
    createdBy: 'system-seed',
    createdByName: 'OneBody Editorial',
    createdAt: '2026-02-20T00:00:00.000Z',
    questions: [
      {
        id: 'q-cl-1',
        quizId: 'quiz-christian-living-1',
        questionText: 'What does Romans 12:2 instruct believers NOT to conform to?',
        options: [
          'The pattern of this world',
          'The counsel of godly elders',
          'The law of love',
          'The teachings of Christ'
        ],
        correctAnswerIndex: 0,
        explanation: '"Do not conform to the pattern of this world, but be transformed by the renewing of your mind."',
        scriptureReference: 'Romans 12:2'
      },
      {
        id: 'q-cl-2',
        quizId: 'quiz-christian-living-1',
        questionText: 'According to 1 Thessalonians 5:16-18, what should Christians do continually?',
        options: [
          'Debate theology with strangers',
          'Rejoice always, pray continually, give thanks in all circumstances',
          'Worry about tomorrow’s needs',
          'Isolate from community'
        ],
        correctAnswerIndex: 1,
        explanation: '"Rejoice always, pray continually, give thanks in all circumstances; for this is God’s will for you in Christ Jesus."',
        scriptureReference: '1 Thessalonians 5:16-18'
      },
      {
        id: 'q-cl-3',
        quizId: 'quiz-christian-living-1',
        questionText: 'What armor piece does Paul say guards our hearts against the fiery arrows of the evil one in Ephesians 6?',
        options: [
          'The belt of gold',
          'The sandals of readiness',
          'The shield of faith',
          'The helmet of works'
        ],
        correctAnswerIndex: 2,
        explanation: '"In addition to all this, take up the shield of faith, with which you can extinguish all the flaming arrows of the evil one."',
        scriptureReference: 'Ephesians 6:16'
      },
      {
        id: 'q-cl-4',
        quizId: 'quiz-christian-living-1',
        questionText: 'In Matthew 5, what two metaphors does Jesus use to describe His followers’ influence on earth?',
        options: [
          'Thunder and lightning',
          'Salt and light',
          'Cedar and cypress',
          'Gold and silver'
        ],
        correctAnswerIndex: 1,
        explanation: '"You are the salt of the earth... You are the light of the world. A town built on a hill cannot be hidden."',
        scriptureReference: 'Matthew 5:13-14'
      }
    ]
  }
];

export const SEED_COMPETITIONS: Competition[] = [
  {
    id: 'comp-global-pentecost',
    title: 'Global Nations Pentecost Cup',
    description: 'A worldwide synchronized competition testing knowledge of the Early Church and the Acts of the Apostles. Open to participants from all countries!',
    category: 'New Testament',
    difficulty: 'Intermediate',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // 4 hours from now
    durationMinutes: 20,
    participantLimit: 500,
    status: 'upcoming',
    currentQuestionIndex: 0,
    createdBy: 'system-seed',
    createdByName: 'OneBody Competition Board',
    participantCount: 42,
    createdAt: new Date().toISOString()
  },
  {
    id: 'comp-wisdom-parables',
    title: 'The Master’s Wisdom: Parables Challenge',
    description: 'Fast-paced real-time competition on the parables and teachings of Jesus Christ with synchronized timer and dynamic live leaderboard.',
    category: 'Parables of Jesus',
    difficulty: 'Beginner',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // tomorrow
    durationMinutes: 15,
    participantLimit: 250,
    status: 'upcoming',
    currentQuestionIndex: 0,
    createdBy: 'system-seed',
    createdByName: 'OneBody Competition Board',
    participantCount: 19,
    createdAt: new Date().toISOString()
  }
];

export const DAILY_VERSES = [
  {
    verse: 'Romans 12:5',
    text: 'So in Christ we, though many, form one body, and each member belongs to all the others.',
    theme: 'One Body in Christ',
    version: 'NIV'
  },
  {
    verse: 'Psalm 119:105',
    text: 'Your word is a lamp for my feet, a light on my path.',
    theme: 'Guidance',
    version: 'NIV'
  },
  {
    verse: 'Ephesians 4:3-4',
    text: 'Make every effort to keep the unity of the Spirit through the bond of peace. There is one body and one Spirit, just as you were called to one hope.',
    theme: 'Unity & Peace',
    version: 'NIV'
  },
  {
    verse: 'Philippians 4:13',
    text: 'I can do all this through him who gives me strength.',
    theme: 'Strength in Christ',
    version: 'NIV'
  },
  {
    verse: 'Colossians 3:14',
    text: 'And over all these virtues put on love, which binds them all together in perfect unity.',
    theme: 'Love & Fellowship',
    version: 'NIV'
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-quiz',
    title: 'First Step of Faith',
    description: 'Complete your first Bible quiz',
    icon: 'Scroll',
    requiredCount: 1,
    type: 'quiz_count',
    badgeColor: 'from-amber-400 to-amber-600'
  },
  {
    id: 'ach-five-quizzes',
    title: 'Diligent Student',
    description: 'Complete 5 Bible quizzes',
    icon: 'BookOpen',
    requiredCount: 5,
    type: 'quiz_count',
    badgeColor: 'from-blue-400 to-indigo-600'
  },
  {
    id: 'ach-points-500',
    title: 'Treasures of Wisdom',
    description: 'Accumulate 500 Scripture points',
    icon: 'Crown',
    requiredCount: 500,
    type: 'points',
    badgeColor: 'from-yellow-300 to-amber-500'
  },
  {
    id: 'ach-streak-3',
    title: 'Faithful Daily Walk',
    description: 'Maintain a 3-day quiz streak',
    icon: 'Flame',
    requiredCount: 3,
    type: 'streak',
    badgeColor: 'from-orange-400 to-red-500'
  },
  {
    id: 'ach-competition',
    title: 'Global Contender',
    description: 'Participate in a live worldwide competition',
    icon: 'Trophy',
    requiredCount: 1,
    type: 'competition',
    badgeColor: 'from-purple-400 to-indigo-600'
  },
  {
    id: 'ach-prayer-partner',
    title: 'Intercessor',
    description: 'Pray for 3 community prayer requests',
    icon: 'HeartHandshake',
    requiredCount: 3,
    type: 'prayer',
    badgeColor: 'from-emerald-400 to-teal-600'
  }
];

export const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲' }
];

export const BIBLE_INTERESTS_LIST = [
  'Gospel Teachings',
  'Old Testament Prophecy',
  'Paul’s Epistles',
  'Psalms & Proverbs',
  'Bible Characters & Heroes',
  'Biblical Archaeology & History',
  'Christian Apologetics',
  'Parables & Miracles',
  'Discipleship & Christian Living',
  'End Times & Revelation'
];
