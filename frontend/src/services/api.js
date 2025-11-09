// frontend/src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

// ==============================================================================
// FUNÇÃO AUXILIAR PARA REQUESTS
// ==============================================================================

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('access_token')
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// ==============================================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ==============================================================================

export async function login(username, password) {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  const response = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Login failed: ${errorText}`)
  }

  return response.json()
}

export async function refreshToken(refreshToken) {
  return apiRequest('/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

export async function logout(refreshToken) {
  return apiRequest('/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

export async function getMe() {
  return apiRequest('/users/me')
}

// ==============================================================================
// FUNÇÕES DE USUÁRIOS
// ==============================================================================

export async function listUsers() {
  return apiRequest('/users/')
}

export async function createUser(user) {
  return apiRequest('/users/', {
    method: 'POST',
    body: JSON.stringify(user),
  })
}

export async function getUser(userId) {
  return apiRequest(`/users/${userId}`)
}

export async function updateUser(userId, user) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('Token de acesso não encontrado. Faça login novamente.')
  }

  try {
    console.log('Atualizando usuário:', userId, user)
    
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      
      try {
        const errorData = await response.json()
        console.log('Resposta de erro:', errorData)
        
        if (errorData.detail) {
          errorMessage = errorData.detail
        }
      } catch (e) {
        const text = await response.text()
        errorMessage = text || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    throw error
  }
}

export async function deleteUser(userId) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('Token de acesso não encontrado. Faça login novamente.')
  }

  try {
    console.log('Excluindo usuário:', userId)
    
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro ao excluir: ${errorText}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    throw error
  }
}

// ==============================================================================
// FUNÇÕES DE RECURSOS
// ==============================================================================

export async function listResources() {
  return apiRequest('/resources/')
}

export async function createResource(resource) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('Token de acesso não encontrado. Faça login novamente.')
  }

  try {
    console.log('Criando recurso:', resource)
    
    const response = await fetch(`${API_BASE}/resources/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(resource),
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      
      // Tenta extrair detalhes do erro
      try {
        const errorData = await response.json()
        console.log('Resposta de erro:', errorData)
        
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Erro de validação do Pydantic
            errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
          } else {
            errorMessage = errorData.detail
          }
        }
      } catch (e) {
        // Se não conseguir parsear como JSON, usa o texto
        const text = await response.text()
        errorMessage = text || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao criar recurso:', error)
    throw error
  }
}

export async function updateResource(resourceId, resource) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('Token de acesso não encontrado. Faça login novamente.')
  }

  try {
    console.log('Atualizando recurso:', resourceId, resource)
    
    const response = await fetch(`${API_BASE}/resources/${resourceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(resource),
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      
      try {
        const errorData = await response.json()
        console.log('Resposta de erro:', errorData)
        
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
          } else {
            errorMessage = errorData.detail
          }
        }
      } catch (e) {
        const text = await response.text()
        errorMessage = text || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao atualizar recurso:', error)
    throw error
  }
}

export async function deleteResource(resourceId) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('Token de acesso não encontrado. Faça login novamente.')
  }

  try {
    console.log('Excluindo recurso:', resourceId)
    
    const response = await fetch(`${API_BASE}/resources/${resourceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro ao excluir: ${errorText}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir recurso:', error)
    throw error
  }
}

// ==============================================================================
// FUNÇÕES DE ÁREAS RESTRITAS
// ==============================================================================

export async function listRestrictedAreas() {
  return apiRequest('/restricted-areas/')
}

export async function getRestrictedArea(areaId) {
  return apiRequest(`/restricted-areas/${areaId}`)
}

export async function createRestrictedArea(area) {
  return apiRequest('/restricted-areas/', {
    method: 'POST',
    body: JSON.stringify(area),
  })
}

export async function updateRestrictedArea(areaId, area) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('Token de acesso não encontrado. Faça login novamente.')
  }

  try {
    console.log('Atualizando área restrita:', areaId, area)
    
    const response = await fetch(`${API_BASE}/restricted-areas/${areaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(area),
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      
      try {
        const errorData = await response.json()
        console.log('Resposta de erro:', errorData)
        
        if (errorData.detail) {
          errorMessage = errorData.detail
        }
      } catch (e) {
        const text = await response.text()
        errorMessage = text || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao atualizar área restrita:', error)
    throw error
  }
}

export async function deleteRestrictedArea(areaId) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('Token de acesso não encontrado. Faça login novamente.')
  }

  try {
    console.log('Excluindo área restrita:', areaId)
    
    const response = await fetch(`${API_BASE}/restricted-areas/${areaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro ao excluir: ${errorText}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir área restrita:', error)
    throw error
  }
}

export async function grantAreaAccess(areaId, userId) {
  return apiRequest(`/restricted-areas/${areaId}/grant-access/${userId}`, {
    method: 'POST',
  })
}

export async function revokeAreaAccess(areaId, userId) {
  return apiRequest(`/restricted-areas/${areaId}/revoke-access/${userId}`, {
    method: 'POST',
  })
}

// ==============================================================================
// FUNÇÕES DE LOGS DE ACESSO
// ==============================================================================

export async function listAccessLogs() {
  return apiRequest('/access-logs/')
}

export async function getAccessLog(logId) {
  return apiRequest(`/access-logs/${logId}`)
}

export async function getUserAccessLogs(userId) {
  return apiRequest(`/access-logs/user/${userId}`)
}

export async function createAccessLog(accessLog) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('Token de acesso não encontrado. Faça login novamente.')
  }

  try {
    console.log('Criando log de acesso:', accessLog)
    
    const response = await fetch(`${API_BASE}/access-logs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(accessLog),
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      
      try {
        const errorData = await response.json()
        console.log('Resposta de erro:', errorData)
        
        if (errorData.detail) {
          errorMessage = errorData.detail
        }
      } catch (e) {
        const text = await response.text()
        errorMessage = text || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao criar log de acesso:', error)
    throw error
  }
}

export async function deleteAccessLog(logId) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('Token de acesso não encontrado. Faça login novamente.')
  }

  try {
    console.log('Excluindo log de acesso:', logId)
    
    const response = await fetch(`${API_BASE}/access-logs/${logId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro ao excluir: ${errorText}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir log de acesso:', error)
    throw error
  }
}

// ==============================================================================
// FUNÇÕES DE DASHBOARD
// ==============================================================================

export async function getDashboardStats() {
  return apiRequest('/dashboard/stats')
}