import api from './api';

export const orderService = {
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  createOrder: async (data: any) => {
    const response = await api.post('/orders', data);
    return response.data;
  },
  getOrdersByPatient: async (patientId: string) => {
    const response = await api.get(`/orders/patient/${patientId}`);
    return response.data;
  },
};
