# CarbonTrust

CarbonTrust is an AI-powered carbon credit verification and marketplace platform connecting farmers/NGOs, verification authorities, and industry buyers.

## Prerequisites

- Node.js (v18+)
- Python 3.9+
- MongoDB (running locally on port 27017 or a valid `MONGO_URI` environment variable)
- (Optional) Google Earth Engine API keys for real satellite data (otherwise, the AI service falls back to a realistic estimation algorithm).
- (Optional) Mapbox API keys (frontend currently accepts manual input with placeholders for Mapbox components).

## Setup Instructions

### 1. Backend (Node.js)

```bash
cd backend
npm install
```

Start the MongoDB service locally (e.g., via Docker or MongoDB Compass). Then, seed the database with demo data:

```bash
npx ts-node src/seed.ts
```

Run the backend server:

```bash
npm run dev
```
The backend will run on `http://localhost:5000`.

### 2. AI Service (Python Flask)

```bash
cd ai-service
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt # (or run the pip install Flask flask-cors pytesseract Pillow numpy earthengine-api manually)
```

Run the AI service:

```bash
python app.py
```
The AI service will run on `http://localhost:5001`.

### 3. Frontend (React/Vite)

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.

## Demo Flow

1. **Seed Data:** Running the seed script populates the database with a Farmer (John Deere), a Verifier (Global Verifiers Inc.), and a Buyer (TechCorp Industries).
2. **Landing Page:** Navigate to the frontend URL to see the live stats (populated by the seed script if you update the mock fetch).
3. **Login:** Use `john@farm.com` (password: `password123`) to view the Farmer Dashboard and register new land.
4. **Verifier:** Login as `verify@global.org` to see pending land registrations, review AI trust scores, and mint credits.
5. **Buyer:** Login as `sustainability@techcorp.com` to browse the Marketplace and purchase verified carbon credits.

## Architecture

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **AI Verification Service:** Python Flask (Google Earth Engine + PyTesseract OCR)
- **Blockchain Layer:** SHA-256 Hashing for Digital Certificates (Option A)
