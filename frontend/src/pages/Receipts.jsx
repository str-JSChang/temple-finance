import React, { useEffect, useState } from 'react';
import { Download, Plus, Printer, Trash2 } from 'lucide-react';
import { receiptService } from '../services/api';

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

const emptyForm = () => ({
    date: new Date().toISOString().slice(0, 10),
    receivedFrom: '',
    amount: '',
    beingPaymentOf: '',
    activity: '',
    isDonation: false,
    bank: '',
    chequeNo: '',
    issuedBy: '',
});

const Receipts = () => {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [form, setForm] = useState(emptyForm());
    const [editing, setEditing] = useState(null);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await receiptService.getAll();
            setRows(res.data);
        } catch (e) {
            console.error(e);
            alert('Failed to load receipts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const save = async () => {
        if (!form.receivedFrom.trim()) return alert('Received from is required');
        if (!Number(form.amount) || Number(form.amount) <= 0) return alert('Amount must be > 0');

        const payload = {
            ...form,
            amount: Number(form.amount),
        };

        if (editing) {
            await receiptService.update(editing.id, payload);
        } else {
            await receiptService.create(payload);
        }
        setEditing(null);
        setForm(emptyForm());
        fetchAll();
    };

    const edit = (r) => {
        setEditing(r);
        setForm({
            date: new Date(r.date).toISOString().slice(0, 10),
            receivedFrom: r.receivedFrom || '',
            amount: r.amount ?? '',
            beingPaymentOf: r.beingPaymentOf || '',
            activity: r.activity || '',
            isDonation: !!r.isDonation,
            bank: r.bank || '',
            chequeNo: r.chequeNo || '',
            issuedBy: r.issuedBy || '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const del = async (id) => {
        if (!window.confirm('Delete this receipt? (linked ledger transaction will also be soft-deleted)')) return;
        await receiptService.delete(id);
        fetchAll();
    };

    const print = (id) => {
        window.open(`/receipts/${id}/print`, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Official Receipts</h2>
                    <p className="text-gray-500">Create, modify, delete, and print receipts (PDF via browser print).</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        className="btn btn-secondary flex items-center"
                        onClick={() => downloadCsv('receipts.csv', rows.map((r) => ({
                            receiptNo: r.receiptNo,
                            date: new Date(r.date).toLocaleDateString(),
                            receivedFrom: r.receivedFrom,
                            amount: r.amount,
                            isDonation: r.isDonation ? 'Yes' : 'No',
                            issuedBy: r.issuedBy ?? '',
                        })))}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div
                className={`bg-white p-6 rounded-xl shadow-sm space-y-4 border-2 ${
                    editing ? 'border-primary-500' : 'border-primary-400'
                }`}
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">{editing ? `Edit Receipt #${editing.receiptNo}` : 'New Receipt'}</h3>
                    {editing && (
                        <button className="btn btn-secondary" onClick={() => { setEditing(null); setForm(emptyForm()); }}>
                            Cancel
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Date 日期</label>
                        <input className="form-input" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Received from 收妥自</label>
                        <input className="form-input" value={form.receivedFrom} onChange={(e) => setForm((p) => ({ ...p, receivedFrom: e.target.value }))} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Amount 金额 (RM)</label>
                        <input className="form-input" type="number" step="0.01" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Being payment of 兹收</label>
                        <input className="form-input" value={form.beingPaymentOf} onChange={(e) => setForm((p) => ({ ...p, beingPaymentOf: e.target.value }))} />
                    </div>
                    <div className="flex items-end">
                        <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" checked={form.isDonation} onChange={(e) => setForm((p) => ({ ...p, isDonation: e.target.checked }))} />
                            <span>Donation 乐捐</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Activity 活动</label>
                        <input className="form-input" value={form.activity} onChange={(e) => setForm((p) => ({ ...p, activity: e.target.value }))} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Issued by 经手人</label>
                        <input className="form-input" value={form.issuedBy} onChange={(e) => setForm((p) => ({ ...p, issuedBy: e.target.value }))} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Bank 银行</label>
                        <input className="form-input" value={form.bank} onChange={(e) => setForm((p) => ({ ...p, bank: e.target.value }))} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Cheque No 支票号码</label>
                        <input className="form-input" value={form.chequeNo} onChange={(e) => setForm((p) => ({ ...p, chequeNo: e.target.value }))} />
                    </div>
                    <div className="flex items-end">
                        <button className="btn btn-primary w-full flex items-center justify-center" onClick={save}>
                            <Plus className="w-4 h-4 mr-2" />
                            {editing ? 'Save Changes' : 'Create Receipt'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-4 py-4">No.</th>
                                <th className="px-4 py-4">Date</th>
                                <th className="px-4 py-4">Received from</th>
                                <th className="px-4 py-4 text-right">Amount</th>
                                <th className="px-4 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading receipts...</td></tr>
                            ) : rows.length === 0 ? (
                                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No receipts yet.</td></tr>
                            ) : (
                                rows.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-4 py-4 text-sm font-bold text-gray-900">{r.receiptNo}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600">{new Date(r.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-gray-900">{r.receivedFrom}</div>
                                            {(r.beingPaymentOf || r.activity) && (
                                                <div className="text-xs text-gray-400">
                                                    {r.beingPaymentOf ? `Payment: ${r.beingPaymentOf}` : ''}
                                                    {r.beingPaymentOf && r.activity ? ' | ' : ''}
                                                    {r.activity ? `Activity: ${r.activity}` : ''}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right">RM {r.amount.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    className="bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1 rounded text-xs font-bold flex items-center shadow-sm transition-all"
                                                    onClick={() => print(r.id)}
                                                >
                                                    <Printer className="w-3 h-3 mr-1" />
                                                    Print
                                                </button>
                                                <button className="btn btn-secondary" onClick={() => edit(r)}>Edit</button>
                                                <button
                                                    onClick={() => del(r.id)}
                                                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Receipts;

