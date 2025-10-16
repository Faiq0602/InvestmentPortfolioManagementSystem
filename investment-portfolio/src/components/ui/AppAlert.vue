<!-- Friendly alert wrapper so we can surface wins, warnings, and whoops moments with consistent styling. -->
<template>
  <div
    v-if="message"
    role="alert"
    :class="['rounded-md border px-4 py-3 text-sm font-medium', variantClasses]"
  >
    <slot>
      {{ message }}
    </slot>
  </div>
</template>

<script>
const VARIANT_MAP = {
  info: "border-primary-light bg-primary-light/10 text-primary-dark",
  success: "border-success bg-green-50 text-success",
  warning: "border-warning bg-amber-50 text-warning",
  danger: "border-danger bg-red-50 text-danger",
};

export default {
  name: "AppAlert",
  props: {
    message: {
      type: String,
      default: "",
    },
    variant: {
      type: String,
      default: "info",
    },
  },
  computed: {
    variantClasses() {
      return VARIANT_MAP[this.variant] || VARIANT_MAP.info;
    },
  },
};
</script>
