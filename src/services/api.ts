import axios from 'axios';
import { User, SmallGroup, Member, Church, District, Zone, Association, WeeklyReport, MissionaryPair, Union } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const authAPI = {
    login: async (username: string, password: string) => {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
    },
    logout: async () => {
        await api.post('/auth/logout');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
    },
    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        return response.data;
    },
};

// User endpoints
export const userAPI = {
    getAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    create: async (userData: Omit<User, 'id'>) => {
        const response = await api.post('/users', userData);
        return response.data;
    },
    update: async (id: string, userData: Partial<User>) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/users/${id}`);
    },
};

// Union endpoints
export const unionAPI = {
    getAll: async () => {
        const response = await api.get('/unions');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/unions/${id}`);
        return response.data;
    },
    create: async (unionData: Omit<Union, 'id'>) => {
        const response = await api.post('/unions', unionData);
        return response.data;
    },
    update: async (id: string, unionData: Partial<Union>) => {
        const response = await api.put(`/unions/${id}`, unionData);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/unions/${id}`);
    },
};

// Association endpoints
export const associationAPI = {
    getAll: async () => {
        const response = await api.get('/associations');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/associations/${id}`);
        return response.data;
    },
    create: async (associationData: Omit<Association, 'id'>) => {
        const response = await api.post('/associations', associationData);
        return response.data;
    },
    update: async (id: string, associationData: Partial<Association>) => {
        const response = await api.put(`/associations/${id}`, associationData);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/associations/${id}`);
    },
    getByUnion: async (unionId: string) => {
        const response = await api.get(`/unions/${unionId}/associations`);
        return response.data;
    },
};

// Zone endpoints
export const zoneAPI = {
    getAll: async () => {
        const response = await api.get('/zones');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/zones/${id}`);
        return response.data;
    },
    create: async (zoneData: Omit<Zone, 'id'>) => {
        const response = await api.post('/zones', zoneData);
        return response.data;
    },
    update: async (id: string, zoneData: Partial<Zone>) => {
        const response = await api.put(`/zones/${id}`, zoneData);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/zones/${id}`);
    },
    getByAssociation: async (associationId: string) => {
        const response = await api.get(`/associations/${associationId}/zones`);
        return response.data;
    },
};

// District endpoints
export const districtAPI = {
    getAll: async () => {
        const response = await api.get('/districts');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/districts/${id}`);
        return response.data;
    },
    create: async (districtData: Omit<District, 'id'>) => {
        const response = await api.post('/districts', districtData);
        return response.data;
    },
    update: async (id: string, districtData: Partial<District>) => {
        const response = await api.put(`/districts/${id}`, districtData);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/districts/${id}`);
    },
    getByZone: async (zoneId: string) => {
        const response = await api.get(`/zones/${zoneId}/districts`);
        return response.data;
    },
};

// Church endpoints
export const churchAPI = {
    getAll: async () => {
        const response = await api.get('/churches');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/churches/${id}`);
        return response.data;
    },
    create: async (churchData: Omit<Church, 'id'>) => {
        const response = await api.post('/churches', churchData);
        return response.data;
    },
    update: async (id: string, churchData: Partial<Church>) => {
        const response = await api.put(`/churches/${id}`, churchData);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/churches/${id}`);
    },
    getByDistrict: async (districtId: string) => {
        const response = await api.get(`/districts/${districtId}/churches`);
        return response.data;
    },
};

// Small Group (GP) endpoints
export const smallGroupAPI = {
    getAll: async () => {
        const response = await api.get('/small-groups');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/small-groups/${id}`);
        return response.data;
    },
    create: async (gpData: Omit<SmallGroup, 'id'>) => {
        const response = await api.post('/small-groups', gpData);
        return response.data;
    },
    update: async (id: string, gpData: Partial<SmallGroup>) => {
        const response = await api.put(`/small-groups/${id}`, gpData);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/small-groups/${id}`);
    },
    getByChurch: async (churchId: string) => {
        const response = await api.get(`/churches/${churchId}/small-groups`);
        return response.data;
    },
};

// Member endpoints
export const memberAPI = {
    getAll: async () => {
        const response = await api.get('/members');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/members/${id}`);
        return response.data;
    },
    create: async (memberData: Omit<Member, 'id'>) => {
        const response = await api.post('/members', memberData);
        return response.data;
    },
    update: async (id: string, memberData: Partial<Member>) => {
        const response = await api.put(`/members/${id}`, memberData);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/members/${id}`);
    },
    getBySmallGroup: async (gpId: string) => {
        const response = await api.get(`/small-groups/${gpId}/members`);
        return response.data;
    },
};

// Missionary Pair endpoints
export const missionaryPairAPI = {
    getAll: async () => {
        const response = await api.get('/missionary-pairs');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/missionary-pairs/${id}`);
        return response.data;
    },
    create: async (pairData: Omit<MissionaryPair, 'id'>) => {
        const response = await api.post('/missionary-pairs', pairData);
        return response.data;
    },
    update: async (id: string, pairData: Partial<MissionaryPair>) => {
        const response = await api.put(`/missionary-pairs/${id}`, pairData);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/missionary-pairs/${id}`);
    },
    getBySmallGroup: async (gpId: string) => {
        const response = await api.get(`/small-groups/${gpId}/missionary-pairs`);
        return response.data;
    },
};

// Report endpoints
export const reportAPI = {
    getAll: async () => {
        const response = await api.get('/reports');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/reports/${id}`);
        return response.data;
    },
    create: async (reportData: Omit<WeeklyReport, 'id'>) => {
        const response = await api.post('/reports', reportData);
        return response.data;
    },
    update: async (id: string, reportData: Partial<WeeklyReport>) => {
        const response = await api.put(`/reports/${id}`, reportData);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/reports/${id}`);
    },
    getBySmallGroup: async (gpId: string) => {
        const response = await api.get(`/small-groups/${gpId}/reports`);
        return response.data;
    },
    getByDateRange: async (gpId: string, startDate: string, endDate: string) => {
        const response = await api.get(`/small-groups/${gpId}/reports`, {
            params: { startDate, endDate }
        });
        return response.data;
    },
};

// Global report endpoints
export const globalReportAPI = {
    getAssociationReports: async (associationId: string, startDate: string, endDate: string) => {
        const response = await api.get(`/associations/${associationId}/reports`, {
            params: { startDate, endDate }
        });
        return response.data;
    },
    getUnionReports: async (unionId: string, startDate: string, endDate: string) => {
        const response = await api.get(`/unions/${unionId}/reports`, {
            params: { startDate, endDate }
        });
        return response.data;
    },
    getGrowthReport: async (associationId: string, startDate: string, endDate: string) => {
        const response = await api.get(`/associations/${associationId}/growth-report`, {
            params: { startDate, endDate }
        });
        return response.data;
    },
};

// Export default api instance for custom requests
export default api;
