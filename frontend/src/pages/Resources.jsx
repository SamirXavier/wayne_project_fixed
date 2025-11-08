import React, {useEffect, useState} from 'react'
import { listResources, createResource } from '../services/api'  // Caminho corrigido

export default function Resources(){
  const [resources, setResources] = useState([])
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  
  useEffect(()=>{
    const token = localStorage.getItem('access_token')
    if(!token) return
    listResources(token).then(setResources).catch((err) => {
      console.error('Error loading resources:', err)
    })
  },[])

  async function handleCreate(e){
    e.preventDefault()
    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('Você precisa estar logado para criar recursos')
      return
    }
    
    try {
      const res = await createResource(token, {name, type:'equipment', details})
      setResources(prev=>[res, ...prev])
      setName('')
      setDetails('')
    } catch (error) {
      console.error('Error creating resource:', error)
      alert('Erro ao criar recurso: ' + error.message)
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl mb-4">Recursos</h2>
      <form onSubmit={handleCreate} className="mb-6 grid grid-cols-2 gap-2">
        <input 
          className="p-2 rounded bg-slate-800" 
          value={name} 
          onChange={e=>setName(e.target.value)} 
          placeholder='Nome do recurso'
          required
        />
        <input 
          className="p-2 rounded bg-slate-800" 
          value={details} 
          onChange={e=>setDetails(e.target.value)} 
          placeholder='Detalhes'
        />
        <div className="col-span-2">
          <button type="submit" className="px-4 py-2 rounded bg-emerald-600">
            Adicionar
          </button>
        </div>
      </form>
      <ul className="space-y-2">
        {resources.map(r=> (
          <li key={r.id} className="p-3 bg-slate-800 rounded">
            <strong>{r.name}</strong> — {r.type}
            <div className="text-sm text-slate-400">{r.details}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}