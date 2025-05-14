import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

// Layouts
import Layout from '@/pages/admin/layout';
import GuestLayout from '@/pages/guest/layout';
// import MessageTemplateLayout from '@/pages/admin/all-template-messages/layout';

// Guest Pages
import Login from '@/pages/guest/login';
import Homepage from '@/pages/guest/homepage';

// Admin Pages
import Dashboard from '@/pages/admin/dashboard';
import AllEvents from '@/pages/admin/all-events';
import AllAttendees from '@/pages/admin/all-attendees';
import AllSponsors from '@/pages/admin/all-sponsors';
import AiTranscriber from '@/pages/admin/ai-transcriber';
import AllCharts from '@/pages/admin/all-charts';
import AllPhotos from '@/pages/admin/all-photos';
import AllReports from '@/pages/admin/all-reports';
import Profile from '@/pages/admin/profile';

// Event Related Pages
import ViewEvent from '@/pages/admin/all-events/view-event';
import Attendees from '@/pages/admin/all-events/attendees';
import AddAttendee from '@/pages/admin/all-events/add-attendee';
import AddEvent from '@/pages/admin/all-events/add-event';
import UpdateEvent from '@/pages/admin/all-events/update-event';

// Message Template Pages
import AllTemplateMessages from '@/pages/admin/all-template-messages';
import TemplateMessage from '@/pages/admin/all-template-messages/template-message';

// Error Page
import Error404 from '@/pages/404';
import AllAgendas from '@/pages/admin/all-events/all-agendas';
import PendingUserRequest from '@/pages/admin/all-template-messages/pending-user-request';
import AddAgenda from '@/pages/admin/all-events/add-agenda';
import UpdateProfile from '@/pages/admin/profile/update-profile';

const App: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
  };

  const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
  };

  return (
    <Routes>
      {/* Guest Routes */}
      <Route element={<GuestLayout />}>
        <Route index element={<Homepage />} />
        <Route
          path="login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Main Routes */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="all-events" element={<AllEvents />} />
        <Route path="add-event" element={<AddEvent />} />
        <Route path="all-attendees" element={<AllAttendees />} />
        <Route path="all-sponsors" element={<AllSponsors />} />
        <Route path="ai-transcriber" element={<AiTranscriber />} />
        <Route path="all-charts" element={<AllCharts />} />
        <Route path="all-photos" element={<AllPhotos />} />
        <Route path="all-reports" element={<AllReports />} />

        <Route path="update-profile" element={<UpdateProfile />} />

        <Route path="all-agendas/:slug" element={<AllAgendas />} />
        <Route path="add-agenda/:slug" element={<AddAgenda />} />

        {/* Event Related Routes */}
        <Route path="all-events">
          <Route path="view/:slug" element={<ViewEvent />} />
          <Route path="attendees/:slug" element={<Attendees />} />
          <Route path="update-event/:slug" element={<UpdateEvent />} />
          <Route path="add-attendee/:slug" element={<AddAttendee />} />

          {/* Message Template Routes */}
          <Route path="event/all-template-messages/:slug" element={<AllTemplateMessages />} />
          <Route path="event/all-template-messages/:template/:slug" element={<TemplateMessage />} />
          <Route path="event/all-template-messages/pending-user-request/:slug" element={<PendingUserRequest />} />
        </Route>
      </Route>

      {/* Root Redirect */}
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default App;
