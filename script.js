
const BACKEND_URL = "https://backend-production-3dedf.up.railway.app";

let nextWBDateObj = null;
let countdownTimer = null;

function formatDate(d) {
  return d.toLocaleString("it-IT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

async function loadData() {
  try {
    document.getElementById("status").innerText = "Aggiornamento...";

    const [lastRes, nextRes] = await Promise.all([
      fetch(`${BACKEND_URL}/lastWB`),
      fetch(`${BACKEND_URL}/nextWB`)
    ]);

    const lastData = await lastRes.json();
    const nextData = await nextRes.json();

    // Ultimo WB
    if (lastData.lastWB_date) {
      const lastDate = new Date(lastData.lastWB_date);
      document.getElementById("lastWBDate").innerText = formatDate(lastDate);
      document.getElementById("lastWBSerial").innerText =
        `serial: ${lastData.lastWB_serial}`;
    }

    // Prossimo WB
    if (nextData.error) {
      document.getElementById("nextWBDate").innerText = nextData.error;
      document.getElementById("nextWBSerial").innerText = "serial: --";
      document.getElementById("countdown").innerText = "--";
      nextWBDateObj = null;
    } else {
      nextWBDateObj = new Date(nextData.nextWB.date);
      document.getElementById("nextWBDate").innerText = formatDate(nextWBDateObj);
      document.getElementById("nextWBSerial").innerText =
        `serial: ${nextData.nextWB.serial}`;
    }

    // Tabella previsioni future
    const tbody = document.getElementById("futureTable");
    tbody.innerHTML = "";

    if (nextData.remainingPredictions && nextData.remainingPredictions.date) {
      nextData.remainingPredictions.date.forEach((d, idx) => {
        const tr = document.createElement("tr");
        const dateObj = new Date(d);

        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>${formatDate(dateObj)}</td>
          <td>${nextData.remainingPredictions.serial[idx]}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    document.getElementById("status").innerText = "Ultimo aggiornamento: " + formatDate(new Date());
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "Errore nel caricamento dati";
  }
}

function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);

  countdownTimer = setInterval(() => {
    const el = document.getElementById("countdown");
    if (!nextWBDateObj) {
      el.innerText = "--";
      return;
    }

    const now = new Date();
    const diff = nextWBDateObj - now;

    if (diff <= 0) {
      el.innerText = "WB in corso o appena spawnato";
      return;
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    el.innerText = `Mancano ${h}h ${m}m ${s}s`;
  }, 1000);
}

loadData();
startCountdown();
setInterval(loadData, 30000);
