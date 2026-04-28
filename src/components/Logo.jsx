export default function Logo({ size = 40 }) {
  const iconSize = size * 0.85

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.2 }}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Spoon */}
        <ellipse cx="9" cy="6.5" rx="3.8" ry="5" fill="#C4622D" />
        <line x1="9" y1="11.5" x2="9" y2="29" stroke="#C4622D" strokeWidth="2.5" strokeLinecap="round" />

        {/* Fork */}
        <line x1="21" y1="3" x2="21" y2="11" stroke="#C4622D" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="3" x2="18" y2="9" stroke="#C4622D" strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="3" x2="24" y2="9" stroke="#C4622D" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 9 Q21 13 21 14" stroke="#C4622D" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M24 9 Q21 13 21 14" stroke="#C4622D" strokeWidth="2" fill="none" strokeLinecap="round" />
        <line x1="21" y1="14" x2="21" y2="29" stroke="#C4622D" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <span
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          color: '#C4622D',
          fontSize: size * 0.55,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.01em',
        }}
      >
        Let's Eat!
      </span>
    </div>
  )
}
