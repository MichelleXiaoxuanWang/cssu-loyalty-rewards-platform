import './App.css'
import { ReactNode, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/Login';
import VerifyEmailPage from './pages/VerifyEmail';
import ResetPasswordPage from './pages/ResetPassword';
import TransactionDetailPage from './pages/TransactionDetail';
import TransactionPreviewPage from './pages/TransactionPreviewPage';
import RegularLandingPage from './pages/RegularLandingPage';
import AdminLandingPage from './pages/AdminLandingPage';
import UsersPage from './pages/UsersPage.tsx';
import PromotionsPage from './pages/PromotionsPage.tsx';
import EventsPage from './pages/EventsPage.tsx';
import OrganizerEventsPage from './pages/OrganizerEventsPage.tsx';
import CreateUser from './pages/CreateUser.tsx';
import Navbar from './components/NavBar.tsx';
import { hasAccess } from './utils/auth.utils';
import CreateTransaction from './pages/CreateTransaction.tsx';
import { isUserOrganizer } from './services/event.service';

import ProfilePage from './pages/ProfilePage.tsx';
import UserDetailPage from './pages/UserDetail.tsx';
import EventDetailPage from './pages/EventDetail.tsx';
import OrganizersManagementPage from './pages/OrganizersManagement.tsx';
import EventGuestsManagePage from './pages/EventGuestsManage.tsx';
import AwardEventTransactionPage from './pages/AwardTransaction.tsx';
import PromotionDetailPage from './pages/PromotionDetail.tsx';

interface ProtectedRouteProps {
  children: ReactNode;
  page: string;
}

// Protected route to check if user is authenticated and has access to the page
function ProtectedRoute({ children, page }: ProtectedRouteProps) {
  const currentUser = localStorage.getItem('currentUser');
  const token = localStorage.getItem(`token_${currentUser}`);
  
  // Check the current role the user is using, not their highest possible role
  const currentRole = localStorage.getItem(`current_role_${currentUser}`);
  const highestRole = localStorage.getItem(`role_${currentUser}`);
  
  // Debug authentication issues - remove in production
  console.log('Protected Route Check:', { 
    currentUser, 
    currentRole, 
    highestRole,
    page, 
    hasAccess: currentRole ? hasAccess(currentRole, page) : false 
  });
  
  // Check if user is authenticated and has access based on their current role
  if (!token || !currentUser || !currentRole || !hasAccess(currentRole, page)) {
    console.log('Access denied, redirecting to login page');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Component to redirect based on user role
function HomeRedirect() {
  const currentUser = localStorage.getItem('currentUser');
  const token = localStorage.getItem(`token_${currentUser}`);
  const role = localStorage.getItem(`current_role_${currentUser}`); // the current role that the user is using
  const location = useLocation(); // Add this to access location state
  
  // Force component to re-render when location state changes due to role switch
  useEffect(() => {
    console.log('HomeRedirect re-rendering due to location change or role update');
  }, [location.state, role]);
  
  // If not authenticated, redirect to login
  if (!currentUser || !token || !role) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('Current user role:', role);
  
  // Return appropriate landing page based on role
  if (role === 'regular') {
    return <RegularLandingPage key={role} />;
  }
  
  // For cashier role, redirect to CreateTransaction page
  if (role === 'cashier') {
    return <Navigate to="/createTransaction" replace />;
  }
  
  // For higher roles (manager, superuser), show admin dashboard
  if (role === 'manager' || role === 'superuser') {
    return <AdminLandingPage key={role} />;
  }
  
  // For any other role, use regular landing page
  return <RegularLandingPage key={role} />;
}

function App() {
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    const checkOrganizerStatus = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const isOrganizer = await isUserOrganizer(parseInt(userId));
        setIsOrganizer(isOrganizer);
      }
    };

    checkOrganizerStatus();
  }, []);

  // login: the page to login, uses /auth/tokens
  // verifyEmail: the page to send verify email, uses /auth/resets
  // resetPassword: the page to reset password, uses /auth/resets/:resetToken
  return (
  <Router>
    <Navbar />
    <div>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verifyEmail" element={<VerifyEmailPage />} />
        <Route path="/resetPassword" element={<ResetPasswordPage />} />
        
        <Route
          path="/:userId/transactions/:transactionId"
          element={
            <ProtectedRoute page="TransactionsPage">
              <TransactionDetailPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/createTransaction"
          element={
            <ProtectedRoute page="CreateTransactionPage">
              <CreateTransaction />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/transactions"
          element={
            <ProtectedRoute page="TransactionsPage">
              <TransactionPreviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute page="UsersPage">
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/promotions"
          element={
            <ProtectedRoute page="PromotionsPage">
              <PromotionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute page="EventsPage">
              <EventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute page="AdminPage">
              <AdminLandingPage />
            </ProtectedRoute>
          }
        />
        {isOrganizer && (
          <Route path="/organizer-events" element={<OrganizerEventsPage />} />
        )}
        
        <Route
          path="/create-user"
          element={
            <ProtectedRoute page="CreateUserPage">
              <CreateUser />
            </ProtectedRoute>
          }
        />
        
        <Route path="/profile" element={<ProfilePage/>} />
        <Route path="/users/:userId" element={<UserDetailPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/events/:eventId/organizers" element={<OrganizersManagementPage />} />
        <Route path="/events/:eventId/guests-manage" element={<EventGuestsManagePage />} />
        <Route path="/events/:eventId/transactions" element={<AwardEventTransactionPage />} />
        <Route path="/promotions/:promotionId" element={<PromotionDetailPage />} />
      </Routes>
    </div>
  </Router>
);
};

export default App;
