import './App.css'
import { ReactNode, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

interface ProtectedRouteProps {
  children: ReactNode;
  page: string;
}

function ProtectedRoute({ children, page }: ProtectedRouteProps) {
  const currentUser = localStorage.getItem('currentUser');
  const token = localStorage.getItem(`token_${currentUser}`);
  const role = localStorage.getItem(`role_${currentUser}`);
  
  // Debug authentication issues - remove in production
  console.log('Protected Route Check:', { currentUser, role, page, hasAccess: role ? hasAccess(role, page) : false });
  
  // Check if user is authenticated and has access
  if (!token || !currentUser || !role || !hasAccess(role, page)) {
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
  
  // If not authenticated, redirect to login
  if (!currentUser || !token || !role) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('Current user role:', role);
  
  // Return appropriate landing page based on role
  if (role === 'regular') {
    return <RegularLandingPage />;
  }
  
  // For higher roles (manager, superuser), show admin dashboard
  if (role === 'manager' || role === 'superuser') {
    return <AdminLandingPage />;
  }
  
  // For cashier role or any other role, use regular landing page
  return <RegularLandingPage />;
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
        <Route path="/:userId/transactions/:transactionId" element={<TransactionDetailPage />} />
        <Route path="/createTransaction" element={<CreateTransaction />} />
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
        <Route path="/create-user" element={<CreateUser/>} />
      </Routes>
    </div>
  </Router>
);
};

export default App;
