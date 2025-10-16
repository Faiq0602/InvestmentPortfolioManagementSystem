// Keeps the portfolio list honest about filtering and percentage math as the UI evolves.
import { flushPromises, mount, RouterLinkStub } from "@vue/test-utils";
import { createStore } from "vuex";
import PortfolioList from "@/views/portfolios/PortfolioList.vue";

function createStoreWithPortfolios(portfolios = []) {
  const portfolioActions = {
    fetchAll: jest.fn().mockResolvedValue(portfolios),
  };

  const portfolioModule = {
    namespaced: true,
    state: () => ({
      items: portfolios,
      loading: false,
      error: "",
    }),
    actions: portfolioActions,
    getters: {
      filteredByStatus: (state) => (status) => {
        if (!status || status === "ALL") {
          return state.items;
        }
        return state.items.filter((item) => item.status === status);
      },
    },
  };

  const usersModule = {
    namespaced: true,
    state: () => ({ items: [{ id: "u1", name: "Alice" }] }),
    actions: {
      fetchAll: jest.fn().mockResolvedValue([]),
    },
  };

  return {
    actions: {
      portfolios: portfolioActions,
    },
    store: createStore({
      modules: {
        portfolios: portfolioModule,
        users: usersModule,
      },
    }),
  };
}

describe("PortfolioList", () => {
  it("filters portfolios by status", async () => {
    const sample = [
      {
        id: "p1",
        name: "Alpha",
        clientId: "u1",
        status: "ACTIVE",
        initialInvestment: 1000,
        currentValue: 1200,
        holdings: [],
      },
      {
        id: "p2",
        name: "Beta",
        clientId: "u1",
        status: "UPCOMING",
        initialInvestment: 2000,
        currentValue: 2000,
        holdings: [],
      },
    ];
    const { store } = createStoreWithPortfolios(sample);

    const wrapper = mount(PortfolioList, {
      global: {
        plugins: [store],
        stubs: {
          "router-link": RouterLinkStub,
        },
      },
    });

    await flushPromises();

    expect(wrapper.findAll("tbody tr")).toHaveLength(2);

    wrapper.vm.statusFilter = "ACTIVE";
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll("tbody tr");
    expect(rows).toHaveLength(1);
    const firstCell = rows[0].findAll("td").at(0);
    expect(firstCell?.text()).toContain("Alpha");
  });

  it("renders return percentage correctly", async () => {
    const sample = [
      {
        id: "p1",
        name: "Gamma",
        clientId: "u1",
        status: "ACTIVE",
        initialInvestment: 100,
        currentValue: 150,
        holdings: [],
      },
    ];
    const { store } = createStoreWithPortfolios(sample);

    const wrapper = mount(PortfolioList, {
      global: {
        plugins: [store],
        stubs: {
          "router-link": RouterLinkStub,
        },
      },
    });

    await flushPromises();

    const percentCell = wrapper.find("tbody tr td:nth-child(5)");
    expect(percentCell.text()).toBe("50.00%");
  });
});
