import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.jsx'
import HiddenAllPhotos from './components/HiddenAllPhotos.jsx'

const isHiddenPage = window.location.hash === '#all-photos-hidden';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isHiddenPage ? <HiddenAllPhotos /> : <App />}
  </StrictMode>,
)
