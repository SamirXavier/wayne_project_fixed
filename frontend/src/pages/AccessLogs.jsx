// frontend/src/pages/AccessLogs.jsx
import React, { useState, useEffect } from 'react'
import { 
  Eye, 
  Trash2, 
  Filter, 
  User, 
  MapPin, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Download
} from 'lucide-react'
import { 
  listAccessLogs, 
  deleteAccessLog,
  listUsers,
  listRestrictedAreas,
  createAccessLog
} from '../services/api'

export default function AccessLogs() {
  const [logs, setLogs] = useState([])
  const [users, setUsers] = useState([])
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filters, setFilters] = useState({
    user_id: '',
    area_id: '',
    status: '',
    search: ''
  })

  const [form, setForm] = useState({
    user_id: '',
    area_id: '',
    access_type: 'entry',
    status: 'granted'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [logsData, usersData, areasData] = await Promise.all([
        listAccessLogs(),
        listUsers(),
        listRestrictedAreas()
      ])
      setLogs(logsData)
      setUsers(usersData)
      setAreas(areasData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar logs de acesso: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLog = async (e) => {
    e.preventDefault()
    setErrors({})

    try {
      await createAccessLog(form)
      alert('Log de acesso criado com sucesso!')
      setShowCreateForm(false)
      setForm({
        user_id: '',
        area_id: '',
        access_type: 'entry',
        status: 'granted'
      })
      loadData()
    } catch (error) {
      console.error('Erro ao criar log:', error)
      setErrors({ general: error.message })
    }
  }

  const handleDeleteLog = async (logId, userName, areaName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o log de acesso de ${userName} na área ${areaName}?`)) {
      return
    }

    try {
      await deleteAccessLog(logId)
      alert('Log de acesso excluído com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir log:', error)
      alert('Erro ao excluir log: ' + error.message)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const filteredLogs = logs.filter(log => {
    if (filters.user_id && log.user_id !== parseInt(filters.user_id)) return false
    if (filters.area_id && log.area_id !== parseInt(filters.area_id)) return false
    if (filters.status && log.status !== filters.status) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const userName = log.user?.full_name || log.user?.username || ''
      const areaName = log.area?.name || ''
      return (
        userName.toLowerCase().includes(searchLower) ||
        areaName.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const getStatusColor = (status) => {
    return status === 'granted' 
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const getAccessTypeColor = (type) => {
    return type === 'entry'
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const exportToCSV = () => {
    const headers = ['Data', 'Hora', 'Usuário', 'Área', 'Tipo', 'Status']
    const csvData = filteredLogs.map(log => {
      const { date, time } = formatDateTime(log.access_time)
      return [
        date,
        time,
        log.user?.full_name || log.user?.username || 'N/A',
        log.area?.name || 'N/A',
        log.access_type === 'entry' ? 'Entrada' : 'Saída',
        log.status === 'granted' ? 'Permitido' : 'Negado'
      ]
    })

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `logs-acesso-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Logs de Acesso</h1>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 font-semibold"
          >
            <Download className="h-5 w-5" />
            Exportar CSV
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition duration-200 font-semibold"
          >
            <Eye className="h-5 w-5" />
            Registrar Acesso
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-white">Filtros</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.user_id}
            onChange={(e) => handleFilterChange('user_id', e.target.value)}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">Todos os usuários</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.full_name || user.username}
              </option>
            ))}
          </select>

          <select
            value={filters.area_id}
            onChange={(e) => handleFilterChange('area_id', e.target.value)}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">Todas as áreas</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="granted">Permitido</option>
            <option value="denied">Negado</option>
          </select>

          <button
            onClick={() => setFilters({ user_id: '', area_id: '', status: '', search: '' })}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition duration-200 font-semibold"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Modal de Criação */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Registrar Acesso</h2>

            <form onSubmit={handleCreateLog} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {errors.general}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Usuário *
                </label>
                <select
                  required
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Selecione um usuário</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Área Restrita *
                </label>
                <select
                  required
                  value={form.area_id}
                  onChange={(e) => setForm({ ...form, area_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Selecione uma área</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Tipo de Acesso *
                </label>
                <select
                  required
                  value={form.access_type}
                  onChange={(e) => setForm({ ...form, access_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="entry">Entrada</option>
                  <option value="exit">Saída</option>
                </select>
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
                  <option value="granted">Permitido</option>
                  <option value="denied">Negado</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-md transition duration-200 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md transition duration-200 font-semibold"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Logs */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Registros de Acesso ({filteredLogs.length})
          </h2>
          <div className="text-slate-400 text-sm">
            {filteredLogs.length} de {logs.length} registros
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
            <p className="text-slate-400 mt-2">Carregando logs de acesso...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            {logs.length === 0 ? 'Nenhum log de acesso encontrado.' : 'Nenhum log corresponde aos filtros.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const { date, time } = formatDateTime(log.access_time)
              return (
                <div key={log.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${getStatusColor(log.status)}`}>
                            {log.status === 'granted' ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <XCircle className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">
                              {log.user?.full_name || log.user?.username || 'Usuário desconhecido'}
                            </h3>
                            <p className="text-slate-300 text-sm">
                              acessou {log.area?.name || 'Área desconhecida'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteLog(log.id, log.user?.full_name || log.user?.username, log.area?.name)}
                          className="p-2 text-slate-400 hover:text-red-400 transition duration-200"
                          title="Excluir log"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(log.status)}`}>
                          {log.status === 'granted' ? 'Permitido' : 'Negado'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getAccessTypeColor(log.access_type)}`}>
                          {log.access_type === 'entry' ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{log.user?.role || 'N/A'}</span>
                        </div>
                        {log.area?.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{log.area.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}