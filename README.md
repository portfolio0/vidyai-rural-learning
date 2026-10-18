# VidyAI — Rural Learning Platform 🎓

AI-powered PWA for rural Indian students (Class 1–10). Mobile-first, offline-capable, multilingual.

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev                 # starts on port 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                 # starts on port 3000
```

## Folder Structure
```
vidyai/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── config/         db.js, env.js
│       ├── controllers/    authController.js, aiController.js, progressController.js
│       ├── middleware/     auth.js, rateLimit.js, validate.js
│       ├── models/         User, Student, Course, Chapter, Lesson, Reel, Quiz, QuizResult,
│       │                   Progress, Badge, School, SyncQueue, Notification
│       ├── routes/         auth, student, teacher, parent, admin, content,
│       │                   reels, quiz, ai, progress, sync
│       ├── services/       badgeService.js
│       ├── socket/         index.js  (Socket.io live chat)
│       └── utils/          constants.js, logger.js
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx         (all routes)
│       ├── components/
│       │   ├── ui/         Button, Card, Badge, ProgressBar, Modal, Toast, Spinner, StatCard
│       │   ├── layout/     MainLayout, Sidebar, Topbar, BottomNav
│       │   ├── chat/       MascotWidget
│       │   ├── dashboard/  StreakWidget
│       │   └── gamification/ XPBar, BadgeCard, Leaderboard
│       ├── pages/
│       │   ├── auth/       Login, Register, OTPVerify
│       │   ├── onboarding/ Onboarding
│       │   ├── student/    Dashboard, Subjects, LessonView
│       │   ├── reels/      ReelsPage
│       │   ├── quiz/       QuizHome, QuizPlay
│       │   ├── games/      Rewards
│       │   ├── chat/       AIChat
│       │   ├── offline/    OfflinePage
│       │   ├── teacher/    TeacherDashboard
│       │   ├── parent/     ParentDashboard
│       │   └── admin/      AdminDashboard
│       ├── store/          stores.js  (auth, progress, offline, ui, chat)
│       ├── hooks/          useOffline.js, useVoice.js, useProgress.js
│       ├── services/       api.js, authService, contentService, quizService,
│       │                   aiService, progressService, syncService
│       ├── utils/          db.js (IndexedDB), i18n.js, constants.js
│       └── styles/         globals.css
│
├── docs/
│   └── ARCHITECTURE.md
└── README.md
```

## User Roles
| Role    | Access |
|---------|--------|
| student | Dashboard, Subjects, Reels, Quiz, Rewards, AI Chat, Offline |
| teacher | All student + Teacher Dashboard (upload, manage) |
| parent  | Parent Dashboard (child progress, messages) |
| admin   | Full platform management |

## Key Features
- 📱 PWA — installable, works offline
- 🤖 AI Tutor (GPT-4o-mini streaming, EN/MR/HI)
- 🎬 Educational Reels (60s videos)
- ✏️ AI-generated quizzes
- 🏆 Gamification (XP, coins, badges, leaderboard)
- 📥 Offline mode with background sync
- 🎤 Voice input / text-to-speech
- 👨‍👩‍👧 Parent monitoring dashboard

## Environment Variables (backend/.env)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
REFRESH_SECRET=your-refresh-secret
OPENAI_API_KEY=sk-...
CLIENT_URL=http://localhost:3000
```

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, React Query, Framer Motion, idb
- **Backend**: Node.js, Express, MongoDB/Mongoose, Socket.io, JWT
- **AI**: OpenAI GPT-4o-mini (streaming)
- **PWA**: Workbox / vite-plugin-pwa, Service Worker
