import { useNavigate } from 'react-router-dom'
import Stars from './Stars'

function FoodPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F5EDE3' }}>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="22" fill="#EDD9C0" />
        <circle cx="32" cy="32" r="15" fill="#E8C99A" />
        <path d="M24 30 Q28 24 32 30 Q36 36 40 30" stroke="#C4622D" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M26 36 Q32 30 38 36" stroke="#7D9B76" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate()
  const imageUrl = recipe.blob_url || recipe.image_url

  return (
    <div
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer"
      style={{ transition: 'transform 200ms ease, box-shadow 200ms ease' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* Image */}
      <div style={{ height: 200, overflow: 'hidden' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
          />
        ) : null}
        <div style={{ height: 200, display: imageUrl ? 'none' : 'flex' }}>
          <FoodPlaceholder />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="font-semibold mb-1 leading-snug"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.05rem',
            color: '#1C1C1C',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {recipe.name}
        </h3>

        <p className="text-xs mb-2" style={{ color: '#9CA3AF' }}>
          Added by {recipe.added_by_name || 'Unknown'}
        </p>

        <div className="flex items-center justify-between">
          <Stars rating={recipe.average_rating} count={recipe.rating_count} />
          {recipe.user_stars && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#FEF3EC', color: '#C4622D', fontFamily: "'Nunito', sans-serif" }}
            >
              You: {'★'.repeat(recipe.user_stars)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
