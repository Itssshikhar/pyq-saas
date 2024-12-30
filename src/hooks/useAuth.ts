'use client'

import { useState, useEffect } from 'react'
import { User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      if (user) {
        Cookies.set('session', 'true', { expires: 7 }) // Set a session cookie
        router.push('/main')
      } else {
        Cookies.remove('session') // Remove the session cookie on logout
        router.push('/')
      }
    })

    return () => unsubscribe()
  }, [router])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Error signing in with Google', error)
    }
  }

  const signOutUser = async () => {
    try {
      await signOut(auth)
      Cookies.remove('session') // Remove the session cookie
      router.push('/')
    } catch (error) {
      console.error('Error signing out', error)
    }
  }

  return { user, signInWithGoogle, signOutUser }
}
