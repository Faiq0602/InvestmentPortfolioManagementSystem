// Validates the client form so we catch validation or routing hiccups before they hit real advisors.
import { flushPromises, mount, RouterLinkStub } from "@vue/test-utils";
import { createStore } from "vuex";
import UserForm from "@/views/users/UserForm.vue";

function createVuexStore(overrides = {}) {
  const actions = {
    fetchAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    ...overrides.actions,
  };

  const getters = {
    byId: () => () => null,
    ...overrides.getters,
  };

  const state = {
    items: [],
    loading: false,
    error: null,
    ...overrides.state,
  };

  return {
    store: createStore({
      modules: {
        users: {
          namespaced: true,
          state: () => state,
          actions,
          getters,
        },
      },
    }),
    actions,
  };
}

describe("UserForm", () => {
  it("prevents submission when validation fails", async () => {
    const { store, actions } = createVuexStore();
    const wrapper = mount(UserForm, {
      global: {
        plugins: [store],
        mocks: {
          $router: {
            push: jest.fn(),
          },
        },
        stubs: {
          "router-link": RouterLinkStub,
        },
      },
    });

    await flushPromises();

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(actions.create).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain(
      "Please correct the highlighted fields before continuing."
    );
  });

  it("submits valid data and navigates away", async () => {
    const { store, actions } = createVuexStore();
    const routerPush = jest.fn();
    const wrapper = mount(UserForm, {
      global: {
        plugins: [store],
        mocks: {
          $router: {
            push: routerPush,
          },
        },
        stubs: {
          "router-link": RouterLinkStub,
        },
      },
    });

    await flushPromises();

    wrapper.vm.form.name = "John Smith";
    wrapper.vm.form.email = "john@example.com";
    await wrapper.vm.$nextTick();

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(actions.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: "John Smith",
        email: "john@example.com",
        phone: "",
      })
    );
    expect(routerPush).toHaveBeenCalledWith("/users");
  });
});
