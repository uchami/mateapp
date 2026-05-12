import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Compat con URLs viejas tipo /sistemas/eliminacion/nivel-3 (sin hash).
// Si el alumno entra con un path "limpio" y no hay hash, lo movemos al hash
// router para que ande igual.
if (window.location.pathname !== '/' && !window.location.hash) {
  const target = window.location.pathname + window.location.search
  window.history.replaceState(null, '', '/#' + target)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
