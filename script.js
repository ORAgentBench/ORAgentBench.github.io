const SITE_VERSION = "2026-06-08-main-table-brand-v2";
const DATA_PATH = `assets/data/leaderboard.json?v=${SITE_VERSION}`;

const sortSelect = document.querySelector("#leaderboard-sort");
const tableBody = document.querySelector("#leaderboard-body");
const note = document.querySelector("#leaderboard-note");

let leaderboardRows = [];
let metricNotes = {};

function percent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function decimal(value) {
  return value.toFixed(3);
}

function statusLabel(row) {
  return "complete";
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
      const statusClass = "status-complete";
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
          <td><span class="status-pill ${statusClass}">${statusLabel(row)}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderNote() {
  note.innerHTML = `
    Source: <code>ICLR_2027_ORBench/sections/experiment.tex</code>, main results table.
    Pass: <code>${metricNotes.pass || "feasibility > 0 and normalized quality > 0.4"}</code>.
    Status: all displayed model-agent rows are complete.
  `;
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
        <td colspan="14">
          Leaderboard data could not be loaded. Start a local static server or deploy to GitHub Pages.
        </td>
      </tr>
    `;
    note.textContent = `Failed to load ${DATA_PATH}: ${error.message}`;
  }
}

sortSelect.addEventListener("change", () => renderRows(sortSelect.value));
loadLeaderboard();
