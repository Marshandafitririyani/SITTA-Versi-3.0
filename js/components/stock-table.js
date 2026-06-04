Vue.component("ba-stock-table", {
  template: "#tpl-stock",
  data() {
    return {
      stocks: [],
      upbjjList: [],
      filters: {
        upbjj: "",
        kategori: "",
        kondisi: "",
      },
      sortBy: "judul",
      isEdit: false,
      formError: "",
      form: {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: "",
      },
    };
  },
  filters: {
    formatRupiah(val) {
      return "Rp " + Number(val).toLocaleString("id-ID");
    },
    formatBuah(val) {
      return val + " buah";
    },
  },
  created() {
    const source = DataService.getRawData();
    this.stocks = source.stok;
    this.upbjjList = source.upbjjList;
  },
  computed: {
    kategoriList() {
      if (!this.filters.upbjj) return [];
      let filtered = this.stocks.filter((s) => s.upbjj === this.filters.upbjj);
      return [...new Set(filtered.map((item) => item.kategori))];
    },
    filteredAndSortedStocks() {
      return this.stocks
        .filter((item) => {
          let matchUpbjj =
            !this.filters.upbjj || item.upbjj === this.filters.upbjj;
          let matchKategori =
            !this.filters.kategori || item.kategori === this.filters.kategori;
          let matchKondisi = true;

          if (this.filters.kondisi === "reorder") {
            matchKondisi = item.qty < item.safety || item.qty === 0;
          }
          return matchUpbjj && matchKategori && matchKondisi;
        })
        .sort((a, b) => {
          if (this.sortBy === "qty" || this.sortBy === "harga") {
            return a[this.sortBy] - b[this.sortBy];
          }
          return a.judul.localeCompare(b.judul);
        });
    },
  },
  methods: {
    resetKategori() {
      this.filters.kategori = "";
    },
    resetFilters() {
      this.filters.upbjj = "";
      this.filters.kategori = "";
      this.filters.kondisi = "";
    },
    saveData() {
      if (!this.form.kode || !this.form.judul || this.form.harga <= 0) {
        this.formError = "Isi form dengan data yang valid!";
        return;
      }
      this.formError = "";

      if (this.isEdit) {
        let index = this.stocks.findIndex((s) => s.kode === this.form.kode);
        if (index !== -1) {
          Vue.set(this.stocks, index, { ...this.form });
        }
        this.isEdit = false;
      } else {
        if (this.stocks.some((s) => s.kode === this.form.kode)) {
          this.formError = "Kode Bahan Ajar sudah ada!";
          return;
        }
        this.stocks.push({
          ...this.form,
          catatanHTML: "<em>Data Baru Pengguna</em>",
        });
      }
      this.clearForm();
    },
    editData(item) {
      this.isEdit = true;
      this.form = { ...item };
    },
    cancelEdit() {
      this.isEdit = false;
      this.clearForm();
    },
    deleteData(kode) {
      if (confirm("Hapus data bahan ajar " + kode + "?")) {
        this.stocks = this.stocks.filter((s) => s.kode !== kode);
      }
    },
    clearForm() {
      this.form = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: "",
      };
    },
  },
});
