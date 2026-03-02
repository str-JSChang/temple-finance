const express = require('express');
const prisma = require('../../lib/prisma');
const router = express.Router();

// GET dashboard summary (income, expense, profit, counts)
router.get('/dashboard', async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { deleted: false },
        });

        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const payrollCount = await prisma.payrollEntry.count({ where: { deleted: false } });
        const pendingPayroll = await prisma.payrollEntry.count({
            where: { deleted: false, status: 'pending' },
        });
        const quoteCount = await prisma.quote.count({ where: { deleted: false } });
        const invoiceCount = await prisma.invoice.count({ where: { deleted: false } });
        const unpaidInvoices = await prisma.invoice.count({
            where: { deleted: false, status: 'unpaid' },
        });

        // Monthly breakdown for charts
        const monthlyData = {};
        transactions.forEach((t) => {
            const month = t.date.toISOString().slice(0, 7);
            if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
            monthlyData[month][t.type] += t.amount;
        });

        const monthlyBreakdown = Object.entries(monthlyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, data]) => ({
                month,
                income: data.income,
                expense: data.expense,
                profit: data.income - data.expense,
            }));

        // Category breakdown
        const categoryData = {};
        transactions.forEach((t) => {
            if (!categoryData[t.category]) categoryData[t.category] = { income: 0, expense: 0 };
            categoryData[t.category][t.type] += t.amount;
        });

        const categoryBreakdown = Object.entries(categoryData).map(([category, data]) => ({
            category,
            income: data.income,
            expense: data.expense,
        }));

        // Recent transactions
        const recentTransactions = transactions.slice(0, 5);

        res.json({
            summary: {
                totalIncome,
                totalExpense,
                netProfit: totalIncome - totalExpense,
                transactionCount: transactions.length,
                payrollCount,
                pendingPayroll,
                quoteCount,
                invoiceCount,
                unpaidInvoices,
            },
            monthlyBreakdown,
            categoryBreakdown,
            recentTransactions,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET profit snapshots
router.get('/snapshots', async (req, res) => {
    try {
        const snapshots = await prisma.profitSnapshot.findMany({
            orderBy: { period: 'desc' },
        });
        res.json(snapshots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create profit snapshot for a period
router.post('/snapshots', async (req, res) => {
    try {
        const { period } = req.body; // e.g. "2026-03"
        if (!period) return res.status(400).json({ error: 'Period is required (e.g. 2026-03)' });

        const startDate = new Date(`${period}-01`);
        const endMonth = new Date(startDate);
        endMonth.setMonth(endMonth.getMonth() + 1);

        const transactions = await prisma.transaction.findMany({
            where: {
                deleted: false,
                date: { gte: startDate, lt: endMonth },
            },
        });

        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const snapshot = await prisma.profitSnapshot.create({
            data: {
                period,
                totalIncome,
                totalExpense,
                netProfit: totalIncome - totalExpense,
                metadata: JSON.stringify({
                    transactionCount: transactions.length,
                    createdAt: new Date().toISOString(),
                }),
            },
        });

        res.status(201).json(snapshot);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET income vs expense report
router.get('/income-expense', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = { deleted: false };
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const transactions = await prisma.transaction.findMany({ where });

        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        res.json({
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense,
            transactions,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
