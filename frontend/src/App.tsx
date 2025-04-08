import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from './pages/Login';
import VerifyEmailPage from './pages/VerifyEmail';
import ResetPasswordPage from './pages/ResetPassword';
import TransactionDetailPage from './pages/TransactionDetail';
import UsersPage from './pages/UsersPage.tsx';
import PromotionsPage from './pages/PromotionsPage.tsx';
import EventsPage from './pages/EventsPage.tsx';
import OrganizerEventsPage from './pages/OrganizerEventsPage.tsx';

function App() {
  // login: the page to login, uses /auth/tokens
  // verifyEmail: the page to send verify email, uses /auth/resets
  // resetPassword: the page to reset password, uses /auth/resets/:resetToken
  return (
  <Router>
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verifyEmail" element={<VerifyEmailPage />} />
      <Route path="/resetPassword" element={<ResetPasswordPage />} />
      <Route path="/:userId/transactions/:transactionId" element={<TransactionDetailPage />} />  
      <Route path="/users" element={<UsersPage />} />
      <Route path="/promotions" element={<PromotionsPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/organizer-events" element={<OrganizerEventsPage />} />
    </Routes>
  </Router>
);
};

export default App;
