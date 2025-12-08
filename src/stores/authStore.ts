import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types'
import { 
  supabase, 
  signUp as supabaseSignUp, 
  signIn as supabaseSignIn, 
  signOut as supabaseSignOut, 
  signInWithGoogle as supabaseSignInWithGoogle, 
  signInWithGithub as supabaseSignInWithGithub, 
  signInWithMagicLink as supabaseSignInWithMagicLink,
  getProfile 
} from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isLoggedIn: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (isLoading: boolean) => void
  
  // Auth methods
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
  logout: () => Promise<void>
  
  // Init
  initialize: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      isLoggedIn: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoggedIn: !!user 
      }),
      
      setSession: (session) => set({ session }),
      
      setProfile: (profile) => set({ profile }),
      
      setLoading: (isLoading) => set({ isLoading }),

      signUp: async (email, password, fullName) => {
        const { data, error } = await supabaseSignUp(email, password, fullName)
        if (error) throw error
        // User needs to verify email before logging in
      },

      signIn: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabaseSignIn(email, password)
          if (error) throw error
          
          if (data.user) {
            set({ 
              user: data.user, 
              session: data.session,
              isAuthenticated: true,
              isLoggedIn: true 
            })
            await get().fetchProfile(data.user.id)
          }
        } finally {
          set({ isLoading: false })
        }
      },

      signInWithMagicLink: async (email) => {
        const { error } = await supabaseSignInWithMagicLink(email)
        if (error) throw error
      },

      signInWithGoogle: async () => {
        const { error } = await supabaseSignInWithGoogle()
        if (error) throw error
        // Redirect handled by Supabase
      },

      signInWithGithub: async () => {
        const { error } = await supabaseSignInWithGithub()
        if (error) throw error
        // Redirect handled by Supabase
      },

      signOut: async () => {
        await supabaseSignOut()
        set({ 
          user: null, 
          session: null,
          profile: null, 
          isAuthenticated: false,
          isLoggedIn: false 
        })
      },

      logout: async () => {
        await supabaseSignOut()
        set({ 
          user: null, 
          session: null,
          profile: null, 
          isAuthenticated: false,
          isLoggedIn: false 
        })
      },

      fetchProfile: async (userId) => {
        const { data, error } = await getProfile(userId)
        if (!error && data) {
          set({ 
            profile: {
              id: data.id,
              email: get().user?.email || '',
              full_name: data.full_name,
              avatar_url: data.avatar_url,
              phone: data.phone,
              role: data.role || 'customer',
              preferences: data.preferences || {
                theme: 'system',
                notifications: true,
                newsletter: false,
              },
              created_at: data.created_at,
              updated_at: data.updated_at,
            }
          })
        }
      },

      initialize: async () => {
        set({ isLoading: true })
        try {
          // Get current session
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            set({ 
              user: session.user, 
              session,
              isAuthenticated: true,
              isLoggedIn: true 
            })
            await get().fetchProfile(session.user.id)
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              set({ 
                user: session.user, 
                session,
                isAuthenticated: true,
                isLoggedIn: true 
              })
              await get().fetchProfile(session.user.id)
            } else if (event === 'SIGNED_OUT') {
              set({ 
                user: null, 
                session: null,
                profile: null, 
                isAuthenticated: false,
                isLoggedIn: false 
              })
            } else if (event === 'TOKEN_REFRESHED' && session) {
              set({ session })
            }
          })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'printforge-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
