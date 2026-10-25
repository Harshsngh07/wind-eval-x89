# UK Day-Ahead Wind Forecasting & Decision-Support Portal

> **Full Stack Software Engineer Challenge (REint Pilot Project)**  
> Customized Decision-Support System for UK Electricity Utility Day-Ahead Trading Desks.

---

## 1. Overview & Business Problem

Energy utilities in the United Kingdom procure power on the **UK Day-Ahead Wholesale Market** one day before physical delivery ($D-1$, around 11:00 UTC gate closure). Because renewable wind generation is intermittent and weather-dependent, procurement desks must answer two critical operational questions before placing their orders:

1. **Procurement Requirement**: What is the latest wind generation forecast available before the day-ahead auction closes, and how much conventional (thermal/gas) generation must be procured to cover remaining consumer demand?
2. **Quantified Uncertainty**: Historically, how accurate have these wind forecasts been, what is the systematic bias (over vs. under-forecasting), and what is the worst-case shortfall exposure that requires reserve thermal backing?

This application ingests national wind actuals (`FUELHH`) and forecast streams (`WINDFOR`) from **Elexon BMRS** for **January 2026**, correlates the latest available forecast at decision cut-off time, and presents actionable metrics (MAE, RMSE, Bias, and Shortfall) through an intuitive decision-support portal.

---

## 2. Live Deployment & Video Pitch

- **Live Application URL**: [https://wind-eval-x89.vercel.app/](https://wind-eval-x89.vercel.app/)
- **Live Backend API (Swagger Docs)**: [https://wind-eval-x89.onrender.com/docs](https://wind-eval-x89.onrender.com/docs)
- **Unlisted Video Demo (YouTube)**: `[Insert Unlisted YouTube Link here]`
  - **Part 1 (Client Pitch, < 5 min)**: Executive walkthrough focusing on procurement risk mitigation, error visibility, and reserve allocation.
  - **Part 2 (Tech Lead Architecture Review, < 5 min)**: Technical walkthrough of data pipelines, settlement period alignment, Docker setup, and test suite.

---

## 3. Architecture & Repository Structure

```
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entrypoint & middleware
│   │   ├── config.py               # Pydantic Settings configuration & CORS
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py           # REST endpoints (/day-ahead, /dates, /monthly-summary)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── elexon_service.py   # Elexon BMRS FUELHH & WINDFOR data ingestion
│   │   │   └── analytics_service.py# Quantitative error metrics (MAE, RMSE, Bias, Shortfall)
│   │   └── models/
│   │       ├── __init__.py
│   │       └── schemas.py          # Pydantic data models & response schemas
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_analytics.py       # Unit tests for analytics & error formulas
│   ├── requirements.txt            # Python dependencies (FastAPI, Pandas, NumPy, etc.)
│   ├── Dockerfile                  # Production container for backend
│   └── .dockerignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Dashboard.tsx       # Recharts visualizations & settlement data table
│   │   ├── services/
│   │   │   └── api.ts              # Fetch client communicating with backend
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   ├── App.tsx                 # Root application wrapper
│   │   ├── main.tsx                # React DOM entry
│   │   └── index.css               # Tailwind CSS v4 design tokens
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts              # Vite config with proxy & Tailwind plugin
│   ├── Dockerfile                  # Multi-stage production build with Nginx
│   └── nginx.conf                  # Nginx proxy configuration
│
├── docker-compose.yml              # Multi-container orchestration (Backend + Frontend)
├── .env.example                    # Environment variable template
├── .gitignore
└── README.md                       # Documentation & AI usage disclosure
```

---

## 4. How to Start the Application

### Option A: Using Docker (Recommended)

Ensure Docker and Docker Compose are installed:

```bash
# Clone the repository
git clone https://github.com/Harshsngh07/wind-eval-x89.git
cd wind-eval-x89

# Build and start all services
docker compose up --build
```

- **Frontend Portal**: Open [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger UI)**: Open [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: Open [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### Option B: Local Development (Without Docker)

#### 1. Backend Setup:
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run unit tests
python -m pytest tests/

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Domain Logic & Quantitative Analysis

- **Settlement Period Resolution**: UK electricity market operates on 48 half-hourly settlement periods per day (30-min resolution).
- **Day-Ahead Gate Closure Filtering**:
  For delivery day $D$, trading decisions occur on day $D-1$ before market cut-off (e.g. 11:00 UTC).
  $$\text{Selected Forecast}(t) = \max_{\text{publishTime} \le \text{Cut-Off}}\{\text{Forecast}(t, \text{publishTime})\}$$
- **Evaluated Metrics**:
  - **Mean Absolute Error (MAE)**: $\frac{1}{N} \sum |F_t - A_t|$
  - **Root Mean Squared Error (RMSE)**: $\sqrt{\frac{1}{N} \sum (F_t - A_t)^2}$
  - **Forecast Bias**: $\frac{1}{N} \sum (F_t - A_t)$ (Positive = Over-forecasting, Negative = Under-forecasting)
  - **Thermal Reserve Deficit Exposure**: Identifies maximum generation shortfall where fossil peaker plants must be dispatched.

---

## 6. AI Usage Statement

In accordance with challenge guidelines, **AI tools (Google Antigravity & LLM coding assistants) were used during the development of this project**.

Specifically, AI assistance was leveraged for:
1. **Domain & API Understanding**: Synthesizing Elexon BMRS `FUELHH` and `WINDFOR` schemas and UK day-ahead market settlement timelines.
2. **Boilerplate & Scaffolding**: Generating initial FastAPI routers, Pydantic schemas, and Vite/React component scaffolds.
3. **Visualization & UI Design**: Styling the responsive trading dashboard using Tailwind CSS and Recharts time-series charts.
4. **Resilience & Testing**: Implementing unit tests for error metric calculations and Docker multi-stage configurations.

All generated code, algorithmic calculations, and architectural decisions were reviewed, verified, and tested for accuracy.
