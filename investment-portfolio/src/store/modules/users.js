// Vuex module that keeps the client directory in sync with our local persistence layer.
import { v4 as uuid } from "uuid";
import db from "../../mock/db";

const state = () => ({
  items: [],
  loading: false,
  error: null,
});

const getters = {
  all: (state) => state.items,
  byId: (state) => (id) => state.items.find((user) => user.id === id),
};

const mutations = {
  SET_LOADING(state, value) {
    state.loading = value;
  },
  SET_ERROR(state, message) {
    state.error = message;
  },
  SET_ITEMS(state, users) {
    state.items = users;
  },
  ADD_ITEM(state, user) {
    state.items.push(user);
  },
  UPDATE_ITEM(state, updatedUser) {
    state.items = state.items.map((user) =>
      user.id === updatedUser.id ? updatedUser : user
    );
  },
  REMOVE_ITEM(state, id) {
    state.items = state.items.filter((user) => user.id !== id);
  },
};

const actions = {
  async fetchAll({ commit }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);
    try {
      const users = await db.fetchUsers();
      commit("SET_ITEMS", users);
      return users;
    } catch (error) {
      const message = error?.message || "Unable to load users.";
      commit("SET_ERROR", message);
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },
  async create({ commit, state }, payload) {
    commit("SET_ERROR", null);
    const user = {
      ...payload,
      id: uuid(),
    };
    const next = [...state.items, user];
    await db.saveUsers(next);
    commit("ADD_ITEM", user);
    return user;
  },
  async update({ commit, state }, payload) {
    commit("SET_ERROR", null);
    const next = state.items.map((user) =>
      user.id === payload.id ? { ...user, ...payload } : user
    );
    await db.saveUsers(next);
    commit("UPDATE_ITEM", payload);
    return payload;
  },
  async remove({ commit, state }, id) {
    commit("SET_ERROR", null);
    const next = state.items.filter((user) => user.id !== id);
    await db.saveUsers(next);
    commit("REMOVE_ITEM", id);
    return true;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
