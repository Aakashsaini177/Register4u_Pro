import { create } from 'zustand'

const PORTAL_TOKEN_KEY = 'portal_token'
const PORTAL_USER_KEY = 'portal_user'

export const usePortalAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem(PORTAL_TOKEN_KEY),
  user: localStorage.getItem(PORTAL_USER_KEY)
    ? JSON.parse(localStorage.getItem(PORTAL_USER_KEY))
    : null,
  token: localStorage.getItem(PORTAL_TOKEN_KEY),
  login: (user, token) => {
    localStorage.setItem(PORTAL_TOKEN_KEY, token)
    localStorage.setItem(PORTAL_USER_KEY, JSON.stringify(user))
    set({
      isAuthenticated: true,
      user,
      token,
    })
  },
  logout: () => {
    localStorage.removeItem(PORTAL_TOKEN_KEY)
    localStorage.removeItem(PORTAL_USER_KEY)
    set({
      isAuthenticated: false,
      user: null,
      token: null,
    })
  },
  setUser: (user) => {
    localStorage.setItem(PORTAL_USER_KEY, JSON.stringify(user))
    set({ user })
  },
}))


