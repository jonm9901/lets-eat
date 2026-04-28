import { dateToYMD } from '../utils/dateHelpers'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function DayCell({ date, entry, isPast, onAssign, onRemove }) {
  const dateStr = dateToYMD(date)
  const isToday = dateToYMD(new Date()) === dateStr
  const dayName = DAY_NAMES[date.getDay()]
  const dayNum = date.getDate()
  const imageUrl = entry?.blob_url || entry?.image_url

  return (
    <div className="flex flex-col">
      {/* Day header */}
      <div
        className="text-center py-1 px-2 rounded-t-lg mb-1"
        style={isToday ? { backgroundColor: '#FEF3EC', borderLeft: '3px solid #C4622D' } : {}}
      >
        <div
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: isToday ? '#C4622D' : '#9CA3AF' }}
        >
          {dayName}
        </div>
        <div
          className="text-lg font-bold leading-none"
          style={{ color: isToday ? '#C4622D' : '#374151', fontFamily: "'Nunito', sans-serif" }}
        >
          {dayNum}
        </div>
      </div>

      {/* Content */}
      {entry ? (
        <div
          className="relative rounded-xl overflow-hidden border flex-1"
          style={{
            borderColor: '#E5E7EB',
            opacity: isPast ? 0.6 : 1,
            backgroundColor: '#fff',
            minHeight: 100,
          }}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt={entry.recipe_name}
              className="w-full object-cover"
              style={{ height: 64 }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          )}
          <div className="p-2">
            <p
              className="text-xs font-semibold leading-tight mb-1"
              style={{
                fontFamily: "'Nunito', sans-serif",
                color: '#1C1C1C',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {entry.recipe_name}
            </p>
            {entry.average_rating && (
              <span style={{ color: '#C4622D', fontSize: '0.7rem' }}>
                ★ {entry.average_rating.toFixed(1)}
              </span>
            )}
          </div>

          {!isPast && (
            <div className="absolute top-1 right-1 flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onAssign() }}
                className="w-5 h-5 rounded flex items-center justify-center text-xs border-none cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#6B7280' }}
                title="Change"
              >
                ↕
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove() }}
                className="w-5 h-5 rounded flex items-center justify-center text-xs border-none cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#EF4444' }}
                title="Remove"
              >
                ×
              </button>
            </div>
          )}
        </div>
      ) : isPast ? (
        <div
          className="rounded-xl flex-1"
          style={{ minHeight: 100, backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6' }}
        />
      ) : (
        <button
          onClick={onAssign}
          className="rounded-xl flex-1 flex flex-col items-center justify-center gap-1 border-2 border-dashed cursor-pointer bg-transparent transition-colors"
          style={{ minHeight: 100, borderColor: '#E5E7EB', color: '#9CA3AF' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C4622D'; e.currentTarget.style.color = '#C4622D' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#9CA3AF' }}
        >
          <span className="text-xl leading-none">+</span>
          <span style={{ fontSize: '0.65rem', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
            Add Dinner
          </span>
        </button>
      )}
    </div>
  )
}
