import api from './api';

export const smsService = {
  sendSms: async (data: { numbers: string[]; message: string; username?: string; password?: string }) => {
    const response = await api.post('/sms/send', data);
    return response.data;
  },
  getLogs: async () => {
    const response = await api.get('/sms/logs');
    return response.data;
  }
};

