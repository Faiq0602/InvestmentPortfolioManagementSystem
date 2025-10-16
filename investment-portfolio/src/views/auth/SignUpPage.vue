<!-- Sign-up flow for spinning up sandbox advisor accounts right inside the browser. -->
<template>
  <div
    class="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-start"
  >
    <section class="w-full max-w-xl space-y-6 text-center lg:text-left">
      <p
        class="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
      >
        Advisor Onboarding
      </p>
      <h1 class="text-3xl font-semibold text-white sm:text-4xl">
        Create a Demo Advisor Account
      </h1>
      <p class="text-base text-white/80">
        Spin up additional demo credentials to explore collaboration flows
        without touching production systems. Every account you create lives only
        in this browser.
      </p>
      <div
        class="space-y-3 rounded-2xl border border-white/20 bg-white/10 p-6 text-left text-sm text-white/80 shadow-lg backdrop-blur"
      >
        <p
          class="text-xs font-semibold uppercase tracking-widest text-white/70"
        >
          Helpful tips
        </p>
        <ul class="list-disc space-y-2 pl-4">
          <li>
            Use work-style emails (for example, advisor.team@demo.in) to keep
            test data organized.
          </li>
          <li>
            Aim for a memorable 6+ character password; it is stored locally for
            this sandbox only.
          </li>
          <li>
            Need an existing login instead?
            <router-link
              to="/login"
              class="font-semibold text-white underline-offset-4 hover:underline"
              >Return to the sign-in page.</router-link
            >
          </li>
        </ul>
      </div>
    </section>

    <AppCard class="w-full max-w-md bg-white/90 shadow-xl ring-1 ring-black/5">
      <template #header>
        <div class="space-y-2 text-center">
          <h2 class="text-2xl font-semibold text-slate-900">
            Register Demo Access
          </h2>
          <p class="text-sm text-slate-500">
            Provide a name, email, and password to provision a local advisor
            identity immediately.
          </p>
        </div>
      </template>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <AppAlert v-if="error" :message="error" variant="danger" />

        <AppInput
          v-model="form.name"
          label="Full name"
          placeholder="Avery Advisor"
          :error="getError('name')"
          @blur="markTouched('name')"
          @input="clearErrorMessage"
        />

        <AppInput
          v-model="form.title"
          label="Role or title"
          placeholder="Wealth Strategist"
          description="Optional — used to personalize the dashboard."
          @input="clearErrorMessage"
        />

        <AppInput
          v-model="form.email"
          label="Work email"
          type="email"
          placeholder="advisor.team@demo.in"
          :error="getError('email')"
          @blur="markTouched('email')"
          @input="clearErrorMessage"
        />

        <AppInput
          v-model="form.password"
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          :error="getError('password')"
          @blur="markTouched('password')"
          @input="clearErrorMessage"
        />

        <AppInput
          v-model="form.confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Repeat the password"
          :error="getError('confirmPassword')"
          @blur="markTouched('confirmPassword')"
          @input="clearErrorMessage"
        />

        <div class="flex items-center justify-between text-sm">
          <button
            type="button"
            class="text-primary-dark underline-offset-4 transition hover:underline"
            @click="resetForm"
          >
            Clear form
          </button>
          <router-link to="/login" class="text-slate-400 hover:text-slate-500">
            Already have access?
          </router-link>
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
          <span>{{ loading ? "Creating account…" : "Create account" }}</span>
        </button>
      </form>

      <template #footer>
        <p class="text-center text-xs text-slate-500">
          Accounts are sandboxed to your browser. Remove local storage to wipe
          demo users at any time.
        </p>
      </template>
    </AppCard>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import AppCard from "../../components/ui/AppCard.vue";
import AppInput from "../../components/ui/AppInput.vue";
import AppAlert from "../../components/ui/AppAlert.vue";

const emailPattern = /\S+@\S+\.\S+/;

export default {
  name: "SignUpPage",
  components: {
    AppCard,
    AppInput,
    AppAlert,
  },
  data() {
    return {
      form: {
        name: "",
        title: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      touchedFields: {
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
      },
    };
  },
  computed: {
    ...mapState("auth", ["loading", "error"]),
    validationErrors() {
      // Friendly guardrails to keep our demo accounts tidy without nagging too much.
      const errors = {};

      if (!this.form.name.trim()) {
        errors.name = "Name is required.";
      }

      const normalizedEmail = this.form.email.trim().toLowerCase();
      if (!normalizedEmail) {
        errors.email = "Email is required.";
      } else if (!emailPattern.test(normalizedEmail)) {
        errors.email = "Enter a valid email address.";
      }

      if (!this.form.password) {
        errors.password = "Password is required.";
      } else if (this.form.password.length < 6) {
        errors.password = "Password must be at least 6 characters.";
      }

      if (!this.form.confirmPassword) {
        errors.confirmPassword = "Please confirm the password.";
      } else if (this.form.confirmPassword !== this.form.password) {
        errors.confirmPassword = "Passwords do not match.";
      }

      return errors;
    },
  },
  methods: {
    ...mapActions("auth", ["signup", "clearError"]),
    markTouched(field) {
      this.touchedFields[field] = true;
    },
    getError(field) {
      return this.touchedFields[field]
        ? this.validationErrors[field] || ""
        : "";
    },
    clearErrorMessage() {
      if (this.error) {
        this.clearError();
      }
    },
    resetForm() {
      this.form = {
        name: "",
        title: "",
        email: "",
        password: "",
        confirmPassword: "",
      };
      this.touchedFields = {
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
      };
      this.clearErrorMessage();
    },
    async handleSubmit() {
      this.touchedFields = {
        name: true,
        email: true,
        password: true,
        confirmPassword: true,
      };

      if (Object.keys(this.validationErrors).length > 0) {
        return;
      }

      try {
        await this.signup({
          name: this.form.name,
          title: this.form.title,
          email: this.form.email,
          password: this.form.password,
        });
        const redirect = this.$route.query.redirect || "/portfolios";
        this.$router.replace(redirect);
      } catch (error) {
        console.warn(error);
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
