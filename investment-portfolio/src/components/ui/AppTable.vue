<!-- Lightweight table scaffold that keeps portfolio and user listings tidy without reinventing rows every time. -->
<template>
  <div
    class="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm"
  >
    <table class="min-w-full divide-y divide-slate-200">
      <thead
        class="bg-slate-100 text-left text-sm font-semibold uppercase tracking-wide text-slate-600"
      >
        <tr>
          <slot name="header"></slot>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 text-sm text-slate-700">
        <slot></slot>
      </tbody>
    </table>
    <slot name="footer"></slot>
  </div>
</template>
