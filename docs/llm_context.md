# LLM Context: Temple Financial Management System (TFMS)

This document provides a distilled, machine-readable overview of the TFMS codebase. It is designed to help AI agents understand the system's architecture, data models, and business logic without needing to parse the entire codebase.

---

## 🚀 1. Core Identity & Goals
TFMS is a **modular financial management system** for religious organizations.
- **Goal**: Track income/expenses, manage payroll, handle quotes/invoices, and generate financial reports.
- **Key Principle**: Every financial event (paying payroll, paying an invoice) must result in a `Transaction` entry in the main ledger.

## 🛠 2. Technology Stack
- **Frontend**: React 19 (Vite 7), Tailwind CSS v4, `react-router-dom` v7, `axios`, `recharts`, `lucide-react`.
- **Backend**: Node.js, Express.
- **Database**: SQLite via **Prisma ORM**.
- **Monorepo**: Managed via `pnpm` workspaces (though standard `npm` is used in subdirectories in some docs).

## 📁 3. Directory Structure
```text
.
├── backend/
│   ├── index.js          # Main entry point & API Router
│   ├── lib/
│   │   └── prisma.js     # Singleton Prisma Client
│   ├── modules/          # Domain-specific logic & routes
│   │   ├── transaction/  # Main ledger
│   │   ├── payroll/      # Employee payments
│   │   ├── quotes/       # Estimates/Quotes
│   │   ├── invoices/     # Billing/Payments
│   │   └── reports/      # KPI Aggregation
│   └── prisma/
│       ├── schema.prisma # DB Models
│       └── seed.js       # Sample data
└── frontend/
    ├── src/
    │   ├── components/   # UI Shell (Sidebar, Layout)
    │   ├── pages/        # Dashboard, Transactions, etc.
    │   └── services/     # Axios API configuration
```

## 📊 4. Data Models & Constraints

### Key Entities
| Entity | Role | Constraints |
|---|---|---|
| **Transaction** | The Ledger | All income/expense paths lead here. `type` is "income" or "expense". |
| **PayrollEntry**| Employee Pay | Linked to a `Transaction` upon payment. |
| **Quote** | Estimates | Can be converted into an `Invoice`. |
| **Invoice** | Billing | Generates a `Transaction` upon payment. |

### Core Rules
1. **Soft Deletes**: Every table has a `deleted` boolean. **NEVER** use `DELETE`. Always query with `where: { deleted: false }`.
2. **JSON Fields**: `Quote.items` and `Invoice.items` are stored as **JSON Strings** in SQLite. Always `JSON.parse` on read and `JSON.stringify` on write.
3. **Reference Strings**: Transactions use a `reference` field (e.g., `"payroll:uuid"` or `"invoice:uuid"`) to link back to originating modules.

## ⚙️ 5. Automated Side-Effects (Business Logic)
Agents MUST preserve these automated flows:

- **Payroll Payment (`POST /api/payroll/:id/pay`)**:
    1. Verifies entry status is "pending".
    2. Creates a `Transaction` (type: "expense", category: "Payroll").
    3. Updates `PayrollEntry` to "paid" and links `transactionId`.
- **Invoice Payment (`POST /api/invoices/:id/pay`)**:
    1. Verifies invoice is "unpaid".
    2. Creates a `Transaction` (type: "income", category: "Invoice Payment").
    3. Updates `Invoice` to "paid" and links `transactionId`.
- **Quote Conversion (`POST /api/quotes/:id/convert`)**:
    1. Clones Quote items/details into a new `Invoice`.
    2. Updates Quote status to "converted".

## ⚠️ 6. Implementation Notes for LLMs
- **Validation**: No heavy validation libraries (Zod/Joi) are used. Routes use manual type checking and `parseFloat()`.
- **Authentication**: There is **no authentication/authorization layer** in this demo.
- **State Management**: Frontend uses local React state; no Redux/Zustand.
- **API URL**: Frontend calls `http://localhost:3001` directly.
- **Diagrams**: See `docs/codebase_architecture.md.resolved` for detailed Mermaid diagrams.
