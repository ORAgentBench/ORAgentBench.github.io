const SITE_VERSION = "2026-06-09-leaderboard-align-v1";
const DATA_PATH = `assets/data/leaderboard.json?v=${SITE_VERSION}`;
const EFFICIENCY_PATH = `assets/data/efficiency.json?v=${SITE_VERSION}`;

const sortSelect = document.querySelector("#leaderboard-sort");
const tableBody = document.querySelector("#leaderboard-body");
const cardBody = document.querySelector("#leaderboard-cards");
const note = document.querySelector("#leaderboard-note");
const efficiencySort = document.querySelector("#efficiency-sort");
const efficiencyBody = document.querySelector("#efficiency-body");
const efficiencyCards = document.querySelector("#efficiency-cards");
const efficiencyNote = document.querySelector("#efficiency-note");

let leaderboardRows = [];
let metricNotes = {};
let efficiencyRows = [];

function percent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function decimal(value) {
  return value.toFixed(3);
}

function money(value) {
  return `$${value.toFixed(2)}`;
}

function renderRows(sortKey = "pass_rate_all") {
  const rows = [...leaderboardRows].sort((a, b) => {
    const primary = b[sortKey] - a[sortKey];
    if (primary !== 0) return primary;
    const quality = b.quality - a.quality;
    if (quality !== 0) return quality;
    return b.feasibility - a.feasibility;
  });

  tableBody.innerHTML = rows
    .map((row, index) => {
      const rank = index + 1;
      const topClass = rank <= 3 ? " top" : "";
      return `
        <tr>
          <td><span class="rank${topClass}">${rank}</span></td>
          <td><span class="agent-name">${row.agent}</span></td>
          <td>${row.harness}</td>
          <td>${decimal(row.feasibility_easy)}</td>
          <td>${decimal(row.feasibility_medium)}</td>
          <td>${decimal(row.feasibility_hard)}</td>
          <td>${decimal(row.quality_easy)}</td>
          <td>${decimal(row.quality_medium)}</td>
          <td>${decimal(row.quality_hard)}</td>
          <td>${percent(row.pass_rate_easy)}</td>
          <td>${percent(row.pass_rate_medium)}</td>
          <td>${percent(row.pass_rate_hard)}</td>
          <td><strong>${percent(row.pass_rate_all)}</strong></td>
        </tr>
      `;
    })
    .join("");

  cardBody.innerHTML = rows
    .map((row, index) => {
      const rank = index + 1;
      const topClass = rank <= 3 ? " top" : "";
      return `
        <article class="leaderboard-card">
          <div class="card-head">
            <span class="rank${topClass}">${rank}</span>
            <div>
              <h3>${row.agent}</h3>
              <p>${row.harness}</p>
            </div>
          </div>
          <div class="card-main-score">
            <span>All pass rate</span>
            <strong>${percent(row.pass_rate_all)}</strong>
          </div>
          <div class="card-metrics">
            <div>
              <span>Feasibility</span>
              <p>${decimal(row.feasibility_easy)} / ${decimal(row.feasibility_medium)} / ${decimal(row.feasibility_hard)}</p>
            </div>
            <div>
              <span>Quality</span>
              <p>${decimal(row.quality_easy)} / ${decimal(row.quality_medium)} / ${decimal(row.quality_hard)}</p>
            </div>
            <div>
              <span>Pass E/M/H</span>
              <p>${percent(row.pass_rate_easy)} / ${percent(row.pass_rate_medium)} / ${percent(row.pass_rate_hard)}</p>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderNote() {
  note.innerHTML = `
    Source: <code>ICLR_2027_ORBench/sections/experiment.tex</code>, main results table.
    Pass: <code>${metricNotes.pass || "feasibility > 0 and normalized quality > 0.4"}</code>.
  `;
}

function sortEfficiencyRows(sortKey) {
  return [...efficiencyRows].sort((a, b) => {
    if (sortKey === "avg_cost_usd" || sortKey === "avg_time_min") {
      return a[sortKey] - b[sortKey] || b.pass_rate_all - a.pass_rate_all;
    }
    return b[sortKey] - a[sortKey] || b.pass_rate_all - a.pass_rate_all;
  });
}

function renderEfficiency(sortKey = "pass_rate_all") {
  const rows = sortEfficiencyRows(sortKey);
  efficiencyBody.innerHTML = rows
    .map((row, index) => {
      const rank = index + 1;
      const topClass = rank <= 3 ? " top" : "";
      return `
        <tr>
          <td><span class="rank${topClass}">${rank}</span></td>
          <td><span class="agent-name">${row.agent}</span></td>
          <td>${row.harness}</td>
          <td><strong>${percent(row.pass_rate_all)}</strong></td>
          <td>${money(row.avg_cost_usd)}</td>
          <td>${row.avg_time_min.toFixed(2)} min</td>
          <td>${row.passes_per_100_usd.toFixed(2)}</td>
          <td>${row.passes_per_hour.toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  efficiencyCards.innerHTML = rows
    .map((row, index) => {
      const rank = index + 1;
      const topClass = rank <= 3 ? " top" : "";
      return `
        <article class="leaderboard-card efficiency-card">
          <div class="card-head">
            <span class="rank${topClass}">${rank}</span>
            <div>
              <h3>${row.agent}</h3>
              <p>${row.harness}</p>
            </div>
          </div>
          <div class="card-main-score">
            <span>All pass rate</span>
            <strong>${percent(row.pass_rate_all)}</strong>
          </div>
          <div class="card-metrics efficiency-card-metrics">
            <div>
              <span>Cost / Task</span>
              <p>${money(row.avg_cost_usd)}</p>
            </div>
            <div>
              <span>Time / Task</span>
              <p>${row.avg_time_min.toFixed(2)} min</p>
            </div>
            <div>
              <span>Passes / $100</span>
              <p>${row.passes_per_100_usd.toFixed(2)}</p>
            </div>
            <div>
              <span>Passes / Hour</span>
              <p>${row.passes_per_hour.toFixed(2)}</p>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadLeaderboard() {
  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    leaderboardRows = payload.rows || [];
    metricNotes = payload.metric_notes || {};
    renderRows(sortSelect.value);
    renderNote();
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="13">
          Leaderboard data could not be loaded. Start a local static server or deploy to GitHub Pages.
        </td>
      </tr>
    `;
    cardBody.innerHTML = "";
    note.textContent = `Failed to load ${DATA_PATH}: ${error.message}`;
  }
}

sortSelect.addEventListener("change", () => renderRows(sortSelect.value));
loadLeaderboard();

efficiencySort.addEventListener("change", () => renderEfficiency(efficiencySort.value));

async function loadEfficiency() {
  try {
    const response = await fetch(EFFICIENCY_PATH);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    efficiencyRows = payload.rows || [];
    renderEfficiency(efficiencySort.value);
  } catch (error) {
    efficiencyBody.innerHTML = `
      <tr>
        <td colspan="8">
          Efficiency data could not be loaded. Start a local static server or deploy to GitHub Pages.
        </td>
      </tr>
    `;
    efficiencyCards.innerHTML = "";
    efficiencyNote.textContent = `Failed to load ${EFFICIENCY_PATH}: ${error.message}`;
  }
}

loadEfficiency();
