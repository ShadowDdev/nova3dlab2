import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  getEffectiveTheme: () => 'light' | 'dark'
  syncWithSystem: () => void
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark'
}

const applyTheme = (theme: Theme) => {
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(effectiveTheme)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      toggleTheme: () => {
        const { theme, setTheme } = get()
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
      },

      getEffectiveTheme: () => {
        const { theme } = get()
        return theme === 'system' ? getSystemTheme() : theme
      },

      syncWithSystem: () => {
        const { theme } = get()
        applyTheme(theme)
      },
    }),
    {
      name: 'nova3dlab-theme',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
      },
    }
  )
)

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useThemeStore.getState()
    if (theme === 'system') {
      applyTheme('system')
    }
  })
}
