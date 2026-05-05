import api from './api';

export const patientService = {
  getPatients: async (page = 1, limit = 10) => {
    const response = await api.get(`/patients?page=${page}&limit=${limit}`);
    return response.data;
  },
  getPatientById: async (id: string) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  createPatient: async (data: any) => {
    const response = await api.post('/patients', data);
    return response.data;
  },
  updatePatient: async (id: string, data: any) => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },
  searchPatient: async (phone: string) => {
    const response = await api.get(`/patients/search?phone=${phone}`);
    return response.data;
  },
  addMedicalHistory: async (id: string, data: any) => {
    const response = await api.post(`/patients/${id}/history`, data);
    return response.data;
  },
};
