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

async function loadTableStatus(tanggal) {
  if (!tanggal) return;

  try {
    const res = await fetch(
      `${API_URL}?action=getTableStatus&tanggal=${tanggal}`
    );
    const status = await res.json();

    document.querySelectorAll(".meja").forEach(m => {
      m.classList.remove("available", "full", "selected");
      m.classList.add(status[m.dataset.id] === "FULL" ? "full" : "available");
    });

    selectedTable = null;
    const info = document.getElementById("mejaTerpilih");
    if (info) info.innerText = "";

  } catch (e) {
    console.error(e);
    alert("Gagal mengambil status meja");
  }
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
  btnSubmit.onclick = async () => {
    const nama = document.getElementById("nama")?.value.trim();
    const whatsapp = document.getElementById("whatsapp")?.value.trim();
    const tanggal = document.getElementById("tanggal")?.value;

    if (!nama || !whatsapp || !tanggal || !selectedTable) {
      alert("Lengkapi data dan pilih meja");
      return;
    }

    const paket = collectPaketData();
    if (paket.length === 0) {
      alert("Pilih minimal satu paket");
      return;
    }

    const payload = {
      nama,
      whatsapp,
      tanggal,
      tableId: selectedTable,
      paket
    };

    const statusEl = document.getElementById("submitStatus");
    if (statusEl) statusEl.innerText = "Menyimpan reservasi...";

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.success) {
        if (statusEl) {
          statusEl.innerText =
            "Reservasi berhasil! Kode: " + result.resvId;
        }
      } else {
        if (statusEl) {
          statusEl.innerText =
            "Gagal: " + (result.message || "Unknown error");
        }
      }

    } catch (err) {
      console.error(err);
      if (statusEl) statusEl.innerText = "Error koneksi server";
    }
  };
}
