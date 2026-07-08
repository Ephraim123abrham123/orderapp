# orderapp - Real-Time Order Management Dashboard

A premium, full-stack order management and customizable analytics system. Built with **FastAPI** (Python), **Next.js** (TypeScript/React), **Tailwind CSS**, and **PostgreSQL**.

---

## ⚡ Quick Start: One-Click Launchers

We have packaged the startup processes into double-clickable launchers so you can launch both backend and frontend servers instantly:

###  macOS
Double-click **`orderapp_launcher`** (compiled executable binary) or run:
```bash
./orderapp_launcher
```
*(Alternatively, you can double-click **`run_project.command`** in your Finder).*

### ⊞ Windows
Double-click **`run_project.bat`** to start both servers in separate command windows automatically.

---

## 🚀 Setup & Launch via Docker Compose

The easiest way to boot the complete database, backend, and frontend ecosystem is using Docker.

### 1. Requirements
Ensure you have **Docker** and **Docker Compose** installed.

### 2. Run the Stack
From the project root directory, run:
```bash
docker-compose up --build
```
This command automatically:
* Installs dependencies for backend and frontend.
* Starts a **PostgreSQL 15** container on port `5432`.
* Creates database tables and runs Alembic migrations.
* **Auto-Seeds** the database with a default admin user (`admin` / `admin`) and 20 sample orders.
* Starts the **FastAPI Backend** on `http://localhost:8000`.
* Starts the **Next.js Frontend** on `http://localhost:3000`.

### 3. Accessing the Application
* **Frontend Web App**: Open [http://localhost:3000](http://localhost:3000)
* **Default Log In Credentials**: 
  * **Username**: `admin`
  * **Password**: `admin`
* **Swagger API Docs**: Open [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Local Development Manual Setup (No Docker)

If you wish to run the database, backend, and frontend servers individually:

### 1. PostgreSQL Database
Ensure you have a PostgreSQL database running. Create a database named `order_dashboard`.
Update the database connection details in `backend/.env` (copy from `.env.example`).

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   ```bash
   source .venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations and seed database:
   ```bash
   alembic upgrade head
   PYTHONPATH=. python app/db/init_db.py
   ```
5. Run the server:
   ```bash
   PYTHONPATH=. uvicorn app.main:app --reload --port 8000
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

---

## 📡 WebSocket Real-Time Synchronization Logic

Our real-time engine connects client browsers to a central WebSocket router (`/api/v1/ws`). 
* **Connection Registry**: The backend `ConnectionManager` registers active websockets.
* **Global Notifications**: Any mutation operations (updating order status, creating a new order, completing a bulk import job) trigger the service layer to broadcast a JSON event.
* **Reactive Query Invalidation**: The frontend React Query client captures these events to instantly invalidate affected query caches, refreshing the charts and tables on all connected user dashboards instantly without requiring page reloads or constant network polling.
