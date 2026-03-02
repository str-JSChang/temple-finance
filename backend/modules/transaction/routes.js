const express = require('express');
const prisma = require('../../lib/prisma');
const router = express.Router();

// GET all transactions (excluding soft-deleted)
router.get('/', async (req, res) => {
    try {
        const { type, category, startDate, endDate } = req.query;
        const where = { deleted: false };
        if (type) where.type = type;
        if (category) where.category = category;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }
        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { date: 'desc' },
        });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single transaction
router.get('/:id', async (req, res) => {
    try {
        const tx = await prisma.transaction.findFirst({
            where: { id: req.params.id, deleted: false },
        });
        if (!tx) return res.status(404).json({ error: 'Transaction not found' });
        res.json(tx);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create transaction
router.post('/', async (req, res) => {
    try {
        const { date, type, category, description, amount, reference } = req.body;
        const tx = await prisma.transaction.create({
            data: {
                date: date ? new Date(date) : new Date(),
                type,
                category,
                description,
                amount: parseFloat(amount),
                reference,
            },
        });
        res.status(201).json(tx);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update transaction
router.put('/:id', async (req, res) => {
    try {
        const { date, type, category, description, amount } = req.body;
        const tx = await prisma.transaction.update({
            where: { id: req.params.id },
            data: {
                ...(date && { date: new Date(date) }),
                ...(type && { type }),
                ...(category && { category }),
                ...(description && { description }),
                ...(amount !== undefined && { amount: parseFloat(amount) }),
            },
        });
        res.json(tx);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE soft-delete transaction
router.delete('/:id', async (req, res) => {
    try {
        const tx = await prisma.transaction.update({
            where: { id: req.params.id },
            data: { deleted: true },
        });
        res.json({ message: 'Transaction soft-deleted', id: tx.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET summary stats
router.get('/stats/summary', async (req, res) => {
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
        res.json({
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense,
            transactionCount: transactions.length,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
