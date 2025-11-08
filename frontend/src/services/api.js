const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

// Função auxiliar para tratar erros de rede
async function handleResponse(response) {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
}

export async function login(username, password) {
    try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE}/token`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Login error:', error);
        throw new Error(`Falha na conexão: ${error.message}`);
    }
}

export async function refreshToken(refreshToken) {
    try {
        const response = await fetch(`${API_BASE}/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
        return await handleResponse(response);
    } catch (error) {
        throw new Error(`Refresh failed: ${error.message}`);
    }
}

export async function logout(refreshToken) {
    try {
        const response = await fetch(`${API_BASE}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Logout error:', error);
    }
}

export async function getMe(token) {
    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return await handleResponse(response);
    } catch (error) {
        throw new Error(`Not authorized: ${error.message}`);
    }
}

export async function listResources(token) {
    try {
        const response = await fetch(`${API_BASE}/resources/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return await handleResponse(response);
    } catch (error) {
        throw new Error(`Failed to fetch resources: ${error.message}`);
    }
}

export async function createResource(token, resource) {
    try {
        const response = await fetch(`${API_BASE}/resources/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(resource),
        });
        return await handleResponse(response);
    } catch (error) {
        throw new Error(`Failed to create resource: ${error.message}`);
    }
}