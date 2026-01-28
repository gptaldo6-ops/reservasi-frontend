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


