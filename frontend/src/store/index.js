import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),

    login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
    },

    register: async (email, password, name) => {
        const { data } = await api.post('/auth/register', { email, password, name });
        localStorage.setItem('token', data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));

export const useVideoStore = create((set) => ({
    videos: [],
    currentVideo: null,

    fetchVideos: async () => {
        const { data } = await api.get('/videos');
        set({ videos: data });
    },

    uploadVideo: async (formData) => {
        const { data } = await api.post('/videos/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    deleteVideo: async (id) => {
        await api.delete(`/videos/${id}`);
        set((state) => ({
            videos: state.videos.filter((v) => v.id !== id),
        }));
    },
}));

export const usePostStore = create((set) => ({
    posts: [],

    fetchPosts: async (status) => {
        const { data } = await api.get('/posts', { params: { status } });
        set({ posts: data });
    },

    createPosts: async (payload) => {
        const { data } = await api.post('/posts/create', payload);
        return data;
    },

    updatePost: async (id, updates) => {
        const { data } = await api.patch(`/posts/${id}`, updates);
        return data;
    },

    deletePost: async (id) => {
        await api.delete(`/posts/${id}`);
        set((state) => ({
            posts: state.posts.filter((p) => p.id !== id),
        }));
    },
}));

export const useIntegrationStore = create((set) => ({
    connections: [],

    fetchConnections: async () => {
        const { data } = await api.get('/integrations');
        set({ connections: data });
    },

    getAuthUrl: async (platform) => {
        const { data } = await api.get(`/integrations/${platform}/connect`);
        return data.authUrl;
    },

    disconnect: async (platform) => {
        await api.delete(`/integrations/${platform}`);
        set((state) => ({
            connections: state.connections.filter((c) => c.platform !== platform.toUpperCase()),
        }));
    },
}));

export const useAIStore = create(() => ({
    generateDescriptions: async (originalDescription, platforms) => {
        const { data } = await api.post('/ai/generate-descriptions', {
            originalDescription,
            platforms,
        });
        return data;
    },
}));

export const useAnalyticsStore = create((set) => ({
    overview: null,
    platformData: {},

    fetchOverview: async () => {
        const { data } = await api.get('/analytics/overview');
        set({ overview: data });
    },

    fetchPlatformAnalytics: async (platform) => {
        const { data } = await api.get(`/analytics/${platform}`);
        set((state) => ({
            platformData: { ...state.platformData, [platform]: data },
        }));
    },
}));

export { api };
