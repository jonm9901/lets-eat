import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import RecipeCard from '../components/RecipeCard'
import RecipeModal from '../components/RecipeModal'
import ComingUp from '../components/ComingUp'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div style={{ height: 200, backgroundColor: '#E5E7EB' }} />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}

export default function Library() {
  const { activeUser } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchRecipes()
  }, [sort, activeUser])

  async function fetchRecipes() {
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/recipes?sort=${sort}&user_id=${activeUser.id}`)
      setRecipes(data)
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(
    () => recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [recipes, search]
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Coming Up */}
      <ComingUp />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', margin: 0, color: '#1C1C1C' }}>
          Recipes
        </h1>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Search recipes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
          style={{ fontFamily: "'Nunito', sans-serif" }}
          onFocus={(e) => e.target.style.borderColor = '#C4622D'}
          onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white cursor-pointer"
          style={{ fontFamily: "'Nunito', sans-serif", color: '#374151' }}
        >
          <option value="newest">Newest First</option>
          <option value="alpha">A – Z</option>
          <option value="top_rated">Top Rated</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl mb-4">🍽️</span>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#6B7280' }}>
            {search ? 'No recipes match your search.' : 'No recipes yet — add your first one!'}
          </p>
          {!search && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-6 py-2.5 rounded-xl text-white font-semibold text-sm"
              style={{ backgroundColor: '#C4622D', fontFamily: "'Nunito', sans-serif", border: 'none', cursor: 'pointer' }}
            >
              Add Recipe
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full text-white text-2xl shadow-lg flex items-center justify-center"
        style={{ backgroundColor: '#C4622D', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(196,98,45,0.45)' }}
        title="Add Recipe"
      >
        +
      </button>

      {showModal && (
        <RecipeModal
          recipe={null}
          onClose={() => setShowModal(false)}
          onSave={fetchRecipes}
        />
      )}
    </div>
  )
}
