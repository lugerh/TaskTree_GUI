// src/App.js
import React from 'react'
import useAuth from './hooks/useAuth'

function App() {
  const { session, login, logout, error } = useAuth()

  return (
    <>
      <h1>{session ? 'Close Session?' : 'Login with Google'}</h1>
      {session ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={login}>Login with Google</button>
      )}
      {error && <p>Error: {error.message}</p>}
      {session && <p>Welcome, {session.user.email}</p>}
    </>
  )
}

export default App
