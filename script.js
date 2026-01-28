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

  summaryEl.innerHTML = data.map(d => `
    <div style="margin-bottom:10px">
      <strong>Paket ${d.paket} × ${d.qty}</strong><br/>
      ${d.variants.length ? d.variants.join("<br/>") : "<em>Belum pilih variant</em>"}
    </div>
  `).join("");
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
