# ORAgentBench Project Page

Static GitHub Pages site for `https://oragentbench.github.io/`.

## Structure

- `index.html` - overview page with project introduction, news, figures, and citation.
- `leaderboard.html` - dedicated leaderboard page.
- `styles.css` - responsive page styling.
- `script.js` - leaderboard loader and sorter.
- `assets/data/leaderboard.json` - generated from the main results table in `ICLR_2027_ORBench/sections/experiment.tex`.
- `assets/brand/` - hero background and ORAgentBench logo assets.
- `assets/figures/` - PNG exports of selected paper figures.

## Publish

1. Copy the contents of this directory into the root of the `oragentbench.github.io` repository.
2. Commit and push to the repository default branch.
3. In GitHub repository settings, enable Pages from the default branch root.

The arXiv button is intentionally marked as coming soon until the final arXiv URL is available.

## Local Preview

Run a static server from this directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.
