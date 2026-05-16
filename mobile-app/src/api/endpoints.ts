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

export const campaignsApi = {
  getAll: () => apiClient.get('/api/v1/campaigns').then(r => r.data),
  create: (data: any) => apiClient.post('/api/v1/campaigns', data).then(r => r.data),
  update: (id: number, data: any) => apiClient.put(`/api/v1/campaigns/${id}`, data).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/api/v1/campaigns/${id}`),
};

export const workflowsApi = {
  trigger: (user_input: string) =>
    apiClient.post('/api/v1/workflows/trigger', { user_input }).then(r => r.data),
  getStatus: (id: string) =>
    apiClient.get(`/api/v1/workflows/${id}/status`).then(r => r.data),
  approve: (id: string, approved: boolean) =>
    apiClient.post(`/api/v1/workflows/${id}/approve`, { approved }).then(r => r.data),
};
