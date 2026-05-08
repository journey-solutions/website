// SideNav.jsx — Journey Solutions side navigation
const SideNav = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'main',    icon: 'home',      label: 'Main' },
    { id: 'about',   icon: 'user',      label: 'About Me' },
    { id: 'apps',    icon: 'grid-2x2',  label: 'Apps' },
    { id: 'contact', icon: 'mail',      label: 'Contact' },
  ];

  return (
    <nav style={sideNavStyles.nav}>
      <div style={sideNavStyles.logoWrap}>
        <img src="../../assets/logo-transparent.png" alt="Journey Solutions" style={sideNavStyles.logo} />
      </div>
      <div style={sideNavStyles.items}>
        {navItems.map(item => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{...sideNavStyles.item, ...(active ? sideNavStyles.itemActive : {})}}
              title={item.label}
            >
              <div style={{
                ...sideNavStyles.circle,
                ...(active ? sideNavStyles.circleActive : sideNavStyles.circleDefault)
              }}>
                <i data-lucide={item.icon} style={{
                  ...sideNavStyles.icon,
                  stroke: active ? '#540608' : '#EA8724',
                }}></i>
              </div>
              <span style={{
                ...sideNavStyles.label,
                ...(active ? sideNavStyles.labelActive : {})
              }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const sideNavStyles = {
  nav: {
    width: '96px',
    minHeight: '100vh',
    background: '#FFFFFF',
    borderRight: '1px solid #E2D8CC',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '20px',
    paddingBottom: '24px',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
    boxShadow: '2px 0 8px rgba(84,6,8,0.04)',
  },
  logoWrap: {
    width: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    flexShrink: 0,
  },
  logo: {
    width: '80px',
    height: 'auto',
    objectFit: 'contain',
    filter: 'hue-rotate(155deg) saturate(1.8) brightness(0.55)',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
    alignItems: 'center',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '10px 8px',
    borderRadius: '10px',
    width: '84px',
    transition: 'background 0.15s',
  },
  itemActive: {
    background: '#FAF0F0',
  },
  circle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  },
  circleDefault: {
    background: '#540608',
  },
  circleActive: {
    background: '#EA8724',
  },
  icon: {
    width: '20px',
    height: '20px',
    strokeWidth: '1.75',
    display: 'block',
  },
  label: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#782121',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  labelActive: {
    color: '#EA8724',
    fontWeight: '600',
  },
};

Object.assign(window, { SideNav });
