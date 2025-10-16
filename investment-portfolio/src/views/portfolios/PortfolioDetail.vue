<!-- Deep-dive page that lets advisors review a single portfolio’s status, client, and holdings in one glance. -->
<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">
          {{ portfolio?.name || "Portfolio" }}
        </h1>
        <p class="text-sm text-slate-600">
          Detailed breakdown of holdings and performance.
        </p>
      </div>
      <div class="flex gap-2">
        <router-link
          v-if="portfolio"
          :to="{ name: 'PortfolioEdit', params: { id: portfolio.id } }"
          class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Edit
        </router-link>
        <button
          v-if="portfolio"
          type="button"
          class="rounded-md border border-danger/40 px-4 py-2 text-sm font-semibold text-danger transition hover:bg-red-50"
          @click="onDelete"
        >
          Delete
        </button>
        <router-link
          to="/portfolios"
          class="rounded-md bg-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary"
        >
          Back to list
        </router-link>
      </div>
    </div>

    <AppAlert v-if="error" :message="error" variant="danger" />

    <AppCard v-if="portfolio">
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-slate-800">Summary</h2>
          <dl class="space-y-2 text-sm text-slate-700">
            <div class="flex items-center justify-between">
              <dt>Status</dt>
              <dd>
                <span
                  :class="[
                    'rounded-full px-3 py-1 text-xs font-semibold',
                    statusClass(portfolio.status),
                  ]"
                  >{{ portfolio.status }}</span
                >
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt>Initial investment</dt>
              <dd>{{ formatCurrency(portfolio.initialInvestment) }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt>Current value</dt>
              <dd>{{ formatCurrency(portfolio.currentValue) }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt>Return</dt>
              <dd :class="returnValueClass">
                {{ formatCurrency(returnValue) }}
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt>Return %</dt>
              <dd :class="returnValueClass">{{ returnPercentLabel }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt>Expected return rate</dt>
              <dd>{{ portfolio.expectedReturnRate }}%</dd>
            </div>
          </dl>
        </div>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-slate-800">Client</h2>
          <div
            v-if="client"
            class="rounded-md border border-slate-200 p-4 text-sm text-slate-700"
          >
            <p class="font-semibold text-slate-900">{{ client.name }}</p>
            <p>{{ client.email }}</p>
            <p v-if="client.phone">{{ client.phone }}</p>
          </div>
          <AppAlert
            v-else
            variant="warning"
            message="Client record not found."
          />
        </div>
      </div>
    </AppCard>

    <AppCard v-if="portfolio" title="Holdings">
      <AppTable v-if="portfolio.holdings.length">
        <template #header>
          <th scope="col" class="px-4 py-3">Symbol</th>
          <th scope="col" class="px-4 py-3 text-right">Units</th>
          <th scope="col" class="px-4 py-3 text-right">Average Price</th>
        </template>
        <tr
          v-for="holding in portfolio.holdings"
          :key="`${holding.symbol}-${holding.units}-${holding.avgPrice}`"
        >
          <td class="px-4 py-3 font-medium text-slate-800">
            {{ holding.symbol }}
          </td>
          <td class="px-4 py-3 text-right">{{ holding.units }}</td>
          <td class="px-4 py-3 text-right">
            {{ formatCurrency(holding.avgPrice) }}
          </td>
        </tr>
      </AppTable>
      <p v-else class="text-sm text-slate-600">
        No holdings recorded for this portfolio.
      </p>
    </AppCard>

    <AppCard v-if="!portfolio && !loading" title="Portfolio not found">
      <p class="text-sm text-slate-600">
        The requested portfolio does not exist or may have been removed.
      </p>
    </AppCard>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import AppAlert from "../../components/ui/AppAlert.vue";
import AppCard from "../../components/ui/AppCard.vue";
import AppTable from "../../components/ui/AppTable.vue";

const STATUS_COLORS = {
  UPCOMING: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-green-100 text-green-700",
  CLOSED: "bg-slate-200 text-slate-700",
};

export default {
  name: "PortfolioDetail",
  components: {
    AppAlert,
    AppCard,
    AppTable,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      error: "",
    };
  },
  computed: {
    ...mapState("portfolios", ["items", "loading"]),
    ...mapGetters("portfolios", ["byId"]),
    ...mapGetters("users", { userById: "byId" }),
    portfolio() {
      return this.byId(this.id);
    },
    client() {
      if (!this.portfolio) return null;
      return this.userById(this.portfolio.clientId);
    },
    returnValue() {
      if (!this.portfolio) return 0;
      return this.portfolio.currentValue - this.portfolio.initialInvestment;
    },
    returnPercentLabel() {
      if (!this.portfolio || !this.portfolio.initialInvestment) {
        return "—";
      }
      const percent =
        (this.returnValue / this.portfolio.initialInvestment) * 100;
      return `${percent.toFixed(2)}%`;
    },
    returnValueClass() {
      if (this.returnValue > 0) {
        return "text-success";
      }
      if (this.returnValue < 0) {
        return "text-danger";
      }
      return "text-slate-700";
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    ...mapActions("portfolios", ["fetchAll", "remove"]),
    ...mapActions("users", { fetchUsers: "fetchAll" }),
    // Pull both users and portfolios so the detail view never shows stale info.
    async initialize() {
      try {
        await Promise.all([this.fetchUsers(), this.fetchAll()]);
      } catch (error) {
        this.error = error?.message || "Unable to load portfolio.";
      }
    },
    statusClass(status) {
      return STATUS_COLORS[status] || "bg-slate-200 text-slate-700";
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(value);
    },
    async onDelete() {
      if (!this.portfolio) return;
      const confirmed = window.confirm(
        "Delete this portfolio? This action cannot be undone."
      );
      if (!confirmed) return;
      await this.remove(this.portfolio.id);
      this.$router.push("/portfolios");
    },
  },
};
</script>
