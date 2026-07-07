# GrowEasy AI-Powered CSV Importer

An intelligent lead ingestion system designed to import, preview, and extract CRM leads from arbitrary CSV structures using Gemini AI. It supports custom headers, multiple formats, validation rules, batch processing, and robust error recovery.

---

## Repository Structure

```txt
AI-Driven-CRM-Data-Ingestion-System/
├── backend/               # Express + TypeScript API server
│   ├── src/
│   │   ├── config/        # Environment configurations
│   │   ├── controllers/   # Route controller handlers
│   │   ├── middleware/    # Multer upload & global error handlers
│   │   ├── routes/        # Express routers
│   │   ├── services/      # CSV parse, Gemini AI & batch logic
│   │   ├── types/         # TypeScript declarations
│   │   ├── utils/         # Helper functions (phone, date, batch, JSON)
│   │   ├── validators/    # Zod body and AI output validator schemas
│   │   └── tests/         # Unit and integration test suites
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── ui-frontend/           # Next.js + Tailwind React application (scaffolded next)
├── README.md              # Project monorepo guide (this file)
└── LICENSE                # Project license
```

---

## Tech Stack Overview

### Backend
* **Runtime & Framework:** Node.js, Express, TypeScript
* **CSV Parsing:** `csv-parse` (Streaming parser)
* **AI Orchestration:** `@google/generative-ai` (Gemini SDK)
* **Validation:** `Zod` (Request schema & AI response validator)
* **Testing:** `Vitest` (ESM native runner)
* **Security:** `helmet`, CORS (Strict whitelist + development bypass)

### Frontend (To be built next)
* **Framework:** Next.js (App Router), React, TypeScript
* **Styling:** Tailwind CSS (GrowEasy Design System)
* **CSV Parser:** `PapaParse`
* **HTTP Client:** `Axios`

---

## Features & Business Logic

1. **AI Column Mapping:** Recognizes contact names, mobile numbers, email addresses, dates, and other CRM fields regardless of the original CSV headers.
2. **Batch Processing:** Splits imports into configured batch sizes (`AI_BATCH_SIZE`) to stay within LLM token limits and process long files smoothly.
3. **Resilient Batches:** If a single batch fails to process, the system automatically skips it with a descriptive reason, continuing with other batches.
4. **Zod Post-Validation:** All AI outputs are filled with default blank strings, parsed, and normalized:
   * **Mandatory contacts:** Records must have either `email` or a `mobile_without_country_code` to be imported. If missing both, they are routed to `skippedRecords` with the reason `Missing both email and mobile number`.
   * **Status Normalization:** Maps status strings dynamically to: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, or `SALE_DONE`.
   * **Date Normalization:** Formats input dates to JavaScript-compatible ISO formats or clears them.
   * **Phone Normalization:** Corrects prefix codes (handles `+91`, `91`, leading `0`, and US/Canada `+1` prefixing).
   * **Multi-Value Fields:** Extracts primary contact channels; secondary emails and phone numbers are appended to `crm_note`.

---

## Installation & Setup

### Deployed Application (Render/Railway/Vercel)
* **Frontend:** [Placeholder Link]
* **Backend:** [Placeholder Link]

### Running Locally

#### 1. Backend Setup
Navigate to `/backend`, set up environment variables, and run:
```bash
cd backend
npm install
cp .env.example .env # Configure GEMINI_API_KEY inside .env
npm run dev
```
For more detailed backend APIs and curls, refer to [backend/README.md](file:///c:/Users/Aseem/Desktop/GIT/AI-Driven-CRM-Data-Ingestion-System/backend/README.md).

#### 2. Frontend Setup (Coming Next)
Navigate to `/ui-frontend`, set up environment variables, and run:
```bash
cd ui-frontend
npm install
cp .env.local.example .env.local
npm run dev
```

---

## Known Limitations & Future Improvements
* **Rate Limits:** Free-tier Gemini API keys might experience rate limits (`429 Too Many Requests`) for extremely large CSVs. Implementing exponential backoff retries is a planned upgrade.
* **Complex Multi-line Rows:** While escaped linebreaks (`\n`) are supported, highly nested structures can trigger LLM JSON format deviation. Output shapes are fully protected by Zod schemas.

---

## Final Submission Details
* **Position Applied For:** Software Developer Full-Time / Software Developer Intern
* **Email Contact:** varun@groweasy.ai
* **Submission Deadline:** 12 July 2026
* **Repository Link:** https://github.com/ethicalByte1443/AI-Driven-CRM-Data-Ingestion-System