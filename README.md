# DukaanIQ Enterprise — Retail AI SaaS & Smart POS Platform

> **Playful Trust: Retail Edition** — AI-powered retail operating system combining high-speed POS terminal operations, automated inventory forecasting, CSV bulk catalogue imports, dynamic price optimization, GST tax compliance, and multi-location store intelligence.

---

## 🌟 Overview

**DukaanIQ** is a modern, enterprise-grade retail ERP and POS application designed for retailers, store operators, merchandisers, and CFOs. It bridges corporate reliability (auditable GST tax calculations, rigorous inventory thresholds, RFC 4180 CSV imports) with an approachable, tactile user experience ("Playful Trust" design system).

---

## 🚀 Key Modules & Capabilities

### 1. ⚡ High-Speed POS Terminal (`F2`)
- **Keyboard-driven barcode scanner** input with rapid product search.
- **Dynamic cart calculation** with multi-tier GST rates (0%, 5%, 12%, 18%, 28%).
- **Multi-tender split payments**: Cash with change calculation, UPI QR generation, Debit/Credit Card, and Store Credit.
- **Instant thermal receipt rendering** and invoice printing.
- **Real-time cashier AI cross-sell recommendations** powered by Google Gemini.

### 2. 📦 Inventory & Demand Forecasting (`F3`)
- **Real-time multi-location stock levels** (Delhi Flagship, Mumbai Hub, Bangalore Store, Warehouse).
- **Critical Stock Alerts**: Real-time detection of items below safety stock thresholds with 1-click PO generation and supplier reordering.
- **RFC-4180 Compliant CSV Bulk Uploader**:
  - Drag-and-drop or raw CSV paste.
  - Smart column mapping with tolerance for varied header aliases (`SKU`, `Stock`, `Price`, `Barcode`, `Min_Threshold`).
  - Validation preview table with error diagnostics and template download.
  - Flexible import modes: Replace stock, additive adjustments, or metadata-only updates.
- **AI-Powered Demand Curve Projections**: Predictive 30-day run-rate, stockout risk dates, and replenishment advice.

### 3. 🏷️ Dynamic Pricing Optimizer (`F5`)
- Margin-guarded price recommendations based on sales velocity and elasticity.
- Psychological price point tuning (e.g., ₹X99, ₹X49, ₹X90).
- Projected sales uplift vs. gross margin trade-off simulations.

### 4. 🤖 Grounded AI Business Copilot (`F9`)
- Natural-language queries grounded in live store data (revenue, margins, stockouts, shifts).
- Instant evidence citations with clickable action triggers.

### 5. 🧾 GST Tax & Financial Compliance (`F7`)
- Indian GST automated reporting (GSTR-1 outward supplies, GSTR-3B monthly liabilities).
- HSN-wise summary tables and CSV export.

### 6. 👥 Customer CRM & Loyalty (`F6`)
- RFM segmentation (High Value, Regular, Lapsed, New).
- Customer purchase history and loyalty reward balances.

### 7. 🚚 Supply Chain & Purchase Orders (`F4`)
- Supplier directory, automated reorder drafts, lead-time tracking, and receiving workflows.

### 8. ⏰ Workforce Shifts & Cash Reconciliation (`F8`)
- Shift opening/closing balance tracking, physical cash counts, and discrepancy flags.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons
- **State Management**: React Context (`AppContext`) with offline simulation & local audit trails
- **Backend**: Node.js, Express, tsx
- **AI Integration**: `@google/genai` TypeScript SDK (Gemini 2.5/3.0 models)
- **Tooling**: Vite 6, RFC 4180 CSV parsing engine, Canvas confetti

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or bun

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (optional for Gemini AI features)
cp .env.example .env
# Add your GEMINI_API_KEY if desired:
# GEMINI_API_KEY=your_gemini_api_key_here

# 3. Start development server
npm run dev
```

The app will be running at `http://localhost:3000`.

### Building for Production
```bash
npm run build
npm start
```
