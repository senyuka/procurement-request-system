#!/bin/bash

echo "Starting askLio Procurement System..."
echo ""

# Check if backend virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    cd ..
else
    echo "Virtual environment already exists"
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
else
    echo "Frontend dependencies already installed"
fi

echo ""
echo "======================================"
echo "Starting Backend Server..."
echo "======================================"
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

echo ""
echo "======================================"
echo "Starting Frontend Development Server..."
echo "======================================"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "======================================"
echo "askLio Procurement System is running!"
echo "======================================"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
