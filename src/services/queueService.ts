import api from './api';

export const queueService = {
  getQueue: async () => {
    const response = await api.get('/queue');
    return response.data;
  },
  addToQueue: async (patientId: string) => {
    const response = await api.post('/queue', { patientId });
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/queue/${id}/status`, { status });
    return response.data;
  },
};
