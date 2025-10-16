// Navigation blueprint that steers visitors through auth gates into the advisor workspace.
import { createRouter, createWebHistory } from "vue-router";
import store from "../store";
import LoginPage from "../views/auth/LoginPage.vue";
import SignUpPage from "../views/auth/SignUpPage.vue";
import UserList from "../views/users/UserList.vue";
import UserForm from "../views/users/UserForm.vue";
import PortfolioList from "../views/portfolios/PortfolioList.vue";
import PortfolioDetail from "../views/portfolios/PortfolioDetail.vue";
import PortfolioForm from "../views/portfolios/PortfolioForm.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: { requiresGuest: true },
  },
  {
    path: "/signup",
    name: "Signup",
    component: SignUpPage,
    meta: { requiresGuest: true },
  },
  {
    path: "/users",
    name: "UserList",
    component: UserList,
    meta: { requiresAuth: true },
  },
  {
    path: "/users/new",
    name: "UserCreate",
    component: UserForm,
    meta: { requiresAuth: true },
  },
  {
    path: "/users/:id/edit",
    name: "UserEdit",
    component: UserForm,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/portfolios",
    name: "PortfolioList",
    component: PortfolioList,
    meta: { requiresAuth: true },
  },
  {
    path: "/portfolios/new",
    name: "PortfolioCreate",
    component: PortfolioForm,
    meta: { requiresAuth: true },
  },
  {
    path: "/portfolios/:id",
    name: "PortfolioDetail",
    component: PortfolioDetail,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/portfolios/:id/edit",
    name: "PortfolioEdit",
    component: PortfolioForm,
    props: true,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters["auth/isAuthenticated"];

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({
      path: "/login",
      query: to.path === "/login" ? {} : { redirect: to.fullPath },
    });
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ path: "/portfolios" });
  }

  return next();
});

export default router;
