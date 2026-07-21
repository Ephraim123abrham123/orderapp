#!/bin/bash
# Move to the directory where this script is located
cd "$(dirname "$0")"

echo "============================================="
echo "          Starting orderapp Launcher         "
echo "============================================="

# Start backend FastAPI server in the background
echo "-> Starting Backend API (FastAPI)..."
cd backend
source .venv/bin/activate
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend Next.js dev server in the background
echo "-> Starting Frontend Web App (Next.js)..."
cd frontend
npm run dev -- -H 0.0.0.0 &
FRONTEND_PID=$!
cd ..

echo "---------------------------------------------"
echo "orderapp is now launching!"
echo "• Dashboard URL: http://localhost:3000"
echo "• API Swagger Docs: http://localhost:8000/docs"
echo "---------------------------------------------"
echo "To stop both servers, press [Ctrl + C] in this window."
echo "============================================="

# Capture exit signal and clean up processes
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT
wait
