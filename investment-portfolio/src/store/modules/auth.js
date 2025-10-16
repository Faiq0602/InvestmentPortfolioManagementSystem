// Handles demo-friendly authentication, persisting advisors and their sessions in localStorage.
const USER_STORAGE_KEY = "investment-portfolio-auth-user";
const ACCOUNT_STORAGE_KEY = "investment-portfolio-auth-accounts";

const DEMO_ACCOUNTS = [
  {
    email: "advisor@demo.in",
    password: "demo123",
    name: "Demo Wealth Advisor",
    title: "Senior Advisor",
    isDemo: true,
  },
  {
    email: "analyst@demo.in",
    password: "alpha321",
    name: "Research Analyst",
    title: "Portfolio Research",
    isDemo: true,
  },
];

function cloneAccounts(list) {
  return list.map((account) => ({ ...account }));
}

function readStoredJSON(key) {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn(`Unable to parse stored key ${key}`, error);
    return null;
  }
}

function writeStoredJSON(key, value) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  if (value === null) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function readStoredAccounts() {
  const stored = readStoredJSON(ACCOUNT_STORAGE_KEY);
  if (!Array.isArray(stored)) {
    // Ensure demo accounts are persisted for first-time visitors.
    writeStoredJSON(ACCOUNT_STORAGE_KEY, cloneAccounts(DEMO_ACCOUNTS));
    return cloneAccounts(DEMO_ACCOUNTS);
  }

  const sanitized = stored
    .map((account) => ({
      email:
        typeof account.email === "string"
          ? account.email.trim().toLowerCase()
          : "",
      password: typeof account.password === "string" ? account.password : "",
      name: account.name || "Demo User",
      title: account.title || "",
      isDemo: Boolean(account.isDemo),
    }))
    .filter((account) => account.email && account.password);

  const existingEmails = new Set(sanitized.map((account) => account.email));
  DEMO_ACCOUNTS.forEach((demoAccount) => {
    if (!existingEmails.has(demoAccount.email)) {
      sanitized.push({ ...demoAccount });
    }
  });

  writeStoredJSON(ACCOUNT_STORAGE_KEY, sanitized);
  return sanitized;
}

function readStoredUser() {
  const storedUser = readStoredJSON(USER_STORAGE_KEY);
  if (storedUser && storedUser.email) {
    return storedUser;
  }
  return null;
}

function persistAccounts(accounts) {
  writeStoredJSON(ACCOUNT_STORAGE_KEY, accounts);
}

function persistUser(user) {
  writeStoredJSON(USER_STORAGE_KEY, user ? { ...user } : null);
}

const state = () => {
  const accounts = readStoredAccounts();
  const storedUser = readStoredUser();
  const activeAccount =
    storedUser && storedUser.email
      ? accounts.find(
          (account) => account.email === storedUser.email.toLowerCase()
        )
      : null;

  const currentUser = activeAccount
    ? {
        name: storedUser.name || activeAccount.name,
        email: activeAccount.email,
        title: storedUser.title || activeAccount.title || "",
      }
    : null;

  if (!activeAccount) {
    persistUser(null);
  }

  return {
    accounts,
    currentUser,
    loading: false,
    error: null,
  };
};

const getters = {
  isAuthenticated: (state) => Boolean(state.currentUser),
  demoAccounts: (state) => state.accounts.filter((account) => account.isDemo),
  accountByEmail: (state) => (email) => {
    if (typeof email !== "string") {
      return undefined;
    }
    const normalizedEmail = email.trim().toLowerCase();
    return state.accounts.find((account) => account.email === normalizedEmail);
  },
};

const mutations = {
  SET_LOADING(state, value) {
    state.loading = value;
  },
  SET_ERROR(state, message) {
    state.error = message;
  },
  SET_USER(state, user) {
    state.currentUser = user;
  },
  SET_ACCOUNTS(state, accounts) {
    state.accounts = accounts;
  },
};

const actions = {
  async login({ commit, getters }, { email, password }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 150));

      const normalizedEmail = email.trim().toLowerCase();
      const account = getters.accountByEmail(normalizedEmail);

      if (!account || account.password !== password) {
        throw new Error(
          "Invalid email or password. Please use one of the demo accounts shown."
        );
      }

      const user = {
        name: account.name,
        email: account.email,
        title: account.title || "",
      };

      persistUser(user);
      commit("SET_USER", user);
      return user;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to login at the moment.";
      commit("SET_ERROR", message);
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },
  async signup(
    { commit, state, getters },
    { name, email, password, title = "" }
  ) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const normalizedEmail = email.trim().toLowerCase();
      if (getters.accountByEmail(normalizedEmail)) {
        throw new Error("An account with this email already exists.");
      }

      const trimmedName = name.trim() || "New Advisor";
      const newAccount = {
        email: normalizedEmail,
        password,
        name: trimmedName,
        title: title.trim(),
        isDemo: false,
      };

      const updatedAccounts = [...state.accounts, newAccount];
      persistAccounts(updatedAccounts);
      commit("SET_ACCOUNTS", updatedAccounts);

      const user = {
        name: trimmedName,
        email: normalizedEmail,
        title: newAccount.title,
      };

      persistUser(user);
      commit("SET_USER", user);
      return user;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create an account right now.";
      commit("SET_ERROR", message);
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },
  logout({ commit }) {
    persistUser(null);
    commit("SET_USER", null);
    commit("SET_ERROR", null);
  },
  clearError({ commit }) {
    commit("SET_ERROR", null);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export { DEMO_ACCOUNTS, ACCOUNT_STORAGE_KEY, USER_STORAGE_KEY };
