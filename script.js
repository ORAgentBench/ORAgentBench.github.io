const SITE_VERSION = "2026-06-16-overview-leaderboard-v1";
const DATA_PATH = `assets/data/leaderboard.json?v=${SITE_VERSION}`;

const page = document.body.dataset.page;
let leaderboardRows = [];
let metricNotes = {};
let activeSplit = "overall";

const splitConfig = {
  overall: {
    label: "Pass Rate",
    passKey: "pass_rate_all",
    feasibilityKey: "feasibility",
    qualityKey: "quality",
    countLabel: (row) => `${row.pass_count_all}/${row.task_count}`,
  },
  easy: {
    label: "Easy Pass",
    passKey: "pass_rate_easy",
    feasibilityKey: "feasibility_easy",
    qualityKey: "quality_easy",
    countLabel: (row) => `${Math.round(row.pass_rate_easy * 32)}/32`,
  },
  medium: {
    label: "Medium Pass",
    passKey: "pass_rate_medium",
    feasibilityKey: "feasibility_medium",
    qualityKey: "quality_medium",
    countLabel: (row) => `${Math.round(row.pass_rate_medium * 41)}/41`,
  },
  hard: {
    label: "Hard Pass",
    passKey: "pass_rate_hard",
    feasibilityKey: "feasibility_hard",
    qualityKey: "quality_hard",
    countLabel: (row) => `${Math.round(row.pass_rate_hard * 34)}/34`,
  },
};

const barPalette = ["#2563eb", "#f59e0b", "#16a34a", "#b45309", "#63738a", "#0d7a75"];

function percent(value, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function decimal(value) {
  return value.toFixed(3);
}

function providerName(row) {
  if (row.agent.startsWith("Claude")) return "Anthropic";
  if (row.agent.startsWith("GPT")) return "OpenAI";
  if (row.agent.startsWith("DeepSeek")) return "DeepSeek";
  if (row.agent.startsWith("Kimi")) return "Moonshot AI";
  if (row.agent.startsWith("GLM")) return "Zhipu AI";
  if (row.agent.startsWith("Qwen")) return "Qwen";
  if (row.agent.startsWith("MiMo")) return "Xiaomi";
  if (row.agent.startsWith("MiniMax")) return "MiniMax";
  return row.harness;
}

function modelLogo(row) {
  if (row.agent.startsWith("GPT")) return { key: "gpt", src: "assets/logos/gpt.svg", alt: "OpenAI" };
  if (row.agent.startsWith("Claude")) return { key: "claude", src: "assets/logos/claude.svg", alt: "Claude" };
  if (row.agent.startsWith("DeepSeek")) return { key: "deepseek", src: "assets/logos/deepseek.svg", alt: "DeepSeek" };
  if (row.agent.startsWith("Kimi")) return { key: "moonshotai", src: "assets/logos/moonshotai.svg", alt: "Moonshot AI" };
  if (row.agent.startsWith("GLM")) return { key: "zhipu", src: "assets/logos/zhipu.svg", alt: "Zhipu AI" };
  if (row.agent.startsWith("Qwen")) return { key: "qwen", src: "assets/logos/qwen.svg", alt: "Qwen" };
  if (row.agent.startsWith("MiMo")) return { key: "xiaomi", src: "assets/logos/xiaomi.svg", alt: "Xiaomi" };
  if (row.agent.startsWith("MiniMax")) return { key: "minimax", src: "assets/logos/minimax.svg", alt: "MiniMax" };
  return { key: "oragentbench", src: "assets/brand/oragentbench-logo.svg", alt: "ORAgentBench" };
}

function modelIcon(row) {
  const logo = modelLogo(row);
  return `<span class="model-avatar logo-${logo.key}"><img src="${logo.src}?v=${SITE_VERSION}" alt="${logo.alt}" loading="lazy"></span>`;
}

function sortedRows(split = activeSplit) {
  const config = splitConfig[split];
  return [...leaderboardRows].sort((a, b) => {
    const primary = b[config.passKey] - a[config.passKey];
    if (primary !== 0) return primary;
    const quality = b[config.qualityKey] - a[config.qualityKey];
    if (quality !== 0) return quality;
    return b[config.feasibilityKey] - a[config.feasibilityKey];
  });
}

function renderOverview() {
  const target = document.querySelector("#overview-top-runs");
  if (!target) return;

  target.innerHTML = sortedRows("overall")
    .slice(0, 5)
    .map((row, index) => `
        <article class="snapshot-row">
          <span class="rank ${index < 3 ? "top" : ""}">${index + 1}</span>
          ${modelIcon(row)}
          <div>
            <strong>${row.agent}</strong>
            <span>${providerName(row)} · ${row.harness}</span>
          </div>
          <em>${percent(row.pass_rate_all)}</em>
        </article>
      `)
    .join("");
}

function renderLeaderboardNote() {
  const note = document.querySelector("#leaderboard-note");
  if (!note) return;
  note.innerHTML = `
    Source: <code>ICLR_2027_ORBench/sections/experiment.tex</code>, main results table.
    Pass: <code>${metricNotes.pass || "feasibility > 0 and normalized quality > 0.4"}</code>.
  `;
}

function renderLeaderboard(split = activeSplit) {
  const body = document.querySelector("#scoreboard-body");
  const cards = document.querySelector("#score-cards");
  const heading = document.querySelector("#primary-metric-heading");
  if (!body || !cards) return;

  activeSplit = split;
  const config = splitConfig[split];
  const rows = sortedRows(split);
  if (heading) heading.textContent = config.label;

  body.innerHTML = rows
    .map((row, index) => {
      const pass = row[config.passKey];
      const width = `${Math.max(0, Math.min(pass, 1) * 100).toFixed(1)}%`;
      const barColor = barPalette[index % barPalette.length];
      return `
        <tr class="${index === 0 ? "leader-row" : ""}">
          <td><span class="rank ${index < 3 ? "top" : ""}">${index + 1}</span></td>
          <td>
            <div class="model-cell">
              ${modelIcon(row)}
              <div>
                <strong>${row.agent}</strong>
                <span>${providerName(row)}</span>
              </div>
            </div>
          </td>
          <td>
            <div class="score-bar-cell">
              <span class="score-track"><span style="width:${width};background:${barColor}"></span></span>
              <strong>${percent(pass)}</strong>
            </div>
          </td>
          <td>${decimal(row[config.feasibilityKey])}</td>
          <td>${decimal(row[config.qualityKey])}</td>
          <td>${config.countLabel(row)}</td>
          <td>${row.harness}</td>
        </tr>
      `;
    })
    .join("");

  cards.innerHTML = rows
    .map((row, index) => `
        <article class="score-card">
          <div class="card-head">
            <span class="rank ${index < 3 ? "top" : ""}">${index + 1}</span>
            ${modelIcon(row)}
            <div>
              <h3>${row.agent}</h3>
              <p>${providerName(row)} · ${row.harness}</p>
            </div>
          </div>
          <div class="card-main-score">
            <span>${config.label}</span>
            <strong>${percent(row[config.passKey])}</strong>
          </div>
          <div class="card-metrics">
            <div>
              <span>Feasibility</span>
              <p>${decimal(row[config.feasibilityKey])}</p>
            </div>
            <div>
              <span>Quality</span>
              <p>${decimal(row[config.qualityKey])}</p>
            </div>
            <div>
              <span>Passed</span>
              <p>${config.countLabel(row)}</p>
            </div>
          </div>
        </article>
      `)
    .join("");

  renderLeaderboardNote();
}

function bindLeaderboardControls() {
  document.querySelectorAll("[data-board-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-board-tab]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderLeaderboard(button.dataset.boardTab);
    });
  });

  const shareButton = document.querySelector("#share-button");
  if (shareButton) {
    shareButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        shareButton.textContent = "Copied";
        window.setTimeout(() => {
          shareButton.textContent = "Share";
        }, 1400);
      } catch {
        shareButton.textContent = "Copy Failed";
      }
    });
  }

  const imageButton = document.querySelector("#image-button");
  if (imageButton) {
    imageButton.addEventListener("click", () => window.print());
  }
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
    if (page === "overview") renderOverview();
    if (page === "leaderboard") renderLeaderboard();
  } catch (error) {
    const overviewTarget = document.querySelector("#overview-top-runs");
    const boardTarget = document.querySelector("#scoreboard-body");
    if (overviewTarget) overviewTarget.innerHTML = `<p class="loading-text">Failed to load ${DATA_PATH}: ${error.message}</p>`;
    if (boardTarget) {
      boardTarget.innerHTML = `
        <tr>
          <td colspan="7">Leaderboard data could not be loaded. Start a local static server or deploy to GitHub Pages.</td>
        </tr>
      `;
    }
  }
}

bindLeaderboardControls();
loadLeaderboard();
