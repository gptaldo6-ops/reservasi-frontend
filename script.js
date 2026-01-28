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
  }

  // ✅ PAKET PLUS (INI HARUS SELALU BISA DIKLIK)
  paketPlus.addEventListener("click", () => {
    paketQty++;
    paketQtyEl.textContent = paketQty;
    updateVariantUI();
  });

  paketMinus.addEventListener("click", () => {
    if (paketQty > 0) paketQty--;
    paketQtyEl.textContent = paketQty;

    if (paketQty === 0) {
      variants.forEach(v => {
        v.querySelector(".variant-qty").textContent = 0;
      });
    }

    updateVariantUI();
  });

  // VARIANT
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

  updateVariantUI();
});
