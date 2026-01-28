console.log("SCRIPT LOADED");

/* ======================
   STATE
====================== */
let selectedTable = null;

/* ======================
   RINGKASAN
====================== */
function updateSummary() {
  const summary = document.getElementById("order-summary");
  if (!summary) return;

  let html = "";
  let hasData = false;

  document.querySelectorAll(".paket-card").forEach(card => {
    const paket = card.dataset.paket;
    const qty = parseInt(card.querySelector(".paket-qty")?.innerText || "0");

    if (qty > 0) {
      hasData = true;
      html += `<strong>Paket ${paket} × ${qty}</strong><br/>`;

      card.querySelectorAll(".variant").forEach(v => {
        const vQty = parseInt(v.querySelector(".variant-qty")?.innerText || "0");
        if (vQty > 0) {
          html += `${v.dataset.variant} × ${vQty}<br/>`;
        }
      });

      html += "<hr/>";
    }
  });

  summary.innerHTML = hasData ? html : "<p>Belum ada paket dipilih</p>";
}

/* ======================
   PAKET & VARIANT
====================== */
document.querySelectorAll(".paket-card").forEach(card => {
  const capacity = parseInt(card.dataset.capacity);
  const qtyEl = card.querySelector(".paket-qty");
  const plus = card.querySelector(".paket-plus");
  const minus = card.querySelector(".paket-minus");
  const variants = card.querySelectorAll(".variant");

  let paketQty = 0;

  function totalVariant() {
    let t = 0;
    variants.forEach(v => {
      t += parseInt(v.querySelector(".variant-qty").innerText);
    });
    return t;
  }

  function refreshVariantUI() {
    const max = paketQty * capacity;
    variants.forEach(v => {
      const vp = v.querySelector(".variant-plus");
      const vm = v.querySelector(".variant-minus");
      if (paketQty === 0) {
        vp.disabled = true;
        vm.disabled = true;
      } else {
        vm.disabled = false;
        vp.disabled = totalVariant() >= max;
      }
    });
  }

  plus.onclick = () => {
    paketQty++;
    qtyEl.innerText = paketQty;
    refreshVariantUI();
    updateSummary();
  };

  minus.onclick = () => {
    if (paketQty > 0) paketQty--;
    qtyEl.innerText = paketQty;

    if (paketQty === 0) {
      variants.forEach(v => v.querySelector(".variant-qty").innerText = "0");
    }

    refreshVariantUI();
    updateSummary();
  };

  variants.forEach(v => {
    const vQty = v.querySelector(".variant-qty");
    v.querySelector(".variant-plus").onclick = () => {
      if (totalVariant() < paketQty * capacity) {
        vQty.innerText = parseInt(vQty.innerText) + 1;
        refreshVariantUI();
        updateSummary();
      }
    };
    v.querySelector(".variant-minus").onclick = () => {
      if (parseInt(vQty.innerText) > 0) {
        vQty.innerText = parseInt(vQty.innerText) - 1;
        refreshVariantUI();
        updateSummary();
      }
    };
  });

  refreshVariantUI();
});

updateSummary();

/* ======================
   DENAH MEJA
====================== */
document.querySelectorAll(".meja").forEach(m => {
  m.onclick = () => {
    if (m.classList.contains("full")) return;

    document.querySelectorAll(".meja").forEach(x => x.classList.remove("selected"));
    m.classList.add("selected");
    selectedTable = m.dataset.id;

    const info = document.getElementById("mejaTerpilih");
    if (info) info.innerText = "Meja terpilih: " + selectedTable;
  };
});

/* ======================
   SUBMIT
====================== */
document.getElementById("btnSubmit").onclick = () => {
  alert("TOMBOL RESERVASI BISA DIKLIK ✔");
};
