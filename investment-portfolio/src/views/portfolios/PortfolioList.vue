<!-- Portfolio command center showing filters, quick stats, and direct links into each client allocation. -->
<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Portfolios</h1>
        <p class="text-sm text-slate-600">
          Track investment performance across client accounts.
        </p>
      </div>
      <router-link
        to="/portfolios/new"
        class="inline-flex items-center justify-center rounded-md bg-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary"
      >
        New Portfolio
      </router-link>
    </div>

    <AppAlert v-if="error" :message="error" variant="danger" />

    <AppCard>
      <form class="grid gap-4 sm:grid-cols-3" @submit.prevent>
        <AppSelect v-model="statusFilter" label="Status">
          <option value="ALL">All statuses</option>
          <option v-for="status in statuses" :key="status" :value="status">
            {{ status }}
          </option>
        </AppSelect>
        <AppInput
          v-model="searchTerm"
          label="Search"
          placeholder="Search by portfolio name"
          description="Filter portfolios by name."
        />
      </form>
    </AppCard>

    <div
      v-if="loading"
      class="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600"
    >
      Loading portfolios...
    </div>

    <AppCard v-else-if="!filteredPortfolios.length" title="No portfolios found">
      <p class="text-sm text-slate-600">
        Try adjusting your filters or create a new portfolio to get started.
      </p>
    </AppCard>

    <AppTable v-else>
      <template #header>
        <th scope="col" class="px-4 py-3">Name</th>
        <th scope="col" class="px-4 py-3">Client</th>
        <th scope="col" class="px-4 py-3">Status</th>
        <th scope="col" class="px-4 py-3 text-right">Return</th>
        <th scope="col" class="px-4 py-3 text-right">Return %</th>
        <th scope="col" class="px-4 py-3 text-right">Actions</th>
      </template>
      <tr
        v-for="portfolio in filteredPortfolios"
        :key="portfolio.id"
        class="hover:bg-slate-50 focus-within:bg-slate-50"
      >
        <td class="px-4 py-3 font-medium text-slate-800">
          <router-link
            :to="{ name: 'PortfolioDetail', params: { id: portfolio.id } }"
            class="text-primary-dark hover:underline"
          >
            {{ portfolio.name }}
          </router-link>
        </td>
        <td class="px-4 py-3 text-slate-700">
          <router-link
            v-if="clientById(portfolio.clientId)"
            :to="{ name: 'UserEdit', params: { id: portfolio.clientId } }"
            class="text-primary-dark hover:underline"
          >
            {{ clientById(portfolio.clientId)?.name }}
          </router-link>
          <span v-else class="italic text-slate-500">Unknown client</span>
        </td>
        <td class="px-4 py-3">
          <span
            :class="[
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
              statusClass(portfolio.status),
            ]"
          >
            {{ portfolio.status }}
          </span>
        </td>
        <td class="px-4 py-3 text-right">
          {{
            formatCurrency(portfolio.currentValue - portfolio.initialInvestment)
          }}
        </td>
        <td class="px-4 py-3 text-right">
          {{ formatReturnPercent(portfolio) }}
        </td>
        <td class="px-4 py-3 text-right">
          <div class="flex justify-end gap-2">
            <router-link
              :to="{ name: 'PortfolioDetail', params: { id: portfolio.id } }"
              class="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              View
            </router-link>
            <router-link
              :to="{ name: 'PortfolioEdit', params: { id: portfolio.id } }"
              class="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Edit
            </router-link>
          </div>
        </td>
      </tr>
    </AppTable>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import AppAlert from "../../components/ui/AppAlert.vue";
import AppCard from "../../components/ui/AppCard.vue";
import AppInput from "../../components/ui/AppInput.vue";
import AppSelect from "../../components/ui/AppSelect.vue";
import AppTable from "../../components/ui/AppTable.vue";

const STATUS_COLORS = {
  UPCOMING: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-green-100 text-green-700",
  CLOSED: "bg-slate-200 text-slate-700",
};

export default {
  name: "PortfolioList",
  components: {
    AppAlert,
    AppCard,
    AppInput,
    AppSelect,
    AppTable,
  },
  data() {
    return {
      statusFilter: "ALL",
      searchTerm: "",
    };
  },
  computed: {
    ...mapState("portfolios", ["items", "loading", "error"]),
    ...mapState("users", { users: (state) => state.items }),
    ...mapGetters("portfolios", ["filteredByStatus"]),
    statuses() {
      return ["UPCOMING", "ACTIVE", "CLOSED"];
    },
    filteredPortfolios() {
      const filtered = this.filteredByStatus(this.statusFilter);
      const search = this.searchTerm.trim().toLowerCase();
      if (!search) {
        return filtered;
      }
      return filtered.filter((portfolio) =>
        portfolio.name.toLowerCase().includes(search)
      );
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    ...mapActions("portfolios", ["fetchAll"]),
    ...mapActions("users", { fetchUsers: "fetchAll" }),
    // Kick off both fetches so filters and client lookups are ready together.
    async initialize() {
      await Promise.all([this.fetchUsers(), this.fetchAll()]);
    },
    clientById(id) {
      return this.users.find((user) => user.id === id);
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
    formatReturnPercent(portfolio) {
      if (!portfolio.initialInvestment) {
        return "—";
      }
      const diff = portfolio.currentValue - portfolio.initialInvestment;
      const percent = (diff / portfolio.initialInvestment) * 100;
      return `${percent.toFixed(2)}%`;
    },
  },
};
</script>
