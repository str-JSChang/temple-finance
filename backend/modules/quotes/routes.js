const express = require('express');
const prisma = require('../../lib/prisma');
const router = express.Router();

// GET all quotes
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const where = { deleted: false };
        if (status) where.status = status;
        const quotes = await prisma.quote.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        // Parse items JSON
        const result = quotes.map((q) => ({ ...q, items: JSON.parse(q.items) }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single quote
router.get('/:id', async (req, res) => {
    try {
        const quote = await prisma.quote.findFirst({
            where: { id: req.params.id, deleted: false },
        });
        if (!quote) return res.status(404).json({ error: 'Quote not found' });
        res.json({ ...quote, items: JSON.parse(quote.items) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create quote
router.post('/', async (req, res) => {
    try {
        const { clientName, description, items, validUntil } = req.body;
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        const totalAmount = parsedItems.reduce(
            (sum, item) => sum + item.qty * item.unitPrice,
            0
        );
        const quote = await prisma.quote.create({
            data: {
                clientName,
                description,
                items: JSON.stringify(parsedItems),
                totalAmount,
                validUntil: new Date(validUntil),
            },
        });
        res.status(201).json({ ...quote, items: parsedItems });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update quote
router.put('/:id', async (req, res) => {
    try {
        const { clientName, description, items, validUntil, status } = req.body;
        const updateData = {};
        if (clientName) updateData.clientName = clientName;
        if (description) updateData.description = description;
        if (status) updateData.status = status;
        if (validUntil) updateData.validUntil = new Date(validUntil);
        if (items) {
            const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
            updateData.items = JSON.stringify(parsedItems);
            updateData.totalAmount = parsedItems.reduce(
                (sum, item) => sum + item.qty * item.unitPrice,
                0
            );
        }
        const quote = await prisma.quote.update({
            where: { id: req.params.id },
            data: updateData,
        });
        res.json({ ...quote, items: JSON.parse(quote.items) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST convert quote → invoice
router.post('/:id/convert', async (req, res) => {
    try {
        const quote = await prisma.quote.findFirst({
            where: { id: req.params.id, deleted: false },
        });
        if (!quote) return res.status(404).json({ error: 'Quote not found' });
        if (quote.status === 'converted')
            return res.status(400).json({ error: 'Quote already converted' });

        const dueDate = req.body.dueDate
            ? new Date(req.body.dueDate)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        // Create invoice from quote
        const invoice = await prisma.invoice.create({
            data: {
                clientName: quote.clientName,
                description: quote.description,
                items: quote.items,
                totalAmount: quote.totalAmount,
                dueDate,
                quoteId: quote.id,
            },
        });

        // Update quote status
        const updatedQuote = await prisma.quote.update({
            where: { id: quote.id },
            data: { status: 'converted', invoiceId: invoice.id },
        });

        res.json({
            quote: { ...updatedQuote, items: JSON.parse(updatedQuote.items) },
            invoice: { ...invoice, items: JSON.parse(invoice.items) },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE soft-delete quote
router.delete('/:id', async (req, res) => {
    try {
        await prisma.quote.update({
            where: { id: req.params.id },
            data: { deleted: true },
        });
        res.json({ message: 'Quote soft-deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
