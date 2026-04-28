import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDisplayDate } from '../utils/dateHelpers'
import Stars from './Stars'

export default function RecipePicker({ date, hasExisting, onClose, onAssigned }) {
  const { activeUser } = useAuth()
  const { showToast } = useToast()
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

  async function handleSelect(recipe) {
    setSaving(true)
    try {
      await axios.post('/api/calendar', {
        recipe_id: recipe.id,
        dinner_date: date,
        assigned_by_user_id: activeUser.id,
      })
      showToast('Dinner planned! 🍴')
      onAssigned()
    } catch {
      showToast('Failed to assign dinner', 'error')
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
          <div className="flex items-start justify-between mb-1">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', margin: 0 }}>
              Dinner for {displayDate}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none border-none bg-transparent cursor-pointer ml-3 flex-shrink-0">×</button>
          </div>
          {hasExisting && (
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
              This will replace the current selection.
            </p>
          )}
          <input
            type="text"
            placeholder="Search recipes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="mt-3 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
            style={{ fontFamily: "'Nunito', sans-serif" }}
            onFocus={(e) => e.target.style.borderColor = '#C4622D'}
            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>

        {/* Recipe list */}
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
                  onClick={() => !saving && handleSelect(recipe)}
                  disabled={saving}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-none bg-transparent cursor-pointer text-left border-b border-gray-50"
                >
                  <div
                    className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: '#F5EDE3' }}
                  >
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
      </div>
    </div>
  )
}
