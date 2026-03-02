# Temple Financial Management System (Demo)

This is a complete working demo of the Temple Financial Management System, featuring automated transaction generation, payroll management, and reporting.

## 🚀 How to Run

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```
*Backend runs on: http://localhost:3001*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on: http://localhost:3000*

## 💎 Features
- **Dashboard**: Real-time financial metrics and activity tracking.
- **Transactions**: Full history with income/expense filtering and soft delete.
- **Payroll**: Automated salary processing with one-click expense generation.
- **Invoicing**: Complete workflow from Quote → Invoice → Income Transaction.
- **Reports**: Data-driven insights with charts and historical profit snapshots.

## 🛠 Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, Prisma ORM, SQLite.
