<!-- Main app shell that decides whether we’re in “logged-in work mode” or the welcoming gradient. -->
<template>
  <div :class="['min-h-screen', backgroundClass]">
    <AppHeader v-if="isAuthenticated" />
    <main :class="mainWrapperClass">
      <router-view />
    </main>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import AppHeader from "./components/ui/AppHeader.vue";

export default {
  name: "App",
  components: {
    AppHeader,
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated"]),
    backgroundClass() {
      // Keep sign-in screens wrapped in a cozy gradient until someone logs in.
      return this.isAuthenticated
        ? "bg-slate-50 text-slate-900"
        : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white";
    },
    mainWrapperClass() {
      return this.isAuthenticated
        ? "mx-auto max-w-6xl px-4 py-6"
        : "flex min-h-screen items-center justify-center px-4 py-10";
    },
  },
};
</script>
