<!-- Global navigation bar that lets advisors hop between portfolios, users, and their session controls. -->
<template>
  <header class="bg-white shadow-sm">
    <div
      class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4"
    >
      <router-link
        to="/portfolios"
        class="text-lg font-semibold text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light"
      >
        Investment Portfolio
      </router-link>
      <nav aria-label="Main navigation" class="flex items-center gap-4">
        <ul class="flex gap-4 text-sm font-medium">
          <li>
            <router-link
              to="/users"
              class="rounded px-3 py-2 transition hover:bg-primary-light/10 focus:outline-none focus:ring-2 focus:ring-primary-light"
              active-class="bg-primary-light/20 text-primary-dark"
            >
              Users
            </router-link>
          </li>
          <li>
            <router-link
              to="/portfolios"
              class="rounded px-3 py-2 transition hover:bg-primary-light/10 focus:outline-none focus:ring-2 focus:ring-primary-light"
              active-class="bg-primary-light/20 text-primary-dark"
            >
              Portfolios
            </router-link>
          </li>
        </ul>
        <div class="flex items-center gap-3 pl-4">
          <div class="text-right text-xs leading-tight text-slate-500">
            <p class="text-sm font-semibold text-slate-700">
              {{ currentUser?.name || "Advisor" }}
            </p>
            <p>{{ currentUser?.title || currentUser?.email }}</p>
          </div>
          <button
            type="button"
            class="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-primary-light hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light"
            @click="handleLogout"
          >
            Sign out
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "AppHeader",
  computed: {
    ...mapState("auth", ["currentUser"]),
  },
  methods: {
    ...mapActions("auth", ["logout"]),
    handleLogout() {
      this.logout();
      this.$router.replace("/login");
    },
  },
};
</script>
