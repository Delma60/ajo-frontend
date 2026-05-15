'use client'
import '@/lib/auth.bootstrap'
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}