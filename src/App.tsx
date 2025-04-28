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
import Attendees from './pages/admin/all-events/attendees';
import AddAttendee from './pages/admin/all-events/add-attendee';
import MessageTemplateLayout from './pages/admin/template-messages/layout';
import SendReminder from './pages/admin/template-messages/send-reminder';
import VisitBoothReminder from './pages/admin/template-messages/visit-booth-reminder';
import AllMessageTemplates from './pages/admin/template-messages';
import SessionReminder from './pages/admin/template-messages/session-reminder';
import SendSameDayReminder from './pages/admin/template-messages/send-same-day-reminder';
import DayTwoReminder from './pages/admin/template-messages/day-two-reminder';
import DayTwoSameDayReminder from './pages/admin/template-messages/day-two-same-day-reminder';

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
        {/* Sidebar Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/all-events" element={<AllEvents />} />
        <Route path="/all-attendees" element={<AllAttendees />} />
        <Route path="/all-sponsors" element={<AllSponsors />} />
        <Route path="/ai-transcriber" element={<AiTranscriber />} />
        <Route path="/all-charts" element={<AllCharts />} />
        <Route path="/all-photos" element={<AllPhotos />} />
        <Route path="/all-reports" element={<AllReports />} />

        {/* Sidebar Inner Routes */}
        <Route path="/all-events/view/:slug" element={<ViewEvent />} />
        <Route path="/all-events/attendees/:slug" element={<Attendees />} />
        <Route path="/all-events/add-attendee/:slug" element={<AddAttendee />} />

        {/* Message Template Select Route */}
        <Route path="/all-events/event/choose-template-messages/:slug" element={<AllMessageTemplates />} />

        {/* Template Messages Routes */}
        <Route path="/all-events/event/template-messages" element={<MessageTemplateLayout />}>
          <Route path="send-reminder/:slug" element={<SendReminder />} />
          <Route path="visit-booth-reminder/:slug" element={<VisitBoothReminder />} />
          <Route path="session-reminder/:slug" element={<SessionReminder />} />
          <Route path="send-same-day-reminder/:slug" element={<SendSameDayReminder />} />
          <Route path="day-two-reminder/:slug" element={<DayTwoReminder />} />
          <Route path="day-two-same-day-reminder/:slug" element={<DayTwoSameDayReminder />} />
        </Route>

      </Route>

      <Route path="/" element={
        <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
      } />

      <Route path="/*" element={<Error404 />} />
    </Routes>
  )
}

export default App;
