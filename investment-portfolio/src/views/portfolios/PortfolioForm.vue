<!-- Hands-on form where advisors craft or edit portfolios, complete with validation and live rupee previews. -->
<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900">
        {{ isEdit ? "Edit Portfolio" : "New Portfolio" }}
      </h1>
      <p class="text-sm text-slate-600">
        Capture portfolio details, ownership, and holdings.
      </p>
    </div>

    <AppCard>
      <form class="space-y-8" @submit.prevent="handleSubmit">
        <AppAlert v-if="formError" :message="formError" variant="danger" />

        <div class="grid gap-4 md:grid-cols-2">
          <AppSelect
            v-model="form.clientId"
            label="Client"
            :error="errors.clientId"
            description="Select the client who owns this portfolio."
            @blur="() => validateField('clientId')"
          >
            <option value="">Select a client</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </AppSelect>
          <AppInput
            v-model="form.name"
            label="Portfolio name"
            placeholder="Retirement Growth"
            :error="errors.name"
            description="Provide a descriptive name for the portfolio (2-80 characters)."
            @blur="() => validateField('name')"
          />
          <AppSelect
            v-model="form.status"
            label="Status"
            :error="errors.status"
            description="Track the lifecycle stage of the portfolio."
            @blur="() => validateField('status')"
          >
            <option v-for="status in statuses" :key="status" :value="status">
              {{ status }}
            </option>
          </AppSelect>
          <AppInput
            v-model="form.expectedReturnRate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            label="Expected return rate (%)"
            :error="errors.expectedReturnRate"
            description="Enter an expected return rate between 0 and 100%."
            @blur="() => validateField('expectedReturnRate')"
          />
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <AppInput
            v-model="form.initialInvestment"
            type="number"
            min="0"
            step="0.01"
            label="Initial investment"
            :error="errors.initialInvestment"
            description="Total capital initially invested."
            @blur="() => validateField('initialInvestment')"
          />
          <AppInput
            v-model="form.currentValue"
            type="number"
            min="0"
            step="0.01"
            label="Current value"
            :error="errors.currentValue"
            description="Latest market value of the portfolio."
            @blur="() => validateField('currentValue')"
          />
          <div
            class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
          >
            <p class="font-semibold text-slate-900">Performance preview</p>
            <p>
              Return:
              <span :class="returnClass">{{
                formatCurrency(returnValue)
              }}</span>
            </p>
            <p>
              Return %:
              <span :class="returnClass">{{ returnPercentLabel }}</span>
            </p>
          </div>
        </div>

        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-800">Holdings</h2>
            <button
              type="button"
              class="rounded-md border border-primary-light px-3 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light/10"
              @click="addHolding"
            >
              Add holding
            </button>
          </div>

          <div
            v-if="!form.holdings.length"
            class="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500"
          >
            No holdings yet. Add rows to capture assets in this portfolio.
          </div>

          <div
            v-for="(holding, index) in form.holdings"
            :key="holding.id"
            class="grid gap-4 md:grid-cols-4"
          >
            <AppInput
              v-model="holding.symbol"
              label="Symbol"
              placeholder="AAPL"
              :error="errors[`holding-symbol-${index}`]"
              @blur="() => validateHolding(index)"
            />
            <AppInput
              v-model="holding.units"
              type="number"
              min="0"
              step="0.01"
              label="Units"
              :error="errors[`holding-units-${index}`]"
              @blur="() => validateHolding(index)"
            />
            <AppInput
              v-model="holding.avgPrice"
              type="number"
              min="0"
              step="0.01"
              label="Average price"
              :error="errors[`holding-avgPrice-${index}`]"
              @blur="() => validateHolding(index)"
            />
            <div class="flex items-end justify-end">
              <button
                type="button"
                class="rounded-md border border-danger/40 px-3 py-2 text-xs font-semibold text-danger transition hover:bg-red-50"
                @click="removeHolding(index)"
              >
                Remove
              </button>
            </div>
          </div>
        </section>

        <div class="flex items-center justify-end gap-3">
          <router-link
            to="/portfolios"
            class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            class="inline-flex items-center rounded-md bg-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary"
          >
            {{ isEdit ? "Update Portfolio" : "Create Portfolio" }}
          </button>
        </div>
      </form>
    </AppCard>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import { v4 as uuid } from "uuid";
import AppAlert from "../../components/ui/AppAlert.vue";
import AppCard from "../../components/ui/AppCard.vue";
import AppInput from "../../components/ui/AppInput.vue";
import AppSelect from "../../components/ui/AppSelect.vue";

const STATUSES = ["UPCOMING", "ACTIVE", "CLOSED"];

export default {
  name: "PortfolioForm",
  components: {
    AppAlert,
    AppCard,
    AppInput,
    AppSelect,
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
        clientId: "",
        name: "",
        status: "UPCOMING",
        initialInvestment: 0,
        currentValue: 0,
        expectedReturnRate: 0,
        holdings: [],
      },
      errors: {},
      formError: "",
    };
  },
  computed: {
    ...mapGetters("portfolios", ["byId"]),
    ...mapState("users", { users: (state) => state.items }),
    isEdit() {
      return Boolean(this.id);
    },
    statuses() {
      return STATUSES;
    },
    returnValue() {
      const diff =
        Number(this.form.currentValue || 0) -
        Number(this.form.initialInvestment || 0);
      return diff;
    },
    returnPercentLabel() {
      const initial = Number(this.form.initialInvestment || 0);
      if (!initial) {
        return "—";
      }
      const percent = (this.returnValue / initial) * 100;
      return `${percent.toFixed(2)}%`;
    },
    returnClass() {
      if (this.returnValue > 0) return "text-success";
      if (this.returnValue < 0) return "text-danger";
      return "text-slate-700";
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    ...mapActions("portfolios", ["fetchAll", "create", "update"]),
    ...mapActions("users", { fetchUsers: "fetchAll" }),
    async initialize() {
      await Promise.all([this.fetchUsers(), this.fetchAll()]);
      if (this.isEdit) {
        const portfolio = this.byId(this.id);
        if (portfolio) {
          this.form = {
            ...portfolio,
            holdings: portfolio.holdings.map((holding) => ({
              ...holding,
              id: uuid(),
            })),
          };
        } else {
          this.formError = "Portfolio not found.";
        }
      }
      if (!this.form.holdings.length) {
        this.addHolding();
      }
    },
    addHolding() {
      this.form.holdings.push({
        id: uuid(),
        symbol: "",
        units: "",
        avgPrice: "",
      });
    },
    removeHolding(index) {
      this.form.holdings.splice(index, 1);
    },
    validateField(field) {
      if (field === "clientId") {
        if (!this.form.clientId) {
          this.errors.clientId = "Select a client.";
        } else {
          delete this.errors.clientId;
        }
      }
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
      if (field === "status") {
        if (!STATUSES.includes(this.form.status)) {
          this.errors.status = "Select a valid status.";
        } else {
          delete this.errors.status;
        }
      }
      if (field === "initialInvestment") {
        if (Number(this.form.initialInvestment) < 0) {
          this.errors.initialInvestment = "Value must be zero or greater.";
        } else {
          delete this.errors.initialInvestment;
        }
      }
      if (field === "currentValue") {
        if (Number(this.form.currentValue) < 0) {
          this.errors.currentValue = "Value must be zero or greater.";
        } else {
          delete this.errors.currentValue;
        }
      }
      if (field === "expectedReturnRate") {
        const rate = Number(this.form.expectedReturnRate);
        if (Number.isNaN(rate) || rate < 0 || rate > 100) {
          this.errors.expectedReturnRate = "Rate must be between 0 and 100.";
        } else {
          delete this.errors.expectedReturnRate;
        }
      }
    },
    validateHolding(index) {
      const holding = this.form.holdings[index];
      const symbolKey = `holding-symbol-${index}`;
      const unitsKey = `holding-units-${index}`;
      const priceKey = `holding-avgPrice-${index}`;
      const hasContent =
        (holding.symbol && holding.symbol.trim().length) ||
        Number(holding.units) ||
        Number(holding.avgPrice);

      if (!hasContent) {
        delete this.errors[symbolKey];
        delete this.errors[unitsKey];
        delete this.errors[priceKey];
        return;
      }

      if (!holding.symbol || !holding.symbol.trim()) {
        this.errors[symbolKey] = "Symbol is required.";
      } else {
        delete this.errors[symbolKey];
      }
      if (Number(holding.units) < 0 || Number.isNaN(Number(holding.units))) {
        this.errors[unitsKey] = "Units must be zero or greater.";
      } else {
        delete this.errors[unitsKey];
      }
      if (
        Number(holding.avgPrice) < 0 ||
        Number.isNaN(Number(holding.avgPrice))
      ) {
        this.errors[priceKey] = "Average price must be zero or greater.";
      } else {
        delete this.errors[priceKey];
      }
    },
    validateForm() {
      [
        "clientId",
        "name",
        "status",
        "initialInvestment",
        "currentValue",
        "expectedReturnRate",
      ].forEach((field) => this.validateField(field));
      this.form.holdings.forEach((_, index) => this.validateHolding(index));
      return Object.keys(this.errors).length === 0;
    },
    sanitizeForm() {
      return {
        id: this.form.id,
        clientId: this.form.clientId,
        name: this.form.name.trim(),
        status: this.form.status,
        initialInvestment: Number(this.form.initialInvestment) || 0,
        currentValue: Number(this.form.currentValue) || 0,
        expectedReturnRate: Number(this.form.expectedReturnRate) || 0,
        holdings: this.form.holdings
          .filter((holding) => holding.symbol && holding.symbol.trim())
          .map(({ symbol, units, avgPrice }) => ({
            symbol: symbol.trim(),
            units: Number(units) || 0,
            avgPrice: Number(avgPrice) || 0,
        })),
      };
    },
    // Offer an at-a-glance rupee preview while the form updates live.
    formatCurrency(value) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(value);
    },
    async handleSubmit() {
      this.formError = "";
      if (!this.validateForm()) {
        this.formError = "Please resolve the highlighted issues to continue.";
        return;
      }
      try {
        const payload = this.sanitizeForm();
        if (this.isEdit) {
          await this.update(payload);
        } else {
          await this.create(payload);
        }
        this.$router.push("/portfolios");
      } catch (error) {
        this.formError = error?.message || "Unable to save portfolio.";
      }
    },
  },
};
</script>
