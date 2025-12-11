# askLio Procurement System

Procurement request management system with AI-powered PDF extraction and commodity classification.

## Features

- Create procurement requests manually or upload vendor PDFs
- AI extracts vendor info, order lines, and prices from PDFs (OpenAI GPT-4 used through native SDK)
- Automatic commodity group classification
- Dashboard with status filtering (Open, In Progress, Closed)
- Status history tracking
- User profiles for faster request submission

## Tech Stack

**Backend:** FastAPI, SQLAlchemy, SQLite, OpenAI API, pdfplumber

**Frontend:** React, Vite, React Router, Axios, Recharts

## Project Structure

```
askLio/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── ai_services.py
│   ├── commodity_groups.py
│   └── seed_data.py
├── frontend/src/
│   ├── components/
│   │   ├── IntakeForm.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DashboardStats.jsx
│   │   └── Profile.jsx
│   ├── App.jsx
│   └── main.jsx
└── start.sh
```

## Setup

### Quick Start

```bash
chmod +x start.sh
./start.sh
```

This starts both backend (port 8000) and frontend (port 5173).


**Environment:**
Add `.env` file in backend folder:
```
OPENAI_API_KEY=your-key-here
DATABASE_URL=sqlite:///./procurement.db
```

## Usage

**New Request:**
- Fill form manually or upload vendor PDF
- AI extracts and classifies automatically
- Save user profile for faster submissions

**Dashboard:**
- Filter by status (All, Open, In Progress, Closed)
- Click "View" for details
- Update status with tracking
- Show/hide statistics sidebar

## API

```
POST   /api/requests              Create request
GET    /api/requests              List all requests
GET    /api/requests/{id}         Get request details
PATCH  /api/requests/{id}/status  Update status
POST   /api/upload-pdf            Extract data from PDF
GET    /api/commodity-groups      List commodity groups
GET    /api/statistics            Dashboard statistics
```

Docs: `http://localhost:8000/docs`

## Database

SQLite with three tables:
- `procurement_requests` - Main requests
- `order_lines` - Line items
- `status_history` - Status change audit trail

Clear database: `rm backend/procurement.db`

Sample data: `python backend/seed_data.py` - loads 20 sample requests into the database.