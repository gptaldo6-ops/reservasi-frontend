/* =========================
   GLOBAL STATE
========================= */
let selectedTable = null;
let selectedRoom = "R1";

console.log("SCRIPT READY");

/* =========================
   INIT ROOM DEFAULT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector('.room-buttons button[data-room="R1"]');
  if (btn) btn.click();
});

/* =========================
   ROOM SELECTOR
========================= */
document.querySelectorAll(".room-buttons button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".room-buttons button")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    selectedRoom = btn.dataset.room;

    document.querySelectorAll(".room-denah").forEach(d => {
      d.classList.toggle("hidden", d.dataset.room !== selectedRoom);
    });

    selectedTable = null;
    const info = document.getElementById("mejaTerpilih");
    if (info) info.innerText = "";

    const tgl = document.getElementById("tanggal").value;
    if (tgl) loadTableStatus(tgl);

    bindMejaClick();
  };
});

/* =========================
   RINGKASAN
========================= */
function updateSummary() {
  const el = document.getElementById("order-summary");
  let html = "";
  let ok = false;

  document.querySelectorAll(".paket-card").forEach(card => {
    const paket = card.dataset.paket;
    const qty = +card.querySelector(".paket-qty").innerText;
    if (qty <= 0) return;

    ok = true;
    html += `<b>Paket ${paket} × ${qty}</b><br/>`;

    card.querySelectorAll(".variant").forEach(v => {
      const q = +v.querySelector(".variant-qty").innerText;
      if (q > 0) html += `${v.dataset.variant} × ${q}<br/>`;
    });

    html += "<hr/>";
  });

  el.innerHTML = ok ? html : "<p>Belum ada paket dipilih</p>";
}

/* =========================
   PAKET & VARIANT
========================= */
document.querySelectorAll(".paket-card").forEach(card => {
  const cap = +card.dataset.capacity;
  const qtyEl = card.querySelector(".paket-qty");
  const plus = card.querySelector(".paket-plus");
  const minus = card.querySelector(".paket-minus");
  const vars = card.querySelectorAll(".variant");

  let qty = 0;

  const totalVar = () =>
    [...vars].reduce((t,v)=>t+ +v.querySelector(".variant-qty").innerText,0);

  const refresh = () => {
    const max = qty * cap;
    vars.forEach(v => {
      const vp = v.querySelector(".variant-plus");
      const vm = v.querySelector(".variant-minus");
      if (qty === 0) {
        v.classList.remove("active","selected");
        vp.disabled = vm.disabled = true;
      } else {
        v.classList.add("active");
        vm.disabled = false;
        vp.disabled = totalVar() >= max;
      }
    });
  };

  plus.onclick = () => {
    qty++; qtyEl.innerText = qty;
    refresh(); updateSummary();
  };

  minus.onclick = () => {
    if (qty > 0) qty--;
    qtyEl.innerText = qty;
    if (qty === 0)
      vars.forEach(v => v.querySelector(".variant-qty").innerText = "0");
    refresh(); updateSummary();
  };

  vars.forEach(v => {
    const q = v.querySelector(".variant-qty");
    v.querySelector(".variant-plus").onclick = () => {
      if (totalVar() < qty * cap) {
        q.innerText = +q.innerText + 1;
        v.classList.add("selected");
        refresh(); updateSummary();
      }
    };
    v.querySelector(".variant-minus").onclick = () => {
      if (+q.innerText > 0) {
        q.innerText--;
        if (+q.innerText === 0) v.classList.remove("selected");
        refresh(); updateSummary();
      }
    };
  });

  refresh();
});

updateSummary();

/* =========================
   DENAH MEJA
========================= */
function bindMejaClick() {
  document.querySelectorAll(".room-denah:not(.hidden) .meja").forEach(m => {
    m.onclick = () => {
      if (m.classList.contains("full")) return;

      document.querySelectorAll(".meja")
        .forEach(x => x.classList.remove("selected"));

      m.classList.add("selected");
      selectedTable = m.dataset.id;

      const info = document.getElementById("mejaTerpilih");
      if (info) info.innerText = "Meja terpilih: " + selectedTable;
    };
  });
}

/* =========================
   LOAD STATUS MEJA (JSONP)
========================= */
const API_URL =
  "https://script.google.com/macros/s/AKfycbwFU-fHZR5lphEAX0R-I_BvKQx5H1MtCBxgfQU7s6Xnc-RYgx3UZX61RY7eXshk3EX0Sw/exec";

function loadTableStatus(tanggal) {
  const cb = "cb_" + Date.now();
  window[cb] = data => {
    document.querySelectorAll(".meja").forEach(m => {
      if (!m.closest(`.room-denah[data-room="${selectedRoom}"]`)) return;
      m.classList.remove("available","full","selected");
      m.classList.add(data[m.dataset.id] === "FULL" ? "full" : "available");
    });
    delete window[cb];
    s.remove();
  };

  const s = document.createElement("script");
  s.src = `${API_URL}?action=getTableStatus&tanggal=${tanggal}&callback=${cb}`;
  document.body.appendChild(s);
}

document.getElementById("tanggal")
  .addEventListener("change", e => loadTableStatus(e.target.value));

/* =========================
   SUBMIT (GET PENDEK)
========================= */
document.getElementById("btnSubmit").onclick = () => {
  const nama = document.getElementById("nama").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const tanggal = document.getElementById("tanggal").value;

  if (!nama || !whatsapp || !tanggal || !selectedTable) {
    alert("Lengkapi data & pilih meja");
    return;
  }

  // HITUNG TOTAL PAX SAJA
  let pax = 0;
  document.querySelectorAll(".paket-card").forEach(card => {
    const q = +card.querySelector(".paket-qty").innerText;
    const cap = +card.dataset.capacity;
    pax += q * cap;
  });

  if (pax <= 0) {
    alert("Pilih minimal satu paket");
    return;
  }

  const params = new URLSearchParams({
    action: "saveReservation",
    nama,
    whatsapp,
    tanggal,
    tableId: selectedTable,
    pax
  });

  // ANTI CORS
  (new Image()).src = API_URL + "?" + params.toString();

  showPaymentPopup({
    nama, tanggal, meja: selectedTable, total: 150000
  });
};

/* =========================
   PAYMENT
========================= */
function showPaymentPopup({ nama, tanggal, meja, total }) {
  document.getElementById("payTotal").innerText =
    total.toLocaleString("id-ID");

  document.getElementById("btnWA").href =
    "https://wa.me/6285156076002?text=" +
    encodeURIComponent(
      `Halo, saya sudah melakukan pembayaran.\n\n` +
      `Nama: ${nama}\nTanggal: ${tanggal}\nMeja: ${meja}`
    );

  document.getElementById("paymentModal")
    .classList.remove("hidden");
}

function closePayment() {
  document.getElementById("paymentModal")
    .classList.add("hidden");
}
