export default function Stars({ rating, count, showCount = true }) {
  if (!rating) {
    return <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>No ratings yet</span>
  }
  const filled = Math.round(rating)
  return (
    <span style={{ fontSize: '0.85rem' }}>
      <span style={{ color: '#C4622D' }}>
        {'★'.repeat(filled)}{'☆'.repeat(5 - filled)}
      </span>
      {showCount && (
        <span style={{ color: '#6B7280', marginLeft: 4 }}>
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </span>
  )
}
