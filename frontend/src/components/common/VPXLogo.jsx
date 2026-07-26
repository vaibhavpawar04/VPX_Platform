const VPXLogo = ({ size = 'md' }) => {
  const scales = {
    sm: { mark: 16, text: 18, gap: 8 },
    md: { mark: 22, text: 24, gap: 10 },
    lg: { mark: 32, text: 34, gap: 14 },
  };
  const s = scales[size];
  const h = s.mark;
  const w = s.mark * 1.1;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${s.gap}px` }}>
      <svg width={w} height={h + 4} viewBox="-22 -18 44 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon
          points="-20,-17 -9,-17 0,9 9,-17 20,-17 0,21"
          fill="none"
          stroke="#00F0FF"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <polygon
          points="-9,-17 0,9 9,-17 4.5,-17 0,3 -4.5,-17"
          fill="#00F0FF"
          fillOpacity="0.12"
        />
        <line x1="-20" y1="21" x2="20" y2="21" stroke="#00F0FF" strokeWidth="1.5" strokeOpacity="0.15"/>
        <line x1="-20" y1="21" x2="-5" y2="21" stroke="#00F0FF" strokeWidth="1.5" strokeOpacity="0.6"/>
      </svg>
      <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: '800', fontSize: `${s.text}px`, color: '#00F0FF', letterSpacing: '-0.5px' }}>V</span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: '800', fontSize: `${s.text}px`, color: '#4D7EFF', letterSpacing: '-0.5px' }}>P</span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: '800', fontSize: `${s.text}px`, color: '#8B5CF6', letterSpacing: '-0.5px' }}>X</span>
      </div>
    </div>
  );
};

export default VPXLogo;
