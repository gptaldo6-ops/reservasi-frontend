const paketRadios = document.querySelectorAll('input[name="paket"]');
const paketDetailBox = document.getElementById("paket-detail");

paketRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    paketDetailBox.style.display = "block";
  });
});

const paketCards = document.querySelectorAll(".paket-card");

paketCards.forEach(card => {
  let qty = 0;
  const qtySpan = card.querySelector(".qty");
  const btnPlus = card.querySelector(".btn-plus");
  const btnMinus = card.querySelector(".btn-minus");

  btnPlus.addEventListener("click", () => {
    qty++;
    qtySpan.textContent = qty;
  });

  btnMinus.addEventListener("click", () => {
    if (qty > 0) qty--;
    qtySpan.textContent = qty;
  });
});

document.querySelectorAll(".paket-card").forEach(card => {
  const capacity = parseInt(card.dataset.capacity, 10);

  const paketQtyEl = card.querySelector(".paket-qty");
  const paketPlus = card.querySelector(".paket-plus");
  const paketMinus = card.querySelector(".paket-minus");

  const variants = card.querySelectorAll(".variant");

  let paketQty = 0;

  function updateVariantsState() {
    const maxVariant = paketQty * capacity;
    let totalVariant = 0;

    variants.forEach(v => {
      totalVariant += parseInt(v.querySelector(".variant-qty").textContent, 10);
    });

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

  paketPlus.addEventListener("click", () => {
    paketQty++;
    paketQtyEl.textContent = paketQty;
    updateVariantsState();
  });

  paketMinus.addEventListener("click", () => {
    if (paketQty > 0) paketQty--;
    paketQtyEl.textContent = paketQty;

    if (paketQty === 0) {
      variants.forEach(v => v.querySelector(".variant-qty").textContent = 0);
    }

    updateVariantsState();
  });

  variants.forEach(v => {
    let vQty = 0;
    const vQtyEl = v.querySelector(".variant-qty");

    v.querySelector(".variant-plus").addEventListener("click", () => {
      const max = paketQty * capacity;
      const currentTotal = [...variants].reduce(
        (sum, x) => sum + parseInt(x.querySelector(".variant-qty").textContent, 10),
        0
      );
      if (currentTotal < max) {
        vQty++;
        vQtyEl.textContent = vQty;
        updateVariantsState();
      }
    });

    v.querySelector(".variant-minus").addEventListener("click", () => {
      if (vQty > 0) vQty--;
      vQtyEl.textContent = vQty;
      updateVariantsState();
    });
  });

  updateVariantsState();
});


