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

## Related

- [Portfolio Site](https://github.com/luke-whitaker/portfolio-site) — The pixel-art RPG portfolio that inspired this project's visual style

## Author

**Luke Whitaker** — Linguist, researcher, and developer working at the intersection of language, technology, and digital interfaces.
