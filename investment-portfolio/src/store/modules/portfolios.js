// Portfolio nerve center: handles CRUD, filtering, and numeric sanitization for investment records.
import { v4 as uuid } from "uuid";
import db from "../../mock/db";

const state = () => ({
  items: [],
  loading: false,
  error: null,
});

const getters = {
  all: (state) => state.items,
  byId: (state) => (id) => state.items.find((portfolio) => portfolio.id === id),
  filteredByStatus: (state) => (status) => {
    if (!status || status === "ALL") {
      return state.items;
    }
    return state.items.filter((portfolio) => portfolio.status === status);
  },
};

const mutations = {
  SET_LOADING(state, value) {
    state.loading = value;
  },
  SET_ERROR(state, message) {
    state.error = message;
  },
  SET_ITEMS(state, portfolios) {
    state.items = portfolios;
  },
  ADD_ITEM(state, portfolio) {
    state.items.push(portfolio);
  },
  UPDATE_ITEM(state, updatedPortfolio) {
    state.items = state.items.map((portfolio) =>
      portfolio.id === updatedPortfolio.id ? updatedPortfolio : portfolio
    );
  },
  REMOVE_ITEM(state, id) {
    state.items = state.items.filter((portfolio) => portfolio.id !== id);
  },
};

function normalizePortfolio(payload) {
  return {
    ...payload,
    initialInvestment: Number(payload.initialInvestment) || 0,
    currentValue: Number(payload.currentValue) || 0,
    expectedReturnRate: Number(payload.expectedReturnRate) || 0,
    holdings: Array.isArray(payload.holdings)
      ? payload.holdings.map((holding) => ({
          symbol: holding.symbol || "",
          units: Number(holding.units) || 0,
          avgPrice: Number(holding.avgPrice) || 0,
        }))
      : [],
  };
}

const actions = {
  async fetchAll({ commit }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);
    try {
      const portfolios = await db.fetchPortfolios();
      commit("SET_ITEMS", portfolios);
      return portfolios;
    } catch (error) {
      const message = error?.message || "Unable to load portfolios.";
      commit("SET_ERROR", message);
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },
  async create({ commit, state }, payload) {
    commit("SET_ERROR", null);
    const portfolio = normalizePortfolio({ ...payload, id: uuid() });
    const next = [...state.items, portfolio];
    await db.savePortfolios(next);
    commit("ADD_ITEM", portfolio);
    return portfolio;
  },
  async update({ commit, state }, payload) {
    commit("SET_ERROR", null);
    const portfolio = normalizePortfolio(payload);
    const next = state.items.map((item) =>
      item.id === portfolio.id ? portfolio : item
    );
    await db.savePortfolios(next);
    commit("UPDATE_ITEM", portfolio);
    return portfolio;
  },
  async remove({ commit, state }, id) {
    commit("SET_ERROR", null);
    const next = state.items.filter((portfolio) => portfolio.id !== id);
    await db.savePortfolios(next);
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
