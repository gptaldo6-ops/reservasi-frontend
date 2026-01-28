document.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON") {
    console.log("BUTTON CLICKED:", e.target.className);
  }
});


const ROOM_TABLES = {
  R1: ["R1-A1", "R1-A2", "R1-A3", "R1-A4"],
  R2: ["R2-B1", "R2-B2", "R2-B3"],
  R3: ["R3-C1", "R3-C2", "R3-C3", "R3-C4", "R3-C5"]
};

let selectedRoom = null;
let selectedTable = null;

// dummy status (nanti dari backend)
let tableStatus = {
  "R1-A2": "FULL",
  "R2-B3": "FULL",
  "R3-C1": "FULL"
};


const summaryEl = document.getElementById("order-summary");

function updateSummary() {
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

  let html = data.map(d => `
    <div style="margin-bottom:10px">
      <strong>Paket ${d.paket} × ${d.qty}</strong><br/>
      ${d.variants.length ? d.variants.join("<br/>") : "<em>Belum pilih variant</em>"}
    </div>
  `).join("");

  // 🔵 INI BAGIAN BARU (LANGKAH 5)
  if (selectedRoom) {
    html += `<div><strong>Ruangan:</strong> ${selectedRoom}</div>`;
  }

  if (selectedTable) {
    html += `<div><strong>Meja:</strong> ${selectedTable}</div>`;
  }

  summaryEl.innerHTML = html;
}


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

  const roomButtons = document.querySelectorAll(".room-buttons button");
const tableMap = document.getElementById("table-map");

roomButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // aktifkan tombol ruangan
    roomButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    selectedRoom = btn.dataset.room;
    selectedTable = null;

    renderTables();
    updateSummary(); // ringkasan ikut update
  });
});

function renderTables() {
  tableMap.innerHTML = "";

  if (!selectedRoom) return;

  ROOM_TABLES[selectedRoom].forEach(tableId => {
    const div = document.createElement("div");
    div.classList.add("table");

    const status = tableStatus[tableId] || "AVAILABLE";
    div.textContent = tableId;

    if (status === "FULL") {
      div.classList.add("full");
    } else {
      div.classList.add("available");

      div.addEventListener("click", () => {
        document.querySelectorAll(".table").forEach(t =>
          t.classList.remove("selected")
        );
        div.classList.add("selected");
        selectedTable = tableId;
        updateSummary();
      });
    }

    tableMap.appendChild(div);
  });
}





