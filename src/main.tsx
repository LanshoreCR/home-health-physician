import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/styles.css'
import './styles/base.css'
import { App } from './App.tsx'
import { loadCatalogs } from './store/catalogs.ts'

// Punto de enganche de Okta. Cuando exista el cliente, esta única línea hace que
// todos los endpoints manden Bearer token — ningún módulo de src/api/ cambia:
//
//   configureAuth(
//     () => oktaAuth.getAccessToken() ?? null,
//     () => oktaAuth.signInWithRedirect(),
//   )
//
// Recomendado: tokenManager con storage 'memory' + getWithoutPrompt() al montar,
// para que el access token nunca toque localStorage.

loadCatalogs()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
