DukaanIQ: Retail AI Platform
 
AI billing and shop management website for Indian retail shops. Bill faster, never run out of stock, price smarter and keep GST clean, all from one place.
 
---
 
The Problem
 
Most Indian retail shops still run on guesswork.
 
1. Fast selling items run out and sales are lost.
2. Slow items pile up and money gets stuck on the shelf.
3. Prices are set by feel, not by data.
4. GST bills, returns and cash counts take hours.
5. Owners have no time to read reports.
   
Our Solution
 
DukaanIQ puts billing, stock, buying, pricing, customers, staff and GST in one simple website. On top of it sits an AI layer that reads the shop's own data and tells the owner what to do next: what to reorder, which price to change, which customer to call and which bill looks wrong.
 
The AI only suggests. The owner always presses Approve. Tax maths, payroll and totals run on fixed code, so numbers stay correct.
 
Who it is for: retailers, store managers, cashiers and owners, from a single counter shop to a few branches.
 
---
 
Main Modules
 
1. POS Billing
- Keyboard driven barcode scanning with fast product search.
- Cart with GST rates of 0, 5, 12, 18 and 28 percent.
- Split payments: Cash with change, UPI QR, Debit or Credit Card and Store Credit.
- Instant receipt and invoice printing.
- New Customer option (name, contact number, optional address) and returns with credit notes.
- AI Cashier Assistant with add on suggestions powered by Google Gemini.
2. Inventory and Demand Forecasting 
- Live stock for each location (Delhi Flagship, Mumbai Hub, Bangalore Store, Warehouse).
- Critical stock alerts with one click purchase order and supplier reorder.
- CSV bulk upload that follows RFC 4180: drag and drop or paste, smart column mapping (`SKU`, `Stock`, `Price`, `Barcode`, `Min_Threshold`), preview with error checks, template download, and import modes (replace stock, add to stock, or update details only).
- AI demand projections: 30 day run rate, stockout dates and reorder advice.
3. Prices 
- AI price suggestions that protect margin, using sales speed and price sensitivity.
- Price endings such as 99, 49 and 90.
- Tabs for Suggestions, All Prices, Price History, Rules and Offers.
- Price Test, Margin Guard, festival offers, slow stock clearance and bundle price ideas.
4. Buying and Suppliers 
- Purchase orders with status steps, Receive Goods checks, supplier directory, supplier scorecards and payables.
- AI drafted purchase orders and delivery risk warnings.
5. Customers and Loyalty
- Customer groups: High Value, Regular, Lapsed and New.
- Total spend, average order value, store visits, loyalty points and unpaid amounts.
- Payment reminders and promotion messages by WhatsApp or SMS link.
6. Accounts and GST
- Invoices, bills and reports in one place.
- CGST, SGST and IGST collected, total expenses, ITC, net GST payable and profit and loss.
- GSTR1 outward supplies, GSTR3B monthly liability and HSN wise summary with CSV export.
7. Staff, Shifts and Cash
- Shift opening and closing, physical cash count and difference flags.
- Staff sales, performance score, customer rating, top performer, attendance and payroll.
- Roles: Owner, Manager and Cashier, each with their own access.
8. Reports and Analytics
- Sales, bills, performance, product, stock, purchase, customer, staff, GST and profit and loss reports.
- Best selling and least selling items, sales by category, hour, day and payment mode.
9. Integrations
- Payment: Pine Labs POS, Paytm EDC, Razorpay POS.
- ERP and tax: Tally Prime, SAP Business One, Zoho Books, Shopify, E Way Bill Portal.
- Search, filters and a simple 4 step connection guide.
---
 
AI Features
 
The 10 main AI tools
 
| - | AI tool | Where | What it does |
|---|---------|-------|--------------|
| 1 | AI Business Copilot (F9) | Home, AI Helper | Answers questions about live store data and shows alert cards such as "Item X will run out in 3 days. Draft a purchase order?" with Approve and Dismiss. |
| 2 | AI Inventory Forecasting | Stock | Predicts days of stock left from sales speed, safety stock and supplier delivery time. Tags each item Safe, Watch or Urgent. |
| 3 | AI Inventory Management | Stock | Gives a stock health score and lists low stock, slow moving and overstocked items with a one line suggestion. |
| 4 | AI Purchase Recommendations | Buying | Drafts purchase orders by supplier using sales speed, delivery time and pack size. Edit, Approve or download as PDF. |
| 5 | AI Pricing | Prices | Tests price options, shows expected sales and profit, marks the best one and explains why. |
| 6 | AI Sales Forecast | Analytics | Shows expected sales for the next 7 and 30 days with best case and normal case, plus short insights. |
| 7 | AI Customer Insights | Customers | Groups customers into Frequent Regulars, High Spenders, Credit Due and Not Seen Lately, with a suggested action for each. |
| 8 | AI Accounting Insights | Accounts | Checks GST bills for wrong HSN, wrong tax split, missing details and unusual bills. |
| 9 | AI Cashier Assistant | Billing | Voice or text item search, add on item ideas and low stock notes at the counter. |
| 10 | AI Smart Billing | Billing | Fast checkout with auto filled item details and a fresh UPI QR for every bill. |
 
AI on other pages
 
Prices
1. Price Test: three price options with expected sales and profit.
2. Market Price Check: the owner types a competitor price and AI compares it. No fake live data.
3. Slow Stock Clearance: price cut or bundle ideas for items that are not selling.
4. Bundle Price Ideas: combo prices for items bought together.
Staff
1. AI Staff Insights: weekly summary with strengths and one thing to improve.
2. AI Cash Check: flags patterns for review, in calm words, with the data shown.
3. AI Shift Planner: suggests shifts from busy days and hours.
4. AI Incentive Advisor: suggests fair targets and incentive slabs.
5. AI Payroll Check: warns about mistakes before payroll is approved.
6. AI Training Tips: short tips for each person.
7. AI Staff Copilot: chat for staff questions.
Buying
1. AI Supplier Insights: best supplier for each item from past orders.
2. AI Price Compare: compares rates from our own purchase history.
3. AI Delivery Risk: warns which orders may be late.
4. AI Bill Check: compares order, received goods and supplier bill.
5. AI Order Message: drafts a polite WhatsApp or email text to the supplier.
6. AI Buying Copilot: chat for buying questions.
How we keep the AI safe and honest
 
1. Grounded in shop data. Every answer comes from the shop's own sales, stock and customer data, and shows a short "Why this answer" line.
2. wner stays in control. AI only suggests. Nothing is saved, sent or changed until the owner approves.
3. Fixed code for money. GST, payroll, totals and scores are calculated by normal code, never by AI.
4. Checked output. AI replies are requested as JSON and validated before they are shown.
5. Key stays on the server. The Gemini API key is used only in the Node.js backend, never in browser code.
6. No made up data. If data is missing, the app shows an empty state instead of inventing numbers.
---
 
Technology Stack
 
- Frontend: React 19, TypeScript, Tailwind CSS v4, Lucide React icons
- State: React Context (`AppContext`) with offline simulation and local audit trail
- Backend: Node.js, Express, tsx
- AI: Google Gemini through the `@google/genai` TypeScript SDK
- Platform: Google Cloud for hosting, Google AI Studio for building and prompt testing
- Tooling: Vite 6, RFC 4180 CSV parser, Canvas confetti
---
 
Getting Started
 
Prerequisites
- Node.js 18 or higher
- npm or bun
Install and run
```bash
1. Install dependencies
npm install
 
2. Add your environment variables
cp .env.example .env
Open .env and add your key:
GEMINI_API_KEY=your_gemini_api_key_here
 
3. Start the development server
npm run dev
```
 
The app runs at `http://localhost:3000`.
 
Never upload your `.env` file or API keys to GitHub.
 
Build for production
```bash
npm run build
npm start
```
 
---
 
Demo Data
 
The prototype runs on demo data for the Delhi Flagship shop in Connaught Place. Figures shown in the app are demo figures, not real shop results.
 
Roadmap
 
1. Move shop data to a cloud database.
2. Live connections with Tally Prime, Zoho Books, SAP Business One, Shopify, Pine Labs, Paytm and Razorpay.
3. AI voice agent to track purchase orders.
4. Pilot with real retail shops and publish the results.
---
 
Built by Team Kaal Bhairav for the Google Cloud AI Builder Cup.
 
