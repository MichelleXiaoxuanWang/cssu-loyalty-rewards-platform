// src/components/Navbar.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import avatar from '../assets/avatar.png';  

const Navbar: React.FC = () => {
  const location = useLocation();
  const [utorid, setUtorid] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  
  // Update authentication state when component mounts or location changes
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    setUtorid(currentUser);
    
    if (currentUser) {
      const userRole = localStorage.getItem(`current_role_${currentUser}`);
      setRole(userRole);
    }
  }, [location]);
  
  // Don't show navbar on authentication pages
  if (location.pathname === '/login' || location.pathname === '/verifyEmail' || location.pathname === '/resetPassword') {
    return null;
  }
  
  // If not authenticated, don't show navbar
  if (!utorid || !role) {
    return null;
  }
  
  // Different navbar for managers and above
  if (role !== 'regular'){
    return (
      <nav className="navbar">
        <div>
          <img src={avatar} alt="Avatar" />
          <p id="role">{role ? `${role}` : 'No Role Found'}</p>
        </div>
        
        <Link to="/">Home</Link>
        <Link to="/transactions">My Transactions</Link>
        <Link to="/events">Events</Link>
        <Link to="/promotions">Promotions</Link>
        {(role === 'manager' || role === 'superuser') && <Link to="/users">Users</Link>}
        <Link to="/profile">Profile</Link>
        {(role === 'manager' || role === 'superuser') && <Link to="/create-user">Create User</Link>}
      </nav>
    );
  }
  
  // Regular user navbar
  return (
    <nav className="navbar">
      <div>
        <img src={avatar} alt="Avatar" />
        <p id="role">{role ? `${role}` : 'No Role Found'}</p>
      </div>
      
      <Link to="/">Home</Link>
      <Link to="/transactions">My Transactions</Link>
      <Link to="/events">Events</Link>
      <Link to="/promotions">Promotions</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
};

export default Navbar;
