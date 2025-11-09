// frontend/src/pages/RestrictedAreas.jsx
import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, AlertCircle, MapPin, Users, Shield } from 'lucide-react'
import { 
  listRestrictedAreas, 
  createRestrictedArea, 
  updateRestrictedArea, 
  deleteRestrictedArea,
  grantAreaAccess,
  revokeAreaAccess,
  listUsers
} from '../services/api'

export default function RestrictedAreas() {
  const [areas, setAreas] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingArea, setEditingArea] = useState(null)
  const [accessManagement, setAccessManagement] = useState(null)
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    security_level: 'medium',
    location: ''
  })

  const [selectedUser, setSelectedUser] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadAreas()
    loadUsers()
  }, [])

  const loadAreas = async () => {
    setLoading(true)
    try {
      const data = await listRestrictedAreas()
      setAreas(data)
    } catch (error) {
      console.error('Erro ao carregar áreas restritas:', error)
      alert('Erro ao carregar áreas restritas: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await listUsers()
      setUsers(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      security_level: 'medium',
      location: ''
    })
    setEditingArea(null)
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setErrors({})

    try {
      if (editingArea) {
        // Editar área existente
        await updateRestrictedArea(editingArea.id, form)
        alert('Área restrita atualizada com sucesso!')
      } else {
        // Criar nova área
        await createRestrictedArea(form)
        alert('Área restrita criada com sucesso!')
      }
      
      resetForm()
      setShowForm(false)
      loadAreas() // Recarregar a lista
    } catch (error) {
      console.error('Erro ao salvar área restrita:', error)
      setErrors({ general: error.message })
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (area) => {
    setEditingArea(area)
    setForm({
      name: area.name,
      description: area.description || '',
      security_level: area.security_level,
      location: area.location || ''
    })
    setShowForm(true)
    setErrors({})
  }

  const handleDelete = async (areaId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta área restrita?\nEsta ação não pode ser desfeita.')) {
      return
    }

    try {
      await deleteRestrictedArea(areaId)
      alert('Área restrita excluída com sucesso!')
      loadAreas() // Recarregar a lista
    } catch (error) {
      console.error('Erro ao excluir área restrita:', error)
      alert('Erro ao excluir área restrita: ' + error.message)
    }
  }

  const handleGrantAccess = async (areaId, userId) => {
    if (!userId) {
      alert('Selecione um usuário para conceder acesso.')
      return
    }

    try {
      await grantAreaAccess(areaId, userId)
      alert('Acesso concedido com sucesso!')
      setAccessManagement(null)
      loadAreas() // Recarregar para atualizar a lista de usuários autorizados
    } catch (error) {
      console.error('Erro ao conceder acesso:', error)
      alert('Erro ao conceder acesso: ' + error.message)
    }
  }

  const handleRevokeAccess = async (areaId, userId) => {
    if (!window.confirm('Tem certeza que deseja revogar o acesso deste usuário?')) {
      return
    }

    try {
      await revokeAreaAccess(areaId, userId)
      alert('Acesso revogado com sucesso!')
      loadAreas() // Recarregar para atualizar a lista de usuários autorizados
    } catch (error) {
      console.error('Erro ao revogar acesso:', error)
      alert('Erro ao revogar acesso: ' + error.message)
    }
  }

  const handleCancel = () => {
    resetForm()
    setShowForm(false)
  }

  const getSecurityLevelColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getSecurityLevelText = (level) => {
    const levels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      critical: 'Crítica'
    }
    return levels[level] || level
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Áreas Restritas</h1>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition duration-200 font-semibold"
        >
          <Plus className="h-5 w-5" />
          Nova Área
        </button>
      </div>

      {/* Formulário Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                {editingArea ? 'Editar Área Restrita' : 'Nova Área Restrita'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.general}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Nome da área restrita"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Descrição da área restrita"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nível de Segurança *
                </label>
                <select
                  required
                  value={form.security_level}
                  onChange={(e) => setForm({ ...form, security_level: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Localização
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Localização da área"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={formLoading}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white py-2 px-4 rounded-md transition duration-200 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-2 px-4 rounded-md transition duration-200 font-semibold flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingArea ? 'Atualizar' : 'Criar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Gerenciamento de Acesso */}
      {accessManagement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                Gerenciar Acesso - {accessManagement.name}
              </h2>
              <button
                onClick={() => setAccessManagement(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Conceder acesso */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Conceder Acesso a Usuário
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Selecione um usuário</option>
                    {users.filter(user => 
                      !accessManagement.authorized_users?.some(authorized => authorized.id === user.id)
                    ).map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.username} ({user.role})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleGrantAccess(accessManagement.id, selectedUser)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md transition duration-200 font-semibold"
                  >
                    Conceder
                  </button>
                </div>
              </div>

              {/* Lista de usuários com acesso */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">
                  Usuários com Acesso ({accessManagement.authorized_users?.length || 0})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {accessManagement.authorized_users?.length > 0 ? (
                    accessManagement.authorized_users.map(user => (
                      <div key={user.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                        <div>
                          <div className="text-white font-medium">
                            {user.full_name || user.username}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {user.role} • {user.email}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeAccess(accessManagement.id, user.id)}
                          className="text-red-400 hover:text-red-300 transition duration-200"
                          title="Revogar acesso"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-400 py-4">
                      Nenhum usuário com acesso
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Áreas Restritas */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
        {/* TÍTULO REMOVIDO AQUI - estava duplicado */}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
            <p className="text-slate-400 mt-2">Carregando áreas restritas...</p>
          </div>
        ) : areas.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Nenhuma área restrita cadastrada. Clique em "Nova Área" para adicionar.
          </div>
        ) : (
          <div className="grid gap-4">
            {areas.map((area) => (
              <div key={area.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white text-lg">{area.name}</h3>
                        <p className="text-slate-300 mt-1">{area.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAccessManagement(area)}
                          className="p-2 text-slate-400 hover:text-blue-400 transition duration-200"
                          title="Gerenciar acesso"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(area)}
                          className="p-2 text-slate-400 hover:text-emerald-400 transition duration-200"
                          title="Editar área"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(area.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition duration-200"
                          title="Excluir área"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getSecurityLevelColor(area.security_level)}`}>
                        <Shield className="h-3 w-3" />
                        {getSecurityLevelText(area.security_level)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <Users className="h-3 w-3" />
                        {area.authorized_users?.length || 0} usuários
                      </span>
                    </div>
                    
                    {area.location && (
                      <div className="mt-2 flex items-center gap-2 text-slate-400">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{area.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}