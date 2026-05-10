import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const user   = params.get('user');
    const error  = params.get('error');

    console.log('token:', token ? 'exists' : 'missing');
    console.log('user:', user ? 'exists' : 'missing');
    console.log('error:', error);

    if (error) {
      setStatus('Login failed. Redirecting...');
      setTimeout(() => navigate('/login?error=' + error), 1000);
      return;
    }

    if (token && user) {
      try {
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', decodeURIComponent(user));
        setStatus('Success! Redirecting to dashboard...');
        // Small delay to ensure localStorage is set
        setTimeout(() => navigate('/dashboard'), 500);
      } catch (err) {
        console.log('Parse error:', err);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ email: 'user' }));
        setTimeout(() => navigate('/dashboard'), 500);
      }
    } else {
      setStatus('No credentials found. Redirecting...');
      setTimeout(() => navigate('/login'), 1000);
    }
  }, [navigate]);

  return (
    <div style={{
      display:        'flex',
      justifyContent: 'center',
      alignItems:     'center',
      height:         '100vh',
      background:     '#0A0A0A',
      color:          'white',
      fontFamily:     "'Space Grotesk', sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⟳</div>
        <div style={{ color: '#00F0FF' }}>{status}</div>
      </div>
    </div>
  );
};

export default GoogleCallback;