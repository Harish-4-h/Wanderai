import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation(); // to highlight active page

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Create Trip', path: '/create-trip' },
    { name: 'My Trips', path: '/my-trips' },
  ];

  return (
    <div className='header-container'>
      {/* Background effect */}
      <div className="sunbeams-effect">
        <div className="sunrise-outer"></div>
        <div className="sunrise-glow"></div>
      </div>

      {/* Logo */}
      <Link to="/">
        <img
          src="/logo.svg"
          alt="Navoria!🐉 Logo"
          className="header-logo"
        />
      </Link>

      {/* Navigation links */}
      <div className="nav-links">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right side user info */}
      <div className="user-info">
        <span className="user-name">Plan trips freely ✨</span>
      </div>
    </div>
  );
}

export default Header;
