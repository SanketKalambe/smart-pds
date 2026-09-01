# RationSetu Public Distribution System Management System

> **A Web-Based e-POS Integrated Platform for Transparent Ration Distribution and Digital Consumer Services**  
> *Final-Year Computer Science Engineering Major Project Implementation*

---

## 🌟 Key Features

- 🔐 **Secure Role-Based Access Control**: Government Admin, FPS Distributor, and Consumer portals enforced via JWT middleware.
- 🛡️ **AES-256 Field-Level Aadhaar Encryption**: Aadhaar numbers encrypted at rest in MongoDB; only masked values (`XXXX XXXX 1234`) returned in API responses.
- 📜 **Digital Ration Book**: Interactive household entitlement, family member management, card type classification (AAY / BPL / APL), and transaction history ledger.
- 📅 **Atomic Capacity-Enforced Slot Booking**: Time slot reservation per shop with atomic MongoDB capacity checks (`30 spots/slot`) to eliminate overbooking under concurrent requests.
- 🖥️ **e-POS Hardware Terminal Simulator**: Guided 5-step prototype workflow (`scan` → `verify` → `dispense` → `pay` → `receipt`) with interactive optical & WebAuthn biometric fingerprint authentication.
- 💬 **Assisted Complaint Chatbox**: Keyword & NLP suggestion engine automatically classifying grievance categories with photo/video attachments.
- 💳 **Razorpay Sandbox & QR Receipts**: Digital test payments and server-side generated QR code printable receipts.
- 📊 **Government Admin Suite**: Interactive KYC Verification Queue for pending registrations, stock allocation, helpline settings, and visual distribution analytics charts.

---

## 📁 Repository Structure

```
rationsetu/
├── client/                     # React.js (Vite) + Tailwind CSS + Redux Toolkit
│   ├── src/
│   │   ├── components/         # AadhaarInput, FamilyMemberForm, SlotCalendar, HelplineWidget, FingerprintScannerModal
│   │   ├── pages/
│   │   │   ├── admin/          # AdminDashboard, VerificationQueue, StockAllocation, AdminComplaints, Settings
│   │   │   ├── auth/           # LoginPage, DistributorRegister, ConsumerRegister
│   │   │   ├── distributor/    # DistributorDashboard, EposTerminal, DistributorStock, DistributorSlots
│   │   │   └── consumer/       # ConsumerDashboard, RationBookPage, SlotBookingPage, ComplaintChatbox, History
│   │   ├── redux/              # Redux slices for auth, slots, epos, complaints, admin
      │   ├── services/           # Axios API service layer
│   │   └── routes/             # Role-protected routes
├── server/                     # Node.js + Express.js + MongoDB (Mongoose)
│   ├── api/                    # Vercel Serverless Function entrypoint
│   ├── src/
│   │   ├── config/             # DB connection & default entitlement settings
│   │   ├── controllers/        # Auth, Admin, Distributor, Consumer, e-POS, Slot, Complaint, Payment
│   │   ├── middleware/         # Auth JWT, Role check, Field Encryption, Error Handler, Validator
│   │   ├── models/             # Mongoose schemas for User, Ration Book, Shop, Transactions, Slots, Complaints
│   │   ├── routes/             # Express Routers
      │   └── services/           # e-POS state machine, AES encryption, KYC mock check, QR generator, OTP
│   ├── seed/                   # Seed script with realistic mock data
│   └── tests/                  # Jest + Supertest unit & concurrency test suites
├── docs/                       # Postman API Collection
├── vercel.json                 # Unified Vercel deployment configuration
├── PROTOTYPE_NOTES.md          # Viva defense guide & prototype architectural decisions
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` (or MongoDB Atlas URI)

---

### Step 1: Backend Setup (`server/`)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Setup environment variables (already pre-configured in .env)
# Verify .env contains ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Run database seed script (populates mock registries, admin, shops, slots, consumers)
npm run seed

# Start server in development mode
npm run dev
```
*Backend server will start on `http://localhost:5000`*

---

### Step 2: Frontend Setup (`client/`)

Open a new terminal window:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend app will start on `http://localhost:3000`*

---

## 🔑 Pre-Configured Seed Demo Credentials

| Role | Login Identity | Password | Portal Permissions |
| :--- | :--- | :--- | :--- |
| **Government Admin** | `admin@rationsetu.gov.in` | `Admin@123` | Full access to KYC queue, stock allocations, helpline settings, & analytics |
| **FPS Distributor** | `distributor@example.com` | `Distributor@123` | Access to e-POS machine terminal, shop inventory, & slot schedules |
| **Consumer (Ration Card)** | `consumer@example.com` (or Card `RC100200300`) | `Consumer@123` | Access to Digital Ration Book, Slot Booking calendar, & Complaint Chatbox |

---

## 🧪 Automated Tests Execution

To run the automated Jest test suite:

```bash
cd server
npm test
```

*Runs unit and integration tests for authentication, AES-256 encryption, atomic slot concurrency, and 5-step e-POS state machine.*

---

## 🚀 Live Deployment on Vercel

The project is pre-configured for Vercel deployment with serverless Express API endpoints and Vite React static assets:

1. Import repository `SanketKalambe/rationsetu` on [Vercel](https://vercel.com/new).
2. Set Environment Variable: `MONGODB_URI` = `<Your MongoDB Atlas Connection String>`.
3. Click **Deploy**.
