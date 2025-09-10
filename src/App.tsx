import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

// Layouts
import Layout from '@/pages/admin/layout';
import GuestLayout from '@/pages/guest/layout';
// import MessageTemplateLayout from '@/pages/admin/all-template-messages/layout';

// Guest Pages
import Login from '@/pages/guest/login';
import Signup from '@/pages/guest/signup';
import ForgotPassword from '@/pages/guest/forgot-password';
import ResetPassword from '@/pages/guest/reset-password';
import Homepage from '@/pages/guest/homepage';
import ExploreEvents from '@/pages/guest/explore-events';
import AddFirstEvent from '@/pages/guest/add-first-event';
import TermsAndConditions from '@/pages/guest/terms-and-conditions';
import RefundPolicy from '@/pages/guest/refund-policy';
import PrivacyPolicy from '@/pages/guest/privacy-policy';
import FAQ from '@/pages/guest/faq';
import SecurityAndCompilance from '@/pages/guest/security-and-compilance';
import AboutUs from '@/pages/guest/about-us';
// Admin Pages
import Dashboard from '@/pages/admin/dashboard';
import AllEvents from '@/pages/admin/all-events';
import AllAttendees from '@/pages/admin/all-attendees';
import EventSponsors from '@/pages/admin/event-sponsors';
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
// import Tutorials from '@/pages/admin/tutorials';
import Vendors from '@/pages/admin/vendors';
import AudienceAcquisition from '@/pages/admin/vendors/audience-acquisition';
import Gifting from '@/pages/admin/vendors/gifting';
import EventSetup from '@/pages/admin/vendors/event-setup';
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
import EditAttendee from '@/pages/admin/all-events/edit-attendee';
import EditRequestedAttendee from '@/pages/admin/send-invitations/edit-requested-attendee';
import SearchPeople from '@/pages/admin/search-people';
import CheckInPage from '@/pages/guest/check-in-page';
import InviteRegistrations from '@/pages/admin/send-invitations/invite-registrations';
import ChangePassword from '@/pages/admin/profile/change-password';
import Features from '@/pages/guest/features';
import Integrations from '@/pages/guest/integrations';
import PrintBadges from '@/pages/admin/all-reports/print-badges';
import ViewEventSponsors from '@/pages/admin/event-sponsors/view-event-sponsors';
import ViewEventSponsorDetails from '@/pages/admin/event-sponsors/view-event-sponsor-details';
import AddSponsor from '@/pages/admin/event-sponsors/add-sponsor';
import CreateBadge from '@/pages/admin/all-events/create-badge';
import Careers from '@/pages/guest/careers';
import UpdateSponsor from '@/pages/admin/event-sponsors/update-sponsor';
import SubUsers from '@/pages/admin/profile/sub-users';
import ICP from './pages/admin/icp';

const App: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const hasFeatureAccess = (feature: 'search_people' | 'vendor' | 'wallet') => {
    return user?.feature_permission?.[feature] === 1;
  };

  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/organiser/login" replace />;
  };

  const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
  };

  return (
    <Routes>
      {/* Guest Routes */}
      <Route element={<GuestLayout />}>
        <Route index element={<Homepage />} />
        <Route path="organiser" element={<ExploreEvents />} />
        <Route path="add-first-event" element={<AddFirstEvent />} />
        <Route path="events" element={<ExploreAllEvents />} />
        <Route path="events/:slug" element={<ExploreViewEvent />} />
        <Route path="payment/:status/:id" element={<PaymentStatus />} />
        {hasFeatureAccess('wallet') && (
          <>
            <Route path="wallet/:status" element={<PaymentStatus />} />
          </>
        )}
        <Route path="terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="refund-policy" element={<RefundPolicy />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="security-and-compilance" element={<SecurityAndCompilance />} />
        <Route path="about-us" element={<AboutUs />} />
        <Route path="event/check-in" element={<CheckInPage />} />
        <Route path="careers" element={<Careers />} />
        <Route path="features" element={<Features />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="faq" element={<FAQ />} />

        <Route
          path="organiser/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="organiser/signup"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />
        <Route
          path="organiser/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />
        <Route
          path="organiser/reset-password"
          element={
            <GuestRoute>
              <ResetPassword />
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
        <Route path="organiser/change-password" element={<ChangePassword />} />
        <Route path="all-events" element={<AllEvents />} />
        {user?.role === "admin" && <Route path="add-event" element={<AddEvent />} />}
        <Route path="all-attendees" element={<AllAttendees />} />
        <Route path="all-photos" element={<AllPhotos />} />
        <Route path="all-reports" element={<AllReports />} />
        <Route path="icp" element={<ICP />} />
        {hasFeatureAccess('search_people') && (
          <Route path="search-people" element={<SearchPeople />} />
        )}

        {/* Condition need to be added for admin */}
        {user?.role === "admin" && (
          <Route path="sub-users" element={<SubUsers />} />
        )}

        {/* <Route path='tutorials' element={<Tutorials />} /> */}

        {/* {hasFeatureAccess('vendor') && (
        )} */}
        <Route path="event-sponsors">
          <Route index element={<EventSponsors />} />
          <Route path=":slug" element={<ViewEventSponsors />} />
          <Route path=":slug/sponsor-details/:id" element={<ViewEventSponsorDetails />} />
          <Route path=":slug/update-sponsor/:id" element={<UpdateSponsor />} />
          <Route path="add-sponsor/:slug" element={<AddSponsor />} />
        </Route>

        {hasFeatureAccess('vendor') && (
          <Route path='vendors'>
            <Route index element={<Vendors />} />
            <Route path="audience-acquisition" element={<AudienceAcquisition />} />
            <Route path="gifting" element={<Gifting />} />
            <Route path="event-setup" element={<EventSetup />} />
          </Route>
        )}
        <Route path="send-invitations" element={<SendInvitations />} />
        <Route path="send-invitations/add-requested-attendee/:slug" element={<AddRequestedAttendee />} />
        <Route path="send-invitations/edit-requested-attendee/:slug/:uuid" element={<EditRequestedAttendee />} />
        <Route path="send-invitations/invite-registrations/:slug" element={<InviteRegistrations />} />

        <Route path="update-profile" element={<UpdateProfile />} />
        <Route path="all-agendas/:slug" element={<AllAgendas />} />
        <Route path="add-agenda/:slug" element={<AddAgenda />} />
        <Route path="all-agendas/:slug/edit-agenda/:id" element={<EditAgenda />} />
        <Route path="create-badge/:slug" element={<CreateBadge />} />

        {/* Event Related Routes */}
        <Route path="all-events">
          <Route path="view/:slug" element={<ViewEvent />} />
          <Route path="attendees/:slug" element={<Attendees />} />
          {user?.role === 'admin' &&<Route path="update-event/:slug" element={<UpdateEvent />} />}
          <Route path="add-attendee/:slug" element={<AddAttendee />} />
          <Route path=":slug/edit-attendee/:uuid" element={<EditAttendee />} />
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
          <Route path='print-badges/:slug' element={<PrintBadges />} />
        </Route>
      </Route>

      {/* Root Redirect */}
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/organiser/login"} replace />
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default App;
