const summaryEl = document.getElementById("order-summary");

document.querySelectorAll(".paket-card").forEach(card => {
  const paketKode = card.dataset.paket;
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
    const maxVariant = paketQty * capacity;
    const totalVariant = getTotalVariant();

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
        plus.disabled = totalVariant >= maxVariant;
      }
    });

    updateSummary();
  }

  paketPlus.addEventListener("click", () => {
    paketQty++;
    paketQtyEl.textContent = paketQty;
    updateVariantUI();
  });

  paketMinus.addEventListener("click", () => {
    if (paketQty > 0) paketQty--;
    paketQtyEl.textContent = paketQty;

    if (paketQty === 0) {
      variants.forEach(v => v.querySelector(".variant-qty").textContent = 0);
    }

    updateVariantUI();
  });

  variants.forEach(v => {
    const vQtyEl = v.querySelector(".variant-qty");

    v.querySelector(".variant-plus").addEventListener("click", () => {
      const max = paketQty * capacity;
      if (getTotalVariant() < max) {
        vQtyEl.textContent = parseInt(vQtyEl.textContent, 10) + 1;
        updateVariantUI();
      }
    });

    v.querySelector(".variant-minus").addEventListener("click", () => {
      const current = parseInt(vQtyEl.textContent, 10);
      if (current > 0) {
        vQtyEl.textContent = current - 1;
        updateVariantUI();
      }
    });
  });

  function updateSummary() {
    const data = [];

    document.querySelectorAll(".paket-card").forEach(c => {
      const kode = c.dataset.paket;
      const qty = parseInt(c.querySelector(".paket-qty").textContent, 10);
      if (qty > 0) {
        const items = [];
        c.querySelectorAll(".variant").forEach(v => {
          const vQty = parseInt(v.querySelector(".variant-qty").textContent, 10);
          if (vQty > 0) {
            items.push(`${v.dataset.variant} × ${vQty}`);
          }
        });

        data.push({
          paket: kode,
          qty,
          items
        });
      }
    });

    if (data.length === 0) {
      summaryEl.innerHTML = "<p>Belum ada paket dipilih</p>";
      return;
    }

    summaryEl.innerHTML = data.map(d => `
      <div style="margin-bottom:8px">
        <strong>Paket ${d.paket} × ${d.qty}</strong><br/>
        ${d.items.length ? d.items.join("<br/>") : "<em>Belum pilih variant</em>"}
      </div>
    `).join("");
  }

  updateVariantUI();
});
