import { useState } from 'react'
import { F, isInt } from './SistemaEngine'
import { useLang } from '../../i18n/LanguageContext'

// Parsea "5" → F(5), "-3" → F(-3), "3/4" → F(3, 4), "-3/4" → F(-3, 4).
// Devuelve null si está vacío o inválido.
export function parseFrac(str) {
  if (!str) return null
  const s = str.trim()
  if (s === '' || s === '-') return null
  if (s.includes('/')) {
    const [a, b] = s.split('/').map((x) => x.trim())
    const n = parseInt(a, 10)
    const d = parseInt(b, 10)
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null
    return F(n, d)
  }
  const n = parseInt(s, 10)
  if (!Number.isFinite(n)) return null
  return F(n)
}

export function fracToInput(f) {
  if (f == null) return ''
  if (isInt(f)) return `${f.n}`
  return `${f.n}/${f.d}`
}

// Input simple para una fracción. Acepta "−3", "3", "3/4", "-3/4".
export default function FracInput({ value, onChange, placeholder, disabled, autoFocus }) {
  const { t } = useLang()
  function clean(s) {
    return s.replace(/[^0-9/-]/g, '').replace(/(?!^)-/g, '')
  }
  return (
    <input
      type="text"
      inputMode="text"
      value={value}
      autoFocus={autoFocus}
      disabled={disabled}
      onChange={(e) => onChange(clean(e.target.value))}
      placeholder={placeholder ?? t.sistemas.fracPlaceholder}
      className={`w-20 px-2 py-1 rounded-xl border-2 font-mono font-bold text-xl text-center
        ${disabled ? 'bg-gray-100 border-gray-300 text-gray-500' : 'bg-white border-amber-400 text-amber-900 focus:border-amber-700 focus:outline-none'}`}
    />
  )
}
