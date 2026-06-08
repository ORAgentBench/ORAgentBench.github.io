# ORAgentBench Project Page

Static GitHub Pages site for `https://oragentbench.github.io/`.

## Structure

- `index.html` - single-page academic benchmark project page.
- `styles.css` - responsive page styling.
- `script.js` - leaderboard loader and sorter.
- `assets/data/leaderboard.json` - generated from `ICLR_2027_ORBench/analysis_data/main_experiment_records.json`.
- `assets/figures/` - PNG exports of selected paper figures.

## Publish

1. Copy the contents of this directory into the root of the `oragentbench.github.io` repository.
2. Commit and push to the repository default branch.
3. In GitHub repository settings, enable Pages from the default branch root.

The Paper and GitHub buttons are intentionally placeholders until the final arXiv URL and public code repository are available.

## Local Preview

Run a static server from this directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.
