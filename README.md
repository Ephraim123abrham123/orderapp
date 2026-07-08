# Antigravity - Real-Time Order Management Dashboard

A premium, full-stack order management and customizable analytics system. Built with **FastAPI** (Python), **Next.js** (TypeScript/React), **Tailwind CSS**, and **PostgreSQL**.

## Core Features
1. **Real-Time Synchronisation**: Every connected browser tab receives instant notifications and reactive UI updates on order creation, status transitions, and bulk import processes without page refreshes.
2. **Customisable Analytics Grid**: A drag-and-drop dashboard grid allowing users to reposition, resize, delete, and add new widget cards (KPI summaries, daily revenue trends, status breakdown pie charts, and customer volume tables) that persist in the database.
3. **Bulk Excel/CSV Import**: Upload large `.xlsx` or `.csv` sheets asynchronously. Preview columns client-side, monitor validation status in real-time, and download validation error logs.
4. **Exchange Rate Integration**: Converts currencies (EUR, GBP, CAD, AUD, JPY) to USD dynamically using the ExchangeRate-API with robust local fallbacks.
5. **JWT-Based Authentication**: Custom auth guards, token persistence, and profile loaders.

---

## 🚀 Setup & Launch (Docker Compose)

The easiest way to boot the complete ecosystem (Database, Backend, Frontend) is using Docker.

### 1. Requirements
Ensure you have **Docker** and **Docker Compose** installed.

### 2. Boot up Services
From the project root directory, execute:
```bash
docker-compose up --build
```
This command automatically:
* Installs all dependencies for backend & frontend.
* Starts a **PostgreSQL 15** container on port `5432`.
* Creates the database tables and runs Alembic migrations.
* **Auto-Seeds** the database with a default admin user (`admin` / `password123`) and 20 mock orders with mixed currencies, amounts, and creation times.
* Starts the **FastAPI Backend** on `http://localhost:8000`.
* Starts the **Next.js Frontend** on `http://localhost:3000`.

### 3. Accessing the Application
* **Frontend Dashboard**: Open [http://localhost:3000](http://localhost:3000) in your browser.
* **Sign In Credentials**: 
  * Username: `admin`
  * Password: `password123`
* **Swagger API Docs**: Open [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🛠️ Local Development Manual Setup (No Docker)

If you wish to run the processes locally on your host machine:

### 1. PostgreSQL Database
Ensure you have a PostgreSQL database running. Create a database named `order_dashboard`.
Update the database connection details in `backend/.env` (copy from `.env.example`).

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python 3.11 virtual environment:
   ```bash
   python3.11 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run Alembic migrations and seed database:
   ```bash
   alembic upgrade head
   PYTHONPATH=. python app/db/init_db.py
   ```
5. Run the development server:
   ```bash
   PYTHONPATH=. uvicorn app.main:app --reload --port 8000
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm modules:
   ```bash
   npm install
   ```
3. Boot the Next.js dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

---

## 📡 WebSocket Real-Time Synchronization Logic

Our real-time engine connects every client to a central WebSocket router (`/api/v1/ws`). 
* **Connection Registry**: The backend `ConnectionManager` registers active websockets.
* **Global Notifications**: Any CRUD operations (e.g. updating order status to Completed, creating a new order, completing a bulk spreadsheet upload) trigger the service layer to publish an event mapping.
* **Live Invalidation**: The frontend React Query client listens for these events to instantly trigger query cache invalidations, fetching fresh data and refreshing all charts/grids without page refreshes.
