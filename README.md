# kjhwr7 — UK Wind Forecast Portal

A full-stack web application for UK energy utility trading teams to view national wind generation forecasts and evaluate their accuracy, using exclusively Elexon BMRS data. Scoped to **January 2026** delivery days.

## 🤖 AI Tools Used

This application was developed with assistance from **Google Antigravity (AI coding assistant / Gemini-based agent)**, including architecture planning, implementation plan creation, code generation, and review. All business logic (day-ahead gate closure alignment, accuracy metric formulas) was verified manually by the developer and backed by unit tests.

---

## 🚀 Live Application

| Service | URL |
|---|---|
| **Frontend** | https://kjhwr7-web.herokuapp.com *(after deployment)* |
| **Backend API Docs** | https://kjhwr7-api.herokuapp.com/docs *(after deployment)* |

---

## 📁 Directory Structure

```
kjhwr7/
├── backend/                    Python FastAPI backend
│   ├── app/
│   │   ├── main.py             FastAPI app entry — CORS, router registration
│   │   ├── config.py           Pydantic settings (env vars, date constants)
│   │   ├── schemas.py          Pydantic response models
│   │   ├── routers/
│   │   │   ├── actuals.py      GET /api/actuals?date=
│   │   │   ├── forecasts.py    GET /api/forecasts?date=
│   │   │   └── accuracy.py     GET /api/accuracy (full January 2026)
│   │   └── services/
│   │       ├── elexon_client.py  Async httpx calls to Elexon BMRS API
│   │       ├── data_processor.py Gate-closure logic + MAE/RMSE/Bias metrics
│   │       └── cache.py          In-memory TTL cache decorator
│   ├── tests/                  Pytest unit + integration tests
│   ├── Dockerfile
│   ├── pytest.ini
│   └── requirements.txt
├── frontend/                   React + Vite SPA
│   ├── src/
│   │   ├── main.jsx            React entry point
│   │   ├── App.jsx             Router + layout shell
│   │   ├── api/client.js       Axios API client
│   │   ├── pages/
│   │   │   ├── ForecastView.jsx    Page 1: Forecast vs Actual chart
│   │   │   └── AccuracyView.jsx    Page 2: Monthly accuracy dashboard
│   │   ├── components/
│   │   │   ├── NavBar.jsx
│   │   │   ├── TimeSeriesChart.jsx  Recharts overlay chart
│   │   │   ├── MetricsCard.jsx
│   │   │   ├── DaySelector.jsx
│   │   │   └── AccuracyTable.jsx
│   │   └── utils/formatters.js  MW formatting + date helpers
│   ├── nginx.conf              Production nginx config (Heroku PORT injection)
│   ├── Dockerfile              Multi-stage: Node build → nginx serve
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── docker-compose.yml          Local orchestration (backend:8000, frontend:5173)
├── .github/workflows/ci.yml   GitHub Actions CI (pytest + vitest)
└── README.md
```

---

## ⚙️ How to Run Locally

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- No API keys required (Elexon BMRS is open access)

### Start with Docker Compose

```bash
git clone https://github.com/<anon-user>/kjhwr7.git
cd kjhwr7
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

### Run Tests Locally (without Docker)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

**Frontend:**
```bash
cd frontend
npm install
npm run test
```

---

## 📊 Data Sources

| Dataset | Endpoint | Description |
|---|---|---|
| **FUELHH** | `GET /datasets/FUELHH/stream` | Half-hourly wind actuals (`fuelType=WIND`) |
| **WINDFOR** | `GET /datasets/WINDFOR/stream` | Wind generation forecasts (multiple publishes/day) |

Base URL: `https://data.elexon.co.uk/bmrs/api/v1`

---

## 🧠 Key Business Logic

### Day-Ahead Decision Forecast
The N2EX day-ahead auction gate closes at **09:50 GMT**. The "decision forecast" for delivery day `D` is the WINDFOR record with the **latest `publishTime` strictly before `D-1 09:50:00 UTC`** — typically the 08:30 UTC ESO forecast run. This is the forecast the trading team must use when deciding how much additional thermal generation to procure.

### Accuracy Metrics
Computed per delivery day across all 48 half-hour settlement periods:

| Metric | Formula | Purpose |
|---|---|---|
| **MAE** | mean(\|forecast − actual\|) | Typical average MW deviation |
| **RMSE** | √mean((forecast − actual)²) | Highlights large errors (grid risk signal) |
| **Bias** | mean(forecast − actual) | +ve = over-forecast; −ve = under-forecast |

> MAPE is excluded because wind generation frequently reaches 0 MW, causing division-by-zero instability.

---

## 🐳 Deployment to Heroku

```bash
heroku login && heroku container:login

# Backend
heroku create kjhwr7-api --stack container
heroku container:push web --app kjhwr7-api --context-path ./backend
heroku container:release web --app kjhwr7-api
heroku config:set CORS_ORIGINS=https://kjhwr7-web.herokuapp.com --app kjhwr7-api

# Frontend
heroku create kjhwr7-web --stack container
heroku container:push web --app kjhwr7-web --context-path ./frontend \
  --arg VITE_API_URL=https://kjhwr7-api.herokuapp.com
heroku container:release web --app kjhwr7-web
heroku config:set PORT=80 --app kjhwr7-web
```
