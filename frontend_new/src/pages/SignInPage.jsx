import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate('/app');
    }
  };

  const handleOAuth = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/app'
      }
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
      <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontFamily: 'var(--font-h)', textAlign: 'center', marginBottom: '24px' }}>Sign In</h2>
        
        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-2)' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="topic-input" 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-2)' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="topic-input" 
              required 
            />
          </div>
          
          {error && <div style={{ color: '#EF4444', fontSize: '0.85rem' }}>{error}</div>}
          
          <button type="submit" className="run-btn" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: 'var(--text-2)' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          <span style={{ padding: '0 12px', fontSize: '0.85rem' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => handleOAuth('google')} className="nav-pill nav-pill-btn" style={{ flex: 1, justifyContent: 'center' }}>
            Google
          </button>
          <button onClick={() => handleOAuth('github')} className="nav-pill nav-pill-btn" style={{ flex: 1, justifyContent: 'center' }}>
            GitHub
          </button>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-2)' }}>
          Don't have an account? <Link to="/sign-up" style={{ color: 'var(--accent-b)', textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
