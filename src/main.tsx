import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/styles.css'
import './styles/base.css'
import { App } from './App.tsx'
import { AuthGate } from './auth/AuthGate.tsx'
import { oktaAuth } from './auth/okta.ts'
import { configureAuth } from './api/client.ts'

configureAuth(
  () => oktaAuth.getAccessToken() ?? null,
  () => {
    void oktaAuth.signInWithRedirect()
  },
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate>
      <App />
    </AuthGate>
  </StrictMode>,
)
