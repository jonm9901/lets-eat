import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function RecipeModal({ recipe, onClose, onSave }) {
  const { activeUser } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef(null)
  const isEdit = !!recipe

  const [name, setName] = useState(recipe?.name || '')
  const [description, setDescription] = useState(recipe?.description || '')
  const [ingredients, setIngredients] = useState(recipe?.ingredients || '')
  const [instructions, setInstructions] = useState(recipe?.instructions || '')
  const [linkUrl, setLinkUrl] = useState(recipe?.link_url || '')
  const [imageTab, setImageTab] = useState('auto')
  const [imageUrl, setImageUrl] = useState(recipe?.image_url || '')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(recipe?.blob_url || recipe?.image_url || '')
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)

  // Set initial tab based on existing recipe data
  useEffect(() => {
    if (recipe?.blob_url) setImageTab('upload')
    else if (recipe?.image_url) setImageTab('url')
    else setImageTab('auto')
  }, [recipe])

  function handleFileSelect(file) {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!name.trim()) return showToast('Recipe name is required', 'error')
    setLoading(true)
    try {
      const blobUrlToKeep = imageTab === 'upload' ? (recipe?.blob_url || null) : null
      const imageUrlToSave = imageTab === 'url' ? imageUrl || null : null

      const recipeData = {
        name: name.trim(),
        description: description.trim() || null,
        ingredients: ingredients.trim() || null,
        instructions: instructions.trim() || null,
        link_url: linkUrl.trim() || null,
        image_url: imageUrlToSave,
        blob_url: blobUrlToKeep,
      }

      let savedRecipe
      if (isEdit) {
        const { data } = await axios.put(`/api/recipes/${recipe.id}`, recipeData)
        savedRecipe = data
      } else {
        const { data } = await axios.post('/api/recipes', {
          ...recipeData,
          added_by_user_id: activeUser.id,
        })
        savedRecipe = data
      }

      // Upload photo if a new file was selected
      if (imageTab === 'upload' && imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        await axios.post(`/api/recipes/${savedRecipe.id}/image`, formData)
      }

      // Fetch OG image if auto tab and link provided
      if (imageTab === 'auto' && linkUrl.trim()) {
        try {
          const { data: ogData } = await axios.get(
            `/api/recipes/og-image?url=${encodeURIComponent(linkUrl.trim())}`
          )
          if (ogData.og_image_url) {
            await axios.put(`/api/recipes/${savedRecipe.id}`, { image_url: ogData.og_image_url })
          }
        } catch {
          // silently ignore OG failures
        }
      }

      showToast(isEdit ? 'Recipe updated!' : 'Recipe saved! 🍽️')
      onSave()
      onClose()
    } catch {
      showToast('Failed to save recipe', 'error')
    } finally {
      setLoading(false)
    }
  }

  const tabStyle = (tab) => ({
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: '0.85rem',
    fontWeight: 600,
    fontFamily: "'Nunito', sans-serif",
    cursor: 'pointer',
    border: 'none',
    backgroundColor: imageTab === tab ? '#C4622D' : 'transparent',
    color: imageTab === tab ? '#fff' : '#6B7280',
    transition: 'all 150ms',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-y-auto"
        style={{ maxHeight: '92vh', animation: 'modalIn 0.2s ease-out' }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', margin: 0 }}>
              {isEdit ? 'Edit Recipe' : 'Add Recipe'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none border-none bg-transparent cursor-pointer">×</button>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
                Recipe Name <span style={{ color: '#C4622D' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grandma's Lasagna"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                onFocus={(e) => e.target.style.borderColor = '#C4622D'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short description of the dish…"
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                onFocus={(e) => e.target.style.borderColor = '#C4622D'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>Ingredients</label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="One ingredient per line"
                rows={5}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                onFocus={(e) => e.target.style.borderColor = '#C4622D'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>Cooking Instructions & Steps</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="1. Preheat oven to 375°&#10;2. Mix flour and butter…"
                rows={6}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                onFocus={(e) => e.target.style.borderColor = '#C4622D'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>Recipe Link</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                onFocus={(e) => e.target.style.borderColor = '#C4622D'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            {/* Image section */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Photo</label>
              <div className="flex gap-1 mb-3 p-1 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
                <button style={tabStyle('upload')} onClick={() => setImageTab('upload')}>Upload</button>
                <button style={tabStyle('url')} onClick={() => setImageTab('url')}>Image URL</button>
                <button style={tabStyle('auto')} onClick={() => setImageTab('auto')}>Auto</button>
              </div>

              {imageTab === 'upload' && (
                <div
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    const file = e.dataTransfer.files[0]
                    if (file) handleFileSelect(file)
                  }}
                  className="rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center overflow-hidden"
                  style={{
                    height: imagePreview && imageTab === 'upload' ? 'auto' : 120,
                    borderColor: dragOver ? '#C4622D' : '#D1D5DB',
                    backgroundColor: dragOver ? '#FEF3EC' : '#F9FAFB',
                    transition: 'all 150ms',
                  }}
                >
                  {imagePreview && imageTab === 'upload' ? (
                    <img src={imagePreview} alt="preview" className="w-full object-cover rounded-xl" style={{ maxHeight: 200 }} />
                  ) : (
                    <>
                      <span className="text-2xl mb-1">📷</span>
                      <span className="text-sm text-gray-500">Drop an image or click to browse</span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  />
                </div>
              )}

              {imageTab === 'url' && (
                <div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value) }}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none mb-2"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                    onFocus={(e) => e.target.style.borderColor = '#C4622D'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                  {imageUrl && (
                    <img src={imageUrl} alt="preview" className="w-full rounded-xl object-cover" style={{ maxHeight: 160 }}
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  )}
                </div>
              )}

              {imageTab === 'auto' && (
                <p className="text-sm text-center py-4" style={{ color: '#9CA3AF' }}>
                  We'll try to pull an image from your recipe link when you save.
                </p>
              )}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full mt-6 py-3 rounded-xl text-white font-semibold text-base disabled:opacity-50"
            style={{ backgroundColor: '#C4622D', fontFamily: "'Nunito', sans-serif", border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Saving…' : 'Save Recipe'}
          </button>
        </div>
      </div>
    </div>
  )
}
