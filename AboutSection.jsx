// AboutSection.jsx — About Me page
const AboutSection = () => (
  <div style={aboutStyles.wrap}>
    <div style={aboutStyles.header}>
      <span style={aboutStyles.eyebrow}>About Me</span>
      <h1 style={aboutStyles.h1}>Here's My Story</h1>
    </div>
    <div style={aboutStyles.body}>
      <div style={aboutStyles.photoCol}>
        <div style={aboutStyles.photoPlaceholder}>
          <i data-lucide="user" style={{ width: '48px', height: '48px', stroke: '#EA8724', strokeWidth: '1.25', display: 'block' }}></i>
        </div>
        <div style={aboutStyles.photoCaption}>Journey Solutions Founder</div>
        <div style={aboutStyles.statRow}>
          <div style={aboutStyles.stat}>
            <span style={aboutStyles.statNum}>12+</span>
            <span style={aboutStyles.statLabel}>Apps Built</span>
          </div>
          <div style={aboutStyles.stat}>
            <span style={aboutStyles.statNum}>5 yrs</span>
            <span style={aboutStyles.statLabel}>Developing</span>
          </div>
        </div>
      </div>
      <div style={aboutStyles.textCol}>
        <p style={aboutStyles.p}>
          I didn't start out as a developer. I started out as someone who couldn't find the tools I needed — so I learned to build them myself.
        </p>
        <p style={aboutStyles.p}>
          Every app in this collection grew out of a real problem I faced. I'd look for a solution, find nothing that quite fit, and end up writing my own. Over time, those personal projects became polished apps that other people could use too.
        </p>
        <p style={aboutStyles.p}>
          I believe software should be simple, honest, and respectful of your time. No dark patterns, no endless feature bloat, no subscription traps. Just useful tools that do what they say.
        </p>
        <blockquote style={aboutStyles.quote}>
          "I read every message and feature request. This isn't a faceless product — it's something I'm genuinely proud of."
        </blockquote>
        <p style={aboutStyles.p}>
          Thanks for stopping by. I hope something here makes your day a little easier.
        </p>
      </div>
    </div>
  </div>
);

const aboutStyles = {
  wrap: { padding: '52px 48px' },
  header: { marginBottom: '40px' },
  eyebrow: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '12px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#EA8724',
    display: 'block',
    marginBottom: '8px',
  },
  h1: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '46px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#540608',
    lineHeight: '1.05',
  },
  body: { display: 'flex', gap: '48px', alignItems: 'flex-start' },
  photoCol: {
    flexShrink: 0,
    width: '180px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  photoPlaceholder: {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    background: '#540608',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(84,6,8,0.15)',
  },
  photoCaption: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#A99080',
    textAlign: 'center',
  },
  statRow: { display: 'flex', gap: '16px', marginTop: '4px' },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statNum: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '24px',
    fontWeight: '700',
    color: '#540608',
  },
  statLabel: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '9px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#A99080',
  },
  textCol: { flex: 1, maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '16px' },
  p: {
    fontFamily: "'Lora', serif",
    fontSize: '15px',
    color: '#1A1008',
    lineHeight: '1.75',
    textWrap: 'pretty',
  },
  quote: {
    fontFamily: "'Lora', serif",
    fontStyle: 'italic',
    fontSize: '16px',
    color: '#6B5744',
    lineHeight: '1.65',
    borderLeft: '3px solid #EA8724',
    paddingLeft: '16px',
    margin: '4px 0',
  },
};

Object.assign(window, { AboutSection });
