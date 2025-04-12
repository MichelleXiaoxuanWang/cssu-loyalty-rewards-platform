// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import avatar from '../assets/avatar.png';  
const utorid = localStorage.getItem("currentUser");
const role = localStorage.getItem(`role_${utorid}`);
//TODO: the change the link to landing page instead of dashboard

const Navbar: React.FC = () => {
if (location.pathname === '/login' ||location.pathname === '/verifyEmail' || location.pathname === '/resetPassword') {
    return null;
    }
if (role !== 'regular'){
    return (
        <nav className="navbar">
        <div>
            <img src={avatar}  alt="Avatar" />
            <p id="role">{role ? `${role}` : 'No Role Found'}</p>
        </div>
        
        <Link to="/dashboard">Home</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/events">Events</Link>
        <Link to="/promotions">Promotions</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/create-user">Create User</Link>
      </nav>
      );
}
  return (
    <nav className="navbar">
    <div>
        <img src={avatar}  alt="Avatar" />
        <p id="role">{role ? `${role}` : 'No Role Found'}</p>
    </div>
    
    <Link to="/dashboard">Home</Link>
    <Link to="/transactions">Transactions</Link>
    <Link to="/events">Events</Link>
    <Link to="/promotions">Promotions</Link>
    <Link to="/profile">Profile</Link>
  </nav>
  );
};

export default Navbar;
