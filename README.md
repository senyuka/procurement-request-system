# askLio Procurement System

A web-based procurement request management system that allows users to create, track, and manage procurement requests with AI-powered document extraction and automatic commodity group classification.

## Features

### 1. Procurement Request Intake
- Create new procurement requests with detailed information
- Upload vendor offer PDFs for automatic data extraction using OpenAI
- AI-powered automatic commodity group classification
- Dynamic order lines with automatic total calculation
- Form validation to ensure data quality

### 2. Request Dashboard
- View all procurement requests in one place
- Filter requests by status (Open, In Progress, Closed)
- Update request status with full history tracking
- View detailed information for each request
- Track commodity group classifications

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Local database
- **OpenAI API** - PDF extraction and classification
- **pdfplumber** - PDF text extraction

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client

## Project Structure

```
askLio/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── models.py              # Database models
│   ├── schemas.py             # Pydantic schemas
│   ├── database.py            # Database configuration
│   ├── ai_services.py         # OpenAI integration
│   ├── commodity_groups.py    # Commodity group definitions
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── IntakeForm.jsx      # Request creation form
│   │   │   ├── IntakeForm.css
│   │   │   ├── Dashboard.jsx       # Request overview
│   │   │   └── Dashboard.css
│   │   ├── App.jsx                 # Main app component
│   │   └── App.css
│   ├── package.json
│   └── vite.config.js
└── caseStudy/
    └── askLio-challenge/       # Sample vendor PDFs
```

## Setup Instructions

### Prerequisites
- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- On macOS/Linux:
```bash
source venv/bin/activate
```
- On Windows:
```bash
venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. The `.env` file is already configured with the OpenAI API key. If you need to modify it:
```
OPENAI_API_KEY=your-api-key-here
DATABASE_URL=sqlite:///./procurement.db
```

6. Run the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory (in a new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

### Creating a New Request

1. Navigate to the home page (New Request)
2. **Option A - Manual Entry:**
   - Fill in all required fields
   - Add order lines with item details
   - Submit the request

3. **Option B - PDF Upload:**
   - Click "Upload Vendor Offer" and select a PDF
   - The system will automatically extract:
     - Vendor name and VAT ID
     - Department information
     - Order line items with prices and quantities
     - Total cost
   - Review and adjust the extracted data if needed
   - Submit the request

4. **Automatic Classification:**
   - The system will automatically classify the request into the appropriate commodity group using AI
   - You can see the classification result in the dashboard

### Managing Requests

1. Navigate to the Dashboard
2. Filter requests by status:
   - All
   - Open
   - In Progress
   - Closed
3. Click "View" on any request to see details
4. Update the status by clicking the status buttons (Open, In Progress, Closed)
5. All status changes are tracked with timestamps

## API Endpoints

### Procurement Requests
- `POST /api/requests` - Create a new request
- `GET /api/requests` - Get all requests
- `GET /api/requests/{id}` - Get a specific request
- `PATCH /api/requests/{id}/status` - Update request status

### Document Upload
- `POST /api/upload-pdf` - Upload and extract data from PDF

### Commodity Groups
- `GET /api/commodity-groups` - Get all commodity groups

## Features in Detail

### PDF Extraction
The system uses OpenAI's GPT-4 to extract structured data from vendor offer PDFs:
- Vendor information (name, VAT ID)
- Department/recipient information
- Order line items with descriptions, prices, quantities, and totals
- Overall total cost

### AI Commodity Classification
Based on the request title and order line items, the system automatically classifies each request into one of 50 commodity groups across 7 categories:
- General Services
- Facility Management
- Publishing Production
- Information Technology
- Logistics
- Marketing & Advertising
- Production

### Status Tracking
Every status change is recorded with:
- Previous status
- New status
- Timestamp
- Optional notes

This provides a complete audit trail for each procurement request.

## Sample PDFs

Sample vendor offer PDFs are available in `caseStudy/askLio-challenge/` for testing the PDF extraction feature.

## Development

### Backend Development
The backend uses FastAPI with automatic API documentation. Visit `http://localhost:8000/docs` for interactive API documentation.

### Frontend Development
The frontend uses React with Vite for fast hot module replacement during development.

## Database

The application uses SQLite for local development. The database file (`procurement.db`) is created automatically when you first run the backend.

### Database Schema

- **procurement_requests**: Main request table
  - Request information (requestor, title, vendor, etc.)
  - Commodity group classification
  - Status tracking
  - Timestamps

- **order_lines**: Order line items
  - Product descriptions
  - Pricing information
  - Quantities and units

- **status_history**: Status change tracking
  - Old and new status
  - Change timestamps
  - Notes

## Future Enhancements

Potential improvements for production:
- User authentication and authorization
- Role-based access control
- Email notifications for status changes
- Advanced reporting and analytics
- Export to Excel/CSV
- Attachment storage for vendor offers
- Multi-language support
- Advanced search and filtering

## License

This project was created as a challenge for askLio.
