import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Layout from './layout';
import Login from './pages/login';
import Homepage from './pages/homepage';

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
    </Routes>
  )
}

export default App;
