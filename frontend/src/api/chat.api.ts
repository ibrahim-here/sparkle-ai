import api from './axios';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    updatedAt: string;
}

export interface ChatQueryResponse {
    success: boolean;
    data: {
        sessionId: string;
        query: string;
        enhancedPrompt: string;
        agent: string;
        response: string;
    };
}

export const chatAPI = {
    sendQuery: async (query: string, sessionId?: string, signal?: AbortSignal, manualStyle?: string): Promise<ChatQueryResponse> => {
        const response = await api.post('/api/chat/query', { query, sessionId, manualStyle }, { signal });
        return response.data;
    },

    getSessions: async (): Promise<{ success: boolean; data: ChatSession[] }> => {
        const response = await api.get('/api/chat/sessions');
        return response.data;
    },

    createSession: async (title?: string): Promise<{ success: boolean; data: { id: string; title: string } }> => {
        const response = await api.post('/api/chat/sessions', { title });
        return response.data;
    },

    getSessionMessages: async (sessionId: string): Promise<{ success: boolean; data: ChatMessage[] }> => {
        const response = await api.get(`/api/chat/sessions/${sessionId}`);
        return response.data;
    },

    deleteSession: async (sessionId: string): Promise<{ success: boolean }> => {
        const response = await api.delete(`/api/chat/sessions/${sessionId}`);
        return response.data;
    }
};
