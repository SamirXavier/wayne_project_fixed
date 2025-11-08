import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Resources from './pages/Resources'
import './index.css'

const root = createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path='login' element={<Login />} />
          <Route path='resources' element={<Resources />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)