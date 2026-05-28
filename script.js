const BACKEND_URL = "https://backend-production-3dedf.up.railway.app";

let nextWBDateObj = null;
let countdownTimer = null;

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
    document.getElementById("status").innerText = "Update...";

    const nextRes = await fetch(`${BACKEND_URL}/nextWB`);
    const nextData = await nextRes.json();

    if (nextData.error) {
      document.getElementById("nextWBDate").innerText = nextData.error;
      document.getElementById("countdown").innerText = "--";
      nextWBDateObj = null;
    } else {
      nextWBDateObj = new Date(nextData.nextWB.date);
      document.getElementById("nextWBDate").innerText = formatDateUTC(nextWBDateObj);
    }

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

    const now = Date.now();
    const diff = nextWBDateObj - now;

    if (diff <= 0) {
      el.innerText = "WB in progress or just spawned";
      return;
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    el.innerText = `${h}h ${m}m ${s}s`;
  }, 1000);
}
.day-block {
  margin-bottom: 18px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
}

.day-title {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 1.1rem;
  color: #9ecbff;
}

.day-entry {
  padding: 4px 0;
  font-size: 1rem;
}

.today {
  background: rgba(0, 120, 255, 0.15);
  border-left: 3px solid #4da3ff;
}

loadData();
startCountdown();
setInterval(loadData, 30000);
