<!-- Cozy card layout that gives forms and summaries a gentle frame across the dashboard. -->
<template>
  <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <header v-if="title || $slots.header" class="mb-4">
      <h2 v-if="title" class="text-lg font-semibold text-slate-800">
        {{ title }}
      </h2>
      <slot name="header"></slot>
    </header>
    <div>
      <slot></slot>
    </div>
    <footer v-if="$slots.footer" class="mt-4 border-t border-slate-200 pt-4">
      <slot name="footer"></slot>
    </footer>
  </section>
</template>

<script>
export default {
  name: "AppCard",
  props: {
    title: {
      type: String,
      default: "",
    },
  },
};
</script>
