// frontend/src/pages/Users.jsx
import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, AlertCircle, User, Mail, Key, Shield, UserCheck } from 'lucide-react'
import { 
  listUsers, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../services/api'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'employee'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await listUsers()
      setUsers(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      alert('Erro ao carregar usuários: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'employee'
    })
    setEditingUser(null)
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setErrors({})

    try {
      if (editingUser) {
        // Editar usuário existente
        await updateUser(editingUser.id, form)
        alert('Usuário atualizado com sucesso!')
      } else {
        // Criar novo usuário
        await createUser(form)
        alert('Usuário criado com sucesso!')
      }
      
      resetForm()
      setShowForm(false)
      loadUsers() // Recarregar a lista
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      setErrors({ general: error.message })
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setForm({
      username: user.username,
      email: user.email,
      password: '', // Não preencher a senha por segurança
      full_name: user.full_name || '',
      role: user.role
    })
    setShowForm(true)
    setErrors({})
  }

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${username}"?\nEsta ação não pode ser desfeita.`)) {
      return
    }

    try {
      await deleteUser(userId)
      alert('Usuário excluído com sucesso!')
      loadUsers() // Recarregar a lista
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert('Erro ao excluir usuário: ' + error.message)
    }
  }

  const handleCancel = () => {
    resetForm()
    setShowForm(false)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'security_admin': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'manager': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'employee': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getRoleText = (role) => {
    const roles = {
      security_admin: 'Administrador de Segurança',
      manager: 'Gerente',
      employee: 'Funcionário'
    }
    return roles[role] || role
  }

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gerenciar Usuários</h1>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition duration-200 font-semibold"
        >
          <Plus className="h-5 w-5" />
          Novo Usuário
        </button>
      </div>

      {/* Formulário Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
                  Nome de Usuário *
                </label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Nome de usuário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {editingUser ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha *'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required={!editingUser}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
                    placeholder="Senha segura"
                  />
                  <Key className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
                    placeholder="Nome completo do usuário"
                  />
                  <User className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Função *
                </label>
                <div className="relative">
                  <select
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10 appearance-none"
                  >
                    <option value="employee">Funcionário</option>
                    <option value="manager">Gerente</option>
                    <option value="security_admin">Administrador de Segurança</option>
                  </select>
                  <Shield className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
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
                      {editingUser ? 'Atualizar' : 'Criar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Usuários */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
            <p className="text-slate-400 mt-2">Carregando usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Nenhum usuário cadastrado. Clique em "Novo Usuário" para adicionar.
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <div key={user.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500">
                          <UserCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">
                            {user.full_name || 'Sem nome'}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-slate-300">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span className="text-sm">{user.username}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              <span className="text-sm">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-slate-400 hover:text-emerald-400 transition duration-200"
                          title="Editar usuário"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="p-2 text-slate-400 hover:text-red-400 transition duration-200"
                          title="Excluir usuário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                        <Shield className="h-3 w-3" />
                        {getRoleText(user.role)}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(user.is_active)}`}>
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    <div className="mt-2 text-xs text-slate-500">
                      Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      {user.accessible_areas && user.accessible_areas.length > 0 && (
                        <span className="ml-2">
                          • {user.accessible_areas.length} área(s) de acesso
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