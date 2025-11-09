import React, { useEffect, useState } from 'react'
import { getMe, refreshToken, logout } from '../services/api'
import { 
  Users, 
  FolderOpen, 
  MapPin, 
  Shield, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Clock
} from 'lucide-react'

export default function Dashboard(){
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load(){
      let token = localStorage.getItem('access_token')
      const refresh = localStorage.getItem('refresh_token')
      
      if(!token && refresh){
        try{
          const data = await refreshToken(refresh)
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          token = data.access_token
        }catch(e){
          console.log('refresh failed')
        }
      }
      
      if(!token) return
      
      try{
        const me = await getMe(token)
        setUser(me)
        
        // Buscar estatísticas do dashboard
        const statsResponse = await fetch(`${import.meta.env.VITE_API_BASE}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      }catch(e){
        console.log('getMe failed', e)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const StatCard = ({ icon: Icon, title, value, change, changeType = 'neutral' }) => (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              changeType === 'positive' ? 'text-emerald-400' : 
              changeType === 'negative' ? 'text-rose-400' : 'text-slate-400'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-slate-700/50">
          <Icon className="h-6 w-6 text-emerald-400" />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Dashboard de Segurança
          </h1>
          <p className="text-slate-400 mt-2">
            Visão geral das operações de segurança das Indústrias Wayne
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-slate-400 text-sm">Sistema Online</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total de Usuários"
            value={stats.total_users}
            change="+2 esta semana"
            changeType="positive"
          />
          <StatCard
            icon={FolderOpen}
            title="Recursos Cadastrados"
            value={stats.total_resources}
            change="+5 este mês"
            changeType="positive"
          />
          <StatCard
            icon={MapPin}
            title="Áreas Restritas"
            value={stats.total_restricted_areas}
          />
          <StatCard
            icon={Activity}
            title="Acessos Recentes"
            value={stats.recent_access_logs}
            change="Últimas 24h"
          />
          <StatCard
            icon={Shield}
            title="Incidentes de Segurança"
            value={stats.security_incidents}
            changeType={stats.security_incidents > 0 ? 'negative' : 'neutral'}
          />
          <StatCard
            icon={TrendingUp}
            title="Taxa de Acesso"
            value="98.5%"
            change="+0.2%"
            changeType="positive"
          />
          <StatCard
            icon={Clock}
            title="Uptime do Sistema"
            value="99.9%"
            change="Estável"
            changeType="positive"
          />
          <StatCard
            icon={AlertTriangle}
            title="Alertas Ativos"
            value="2"
            changeType="negative"
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recursos por Tipo */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recursos por Tipo</h3>
          <div className="space-y-3">
            {stats?.resources_by_type && Object.entries(stats.resources_by_type).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-slate-300 capitalize">{type}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full"
                      style={{ width: `${(count / stats.total_resources) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-slate-300">Acesso concedido - Laboratório</span>
              </div>
              <span className="text-slate-400 text-sm">2 min atrás</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                <span className="text-slate-300">Tentativa de acesso negada</span>
              </div>
              <span className="text-slate-400 text-sm">15 min atrás</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-slate-300">Novo recurso cadastrado</span>
              </div>
              <span className="text-slate-400 text-sm">1 hora atrás</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors">
            <span className="text-emerald-400 font-medium">Cadastrar Recurso</span>
          </button>
          <button className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors">
            <span className="text-blue-400 font-medium">Gerenciar Acessos</span>
          </button>
          <button className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors">
            <span className="text-purple-400 font-medium">Ver Logs</span>
          </button>
          <button className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors">
            <span className="text-amber-400 font-medium">Gerar Relatório</span>
          </button>
        </div>
      </div>
    </div>
  )
}