@echo off
title orderapp Launcher
echo =============================================
echo           Starting orderapp Launcher         
echo =============================================

:: Start backend in a new cmd window
echo -> Starting Backend API (FastAPI)...
start "orderapp Backend (FastAPI)" cmd /k "cd backend && .venv\Scripts\activate && set PYTHONPATH=. && uvicorn app.main:app --port 8000"

:: Start frontend in a new cmd window
echo -> Starting Frontend Web App (Next.js)...
start "orderapp Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo ---------------------------------------------
echo orderapp is launching!
echo * Dashboard URL: http://localhost:3000
echo * API Swagger Docs: http://localhost:8000/docs
echo ---------------------------------------------
echo To close, simply close the spawned terminal windows.
echo =============================================
pause
