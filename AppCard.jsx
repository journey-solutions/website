// AppCard.jsx — Journey Solutions app listing card
const AppCard = ({ icon, category, title, description, tag, tagColor, onClick }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...appCardStyles.card,
        ...(hovered ? appCardStyles.cardHover : {}),
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{
        ...appCardStyles.iconWrap,
        background: tagColor === 'amber' ? '#EA8724' : '#540608',
      }}>
        <i data-lucide={icon} style={{
          ...appCardStyles.icon,
          stroke: tagColor === 'amber' ? '#540608' : '#EA8724',
        }}></i>
      </div>
      <div style={appCardStyles.categoryRow}>
        <span style={appCardStyles.category}>{category}</span>
      </div>
      <div style={appCardStyles.title}>{title}</div>
      <div style={appCardStyles.desc}>{description}</div>
      <div style={appCardStyles.footer}>
        <span style={appCardStyles.learnMore}>
          Learn More
          <i data-lucide="arrow-right" style={appCardStyles.arrowIcon}></i>
        </span>
        {tag && (
          <span style={{
            ...appCardStyles.tag,
            background: tag === 'New' ? '#FCECD0' : tag === 'Coming Soon' ? '#F2DADA' : '#F2DADA',
            color: tag === 'New' ? '#8C4E00' : tag === 'Coming Soon' ? '#782121' : '#540608',
          }}>{tag}</span>
        )}
      </div>
    </div>
  );
};

const appCardStyles = {
  card: {
    background: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(84,6,8,0.07)',
    border: '1px solid #E2D8CC',
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    transition: 'box-shadow 0.2s, transform 0.2s',
  },
  cardHover: {
    boxShadow: '0 6px 28px rgba(84,6,8,0.14)',
    transform: 'translateY(-2px)',
  },
  iconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    flexShrink: 0,
  },
  icon: {
    width: '20px',
    height: '20px',
    strokeWidth: '1.75',
    display: 'block',
  },
  categoryRow: {
    marginBottom: '3px',
  },
  category: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#A99080',
  },
  title: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#540608',
    lineHeight: '1.15',
    marginBottom: '8px',
  },
  desc: {
    fontFamily: "'Lora', serif",
    fontSize: '13px',
    color: '#6B5744',
    lineHeight: '1.65',
    marginBottom: '14px',
    flex: 1,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  learnMore: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontFamily: "'Oswald', sans-serif",
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#C97200',
    cursor: 'pointer',
  },
  arrowIcon: {
    width: '13px',
    height: '13px',
    stroke: '#C97200',
    strokeWidth: '2',
    display: 'block',
  },
  tag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontFamily: "'Oswald', sans-serif",
    fontSize: '9px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
};

Object.assign(window, { AppCard });
