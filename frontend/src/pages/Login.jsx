import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'  // Caminho corrigido

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  
  async function handleSubmit(e){
    e.preventDefault()
    try{
      const data = await login(username, password)
      console.log('Login response:', data) // Para debug
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      navigate('/')
    }catch(err){
      console.error('Login error:', err) // Para debug
      alert('Falha no login: ' + err.message)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Wayne Industries — Login</h2>
        <input 
          value={username} 
          onChange={e=>setUsername(e.target.value)} 
          placeholder='Usuário' 
          className="w-full p-3 mb-4 rounded bg-slate-700"
        />
        <input 
          type='password' 
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          placeholder='Senha' 
          className="w-full p-3 mb-6 rounded bg-slate-700"
        />
        <button type="submit" className="w-full py-3 rounded bg-indigo-600 hover:bg-indigo-500">
          Entrar
        </button>
      </form>
    </div>
  )
}