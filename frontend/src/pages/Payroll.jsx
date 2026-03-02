import React, { useState, useEffect } from 'react';
import {
    Plus,
    DollarSign,
    Clock,
    CheckCircle2,
    UserPlus,
    Trash2,
    Calendar
} from 'lucide-react';
import { payrollService } from '../services/api';

const Payroll = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('2026-03');

    const fetchPayroll = async () => {
        try {
            setLoading(true);
            const response = await payrollService.getAll({ payPeriod: selectedPeriod });
            setEntries(response.data);
        } catch (error) {
            console.error('Error fetching payroll:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayroll();
    }, [selectedPeriod]);

    const handlePay = async (id) => {
        if (!window.confirm('Mark this employee as paid? This will generate an expense transaction.')) return;
        try {
            await payrollService.pay(id);
            fetchPayroll();
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Failed to process payment');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this payroll entry?')) return;
        try {
            await payrollService.delete(id);
            fetchPayroll();
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
                    <p className="text-gray-500">Manage employee salaries and payments.</p>
                </div>
                <div className="flex space-x-3">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2 pl-10"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                            <option value="2026-03">March 2026</option>
                            <option value="2026-02">February 2026</option>
                            <option value="2026-01">January 2026</option>
                        </select>
                    </div>
                    <button className="btn btn-primary flex items-center">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Employee
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-primary-900 text-white border-0">
                    <p className="text-primary-300 text-sm font-medium">Total Net Pay</p>
                    <div className="flex items-end justify-between mt-2">
                        <h4 className="text-3xl font-bold">
                            ${entries.reduce((sum, e) => sum + e.netPay, 0).toLocaleString()}
                        </h4>
                        <DollarSign className="w-8 h-8 text-primary-700" />
                    </div>
                </div>
                <div className="card">
                    <p className="text-gray-500 text-sm font-medium">Pending Payments</p>
                    <div className="flex items-end justify-between mt-2">
                        <h4 className="text-3xl font-bold text-orange-600">
                            {entries.filter(e => e.status === 'pending').length}
                        </h4>
                        <Clock className="w-8 h-8 text-orange-100" />
                    </div>
                </div>
                <div className="card">
                    <p className="text-gray-500 text-sm font-medium">Processed</p>
                    <div className="flex items-end justify-between mt-2">
                        <h4 className="text-3xl font-bold text-green-600">
                            {entries.filter(e => e.status === 'paid').length}
                        </h4>
                        <CheckCircle2 className="w-8 h-8 text-green-100" />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-4 py-4">Employee</th>
                                <th className="px-4 py-4">Role</th>
                                <th className="px-4 py-4">Gross Salary</th>
                                <th className="px-4 py-4 text-center">Status</th>
                                <th className="px-4 py-4 text-right">Net Pay</th>
                                <th className="px-4 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading payroll...</td></tr>
                            ) : entries.length === 0 ? (
                                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No payroll entries for this period.</td></tr>
                            ) : (
                                entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-gray-900">{entry.employeeName}</div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">{entry.role}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600">${entry.salary.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${entry.status === 'paid'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {entry.status === 'paid' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                {entry.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                                {entry.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right">
                                            ${entry.netPay.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                {entry.status === 'pending' && (
                                                    <button
                                                        onClick={() => handlePay(entry.id)}
                                                        className="bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1 rounded text-xs font-bold transition-colors"
                                                    >
                                                        Pay Now
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
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

export default Payroll;
