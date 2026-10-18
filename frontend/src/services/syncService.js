import api from './api';
import { idb } from '../utils/db';

export const syncService = {
  flush: async (queue) => {
    const res = await api.post('/sync/flush', { queue });
    return res.data;
  },
  saveOffline: async (store, data) => {
    await idb.put(store, { ...data, id: data.id || data._id || Date.now() });
  },
  getOffline: async (store, key) => {
    return key ? idb.get(store, key) : idb.getAll(store);
  },
};
