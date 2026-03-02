import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

export const transactionService = {
    getAll: (params) => api.get('/transactions', { params }),
    getById: (id) => api.get(`/transactions/${id}`),
    create: (data) => api.post('/transactions', data),
    update: (id, data) => api.put(`/transactions/${id}`, data),
    delete: (id) => api.delete(`/transactions/${id}`),
    getSummary: () => api.get('/transactions/stats/summary'),
};

export const payrollService = {
    getAll: (params) => api.get('/payroll', { params }),
    create: (data) => api.post('/payroll', data),
    pay: (id) => api.post(`/payroll/${id}/pay`),
    delete: (id) => api.delete(`/payroll/${id}`),
};

export const quoteService = {
    getAll: (params) => api.get('/quotes', { params }),
    create: (data) => api.post('/quotes', data),
    convert: (id, data) => api.post(`/quotes/${id}/convert`, data),
    delete: (id) => api.delete(`/quotes/${id}`),
};

export const invoiceService = {
    getAll: (params) => api.get('/invoices', { params }),
    create: (data) => api.post('/invoices', data),
    pay: (id) => api.post(`/invoices/${id}/pay`),
    delete: (id) => api.delete(`/invoices/${id}`),
};

export const reportService = {
    getDashboard: () => api.get('/reports/dashboard'),
    getSnapshots: () => api.get('/reports/snapshots'),
    createSnapshot: (data) => api.post('/reports/snapshots', data),
    getIncomeExpense: (params) => api.get('/reports/income-expense', { params }),
};

export default api;
