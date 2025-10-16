// Simple in-browser persistence layer so our demo data sticks around between reloads.
const STORAGE_KEYS = {
  users: "investment-portfolio-users",
  portfolios: "investment-portfolio-portfolios",
};

const memoryStore = {
  [STORAGE_KEYS.users]: [],
  [STORAGE_KEYS.portfolios]: [],
};

function getStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem(key) {
      return JSON.stringify(memoryStore[key] || []);
    },
    setItem(key, value) {
      memoryStore[key] = JSON.parse(value);
    },
  };
}

function readCollection(key) {
  const storage = getStorage();
  const value = storage.getItem(key);
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse localStorage value", error);
    return [];
  }
}

function writeCollection(key, data) {
  const storage = getStorage();
  storage.setItem(key, JSON.stringify(data));
}

function wrapResult(result) {
  return Promise.resolve(result);
}

export function fetchUsers() {
  return wrapResult(readCollection(STORAGE_KEYS.users));
}

export function saveUsers(users) {
  writeCollection(STORAGE_KEYS.users, users);
  return wrapResult(users);
}

export function fetchPortfolios() {
  return wrapResult(readCollection(STORAGE_KEYS.portfolios));
}

export function savePortfolios(portfolios) {
  writeCollection(STORAGE_KEYS.portfolios, portfolios);
  return wrapResult(portfolios);
}

export function clearAll() {
  writeCollection(STORAGE_KEYS.users, []);
  writeCollection(STORAGE_KEYS.portfolios, []);
  return wrapResult(true);
}

export default {
  fetchUsers,
  saveUsers,
  fetchPortfolios,
  savePortfolios,
  clearAll,
  STORAGE_KEYS,
};
