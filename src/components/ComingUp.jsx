import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { dateToYMD } from '../utils/dateHelpers'

function getDateLabel(dateStr) {
  const today = dateToYMD(new Date())
  const d = new Date(Date.now() + 86400000)
  d.setHours(0, 0, 0, 0)
  const tomorrow = dateToYMD(d)
  if (dateStr === today) return 'Tonight'
  if (dateStr === tomorrow) return 'Tomorrow'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })
}

function formatShortDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ComingUp() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const start = dateToYMD(new Date())
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 30)
        const end = dateToYMD(endDate)
        const { data } = await axios.get(`/api/calendar?start=${start}&end=${end}`)
        // take first 3 planned entries (recipe or meal_type)
        const upcoming = data
          .filter((e) => e.recipe_id || e.meal_type)
          .slice(0, 3)
          .map((e) => ({ ...e, dinner_date: e.dinner_date.toString().slice(0, 10) }))
        setEntries(upcoming)
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <div className="mb-10">
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: 16, color: '#1C1C1C' }}>
          Coming Up…
        </h2>
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 rounded-2xl bg-gray-100 animate-pulse" style={{ height: 110 }} />
          ))}
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="mb-10 p-5 rounded-2xl border-2 border-dashed border-gray-200 flex items-center gap-3">
        <span className="text-2xl">🗓️</span>
        <div>
          <p className="font-semibold text-sm" style={{ fontFamily: "'Nunito', sans-serif", color: '#6B7280' }}>
            Nothing planned yet
          </p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Head to the Calendar to plan this week's dinners.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-10">
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: 16, color: '#1C1C1C' }}>
        Coming Up…
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {entries.map((entry) => {
          const imageUrl = entry.blob_url || entry.image_url
          const label = getDateLabel(entry.dinner_date)
          const shortDate = formatShortDate(entry.dinner_date)
          const mealMeta = {
            go_out: { icon: '🍽️', name: 'Going Out' },
            order_in: { icon: '🛵', name: 'Order In' },
          }[entry.meal_type]
          const isClickable = !!entry.recipe_id
          return (
            <button
              key={entry.dinner_date}
              onClick={() => isClickable && navigate(`/recipes/${entry.recipe_id}`)}
              className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm text-left border-none w-full transition-all"
              style={{ transition: 'box-shadow 200ms, transform 200ms', cursor: isClickable ? 'pointer' : 'default' }}
              onMouseEnter={(e) => {
                if (!isClickable) return
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = ''
                e.currentTarget.style.transform = ''
              }}
            >
              {/* Thumbnail */}
              <div
                className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: '#F5EDE3' }}
              >
                {mealMeta ? (
                  <span style={{ fontSize: '1.8rem' }}>{mealMeta.icon}</span>
                ) : imageUrl ? (
                  <img src={imageUrl} alt={entry.recipe_name} className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <span style={{ fontSize: '1.5rem' }}>🍽</span>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0">
                <p
                  className="text-xs font-bold uppercase tracking-wide mb-0.5"
                  style={{ color: '#C4622D', fontFamily: "'Nunito', sans-serif" }}
                >
                  {label} · {shortDate}
                </p>
                <p
                  className="text-sm font-semibold leading-tight"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    color: '#1C1C1C',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {mealMeta ? mealMeta.name : entry.recipe_name}
                </p>
                {entry.average_rating && !mealMeta && (
                  <span style={{ color: '#C4622D', fontSize: '0.75rem' }}>★ {entry.average_rating.toFixed(1)}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
