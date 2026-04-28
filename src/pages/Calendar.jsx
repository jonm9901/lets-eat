import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../context/ToastContext'
import DayCell from '../components/DayCell'
import RecipePicker from '../components/RecipePicker'
import {
  getMondayOfWeek,
  dateToYMD,
  formatWeekRange,
  isDateInPast,
} from '../utils/dateHelpers'

export default function Calendar() {
  const { showToast } = useToast()
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMondayOfWeek(new Date()))
  const [calendarData, setCalendarData] = useState({})
  const [assigningDate, setAssigningDate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeek()
  }, [currentWeekStart])

  async function fetchWeek() {
    setLoading(true)
    try {
      const start = dateToYMD(currentWeekStart)
      const endDate = new Date(currentWeekStart)
      endDate.setDate(endDate.getDate() + 6)
      const end = dateToYMD(endDate)

      const { data } = await axios.get(`/api/calendar?start=${start}&end=${end}`)

      const map = {}
      data.forEach((entry) => {
        // Normalize date key — Neon may return full ISO string for DATE columns
        const key = entry.dinner_date.toString().slice(0, 10)
        map[key] = entry
      })
      setCalendarData(map)
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }

  function prevWeek() {
    setCurrentWeekStart((d) => {
      const prev = new Date(d)
      prev.setDate(prev.getDate() - 7)
      return prev
    })
  }

  function nextWeek() {
    setCurrentWeekStart((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() + 7)
      return next
    })
  }

  async function handleRemove(dateStr) {
    try {
      await axios.delete(`/api/calendar/${dateStr}`)
      setCalendarData((prev) => {
        const next = { ...prev }
        delete next[dateStr]
        return next
      })
      showToast('Dinner removed')
    } catch {
      showToast('Failed to remove dinner', 'error')
    }
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart)
    date.setDate(date.getDate() + i)
    return date
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Week header */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', margin: 0, color: '#1C1C1C' }}>
          Dinner Calendar
        </h1>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={prevWeek}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer text-gray-600 transition-colors"
            style={{ fontSize: '1.1rem' }}
          >
            ←
          </button>
          <span
            className="text-sm font-semibold px-1 min-w-52 text-center"
            style={{ fontFamily: "'Nunito', sans-serif", color: '#374151' }}
          >
            {formatWeekRange(currentWeekStart)}
          </span>
          <button
            onClick={nextWeek}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer text-gray-600 transition-colors"
            style={{ fontSize: '1.1rem' }}
          >
            →
          </button>
          <button
            onClick={() => setCurrentWeekStart(getMondayOfWeek(new Date()))}
            className="px-4 py-1.5 rounded-full text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            style={{ fontFamily: "'Nunito', sans-serif", color: '#374151' }}
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar grid — 7 columns desktop, 1 column mobile */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="rounded-xl bg-gray-100 animate-pulse" style={{ minHeight: 130 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {days.map((date) => {
            const dateStr = dateToYMD(date)
            const entry = calendarData[dateStr] || null
            const isPast = isDateInPast(date)

            return (
              <DayCell
                key={dateStr}
                date={date}
                entry={entry}
                isPast={isPast}
                onAssign={() => setAssigningDate(dateStr)}
                onRemove={() => handleRemove(dateStr)}
              />
            )
          })}
        </div>
      )}

      {assigningDate && (
        <RecipePicker
          date={assigningDate}
          hasExisting={!!calendarData[assigningDate]}
          onClose={() => setAssigningDate(null)}
          onAssigned={() => {
            setAssigningDate(null)
            fetchWeek()
          }}
        />
      )}
    </div>
  )
}
