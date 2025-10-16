<!-- Client management form used to capture advisor contact info with friendly validation hints. -->
<template>
  <div class="mx-auto max-w-3xl">
    <AppCard :title="isEdit ? 'Edit Client' : 'New Client'">
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <AppAlert v-if="formError" :message="formError" variant="danger" />

        <div class="grid gap-4 sm:grid-cols-2">
          <AppInput
            v-model="form.name"
            label="Name"
            placeholder="Jane Doe"
            :error="errors.name"
            description="Enter the client's full name (2-80 characters)."
            @blur="() => validateField('name')"
          />
          <AppInput
            v-model="form.email"
            type="email"
            label="Email"
            placeholder="name@example.com"
            :error="errors.email"
            description="We'll use this email for communications."
            @blur="() => validateField('email')"
          />
        </div>

        <AppInput
          v-model="form.phone"
          label="Phone (optional)"
          placeholder="+91 98765 43210"
          :error="errors.phone"
          description="Add a contact number to reach the client."
        />

        <div class="flex items-center justify-end gap-3">
          <router-link
            to="/users"
            class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            class="inline-flex items-center rounded-md bg-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary"
          >
            {{ isEdit ? "Update User" : "Create User" }}
          </button>
        </div>
      </form>
    </AppCard>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import AppAlert from "../../components/ui/AppAlert.vue";
import AppCard from "../../components/ui/AppCard.vue";
import AppInput from "../../components/ui/AppInput.vue";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  name: "UserForm",
  components: {
    AppAlert,
    AppCard,
    AppInput,
  },
  props: {
    id: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      form: {
        id: null,
        name: "",
        email: "",
        phone: "",
      },
      errors: {},
      formError: "",
    };
  },
  computed: {
    ...mapGetters("users", ["byId"]),
    isEdit() {
      return Boolean(this.id);
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    ...mapActions("users", ["fetchAll", "create", "update"]),
    // Load users upfront so editing can instantly hydrate the form.
    async initialize() {
      await this.fetchAll();
      if (this.isEdit) {
        const user = this.byId(this.id);
        if (user) {
          this.form = { ...user };
        } else {
          this.formError = "User not found.";
        }
      }
    },
    validateField(field) {
      if (field === "name") {
        const name = this.form.name.trim();
        if (!name) {
          this.errors.name = "Name is required.";
        } else if (name.length < 2 || name.length > 80) {
          this.errors.name = "Name must be between 2 and 80 characters.";
        } else {
          delete this.errors.name;
        }
      }
      if (field === "email") {
        const email = this.form.email.trim();
        if (!email) {
          this.errors.email = "Email is required.";
        } else if (!EMAIL_REGEX.test(email)) {
          this.errors.email = "Enter a valid email address.";
        } else {
          delete this.errors.email;
        }
      }
      return !this.errors[field];
    },
    validateForm() {
      this.validateField("name");
      this.validateField("email");
      return Object.keys(this.errors).length === 0;
    },
    async handleSubmit() {
      this.formError = "";
      if (!this.validateForm()) {
        this.formError =
          "Please correct the highlighted fields before continuing.";
        return;
      }

      try {
        const payload = {
          id: this.form.id,
          name: this.form.name.trim(),
          email: this.form.email.trim(),
          phone: this.form.phone.trim() || "",
        };
        if (this.isEdit) {
          await this.update(payload);
        } else {
          await this.create(payload);
        }
        this.$router.push("/users");
      } catch (error) {
        this.formError = error?.message || "Unable to save user.";
      }
    },
  },
};
</script>
