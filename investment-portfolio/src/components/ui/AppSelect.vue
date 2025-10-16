<!-- Drop-down helper that standardizes select styling for filters and form choices across the app. -->
<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium text-slate-700"
    >
      {{ label }}
    </label>
    <div>
      <select
        :id="selectId"
        class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light"
        :value="modelValue"
        :aria-invalid="Boolean(error)"
        :aria-describedby="describedBy"
        @change="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
      >
        <slot></slot>
      </select>
    </div>
    <p
      v-if="description && !error"
      :id="descriptionId"
      class="text-xs text-slate-500"
    >
      {{ description }}
    </p>
    <p v-if="error" :id="errorId" class="text-xs text-danger">{{ error }}</p>
  </div>
</template>

<script>
export default {
  name: "AppSelect",
  emits: ["update:modelValue", "blur"],
  props: {
    modelValue: {
      type: [String, Number],
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    id: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      uid: `app-select-${Math.random().toString(36).slice(2, 9)}`,
    };
  },
  computed: {
    selectId() {
      return this.id || this.uid;
    },
    errorId() {
      return `${this.selectId}-error`;
    },
    descriptionId() {
      return `${this.selectId}-description`;
    },
    describedBy() {
      const ids = [];
      if (this.error) {
        ids.push(this.errorId);
      }
      if (this.description && !this.error) {
        ids.push(this.descriptionId);
      }
      return ids.join(" ") || null;
    },
  },
};
</script>
