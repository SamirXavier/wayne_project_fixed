import React from 'react'
import { Outlet, Link } from 'react-router-dom'

export default function App(){
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="p-4 bg-slate-800">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Indústrias Wayne</h1>
          <nav className="space-x-4">
            <Link to="/" className="hover:underline">Dashboard</Link>
            <Link to="/resources" className="hover:underline">Recursos</Link>
            <Link to="/login" className="hover:underline">Login</Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto">
        <Outlet />
      </main>
    </div>
  )
}