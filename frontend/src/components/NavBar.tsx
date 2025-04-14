// src/components/Navbar.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { getUserUtorid, getUserRole, getCurrentRole, setCurrentRole, getUserName, logout } from '../services/auth.service';
import logoutIcon from '../assets/logout.png';  // Attribute: this is external image from https://www.flaticon.com/free-icon/logout_8212701
import { isUserOrganizer } from '../services/event.service';

// Role hierarchy for determining available roles
const ROLE_HIERARCHY = {
  'superuser': ['superuser', 'manager', 'cashier', 'regular'],
  'manager': ['manager', 'cashier', 'regular'],
  'cashier': ['cashier', 'regular'],
  'regular': ['regular']
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [utorid, setUtorid] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [maxRole, setMaxRole] = useState<string | null>(null);
  const [currentRole, setCurrentRoleState] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [isOrganizer, setIsOrganizer] = useState<boolean>(false);
  
  useEffect(() => {
    const userUtorid = getUserUtorid();
    const userMaxRole = getUserRole();
    const userCurrentRole = getCurrentRole();
    const name = getUserName();
    
    setUtorid(userUtorid);
    setUserName(name);
    setMaxRole(userMaxRole);
    setCurrentRoleState(userCurrentRole);
    
    // Determine available roles based on the user's maximum role
    if (userMaxRole && ROLE_HIERARCHY[userMaxRole as keyof typeof ROLE_HIERARCHY]) {
      setAvailableRoles(ROLE_HIERARCHY[userMaxRole as keyof typeof ROLE_HIERARCHY]);
    }

    const checkOrganizerStatus = async () => {
      const currentUser = localStorage.getItem('currentUser');
      const userId = localStorage.getItem(`userId_${currentUser}`);
      if (userId) {
        try {
          const organizerStatus = await isUserOrganizer(Number(userId));
          setIsOrganizer(organizerStatus);
        } catch (error) {
          console.error('Error checking organizer status:', error);
        }
      }
    };

    checkOrganizerStatus();
  }, [location]);
  
  // Don't show navbar on authentication pages
  if (location.pathname === '/login' || location.pathname === '/verifyEmail' || location.pathname === '/resetPassword') {
    return null;
  }
  
  // If not authenticated, don't show navbar
  if (!utorid || !currentRole) {
    return null;
  }

  const handleRoleChange = (newRole: string) => {
    // Update the current role in local storage
    setCurrentRole(newRole);
    setCurrentRoleState(newRole);
    setDropdownOpen(false);
    
    // Instead of just navigating to home, we'll force a refresh by
    // navigating with a replaced state which forces App component to re-render
    navigate('/', { replace: true, state: { roleChanged: true, timestamp: Date.now() } });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Function to check if a link is active
  const isActiveLink = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  // Cashier navbar
  if (currentRole === 'cashier') {
    return (
      <nav className="navbar">
        <div className="user-info">
          <div className="username">Welcome back, {userName || utorid}!</div>
          
          <div className="role-switcher">
            <div className="role-label">Current role:</div>
            <div 
              className="current-role" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {currentRole} ▼
            </div>
            
            {dropdownOpen && (
              <div className="role-dropdown">
                {availableRoles.map(role => (
                  <div 
                    key={role} 
                    className={`role-option ${role === currentRole ? 'active' : ''}`}
                    onClick={() => handleRoleChange(role)}
                  >
                    {role}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <Link to="/createTransaction" className={isActiveLink('/createTransaction') ? 'active-link' : ''}>Services</Link>
        <Link to="/promotions" className={isActiveLink('/promotions') ? 'active-link' : ''}>Promotions</Link>
        <Link to="/events" className={isActiveLink('/events') ? 'active-link' : ''}>Events</Link>
        <Link to="/create-user" className={isActiveLink('/create-user') ? 'active-link' : ''}>Register Users</Link>
        
        {isOrganizer && (
          <Link to="/organizer-events" className={isActiveLink('/organizer-events') ? 'active-link' : ''}>
            My Organized Events
          </Link>
        )}

        <button className="logout-button" onClick={handleLogout}>
          Logout
          <img src={logoutIcon} alt="Logout" className="logout-icon" />
        </button>
      </nav>
    );
  }
  
  // Different navbar for managers and above
  if (currentRole === 'manager' || currentRole === 'superuser'){
    return (
      <nav className="navbar">
        <div className="user-info">
          <div className="username">Welcome back, {userName || utorid}!</div>
          
          <div className="role-switcher">
            <div className="role-label">Current role:</div>
            <div 
              className="current-role" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {currentRole} ▼
            </div>
            
            {dropdownOpen && (
              <div className="role-dropdown">
                {availableRoles.map(role => (
                  <div 
                    key={role} 
                    className={`role-option ${role === currentRole ? 'active' : ''}`}
                    onClick={() => handleRoleChange(role)}
                  >
                    {role}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <Link to="/" className={isActiveLink('/') ? 'active-link' : ''}>Home</Link>
        <Link to="/transactions" className={isActiveLink('/transactions') ? 'active-link' : ''}>Transactions</Link>
        <Link to="/events" className={isActiveLink('/events') ? 'active-link' : ''}>Events</Link>
        <Link to="/promotions" className={isActiveLink('/promotions') ? 'active-link' : ''}>Promotions</Link>
        {(currentRole === 'manager' || currentRole === 'superuser') && 
         <Link to="/users" className={isActiveLink('/users') ? 'active-link' : ''}>Users</Link>}
        <Link to="/profile" className={isActiveLink('/profile') ? 'active-link' : ''}>Profile</Link>
        {(currentRole === 'manager' || currentRole === 'superuser') && 
         <Link to="/create-user" className={isActiveLink('/create-user') ? 'active-link' : ''}>Create User</Link>}
        
        {isOrganizer && (
          <Link to="/organizer-events" className={isActiveLink('/organizer-events') ? 'active-link' : ''}>
            My Organized Events
          </Link>
        )}

        <button className="logout-button" onClick={handleLogout}>
          Logout
          <img src={logoutIcon} alt="Logout" className="logout-icon" />
        </button>
      </nav>
    );
  }
  
  // Regular user navbar
  return (
    <nav className="navbar">
      <div className="user-info">
        <div className="username">Welcome back, {userName || utorid}!</div>
        
        <div className="role-switcher">
          <div className="role-label">Current role:</div>
          <div 
            className="current-role" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {currentRole} ▼
          </div>
          
          {dropdownOpen && (
            <div className="role-dropdown">
              {availableRoles.map(role => (
                <div 
                  key={role} 
                  className={`role-option ${role === currentRole ? 'active' : ''}`}
                  onClick={() => handleRoleChange(role)}
                >
                  {role}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Link to="/" className={isActiveLink('/') ? 'active-link' : ''}>Home</Link>
      <Link to="/transactions" className={isActiveLink('/transactions') ? 'active-link' : ''}>My Transactions</Link>
      <Link to="/events" className={isActiveLink('/events') ? 'active-link' : ''}>Events</Link>
      <Link to="/promotions" className={isActiveLink('/promotions') ? 'active-link' : ''}>Promotions</Link>
      <Link to="/profile" className={isActiveLink('/profile') ? 'active-link' : ''}>Profile</Link>
      
      {isOrganizer && (
        <Link to="/organizer-events" className={isActiveLink('/organizer-events') ? 'active-link' : ''}>
          My Organized Events
        </Link>
      )}

      <button className="logout-button" onClick={handleLogout}>
        Logout
        <img src={logoutIcon} alt="Logout" className="logout-icon" />
      </button>
    </nav>
  );
};

export default Navbar;
