const ComingSoon = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        border: '1px solid #333',
        borderRadius: '16px',
        padding: '60px 80px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚧</div>
        <div style={{ color: '#00F0FF', fontSize: '1.4rem', fontWeight: '700', marginBottom: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>Coming Soon</div>
        <div style={{ color: '#888', fontSize: '0.95rem' }}>This feature is currently under development.</div>
      </div>
    </div>
  );
};

export default ComingSoon;
