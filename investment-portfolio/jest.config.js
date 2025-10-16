// Jest setup tailored for Vue 3 so unit tests understand single-file components.
module.exports = {
  preset: "@vue/cli-plugin-unit-jest",
  transform: {
    "^.+\\.vue$": "@vue/vue3-jest",
  },
};
