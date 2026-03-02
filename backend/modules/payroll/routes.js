const express = require('express');
const prisma = require('../../lib/prisma');
const router = express.Router();

// GET all payroll entries
router.get('/', async (req, res) => {
    try {
        const { status, payPeriod } = req.query;
        const where = { deleted: false };
        if (status) where.status = status;
        if (payPeriod) where.payPeriod = payPeriod;
        const entries = await prisma.payrollEntry.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single payroll entry
router.get('/:id', async (req, res) => {
    try {
        const entry = await prisma.payrollEntry.findFirst({
            where: { id: req.params.id, deleted: false },
        });
        if (!entry) return res.status(404).json({ error: 'Payroll entry not found' });
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create payroll entry
router.post('/', async (req, res) => {
    try {
        const { employeeName, role, salary, bonus, deductions, payPeriod } = req.body;
        const s = parseFloat(salary) || 0;
        const b = parseFloat(bonus) || 0;
        const d = parseFloat(deductions) || 0;
        const netPay = s + b - d;

        const entry = await prisma.payrollEntry.create({
            data: {
                employeeName,
                role,
                salary: s,
                bonus: b,
                deductions: d,
                netPay,
                payPeriod,
            },
        });
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update payroll entry
router.put('/:id', async (req, res) => {
    try {
        const { employeeName, role, salary, bonus, deductions, payPeriod } = req.body;
        const updateData = {};
        if (employeeName) updateData.employeeName = employeeName;
        if (role) updateData.role = role;
        if (payPeriod) updateData.payPeriod = payPeriod;
        if (salary !== undefined || bonus !== undefined || deductions !== undefined) {
            const current = await prisma.payrollEntry.findUnique({ where: { id: req.params.id } });
            const s = salary !== undefined ? parseFloat(salary) : current.salary;
            const b = bonus !== undefined ? parseFloat(bonus) : current.bonus;
            const d = deductions !== undefined ? parseFloat(deductions) : current.deductions;
            updateData.salary = s;
            updateData.bonus = b;
            updateData.deductions = d;
            updateData.netPay = s + b - d;
        }
        const entry = await prisma.payrollEntry.update({
            where: { id: req.params.id },
            data: updateData,
        });
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST pay a payroll entry → generates expense transaction
router.post('/:id/pay', async (req, res) => {
    try {
        const entry = await prisma.payrollEntry.findFirst({
            where: { id: req.params.id, deleted: false },
        });
        if (!entry) return res.status(404).json({ error: 'Payroll entry not found' });
        if (entry.status === 'paid') return res.status(400).json({ error: 'Already paid' });

        // Create expense transaction
        const tx = await prisma.transaction.create({
            data: {
                date: new Date(),
                type: 'expense',
                category: 'Payroll',
                description: `Payroll: ${entry.employeeName} (${entry.role}) - ${entry.payPeriod}`,
                amount: entry.netPay,
                reference: `payroll:${entry.id}`,
            },
        });

        // Update payroll entry
        const updated = await prisma.payrollEntry.update({
            where: { id: entry.id },
            data: {
                status: 'paid',
                paidAt: new Date(),
                transactionId: tx.id,
            },
        });

        res.json({ payroll: updated, transaction: tx });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE soft-delete payroll entry
router.delete('/:id', async (req, res) => {
    try {
        await prisma.payrollEntry.update({
            where: { id: req.params.id },
            data: { deleted: true },
        });
        res.json({ message: 'Payroll entry soft-deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
