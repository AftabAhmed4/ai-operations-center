import { apiClient } from './client';

export const dashboardApi = {
  getMetrics: () => apiClient.get('/api/v1/dashboard/metrics').then(r => r.data),
  getMonthlySales: (year?: number) =>
    apiClient.get('/api/v1/dashboard/monthly-sales', { params: year ? { year } : {} }).then(r => r.data),
  getLowStock: () => apiClient.get('/api/v1/dashboard/low-stock').then(r => r.data),
  getHighDemand: () => apiClient.get('/api/v1/dashboard/high-demand').then(r => r.data),
};

export const productsApi = {
  getAll: () => apiClient.get('/api/v1/products').then(r => r.data),
  create: (data: any) => apiClient.post('/api/v1/products', data).then(r => r.data),
  update: (id: number, data: any) => apiClient.put(`/api/v1/products/${id}`, data).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/api/v1/products/${id}`),
};

export const salesApi = {
  getAll: () => apiClient.get('/api/v1/sales').then(r => r.data),
  create: (data: any) => apiClient.post('/api/v1/sales', data).then(r => r.data),
};

export const campaignsApi = {
  getAll: () => apiClient.get('/api/v1/campaigns').then(r => r.data),
  create: (data: any) => apiClient.post('/api/v1/campaigns', data).then(r => r.data),
  update: (id: number, data: any) => apiClient.put(`/api/v1/campaigns/${id}`, data).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/api/v1/campaigns/${id}`),
};

export const workflowsApi = {
  trigger: async (user_input: string) => {
    return new Promise((resolve) => setTimeout(() => resolve({ workflow_id: `wk_${Date.now()}` }), 1000));
  },
  getStatus: async (id: string) => {
    return new Promise((resolve) => setTimeout(() => resolve({ status: 'processing' }), 500));
  },
  approve: async (id: string, approved: boolean) => {
    return new Promise((resolve) => setTimeout(() => resolve({
      success: true,
      metrics: [
        { label: 'Revenue Velocity', before: '$12k/day', after: '$14.5k/day' },
        { label: 'Stock Out Risk', before: 'High (82%)', after: 'Low (12%)' }
      ]
    }), 1500));
  },
};
