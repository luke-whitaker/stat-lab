# StatLab

A retro-styled data analysis and visualization tool. Upload a CSV, explore your data with descriptive statistics and charts, and run statistical tests — all in a pixel-art RPG-inspired interface.

## What it Does

StatLab is a single-page data lab with three tabs:

| Tab | What it does |
|-----|-------------|
| **Data** | Upload a CSV via drag-and-drop. Auto-detects column types (numeric vs. categorical). Preview your data in a table. |
| **Explore** | Descriptive statistics (mean, SD, median, quartiles) for numeric columns. Frequency summaries for categorical columns. Auto-generated histograms and a correlation heatmap. |
| **Analyze** | Run statistical tests: independent t-test, one-way ANOVA, chi-square test of independence, or Pearson correlation. Results include test statistic, p-value, and a plain-language interpretation. |

No accounts, no database, no setup. Drop in a file and start exploring.

## Front & Back End Deployed via Railway. Click this link to see how it works: https://dynamic-spirit-production-91a5.up.railway.app/

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI (Python) |
| Stats | Pandas, NumPy, SciPy |
| Charts | Plotly |
| Font | Press Start 2P |

## Project Structure

```
stats-project/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Settings
│   │   ├── routers/
│   │   │   ├── data.py          # CSV upload and parsing
│   │   │   ├── analysis.py      # Descriptive stats and tests
│   │   │   └── visualizations.py# Chart generation
│   │   └── services/
│   │       ├── stats_engine.py  # Statistical computations
│   │       ├── data_processor.py# CSV parsing utilities
│   │       └── chart_builder.py # Plotly chart generation
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Single-page app (all three tabs)
│   │   │   ├── layout.tsx       # Root layout
│   │   │   └── globals.css      # Retro 8-bit theme
│   │   ├── components/
│   │   │   ├── FileUpload.tsx   # Drag-and-drop CSV upload
│   │   │   ├── DataTable.tsx    # Data preview table
│   │   │   └── PlotlyChart.tsx  # Chart renderer
│   │   └── lib/
│   │       └── api.ts           # Backend API client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.11+ (or Conda)
- Node.js 18+

### Backend

```bash
cd backend

# With conda:
conda create -p ./venv python=3.12
conda activate ./venv
pip install -r requirements.txt

# Or with venv (if Python 3.11+ is your default):
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start the server:
uvicorn app.main:app --reload --port 8000
```

API docs at [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Version Notes

### v0.2 — Dynamic Column Selection & Pagination (2026-04-13)

**Problem:** After uploading a CSV, users were locked into viewing all columns and only the first 20 rows. There was no way to focus on the variables that mattered, and large datasets were cut off with no way to scroll through the rest.

**What changed:**
- **Column toggle** — The column badges on the Data tab are now clickable. Tap a column to select or deselect it. Deselected columns dim out visually so it's easy to see what's active. Quick "All" and "None" buttons let you reset fast.
- **Selection flows downstream** — The columns you select on the Data tab are the columns that show up in Explore (stats and charts) and Analyze (test configuration dropdowns). This means you can narrow your analysis to just the variables you care about before running anything.
- **Pagination** — The data table now shows all rows (not just the first 20) in pages of 50, with Prev/Next controls and a row counter.

**Why:** The first version was a proof of concept — upload a file, see some stats. But a real analysis workflow starts with choosing which variables to look at. Making column selection the foundation means every feature built on top of it (explore, analyze, future features) automatically respects the user's focus.

---

### v0.1 — Initial Release (2026-04-08)

First working version. CSV upload with drag-and-drop, auto column type detection, descriptive statistics, four statistical tests (t-test, ANOVA, chi-square, correlation), auto-generated histograms and correlation heatmaps. Deployed to Railway with a FastAPI backend and Next.js frontend.

---

## Related

- [Portfolio Site](https://github.com/luke-whitaker/portfolio-site) — The pixel-art RPG portfolio that inspired this project's visual style

## Author

**Luke Whitaker** — Linguist, researcher, and developer working at the intersection of language, technology, and digital interfaces.
