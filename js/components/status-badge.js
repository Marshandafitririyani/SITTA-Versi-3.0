Vue.component("ba-status-badge", {
  template: "#tpl-status-badge",
  props: {
    qty: Number,
    safety: Number,
    catatan: String,
  },
  computed: {
    badgeClass() {
      if (this.qty === 0) return "danger-red";
      if (this.qty < this.safety) return "warning-orange";
      return "success-green";
    },
    statusText() {
      if (this.qty === 0) return "❌ Kosong";
      if (this.qty < this.safety) return "⚠️ Menipis";
      return "✅ Aman";
    },
  },
});
