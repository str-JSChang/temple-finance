# Temple Financial Management System - LLM Build Instructions

## Overview
You are tasked to **build a web-based financial management system** for a Chinese temple.  
Your goal is to implement a **working demo** covering:

- Transactions (income & expense)
- Payroll
- Billing & quotations
- Reports (monthly, seasonal)
- Dashboard

You must produce **modular, end-to-end code** with backend APIs, database schema, and frontend components.  

---

## Requirements

### 1. Tech Stack
- Frontend: React + Vite + Tailwind CSS (component-based)
- Backend: Node.js + Hono (or .NET Core / Java Spring if preferred)
- ORM: Prisma
- Database: MongoDB (or PostgreSQL)
- Charts: Chart.js or Recharts
- Deployment: Localhost demo
- Versioning: Git (modular structure)

---

### 2. Modules & Endpoints

#### 2.1 Transaction Module
**Database Schema**
```ts
Transaction {
  id: string
  type: "income" | "expense"
  category: string // donation, sale, payroll, purchase, event
  amount: number
  payment_method: string // cash, bank, card
  reference: string // receipt/invoice
  date: Date
  season_tag?: string
  created_by: string
}

### API Endpoints
GET /transactions           # list all transactions
POST /transactions          # add new transaction
GET /transactions/:id       # get transaction detail
PUT /transactions/:id       # update transaction
DELETE /transactions/:id    # soft delete


#### Payroll-Module
Employee {
  id: string
  name: string
  role: string
  salary_type: "fixed" | "hourly"
  base_salary: number
  active_status: boolean
}

PayrollRecord {
  id: string
  employee_id: string
  month: string
  total_paid: number
  payment_date: Date
  notes?: string
}

GET /employees
POST /employees
GET /employees/:id
PUT /employees/:id
DELETE /employees/:id

GET /payrolls
POST /payrolls

2.3 Quotes & Invoices

Quote {
  id: string
  client_name: string
  item_list: { name: string, cost: number, price: number }[]
  cost_total: number
  selling_price: number
  expected_profit: number
  status: "draft" | "approved" | "converted"
}

Invoice {
  id: string
  from_quote_id: string
  amount: number
  payment_status: "unpaid" | "paid"
}

GET /quotes
POST /quotes
PUT /quotes/:id
DELETE /quotes/:id

GET /invoices
POST /invoices
PUT /invoices/:id

2.4 Reports & Dashboard

Functionality

Monthly income vs expense

Seasonal income summary

Net profit

Payroll summary

API Endpoints

GET /reports/monthly?month=YYYY-MM
GET /reports/seasonal?season=string

Frontend Pages

Dashboard

Total income, total expense, net profit

Charts for monthly and seasonal trends

Transactions

Table with filter by month/season/category

Form to add transaction

Payroll

Employee management

Payroll creation & listing

Quotes & Invoices

Quote creation

Convert to invoice

Payment status update

Reports

Monthly/seasonal summaries

Export option (optional for demo)

. Data Rules

All financial actions generate a transaction.

Transactions are immutable (soft delete only)

Profit calculation: store cost snapshot in quote/invoice

Payroll → Expense link

No hard deletion of financial data

5. Build Instructions for LLM

Generate database schema first (Prisma / SQL)

Generate backend routes & services for all modules

Generate frontend pages & forms

Generate sample seed data for transactions, employees, quotes

Ensure end-to-end flow:

Add transaction → dashboard updates

Add payroll → transaction module updates

Quote → invoice → pay → transaction module updates

Create modular folder structure:

/modules
  /transaction
  /payroll
  /quotes
  /invoices
  /reports
/frontend
  /components
  /pages

Implement basic styling with Tailwind and charts for dashboard

Demo-ready system should run locally without cloud dependency

6. LLM Output Expectation

Fully working demo (backend + frontend)

REST APIs callable from frontend

Sample data preloaded

Modular code structure for extension

No production-level accounting needed (demo only)
