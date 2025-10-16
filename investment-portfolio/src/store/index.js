// Central Vuex hub that stitches together auth, user, and portfolio modules while kicking off the seed data.
import { createStore } from "vuex";
import auth from "./modules/auth";
import users from "./modules/users";
import portfolios from "./modules/portfolios";
import "../mock/seed";

const store = createStore({
  modules: {
    auth,
    users,
    portfolios,
  },
});

export default store;
