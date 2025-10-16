<!-- Rolodex-style view that lists every client with shortcuts to edit or email them. -->
<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Clients</h1>
        <p class="text-sm text-slate-600">
          Manage client records for your investment portfolios.
        </p>
      </div>
      <router-link
        to="/users/new"
        class="inline-flex items-center justify-center rounded-md bg-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary"
      >
        New User
      </router-link>
    </div>

    <AppAlert v-if="error" :message="error" variant="danger" />

    <div
      v-if="loading"
      class="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600"
    >
      Loading users...
    </div>

    <AppCard v-else-if="!users.length" title="No users yet">
      <p class="text-sm text-slate-600">
        Start by adding your first client. Clients are required to assign
        ownership for investment portfolios.
      </p>
    </AppCard>

    <AppTable v-else>
      <template #header>
        <th scope="col" class="px-4 py-3">Name</th>
        <th scope="col" class="px-4 py-3">Email</th>
        <th scope="col" class="px-4 py-3">Phone</th>
        <th scope="col" class="px-4 py-3 text-right">Actions</th>
      </template>
      <tr
        v-for="user in users"
        :key="user.id"
        class="hover:bg-slate-50 focus-within:bg-slate-50"
      >
        <td class="px-4 py-3 font-medium text-slate-800">{{ user.name }}</td>
        <td class="px-4 py-3">
          <a
            :href="`mailto:${user.email}`"
            class="text-primary-dark hover:underline"
            >{{ user.email }}</a
          >
        </td>
        <td class="px-4 py-3 text-slate-600">{{ user.phone || "—" }}</td>
        <td class="px-4 py-3 text-right">
          <div class="flex justify-end gap-2">
            <router-link
              :to="{ name: 'UserEdit', params: { id: user.id } }"
              class="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-light"
            >
              Edit
            </router-link>
            <button
              type="button"
              class="rounded-md border border-danger/40 px-3 py-1 text-xs font-semibold text-danger transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-danger"
              @click="onDelete(user.id)"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    </AppTable>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import AppAlert from "../../components/ui/AppAlert.vue";
import AppCard from "../../components/ui/AppCard.vue";
import AppTable from "../../components/ui/AppTable.vue";

export default {
  name: "UserList",
  components: {
    AppAlert,
    AppCard,
    AppTable,
  },
  computed: {
    ...mapState("users", ["items", "loading", "error"]),
    users() {
      return this.items;
    },
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    ...mapActions("users", ["fetchAll", "remove"]),
    async fetchUsers() {
      try {
        await this.fetchAll();
      } catch (error) {
        console.error(error);
      }
    },
    async onDelete(id) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this user?"
      );
      if (!confirmed) return;
      await this.remove(id);
    },
  },
};
</script>
