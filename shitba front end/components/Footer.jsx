import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="footer-waves">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#1B5E20" fillOpacity="1" d="M0,128L48,133.3C96,139,192,149,288,170.7C384,192,480,224,576,218.7C672,213,768,171,864,165.3C960,160,1056,192,1152,192C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="container footer-container">
        <div className="footer-grid">
          <div className="footer-about">
            <h3 className="footer-title">BioScout Islamabad</h3>
            <p className="footer-description">Empowering citizens to map, monitor, and protect urban biodiversity through AI-assisted community science.</p>
            <div className="footer-social">
              <a href="https://twitter.com/bioscout" className="social-link" aria-label="Twitter">
                <span className="social-icon">🐦</span>
              </a>
              <a href="https://instagram.com/bioscout" className="social-link" aria-label="Instagram">
                <span className="social-icon">📸</span>
              </a>
              <a href="https://github.com/bioscout-islamabad" className="social-link" aria-label="GitHub">
                <span className="social-icon">💻</span>
              </a>
            </div>
          </div>
          
          <div className="footer-links">
            <h4 className="footer-heading">Explore</h4>
            <ul className="footer-menu">
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/submit">Submit Observation</Link></li>
              <li><Link to="/observations">Explore Observations</Link></li>
              <li><Link to="/map">Biodiversity Map</Link></li>
              <li><Link to="/classify">AI Species Classifier</Link></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-menu">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/qa">Q&A</Link></li>
              <li><a href="/guides/observation-tips.pdf">Observation Guide</a></li>
              <li><a href="/data/species-catalog.pdf">Species Catalog</a></li>
              <li><a href="https://github.com/bioscout-islamabad/datasets" target="_blank" rel="noopener noreferrer">Open Datasets</a></li>
            </ul>
          </div>
          
          <div className="footer-contact">
            <h4 className="footer-heading">Contact Us</h4>
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <a href="mailto:contact@bioscout-islamabad.org">contact@bioscout-islamabad.org</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span>FAST NUCES, Islamabad, Pakistan</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🔔</span>
              <span>Subscribe to our newsletter:</span>
            </div>
            <form className="footer-form">
              <div className="form-group">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="footer-input"
                  aria-label="Email address"
                />
                <button type="submit" className="footer-button">
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="footer-divider"></div>
        
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {currentYear} BioScout Islamabad. All rights reserved.
          </p>
          <p className="credits">
            Developed with 💚 by <Link to="/about">Shitba, Manahil, and Ali</Link> | FAST NUCES Islamabad
          </p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
            <a href="https://github.com/bioscout-islamabad" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}