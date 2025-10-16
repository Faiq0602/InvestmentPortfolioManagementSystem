<!-- Welcome mat for advisors: shows demo logins, friendly context, and the actual sign-in form. -->
<template>
  <div
    class="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-start"
  >
    <section class="w-full max-w-xl space-y-6 text-center lg:text-left">
      <p
        class="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
      >
        Secure Advisor Console
      </p>
      <h1 class="text-3xl font-semibold text-white sm:text-4xl">
        Investment Portfolio Management
      </h1>
      <p class="text-base text-white/80">
        Sign in with the provided demo advisor account to explore the full
        client and portfolio management experience. Your session will be
        securely stored in this browser only.
      </p>
      <div
        class="grid w-full gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 text-left text-white/90 shadow-lg backdrop-blur"
      >
        <p class="text-sm font-semibold uppercase tracking-wider text-white/70">
          Demo Credentials
        </p>
        <ul class="grid gap-3 text-sm">
          <li
            v-for="account in demoAccounts"
            :key="account.email"
            class="rounded-lg bg-white/5 p-3 ring-1 ring-white/10"
          >
            <p class="font-medium text-white">{{ account.name }}</p>
            <p class="mt-1">
              Email:
              <span class="font-mono text-white">{{ account.email }}</span>
            </p>
            <p>
              Password:
              <span class="font-mono text-white">{{ account.password }}</span>
            </p>
            <button
              type="button"
              class="mt-3 inline-flex items-center rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-white"
              @click="prefillDemo(account)"
            >
              Use these credentials
            </button>
          </li>
        </ul>
        <p class="rounded-lg bg-white/10 px-4 py-3 text-xs text-white/80">
          Tip: Copy &amp; paste any demo account or click on "Use these
          credentials" to auto-fill the form.
        </p>
      </div>
    </section>

    <AppCard class="w-full max-w-md bg-white/90 shadow-xl ring-1 ring-black/5">
      <template #header>
        <div class="space-y-2 text-center">
          <h2 class="text-2xl font-semibold text-slate-900">Advisor Sign In</h2>
          <p class="text-sm text-slate-500">
            Access powerful analytics, manage client portfolios, and stay on top
            of investment performance.
          </p>
        </div>
      </template>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <AppAlert v-if="error" :message="error" variant="danger" />

        <AppInput
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="advisor@demo.in"
          :error="touched && !form.email ? 'Email is required' : ''"
          @input="clearErrorMessage"
        />

        <AppInput
          v-model="form.password"
          label="Password"
          type="password"
          placeholder="Enter demo password"
          :error="touched && !form.password ? 'Password is required' : ''"
          @input="clearErrorMessage"
        />

        <div class="flex items-center justify-between text-sm">
          <button
            type="button"
            class="text-primary-dark underline-offset-4 transition hover:underline"
            @click="prefillDemo()"
          >
            Auto-fill first demo account
          </button>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-500"
            @click="resetForm"
          >
            Clear form
          </button>
        </div>

        <button
          type="submit"
          class="flex w-full items-center justify-center rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:ring-offset-white"
          :disabled="loading"
        >
          <svg
            v-if="loading"
            class="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>{{ loading ? "Signing in…" : "Sign in" }}</span>
        </button>
      </form>

      <template #footer>
        <div class="space-y-3 text-center text-xs text-slate-500">
          <p>
            By signing in you agree to responsibly manage sensitive financial
            data for demonstration purposes only.
          </p>
          <p>
            New to the console?
            <router-link
              to="/signup"
              class="font-semibold text-primary-dark hover:underline"
            >
              Create a demo advisor account.
            </router-link>
          </p>
        </div>
      </template>
    </AppCard>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import AppCard from "../../components/ui/AppCard.vue";
import AppInput from "../../components/ui/AppInput.vue";
import AppAlert from "../../components/ui/AppAlert.vue";

export default {
  name: "LoginPage",
  components: {
    AppCard,
    AppInput,
    AppAlert,
  },
  data() {
    return {
      form: {
        email: "",
        password: "",
      },
      touched: false,
    };
  },
  computed: {
    ...mapState("auth", ["loading", "error"]),
    ...mapGetters("auth", ["demoAccounts"]),
  },
  methods: {
    ...mapActions("auth", ["login", "clearError"]),
    async handleSubmit() {
      this.touched = true;
      if (!this.form.email || !this.form.password) {
        return;
      }

      try {
        await this.login({ ...this.form });
        const redirect = this.$route.query.redirect || "/portfolios";
        this.$router.replace(redirect);
      } catch (error) {
        console.warn(error);
      }
    },
    prefillDemo(account = this.demoAccounts[0]) {
      if (!account) {
        return;
      }
      // Quick helper so teammates can hop in without retyping the sample creds.
      this.form.email = account.email;
      this.form.password = account.password;
      this.clearErrorMessage();
    },
    resetForm() {
      this.form.email = "";
      this.form.password = "";
      this.touched = false;
      this.clearErrorMessage();
    },
    clearErrorMessage() {
      if (this.error) {
        this.clearError();
      }
    },
  },
};
</script>

<style scoped>
.bg-white\/90 {
  backdrop-filter: blur(6px);
}
</style>
