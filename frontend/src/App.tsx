import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import UsersPage from './pages/UsersPage.tsx';
import PromotionsPage from './pages/PromotionsPage.tsx';
import EventsPage from './pages/EventsPage.tsx';
import OrganizerEventsPage from './pages/OrganizerEventsPage.tsx';
import { hasAccess } from './utils/auth.utils';

const App: React.FC = () => {
  const userRole = 'manager'; // Temporary hardcoded role for matching string

  return (
    <Router>
      <Routes>
        {hasAccess(userRole, 'UsersPage') && <Route path="/users" element={<UsersPage />} />}
        {hasAccess(userRole, 'PromotionsPage') && <Route path="/promotions" element={<PromotionsPage />} />}
        {hasAccess(userRole, 'EventsPage') && <Route path="/events" element={<EventsPage />} />}
        {hasAccess(userRole, 'OrganizerEventsPage') && <Route path="/organizer-events" element={<OrganizerEventsPage />} />}
        <Route path="*" element={<Navigate to="/events" />} />
      </Routes>
    </Router>
  );
};

export default App;
