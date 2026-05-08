// HeroSection.jsx — Main landing page
const HeroSection = ({ onNavigate }) => (
  <div style={heroStyles.wrap}>
    <div style={heroStyles.hero}>
      <div style={heroStyles.heroInner}>
        <span style={heroStyles.eyebrow}>Welcome</span>
        <h1 style={heroStyles.h1}>Apps Built<br/>From Real Life</h1>
        <p style={heroStyles.lead}>
          I'm a solo developer who builds simple, honest apps — tools I wished existed.
          No bloat, no subscriptions. Just things that work.
        </p>
        <div style={heroStyles.btns}>
          <button style={heroStyles.btnPrimary} onClick={() => onNavigate('apps')}>Browse My Apps</button>
          <button style={heroStyles.btnGhost} onClick={() => onNavigate('about')}>My Story</button>
        </div>
      </div>
      <div style={heroStyles.heroArt}>
        <div style={heroStyles.spiralWrap}>
          <img src="../../assets/logo-icon.svg" alt="Journey Solutions" style={heroStyles.spiralImg} />
        </div>
      </div>
    </div>

    <div style={heroStyles.strip}>
      <div style={heroStyles.stripLabel}>Featured Apps</div>
      <div style={heroStyles.stripCards}>
        {[
          { icon: 'wind',        category: 'Meditation', title: 'Still',           desc: 'A gentle habit starter for daily meditation.', tag: 'Free', tagColor: null },
          { icon: 'credit-card', category: 'Finance',    title: 'Payment Tracker', desc: 'Track loan payments with clarity.',            tag: 'Free', tagColor: null },
          { icon: 'tent',        category: 'Events',     title: 'Rally Manager',   desc: 'Manage camping event registrations.',          tag: 'Free', tagColor: 'amber' },
        ].map((app, i) => (
          <AppCard key={i} {...app} description={app.desc} onClick={() => onNavigate('appdetail')} />
        ))}
      </div>
    </div>
  </div>
);

const heroStyles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '0' },
  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    padding: '60px 48px 48px',
    minHeight: '380px',
  },
  heroInner: { flex: 1, maxWidth: '520px' },
  eyebrow: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '12px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#EA8724',
    display: 'block',
    marginBottom: '10px',
  },
  h1: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '52px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#540608',
    lineHeight: '1.05',
    marginBottom: '18px',
  },
  lead: {
    fontFamily: "'Lora', serif",
    fontSize: '17px',
    color: '#6B5744',
    lineHeight: '1.7',
    marginBottom: '28px',
    maxWidth: '440px',
    textWrap: 'pretty',
  },
  btns: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  btnPrimary: {
    padding: '12px 28px',
    background: '#540608',
    color: '#EA8724',
    border: 'none',
    borderRadius: '8px',
    fontFamily: "'Oswald', sans-serif",
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  btnGhost: {
    padding: '11px 28px',
    background: 'transparent',
    color: '#782121',
    border: '1.5px solid #782121',
    borderRadius: '8px',
    fontFamily: "'Oswald', sans-serif",
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  heroArt: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spiralWrap: {
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    background: '#540608',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 40px rgba(84,6,8,0.18)',
    overflow: 'hidden',
  },
  spiralImg: { width: '160px', height: '160px', objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(65%) sepia(60%) saturate(800%) hue-rotate(5deg) brightness(105%)' },
  strip: {
    borderTop: '1px solid #E2D8CC',
    padding: '32px 48px 48px',
    background: '#FFFFFF',
  },
  stripLabel: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '11px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#A99080',
    marginBottom: '20px',
  },
  stripCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
};

Object.assign(window, { HeroSection });
