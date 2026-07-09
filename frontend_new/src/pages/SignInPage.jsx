import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';

const SignInPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
      <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontFamily: 'var(--font-h)', textAlign: 'center', marginBottom: '24px' }}>Sign In</h2>
        <Auth 
          supabaseClient={supabase} 
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#6C5CE7',
                  brandAccent: '#A78BFA',
                  inputText: '#F0EEF6',
                  inputBackground: 'rgba(255,255,255,0.035)',
                  inputBorder: 'rgba(255,255,255,0.08)',
                }
              }
            },
            className: {
              button: 'run-btn',
              input: 'topic-input',
            }
          }}
          providers={['google', 'github']}
          redirectTo="http://localhost:8000/app"
          view="sign_in"
        />
      </div>
    </div>
  );
};

export default SignInPage;
