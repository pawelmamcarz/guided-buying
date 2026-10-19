import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { ProcurementProvider } from './context/ProcurementContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProcurementProvider>
      <CartProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </CartProvider>
    </ProcurementProvider>
  </StrictMode>,
)
