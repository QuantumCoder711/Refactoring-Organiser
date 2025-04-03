import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from './pages/admin/layout';
import Login from './pages/guest/login';
import Homepage from './pages/guest/homepage';
import Dashboard from './pages/admin/dashboard';
import Error404 from './pages/404';
import AllEvents from './pages/admin/all-events';
import AllAttendees from './pages/admin/all-attendees';
import AllSponsors from './pages/admin/all-sponsors';
import AiTranscriber from './pages/admin/ai-transcriber';
import AllCharts from './pages/admin/all-charts';
import AllPhotos from './pages/admin/all-photos';
import AllReports from './pages/admin/all-reports';
import ViewEvent from './pages/admin/all-events/view-event';
import GuestLayout from './pages/guest/layout';
import useAuthStore from './store/authStore';

const App: React.FC = () => {

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route element={<GuestLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      </Route>

      <Route element={
        isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/all-events" element={<AllEvents />} />
        <Route path="/all-attendees" element={<AllAttendees />} />
        <Route path="/all-sponsors" element={<AllSponsors />} />
        <Route path="/ai-transcriber" element={<AiTranscriber />} />
        <Route path="/all-charts" element={<AllCharts />} />
        <Route path="/all-photos" element={<AllPhotos />} />
        <Route path="/all-reports" element={<AllReports />} />
        <Route path="/all-events/view/:id" element={<ViewEvent />} />
      </Route>

      <Route path="/" element={
        <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
      } />

      <Route path="/*" element={<Error404 />} />
    </Routes>
  )
}

export default App;