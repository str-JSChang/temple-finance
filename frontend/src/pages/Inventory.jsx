import React, { useEffect, useMemo, useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { inventoryService } from '../services/api';

function downloadCsv(filename, rows) {
    if (!rows?.length) return;
    const headers = Object.keys(rows[0]);
    const escape = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

const Inventory = () => {
    const [activeTab, setActiveTab] = useState('types'); // types | products | supplier | stock
    const [loading, setLoading] = useState(true);

    const [types, setTypes] = useState([]);
    const [products, setProducts] = useState([]);
    const [supplierInvoices, setSupplierInvoices] = useState([]);
    const [stockBalance, setStockBalance] = useState([]);

    // create forms
    const [newTypeName, setNewTypeName] = useState('');
    const [newProductCode, setNewProductCode] = useState('');
    const [newProductTypeId, setNewProductTypeId] = useState('');

    const [newSupplierName, setNewSupplierName] = useState('');
    const [newSupplierInvoiceNo, setNewSupplierInvoiceNo] = useState('');
    const [newSupplierDate, setNewSupplierDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [newSupplierNotes, setNewSupplierNotes] = useState('');
    const [newSupplierItems, setNewSupplierItems] = useState([{ productId: '', qty: 1, unitCost: 0 }]);

    const typeOptions = useMemo(() => types.map((t) => ({ id: t.id, name: t.name })), [types]);
    const productOptions = useMemo(
        () =>
            products.map((p) => ({
                id: p.id,
                label: `${p.code} — ${p.productType?.name ?? ''}`,
            })),
        [products]
    );

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [tRes, pRes, siRes, sbRes] = await Promise.all([
                inventoryService.getProductTypes(),
                inventoryService.getProducts(),
                inventoryService.getSupplierInvoices(),
                inventoryService.getStockBalance(),
            ]);
            setTypes(tRes.data);
            setProducts(pRes.data);
            setSupplierInvoices(siRes.data);
            setStockBalance(sbRes.data);
            if (!newProductTypeId && tRes.data.length) setNewProductTypeId(tRes.data[0].id);
        } catch (e) {
            console.error(e);
            alert('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreateType = async () => {
        if (!newTypeName.trim()) return;
        await inventoryService.createProductType({ name: newTypeName.trim() });
        setNewTypeName('');
        fetchAll();
    };

    const handleDeleteType = async (id) => {
        if (!window.confirm('Delete this product type?')) return;
        await inventoryService.deleteProductType(id);
        fetchAll();
    };

    const handleCreateProduct = async () => {
        if (!newProductCode.trim() || !newProductTypeId) return;
        await inventoryService.createProduct({ code: newProductCode.trim(), productTypeId: newProductTypeId });
        setNewProductCode('');
        fetchAll();
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        await inventoryService.deleteProduct(id);
        fetchAll();
    };

    const setSupplierItem = (idx, patch) => {
        setNewSupplierItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
    };

    const addSupplierItem = () => setNewSupplierItems((prev) => [...prev, { productId: '', qty: 1, unitCost: 0 }]);
    const removeSupplierItem = (idx) =>
        setNewSupplierItems((prev) => prev.filter((_, i) => i !== idx).length ? prev.filter((_, i) => i !== idx) : prev);

    const handleCreateSupplierInvoice = async () => {
        if (!newSupplierName.trim()) return;
        const items = newSupplierItems.filter((x) => x.productId);
        await inventoryService.createSupplierInvoice({
            supplierName: newSupplierName.trim(),
            invoiceNo: newSupplierInvoiceNo.trim() || null,
            date: newSupplierDate,
            notes: newSupplierNotes.trim() || null,
            items,
        });
        setNewSupplierName('');
        setNewSupplierInvoiceNo('');
        setNewSupplierNotes('');
        setNewSupplierItems([{ productId: '', qty: 1, unitCost: 0 }]);
        fetchAll();
    };

    const handleDeleteSupplierInvoice = async (id) => {
        if (!window.confirm('Delete this supplier invoice? (stock movements will be reversed)')) return;
        await inventoryService.deleteSupplierInvoice(id);
        fetchAll();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
                    <p className="text-gray-500">Manage items, supplier invoices, and stock balance.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        className="btn btn-secondary flex items-center"
                        onClick={() => {
                            if (activeTab === 'stock') downloadCsv('stock-balance.csv', stockBalance);
                            if (activeTab === 'supplier') downloadCsv('supplier-invoices.csv', supplierInvoices.map((x) => ({
                                id: x.id,
                                supplierName: x.supplierName,
                                invoiceNo: x.invoiceNo ?? '',
                                date: new Date(x.date).toLocaleDateString(),
                                totalAmount: x.totalAmount,
                            })));
                            if (activeTab === 'products') downloadCsv('products.csv', products.map((p) => ({
                                code: p.code,
                                productType: p.productType?.name ?? '',
                            })));
                            if (activeTab === 'types') downloadCsv('product-types.csv', types.map((t) => ({ name: t.name })));
                        }}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="flex border-b border-gray-200">
                {[
                    { id: 'types', label: `Product Types (${types.length})` },
                    { id: 'products', label: `Products (${products.length})` },
                    { id: 'supplier', label: `Supplier Invoices (${supplierInvoices.length})` },
                    { id: 'stock', label: `Stock Balance` },
                ].map((t) => (
                    <button
                        key={t.id}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id
                            ? 'border-primary-700 text-primary-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="card text-gray-500">Loading inventory...</div>
            ) : activeTab === 'types' ? (
                <div className="card space-y-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            className="form-input"
                            placeholder="e.g. 香 set, 虎爷 set"
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                        />
                        <button className="btn btn-primary flex items-center" onClick={handleCreateType}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Type
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-4 py-4">Name</th>
                                    <th className="px-4 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {types.length === 0 ? (
                                    <tr><td colSpan="2" className="px-4 py-8 text-center text-gray-500">No product types yet.</td></tr>
                                ) : (
                                    types.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900">{t.name}</td>
                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteType(t.id)}
                                                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'products' ? (
                <div className="card space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            className="form-input"
                            placeholder="Product Code (e.g. P-0001)"
                            value={newProductCode}
                            onChange={(e) => setNewProductCode(e.target.value)}
                        />
                        <select
                            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2"
                            value={newProductTypeId}
                            onChange={(e) => setNewProductTypeId(e.target.value)}
                        >
                            <option value="" disabled>Select product type...</option>
                            {typeOptions.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <button className="btn btn-primary flex items-center justify-center" onClick={handleCreateProduct}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-4 py-4">Code</th>
                                    <th className="px-4 py-4">Type</th>
                                    <th className="px-4 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.length === 0 ? (
                                    <tr><td colSpan="3" className="px-4 py-8 text-center text-gray-500">No products yet.</td></tr>
                                ) : (
                                    products.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-4 py-4 text-sm font-bold text-gray-900">{p.code}</td>
                                            <td className="px-4 py-4 text-sm text-gray-700">{p.productType?.name}</td>
                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteProduct(p.id)}
                                                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'supplier' ? (
                <div className="space-y-6">
                    <div className="card space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">New Supplier Invoice</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input className="form-input" placeholder="Supplier Name" value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)} />
                            <input className="form-input" placeholder="Invoice No (optional)" value={newSupplierInvoiceNo} onChange={(e) => setNewSupplierInvoiceNo(e.target.value)} />
                            <input className="form-input" type="date" value={newSupplierDate} onChange={(e) => setNewSupplierDate(e.target.value)} />
                            <button className="btn btn-primary flex items-center justify-center" onClick={handleCreateSupplierInvoice}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create
                            </button>
                        </div>
                        <textarea className="form-input" placeholder="Notes (optional)" value={newSupplierNotes} onChange={(e) => setNewSupplierNotes(e.target.value)} />

                        <div className="space-y-3">
                            <div className="text-sm font-semibold text-gray-700">Items (stock in)</div>
                            {newSupplierItems.map((it, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                                    <select
                                        className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2 md:col-span-2"
                                        value={it.productId}
                                        onChange={(e) => setSupplierItem(idx, { productId: e.target.value })}
                                    >
                                        <option value="">Select product...</option>
                                        {productOptions.map((p) => (
                                            <option key={p.id} value={p.id}>{p.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        className="form-input"
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={it.qty}
                                        onChange={(e) => setSupplierItem(idx, { qty: parseFloat(e.target.value) || 0 })}
                                        placeholder="Qty"
                                    />
                                    <input
                                        className="form-input"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={it.unitCost}
                                        onChange={(e) => setSupplierItem(idx, { unitCost: parseFloat(e.target.value) || 0 })}
                                        placeholder="Unit Cost"
                                    />
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => removeSupplierItem(idx)}
                                        disabled={newSupplierItems.length <= 1}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button className="btn btn-secondary" onClick={addSupplierItem}>Add line</button>
                        </div>
                    </div>

                    <div className="card">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                        <th className="px-4 py-4">Date</th>
                                        <th className="px-4 py-4">Supplier</th>
                                        <th className="px-4 py-4">Invoice No</th>
                                        <th className="px-4 py-4 text-right">Total</th>
                                        <th className="px-4 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {supplierInvoices.length === 0 ? (
                                        <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No supplier invoices yet.</td></tr>
                                    ) : (
                                        supplierInvoices.map((si) => (
                                            <tr key={si.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-4 py-4 text-sm text-gray-600">{new Date(si.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{si.supplierName}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600">{si.invoiceNo || '-'}</td>
                                                <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right">RM {si.totalAmount.toLocaleString()}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteSupplierInvoice(si.id)}
                                                        className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-4 py-4">Product Code</th>
                                    <th className="px-4 py-4">Product Type</th>
                                    <th className="px-4 py-4 text-right">Balance Qty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stockBalance.length === 0 ? (
                                    <tr><td colSpan="3" className="px-4 py-8 text-center text-gray-500">No stock movements yet.</td></tr>
                                ) : (
                                    stockBalance.map((r) => (
                                        <tr key={r.productId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 text-sm font-bold text-gray-900">{r.code}</td>
                                            <td className="px-4 py-4 text-sm text-gray-700">{r.productTypeName}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right">{r.balanceQty}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;

