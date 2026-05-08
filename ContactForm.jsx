// ContactForm.jsx — Contact Me page
const ContactForm = () => {
  const [form, setForm] = React.useState({ name: '', email: '', subject: '', message: '', submitted: false });
  const update = (k, v) => setForm(s => ({ ...s, [k]: v }));

  return (
    <div style={contactStyles.wrap}>
      <div style={contactStyles.header}>
        <span style={contactStyles.eyebrow}>Contact Me</span>
        <h1 style={contactStyles.h1}>Get in Touch</h1>
        <p style={contactStyles.lead}>Have a question, a bug report, or just want to say hi? I'd love to hear from you.</p>
      </div>

      <div style={contactStyles.layout}>
        <div style={contactStyles.formCol}>
          {form.submitted ? (
            <div style={contactStyles.successWrap}>
              <div style={contactStyles.successIcon}>
                <i data-lucide="check" style={{ width:'28px', height:'28px', stroke:'#EA8724', strokeWidth:'2', display:'block' }}></i>
              </div>
              <h3 style={contactStyles.successTitle}>Message Sent!</h3>
              <p style={contactStyles.successText}>Thanks for reaching out. I read every message and will get back to you soon.</p>
              <button style={contactStyles.resetBtn} onClick={() => setForm({ name:'', email:'', subject:'', message:'', submitted: false })}>Send Another</button>
            </div>
          ) : (
            <form style={contactStyles.form} onSubmit={e => { e.preventDefault(); update('submitted', true); }}>
              <div style={contactStyles.row}>
                <div style={contactStyles.field}>
                  <label style={contactStyles.label}>Your Name</label>
                  <input style={contactStyles.input} type="text" placeholder="e.g. Alex Johnson" value={form.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div style={contactStyles.field}>
                  <label style={contactStyles.label}>Email Address</label>
                  <input style={contactStyles.input} type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
              </div>
              <div style={contactStyles.field}>
                <label style={contactStyles.label}>Subject</label>
                <input style={contactStyles.input} type="text" placeholder="What's this about?" value={form.subject} onChange={e => update('subject', e.target.value)} />
              </div>
              <div style={contactStyles.field}>
                <label style={contactStyles.label}>Message</label>
                <textarea style={contactStyles.textarea} rows={5} placeholder="Tell me what's on your mind..." value={form.message} onChange={e => update('message', e.target.value)}></textarea>
              </div>
              <button type="submit" style={contactStyles.submitBtn}>Send Message</button>
            </form>
          )}
        </div>

        <div style={contactStyles.infoCol}>
          <div style={contactStyles.infoCard}>
            <div style={contactStyles.infoTitle}>Response Time</div>
            <p style={contactStyles.infoText}>I typically respond within 1–2 days. For urgent matters, mention it in your subject line.</p>
          </div>
          <div style={contactStyles.infoCard}>
            <div style={contactStyles.infoTitle}>App Feedback</div>
            <p style={contactStyles.infoText}>If you have feedback on a specific app, head to that app's page — there's a dedicated form there.</p>
          </div>
          <div style={contactStyles.infoCard}>
            <div style={contactStyles.infoTitle}>Feature Requests</div>
            <p style={contactStyles.infoText}>I genuinely read every request. Your ideas have shaped these apps more than you know.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const contactStyles = {
  wrap: { padding: '52px 48px' },
  header: { marginBottom: '36px' },
  eyebrow: {
    fontFamily: "'Oswald', sans-serif", fontSize: '12px', letterSpacing: '0.2em',
    textTransform: 'uppercase', color: '#EA8724', display: 'block', marginBottom: '8px',
  },
  h1: {
    fontFamily: "'Oswald', sans-serif", fontSize: '46px', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '0.04em', color: '#540608', lineHeight: '1.05', marginBottom: '12px',
  },
  lead: {
    fontFamily: "'Lora', serif", fontSize: '16px', color: '#6B5744', lineHeight: '1.65', maxWidth: '480px',
  },
  layout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '40px', alignItems: 'start' },
  formCol: {},
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: {
    fontFamily: "'Oswald', sans-serif", fontSize: '10px', fontWeight: '600',
    letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B5744',
  },
  input: {
    padding: '10px 14px', border: '1px solid #E2D8CC', borderRadius: '8px',
    background: '#F0EAE2', fontFamily: "'Lora', serif", fontSize: '14px', color: '#1A1008', outline: 'none',
  },
  textarea: {
    padding: '10px 14px', border: '1px solid #E2D8CC', borderRadius: '8px',
    background: '#F0EAE2', fontFamily: "'Lora', serif", fontSize: '14px', color: '#1A1008',
    outline: 'none', resize: 'vertical',
  },
  submitBtn: {
    alignSelf: 'flex-start', padding: '12px 30px', background: '#540608', color: '#EA8724',
    border: 'none', borderRadius: '8px', fontFamily: "'Oswald', sans-serif", fontSize: '13px',
    fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
  },
  infoCol: { display: 'flex', flexDirection: 'column', gap: '12px' },
  infoCard: {
    background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2D8CC',
    padding: '16px 18px', boxShadow: '0 1px 6px rgba(84,6,8,0.06)',
  },
  infoTitle: {
    fontFamily: "'Oswald', sans-serif", fontSize: '13px', fontWeight: '600',
    letterSpacing: '0.08em', textTransform: 'uppercase', color: '#540608', marginBottom: '6px',
  },
  infoText: {
    fontFamily: "'Lora', serif", fontSize: '12px', color: '#6B5744', lineHeight: '1.65',
  },
  successWrap: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', maxWidth: '420px', paddingTop: '20px' },
  successIcon: {
    width: '56px', height: '56px', borderRadius: '50%', background: '#540608',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  successTitle: {
    fontFamily: "'Oswald', sans-serif", fontSize: '28px', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '0.05em', color: '#540608',
  },
  successText: {
    fontFamily: "'Lora', serif", fontSize: '14px', color: '#6B5744', lineHeight: '1.7', textWrap: 'pretty',
  },
  resetBtn: {
    padding: '10px 22px', background: 'transparent', color: '#782121', border: '1.5px solid #782121',
    borderRadius: '8px', fontFamily: "'Oswald', sans-serif", fontSize: '12px', fontWeight: '600',
    letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
  },
};

Object.assign(window, { ContactForm });
