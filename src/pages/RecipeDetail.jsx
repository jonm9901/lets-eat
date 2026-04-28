import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import RecipeModal from '../components/RecipeModal'

function FoodPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F5EDE3' }}>
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="22" fill="#EDD9C0" />
        <circle cx="32" cy="32" r="15" fill="#E8C99A" />
        <path d="M24 30 Q28 24 32 30 Q36 36 40 30" stroke="#C4622D" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M26 36 Q32 30 38 36" stroke="#7D9B76" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="text-2xl border-none bg-transparent cursor-pointer p-0 leading-none"
          style={{
            color: star <= (hovered || value) ? '#C4622D' : '#D1D5DB',
            transition: 'color 100ms, transform 100ms',
            transform: star <= hovered ? 'scale(1.2)' : 'scale(1)',
          }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function RecipeDetail() {
  const { id } = useParams()
  const { activeUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingLoading, setRatingLoading] = useState(false)

  useEffect(() => { fetchRecipe() }, [id])

  async function fetchRecipe() {
    try {
      const { data } = await axios.get(`/api/recipes/${id}`)
      setRecipe(data)
      const myRating = data.per_user_ratings?.find((r) => r.user_id === activeUser.id)
      if (myRating?.stars) setRating(myRating.stars)
    } catch {
      navigate('/library')
    } finally {
      setLoading(false)
    }
  }

  async function handleRate(stars) {
    setRating(stars)
    setRatingLoading(true)
    try {
      await axios.post('/api/ratings', { recipe_id: Number(id), user_id: activeUser.id, stars })
      showToast('Rating saved! ⭐')
      fetchRecipe()
    } catch {
      showToast('Failed to save rating', 'error')
    } finally {
      setRatingLoading(false)
    }
  }

  async function handleDelete() {
    try {
      await axios.delete(`/api/recipes/${id}`, { data: { user_id: activeUser.id } })
      showToast('Recipe deleted')
      navigate('/library')
    } catch {
      showToast('Failed to delete recipe', 'error')
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-72 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    )
  }

  if (!recipe) return null

  const imageUrl = recipe.blob_url || recipe.image_url
  const canEdit = activeUser.id === recipe.added_by_user_id || activeUser.role === 'admin'
  const isAdmin = activeUser.role === 'admin'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate('/library')}
        className="flex items-center gap-1 text-sm mb-6 border-none bg-transparent cursor-pointer p-0"
        style={{ color: '#9CA3AF', fontFamily: "'Nunito', sans-serif" }}
      >
        ← Back to Library
      </button>

      {/* Hero image */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ height: 300 }}>
        {imageUrl ? (
          <img src={imageUrl} alt={recipe.name} className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
          />
        ) : null}
        <div style={{ height: 300, display: imageUrl ? 'none' : 'flex' }}>
          <FoodPlaceholder />
        </div>
      </div>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', margin: 0, lineHeight: 1.2, color: '#1C1C1C' }}>
          {recipe.name}
        </h1>
        <div className="flex gap-2 flex-shrink-0 mt-1">
          {canEdit && (
            <button
              onClick={() => setShowEdit(true)}
              className="p-2 rounded-lg border-none bg-transparent cursor-pointer text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Edit recipe"
            >
              ✏️
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg border-none bg-transparent cursor-pointer text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete recipe"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Meta */}
      <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
        Added by {recipe.added_by_name} · {formatDate(recipe.created_at)}
      </p>

      {/* Description */}
      {recipe.description && (
        <p className="mb-6 leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif", color: '#374151' }}>
          {recipe.description}
        </p>
      )}

      {/* Ingredients */}
      {recipe.ingredients && (
        <div className="mb-6">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', marginBottom: 8, color: '#1C1C1C' }}>
            Ingredients
          </h2>
          <ul className="space-y-1 pl-5" style={{ color: '#374151' }}>
            {recipe.ingredients.split('\n').filter(Boolean).map((ing, i) => (
              <li key={i} style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem' }}>{ing}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Instructions */}
      {recipe.instructions && (
        <div className="mb-6">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', marginBottom: 8, color: '#1C1C1C' }}>
            Cooking Instructions & Steps
          </h2>
          <ol className="space-y-2 pl-5" style={{ color: '#374151' }}>
            {recipe.instructions.split('\n').filter(Boolean).map((step, i) => (
              <li key={i} style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem' }}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Recipe link */}
      {recipe.link_url && (
        <a
          href={recipe.link_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border text-sm font-semibold mb-8 no-underline transition-colors"
          style={{ borderColor: '#C4622D', color: '#C4622D', fontFamily: "'Nunito', sans-serif" }}
        >
          View Full Recipe →
        </a>
      )}

      {/* Ratings */}
      <div className="mb-8">
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', marginBottom: 16, color: '#1C1C1C' }}>
          Family Ratings
        </h2>

        {/* Average */}
        <div className="flex items-baseline gap-2 mb-5">
          <span style={{ fontSize: '2rem', color: '#C4622D', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            {recipe.average_rating ? `${recipe.average_rating} ★` : '—'}
          </span>
          <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
            {recipe.rating_count > 0 ? `(${recipe.rating_count} rating${recipe.rating_count !== 1 ? 's' : ''})` : 'No ratings yet'}
          </span>
        </div>

        {/* Per-user breakdown */}
        <div className="space-y-3">
          {recipe.per_user_ratings?.map((ur) => {
            const isMe = ur.user_id === activeUser.id
            return (
              <div key={ur.user_id} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: '#9CA3AF', fontFamily: "'Playfair Display', serif" }}
                  >
                    {ur.user_name?.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold w-16" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {ur.user_name}
                  </span>
                  {ur.stars ? (
                    <span style={{ color: '#C4622D', fontSize: '1rem' }}>
                      {'★'.repeat(ur.stars)}
                      <span style={{ color: '#D1D5DB' }}>{'★'.repeat(5 - ur.stars)}</span>
                    </span>
                  ) : (
                    <span style={{ color: '#D1D5DB', fontSize: '0.8rem', fontStyle: 'italic' }}>Not yet rated</span>
                  )}
                </div>
                {isMe && (
                  <div className="ml-11 flex items-center gap-3">
                    <StarPicker value={rating} onChange={handleRate} />
                    {ratingLoading && <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Saving…</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Calendar appearances */}
      {recipe.calendar_appearances?.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', marginBottom: 10, color: '#1C1C1C' }}>
            Past Dinners
          </h2>
          <div className="flex flex-wrap gap-2">
            {recipe.calendar_appearances.map((ca, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: '#F0F5EF', color: '#7D9B76', fontFamily: "'Nunito', sans-serif" }}
              >
                {formatDate(ca.dinner_date)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEdit && (
        <RecipeModal
          recipe={recipe}
          onClose={() => setShowEdit(false)}
          onSave={fetchRecipe}
        />
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', marginBottom: 8 }}>
              Delete "{recipe.name}"?
            </h3>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              This will also remove it from the calendar. This can't be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold cursor-pointer bg-white"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer border-none"
                style={{ backgroundColor: '#EF4444', fontFamily: "'Nunito', sans-serif" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
