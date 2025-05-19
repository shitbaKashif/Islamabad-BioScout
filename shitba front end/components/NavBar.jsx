import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Track scroll position to change navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-container">
        <div className="navbar-brand">
          <Link to="/">
            <h1>BioScout Islamabad</h1>
            <p className="navbar-tagline">AI for Community Biodiversity & Sustainable Insights</p>
            <div className="navbar-event-date">
              <span className="event-icon">📅</span> Event Date: May 16th, 2025
            </div>
          </Link>
        </div>

        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="menu-icon"></span>
        </button>

        <nav className={`navbar-menu ${mobileMenuOpen ? 'menu-open' : ''}`}>
          <Link to="/" className={isActive("/") ? "active" : ""}>
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </Link>

          <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </Link>

          <Link to="/submit" className={isActive("/submit") ? "active" : ""}>
            <span className="nav-icon">📝</span>
            <span className="nav-text">Submit</span>
          </Link>

          <Link to="/observations" className={isActive("/observations") ? "active" : ""}>
            <span className="nav-icon">🔍</span>
            <span className="nav-text">Observations</span>
          </Link>

          <Link to="/map" className={isActive("/map") ? "active" : ""}>
            <span className="nav-icon">🗺️</span>
            <span className="nav-text">Map</span>
          </Link>

          <Link to="/qa" className={isActive("/qa") ? "active" : ""}>
            <span className="nav-icon">❓</span>
            <span className="nav-text">Q&A</span>
          </Link>

          <Link to="/classify" className={isActive("/classify") ? "active" : ""}>
            <span className="nav-icon">🔬</span>
            <span className="nav-text">Classify</span>
          </Link>

          <Link to="/about" className={isActive("/about") ? "active" : ""}>
            <span className="nav-icon">ℹ️</span>
            <span className="nav-text">About</span>
          </Link>

          <div className="navbar-cta">
            <Link to="/submit" className="btn btn-primary btn-small">
              <span className="btn-icon">🌿</span> Submit Observation
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}