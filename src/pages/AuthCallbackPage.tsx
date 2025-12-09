import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setUser, setSession, fetchProfile } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash (Supabase puts auth tokens there)
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage(error.message || 'Authentication failed')
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        if (data.session) {
          // Successfully authenticated
          setUser(data.session.user)
          setSession(data.session)
          
          // Fetch user profile
          if (data.session.user.id) {
            await fetchProfile(data.session.user.id)
          }

          setStatus('success')
          setMessage('Email verified! Redirecting to your account...')
          
          // Redirect to account page after a brief moment
          setTimeout(() => navigate('/account'), 1500)
        } else {
          // No session found, might be an invalid or expired link
          setStatus('error')
          setMessage('Invalid or expired verification link')
          setTimeout(() => navigate('/login'), 3000)
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    handleAuthCallback()
  }, [navigate, setUser, setSession, fetchProfile])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-lg text-muted-foreground">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-lg text-green-500">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-lg text-destructive">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  )
}
