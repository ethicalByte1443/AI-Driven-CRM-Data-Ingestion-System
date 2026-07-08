# GrowEasy AI-Powered CSV Importer — Backend

This is the backend service for the GrowEasy AI-Powered CSV Importer. It parses uploaded CSV files and maps them to a structured CRM record schema using Gemini AI (or a local heuristic mock fallback).

## Tech Stack
* **Node.js & Express**
* **TypeScript**
* **Multer** (for memory-only file uploads)
* **csv-parse** (for robust CSV parsing)
* **Zod** (for API request and AI output validation)
* **@google/generative-ai** (Gemini API SDK)
* **Pino & Pino-HTTP** (structured JSON logging)
* **Vitest** (fast test framework)

---

## Getting Started

### 1. Installation
Navigate to the `backend` directory and install dependencies:
```bash
cd backend
npm install
```

### 2. Environment Setup
Copy the environment template and configure your keys:
```bash
cp .env.example .env
```

Open `.env` and configure:
```env
PORT=5001
FRONTEND_URL=http://localhost:3000
AI_PROVIDER=gemini # Use 'gemini' for real extraction or 'mock' for local testing
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
AI_BATCH_SIZE=25
MAX_FILE_SIZE_MB=5
```

### 3. Running the Server
Start the development server with hot-reload:
```bash
npm run dev
```

For production builds:
```bash
npm run build
npm start
```

### 4. Running Tests
Run the comprehensive Vitest suite:
```bash
npm test
```

---

## API Documentation

### 1. Health Check
Checks if the server is healthy.

* **URL:** `/health`
* **Method:** `GET`
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "GrowEasy CSV Importer Backend is running"
}
```

### 2. Preview CSV Upload
Accepts any valid CSV file, parses it, and returns the list of headers and the first 10 rows for user review. No AI calls are made at this stage.

* **URL:** `/api/import/preview`
* **Method:** `POST`
* **Content-Type:** `multipart/form-data`
* **Body:**
  * `file`: The CSV file (must be `.csv` and under 5MB).
* **Curl Example:**
```bash
curl -X POST http://localhost:5001/api/import/preview \
  -F "file=@sample.csv"
```
* **Response (200 OK):**
```json
{
  "success": true,
  "fileName": "leads.csv",
  "totalRows": 150,
  "headers": ["Full Name", "Phone", "Email"],
  "previewRows": [
    {
      "Full Name": "John Doe",
      "Phone": "9876543210",
      "Email": "john@example.com"
    }
  ],
  "records": [ ... ]
}
```

### 3. Confirm Import
Receives the parsed records, splits them into batches of size `AI_BATCH_SIZE`, and maps them to the CRM schema using Gemini AI.

* **URL:** `/api/import/confirm`
* **Method:** `POST`
* **Content-Type:** `application/json`
* **Body:**
```json
{
  "records": [
    {
      "Full Name": "John Doe",
      "Phone": "9876543210",
      "Email": "john@example.com"
    }
  ]
}
```
* **Curl Example:**
```bash
curl -X POST http://localhost:5001/api/import/confirm \
  -H "Content-Type: application/json" \
  -d '{"records":[{"Full Name":"John Doe","Phone":"9876543210","Email":"john@example.com"}]}'
```
* **Response (200 OK):**
```json
{
  "success": true,
  "totalImported": 1,
  "totalSkipped": 0,
  "importedRecords": [
    {
      "created_at": "",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "country_code": "+91",
      "mobile_without_country_code": "9876543210",
      "company": "",
      "city": "",
      "state": "",
      "country": "",
      "lead_owner": "",
      "crm_status": "GOOD_LEAD_FOLLOW_UP",
      "crm_note": "",
      "data_source": "",
      "possession_time": "",
      "description": ""
    }
  ],
  "skippedRecords": []
}
```

---

## Validation & Business Rules

* **Allowed CRM Statuses:** `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE` or empty string. Mapped dynamically by Gemini.
* **Allowed Data Sources:** `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots` or empty string.
* **Mandatory Contact Info:** Any record that has neither an email nor a phone number is skipped with the reason `Missing both email and mobile number`.
* **Duplicates & Multi-value fields:**
  * If multiple emails or phone numbers are found, the first is mapped to the standard field, and remaining values are appended to `crm_note`.
* **Date Normalization:** Dates are parsed and output as clean ISO strings. If invalid, they default to empty string.
