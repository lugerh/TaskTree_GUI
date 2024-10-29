// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

// Configura aquí tu cliente Supabase.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const useAuth = () => {
  const [session, setSession] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Verificar la sesión al cargar la aplicación
    checkSession()

    // Escuchar los cambios en el estado de autenticación
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        if (event === 'SIGNED_IN' && session) {
          logLogin(session.user.id, 'login') // Registrar el inicio de sesión solo cuando se firme la sesión
        } else if (event === 'SIGNED_OUT' && session) {
          logLogin(session.user.id, 'logout') // Registrar el cierre de sesión
        }
      }
    )

    // Limpiar suscripción cuando el componente se desmonte
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Revisa la sesión actual y la establece si existe
  const checkSession = (() => {
    let hasCheckedSession = false
    return async () => {
      if (hasCheckedSession) return
      hasCheckedSession = true
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        setError(error)
      }
      setSession(session)
      if (session) {
        logLogin(session.user.id, 'login') // Registrar el inicio de sesión
      }
    }
  })()

  // Registrar la fecha y hora del inicio o cierre de sesión
  const logLogin = async (userId, action) => {
    if (!userId) return
    const { error } = await supabase
      .from('login_records')
      .insert([{ user_id: userId, action }])
    if (error) {
      console.error(`Error logging ${action}:`, error.message)
    }
  }

  // Iniciar sesión con Google
  const login = useCallback(async () => {
    console.log('Iniciando sesión con Google...')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) {
      setError(error)
      console.error('Error al iniciar sesión:', error.message)
    }
  }, [])

  // Cerrar sesión
  const logout = useCallback(async () => {
    console.log('Cerrando sesión...')
    if (session && session.user) {
      logLogin(session.user.id, 'logout') // Registrar el cierre de sesión antes de cerrar sesión
    }
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(error)
      console.error('Error al cerrar sesión:', error.message)
    } else {
      setSession(null)
      console.log('Sesión cerrada correctamente.')
    }
  }, [session])

  return {
    session,
    error,
    login,
    logout,
  }
}

export default useAuth
