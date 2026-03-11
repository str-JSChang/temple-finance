import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Payroll from './pages/Payroll';
import QuotesInvoices from './pages/QuotesInvoices';
import Reports from './pages/Reports';
import Inventory from './pages/Inventory';
import Receipts from './pages/Receipts';
import ReceiptPrint from './pages/ReceiptPrint';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/receipts" element={<Receipts />} />
                    <Route path="/receipts/:id/print" element={<ReceiptPrint />} />
                    <Route path="/payroll" element={<Payroll />} />
                    <Route path="/quotes-invoices" element={<QuotesInvoices />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
