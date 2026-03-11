const express = require('express');
const cors = require('cors');

const transactionRoutes = require('./modules/transaction/routes');
const payrollRoutes = require('./modules/payroll/routes');
const quotesRoutes = require('./modules/quotes/routes');
const invoicesRoutes = require('./modules/invoices/routes');
const reportsRoutes = require('./modules/reports/routes');
const inventoryRoutes = require('./modules/inventory/routes');
const receiptsRoutes = require('./modules/receipts/routes');

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/receipts', receiptsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Temple Finance API running on http://localhost:${PORT}`);
});
