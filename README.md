# Maharashtra Traders — Hardware Catalog Search System

A robust, modern full-stack web application for hardware distributors. Business owners can upload large catalog brochures in PDF format, automatically parse and extract structured product details (Name, Model, Price, Specifications), and search the resulting inventory instantly. 

This application features a dual-persistence layer. It connects securely to **MongoDB Atlas via Mongoose**, but automatically falls back on an **offline JSON flat-file database** if credentials are not configured, guaranteeing that the dashboard, parsing pipelines, and search overlays remain fully functional immediately out-of-the-box.

---

## 🚀 Key Features

* **Administrative JWT Authentication**: Secure credentials-guarded navigation access (`admin@gmail.com` / `admin12345`).
* **KPI Metrics Dashboard**: High-level statistical bento cards tracking catalog counts, product nodes, recent uploads history, and database status reports.
* **Intelligent PDF Catalog Parser**: Directly extracts text tables page-by-page from uploads using `pdf-parse` and translates raw sentences into structured hardware specifications (Name, Model, Price, Description, and page indices). Includes robust heuristic fallback rules to catch non-standard structures.
* **Instantaneous Filter Search**: High-performance regex query matchers for product names or model tags (case-insensitive) displaying skeleton screens.
* **Comparison Placeholder Layouts**: A single-click calculated pricing assessment compared against Amazon India, IndiaMART bulk averages, and general regional suppliers.
* **Cross-Device Fluidity**: Fully responsive layout matching standard hardware branding.

---

## 🛠️ Project Folder Structure

The system uses a clean, production-grade directory separation:

```text
maharashtra-traders-search/
│
├── lib/
│   └── db.ts                  # Unified MongoDB Atlas & JSON disk-file database manager
│
├── utils/
│   └── productParser.ts       # Reusable text-brochure product mining parser
│
├── src/                       # React 19 Frontend Code
│   ├── components/            # Modular frontend screens & helper components
│   │   ├── DBStatusBadge.tsx         # Database online/offline mode status widget
│   │   ├── LoginView.tsx             # Interactive credential entrance panel
│   │   ├── DashboardView.tsx         # Bento statistical count report screen
│   │   ├── UploadView.tsx            # Drag & drop multi-stage PDF uploader
│   │   ├── SearchView.tsx            # Live inventory query searchboard
│   │   └── ProductDetailsModal.tsx   # Detailed specs sheet and price comparison modal
│   ├── types.ts               # Shared TypeScript typings
│   ├── App.tsx                # Main view router and desktop/mobile navigation
│   ├── index.css              # Global Tailwind v4 layout directives
│   └── main.tsx               # Primary ReactDOM tree mounter
│
├── uploads/                   # Local staging file folder for PDF files
├── dist/                      # Statically compiled production assets directory
├── .env.example               # Environmental definitions checklist
├── .env.local                 # Local secret credentials (user modified)
├── package.json               # Backend & frontend scripting dependencies
├── server.ts                  # Express.js API routes & Vite dev server middleware
└── README.md                  # Detailed deployment instructions
```

---

## 📂 Backend API Routes

The backend Express.js server models standard API controller endpoints:

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| **POST** | `/api/auth/login` | Validates admin email & password, yields verification JWT | No |
| **GET** | `/api/db-status` | Audits state of MongoDB Atlas vs local storage layer | No |
| **POST** | `/api/catalog/upload` | Multer-stages PDF file, extracts page strings, inserts keys to DB | **Yes (JWT)** |
| **GET** | `/api/catalogs` | Queries all successfully uploaded pdf catalog profiles | No |
| **GET** | `/api/products` | Lists first 40 default indexed products | No |
| **GET** | `/api/products/search?q=...` | Executes case-insensitive regex query over product titles/models | No |
| **GET** | `/api/products/:id` | Detailed profiles of selected product + related items | No |
| **GET** | `/api/products/compare/:id` | Generates randomized, realistic comparison tables scaled to base | No |

---

## 💻 Running the Application Locally

Follow these instructions to run the full-stack system in a local sandbox workspace:

### 1. Prerequisites
Verify that **Node.js** (v18.x or newer) and **npm** are installed on your machine.

### 2. Installation
Extract the zip folder, navigate into the project workspace, and install the library requirements:
```bash
npm install
```

### 3. Setting Up Environment Variables
Create a file named `.env.local` to house your database and secret definitions:
```env
# MongoDB Atlas Database Connection URI (Optional - defaults to offline file-db if absent)
MONGO_URI="mongodb+srv://admin:pass@cluster.mongodb.net/maharashtra_traders"

# Cryptographic token key for user cookies
JWT_SECRET="maharashtra-traders-secure-jwt-secret-key-2026"
```

### 4. Direct Development Boot
Start both the React compilation compiler and the backend server concurrently on port `3000`:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 5. Compiling a Production Build
Compile high-performance production code:
```bash
# Compiles React to dist/ and bundles Express via esbuild into dist/server.cjs
npm run build

# Runs compiled production server
npm run start
```

---

## 📊 Setting Up MongoDB Atlas (Optional)

If you wish to secure durable cloud storage, configure a cloud cluster:
1. Register for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new shared cluster (M0 free-tier is recommended).
3. Under **Database Access**, create an administrative user with read/write credentials.
4. Under **Network Access**, whitelist your IP address or authorize `0.0.0.0/30` to accept Cloud Run / Vercel cloud server connections.
5. Retrieve your cluster connection URI string, swap the `<db_username>` and `<db_password>` templates, and paste it under `MONGO_URI` in `.env.local`.

---

## ☁️ Deployment instructions on Vercel

To host this app on Vercel using serverless endpoints:
1. Push your local files to a private repository on GitHub, GitLab, or Bitbucket.
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Select your repository. Under **Build & Development Settings**, configure Vercel's output parameters to recognize root build actions or host it standardly as a single Node deployment.
4. Add your Environment variables (`MONGO_URI`, `JWT_SECRET`) in the Vercel Configuration Settings.
5. Click **Deploy**. Vercel will bundle and dispatch your full-stack endpoint on a secure URL.

---

## 📥 PDF Catalog Uploading Instructions

To evaluate the parsing pipelines of Maharashtra Traders:
1. Launch the app and sign in using our default evaluator account:
   * **Email**: `admin@gmail.com`
   * **Password**: `admin12345`
2. Navigate to **Upload Catalog** in the left sidebar menu.
3. Type an intuitive business folder name (e.g., `Godrej Latches & Fasteners`).
4. Select or drop your product PDF.
5. Press **Validate and Start PDF Extraction**.
6. Navigate to **Search Inventory** to execute query filters across your uploaded metrics instantly!
