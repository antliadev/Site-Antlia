import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const app = (
  <StrictMode>
    <App initialPath={location.pathname} />
  </StrictMode>
)
const root = document.getElementById('root')!
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
