import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Auth Store ──────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((s) => ({ user: { ...s.user, ...updates } })),
    }),
    {
      name: "vidyai-auth",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);

// ── Progress Store ──────────────────────────────────────────────────
const LEVEL_XP = [0, 100, 250, 500, 1000, 1800, 3000, 5000, 8000, 12000];

export const useProgressStore = create(
  persist(
    (set) => ({
      xp: 0,
      coins: 0,
      level: 1,
      streak: 0,
      badges: [],
      lastActivityDate: null,
      addXP: (amount) =>
        set((s) => {
          const newXP = s.xp + amount;
          let level = s.level;
          while (level < LEVEL_XP.length - 1 && newXP >= LEVEL_XP[level])
            level++;
          return { xp: newXP, level };
        }),
      addCoins: (n) => set((s) => ({ coins: s.coins + n })),
      unlockBadge: (badge) =>
        set((s) => ({
          badges: s.badges.find((b) => b.id === badge.id)
            ? s.badges
            : [...s.badges, badge],
        })),
      updateStreak: () =>
        set((s) => {
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          if (s.lastActivityDate === today) return {};
          const streak = s.lastActivityDate === yesterday ? s.streak + 1 : 1;
          return { streak, lastActivityDate: today };
        }),
    }),
    { name: "vidyai-progress" },
  ),
);

// ── Offline Store ───────────────────────────────────────────────────
export const useOfflineStore = create(
  persist(
    (set) => ({
      downloadedLessons: [],
      cachedQuizzes: [],
      syncQueue: [],
      isOnline: true,
      setCachedQuizzes: (quizzes) => set({ cachedQuizzes: quizzes || [] }),
      addDownload: (lesson) =>
        set((s) => {
          const lessonId = lesson.id || lesson._id;
          const ownerId = lesson.userId || "";
          return {
            downloadedLessons: [
              ...s.downloadedLessons.filter(
                (l) => !((l.id || l._id) === lessonId && (l.userId || "") === ownerId)
              ),
              lesson,
            ],
          };
        }),
      removeDownload: (lessonId, userId) =>
        set((s) => ({
          downloadedLessons: s.downloadedLessons.filter((l) => {
            const sameId = (l.id || l._id) === lessonId;
            const sameUser = userId ? (l.userId === userId) : true;
            return !(sameId && sameUser);
          }),
        })),
      addToQueue: (action, payload) =>
        set((s) => {
          if (action === "progress_update" && payload?.lessonId) {
            const existing = s.syncQueue.find(
              (item) =>
                item.action === "progress_update" &&
                item.payload?.lessonId === payload.lessonId,
            );
            if (existing) {
              return {
                syncQueue: s.syncQueue.map((item) =>
                  item.id === existing.id
                    ? { ...item, payload: { ...item.payload, ...payload } }
                    : item,
                ),
              };
            }
          }
          return {
            syncQueue: [...s.syncQueue, { id: Date.now(), action, payload }],
          };
        }),
      clearSynced: (ids) =>
        set((s) => ({
          syncQueue: s.syncQueue.filter((i) => !ids.includes(i.id)),
        })),
      setOnline: (v) => set({ isOnline: v }),
    }),
    { name: "vidyai-offline" },
  ),
);

// ── UI Store ────────────────────────────────────────────────────────
export const useUIStore = create(
  persist(
    (set) => ({
      darkMode: false,
      language: "en",
      sidebarOpen: false,
      lowBandwidthMode: false,
      toggleDark: () => set((s) => ({ darkMode: !s.darkMode })),
      setLanguage: (lang) => set({ language: lang }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleLowBandwidth: () =>
        set((s) => ({ lowBandwidthMode: !s.lowBandwidthMode })),
    }),
    { name: "vidyai-ui" },
  ),
);

// ── Chat Store ──────────────────────────────────────────────────────
export const useChatStore = create((set) => ({
  messages: [
    {
      role: "bot",
      text: "Namaste! 🙏 I'm Vidya, your AI tutor. Ask me anything!",
    },
  ],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearChat: () => set({ messages: [] }),
}));
