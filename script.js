/* =====================
   RINGKASAN PESANAN
===================== */
function updateSummary() {
  const summaryEl = document.getElementById("order-summary");
  if (!summaryEl) return;

  const data = [];

  document.querySelectorAll(".paket-card").forEach(card => {
    const paket = card.dataset.paket;
    const qty = parseInt(card.querySelector(".paket-qty").textContent, 10);

    if (qty > 0) {
      const variants = [];
      card.querySelectorAll(".variant").forEach(v => {
        const vQty = parseInt(v.querySelector(".variant-qty").textContent, 10);
        if (vQty > 0) {
          variants.push(`${v.dataset.variant} × ${vQty}`);
        }
      });

      data.push({ paket, qty, variants });
    }
  });

  if (data.length === 0) {
    summaryEl.innerHTML = "<p>Belum ada paket dipilih</p>";
    return;
  }

  summaryEl.innerHTML = data.map(d => `
    <div style="margin-bottom:10px">
      <strong>Paket ${d.paket} × ${d.qty}</strong><br/>
      ${d.variants.length ? d.variants.join("<br/>") : "<em>Belum pilih variant</em>"}
    </div>
  `).join("");
}

/* =====================
   PAKET & VARIANT
===================== */
document.querySelectorAll(".paket-card").forEach(card => {
  const capacity = parseInt(card.dataset.capacity, 10);
  const paketQtyEl = card.querySelector(".paket-qty");
  const paketPlus = card.querySelector(".paket-plus");
  const paketMinus = card.querySelector(".paket-minus");
  const variants = card.querySelectorAll(".variant");

  let paketQty = 0;

  function getTotalVariant() {
    let total = 0;
    variants.forEach(v => {
      total += parseInt(v.querySelector(".variant-qty").textContent, 10);
    });
    return total;
  }

  function updateVariantUI() {
    const max = paketQty * capacity;
    const total = getTotalVariant();

    variants.forEach(v => {
      const plus = v.querySelector(".variant-plus");
      const minus = v.querySelector(".variant-minus");

      if (paketQty === 0) {
        v.classList.remove("active");
        plus.disabled = true;
        minus.disabled = true;
      } else {
        v.classList.add("active");
        minus.disabled = false;
        plus.disabled = total >= max;
      }
    });
  }

  paketPlus.addEventListener("click", () => {
    paketQty++;
    paketQtyEl.textContent = paketQty;
    updateVariantUI();
    updateSummary();
  });

  paketMinus.addEventListener("click", () => {
    if (paketQty > 0) paketQty--;
    paketQtyEl.textContent = paketQty;

    if (paketQty === 0) {
      variants.forEach(v => v.querySelector(".variant-qty").textContent = 0);
    }

    updateVariantUI();
    updateSummary();
  });

  variants.forEach(v => {
    const vQtyEl = v.querySelector(".variant-qty");

    v.querySelector(".variant-plus").addEventListener("click", () => {
      if (getTotalVariant() < paketQty * capacity) {
        vQtyEl.textContent = parseInt(vQtyEl.textContent, 10) + 1;
        updateVariantUI();
        updateSummary();
      }
    });

    v.querySelector(".variant-minus").addEventListener("click", () => {
      const val = parseInt(vQtyEl.textContent, 10);
      if (val > 0) {
        vQtyEl.textContent = val - 1;
        updateVariantUI();
        updateSummary();
      }
    });
  });

  updateVariantUI();
});

updateSummary();

/* =====================
   DENAH MEJA
===================== */
let selectedTable = null;

document.querySelectorAll(".meja").forEach(meja => {
  meja.addEventListener("click", () => {
    if (meja.classList.contains("full")) return;

    document.querySelectorAll(".meja").forEach(m => m.classList.remove("selected"));

    meja.classList.add("selected");
    selectedTable = meja.dataset.id;

    const info = document.getElementById("mejaTerpilih");
    if (info) info.innerText = "Meja terpilih: " + selectedTable;
  });
});

/* =====================
   LOAD STATUS MEJA (API)
===================== */
const API_URL = "https://script.google.com/macros/s/AKfycbwFU-fHZR5lphEAX0R-I_BvKQx5H1MtCBxgfQU7s6Xnc-RYgx3UZX61RY7eXshk3EX0Sw/exec";

async function loadTableStatus(tanggal) {
  if (!tanggal) return;

  try {
    const res = await fetch(`${API_URL}?action=getTableStatus&tanggal=${tanggal}`);
    const status = await res.json();

    document.querySelectorAll(".meja").forEach(m => {
      const id = m.dataset.id;
      m.classList.remove("available", "full", "selected");
      m.classList.add(status[id] === "FULL" ? "full" : "available");
    });

    selectedTable = null;
    const info = document.getElementById("mejaTerpilih");
    if (info) info.innerText = "";

  } catch (err) {
    alert("Gagal mengambil status meja");
    console.error(err);
  }
}

const tanggalInput = document.getElementById("tanggal");
if (tanggalInput) {
  tanggalInput.addEventListener("change", e => {
    loadTableStatus(e.target.value);
  });
}

/* =====================
   SUBMIT RESERVASI
===================== */
function collectPaketData() {
  const result = [];

  document.querySelectorAll(".paket-card").forEach(card => {
    const paket = card.dataset.paket;
    const qty = parseInt(card.querySelector(".paket-qty").textContent, 10);

    if (qty > 0) {
      const variants = [];
      card.querySelectorAll(".variant").forEach(v => {
        const vQty = parseInt(v.querySelector(".variant-qty").textContent, 10);
        if (vQty > 0) {
          variants.push({ code: v.dataset.variant, qty: vQty });
        }
      });

      result.push({ paket, qty, variants });
    }
  });

  return result;
}

const btnSubmit = document.getElementById("btnSubmit");
if (btnSubmit) {
  btnSubmit.addEventListener("click", async () => {
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

    const payload = { nama, whatsapp, tanggal, tableId: selectedTable, paket };

    const statusEl = document.getElementById("submitStatus");
    if (statusEl) statusEl.innerText = "Menyimpan reservasi...";

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (statusEl) {
        statusEl.innerText = result.success
          ? "Reservasi berhasil! Kode: " + result.resvId
          : "Gagal: " + result.message;
      }

    } catch (err) {
      if (statusEl) statusEl.innerText = "Error koneksi server";
      console.error(err);
    }
  });
}
