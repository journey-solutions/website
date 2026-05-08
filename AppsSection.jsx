// AppsSection.jsx — Full app catalog page
const APPS_DATA = [
  { icon: 'wind',         category: 'Meditation',   title: 'Still',              description: 'A gentle habit starter for daily meditation. Build a practice that actually sticks — one quiet moment at a time.', tag: 'Free', tagColor: null },
  { icon: 'credit-card',  category: 'Finance',      title: 'Payment Tracker',    description: 'Track loan payments with clarity. See what you owe, what you\'ve paid, and when you\'ll be done.', tag: 'Free', tagColor: null },
  { icon: 'tent',         category: 'Events',       title: 'Rally Manager',      description: 'Manage registrations for camping events and rallies. Keep attendees organized without the spreadsheet chaos.', tag: 'Free', tagColor: 'amber' },
];

const AppsSection = ({ onNavigate }) => (
  <div style={appsStyles.wrap}>
    <div style={appsStyles.header}>
      <span style={appsStyles.eyebrow}>All Apps</span>
      <h1 style={appsStyles.h1}>My App Collection</h1>
      <p style={appsStyles.lead}>Each app started as a personal problem. Hopefully one of them solves yours.</p>
    </div>
    <div style={appsStyles.grid}>
      {APPS_DATA.map((app, i) => (
        <AppCard key={i} {...app} onClick={() => onNavigate('appdetail')} />
      ))}
    </div>
  </div>
);

const appsStyles = {
  wrap: { padding: '52px 48px' },
  header: { marginBottom: '36px' },
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
    marginBottom: '12px',
  },
  lead: {
    fontFamily: "'Lora', serif",
    fontSize: '16px',
    color: '#6B5744',
    lineHeight: '1.65',
    maxWidth: '480px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '18px',
  },
};

Object.assign(window, { AppsSection, APPS_DATA });
