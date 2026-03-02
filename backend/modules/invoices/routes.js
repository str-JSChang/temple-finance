const express = require('express');
const prisma = require('../../lib/prisma');
const router = express.Router();

// GET all invoices
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const where = { deleted: false };
        if (status) where.status = status;
        const invoices = await prisma.invoice.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        const result = invoices.map((inv) => ({ ...inv, items: JSON.parse(inv.items) }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single invoice
router.get('/:id', async (req, res) => {
    try {
        const invoice = await prisma.invoice.findFirst({
            where: { id: req.params.id, deleted: false },
        });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json({ ...invoice, items: JSON.parse(invoice.items) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create invoice
router.post('/', async (req, res) => {
    try {
        const { clientName, description, items, dueDate } = req.body;
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        const totalAmount = parsedItems.reduce(
            (sum, item) => sum + item.qty * item.unitPrice,
            0
        );
        const invoice = await prisma.invoice.create({
            data: {
                clientName,
                description,
                items: JSON.stringify(parsedItems),
                totalAmount,
                dueDate: new Date(dueDate),
            },
        });
        res.status(201).json({ ...invoice, items: parsedItems });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update invoice
router.put('/:id', async (req, res) => {
    try {
        const { clientName, description, items, dueDate, status } = req.body;
        const updateData = {};
        if (clientName) updateData.clientName = clientName;
        if (description) updateData.description = description;
        if (status) updateData.status = status;
        if (dueDate) updateData.dueDate = new Date(dueDate);
        if (items) {
            const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
            updateData.items = JSON.stringify(parsedItems);
            updateData.totalAmount = parsedItems.reduce(
                (sum, item) => sum + item.qty * item.unitPrice,
                0
            );
        }
        const invoice = await prisma.invoice.update({
            where: { id: req.params.id },
            data: updateData,
        });
        res.json({ ...invoice, items: JSON.parse(invoice.items) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST mark invoice as paid → generates income transaction
router.post('/:id/pay', async (req, res) => {
    try {
        const invoice = await prisma.invoice.findFirst({
            where: { id: req.params.id, deleted: false },
        });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        if (invoice.status === 'paid') return res.status(400).json({ error: 'Already paid' });

        // Create income transaction
        const tx = await prisma.transaction.create({
            data: {
                date: new Date(),
                type: 'income',
                category: 'Invoice Payment',
                description: `Invoice payment: ${invoice.clientName} - ${invoice.description}`,
                amount: invoice.totalAmount,
                reference: `invoice:${invoice.id}`,
            },
        });

        // Update invoice
        const updated = await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
                status: 'paid',
                paidAt: new Date(),
                transactionId: tx.id,
            },
        });

        res.json({
            invoice: { ...updated, items: JSON.parse(updated.items) },
            transaction: tx,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE soft-delete invoice
router.delete('/:id', async (req, res) => {
    try {
        await prisma.invoice.update({
            where: { id: req.params.id },
            data: { deleted: true },
        });
        res.json({ message: 'Invoice soft-deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
