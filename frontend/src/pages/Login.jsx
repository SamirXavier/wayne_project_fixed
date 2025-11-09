import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
  async function handleSubmit(e){
    e.preventDefault()
    
    // Validação básica
    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos.')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      console.log('Iniciando login...', { username })
      
      const data = await login(username, password)
      console.log('Resposta da API:', data)
      
      // Verifica se veio o token
      if (!data.access_token) {
        throw new Error('Token de acesso não recebido')
      }
      
      // Salva os tokens
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      
      console.log('Tokens salvos, redirecionando...')
      
      // Força o redirecionamento
      setTimeout(() => {
        navigate('/', { replace: true })
        window.location.href = '/' // Fallback
      }, 100)
      
    } catch (err) {
      console.error('Erro completo no login:', err)
      
      // Tratamento específico de erros
      if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        setError('Erro de conexão. Verifique se o servidor está rodando.')
      } else if (err.message.includes('401') || err.message.includes('400')) {
        setError('Credenciais inválidas. Verifique seu usuário e senha.')
      } else {
        setError(err.message || 'Erro desconhecido ao fazer login.')
      }
      
      // Limpa tokens em caso de erro
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }

  // Função para testar a API manualmente
  const testApiConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/health')
      const data = await response.json()
      console.log('Teste de API:', data)
      alert(`API está respondendo: ${data.message}`)
    } catch (error) {
      console.error('Erro no teste da API:', error)
      alert('Erro ao conectar com a API: ' + error.message)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Shield className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Wayne Security
          </h1>
          <p className="text-slate-400 mt-2">Sistema de Gerenciamento de Segurança</p>
        </div>

        {/* Card de Login */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white text-center mb-2">
            Acessar Sistema
          </h2>
          <p className="text-slate-400 text-center mb-8">
            Entre com suas credenciais
          </p>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome de Usuário
              </label>
              <div className="relative">
                <input 
                  value={username} 
                  onChange={e => {
                    setUsername(e.target.value)
                    setError('') // Limpa erro ao digitar
                  }} 
                  placeholder="admin"
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password} 
                  onChange={e => {
                    setPassword(e.target.value)
                    setError('') // Limpa erro ao digitar
                  }} 
                  placeholder="••••••••"
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 pr-12"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>

          {/* Botão de teste da API */}
          <div className="mt-4">
            <button
              type="button"
              onClick={testApiConnection}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
            >
              Testar Conexão com API
            </button>
          </div>

          {/* Credenciais de teste */}
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <h3 className="text-sm font-medium text-slate-300 mb-2 text-center">
              Credenciais de Demonstração
            </h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Usuário:</span>
                <code className="text-emerald-400 font-mono bg-slate-800 px-2 py-1 rounded">admin</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Senha:</span>
                <code className="text-emerald-400 font-mono bg-slate-800 px-2 py-1 rounded">admin123</code>
              </div>
            </div>
          </div>

          {/* Informações de segurança */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Sistema seguro das Indústrias Wayne
              <br />
              Todos os acessos são monitorados e registrados
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Indústrias Wayne. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}