// AppDetail.jsx — Individual app detail page
const AppDetail = ({ onNavigate }) => {
  const [formState, setFormState] = React.useState({ name: '', email: '', feedback: '', submitted: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormState(s => ({ ...s, submitted: true }));
  };

  return (
    <div style={detailStyles.wrap}>
      <button style={detailStyles.back} onClick={() => onNavigate('apps')}>
        <i data-lucide="arrow-left" style={{ width:'14px', height:'14px', stroke:'#C97200', strokeWidth:'2', display:'block' }}></i>
        Back to Apps
      </button>

      <div style={detailStyles.hero}>
        <div style={detailStyles.heroIcon}>
          <i data-lucide="compass" style={{ width:'36px', height:'36px', stroke:'#EA8724', strokeWidth:'1.5', display:'block' }}></i>
        </div>
        <div>
          <span style={detailStyles.category}>Utilities</span>
          <h1 style={detailStyles.title}>Trail Finder</h1>
          <div style={detailStyles.tagRow}>
            <span style={detailStyles.tagNew}>New</span>
            <span style={detailStyles.tagFree}>Free</span>
          </div>
        </div>
      </div>

      <p style={detailStyles.desc}>
        Discover hiking trails near you with offline maps and route saving. Trail Finder was born out of a weekend hike where I had no cell signal and no way to navigate. Never again.
      </p>

      <div style={detailStyles.divider}></div>

      <div style={detailStyles.howto}>
        <h2 style={detailStyles.h2}>How to Use</h2>
        <ol style={detailStyles.steps}>
          {[
            'Download the app and open it — no account required.',
            'Allow location access when prompted.',
            'Browse trails on the map or search by name.',
            'Tap a trail to see distance, elevation, and difficulty.',
            'Download the trail map for offline use before you go.',
            'Use the route tracker to log your hike in real time.',
          ].map((step, i) => (
            <li key={i} style={detailStyles.step}>
              <span style={detailStyles.stepNum}>{i + 1}</span>
              <span style={detailStyles.stepText}>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div style={detailStyles.divider}></div>

      <div style={detailStyles.feedbackSection}>
        <h2 style={detailStyles.h2}>Feedback & Feature Requests</h2>
        <p style={detailStyles.feedbackIntro}>Have an idea? Found a bug? I read every message — this is how apps get better.</p>

        {formState.submitted ? (
          <div style={detailStyles.successMsg}>
            <i data-lucide="check-circle" style={{ width:'20px', height:'20px', stroke:'#3A7D44', strokeWidth:'1.75', display:'block', flexShrink:0 }}></i>
            <span>Thanks! I'll read your message and get back to you if needed.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={detailStyles.form}>
            <div style={detailStyles.formRow}>
              <div style={detailStyles.field}>
                <label style={detailStyles.label}>Your Name</label>
                <input style={detailStyles.input} type="text" placeholder="e.g. Alex Johnson"
                  value={formState.name} onChange={e => setFormState(s => ({...s, name: e.target.value}))} />
              </div>
              <div style={detailStyles.field}>
                <label style={detailStyles.label}>Email (optional)</label>
                <input style={detailStyles.input} type="email" placeholder="you@example.com"
                  value={formState.email} onChange={e => setFormState(s => ({...s, email: e.target.value}))} />
              </div>
            </div>
            <div style={detailStyles.field}>
              <label style={detailStyles.label}>Your Message</label>
              <textarea style={detailStyles.textarea} rows={4}
                placeholder="Tell me what you think, or suggest a new feature..."
                value={formState.feedback} onChange={e => setFormState(s => ({...s, feedback: e.target.value}))}></textarea>
            </div>
            <button type="submit" style={detailStyles.submitBtn}>Send Feedback</button>
          </form>
        )}
      </div>
    </div>
  );
};

const detailStyles = {
  wrap: { padding: '40px 48px' },
  back: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: "'Oswald', sans-serif", fontSize: '11px', fontWeight: '600',
    letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C97200',
    marginBottom: '28px', padding: '0',
  },
  hero: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' },
  heroIcon: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: '#540608', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: '0 4px 20px rgba(84,6,8,0.15)',
  },
  category: {
    fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#A99080', display: 'block', marginBottom: '4px',
  },
  title: {
    fontFamily: "'Oswald', sans-serif", fontSize: '42px', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '0.04em', color: '#540608', lineHeight: '1.05',
  },
  tagRow: { display: 'flex', gap: '6px', marginTop: '8px' },
  tagNew: { padding: '2px 8px', borderRadius: '4px', background: '#FCECD0', color: '#8C4E00', fontFamily: "'Oswald',sans-serif", fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600' },
  tagFree: { padding: '2px 8px', borderRadius: '4px', background: '#F2DADA', color: '#540608', fontFamily: "'Oswald',sans-serif", fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600' },
  desc: {
    fontFamily: "'Lora', serif", fontSize: '15px', color: '#1A1008', lineHeight: '1.75',
    maxWidth: '580px', marginBottom: '28px', textWrap: 'pretty',
  },
  divider: { borderTop: '1px solid #E2D8CC', margin: '28px 0' },
  howto: { marginBottom: '8px' },
  h2: {
    fontFamily: "'Oswald', sans-serif", fontSize: '26px', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '0.05em', color: '#540608',
    marginBottom: '18px',
  },
  steps: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '0' },
  step: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  stepNum: {
    width: '24px', height: '24px', borderRadius: '50%', background: '#540608',
    color: '#EA8724', fontFamily: "'Oswald', sans-serif", fontSize: '11px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
  },
  stepText: { fontFamily: "'Lora', serif", fontSize: '14px', color: '#1A1008', lineHeight: '1.65' },
  feedbackSection: {},
  feedbackIntro: { fontFamily: "'Lora', serif", fontSize: '14px', color: '#6B5744', lineHeight: '1.65', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '560px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: {
    fontFamily: "'Oswald', sans-serif", fontSize: '10px', fontWeight: '600',
    letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B5744',
  },
  input: {
    padding: '9px 12px', border: '1px solid #E2D8CC', borderRadius: '8px',
    background: '#F0EAE2', fontFamily: "'Lora', serif", fontSize: '13px', color: '#1A1008',
    outline: 'none',
  },
  textarea: {
    padding: '9px 12px', border: '1px solid #E2D8CC', borderRadius: '8px',
    background: '#F0EAE2', fontFamily: "'Lora', serif", fontSize: '13px', color: '#1A1008',
    outline: 'none', resize: 'vertical',
  },
  submitBtn: {
    alignSelf: 'flex-start', padding: '11px 28px',
    background: '#540608', color: '#EA8724', border: 'none', borderRadius: '8px',
    fontFamily: "'Oswald', sans-serif", fontSize: '13px', fontWeight: '600',
    letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
  },
  successMsg: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: '#F0EAE2', border: '1px solid #C4B0A0', borderRadius: '8px',
    padding: '14px 16px', maxWidth: '460px',
    fontFamily: "'Lora', serif", fontSize: '14px', color: '#3A7D44',
  },
};

Object.assign(window, { AppDetail });
