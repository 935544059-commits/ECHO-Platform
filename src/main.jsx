import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary'

console.log('[Main] 应用初始化开始...')
console.log('[Main] 当前环境:', import.meta.env.MODE)
console.log('[Main] API 地址:', import.meta.env.VITE_API_URL)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

console.log('[Main] 应用初始化完成')
