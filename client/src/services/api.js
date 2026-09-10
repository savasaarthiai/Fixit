import axios from 'axios';

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || '') + '/api',
    headers: { 'Content-Type': 'application/json' }
});

// Add auth token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('fixit_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('fixit_token');
            localStorage.removeItem('fixit_user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Issues
export const createIssue = (formData) => api.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const getIssues = (params) => api.get('/issues', { params });
export const getIssue = (id) => api.get(`/issues/${id}`);
export const updateIssueStatus = (id, formData) => api.put(`/issues/${id}/status`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');

// Analytics
export const getDashboardAnalytics = () => api.get('/analytics/dashboard');

export default api;
