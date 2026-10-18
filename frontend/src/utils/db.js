// IndexedDB wrapper using idb library
// Usage: await idb.put('lessons', { id:'1', title:'...' })

const DB_NAME    = 'vidyai-db';
const DB_VERSION = 1;
const STORES     = ['lessons','quizzes','progress','syncQueue','reels','cache'];

let _db = null;

async function getDB() {
  if (_db) return _db;
  const { openDB } = await import('idb');
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      STORES.forEach(s => { if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id', autoIncrement: s === 'syncQueue' }); });
    },
  });
  return _db;
}

export const idb = {
  get:    async (store, key)   => (await getDB()).get(store, key),
  getAll: async (store)        => (await getDB()).getAll(store),
  put:    async (store, value) => (await getDB()).put(store, value),
  delete: async (store, key)   => (await getDB()).delete(store, key),
  clear:  async (store)        => (await getDB()).clear(store),
  count:  async (store)        => (await getDB()).count(store),
};
