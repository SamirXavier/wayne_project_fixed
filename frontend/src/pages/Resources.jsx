// frontend/src/pages/Resources.jsx
import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, AlertCircle } from 'lucide-react'
import { 
  listResources, 
  createResource, 
  updateResource, 
  deleteResource 
} from '../services/api'

export default function Resources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  
  const [form, setForm] = useState({
    name: '',
    type: 'equipment',
    details: '',
    status: 'available',
    location: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    setLoading(true)
    try {
      const data = await listResources()
      setResources(data)
    } catch (error) {
      console.error('Erro ao carregar recursos:', error)
      alert('Erro ao carregar recursos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      type: 'equipment',
      details: '',
      status: 'available',
      location: ''
    })
    setEditingResource(null)
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setErrors({})

    try {
      if (editingResource) {
        // Editar recurso existente
        await updateResource(editingResource.id, form)
        alert('Recurso atualizado com sucesso!')
      } else {
        // Criar novo recurso
        await createResource(form)
        alert('Recurso criado com sucesso!')
      }
      
      resetForm()
      setShowForm(false)
      loadResources() // Recarregar a lista
    } catch (error) {
      console.error('Erro ao salvar recurso:', error)
      
      // Tentar extrair mensagens de erro específicas
      if (error.message.includes('validation error') || error.message.includes('Validation Error')) {
        setErrors({ general: 'Dados inválidos. Verifique os campos.' })
      } else {
        setErrors({ general: error.message })
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (resource) => {
    setEditingResource(resource)
    setForm({
      name: resource.name,
      type: resource.type,
      details: resource.details || '',
      status: resource.status,
      location: resource.location || ''
    })
    setShowForm(true)
    setErrors({})
  }

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Tem certeza que deseja excluir este recurso?')) {
      return
    }

    try {
      await deleteResource(resourceId)
      alert('Recurso excluído com sucesso!')
      loadResources() // Recarregar a lista
    } catch (error) {
      console.error('Erro ao excluir recurso:', error)
      alert('Erro ao excluir recurso: ' + error.message)
    }
  }

  const handleCancel = () => {
    resetForm()
    setShowForm(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'in_use': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'out_of_service': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTypeText = (type) => {
    const types = {
      equipment: 'Equipamento',
      vehicle: 'Veículo',
      security_device: 'Dispositivo de Segurança',
      other: 'Outro'
    }
    return types[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gerenciar Recursos</h1>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition duration-200 font-semibold"
        >
          <Plus className="h-5 w-5" />
          Novo Recurso
        </button>
      </div>

      {/* Formulário Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                {editingResource ? 'Editar Recurso' : 'Novo Recurso'}
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
                  placeholder="Nome do recurso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Tipo *
                </label>
                <select
                  required
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="equipment">Equipamento</option>
                  <option value="vehicle">Veículo</option>
                  <option value="security_device">Dispositivo de Segurança</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Detalhes
                </label>
                <textarea
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Descrição detalhada do recurso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Status *
                </label>
                <select
                  required
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="available">Disponível</option>
                  <option value="in_use">Em Uso</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="out_of_service">Fora de Serviço</option>
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
                  placeholder="Localização do recurso"
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
                      {editingResource ? 'Atualizar' : 'Criar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Recursos */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Recursos Cadastrados</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
            <p className="text-slate-400 mt-2">Carregando recursos...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Nenhum recurso cadastrado. Clique em "Novo Recurso" para adicionar.
          </div>
        ) : (
          <div className="grid gap-4">
            {resources.map((resource) => (
              <div key={resource.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-white text-lg">{resource.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(resource)}
                          className="p-2 text-slate-400 hover:text-emerald-400 transition duration-200"
                          title="Editar recurso"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(resource.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition duration-200"
                          title="Excluir recurso"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 mt-2">{resource.details}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {getTypeText(resource.type)}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(resource.status)}`}>
                        {resource.status === 'available' && 'Disponível'}
                        {resource.status === 'in_use' && 'Em Uso'}
                        {resource.status === 'maintenance' && 'Manutenção'}
                        {resource.status === 'out_of_service' && 'Fora de Serviço'}
                      </span>
                    </div>
                    
                    {resource.location && (
                      <div className="mt-2 flex items-center gap-2 text-slate-400">
                        <span className="text-sm">📍 {resource.location}</span>
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-slate-500">
                      Criado em: {new Date(resource.created_at).toLocaleDateString('pt-BR')}
                      {resource.updated_at !== resource.created_at && (
                        <span className="ml-2">
                          (Atualizado: {new Date(resource.updated_at).toLocaleDateString('pt-BR')})
                        </span>
                      )}
                    </div>
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