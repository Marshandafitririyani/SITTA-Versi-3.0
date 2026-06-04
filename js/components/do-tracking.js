Vue.component("do-tracking", {
  template: "#tpl-tracking",
  data() {
    return {
      doRecords: [],
      paketOptions: [],
      ekspedisiOptions: [], // Diambil dari dataBahanAjar.pengirimanList
      searchQuery: "",
      activeSearch: "",
      selectedPaketIndex: -1,
      doError: "",
      newLogText: {},
      newDO: { nim: "", nama: "", ekspedisi: "" },
    };
  },
  filters: {
    formatRupiah(val) {
      return "Rp " + Number(val).toLocaleString("id-ID");
    },
  },
  created() {
    // Mapping terpusat dari berkas JSON Anda
    const source = DataService.getRawData();
    this.doRecords = source.tracking;
    this.paketOptions = source.paket;
    this.ekspedisiOptions = source.pengirimanList.map((p) => p.nama);
  },
  computed: {
    nextDONumber() {
      let currentYear = new Date().getFullYear();
      let count = this.doRecords.length + 1;
      let sequence = String(count).padStart(4, "0"); // Mengikuti format berkas Anda: DO2025-0001 (4 digit)
      return `DO${currentYear}-${sequence}`;
    },
    searchResults() {
      if (!this.activeSearch) return [];
      let q = this.activeSearch.toLowerCase();
      return this.doRecords.filter(
        (d) => d.noDO.toLowerCase().includes(q) || d.nim.includes(q),
      );
    },
  },
  watch: {
    selectedPaketIndex(newIdx) {
      if (newIdx !== -1) {
        console.log(`Paket aktif terpilih: ${this.paketOptions[newIdx].nama}`);
      }
    },
    doRecords: {
      deep: true,
      handler() {
        console.log("Catatan log manifest pengantaran berubah.");
      },
    },
  },
  methods: {
    performSearch() {
      this.activeSearch = this.searchQuery;
    },
    clearSearch() {
      this.searchQuery = "";
      this.activeSearch = "";
    },
    createNewDO() {
      if (
        !this.newDO.nim ||
        !this.newDO.nama ||
        !this.newDO.ekspedisi ||
        this.selectedPaketIndex == -1
      ) {
        this.doError = "Seluruh field form DO wajib dilengkapi!";
        return;
      }
      this.doError = "";

      let targetPaket = this.paketOptions[this.selectedPaketIndex];
      let options = { year: "numeric", month: "long", day: "numeric" };
      let formattedDate = new Date().toLocaleDateString("id-ID", options);

      let freshDO = {
        noDO: this.nextDONumber,
        nim: this.newDO.nim,
        nama: this.newDO.nama,
        status: "Dalam Perjalanan",
        ekspedisi: this.newDO.ekspedisi,
        total: targetPaket.harga,
        tanggalKirim: formattedDate,
        paket: targetPaket.kode,
        perjalanan: [
          {
            waktu: new Date().toLocaleString("id-ID"),
            keterangan: "Manifes DO berhasil dibuat.",
          },
        ],
      };

      this.doRecords.push(freshDO);
      this.newDO = { nim: "", nama: "", ekspedisi: "" };
      this.selectedPaketIndex = -1;
      alert("Delivery Order berhasil diterbitkan!");
    },
    addTrackingLog(noDO) {
      let logText = this.newLogText[noDO];
      if (!logText || logText.trim() === "") return;

      let targetDO = this.doRecords.find((d) => d.noDO === noDO);
      if (targetDO) {
        let timestamp = new Date().toLocaleString("id-ID", { hour12: false });
        targetDO.perjalanan.push({
          waktu: timestamp,
          keterangan: logText,
        });
        Vue.set(this.newLogText, noDO, "");
      }
    },
  },
});
