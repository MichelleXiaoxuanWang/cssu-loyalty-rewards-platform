import './App.css'
import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import VerifyEmailPage from './pages/VerifyEmail';
import ResetPasswordPage from './pages/ResetPassword';
import TransactionDetailPage from './pages/TransactionDetail';
import UsersPage from './pages/UsersPage.tsx';
import PromotionsPage from './pages/PromotionsPage.tsx';
import EventsPage from './pages/EventsPage.tsx';
import OrganizerEventsPage from './pages/OrganizerEventsPage.tsx';
import CreateUser from './pages/CreateUser.tsx';
import Navbar from './components/NavBar.tsx';
import { hasAccess } from './utils/auth.utils';
import CreateTransaction from './pages/CreateTransaction.tsx';

interface ProtectedRouteProps {
  children: ReactNode;
  page: string;
}

function ProtectedRoute({ children, page }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  // const role = 'superuser'; // For testing purposes, set role to superuser

  if (!token || !role || !hasAccess(role, page)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  // login: the page to login, uses /auth/tokens
  // verifyEmail: the page to send verify email, uses /auth/resets
  // resetPassword: the page to reset password, uses /auth/resets/:resetToken
  return (
  <Router>
    <Navbar />
    <div>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verifyEmail" element={<VerifyEmailPage />} />
        <Route path="/resetPassword" element={<ResetPasswordPage />} />
        <Route path="/:userId/transactions/:transactionId" element={<TransactionDetailPage />} />
        <Route path="/createTransaction" element={<CreateTransaction />} />
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
          path="/organizer-events"
          element={
            <ProtectedRoute page="OrganizerEventsPage">
              <OrganizerEventsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/create-user" element={<CreateUser/>} />
      </Routes>
    </div>
  </Router>
);
};

export default App;
