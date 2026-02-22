let authToken: string | null = null;

export function setToken(token: string | null) {
    authToken = token;
}

export function getToken(): string | null {
    return authToken;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new ApiError(
            (body as { error?: string }).error ?? response.statusText,
            response.status,
        );
    }

    return response.json() as Promise<T>;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const api = {
    register(email: string, password: string) {
        return request<{ id: string; email: string }>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    login(email: string, password: string) {
        return request<{ token: string }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    getProfile() {
        return request<{ id: string; email: string; createdAt: string }>('/api/auth/profile');
    },

    deleteProfile() {
        return request<{ message: string }>('/api/auth/profile', { method: 'DELETE' });
    },

    exportData() {
        return request<{ user: object; todos: object[] }>('/api/auth/export');
    },

    getItems() {
        return request<{ id: string; name: string; completed: boolean; userId: string }[]>('/api/items');
    },

    addItem(name: string) {
        return request<{ id: string; name: string; completed: boolean; userId: string }>('/api/items', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    updateItem(id: string, data: { name: string; completed: boolean }) {
        return request<{ id: string; name: string; completed: boolean; userId: string }>(`/api/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteItem(id: string) {
        return fetch(`/api/items/${id}`, {
            method: 'DELETE',
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
    },
};
