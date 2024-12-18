'use client'

import { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function AuthProvider({ children }: { children: ReactNode }) {
  useAuth() // This will initialize the auth listener
  return <>{children}</>
}

