'use client'
import '@/lib/auth.bootstrap'
import { authReady } from '@/lib/auth.bootstrap'
import { use } from 'react'
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  use(authReady)
  return <>{children}</>
}