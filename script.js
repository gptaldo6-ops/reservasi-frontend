const paketRadios = document.querySelectorAll('input[name="paket"]');
const paketDetailBox = document.getElementById("paket-detail");

paketRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    paketDetailBox.style.display = "block";
  });
});

