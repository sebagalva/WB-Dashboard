const BACKEND_URL = "https://backend-production-3dedf.up.railway.app";

let nextWBDateObj = null;
let countdownTimer = null;

function formatDateUTC(d) {
  return d.toLocaleString("en-GB", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatDay(dateObj) {
  return dateObj.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "UTC"
  });
}

function formatTime(dateObj) {
  return dateObj.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC"
  });
}

async function loadData() {
  try {
    document.getElementById("status").innerText = "Update...";

    const nextRes = await fetch(`${BACKEND_URL}/nextWB`);
    const nextData = await nextRes.json();

    // NEXT WB
    nextWBDateObj = new Date(nextData.nextWB.date);
    document.getElementById("nextWBDate").innerText = formatDateUTC(nextWBDateObj);

    // FUTURE PREDICTIONS
    const container = document.getElementById("futureContainer");
    container.innerHTML = "";

    const predictions = nextData.remainingPredictions.date.map(d => new Date(d));

    // Raggruppa per giorno
    const groups = {};
    predictions.forEach(dateObj => {
      const dayKey = dateObj.toISOString().split("T")[0];
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(dateObj);
    });

    const todayKey = new Date().toISOString().split("T")[0];

    // Genera blocchi
    Object.keys(groups).forEach(dayKey => {
      const block = document.createElement("div");
      block.className = "day-block";

      if (dayKey === todayKey) block.classList.add("today");

      const dayTitle = document.createElement("div");
      dayTitle.className = "day-title";

      const sampleDate = groups[dayKey][0];
      dayTitle.innerText = formatDay(sampleDate);

      block.appendChild(dayTitle);

      groups[dayKey].forEach(dateObj => {
        const entry = document.createElement("div");
        entry.className = "day-entry";
        entry.innerText = formatTime(dateObj);
        block.appendChild(entry);
      });

      container.appendChild(block);
    });

    document.getElementById("status").innerText =
      "Last update: " + formatDateUTC(new Date());

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

    el.innerText = `Left ${h}h ${m}m ${s}s`;
  }, 1000);
}

loadData();
startCountdown();
setInterval(loadData, 30000);
