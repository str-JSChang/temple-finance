const express = require('express');
const prisma = require('../../lib/prisma');

const router = express.Router();

function buildReceiptTxDescription(receipt) {
  const parts = [
    `Receipt #${receipt.receiptNo}`,
    receipt.receivedFrom ? `From: ${receipt.receivedFrom}` : null,
    receipt.beingPaymentOf ? `Payment: ${receipt.beingPaymentOf}` : null,
    receipt.activity ? `Activity: ${receipt.activity}` : null,
  ].filter(Boolean);
  return parts.join(' | ');
}

async function nextReceiptNo() {
  const agg = await prisma.receipt.aggregate({
    _max: { receiptNo: true },
  });
  return (agg._max.receiptNo || 0) + 1;
}

// GET all receipts
router.get('/', async (req, res) => {
  try {
    const rows = await prisma.receipt.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single receipt
router.get('/:id', async (req, res) => {
  try {
    const row = await prisma.receipt.findFirst({
      where: { id: req.params.id, deleted: false },
    });
    if (!row) return res.status(404).json({ error: 'Receipt not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create receipt → generates income transaction
router.post('/', async (req, res) => {
  try {
    const {
      date,
      receivedFrom,
      amount,
      beingPaymentOf,
      activity,
      isDonation,
      bank,
      chequeNo,
      issuedBy,
    } = req.body;

    if (!receivedFrom) return res.status(400).json({ error: 'receivedFrom is required' });
    const amt = parseFloat(amount);
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'amount must be > 0' });

    const receiptNo = await nextReceiptNo();
    const receiptDate = date ? new Date(date) : new Date();

    const tx = await prisma.transaction.create({
      data: {
        date: receiptDate,
        type: 'income',
        category: isDonation ? 'Donations' : 'Receipt',
        description: buildReceiptTxDescription({
          receiptNo,
          receivedFrom,
          beingPaymentOf,
          activity,
        }),
        amount: amt,
        reference: `receipt:${receiptNo}`,
      },
    });

    const row = await prisma.receipt.create({
      data: {
        receiptNo,
        date: receiptDate,
        receivedFrom,
        amount: amt,
        beingPaymentOf: beingPaymentOf || null,
        activity: activity || null,
        isDonation: !!isDonation,
        bank: bank || null,
        chequeNo: chequeNo || null,
        issuedBy: issuedBy || null,
        transactionId: tx.id,
      },
    });

    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update receipt (also updates linked transaction)
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.receipt.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deleted) return res.status(404).json({ error: 'Receipt not found' });

    const {
      date,
      receivedFrom,
      amount,
      beingPaymentOf,
      activity,
      isDonation,
      bank,
      chequeNo,
      issuedBy,
    } = req.body;

    const updateData = {};
    if (date) updateData.date = new Date(date);
    if (receivedFrom) updateData.receivedFrom = receivedFrom;
    if (beingPaymentOf !== undefined) updateData.beingPaymentOf = beingPaymentOf || null;
    if (activity !== undefined) updateData.activity = activity || null;
    if (isDonation !== undefined) updateData.isDonation = !!isDonation;
    if (bank !== undefined) updateData.bank = bank || null;
    if (chequeNo !== undefined) updateData.chequeNo = chequeNo || null;
    if (issuedBy !== undefined) updateData.issuedBy = issuedBy || null;
    if (amount !== undefined) {
      const amt = parseFloat(amount);
      if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'amount must be > 0' });
      updateData.amount = amt;
    }

    const row = await prisma.receipt.update({
      where: { id: req.params.id },
      data: updateData,
    });

    if (row.transactionId) {
      await prisma.transaction.update({
        where: { id: row.transactionId },
        data: {
          date: row.date,
          category: row.isDonation ? 'Donations' : 'Receipt',
          description: buildReceiptTxDescription(row),
          amount: row.amount,
        },
      });
    }

    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE soft-delete receipt (also soft-deletes linked transaction)
router.delete('/:id', async (req, res) => {
  try {
    const row = await prisma.receipt.update({
      where: { id: req.params.id },
      data: { deleted: true },
    });
    if (row.transactionId) {
      await prisma.transaction.update({
        where: { id: row.transactionId },
        data: { deleted: true },
      });
    }
    res.json({ message: 'Receipt soft-deleted', id: row.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

