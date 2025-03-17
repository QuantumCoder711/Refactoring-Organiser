import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from './pages/admin/layout';
import Login from './pages/auth/login';
import Homepage from './pages/guest/homepage';
import Dashboard from './pages/admin/dashboard';
import Error404 from './pages/404';
const App: React.FC = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />

      <Route element={
        isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
      }>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route path="/" element={
        <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
      } />

      <Route path="/*" element={<Error404 />} />
    </Routes>
  )
}

export default App;
