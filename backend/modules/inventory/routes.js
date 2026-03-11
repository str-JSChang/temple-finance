const express = require('express');
const prisma = require('../../lib/prisma');

const router = express.Router();

function parseItems(items) {
  const parsed = typeof items === 'string' ? JSON.parse(items) : items;
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((x) => ({
      productId: x.productId,
      qty: parseFloat(x.qty) || 0,
      unitCost: parseFloat(x.unitCost) || 0,
    }))
    .filter((x) => x.productId && x.qty !== 0);
}

// ─── PRODUCT TYPES ────────────────────────────────────────────
router.get('/product-types', async (req, res) => {
  try {
    const rows = await prisma.productType.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/product-types', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const row = await prisma.productType.create({ data: { name } });
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/product-types/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const row = await prisma.productType.update({
      where: { id: req.params.id },
      data: { ...(name && { name }) },
    });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/product-types/:id', async (req, res) => {
  try {
    const row = await prisma.productType.update({
      where: { id: req.params.id },
      data: { deleted: true },
    });
    res.json({ message: 'Product type soft-deleted', id: row.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PRODUCTS ─────────────────────────────────────────────────
router.get('/products', async (req, res) => {
  try {
    const rows = await prisma.product.findMany({
      where: { deleted: false, productType: { deleted: false } },
      include: { productType: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { code, productTypeId } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });
    if (!productTypeId) return res.status(400).json({ error: 'productTypeId is required' });
    const row = await prisma.product.create({
      data: { code, productTypeId },
      include: { productType: true },
    });
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { code, productTypeId } = req.body;
    const row = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(code && { code }),
        ...(productTypeId && { productTypeId }),
      },
      include: { productType: true },
    });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const row = await prisma.product.update({
      where: { id: req.params.id },
      data: { deleted: true },
    });
    res.json({ message: 'Product soft-deleted', id: row.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SUPPLIER INVOICES ────────────────────────────────────────
router.get('/supplier-invoices', async (req, res) => {
  try {
    const rows = await prisma.supplierInvoice.findMany({
      where: { deleted: false },
      orderBy: { date: 'desc' },
    });
    res.json(rows.map((r) => ({ ...r, items: JSON.parse(r.items) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/supplier-invoices/:id', async (req, res) => {
  try {
    const row = await prisma.supplierInvoice.findFirst({
      where: { id: req.params.id, deleted: false },
    });
    if (!row) return res.status(404).json({ error: 'Supplier invoice not found' });
    res.json({ ...row, items: JSON.parse(row.items) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function replaceStockMovementsForSupplierInvoice({ supplierInvoiceId, date, items }) {
  const reference = `supplier-invoice:${supplierInvoiceId}`;
  await prisma.stockMovement.updateMany({
    where: { reference, deleted: false },
    data: { deleted: true },
  });
  if (!items.length) return;
  await prisma.stockMovement.createMany({
    data: items.map((it) => ({
      date,
      productId: it.productId,
      qtyChange: it.qty,
      reference,
    })),
  });
}

router.post('/supplier-invoices', async (req, res) => {
  try {
    const { supplierName, invoiceNo, date, items, notes } = req.body;
    if (!supplierName) return res.status(400).json({ error: 'supplierName is required' });
    const parsedItems = parseItems(items);
    const totalAmount = parsedItems.reduce((sum, it) => sum + it.qty * it.unitCost, 0);
    const invDate = date ? new Date(date) : new Date();

    const row = await prisma.supplierInvoice.create({
      data: {
        supplierName,
        invoiceNo: invoiceNo || null,
        date: invDate,
        items: JSON.stringify(parsedItems),
        totalAmount,
        notes: notes || null,
      },
    });

    await replaceStockMovementsForSupplierInvoice({
      supplierInvoiceId: row.id,
      date: invDate,
      items: parsedItems,
    });

    res.status(201).json({ ...row, items: parsedItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/supplier-invoices/:id', async (req, res) => {
  try {
    const { supplierName, invoiceNo, date, items, notes } = req.body;
    const updateData = {};
    if (supplierName) updateData.supplierName = supplierName;
    if (invoiceNo !== undefined) updateData.invoiceNo = invoiceNo || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (date) updateData.date = new Date(date);
    if (items) {
      const parsedItems = parseItems(items);
      updateData.items = JSON.stringify(parsedItems);
      updateData.totalAmount = parsedItems.reduce((sum, it) => sum + it.qty * it.unitCost, 0);
    }

    const row = await prisma.supplierInvoice.update({
      where: { id: req.params.id },
      data: updateData,
    });

    const finalItems = JSON.parse(row.items);
    await replaceStockMovementsForSupplierInvoice({
      supplierInvoiceId: row.id,
      date: row.date,
      items: finalItems,
    });

    res.json({ ...row, items: finalItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/supplier-invoices/:id', async (req, res) => {
  try {
    const row = await prisma.supplierInvoice.update({
      where: { id: req.params.id },
      data: { deleted: true },
    });
    await prisma.stockMovement.updateMany({
      where: { reference: `supplier-invoice:${row.id}`, deleted: false },
      data: { deleted: true },
    });
    res.json({ message: 'Supplier invoice soft-deleted', id: row.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── STOCK BALANCE REPORT ─────────────────────────────────────
router.get('/stock/balance', async (req, res) => {
  try {
    const grouped = await prisma.stockMovement.groupBy({
      by: ['productId'],
      where: { deleted: false },
      _sum: { qtyChange: true },
    });

    const productIds = grouped.map((g) => g.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, deleted: false, productType: { deleted: false } },
      include: { productType: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    const result = grouped
      .map((g) => {
        const p = byId.get(g.productId);
        if (!p) return null;
        return {
          productId: p.id,
          code: p.code,
          productTypeName: p.productType.name,
          balanceQty: g._sum.qtyChange || 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.code.localeCompare(b.code));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

