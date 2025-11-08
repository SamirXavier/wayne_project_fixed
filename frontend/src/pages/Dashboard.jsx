import React, {useEffect, useState} from 'react'
import { getMe, refreshToken, logout } from '../services/api'  // Caminho corrigido

export default function Dashboard(){
  const [user, setUser] = useState(null)
  
  useEffect(()=>{
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
          console.log('refresh failed', e)
        }
      }
      
      if(!token) return
      
      try{
        const me = await getMe(token)
        setUser(me)
      }catch(e){
        console.log('getMe failed', e)
        setUser(null)
      }
    }
    load()
  },[])

  async function handleLogout(){
    const refresh = localStorage.getItem('refresh_token')
    if(refresh){
      try {
        await logout(refresh)
      } catch (e) {
        console.log('Logout error:', e)
      }
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard — Indústrias Wayne</h1>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span>{user.full_name || user.username} ({user.role})</span>
              <button onClick={handleLogout} className="ml-4 px-3 py-1 rounded bg-rose-600">
                Logout
              </button>
            </div>
          ) : (
            <span>Não autenticado</span>
          )}
        </div>
      </div>
      <p className="text-slate-300">Painel com métricas e controles (placeholder)</p>
    </div>
  )
}