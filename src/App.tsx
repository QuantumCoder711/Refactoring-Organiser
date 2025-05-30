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
import ExploreEvents from '@/pages/guest/explore-events';
import AddFirstEvent from '@/pages/guest/add-first-event';
import TermsAndConditions from './pages/guest/terms-and-conditions';
import RefundPolicy from './pages/guest/refund-policy';
import PrivacyPolicy from './pages/guest/privacy-policy';
import FAQ from './pages/guest/faq';
// Admin Pages
import Dashboard from '@/pages/admin/dashboard';
import AllEvents from '@/pages/admin/all-events';
import AllAttendees from '@/pages/admin/all-attendees';
import AllSponsors from '@/pages/admin/all-sponsors';
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
import Tutorials from '@/pages/admin/tutorials';
import MailReport from '@/pages/admin/all-reports/mail-report';
import WhatsAppReport from '@/pages/admin/all-reports/whatsapp-report';
import Charts from '@/pages/admin/all-reports/charts';
import AiPhotos from '@/pages/admin/all-reports/ai-photos';
import AiTranscriber from '@/pages/admin/all-reports/ai-transcriber';
import EditAgenda from '@/pages/admin/all-events/edit-agenda';
import ExploreAllEvents from '@/pages/guest/explore-all-events';
import ExploreViewEvent from '@/pages/guest/explore-view-event';
import PaymentStatus from '@/pages/guest/payment/payment-status';
import SendInvitations from '@/pages/admin/send-invitations';
import AddRequestedAttendee from '@/pages/admin/send-invitations/add-requested-attendee';
import EditAttendee from './pages/admin/all-events/edit-attendee';
import EditRequestedAttendee from './pages/admin/send-invitations/edit-requested-attendee';
import SearchPeople from './pages/admin/search-people';
import CheckInPage from './pages/guest/check-in-page';

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
        <Route path="events" element={<ExploreEvents />} />
        <Route path="add-first-event" element={<AddFirstEvent />} />
        <Route path="explore-events/:city" element={<ExploreAllEvents />} />
        <Route path="explore-events/event/:slug" element={<ExploreViewEvent />} />
        <Route path="payment/:status/:id" element={<PaymentStatus />} />
        <Route path="terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="refund-policy" element={<RefundPolicy />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="event/check-in" element={<CheckInPage />} />
        <Route path="faq" element={<FAQ />} />
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
        <Route path="all-charts" element={<AllCharts />} />
        <Route path="all-photos" element={<AllPhotos />} />
        <Route path="all-reports" element={<AllReports />} />
        <Route path="search-people" element={<SearchPeople />} />
        <Route path='tutorials' element={<Tutorials />} />
        <Route path="send-invitations" element={<SendInvitations />} />
        <Route path="send-invitations/add-requested-attendee/:slug" element={<AddRequestedAttendee />} />
        <Route path="send-invitations/edit-requested-attendee/:slug/:uuid" element={<EditRequestedAttendee />} />

        <Route path="update-profile" element={<UpdateProfile />} />

        <Route path="all-agendas/:slug" element={<AllAgendas />} />
        <Route path="add-agenda/:slug" element={<AddAgenda />} />
        <Route path="edit-agenda/:slug/:id" element={<EditAgenda />} />

        {/* Event Related Routes */}
        <Route path="all-events">
          <Route path="view/:slug" element={<ViewEvent />} />
          <Route path="attendees/:slug" element={<Attendees />} />
          <Route path="update-event/:slug" element={<UpdateEvent />} />
          <Route path="add-attendee/:slug" element={<AddAttendee />} />
          <Route path="edit-attendee/:slug/:uuid" element={<EditAttendee />} />
          <Route path="send-invitations/:slug" element={<SendInvitations />} />

          {/* Message Template Routes */}
          <Route path="event/all-template-messages/:slug" element={<AllTemplateMessages />} />
          <Route path="event/all-template-messages/:template/:slug" element={<TemplateMessage />} />
          <Route path="event/all-template-messages/pending-user-request/:slug" element={<PendingUserRequest />} />
        </Route>

        <Route path='all-reports'>
          <Route path='mail-report/:slug' element={<MailReport />} />
          <Route path='whatsapp-report/:slug' element={<WhatsAppReport />} />
          <Route path='charts/:slug' element={<Charts />} />
          <Route path='ai-transcriber/:slug' element={<AiTranscriber />} />
          <Route path='ai-photos/:slug' element={<AiPhotos />} />
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
