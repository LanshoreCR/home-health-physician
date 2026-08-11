import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/styles.css'
import './styles/base.css'
import { App } from './App.tsx'
import { AuthGate } from './auth/AuthGate.tsx'
import { ensureSession, oktaAuth } from './auth/okta.ts'
import { configureAuth } from './api/client.ts'
import { loadCatalogs } from './store/catalogs.ts'

configureAuth(
  () => oktaAuth.getAccessToken() ?? null,
  () => {
    void oktaAuth.signInWithRedirect()
  },
)

/** Después de la sesión, no antes: sin token estas dos requests salen en 401. */
void ensureSession().then(loadCatalogs)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate>
      <App />
    </AuthGate>
  </StrictMode>,
)
