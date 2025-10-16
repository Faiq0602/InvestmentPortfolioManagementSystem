// Exercises the portfolio detail view to make sure the rupee math and client lookups stay trustworthy.
import { flushPromises, mount } from "@vue/test-utils";
import { createStore } from "vuex";
import PortfolioDetail from "@/views/portfolios/PortfolioDetail.vue";

function createStoreWithData(portfolio, client) {
  const portfolioActions = {
    fetchAll: jest.fn().mockResolvedValue([portfolio]),
    remove: jest.fn().mockResolvedValue(true),
  };

  const portfoliosModule = {
    namespaced: true,
    state: () => ({
      items: [portfolio],
      loading: false,
    }),
    actions: portfolioActions,
    getters: {
      byId: (state) => (id) => state.items.find((item) => item.id === id),
    },
  };

  const usersModule = {
    namespaced: true,
    state: () => ({ items: [client] }),
    actions: {
      fetchAll: jest.fn().mockResolvedValue([client]),
    },
    getters: {
      byId: (state) => (id) => state.items.find((item) => item.id === id),
    },
  };

  return {
    actions: portfolioActions,
    store: createStore({
      modules: {
        portfolios: portfoliosModule,
        users: usersModule,
      },
    }),
  };
}

describe("PortfolioDetail", () => {
  const portfolio = {
    id: "p1",
    name: "Alpha",
    clientId: "u1",
    status: "ACTIVE",
    initialInvestment: 100,
    currentValue: 150,
    expectedReturnRate: 10,
    holdings: [{ symbol: "AAPL", units: 10, avgPrice: 10 }],
  };
  const client = { id: "u1", name: "Alice", email: "alice@example.com" };

  beforeEach(() => {
    window.confirm = jest.fn(() => true);
  });

  it("renders portfolio details and derived return values", async () => {
    const { store } = createStoreWithData(portfolio, client);
    const wrapper = mount(PortfolioDetail, {
      props: { id: "p1" },
      global: {
        plugins: [store],
        stubs: ["router-link"],
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Alpha");
    expect(wrapper.text()).toContain("Alice");
    expect(wrapper.text()).toContain("50.00%");
    expect(wrapper.text()).toContain("₹50.00");
  });

  it("deletes portfolio and navigates back", async () => {
    const { store, actions } = createStoreWithData(portfolio, client);
    const routerPush = jest.fn();

    const wrapper = mount(PortfolioDetail, {
      props: { id: "p1" },
      global: {
        plugins: [store],
        stubs: ["router-link"],
        mocks: {
          $router: {
            push: routerPush,
          },
        },
      },
    });

    await flushPromises();

    await wrapper.find('button[type="button"]').trigger("click");
    await flushPromises();

    expect(actions.remove).toHaveBeenCalled();
    expect(routerPush).toHaveBeenCalledWith("/portfolios");
  });
});
