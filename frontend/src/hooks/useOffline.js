import { useEffect } from 'react';
import { useOfflineStore } from '../store/stores';
import api from '../services/api';

export function useOffline() {
  const { syncQueue, clearSynced, setOnline } = useOfflineStore();

  useEffect(() => {
    const flushQueue = async () => {
      if (syncQueue.length === 0) return;
      try {
        const res = await api.post('/sync/flush', { queue: syncQueue });
        const synced = res.data.results.filter(r => r.status === 'synced').map(r => r.localId);
        clearSynced(synced);
      } catch (e) { console.error('Sync failed:', e.message); }
    };

    const handleOnline = async () => {
      setOnline(true);
      await flushQueue();
    };
    const handleOffline = () => setOnline(false);

    if (navigator.onLine) {
      void flushQueue();
    }

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue, clearSynced, setOnline]);
}
