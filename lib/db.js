const store = new Map();

export default {
  async get(key) {
    return store.get(key) || null;
  },
  async set(key, value) {
    store.set(key, value);
  },
  async del(key) {
    store.delete(key);
  }
};
