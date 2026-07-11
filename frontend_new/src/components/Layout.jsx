import { Outlet, Link, useLocation } from 'react-router-dom';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../AuthContext';
import Starfield from './Starfield';

const AgentSwarmScene = lazy(() => import('./AgentSwarmScene'));

const Layout = () => {
  const [isLight, setIsLight] = useState(false);
  const { session, user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      setIsLight(true);
      document.documentElement.classList.add('light-theme');
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle('light-theme');
    const light = html.classList.contains('light-theme');
    setIsLight(light);
    localStorage.setItem('theme', light ? 'light' : 'dark');
  };

  return (
    <div className="app">
      {/* Site-wide Ambient Starfield Background */}
      <Starfield />

      {/* 3D AGENT SWARM BACKGROUND - Only show on Landing Page to keep other pages simple and clean */}
      {location.pathname === '/' && (
        <div>
          <Suspense fallback={null}>
            <AgentSwarmScene />
          </Suspense>
        </div>
      )}

      <header className="header" data-entrance="0" style={{ position: 'relative', zIndex: 10 }}>
        <div className="header-inner">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            <svg className="logo-svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="16" stroke="url(#lg)" strokeWidth="1.5" opacity="0.5"/>
              <circle cx="18" cy="10" r="3" fill="url(#lg)"/>
              <circle cx="10" cy="24" r="3" fill="url(#lg)" opacity="0.6"/>
              <circle cx="26" cy="24" r="3" fill="url(#lg)" opacity="0.6"/>
              <line x1="18" y1="13" x2="10" y2="21" stroke="url(#lg)" strokeWidth="1.5" opacity="0.4"/>
              <line x1="18" y1="13" x2="26" y2="21" stroke="url(#lg)" strokeWidth="1.5" opacity="0.4"/>
              <defs><linearGradient id="lg" x1="0" y1="0" x2="36" y2="36"><stop stopColor="#7C3AED"/><stop offset="1" stopColor="#06B6D4"/></linearGradient></defs>
            </svg>
            <span className="logo-name">Deep Dive</span>
          </Link>

          <nav className="header-nav">
            <Link to="/docs" className="nav-pill" style={{ textDecoration: 'none' }}>Docs</Link>
            <Link to="/about" className="nav-pill" style={{ textDecoration: 'none' }}>About</Link>
            
            <button onClick={toggleTheme} className="nav-pill nav-pill-btn" title="Toggle theme">
              {isLight ? '🌙' : '🌓'}
            </button>

            {!session ? (
              <>
                <Link to="/sign-in" className="nav-pill nav-pill-btn" style={{ textDecoration: 'none' }}>Sign In</Link>
                <Link to="/sign-up" className="run-btn" style={{ textDecoration: 'none', padding: '6px 16px', fontSize: '0.75rem' }}>Get Started</Link>
              </>
            ) : (
              <>
                <Link to="/app" className="nav-pill nav-pill-btn" style={{ textDecoration: 'none' }}>Dashboard</Link>
                <button onClick={signOut} className="nav-pill nav-pill-btn" title="Sign out" style={{ padding: '6px 12px', background: 'var(--glass-border)' }}>
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="content-wrap" style={{ position: 'relative', zIndex: 10 }}>
        <Outlet />
      </div>

      <footer className="footer" data-entrance="3" style={{ position: 'relative', zIndex: 10 }}>
        <span>Built for AMD AI Hackathon</span>
        <span className="footer-dot">·</span>
        <span>Powered by CrewAI + Fireworks AI</span>
      </footer>
    </div>
  );
};

export default Layout;
