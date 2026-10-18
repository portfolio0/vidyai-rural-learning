# VidyAI — Rural Learning Platform Architecture

## 1. Project Overview

AI-powered PWA for rural Indian students (Class 1–10). Mobile-first, offline-capable, multilingual (English/Marathi/Hindi). Optimized for low-end Android + low bandwidth.

---

## 2. Full Folder Structure

```
vidyai/
├── frontend/
│   ├── public/
│   │   ├── manifest.json          # PWA manifest
│   │   ├── sw.js                  # Service Worker
│   │   ├── icons/                 # PWA icons (72–512px)
│   │   └── offline.html           # Offline fallback
│   └── src/
│       ├── components/
│       │   ├── ui/                # Reusable: Button, Card, Badge, Modal, Toast
│       │   ├── layout/            # Sidebar, Topbar, BottomNav, PageWrapper
│       │   ├── dashboard/         # StatCard, StreakWidget, GoalCard, LearningPlan
│       │   ├── reels/             # ReelPlayer, ReelCard, ReelFeed, ReelControls
│       │   ├── quiz/              # QuizCard, QuizOption, QuizResult, QuizTimer
│       │   ├── chat/              # ChatBubble, ChatInput, VoiceInput, MascotWidget
│       │   ├── gamification/      # BadgeCard, Leaderboard, XPBar, LevelBadge
│       │   ├── offline/           # DownloadCard, StorageBar, SyncStatus
│       │   ├── admin/             # SchoolTable, UserManager, Analytics, CMS
│       │   ├── teacher/           # UploadPanel, StudentGrid, AssignmentBuilder
│       │   └── parent/            # ChildCard, WeeklyReport, ScreenTime
│       ├── pages/
│       │   ├── auth/              # Login, Register, OTPVerify, QuickLogin
│       │   ├── student/           # Dashboard, Subjects, SubjectDetail, LessonView
│       │   ├── reels/             # ReelsPage, ReelView
│       │   ├── quiz/              # QuizHome, QuizPlay, QuizResult
│       │   ├── games/             # Rewards, Badges, Leaderboard, Avatars
│       │   ├── chat/              # AIChatPage
│       │   ├── offline/           # OfflinePage
│       │   ├── teacher/           # TeacherDashboard, CreateContent, ManageStudents
│       │   ├── parent/            # ParentDashboard, ChildProgress
│       │   ├── admin/             # AdminDashboard, Schools, Analytics
│       │   └── onboarding/        # Welcome, ClassSelect, LangSelect, MascotIntro
│       ├── hooks/
│       │   ├── useAuth.js         # Auth state, login/logout
│       │   ├── useOffline.js      # Network status, IndexedDB sync
│       │   ├── useQuiz.js         # Quiz logic, scoring
│       │   ├── useProgress.js     # XP, streak, level calc
│       │   ├── useVoice.js        # Speech-to-text, TTS
│       │   └── useSocket.js       # Socket.io realtime
│       ├── store/
│       │   ├── authStore.js       # Zustand: user, token, role
│       │   ├── progressStore.js   # XP, coins, streak, badges
│       │   ├── offlineStore.js    # Downloaded content, sync queue
│       │   ├── uiStore.js         # Theme, language, sidebar
│       │   └── chatStore.js       # Chat messages, AI history
│       ├── services/
│       │   ├── api.js             # Axios instance, interceptors
│       │   ├── authService.js     # Login, OTP, register
│       │   ├── contentService.js  # Lessons, videos, PDFs
│       │   ├── quizService.js     # Quiz fetch, submit
│       │   ├── aiService.js       # Chat API, TTS, STT
│       │   ├── reelService.js     # Reels fetch, like, save
│       │   ├── progressService.js # XP update, badge unlock
│       │   └── syncService.js     # IndexedDB read/write, queue flush
│       └── utils/
│           ├── db.js              # IndexedDB wrapper (idb library)
│           ├── compress.js        # Image compression, lazy load
│           ├── i18n.js            # Translations EN/MR/HI
│           ├── analytics.js       # Event tracking helpers
│           └── pwa.js             # Install prompt, cache management
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connect
│   │   │   ├── jwt.js             # JWT config
│   │   │   └── env.js             # Environment vars
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Student.js
│   │   │   ├── Teacher.js
│   │   │   ├── Parent.js
│   │   │   ├── Admin.js
│   │   │   ├── School.js
│   │   │   ├── Course.js
│   │   │   ├── Chapter.js
│   │   │   ├── Lesson.js
│   │   │   ├── Video.js
│   │   │   ├── Reel.js
│   │   │   ├── Quiz.js
│   │   │   ├── QuizResult.js
│   │   │   ├── Assignment.js
│   │   │   ├── Progress.js
│   │   │   ├── Badge.js
│   │   │   ├── Notification.js
│   │   │   ├── Comment.js
│   │   │   ├── SyncQueue.js
│   │   │   └── Analytics.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   ├── teacherController.js
│   │   │   ├── parentController.js
│   │   │   ├── adminController.js
│   │   │   ├── contentController.js
│   │   │   ├── reelController.js
│   │   │   ├── quizController.js
│   │   │   ├── aiController.js
│   │   │   ├── progressController.js
│   │   │   ├── analyticsController.js
│   │   │   └── syncController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── student.js
│   │   │   ├── teacher.js
│   │   │   ├── parent.js
│   │   │   ├── admin.js
│   │   │   ├── content.js
│   │   │   ├── reels.js
│   │   │   ├── quiz.js
│   │   │   ├── ai.js
│   │   │   ├── progress.js
│   │   │   └── sync.js
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verify
│   │   │   ├── rbac.js            # Role-based access
│   │   │   ├── rateLimit.js       # Express rate limiter
│   │   │   ├── upload.js          # Multer file upload
│   │   │   ├── validate.js        # Joi schema validation
│   │   │   └── childSafe.js       # Content moderation filter
│   │   ├── services/
│   │   │   ├── aiService.js       # OpenAI / local LLM calls
│   │   │   ├── ttsService.js      # Text-to-speech
│   │   │   ├── smsService.js      # OTP SMS (Twilio/MSG91)
│   │   │   ├── storageService.js  # S3/Cloudflare R2 upload
│   │   │   ├── notifService.js    # Push notifications (FCM)
│   │   │   └── badgeService.js    # Badge unlock logic
│   │   ├── socket/
│   │   │   ├── index.js           # Socket.io init
│   │   │   ├── chatSocket.js      # Live teacher-student chat
│   │   │   └── classSocket.js     # Live class events
│   │   └── utils/
│   │       ├── logger.js
│   │       ├── helpers.js
│   │       └── constants.js
│   ├── server.js
│   └── package.json
│
└── docs/
    ├── ARCHITECTURE.md            # This file
    ├── API.md                     # API reference
    ├── DB_SCHEMA.md               # MongoDB schemas
    └── DEPLOYMENT.md              # Deploy guide
```

---

## 3. Database Schema Design (MongoDB)

### User (base)
```js
{
  _id, name, email, phone, passwordHash,
  role: enum['student','teacher','parent','admin'],
  language: enum['en','mr','hi'],
  school: ObjectId→School,
  avatar: String, avatarCustom: String,
  isActive: Boolean, lastLogin: Date,
  deviceTokens: [String],  // FCM push tokens
  createdAt, updatedAt
}
```

### Student (extends User)
```js
{
  userId: ObjectId→User,
  class: Number (1-10),
  parentId: ObjectId→User,
  xp: Number, coins: Number, level: Number,
  streakCurrent: Number, streakMax: Number,
  lastActivityDate: Date,
  badges: [ObjectId→Badge],
  downloadedContent: [ObjectId→Lesson|Video],
  learningPath: [{ subjectId, weeklyGoalMins }],
  attendance: [{ date, present: Boolean }]
}
```

### Course
```js
{
  _id, title, subject, class: Number,
  teacher: ObjectId→User,
  chapters: [ObjectId→Chapter],
  thumbnail, description,
  language: ['en','mr','hi'],
  isPublished: Boolean,
  totalLessons: Number, totalDuration: Number,
  createdAt
}
```

### Chapter
```js
{
  _id, courseId: ObjectId, title, order: Number,
  lessons: [ObjectId→Lesson],
  quiz: ObjectId→Quiz
}
```

### Lesson
```js
{
  _id, chapterId, title, type: enum['video','pdf','audio','text'],
  content: String,  // URL or text
  duration: Number, // seconds
  thumbnail: String,
  isDownloadable: Boolean,
  offlineSize: Number, // bytes
  language: String,
  aiSummary: String,   // auto-generated
  aiKeyPoints: [String],
  views: Number, completions: Number,
  createdAt
}
```

### Reel
```js
{
  _id, title, subject, class: Number,
  teacher: ObjectId→User,
  videoUrl: String, thumbnailUrl: String,
  duration: Number,  // ≤90s enforced
  likes: Number, saves: Number, views: Number,
  comments: [ObjectId→Comment],
  tags: [String],
  isModerated: Boolean, isApproved: Boolean,
  language: String,
  aiTranscript: String,
  createdAt
}
```

### Quiz
```js
{
  _id, title, subject, class: Number,
  teacher: ObjectId→User,
  questions: [{
    _id, text, options: [String],
    correctIndex: Number,
    explanation: String,
    aiHint: String,
    points: Number
  }],
  duration: Number, // seconds
  xpReward: Number,
  isAIGenerated: Boolean,
  createdAt
}
```

### QuizResult
```js
{
  _id, studentId, quizId,
  answers: [{ questionId, chosen: Number, correct: Boolean }],
  score: Number, totalPoints: Number, timeTaken: Number,
  xpEarned: Number, completedAt: Date
}
```

### Progress
```js
{
  _id, studentId, lessonId,
  watched: Number,  // seconds
  completed: Boolean, completedAt: Date,
  quizScore: Number,
  notes: String
}
```

### Badge
```js
{
  _id, name, icon, description,
  condition: { type: String, value: Number }, // e.g. streak:7
  rarity: enum['common','rare','epic','legendary'],
  xpBonus: Number
}
```

### SyncQueue (offline)
```js
{
  _id, studentId, action: String,
  payload: Object,  // progress update, quiz result etc
  status: enum['pending','synced','failed'],
  createdAt, syncedAt
}
```

### Analytics
```js
{
  _id, type: String, // 'lesson_view','quiz_complete','reel_watch'
  userId, subjectId, itemId,
  metadata: Object,
  timestamp: Date,
  sessionId: String
}
```

---

## 4. API Structure

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/otp/send
POST /api/auth/otp/verify
POST /api/auth/refresh
POST /api/auth/logout
```

### Student
```
GET  /api/student/dashboard
GET  /api/student/progress
GET  /api/student/subjects
GET  /api/student/recommended
PUT  /api/student/profile
GET  /api/student/attendance
```

### Content
```
GET  /api/content/courses?class=5&subject=math
GET  /api/content/courses/:id
GET  /api/content/lessons/:id
GET  /api/content/lessons/:id/offline  // download package
POST /api/content/lessons/:id/complete
```

### Reels
```
GET  /api/reels?subject=&class=&page=
GET  /api/reels/:id
POST /api/reels/:id/like
POST /api/reels/:id/save
POST /api/reels/:id/comment
POST /api/reels           // teacher upload
```

### Quiz
```
GET  /api/quiz?subject=&class=
GET  /api/quiz/:id
POST /api/quiz/:id/submit
GET  /api/quiz/ai-generate?topic=&class=  // AI-generated quiz
GET  /api/quiz/results/:studentId
```

### AI
```
POST /api/ai/chat          // doubt solving
POST /api/ai/tts           // text to speech
POST /api/ai/quiz-generate // generate quiz from topic
POST /api/ai/summarize     // lesson summary
POST /api/ai/weak-topics   // detect weak areas
GET  /api/ai/career-guide  // career suggestions
```

### Progress
```
GET  /api/progress/:studentId
POST /api/progress/update
GET  /api/progress/leaderboard?class=&school=
POST /api/progress/xp
```

### Teacher
```
GET  /api/teacher/dashboard
GET  /api/teacher/students
POST /api/teacher/content/upload
POST /api/teacher/quiz/create
GET  /api/teacher/analytics
POST /api/teacher/assignment
POST /api/teacher/live-class
```

### Admin
```
GET  /api/admin/schools
GET  /api/admin/users
GET  /api/admin/analytics
PUT  /api/admin/content/moderate/:id
POST /api/admin/notifications/broadcast
GET  /api/admin/reports
```

### Sync
```
POST /api/sync/flush        // push offline queue
GET  /api/sync/pull         // get pending updates
POST /api/sync/progress     // batch progress sync
```

---

## 5. Authentication Flow

```
Mobile OTP Login:
  User enters phone → POST /auth/otp/send → SMS via MSG91
  User enters OTP → POST /auth/otp/verify → returns JWT + refreshToken
  Token stored: localStorage (web) / SecureStore (native)

Email Login:
  POST /auth/login → bcrypt verify → JWT + refreshToken

JWT: 15min expiry. RefreshToken: 30 days, stored httpOnly cookie.
Role in JWT payload: { userId, role, class, school }

Device tracking: each login records deviceId, IP, UA.
Parent-linked: parent sees child data via parentId on Student.
```

---

## 6. AI Integration Flow

```
Doubt Solving (online):
  Student types/speaks → STT converts → POST /ai/chat
  Backend → OpenAI GPT-4o with system prompt:
    "You are Vidya, a friendly tutor for Class {class} Indian students.
     Answer in {language}. Keep answers simple, use examples."
  Response → TTS if voice mode → stream to client

Offline AI:
  Cache top 500 FAQs per subject per class in IndexedDB
  Keyword match locally → return cached answer
  Mark as "offline answer" in UI

AI Quiz Generation:
  Teacher/student picks topic → POST /ai/quiz-generate
  Returns 10 MCQs with explanations → save to Quiz collection

Weak Topic Detection:
  Cron: analyze QuizResult per student per week
  Topics with <60% accuracy → flag as weak
  Push to student's review list

Career Guidance:
  Student fills interest form → POST /ai/career-guide
  AI maps interests + class performance → career suggestions
```

---

## 7. Offline Sync Architecture

```
IndexedDB stores (idb library):
  lessons: { id, title, content, cachedAt }
  quizzes: { id, questions, cachedAt }
  progress: { lessonId, watched, completed } (local state)
  syncQueue: [{ action, payload, timestamp }]

Service Worker (sw.js):
  Cache strategy:
    - App shell (HTML/CSS/JS) → Cache First
    - API responses → Network First, fallback IndexedDB
    - Videos/PDFs → Cache on download, serve from cache
    - Images → Stale While Revalidate

Sync flow:
  1. Offline: writes go to syncQueue in IndexedDB
  2. Online detected (navigator.onLine + fetch test)
  3. Background sync fires: POST /api/sync/flush
  4. Server processes queue, returns conflicts
  5. Client resolves: server wins on conflicts
  6. Clear synced items from queue

PWA Background Sync API:
  registration.sync.register('sync-progress')
  sw.js listens: self.addEventListener('sync', ...)
```

---

## 8. Reels System Architecture

```
Upload (Teacher):
  1. Select video (max 90s enforced client-side)
  2. Compress with ffmpeg-wasm in browser
  3. Chunked upload → S3/R2 via presigned URL
  4. POST /api/reels with metadata
  5. Server triggers: AI transcript, thumbnail extract, moderation check

Storage:
  Raw: S3 bucket (vidyai-reels-raw)
  Processed (360p for mobile): S3 (vidyai-reels-cdn)
  CDN: Cloudflare in front of S3

Feed algorithm:
  score = (likes * 2 + saves * 3 + views * 0.1) / age_hours^0.8
  Personalized: boost subjects with low progress
  Filter: class ± 1, same language preferred

Player:
  Vertical scroll (CSS scroll-snap)
  Intersection Observer → autoplay/pause
  Preload next 2 reels
  Download = cache in IndexedDB + Service Worker cache
```

---

## 9. PWA Implementation

### manifest.json
```json
{
  "name": "VidyAI — Rural Learning",
  "short_name": "VidyAI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F0F4FF",
  "theme_color": "#6C63FF",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker strategy
```
App Shell → Cache First
API data → Network First (5s timeout) → IndexedDB fallback
Images → Cache First (30 day TTL)
Videos → Cache on explicit download only (storage limit)
Push notifications via FCM → sw.js handles background
```

---

## 10. Gamification Architecture

```
XP Sources:
  Lesson complete: +10 XP
  Quiz pass (>60%): +20 XP
  Perfect quiz: +50 XP
  Daily login: +5 XP
  Streak bonus (7 days): +100 XP
  Reel watched: +2 XP
  Help peer (comment): +5 XP

Level thresholds: [0,100,250,500,1000,1800,3000,5000,8000,12000]
  Levels 1-10 map to titles: Beginner → Vidya Champion

Badge unlock triggers (badgeService.js):
  streak:7 → "Streak 7" badge
  quizzes_perfect:5 → "Quiz Master"
  lessons:10 → "Top Reader"
  level:5 → "Rising Star"
  login_days:30 → "Dedicated Learner"

Leaderboard:
  Scope: class + school (not global, safer for kids)
  Refresh: every hour via cron
  Stored: Redis sorted set for speed
  Fallback: MongoDB aggregation if no Redis
```

---

## 11. Role-Based Workflows

### Student Flow
```
Login → Onboarding (class/lang) → Dashboard
Dashboard → Today's Plan → Lesson Player → Mark Complete → XP earned
Dashboard → Reels → Watch → Like/Save/Download
Dashboard → Quiz → Answer → Result → Badge unlock animation
Dashboard → AI Chat → Ask doubt → Get answer (voice optional)
Dashboard → Offline → Download lessons → Learn without internet
```

### Teacher Flow
```
Login → Teacher Dashboard → Upload content (video/PDF/quiz)
→ Create assignment → Schedule live class
→ Monitor student progress → Message parents
→ View analytics (per student, per chapter)
```

### Parent Flow
```
Login → See child card → Weekly progress report
→ Attendance → Screen time → Teacher messages
→ Set daily time limit (optional)
```

### Admin Flow
```
Login → Platform overview → Manage schools/teachers/students
→ Moderate content → Push announcements
→ Download analytics reports → CMS pages
```

---

## 12. Recommended Libraries & Packages

### Frontend
```
react, react-dom, react-router-dom
next.js (or vite for pure SPA)
tailwindcss
framer-motion (animations)
zustand (state)
@tanstack/react-query (data fetching)
idb (IndexedDB wrapper)
axios
react-player (video)
workbox (PWA/SW)
i18next + react-i18next (multilang)
react-hot-toast (notifications)
recharts (analytics charts)
react-webcam (camera, optional)
ffmpeg.wasm (client-side video compress)
```

### Backend
```
express, cors, helmet, morgan
mongoose
jsonwebtoken, bcryptjs
express-rate-limit
multer (file upload)
socket.io
joi (validation)
openai (AI SDK)
aws-sdk / @aws-sdk/client-s3
twilio / msg91 (OTP SMS)
firebase-admin (FCM push)
node-cron (scheduled jobs)
redis (leaderboard, cache)
winston (logging)
```

---

## 13. Responsive Design Strategy

```
Breakpoints (Tailwind):
  xs: 320px (low-end Android)
  sm: 375px (standard mobile)
  md: 768px (tablet)
  lg: 1024px (desktop)

Mobile-first rules:
  - All layouts start single-column
  - Touch targets min 44×44px
  - Font size min 16px (prevents iOS zoom)
  - Bottom navigation on mobile (4 tabs)
  - Sidebar on tablet/desktop
  - Swipe gestures for reels, cards

Low-end optimization:
  - CSS animations: prefer transform/opacity only
  - Lazy load all images (IntersectionObserver)
  - Video: adaptive streaming (HLS, 360p default)
  - Bundle split: route-based code splitting
  - Tree-shake all unused icons/components
  - Preload critical CSS inline
  - Lighthouse target: Performance >85, PWA >95

Image pipeline:
  Upload: compress to WebP on server
  Serve: CDN with srcset (320w, 640w, 1280w)
  Placeholder: low-quality blurred thumbnail
```

---

## 14. Security

```
Auth: JWT + httpOnly refresh token
Passwords: bcrypt (rounds=12)
API: rate limit (100 req/15min per IP)
Uploads: virus scan + type check (mime + magic bytes)
Child safety:
  - All comments AI-moderated before display
  - No user-to-user DMs (only teacher↔student/parent)
  - No external links in student UI
  - Content flagging system
RBAC: every route checks role in JWT
HTTPS: enforced, HSTS header
CORS: whitelist app domains only
```

---

## 15. Deployment

```
Frontend: Vercel / Netlify (Next.js)
Backend: Railway / Render (Node.js)
Database: MongoDB Atlas (M0 free → M10 paid)
File storage: Cloudflare R2 (cheap egress)
CDN: Cloudflare (free tier covers most)
Cache: Upstash Redis (serverless)
SMS OTP: MSG91 (India-first, ₹0.15/SMS)
Push: Firebase FCM (free)
AI: OpenAI API (GPT-4o-mini for cost)

Monitoring:
  Uptime: Better Uptime
  Errors: Sentry
  Analytics: self-hosted Plausible or Mixpanel
```
