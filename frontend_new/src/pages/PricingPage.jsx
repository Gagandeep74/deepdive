import React from 'react';

const PricingPage = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 0' }}>
      <h1 style={{ fontFamily: 'var(--font-h)', fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px' }}>Pricing Plans</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', color: 'var(--text-1)', marginBottom: '8px' }}>Free</h2>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-1)', marginBottom: '24px' }}>$0<span style={{ fontSize: '1rem', color: 'var(--text-3)' }}>/mo</span></div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px', flex: 1, color: 'var(--text-2)' }}>
            <li style={{ marginBottom: '12px' }}>✓ 10 Research queries/mo</li>
            <li style={{ marginBottom: '12px' }}>✓ Standard depth</li>
            <li style={{ marginBottom: '12px' }}>✓ Shared compute node</li>
          </ul>
          <button className="pill-btn-sm" style={{ width: '100%', padding: '10px' }}>Current Plan</button>
        </div>

        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', borderColor: 'var(--accent)', boxShadow: '0 0 20px -8px var(--accent-glow)' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', color: 'var(--accent-b)', marginBottom: '8px' }}>Pro</h2>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-1)', marginBottom: '24px' }}>$29<span style={{ fontSize: '1rem', color: 'var(--text-3)' }}>/mo</span></div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px', flex: 1, color: 'var(--text-2)' }}>
            <li style={{ marginBottom: '12px' }}>✓ Unlimited queries</li>
            <li style={{ marginBottom: '12px' }}>✓ Deep research mode</li>
            <li style={{ marginBottom: '12px' }}>✓ Priority compute node</li>
            <li style={{ marginBottom: '12px' }}>✓ PDF Export</li>
          </ul>
          <button className="run-btn" style={{ width: '100%', padding: '10px' }}>Upgrade to Pro</button>
        </div>

      </div>
    </div>
  );
};

export default PricingPage;
