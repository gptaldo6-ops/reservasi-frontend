const API_URL = "https://script.google.com/macros/s/AKfycbwFU-fHZR5lphEAX0R-I_BvKQx5H1MtCBxgfQU7s6Xnc-RYgx3UZX61RY7eXshk3EX0Sw/exec";

document.getElementById("btnTest").addEventListener("click", async () => {
  const payload = {
    nama: "TEST VERCEL",
    whatsapp: "08123456789",
    tanggal: "2026-01-26",
    tableId: "KANAN-1",
    paketA: 1,
    paketB: 0,
    paketC: 0
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    document.getElementById("output").textContent =
      JSON.stringify(data, null, 2);

  } catch (err) {
    document.getElementById("output").textContent =
      "ERROR: " + err.message;
  }
});
