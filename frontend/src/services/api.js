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

export const inventoryService = {
    // product types
    getProductTypes: () => api.get('/inventory/product-types'),
    createProductType: (data) => api.post('/inventory/product-types', data),
    updateProductType: (id, data) => api.put(`/inventory/product-types/${id}`, data),
    deleteProductType: (id) => api.delete(`/inventory/product-types/${id}`),

    // products
    getProducts: () => api.get('/inventory/products'),
    createProduct: (data) => api.post('/inventory/products', data),
    updateProduct: (id, data) => api.put(`/inventory/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/inventory/products/${id}`),

    // supplier invoices
    getSupplierInvoices: () => api.get('/inventory/supplier-invoices'),
    createSupplierInvoice: (data) => api.post('/inventory/supplier-invoices', data),
    updateSupplierInvoice: (id, data) => api.put(`/inventory/supplier-invoices/${id}`, data),
    deleteSupplierInvoice: (id) => api.delete(`/inventory/supplier-invoices/${id}`),

    // reports
    getStockBalance: () => api.get('/inventory/stock/balance'),
};

export const receiptService = {
    getAll: () => api.get('/receipts'),
    getById: (id) => api.get(`/receipts/${id}`),
    create: (data) => api.post('/receipts', data),
    update: (id, data) => api.put(`/receipts/${id}`, data),
    delete: (id) => api.delete(`/receipts/${id}`),
};

export default api;
