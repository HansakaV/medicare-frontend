import api from './api';

export const medicineService = {
  getMedicines: async () => {
    const response = await api.get('/medicines');
    return response.data;
  },
  addMedicine: async (data: any) => {
    const response = await api.post('/medicines', data);
    return response.data;
  },
  updateMedicine: async (id: string, data: any) => {
    const response = await api.put(`/medicines/${id}`, data);
    return response.data;
  },
  deleteMedicine: async (id: string) => {
    const response = await api.delete(`/medicines/${id}`);
    return response.data;
  },
  getLowStock: async (threshold = 10) => {
    const response = await api.get(`/medicines/low-stock?threshold=${threshold}`);
    return response.data;
  },
};
