import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDisplayDate } from '../utils/dateHelpers'
import Stars from './Stars'

const MEAL_OPTIONS = [
  { key: 'cook', label: 'Cook Dinner', icon: '👨‍🍳' },
  { key: 'go_out', label: 'Go Out', icon: '🍽️' },
  { key: 'order_in', label: 'Order In', icon: '🛵' },
]

export default function RecipePicker({ date, hasExisting, onClose, onAssigned }) {
  const { activeUser } = useAuth()
  const { showToast } = useToast()
  const [mode, setMode] = useState('cook')
  const [recipes, setRecipes] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const displayDate = formatDisplayDate(new Date(date + 'T00:00:00'))

  useEffect(() => {
    axios.get('/api/recipes?sort=alpha').then(({ data }) => {
      setRecipes(data)
      setLoading(false)
    })
  }, [])

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  async function saveEntry({ recipe_id = null, meal_type = null }) {
    setSaving(true)
    try {
      await axios.post('/api/calendar', {
        recipe_id,
        meal_type,
        dinner_date: date,
        assigned_by_user_id: activeUser.id,
      })
      const labels = { go_out: 'Going out! 🍽️', order_in: 'Order in! 🛵' }
      showToast(labels[meal_type] || 'Dinner planned! 👨‍🍳')
      onAssigned()
    } catch {
      showToast('Failed to save', 'error')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: '85vh', animation: 'modalIn 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', margin: 0 }}>
              {displayDate}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none border-none bg-transparent cursor-pointer ml-3 flex-shrink-0">×</button>
          </div>

          {hasExisting && (
            <p className="text-xs mb-3" style={{ color: '#9CA3AF' }}>
              This will replace the current selection.
            </p>
          )}

          {/* 3 options */}
          <div className="flex gap-2">
            {MEAL_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMode(opt.key)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 text-xs font-semibold transition-all cursor-pointer"
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  borderColor: mode === opt.key ? '#C4622D' : '#E5E7EB',
                  backgroundColor: mode === opt.key ? '#FEF3EC' : '#fff',
                  color: mode === opt.key ? '#C4622D' : '#6B7280',
                }}
              >
                <span className="text-lg">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cook Dinner: recipe search */}
        {mode === 'cook' && (
          <>
            <div className="px-5 pt-3 pb-2 border-b border-gray-50">
              <input
                type="text"
                placeholder="Search recipes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                onFocus={(e) => e.target.style.borderColor = '#C4622D'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-6 text-center text-sm" style={{ color: '#9CA3AF' }}>Loading recipes…</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center text-sm" style={{ color: '#9CA3AF' }}>No recipes found.</div>
              ) : (
                filtered.map((recipe) => {
                  const imageUrl = recipe.blob_url || recipe.image_url
                  return (
                    <button
                      key={recipe.id}
                      onClick={() => !saving && saveEntry({ recipe_id: recipe.id, meal_type: 'cook' })}
                      disabled={saving}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-none bg-transparent cursor-pointer text-left border-b border-gray-50"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: '#F5EDE3' }}>
                        {imageUrl ? (
                          <img src={imageUrl} alt={recipe.name} className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                        ) : (
                          <span style={{ fontSize: '1.2rem' }}>🍽</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ fontFamily: "'Nunito', sans-serif", color: '#1C1C1C' }}>
                          {recipe.name}
                        </p>
                        <Stars rating={recipe.average_rating} count={recipe.rating_count} />
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </>
        )}

        {/* Go Out / Order In: confirm button */}
        {(mode === 'go_out' || mode === 'order_in') && (
          <div className="p-5 flex flex-col items-center justify-center flex-1 gap-4">
            <span className="text-5xl">{MEAL_OPTIONS.find(o => o.key === mode).icon}</span>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#1C1C1C', margin: 0 }}>
              {mode === 'go_out' ? 'Going out for dinner!' : 'Ordering in tonight!'}
            </p>
            <button
              onClick={() => saveEntry({ meal_type: mode })}
              disabled={saving}
              className="px-8 py-3 rounded-xl text-white font-semibold disabled:opacity-50"
              style={{ backgroundColor: '#C4622D', fontFamily: "'Nunito', sans-serif", border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Saving…' : 'Plan this night →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
