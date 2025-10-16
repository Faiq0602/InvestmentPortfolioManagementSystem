<!-- Reusable input field that keeps labels, hints, and validation looking consistent everywhere. -->
<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-slate-700"
    >
      {{ label }}
    </label>
    <div>
      <input
        :id="inputId"
        :type="type"
        class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light"
        :value="modelValue"
        :placeholder="placeholder"
        :aria-invalid="Boolean(error)"
        :aria-describedby="describedBy"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
      />
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
  name: "AppInput",
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
    type: {
      type: String,
      default: "text",
    },
    id: {
      type: String,
      default: "",
    },
    placeholder: {
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
      uid: `app-input-${Math.random().toString(36).slice(2, 9)}`,
    };
  },
  computed: {
    inputId() {
      return this.id || this.uid;
    },
    errorId() {
      return `${this.inputId}-error`;
    },
    descriptionId() {
      return `${this.inputId}-description`;
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
