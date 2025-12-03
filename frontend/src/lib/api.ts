import axios from 'axios';
import type { Employee, Payroll, Leave, Disbursement } from '@/types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Employee API
export const employeeApi = {
  getAll: () => api.get<Employee[]>('/employees'),
  getOne: (id: string) => api.get<Employee>(`/employees/${id}`),
  create: (data: Partial<Employee>) => api.post<Employee>('/employees', data),
  update: (id: string, data: Partial<Employee>) =>
    api.patch<Employee>(`/employees/${id}`, data),
  terminate: (id: string, dateLeft: string) =>
    api.post<Employee>(`/employees/${id}/terminate`, { dateLeft }),
};

// Payroll API
export const payrollApi = {
  generateForEmployee: (employeeId: string, month: number, year: number) =>
    api.post<Payroll>(`/payroll/generate/${employeeId}?month=${month}&year=${year}`),
  generateForAll: (month: number, year: number) =>
    api.post<Payroll[]>(`/payroll/generate-all?month=${month}&year=${year}`),
  getOne: (id: string) => api.get<Payroll>(`/payroll/${id}`),
  getByMonth: (month: number, year: number) =>
    api.get<Payroll[]>(`/payroll/month/${month}/year/${year}`),
  getByEmployee: (employeeId: string) =>
    api.get<Payroll[]>(`/payroll/employee/${employeeId}`),
  approve: (id: string) => api.post<Payroll>(`/payroll/${id}/approve`),
  generatePayslip: (id: string) =>
    api.post<{ message: string; path: string }>(`/payroll/${id}/generate-payslip`),
  downloadPayslip: (id: string) => api.get(`/payroll/${id}/download-payslip`, {
    responseType: 'blob',
  }),
  exportP10: (month: number, year: number) =>
    api.get(`/payroll/export/p10?month=${month}&year=${year}`, {
      responseType: 'blob',
    }),
  exportNSSF: (month: number, year: number) =>
    api.get(`/payroll/export/nssf?month=${month}&year=${year}`, {
      responseType: 'blob',
    }),
  exportSHIF: (month: number, year: number) =>
    api.get(`/payroll/export/shif?month=${month}&year=${year}`, {
      responseType: 'blob',
    }),
};

// Leave API
export const leaveApi = {
  getAll: () => api.get<Leave[]>('/leave'),
  getOne: (id: string) => api.get<Leave>(`/leave/${id}`),
  getByEmployee: (employeeId: string) =>
    api.get<Leave[]>(`/leave/employee/${employeeId}`),
  create: (data: Partial<Leave>) => api.post<Leave>('/leave', data),
  approve: (id: string, approvedBy: string) =>
    api.patch<Leave>(`/leave/${id}/approve`, { approvedBy }),
  reject: (id: string, rejectionReason: string) =>
    api.patch<Leave>(`/leave/${id}/reject`, { rejectionReason }),
  cancel: (id: string) => api.patch<Leave>(`/leave/${id}/cancel`),
};

// Disbursement API
export const disbursementApi = {
  initiate: (payrollId: string) =>
    api.post<Disbursement>(`/disbursement/initiate/${payrollId}`),
  bulkInitiate: (payrollIds: string[]) =>
    api.post<Disbursement[]>('/disbursement/bulk', { payrollIds }),
  getAll: () => api.get<Disbursement[]>('/disbursement'),
  getOne: (id: string) => api.get<Disbursement>(`/disbursement/${id}`),
  retry: (id: string) => api.post<Disbursement>(`/disbursement/${id}/retry`),
};

export default api;
