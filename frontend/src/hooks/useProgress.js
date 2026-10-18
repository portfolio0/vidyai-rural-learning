import { useProgressStore } from '../store/stores';

export function useProgress() {
  const store = useProgressStore();

  const completeLesson = () => {
    store.addXP(10);
    store.addCoins(5);
    store.updateStreak();
  };

  const completeQuiz = (score, total) => {
    const pct = score / total;
    const xp  = pct === 1 ? 50 : pct >= 0.6 ? 20 : 0;
    if (xp > 0) { store.addXP(xp); store.addCoins(10); }
    store.updateStreak();
    return xp;
  };

  const dailyLogin = () => {
    store.addXP(5);
    store.updateStreak();
  };

  return { ...store, completeLesson, completeQuiz, dailyLogin };
}
