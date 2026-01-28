/* =========================
   INIT
========================= */
console.log("SCRIPT READY");

let selectedTable = null;

/* =========================
   RINGKASAN PESANAN
========================= */
function updateSummary() {
  const summary = document.getElementById("order-summary");
  if (!summary) return;

  let html = "";
  let hasData = false;

  document.querySelectorAll(".paket-card").forEach(card => {
    const paket = card.dataset.paket;
    const qtyEl = card.querySelector(".paket-qty");
    if (!qtyEl) return;

    const qty = parseInt(qtyEl.innerText, 10);
    if (qty <= 0) return;

    hasData = true;
    html += `<strong>Paket ${paket} × ${qty}</strong><br/>`;

    card.querySelectorAll(".variant").forEach(v => {
      const vQtyEl = v.querySelector(".variant-qty");
      if (!vQtyEl) return;

      const vQty = parseInt(vQtyEl.innerText, 10);
      if (vQty > 0) {
        html += `${v.dataset.variant} × ${vQty}<br/>`;
      }
    });

    html += "<hr/>";
  });

  summary.innerHTML = hasData
    ? html
    : "<p>Belum ada paket dipilih</p>";
}

/* =========================
   PAKET & VARIANT
========================= */
document.querySelectorAll(".paket-card").forEach(card => {
  const capacity = parseInt(card.dataset.capacity, 10);
  const qtyEl = card.querySelector(".paket-qty");
  const plus = card.querySelector(".paket-plus");
  const minus = card.querySelector(".paket-minus");
  const variants = card.querySelectorAll(".variant");

  let paketQty = 0;

  function totalVariant() {
    let total = 0;
    variants.forEach(v => {
      const q = v.querySelector(".variant-qty");
      if (q) total += parseInt(q.innerText, 10);
    });
    return total;
  }

  function refreshVariantUI() {
    const max = paketQty * capacity;

    variants.forEach(v => {
      const vPlus = v.querySelector(".variant-plus");
      const vMinus = v.querySelector(".variant-minus");

      if (!vPlus || !vMinus) return;

      if (paketQty === 0) {
        v.classList.remove("active", "selected");
        vPlus.disabled = true;
        vMinus.disabled = true;
      } else {
        v.classList.add("active");
        vMinus.disabled = false;
        vPlus.disabled = totalVariant() >= max;
      }
    });
  }

  if (plus) {
    plus.onclick = () => {
      paketQty++;
      qtyEl.innerText = paketQty.toString();
      refreshVariantUI();
      updateSummary();
    };
  }

  if (minus) {
    minus.onclick = () => {
      if (paketQty > 0) paketQty--;
      qtyEl.innerText = paketQty.toString();

      if (paketQty === 0) {
        variants.forEach(v => {
          const q = v.querySelector(".variant-qty");
          if (q) q.innerText = "0";
        });
      }

      refreshVariantUI();
      updateSummary();
    };
  }

  variants.forEach(v => {
    const vQty = v.querySelector(".variant-qty");
    const vPlus = v.querySelector(".variant-plus");
    const vMinus = v.querySelector(".variant-minus");

    if (!vQty || !vPlus || !vMinus) return;

    vPlus.onclick = () => {
      if (totalVariant() < paketQty * capacity) {
        vQty.innerText = (parseInt(vQty.innerText, 10) + 1).toString();
        v.classList.add("selected");
        refreshVariantUI();
        updateSummary();
      }
    };

    vMinus.onclick = () => {
      const cur = parseInt(vQty.innerText, 10);
      if (cur > 0) {
        const next = cur - 1;
        vQty.innerText = next.toString();
        if (next === 0) v.classList.remove("selected");
        refreshVariantUI();
        updateSummary();
      }
    };
  });

  refreshVariantUI();
});

updateSummary();

/* =========================
   DENAH MEJA
========================= */
document.querySelectorAll(".meja").forEach(m => {
  m.onclick = () => {
    if (m.classList.contains("full")) return;

    document.querySelectorAll(".meja").forEach(x =>
      x.classList.remove("selected")
    );

    m.classList.add("selected");
    selectedTable = m.dataset.id;

    const info = document.getElementById("mejaTerpilih");
    if (info) info.innerText = "Meja terpilih: " + selectedTable;
  };
});

/* =========================
   LOAD STATUS MEJA (API)
========================= */
const API_URL =
  "https://script.google.com/macros/s/AKfycbwFU-fHZR5lphEAX0R-I_BvKQx5H1MtCBxgfQU7s6Xnc-RYgx3UZX61RY7eXshk3EX0Sw/exec";

function loadTableStatus(tanggal) {
  if (!tanggal) return;

  const callbackName = "cb_" + Date.now();

  window[callbackName] = function (status) {
    document.querySelectorAll(".meja").forEach(m => {
      m.classList.remove("available", "full", "selected");
      m.classList.add(status[m.dataset.id] === "FULL" ? "full" : "available");
    });

    delete window[callbackName];
    script.remove();
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    `?action=getTableStatus&tanggal=${tanggal}&callback=${callbackName}`;

  document.body.appendChild(script);
}


const tanggalInput = document.getElementById("tanggal");
if (tanggalInput) {
 tanggalInput.addEventListener("change", e =>
  loadTableStatus(e.target.value)
);

}

function collectPaketData() {
  const result = [];

  document.querySelectorAll(".paket-card").forEach(card => {
    const paket = card.dataset.paket;
    const qty = parseInt(card.querySelector(".paket-qty").innerText, 10);

    if (qty > 0) {
      const variants = [];

      card.querySelectorAll(".variant").forEach(v => {
        const vQty = parseInt(v.querySelector(".variant-qty").innerText, 10);
        if (vQty > 0) {
          variants.push({
            code: v.dataset.variant,
            qty: vQty
          });
        }
      });

      result.push({ paket, qty, variants });
    }
  });

  return result;
}

/* =========================
   SUBMIT
========================= */
const btnSubmit = document.getElementById("btnSubmit");
if (btnSubmit) {
 btnSubmit.onclick = () => {
  const nama = document.getElementById("nama").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const tanggal = document.getElementById("tanggal").value;

  if (!nama || !whatsapp || !tanggal || !selectedTable) {
    alert("Lengkapi data dan pilih meja");
    return;

     showPaymentPopup({
  resvId: "R-TEST-01",
  nama: nama,
  tanggal: tanggal,
  meja: selectedTable,
  total: 150000
});

  }

  const paket = collectPaketData();
  if (paket.length === 0) {
    alert("Pilih minimal satu paket");
    return;
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = API_URL;

  function add(name, value) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  add("nama", nama);
  add("whatsapp", whatsapp);
  add("tanggal", tanggal);
  add("tableId", selectedTable);
  add("paket", JSON.stringify(paket));

  document.body.appendChild(form);
  form.submit();
  form.remove();
};
}

function showPaymentPopup({ resvId, nama, tanggal, meja, total }) {
  document.getElementById("payTotal").innerText =
    total.toLocaleString("id-ID");

  const text =
`Halo, saya sudah melakukan pembayaran QRIS.

Kode Reservasi: ${resvId}
Nama: ${nama}
Tanggal: ${tanggal}
Meja: ${meja}
Total: Rp${total.toLocaleString("id-ID")}

Saya lampirkan bukti transfer.
Terima kasih.`;

  document.getElementById("btnWA").href =
    "https://wa.me/6285156076002?text=" + encodeURIComponent(text);

  document.getElementById("paymentModal")
    .classList.remove("hidden");
}

function closePayment() {
  document.getElementById("paymentModal")
    .classList.add("hidden");
}

showPaymentPopup({
  resvId: "R-TEST-01",
  nama,
  tanggal,
  meja: selectedTable,
  total: 150000
});







