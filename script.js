const BACKEND_URL = "https://backend-production-3dedf.up.railway.app";

let nextWBDateObj = null;
let countdownTimer = null;

// Format in UTC+0
function formatDateUTC(d) {
  return d.toLocaleString("it-IT", {
    timeZone: "UTC",
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
    document.getElementById("status").innerText = "Refresh...";

    const [lastRes, nextRes] = await Promise.all([
      fetch(`${BACKEND_URL}/lastWB`),
      fetch(`${BACKEND_URL}/nextWB`)
    ]);

    const lastData = await lastRes.json();
    const nextData = await nextRes.json();

    // Ultimo WB (UTC)
    if (lastData.lastWB_date) {
      const lastDate = new Date(lastData.lastWB_date); // ISO → Date
      document.getElementById("lastWBDate").innerText = formatDateUTC(lastDate);
    }

    // Prossimo WB (UTC)
    if (nextData.error) {
      document.getElementById("nextWBDate").innerText = nextData.error;
      document.getElementById("countdown").innerText = "--";
      nextWBDateObj = null;
    } else {
      nextWBDateObj = new Date(nextData.nextWB.date); // ISO → Date
      document.getElementById("nextWBDate").innerText = formatDateUTC(nextWBDateObj);
    }

    // Tabella previsioni future (UTC)
    const tbody = document.getElementById("futureTable");
    tbody.innerHTML = "";

    if (nextData.remainingPredictions && nextData.remainingPredictions.date) {
      nextData.remainingPredictions.date.forEach((d, idx) => {
        const dateObj = new Date(d);

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>${formatDateUTC(dateObj)}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Ultimo aggiornamento (UTC)
    document.getElementById("status").innerText =
      "Last Update: " + formatDateUTC(new Date());

  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "Error loading data";
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

    // Ora attuale in UTC
    const now = new Date(Date.now());

    const diff = nextWBDateObj - now;

    if (diff <= 0) {
      el.innerText = "WB in progress or just spawned";
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
