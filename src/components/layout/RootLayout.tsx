import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { CartPanel } from './CartPanel'
import { Toaster } from 'sonner'

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartPanel />
      <Toaster position="bottom-right" richColors />
    </div>
  )
}
